import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getTest, updateTest, deleteTest, TestData } from '@/services/testService';

const FieldRow: React.FC<{
  index: number;
  field: TestData['fields'][number];
  editable: boolean;
  onChange: (idx: number, patch: Partial<TestData['fields'][number]>) => void;
  onRemove: (idx: number) => void;
}> = ({ index, field, editable, onChange, onRemove }) => {
  return (
    <div className="grid grid-cols-12 gap-2 items-center border rounded p-2 bg-card">
      <div className="col-span-12 sm:col-span-3">
        <label className="text-xs text-muted-foreground">Parameter</label>
        <Input
          value={field.name}
          onChange={(e) => onChange(index, { name: e.target.value })}
          disabled={!editable}
        />
      </div>
      <div className="col-span-6 sm:col-span-3">
        <label className="text-xs text-muted-foreground">Type</label>
        <select
          className={`w-full border rounded px-3 py-2 bg-background ${!editable ? 'cursor-not-allowed opacity-80' : ''}`}
          value={field.type || 'number'}
          onChange={(e) => onChange(index, { type: e.target.value })}
          disabled={!editable}
          title={!editable ? 'Click Edit to change type' : 'Select parameter type'}
        >
          {/* Ensure current value is visible even if not in defaults */}
          {(!['number','text','select','datetime-local'].includes(field.type)) && (
            <option value={field.type}>{field.type}</option>
          )}
          <option value="number">Number</option>
          <option value="text">Text</option>
          <option value="select">Select</option>
          <option value="datetime-local">Date & Time</option>
        </select>
        {!editable && (
          <div className="text-[10px] text-muted-foreground mt-1">Click Edit to change type</div>
        )}
      </div>
      <div className="col-span-6 sm:col-span-2">
        <label className="text-xs text-muted-foreground">Unit</label>
        <Input
          value={field.unit || ''}
          onChange={(e) => onChange(index, { unit: e.target.value })}
          disabled={!editable}
        />
      </div>
      <div className="col-span-12 sm:col-span-3">
        <label className="text-xs text-muted-foreground">Normal Range</label>
        <Input
          value={field.normalRange || ''}
          onChange={(e) => onChange(index, { normalRange: e.target.value })}
          disabled={!editable}
        />
      </div>
      {editable && (
        <div className="col-span-12 sm:col-span-1 flex sm:justify-end">
          <Button variant="destructive" type="button" onClick={() => onRemove(index)}>Remove</Button>
        </div>
      )}
    </div>
  );
};

const TestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [editing, setEditing] = React.useState(false);
  const [local, setLocal] = React.useState<TestData | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { data, isLoading, isError } = useQuery<TestData | null>({
    queryKey: ['test', id],
    queryFn: () => getTest(id as string),
    enabled: Boolean(id),
  });

  // Helper to focus the next tabbable element within this page
  const containerRef = React.useRef<HTMLDivElement>(null);
  const focusNext = (current: HTMLElement) => {
    const root = containerRef.current;
    if (!root) return;
    const tabbables = Array.from(
      root.querySelectorAll<HTMLElement>('input, textarea, select, button, [tabindex]:not([tabindex="-1"])')
    ).filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1 && el.offsetParent !== null);
    const idx = tabbables.indexOf(current);
    if (idx >= 0) {
      const next = tabbables[idx + 1] || tabbables[0];
      next.focus();
      if ((next as HTMLInputElement).select) {
        try { (next as HTMLInputElement).select(); } catch {}
      }
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    const target = e.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'textarea') return; // allow newline in textarea
    e.preventDefault();
    focusNext(target);
  };

  React.useEffect(() => {
    if (data) setLocal(data);
  }, [data]);

  const mutUpdate = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<TestData> }) => updateTest(id, patch),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['test', id] });
      await qc.invalidateQueries({ queryKey: ['tests'] });
    },
  });

  const mutDelete = useMutation({
    mutationFn: (id: string) => deleteTest(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['tests'] });
      navigate('/tests');
    },
  });

  const handleFieldChange = (idx: number, patch: Partial<TestData['fields'][number]>) => {
    if (!local) return;
    const next = { ...local, fields: local.fields.map((f, i) => (i === idx ? { ...f, ...patch } : f)) };
    setLocal(next);
  };

  const handleFieldAdd = () => {
    if (!local) return;
    const id = Math.random().toString(36).slice(2, 9);
    setLocal({
      ...local,
      fields: [...(local.fields || []), { id, name: 'New Parameter', type: 'number', unit: '', normalRange: '' }],
    });
  };

  const handleFieldRemove = (idx: number) => {
    if (!local) return;
    setLocal({ ...local, fields: local.fields.filter((_, i) => i !== idx) });
  };

  const handleSave = async () => {
    if (!id || !local) return;
    try {
      if (!confirm('Do you want to save changes to this test?')) return;
      setSaving(true);
      setError(null);
      await mutUpdate.mutateAsync({ id, patch: { ...local } });
      setEditing(false);
    } catch (e: any) {
      setError(e?.message || 'Failed to update test');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this test? This action cannot be undone.')) return;
    try {
      await mutDelete.mutateAsync(id);
    } catch (e: any) {
      alert(e?.message || 'Failed to delete test');
    }
  };

  if (isLoading || !local) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading test...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">Could not load the test.</p>
            <Button className="mt-3" onClick={() => navigate('/tests')}>Back to Tests</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div ref={containerRef} onKeyDown={handleKeyDown} className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{editing ? 'Edit Test' : 'Test Details'}</h1>
        <div className="flex gap-2">
          {!editing ? (
            <>
              <Button variant="outline" onClick={() => setEditing(true)}>Edit</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => { setEditing(false); setLocal(data as TestData); }} disabled={saving}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-3 text-sm text-red-600">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Test Name</label>
              <Input
                value={local.name}
                onChange={(e) => setLocal({ ...local, name: e.target.value })}
                disabled={!editing}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Category</label>
              <Input
                value={local.category}
                onChange={(e) => setLocal({ ...local, category: e.target.value })}
                disabled={!editing}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Price (₹)</label>
              <Input
                type="number"
                value={local.price}
                onChange={(e) => setLocal({ ...local, price: Number(e.target.value || 0) })}
                disabled={!editing}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Description</label>
              <textarea
                className="w-full border rounded px-3 py-2 bg-background min-h-[90px]"
                value={local.description || ''}
                onChange={(e) => setLocal({ ...local, description: e.target.value })}
                disabled={!editing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {local.fields?.length ? (
            <div className="space-y-2">
              {local.fields.map((f, idx) => (
                <FieldRow
                  key={f.id}
                  index={idx}
                  field={f}
                  editable={editing}
                  onChange={handleFieldChange}
                  onRemove={handleFieldRemove}
                />
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No parameters added.</div>
          )}
          {editing && (
            <Button type="button" variant="outline" onClick={handleFieldAdd}>Add Parameter</Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestDetails;
