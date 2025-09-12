import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { Trash2, Plus, Upload, Download, Pencil, Loader2, ListPlus, ChevronsUpDown, X, Check } from "lucide-react";
import type { Test as TestType, TestField } from "@/types";
import { addTest, deleteTest, getTests, updateTest, assignTestCodes, reloadDefaultTests, type TestData } from "@/services/testService";
import { getUnits, addUnit, reloadDefaultUnits, type UnitData } from "@/services/unitService";
import { useHospitals } from '@/context/HospitalContext';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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

// Common test parameters that can be added via multi-select
const commonTestParameters = [
  { label: "Hemoglobin (Hb)", value: "hemoglobin", unit: "g/dL", normalRange: "12.0-16.0" },
  { label: "White Blood Cells (WBC)", value: "wbc", unit: "x10³/µL", normalRange: "4.0-11.0" },
  { label: "Red Blood Cells (RBC)", value: "rbc", unit: "x10⁶/µL", normalRange: "4.0-5.9" },
  { label: "Hematocrit (HCT)", value: "hct", unit: "%", normalRange: "36-46" },
  { label: "Mean Corpuscular Volume (MCV)", value: "mcv", unit: "fL", normalRange: "80-100" },
  { label: "Mean Corpuscular Hemoglobin (MCH)", value: "mch", unit: "pg", normalRange: "27-32" },
  { label: "Platelets", value: "platelets", unit: "x10³/µL", normalRange: "150-450" },
  { label: "Glucose (Fasting)", value: "glucose", unit: "mg/dL", normalRange: "70-100" },
  { label: "Urea (BUN)", value: "urea", unit: "mg/dL", normalRange: "7-20" },
  { label: "Creatinine", value: "creatinine", unit: "mg/dL", normalRange: "0.5-1.2" },
  { label: "Sodium (Na)", value: "sodium", unit: "mEq/L", normalRange: "135-145" },
  { label: "Potassium (K)", value: "potassium", unit: "mEq/L", normalRange: "3.5-5.1" },
  { label: "Chloride (Cl)", value: "chloride", unit: "mEq/L", normalRange: "98-107" },
  { label: "Total Protein", value: "total_protein", unit: "g/dL", normalRange: "6.0-8.3" },
  { label: "Albumin", value: "albumin", unit: "g/dL", normalRange: "3.5-5.0" },
  { label: "Alkaline Phosphatase (ALP)", value: "alp", unit: "U/L", normalRange: "44-147" },
  { label: "Alanine Aminotransferase (ALT)", value: "alt", unit: "U/L", normalRange: "0-41" },
  { label: "Aspartate Aminotransferase (AST)", value: "ast", unit: "U/L", normalRange: "0-40" },
  { label: "Bilirubin (Total)", value: "bilirubin_total", unit: "mg/dL", normalRange: "0.2-1.2" },
  { label: "Bilirubin (Direct)", value: "bilirubin_direct", unit: "mg/dL", normalRange: "0.0-0.3" },
]

// MultiSelect component
const MultiSelect = ({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  searchPlaceholder = "Search options...",
  emptyText = "No options found.",
  className,
}: {
  options: { label: string; value: string }[];
  selected: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const removeSelected = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((item) => item !== value));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-auto min-h-10", className, {
            "text-muted-foreground": selected.length === 0,
          })}
        >
          <div className="flex flex-wrap gap-1 flex-1 text-left">
            {selected.length > 0 ? (
              selected.map((value) => {
                const option = options.find((opt) => opt.value === value);
                return (
                  <Badge
                    key={value}
                    variant="secondary"
                    className="flex items-center gap-1 mr-1 mb-1"
                  >
                    {option?.label}
                    <button
                      type="button"
                      onClick={(e) => removeSelected(value, e)}
                      className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })
            ) : (
              <span>{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="w-full p-2">
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 mb-2"
          />
          <div className="max-h-[200px] overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="py-2 px-3 text-sm text-muted-foreground">
                {emptyText}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                      selected.includes(option.value) && "bg-accent/50"
                    )}
                    onClick={() => handleSelect(option.value)}
                  >
                    <div className="flex items-center">
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          selected.includes(option.value)
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <Check className="h-4 w-4" />
                      </div>
                      {option.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const emptyField = (name = "", unit = "", normalRange = ""): TestField => ({
  id: crypto.randomUUID(),
  name,
  type: "number",
  unit,
  normalRange,
});

const emptyTest = (): Omit<TestType, "id"> => ({ name: "", category: "", price: 0, description: "", fields: [emptyField()] });

const TestManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { loadXLSX } = useXLSX();
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<{ id?: string; data: Omit<TestType, "id"> } | null>(null);
  // Removed printing dependencies and mock data

  type LoadedTest = TestData & { id: string; code?: string; };
  const { data: tests = [], isLoading } = useQuery<LoadedTest[]>({ queryKey: ["tests"], queryFn: getTests as any });
  const { data: units = [], refetch: refetchUnits } = useQuery<UnitData[]>({ queryKey: ["units"], queryFn: getUnits as any });
  const { hospitals } = useHospitals();

  const [activeHospitalId, setActiveHospitalId] = useState<string>(() => localStorage.getItem('activeHospitalId') || '');
  const isSuperAdmin = (() => {
    try { const u = JSON.parse(localStorage.getItem('demo-user') || 'null'); return u?.role === 'super-admin'; } catch { return false; }
  })();

  // Auto-seed units from hardcoded catalog if none exist
  useEffect(() => {
    const seed = async () => {
      try {
        if (!units || units.length === 0) {
          const count = await reloadDefaultUnits();
          if (count > 0) await refetchUnits();
        }
      } catch (e) {
        // non-blocking
        console.warn("Unit auto-seed failed", e);
      }
    };
    seed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units?.length]);

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

    // Persist any new units used in fields
    try {
      const unitSet = Array.from(new Set(payload.fields.map((f) => (f.unit || "").trim()).filter(Boolean)));
      if (unitSet.length) {
        await Promise.all(unitSet.map((u) => addUnit(u)));
        await refetchUnits();
      }
    } catch (e) {
      console.warn("Failed to persist units:", e);
    }

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
      
      // Flatten: one row per parameter. First row for a test carries Test info; subsequent rows leave those cells blank
      const rows: any[] = [];
      tests.forEach((t) => {
        const fields = t.fields || [];
        if (fields.length === 0) {
          rows.push({
            "Test Name": t.name,
            Parameter: "",
            Unit: "",
            "Normal Range": "",
            Category: t.category,
            Price: t.price,
          });
          return;
        }
        fields.forEach((f, idx) => {
          rows.push({
            "Test Name": idx === 0 ? t.name : "",
            Parameter: f.name,
            Unit: (f as any).unit || "",
            "Normal Range": (f as any).normalRange || "",
            Category: idx === 0 ? t.category : "",
            Price: idx === 0 ? t.price : "",
          });
        });
      });

      // Debug: verify full export size
      console.log('Export rows:', rows.length, 'Total tests merged:', tests.length);
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
      const unitsToPersist = new Set<string>();
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
            if (unit) unitsToPersist.add(unit);
          }
        }
        const rawPayload: Omit<TestData, "id"> = { name, category, price, description, fields };
        await addMut.mutateAsync(cleanTestPayload(rawPayload));
        count++;
      }
      // Persist units encountered in import
      if (unitsToPersist.size) {
        await Promise.all(Array.from(unitsToPersist).map((u) => addUnit(u)));
        await refetchUnits();
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
        <div className="flex gap-2 whitespace-nowrap items-center">
          {isSuperAdmin && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Hospital:</span>
              <Select
                value={activeHospitalId}
                onValueChange={(val) => {
                  setActiveHospitalId(val);
                  localStorage.setItem('activeHospitalId', val);
                  queryClient.invalidateQueries({ queryKey: ["tests"] });
                }}
              >
                <SelectTrigger className="w-[220px]"><SelectValue placeholder="Select hospital" /></SelectTrigger>
                <SelectContent>
                  {hospitals.map(h => (
                    <SelectItem key={h.id} value={h.id}>{h.displayName || h.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
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
          <Button 
            variant="secondary"
            onClick={async () => {
              try {
                const count = await reloadDefaultTests();
                toast.success(`Reloaded ${count} default tests`);
                queryClient.invalidateQueries({ queryKey: ["tests"] });
              } catch (e) {
                toast.error("Failed to reload defaults");
              }
            }}
          >
            <Loader2 className="w-4 h-4 mr-2" /> Reload Tests
          </Button>
          <Button 
            variant="secondary"
            onClick={async () => {
              try {
                const count = await reloadDefaultUnits();
                toast.success(`Reloaded ${count} units`);
                await refetchUnits();
              } catch (e) {
                toast.error("Failed to reload units");
              }
            }}
          >
            <Loader2 className="w-4 h-4 mr-2" /> Reload Units
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
                          {/* Hide edit/delete for protected tests */}
                          {!t.protected && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => openEdit(t)}
                                className="text-yellow-600 hover:bg-yellow-50"
                              >
                                <Pencil className="w-4 h-4 mr-1" /> Edit
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => delMut.mutate(t.id!)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-1" /> Delete
                              </Button>
                            </>
                          )}
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
        <DialogContent className="max-w-2xl w-full p-0 rounded-lg overflow-hidden">
          <DialogHeader className="bg-primary/5 px-6 py-4 border-b">
            <DialogTitle className="text-xl font-semibold text-foreground">
              {editing?.id ? "Edit Test" : "Add New Test"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {editing?.id ? "Update test details" : "Create a new test with parameters"}
            </p>
          </DialogHeader>
          
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {editing && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="test-name" className="text-sm font-medium">Test Name</Label>
                    <Input
                      id="test-name"
                      value={editing.data.name}
                      onChange={(e) => setEditing(p => p && ({ ...p, data: { ...p.data, name: e.target.value } }))}
                      placeholder="e.g., Complete Blood Count"
                      className="h-10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="test-category" className="text-sm font-medium">Category</Label>
                    <Input
                      id="test-category"
                      value={editing.data.category}
                      onChange={(e) => setEditing(p => p && ({ ...p, data: { ...p.data, category: e.target.value } }))}
                      placeholder="e.g., Hematology"
                      className="h-10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="test-price" className="text-sm font-medium">Price (₹)</Label>
                    <Input
                      id="test-price"
                      type="number"
                      value={editing.data.price}
                      onChange={(e) => setEditing(p => p && ({ ...p, data: { ...p.data, price: Number(e.target.value) } }))}
                      placeholder="0.00"
                      className="h-10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="test-description" className="text-sm font-medium">Description (Optional)</Label>
                    <Input
                      id="test-description"
                      value={editing.data.description}
                      onChange={(e) => setEditing(p => p && ({ ...p, data: { ...p.data, description: e.target.value } }))}
                      placeholder="Brief description of the test"
                      className="h-10"
                    />
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">Test Parameters</h4>
                      <p className="text-sm text-muted-foreground">
                        Add parameters included in this test
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Select
                        onValueChange={(value) => {
                          if (value === 'cbc') {
                            setEditing(p => p ? {
                              ...p,
                              data: {
                                ...p.data,
                                name: p.data.name || "Complete Blood Count (CBC)",
                                category: p.data.category || "Hematology",
                                fields: getCbcTemplateFields()
                              }
                            } : p);
                          } else if (value === 'lft') {
                            setEditing(p => p ? {
                              ...p,
                              data: {
                                ...p.data,
                                name: p.data.name || "Liver Function Test (LFT)",
                                category: p.data.category || "Biochemistry",
                                fields: getLftTemplateFields()
                              }
                            } : p);
                          }
                        }}
                      >
                        <SelectTrigger className="w-[180px] h-9">
                          <SelectValue placeholder="Load template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cbc">CBC Template</SelectItem>
                          <SelectItem value="lft">LFT Template</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-9 gap-1"
                          onClick={() =>
                            setEditing(p => p ? {
                              ...p,
                              data: { ...p.data, fields: [...p.data.fields, emptyField()] }
                            } : p)
                          }
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add Parameter</span>
                        </Button>
                        
                        <MultiSelect
                          options={commonTestParameters.map(p => ({
                            label: p.label,
                            value: p.value,
                          }))}
                          selected={[]}
                          onChange={(selectedValues) => {
                            if (!editing) return;
                            
                            const newFields = selectedValues
                              .filter(value => 
                                !editing.data.fields.some(field => 
                                  field.name.toLowerCase() === commonTestParameters
                                    .find(p => p.value === value)?.label.toLowerCase()
                                )
                              )
                              .map(value => {
                                const param = commonTestParameters.find(p => p.value === value);
                                return emptyField(
                                  param?.label || "",
                                  param?.unit || "",
                                  param?.normalRange || ""
                                );
                              });
                            
                            if (newFields.length > 0) {
                              setEditing({
                                ...editing,
                                data: {
                                  ...editing.data,
                                  fields: [...editing.data.fields, ...newFields]
                                }
                              });
                            }
                          }}
                          placeholder="Add common parameters"
                          searchPlaceholder="Search parameters..."
                          emptyText="No parameters found"
                          className="w-[200px] h-9"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {editing.data.fields.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="grid grid-cols-12 gap-4 p-3 bg-muted/30 text-sm font-medium">
                        <div className="col-span-4">Parameter Name</div>
                        <div className="col-span-2">Type</div>
                        <div className="col-span-2">Unit</div>
                        <div className="col-span-3">Normal Range</div>
                        <div className="col-span-1"></div>
                      </div>
                      
                      <div className="divide-y">
                        {editing.data.fields.map((field, idx) => (
                          <div key={field.id} className="grid grid-cols-12 gap-4 p-3 items-center hover:bg-muted/30 transition-colors">
                            <div className="col-span-4">
                              <Input
                                value={field.name}
                                onChange={(e) =>
                                  setEditing(p => p ? {
                                    ...p,
                                    data: {
                                      ...p.data,
                                      fields: p.data.fields.map((f, i) => 
                                        i === idx ? { ...f, name: e.target.value } : f
                                      )
                                    }
                                  } : p)
                                }
                                placeholder="Parameter name"
                                className="h-9"
                              />
                            </div>
                            
                            <div className="col-span-2">
                              <Select
                                value={field.type}
                                onValueChange={(val) =>
                                  setEditing(p => p ? {
                                    ...p,
                                    data: {
                                      ...p.data,
                                      fields: p.data.fields.map((f, i) => 
                                        i === idx ? { ...f, type: val as any } : f
                                      )
                                    }
                                  } : p)
                                }
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="number">Number</SelectItem>
                                  <SelectItem value="text">Text</SelectItem>
                                  <SelectItem value="select">Select</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="col-span-2">
                              <Input
                                value={field.unit || ""}
                                onChange={(e) =>
                                  setEditing(p => p ? {
                                    ...p,
                                    data: {
                                      ...p.data,
                                      fields: p.data.fields.map((f, i) => 
                                        i === idx ? { ...f, unit: e.target.value } : f
                                      )
                                    }
                                  } : p)
                                }
                                placeholder="Unit"
                                className="h-9"
                              />
                            </div>
                            
                            <div className="col-span-3">
                              <Input
                                value={field.normalRange || ""}
                                onChange={(e) =>
                                  setEditing(p => p ? {
                                    ...p,
                                    data: {
                                      ...p.data,
                                      fields: p.data.fields.map((f, i) => 
                                        i === idx ? { ...f, normalRange: e.target.value } : f
                                      )
                                    }
                                  } : p)
                                }
                                placeholder="e.g., 0-100"
                                className="h-9"
                              />
                            </div>
                            
                            <div className="col-span-1 flex justify-end">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                onClick={() =>
                                  setEditing(p => p ? {
                                    ...p,
                                    data: {
                                      ...p.data,
                                      fields: p.data.fields.filter((_, i) => i !== idx)
                                    }
                                  } : p)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Remove parameter</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-lg">
                      <div className="rounded-full bg-primary/10 p-3 mb-3">
                        <Plus className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">No parameters added yet</p>
                      <p className="text-xs text-muted-foreground text-center max-w-xs">
                        Add parameters manually or select a template to get started
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          
          <DialogFooter className="bg-muted/30 px-6 py-4 border-t flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div className="text-sm text-muted-foreground">
              {editing?.data.fields.length} {editing?.data.fields.length === 1 ? 'parameter' : 'parameters'} added
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="h-10 w-full sm:w-24"
              >
                Cancel
              </Button>
              
              <Button
                type="button"
                onClick={save}
                disabled={addMut.isPending || updMut.isPending}
                className="h-10 w-full sm:w-32"
              >
                {addMut.isPending || updMut.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {editing?.id ? 'Saving...' : 'Adding...'}
                  </>
                ) : editing?.id ? (
                  'Save Changes'
                ) : (
                  'Add Test'
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestManagement;
