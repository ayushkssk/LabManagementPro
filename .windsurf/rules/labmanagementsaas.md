---
trigger: always_on
---

# =======================================================
# ⚡ Lab Management Software - Windsurf Project Rules
# Ensures strict standards, consistency & SaaS-level quality
# =======================================================

rules:

  # -----------------------------------------------------
  # 1. Tech Stack & Structure
  # -----------------------------------------------------
  - Use Next.js (React + TypeScript) with TailwindCSS.
  - Use Firebase (Auth, Firestore, Storage) as backend.
  - Keep strict folder structure:
      /pages       → Routes (Patient, Reports, Dashboard)
      /components  → Reusable UI components (forms, tables, modals)
      /features    → Business modules (Patient Mgmt, Reports Mgmt, Hospital Mgmt)
      /layouts     → Shared layouts (SuperAdmin, HospitalAdmin, Technician)
      /utils       → Helpers, formatters, API wrappers
  - No inline CSS, only Tailwind utility classes.

  # -----------------------------------------------------
  # 2. User Roles & Access
  # -----------------------------------------------------
  - Super Admin → Full access to all hospitals + data.
  - Hospital Admin → Access limited to their own hospital.
  - Technician/User → Can only manage patients/tests assigned in their hospital.
  - Data separation: each hospital’s data must remain fully isolated.
  - Super Admin can view cross-hospital data, but hospitals can’t see each other.

  # -----------------------------------------------------
  # 3. Data Handling & Safety
  # -----------------------------------------------------
  - Never hard delete data → Always use soft delete (isDeleted: true).
  - Maintain audit logs for patient updates, tests, reports.
  - Prevent duplicate entries (patients/tests).
  - Always validate input before saving to Firestore.
  - All exports (Excel/PDF) must group test parameters row-wise under category.

  # -----------------------------------------------------
  # 4. UI/UX Standards
  # -----------------------------------------------------
  - All pages must be mobile responsive.
  - Dashboard should have smooth, polished, professional look.
  - Use Side Drawer navigation for mobile.
  - Always provide loading states, empty states, and error states.
  - Reports/Print pages must be compact → fit on 1 page wherever possible.
  - Consistent branding: add "Developed by IT4B.in" in footer (SaaS style).

  # -----------------------------------------------------
  # 5. Performance & Code Quality
  # -----------------------------------------------------
  - Components must be reusable (e.g., Table, Modal, FormInput).
  - Always optimize queries (use Firestore indexes where needed).
  - Use Suspense/loading spinners for async data.
  - Code must follow DRY principle (Don’t Repeat Yourself).
  - Keep constants (units, test names, ref ranges) in separate database/master file.
  - Unit dropdown must always fetch from master list, not hardcoded.

  # -----------------------------------------------------
  # 6. Exporting & Reports
  # -----------------------------------------------------
  - Exports must support Excel & PDF.
  - Format → Category row → Parameters in rows below.
  - Ensure multilingual support (English/Hindi ready).
  - Hospital Admin should be able to erase their own patient records (time-based cleanup option).

  # -----------------------------------------------------
  # 7. Global Behaviors
  # -----------------------------------------------------
  - Cascade must always assume this is a real SaaS product, not a demo.
  - Output should always be production-ready, scalable, and easy to maintain.
  - Always polish UI and align design to modern SaaS standards.
  - Never skip validation, responsive design, or role-based access control.

# =======================================================
# ✅ End of Project Rules
# =======================================================