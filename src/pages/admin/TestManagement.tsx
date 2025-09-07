import React, { useCallback, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Plus, Upload, Download, Pencil, Loader2 } from "lucide-react";
import type { Test as TestType, TestField } from "@/types";
import { addTest, deleteTest, getTests, updateTest, assignTestCodes, type TestData } from "@/services/testService";

const useXLSX = () => {
  const [xlsx, setXLSX] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadXLSX = useCallback(async () => {
    if (xlsx) return xlsx;
    if (isLoading) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Using dynamic import to load xlsx
      const xlsxModule = await import('xlsx');
      const xlsxLib = xlsxModule.default || xlsxModule;
      setXLSX(xlsxLib);
      return xlsxLib;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load xlsx');
      setError(error);
      toast.error("'xlsx' package not installed. Please install it to use import/export.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [xlsx, isLoading]);

  return {
    xlsx,
    isLoading,
    error,
    loadXLSX
  };
};

const emptyField = (): TestField => ({ id: crypto.randomUUID(), name: "", type: "number", unit: "", normalRange: "" });

const emptyTest = (): Omit<TestType, "id"> => ({ name: "", category: "", price: 0, description: "", fields: [emptyField()] });

const TestManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { loadXLSX } = useXLSX();
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<{ id?: string; data: Omit<TestType, "id"> } | null>(null);

  type LoadedTest = TestData & { id: string; code?: string; };
  const { data: tests = [], isLoading } = useQuery<LoadedTest[]>({ queryKey: ["tests"], queryFn: getTests as any });

  const getErrorMessage = (e: unknown) => {
    if (e && typeof e === "object" && 'message' in e) return String((e as any).message);
    try { return JSON.stringify(e); } catch { return String(e); }
  };

  // Remove undefined keys from nested field objects to satisfy Firestore
  const cleanTestPayload = (p: Omit<TestData, "id">): Omit<TestData, "id"> => {
    return {
      name: p.name,
      category: p.category,
      price: p.price,
      description: p.description ?? "",
      fields: p.fields.map((f) => {
        const o: any = { id: f.id, name: f.name, type: f.type };
        if (f.unit && f.unit.trim() !== "") o.unit = f.unit.trim();
        if (f.normalRange && f.normalRange.trim() !== "") o.normalRange = f.normalRange.trim();
        return o as TestField;
      })
    };
  };

  const addMut = useMutation({
    mutationFn: (payload: Omit<TestData, "id">) => addTest(payload),
    onSuccess: () => {
      toast.success("Test added");
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    }
  });
  const updMut = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<TestData> }) => updateTest(id, patch),
    onSuccess: () => {
      toast.success("Test updated");
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    }
  });
  const delMut = useMutation({
    mutationFn: (id: string) => deleteTest(id),
    onSuccess: () => {
      toast.success("Test deleted");
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    }
  });

  const assignCodesMut = useMutation({
    mutationFn: assignTestCodes,
    onSuccess: (count) => {
      toast.success(`Successfully assigned codes to ${count} tests`);
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
    onError: (error) => {
      console.error('Error assigning test codes:', error);
      toast.error('Failed to assign test codes. Please try again.');
    }
  });

  const openAdd = () => {
    setEditing({ data: emptyTest() });
    setDialogOpen(true);
  };
  const openEdit = (t: LoadedTest) => {
    const copy: Omit<TestType, "id"> = {
      name: t.name,
      category: t.category,
      price: t.price,
      description: t.description ?? "",
      fields: (t.fields ?? []).map((f) => ({ ...f, type: (f.type as TestField["type"]) })) as TestField[]
    };
    setEditing({ id: t.id, data: copy });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!editing) return;
    const raw: Omit<TestData, "id"> = {
      name: editing.data.name.trim(),
      category: editing.data.category.trim(),
      price: Number(editing.data.price) || 0,
      description: editing.data.description?.trim() || "",
      fields: editing.data.fields.map((f) => ({
        id: f.id,
        name: f.name.trim(),
        type: f.type,
        unit: f.unit?.trim() || "",
        normalRange: f.normalRange?.trim() || "",
      }))
    };

    if (!raw.name) return toast.error("Test name is required");
    if (!raw.category) return toast.error("Category is required");
    if (!raw.fields.length) return toast.error("At least one parameter/field is required");
    if (raw.fields.some((f) => !f.name)) return toast.error("All parameters must have a name");

    const payload = cleanTestPayload(raw);

    try {
      if (editing.id) {
        await updMut.mutateAsync({ id: editing.id, patch: payload });
      } else {
        await addMut.mutateAsync(payload);
      }
      setDialogOpen(false);
      setEditing(null);
    } catch (e) {
      console.error(e);
      toast.error(`Failed to save test. ${getErrorMessage(e)}`);
    }
  };

  const exportExcel = async () => {
    try {
      const XLSX = await loadXLSX();
      if (!XLSX) return;
      
      const rows = tests.map((t) => ({
        Name: t.name,
        Category: t.category,
        Price: t.price,
        Fields: t.fields?.map((f) => `${f.name} (${f.unit || ""})`).join(", "),
        "Normal Ranges": t.fields?.map((f) => f.normalRange || "").join(", "),
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Tests");
      XLSX.writeFile(wb, "tests_export.xlsx");
      toast.success("Exported current tests");
    } catch (e) {
      console.error("Export failed:", e);
      // Error is already shown by the hook
    }
  };

  const downloadSample = async () => {
    try {
      const XLSX = await loadXLSX();
      if (!XLSX) return;
      
      const sample = [
        {
          Name: "Complete Blood Count (CBC)",
          Category: "Hematology",
          Price: 300,
          Description: "",
          Fields:
            "Hemoglobin|number|g/dL|12-16; WBC Count|number|cells/μL|4000-11000; Platelet Count|number|lakhs/μL|1.5-4.5"
        }
      ];
      const ws = XLSX.utils.json_to_sheet(sample);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sample");
      XLSX.writeFile(wb, "tests_sample.xlsx");
      toast.success("Sample Excel downloaded");
    } catch (e) {
      // handled in ensureXLSX
    }
  };

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const XLSX = await loadXLSX();
      if (!XLSX) return;
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const wsName = wb.SheetNames[0];
      const ws = wb.Sheets[wsName];
      const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

      // Expect columns: Name, Category, Price, Description, Fields
      let count = 0;
      for (const r of rows) {
        const name = String(r.Name || "").trim();
        const category = String(r.Category || "").trim();
        const price = Number(r.Price || 0);
        const description = String(r.Description || "").trim();
        const fieldsRaw = String(r.Fields || "");
        if (!name || !category) continue;

        const fields: TestField[] = [];
        if (fieldsRaw) {
          // each field like: name|type|unit|normalRange separated by ;
          const parts = fieldsRaw.split(/;\s*/).filter(Boolean);
          for (const p of parts) {
            const [fname = "", ftype = "number", funit = "", frange = ""] = p.split("|");
            if (!fname) continue;
            const type = (ftype === "text" || ftype === "select" || ftype === "number") ? ftype : "number";
            const unit = funit?.trim() || "";
            const normalRange = frange?.trim() || "";
            fields.push({ id: crypto.randomUUID(), name: fname.trim(), type, unit, normalRange });
          }
        }
        const rawPayload: Omit<TestData, "id"> = { name, category, price, description, fields };
        await addMut.mutateAsync(cleanTestPayload(rawPayload));
        count++;
      }
      toast.success(`${count} tests imported`);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      toast.error("Failed to import. Ensure Excel format matches the sample.");
    }
  };

  const totalPrice = useMemo(() => tests.reduce((sum, t) => sum + (Number(t.price) || 0), 0), [tests]);

  const filteredTests = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tests;
    return tests.filter((t) => {
      const inName = t.name?.toLowerCase().includes(q);
      const inCat = t.category?.toLowerCase().includes(q);
      const inFields = (t.fields ?? []).some((f) => f.name?.toLowerCase().includes(q));
      return inName || inCat || inFields;
    });
  }, [tests, search]);

  const getLftTemplateFields = (): TestField[] => {
    const f = (name: string, unit?: string, normal?: string): TestField => ({ id: crypto.randomUUID(), name, type: "number", unit, normalRange: normal });
    const t = (name: string, normal?: string): TestField => ({ id: crypto.randomUUID(), name, type: "text", normalRange: normal });
    return [
      f('Total Bilirubin', 'mg/dL', '0.2-1.2'),
      f('Direct Bilirubin', 'mg/dL', '0.0-0.3'),
      f('Indirect Bilirubin', 'mg/dL', '0.2-1.0'),
      f('SGOT (AST)', 'U/L', '10-40'),
      f('SGPT (ALT)', 'U/L', '7-56'),
      f('Alkaline Phosphatase', 'U/L', '44-147'),
      f('Total Protein', 'g/dL', '6.0-8.3'),
      f('Albumin', 'g/dL', '3.5-5.0'),
      f('Globulin', 'g/dL', '2.5-3.5'),
      f('A/G Ratio', '', '1.0-2.3'),
      f('GGT', 'U/L', '9-48')
    ];
  };

  const getCbcTemplateFields = (): TestField[] => {
    const f = (name: string, unit?: string, normal?: string): TestField => ({ id: crypto.randomUUID(), name, type: "number", unit, normalRange: normal });
    const t = (name: string, normal?: string): TestField => ({ id: crypto.randomUUID(), name, type: "text", normalRange: normal });
    return [
      f("Hemoglobin (Hb)", "g/dL", "M: 13.0-18.0 | F: 11.0-16.0"),
      f("Hematocrit (PCV)", "%", "36.0-50.0"),
      f("RBC Count", "million/μL", "3.50-5.50"),
      f("WBC Count", "cells/μL", "4000-11000"),
      f("Platelet Count", "/μL", "150000-400000"),
      f("MCV", "fL", "80.0-100.0"),
      f("MCH", "pg", "25.0-35.0"),
      f("MCHC", "g/dL", "31.0-38.0"),
      f("RDW-CV", "%", "11.6-16.0"),
      f("RDW-SD", "fL", "30.0-150.0"),
      f("MPV", "fL", "8.0-11.0"),
      f("PDW", "fL", "9.0-17.0"),
      f("PCT", "%", "0.1-0.5"),
      f("PLCR (Platelet Large Cell Ratio)", "%", "15.0-45.0"),
      f("Neutrophils", "%", "40-70"),
      f("Lymphocytes", "%", "20-45"),
      f("Monocytes", "%", "2-10"),
      f("Eosinophils", "%", "1-6"),
      f("Basophils", "%", "0-2"),
      f("Absolute Neutrophil Count", "cells/μL", "2000-7500"),
      f("Absolute Lymphocyte Count", "cells/μL", "1000-4000"),
      t("RBC Morphology", "Normocytic Normochromic"),
      t("WBC Differential", "Normal"),
      t("Platelet Morphology", "Normal")
    ];
  };

  const suggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [] as { label: string; type: "name" | "category" | "field" }[];
    const nameMatches = tests
      .map((t) => t.name)
      .filter(Boolean)
      .filter((n, i, arr) => arr.indexOf(n) === i)
      .filter((n) => n!.toLowerCase().includes(q))
      .slice(0, 5)
      .map((n) => ({ label: n as string, type: "name" as const }));
    const catMatches = tests
      .map((t) => t.category)
      .filter(Boolean)
      .filter((c, i, arr) => arr.indexOf(c) === i)
      .filter((c) => c!.toLowerCase().includes(q))
      .slice(0, 5)
      .map((c) => ({ label: c as string, type: "category" as const }));
    const fieldMatches = Array.from(new Set(
      tests.flatMap((t) => (t.fields ?? []).map((f) => f.name)).filter(Boolean)
    ))
      .filter((f) => f!.toLowerCase().includes(q))
      .slice(0, 5)
      .map((f) => ({ label: f as string, type: "field" as const }));
    return [...nameMatches, ...catMatches, ...fieldMatches].slice(0, 8);
  }, [tests, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold whitespace-nowrap">Test Management</h1>
        <div className="flex-1 max-w-xl">
          <Popover open={searchOpen && suggestions.length > 0} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <div className="relative">
                <Input
                  placeholder="Search by name, category, or parameter..."
                  value={search}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSearch(v);
                    setSearchOpen(!!v);
                  }}
                  onFocus={() => search && setSearchOpen(true)}
                  onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="p-0 w-[var(--radix-popover-trigger-width)]"
              onOpenAutoFocus={(e) => e.preventDefault()}
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <div className="py-1">
                {suggestions.map((s, idx) => (
                  <button
                    key={s.type + s.label + idx}
                    className="w-full text-left px-3 py-2 hover:bg-muted text-sm flex items-center gap-2"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setSearch(s.label);
                      setSearchOpen(false);
                    }}
                  >
                    <span className="text-muted-foreground capitalize text-xs">{s.type}</span>
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex gap-2 whitespace-nowrap">
          <Button variant="outline" onClick={downloadSample}>
            <Download className="w-4 h-4 mr-2" /> Sample Excel
          </Button>
          <Button variant="outline" onClick={exportExcel}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button 
            variant="outline" 
            onClick={() => assignCodesMut.mutate()} 
            disabled={assignCodesMut.isPending || tests.length === 0}
          >
            {assignCodesMut.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Assign Test Codes
              </>
            )}
          </Button>
          <Button onClick={openAdd}>
            <Plus className="w-4 h-4 mr-2" /> Add Test
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Tests</span>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>Total: {tests.length}</span>
              <Separator orientation="vertical" className="h-4" />
              <div>
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={onFileChange} />
                <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" /> Import Excel
                </Button>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Loading tests...</div>
          ) : filteredTests.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">No tests found. Add or import to get started.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Code</th>
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium">Category</th>
                    <th className="text-left p-3 font-medium">Price</th>
                    <th className="text-left p-3 font-medium">Parameters</th>
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTests.map((t) => (
                    <tr key={t.id} className="border-b last:border-b-0">
                      <td className="p-3 font-mono text-sm">
                        {t.code || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-3">{t.name}</td>
                      <td className="p-3">{t.category}</td>
                      <td className="p-3">₹{t.price}</td>
                      <td className="p-3 max-w-xl">
                        <div className="flex flex-wrap gap-1">
                          {(t.fields ?? []).map((f) => (
                            <span key={f.id} className="px-2 py-0.5 rounded bg-muted text-xs">
                              {f.name}{f.unit ? ` (${f.unit})` : ""}{f.normalRange ? ` | ${f.normalRange}` : ""}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(t)}>
                            <Pencil className="w-4 h-4 mr-1" /> Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => delMut.mutate(t.id!)}>
                            <Trash2 className="w-4 h-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl w-full p-0">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle className="text-xl">{editing?.id ? "Edit Test" : "Add Test"}</DialogTitle>
          </DialogHeader>
          <div className="p-6 overflow-y-auto max-h-[70vh]">
            {editing && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input value={editing.data.name} onChange={(e) => setEditing((p) => p && ({ ...p, data: { ...p.data, name: e.target.value } }))} />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Input value={editing.data.category} onChange={(e) => setEditing((p) => p && ({ ...p, data: { ...p.data, category: e.target.value } }))} />
                  </div>
                  <div>
                    <Label>Price</Label>
                    <Input type="number" value={editing.data.price} onChange={(e) => setEditing((p) => p && ({ ...p, data: { ...p.data, price: Number(e.target.value) } }))} />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input value={editing.data.description} onChange={(e) => setEditing((p) => p && ({ ...p, data: { ...p.data, description: e.target.value } }))} />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Reference Parameters</h4>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditing((p) => {
                          if (!p) return p;
                          const next = { ...p };
                          const template = getCbcTemplateFields();
                          next.data = {
                            ...next.data,
                            name: next.data.name || "Complete Blood Count (CBC)",
                            category: next.data.category || "Hematology",
                            fields: template
                          };
                          return next;
                        })}
                      >
                        Load CBC Template
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditing((p) => {
                          if (!p) return p;
                          const next = { ...p };
                          const template = getLftTemplateFields();
                          next.data = {
                            ...next.data,
                            name: next.data.name || "Liver Function Test (LFT)",
                            category: next.data.category || "Biochemistry",
                            fields: template
                          };
                          return next;
                        })}
                      >
                        Load LFT Template
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => setEditing((p) => p && ({ ...p, data: { ...p.data, fields: [...p.data.fields, emptyField()] } }))}>
                        <Plus className="w-4 h-4 mr-1" /> Add Parameter
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-80 overflow-auto pr-1">
                    {editing.data.fields.map((f, idx) => (
                      <div key={f.id} className="grid grid-cols-12 gap-2 items-end border p-3 rounded">
                        <div className="col-span-3">
                          <Label>Name</Label>
                          <Input value={f.name} onChange={(e) => setEditing((p) => {
                            if (!p) return p; const fields = [...p.data.fields]; fields[idx] = { ...fields[idx], name: e.target.value }; return { ...p, data: { ...p.data, fields } };
                          })} />
                        </div>
                        <div className="col-span-2">
                          <Label>Type</Label>
                          <Select value={f.type} onValueChange={(val) => setEditing((p) => {
                            if (!p) return p; const fields = [...p.data.fields]; fields[idx] = { ...fields[idx], type: val as TestField["type"] }; return { ...p, data: { ...p.data, fields } };
                          })}>
                            <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="number">number</SelectItem>
                              <SelectItem value="text">text</SelectItem>
                              <SelectItem value="select">select</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <Label>Unit</Label>
                          <Input value={f.unit ?? ""} onChange={(e) => setEditing((p) => {
                            if (!p) return p; const fields = [...p.data.fields]; fields[idx] = { ...fields[idx], unit: e.target.value }; return { ...p, data: { ...p.data, fields } };
                          })} />
                        </div>
                        <div className="col-span-4">
                          <Label>Normal Range</Label>
                          <Input value={f.normalRange ?? ""} onChange={(e) => setEditing((p) => {
                            if (!p) return p; const fields = [...p.data.fields]; fields[idx] = { ...fields[idx], normalRange: e.target.value }; return { ...p, data: { ...p.data, fields } };
                          })} />
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <Button variant="destructive" size="icon" onClick={() => setEditing((p) => {
                            if (!p) return p; const fields = p.data.fields.filter((x) => x.id !== f.id); return { ...p, data: { ...p.data, fields } };
                          })}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="border-t p-4">
            <div className="flex w-full justify-between">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <div className="flex gap-2">
                {editing?.id && (
                  <Button variant="destructive" onClick={() => editing?.id && delMut.mutate(editing.id)}>Delete</Button>
                )}
                <Button onClick={save}>Save</Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestManagement;
