import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { randomUUID } from "node:crypto";
// Initialize Admin SDK once (ESM-compatible)
if (!getApps().length) {
    initializeApp();
}
const db = getFirestore();
// Helper: fetch report by reportId from collection group 'reports'
async function fetchReport(reportId) {
    const snap = await db.collectionGroup("reports").where("id", "==", reportId).limit(1).get();
    if (snap.empty)
        return null;
    const doc = snap.docs[0];
    return { id: doc.id, ref: doc.ref, ...doc.data() };
}
// Helper: ensure a stable token and qrId exist on the report document
async function ensureStableAuth(reportDoc) {
    const updates = {};
    if (!reportDoc.token) {
        updates.token = randomUUID();
    }
    if (!reportDoc.qrId) {
        // Stable id for QR deep link; separate from readable report id
        updates.qrId = randomUUID();
    }
    if (Object.keys(updates).length) {
        await reportDoc.ref.update(updates);
        return { ...reportDoc, ...updates };
    }
    return reportDoc;
}
// Helper: basic PDF generation using pdf-lib
async function generatePdf(report, verifyUrl) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 in points
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    let y = height - 50;
    page.drawText("Lab Report", {
        x: 50,
        y,
        size: 18,
        font: fontBold,
        color: rgb(0.1, 0.3, 0.8),
    });
    y -= 30;
    const leftX = 50;
    const rightX = width / 2 + 10;
    const drawLabelValue = (label, value, x) => {
        page.drawText(label, { x, y, size: 11, font: fontBold, color: rgb(0, 0, 0) });
        page.drawText(value || "-", { x: x + 90, y, size: 11, font, color: rgb(0, 0, 0) });
    };
    drawLabelValue("Name:", report.patientName || "", leftX);
    drawLabelValue("Age:", (report.patientAge || "") + " Years", leftX);
    drawLabelValue("Referred By:", report.referredBy || "Dr. SWATI HOSPITAL", leftX);
    drawLabelValue("Sex:", report.patientGender || "", rightX);
    const toGb = (d) => {
        try {
            const jsDate = typeof d?.toDate === 'function' ? d.toDate() : (d instanceof Date ? d : null);
            return jsDate ? jsDate.toLocaleString("en-GB", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : "";
        }
        catch {
            return "";
        }
    };
    drawLabelValue("Received On:", toGb(report.collectedAt), rightX);
    drawLabelValue("Reported On:", toGb(report.reportedAt), rightX);
    y -= 60;
    page.drawText(report.testName?.toUpperCase?.() || "LABORATORY TEST", { x: leftX, y, size: 13, font: fontBold });
    y -= 20;
    // Table header
    const headers = ["Investigation", "Result", "Units", "Ref. Range"];
    const colXs = [leftX, leftX + 220, leftX + 340, leftX + 420];
    headers.forEach((h, i) => page.drawText(h, { x: colXs[i], y, size: 11, font: fontBold }));
    y -= 14;
    const params = Array.isArray(report.parameters) ? report.parameters : [];
    params.forEach(param => {
        if (y < 80) { // new page when space is low
            y = height - 80;
        }
        page.drawText(param.label || "", { x: colXs[0], y, size: 10, font });
        page.drawText((param.value ?? "").toString(), { x: colXs[1], y, size: 10, font });
        page.drawText(param.unit || "-", { x: colXs[2], y, size: 10, font });
        page.drawText(param.refRange || "-", { x: colXs[3], y, size: 10, font });
        y -= 12;
    });
    // QR code box area in the bottom-right
    try {
        const qrPng = await QRCode.toBuffer(verifyUrl, { width: 220, margin: 1 });
        const qrImage = await pdfDoc.embedPng(qrPng);
        const qrW = 120;
        const qrH = (qrImage.height / qrImage.width) * qrW;
        const qrX = width - qrW - 50;
        const qrY = 100;
        page.drawImage(qrImage, { x: qrX, y: qrY, width: qrW, height: qrH });
        // Caption and verification badge next to QR
        page.drawText("Scan to verify report", { x: qrX - 10, y: qrY + qrH + 8, size: 10, font });
        page.drawText("Verified with Swati Diagnostics", { x: qrX - 30, y: qrY - 14, size: 11, font: fontBold, color: rgb(0.1, 0.5, 0.1) });
    }
    catch (e) {
        logger.warn("QR generation failed", e);
    }
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
}
export const report = onRequest({ cors: true, region: "asia-south1" }, async (req, res) => {
    try {
        // URL patterns supported:
        // - /api/report/<reportId>?token=...
        // - /api/report/verify/<qrId>?token=...  (shows popup then redirects to PDF)
        const url = new URL(req.url, `https://${req.headers.host}`);
        const pathParts = url.pathname.split("/").filter(Boolean); // [maybe "api", "report", "<id>" or "verify", "<qrId>"]
        const reportIdx = pathParts.indexOf("report");
        const afterReport = reportIdx >= 0 ? pathParts.slice(reportIdx + 1) : [];
        const isVerify = afterReport[0] === "verify";
        const reportId = !isVerify ? afterReport[0] : undefined;
        const qrId = isVerify ? afterReport[1] : undefined;
        const token = (url.searchParams.get("token") || req.query?.token);
        // Compute base prefix before 'report' for stable URL construction
        const prefix = reportIdx > 0 ? pathParts.slice(0, reportIdx).join("/") : "";
        const basePath = prefix ? `/${prefix}/report` : `/report`;
        const protoHost = `${url.protocol}//${url.host}`;
        // Handle verification landing: /.../report/verify/<qrId>
        if (isVerify) {
            if (!qrId) {
                res.status(400).send("Missing qrId");
                return;
            }
            const snap = await db.collectionGroup("reports").where("qrId", "==", qrId).limit(1).get();
            if (snap.empty) {
                res.status(404).send("QR not found");
                return;
            }
            const doc = snap.docs[0];
            const data = doc.data();
            // Optional token check: if token stored, require match; otherwise allow
            if (data.token) {
                if (!token || token !== data.token) {
                    res.status(403).send("Invalid or missing token");
                    return;
                }
            }
            const pdfUrl = `${protoHost}${basePath}/${data.id}?token=${encodeURIComponent(data.token || "")}`;
            // Simple HTML with popup and redirect
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.status(200).send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Swati Diagnostics Verification</title>
  <style>
    body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; margin: 0; padding: 0; background: #f7fafc; color: #1a202c; }
    .container { max-width: 520px; margin: 10vh auto; background: #fff; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); padding: 28px; text-align: center; }
    .badge { display: inline-block; padding: 8px 14px; border-radius: 999px; background: #16a34a; color: #fff; font-weight: 600; margin-bottom: 12px; }
    .cta { margin-top: 18px; display: inline-block; padding: 10px 16px; background: #2563eb; color: #fff; border-radius: 8px; text-decoration: none; }
  </style>
  <script>
    window.addEventListener('DOMContentLoaded', () => {
      alert('Verified with Swati Diagnostics');
      setTimeout(() => { window.location.replace(${JSON.stringify(pdfUrl)}); }, 400);
    });
  </script>
</head>
<body>
  <div class="container">
    <div class="badge">Verified with Swati Diagnostics</div>
    <h2>Verification Successful</h2>
    <p>Redirecting to your report...</p>
    <a class="cta" href="${pdfUrl}">Open Report</a>
  </div>
</body>
</html>`);
            return;
        }
        if (!reportId) {
            res.status(400).send("Missing reportId");
            return;
        }
        const reportDoc = await fetchReport(reportId);
        if (!reportDoc) {
            res.status(404).send("Report not found");
            return;
        }
        // Optional token validation: if a token exists on the doc, require it to match
        if (reportDoc.token) {
            if (!token || token !== reportDoc.token) {
                res.status(403).send("Invalid or missing token");
                return;
            }
        }
        // Ensure permanent token and qrId exist
        const ensured = await ensureStableAuth(reportDoc);
        // Build verify URL that will show popup and redirect
        const verifyUrl = `${protoHost}${basePath}/verify/${ensured.qrId}?token=${encodeURIComponent(ensured.token || "")}`;
        // Generate PDF
        const pdfBuffer = await generatePdf(ensured, verifyUrl);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename=report-${reportId}.pdf`);
        res.status(200).send(pdfBuffer);
    }
    catch (err) {
        logger.error("Error generating report PDF", err);
        res.status(500).send("Internal Server Error");
    }
});
