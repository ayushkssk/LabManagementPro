import React, { useCallback, useMemo, useRef, useState } from 'react';
import { LetterheadTemplate, LHElement, LHFieldKey } from '@/types/letterhead';
import { createTemplate, deleteTemplate, loadTemplates, saveTemplates, updateTemplate, getTemplate } from '@/utils/letterheadStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const defaultTemplate = (): Omit<LetterheadTemplate, 'id' | 'createdAt' | 'updatedAt'> => ({
  name: 'New Template',
  description: 'Custom letterhead',
  settings: { primaryColor: '#2563eb', fontFamily: 'Arial, sans-serif', backgroundColor: '#ffffff', showFooter: true, watermark: { text: '', color: 'rgba(0,0,0,0.06)', angle: -30, opacity: 0.06 } },
  elements: [
    { id: 'logo1', type: 'logo', position: { x: 24, y: 24 }, size: { w: 140, h: 60 }, style: {}, src: '/logo.png' } as any,
    { id: 'name1', type: 'field', field: 'name' as LHFieldKey, position: { x: 180, y: 24 }, style: { fontSize: 22, fontWeight: 'bold' } } as any,
    { id: 'addr1', type: 'field', field: 'address' as LHFieldKey, position: { x: 180, y: 56 }, style: { fontSize: 12 } } as any,
    { id: 'contact1', type: 'text', text: 'Phone | Email', position: { x: 180, y: 78 }, style: { fontSize: 12 } } as any,
    { id: 'line1', type: 'line', position: { x: 24, y: 110 }, size: { w: 720, h: 2 }, thickness: 2, color: '#2563eb' } as any,
  ],
});

// Preset template generators for quick load
const presetClassicCentered = (): Omit<LetterheadTemplate, 'id' | 'createdAt' | 'updatedAt'> => ({
  name: 'Classic Centered',
  description: 'Centered title with logo and contact under it',
  settings: { primaryColor: '#1d4ed8', fontFamily: 'Georgia, serif', backgroundColor: '#ffffff', showFooter: true },
  elements: [
    { id: 'logo', type: 'logo', position: { x: 326, y: 10 }, size: { w: 140, h: 60 }, src: '/logo.png' } as any,
    { id: 'title', type: 'field', field: 'name' as LHFieldKey, position: { x: 260, y: 72 }, style: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' } } as any,
    { id: 'addr', type: 'field', field: 'address' as LHFieldKey, position: { x: 180, y: 102 }, style: { fontSize: 12, textAlign: 'center' } } as any,
    { id: 'contact', type: 'text', text: 'Phone | Email', position: { x: 300, y: 122 }, style: { fontSize: 12, textAlign: 'center' } } as any,
    { id: 'line', type: 'line', position: { x: 24, y: 150 }, size: { w: 720, h: 2 }, thickness: 2, color: '#1d4ed8' } as any,
  ],
});

const presetLeftLogo = (): Omit<LetterheadTemplate, 'id' | 'createdAt' | 'updatedAt'> => ({
  name: 'Left Logo & Left Text',
  description: 'Logo left with hospital details left-aligned',
  settings: { primaryColor: '#0ea5e9', fontFamily: 'Arial, sans-serif', backgroundColor: '#ffffff', showFooter: true },
  elements: [
    { id: 'logo', type: 'logo', position: { x: 24, y: 20 }, size: { w: 120, h: 60 }, src: '/logo.png' } as any,
    { id: 'title', type: 'field', field: 'name' as LHFieldKey, position: { x: 160, y: 22 }, style: { fontSize: 22, fontWeight: 'bold' } } as any,
    { id: 'addr', type: 'field', field: 'address' as LHFieldKey, position: { x: 160, y: 52 }, style: { fontSize: 12 } } as any,
    { id: 'contact', type: 'text', text: 'Phone | Email | GSTIN', position: { x: 160, y: 74 }, style: { fontSize: 12 } } as any,
    { id: 'line', type: 'line', position: { x: 24, y: 110 }, size: { w: 720, h: 2 }, thickness: 2, color: '#0ea5e9' } as any,
  ],
});

const presetBoldDivider = (): Omit<LetterheadTemplate, 'id' | 'createdAt' | 'updatedAt'> => ({
  name: 'Bold Divider',
  description: 'Bold color bar under header',
  settings: { primaryColor: '#dc2626', fontFamily: 'Arial, sans-serif', backgroundColor: '#ffffff', showFooter: true },
  elements: [
    { id: 'logo', type: 'logo', position: { x: 24, y: 24 }, size: { w: 120, h: 50 }, src: '/logo.png' } as any,
    { id: 'title', type: 'field', field: 'name' as LHFieldKey, position: { x: 160, y: 24 }, style: { fontSize: 22, fontWeight: 'bold' } } as any,
    { id: 'addr', type: 'field', field: 'address' as LHFieldKey, position: { x: 160, y: 52 }, style: { fontSize: 12 } } as any,
    { id: 'bar', type: 'line', position: { x: 0, y: 110 }, size: { w: 792, h: 6 }, thickness: 6, color: '#dc2626' } as any,
  ],
});

type Dragging = { id: string; offsetX: number; offsetY: number } | null;

export const LetterheadDesigner: React.FC = () => {
  const [templates, setTemplates] = useState<LetterheadTemplate[]>(() => loadTemplates());
  const [activeId, setActiveId] = useState<string | null>(templates[0]?.id || null);
  const active = useMemo(() => (activeId ? getTemplate(activeId) : null) || null, [activeId, templates]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canvasSize] = useState({ w: 792, h: 200 }); // ~A4 width at 96dpi, header area
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<Dragging>(null);

  const commit = useCallback((tpl: LetterheadTemplate) => {
    const updated = updateTemplate(tpl.id, tpl) as LetterheadTemplate;
    const all = loadTemplates();
    setTemplates(all);
    setActiveId(updated.id);
  }, []);

  const onMouseDown = (e: React.MouseEvent, el: LHElement) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setSelectedId(el.id);
    setDragging({ id: el.id, offsetX: e.clientX - rect.left - (el.position?.x || 0), offsetY: e.clientY - rect.top - (el.position?.y || 0) });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !active || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(canvasSize.w, e.clientX - rect.left - dragging.offsetX));
    const y = Math.max(0, Math.min(canvasSize.h, e.clientY - rect.top - dragging.offsetY));
    const elements = active.elements.map(el => (el.id === dragging.id ? { ...el, position: { x, y } } : el));
    commit({ ...active, elements });
  };

  const onMouseUp = () => setDragging(null);

  const addElement = (type: LHElement['type']) => {
    if (!active) return;
    const id = `${type}_${Math.random().toString(36).slice(2, 8)}`;
    const base = { id, type, position: { x: 40, y: 40 }, style: { fontSize: 14 } } as any;
    const newEl: LHElement =
      type === 'text'
        ? { ...base, text: 'New Text' }
        : type === 'html'
        ? { ...base, html: '<b>Custom HTML</b>' }
        : type === 'logo'
        ? { ...base, src: '/logo.png', size: { w: 120, h: 50 } }
        : type === 'line'
        ? { ...base, thickness: 2, color: '#333', size: { w: 720, h: 2 } }
        : { ...base, type: 'field', field: 'name' };
    commit({ ...active, elements: [...active.elements, newEl] });
    setSelectedId(id);
  };

  const removeSelected = () => {
    if (!active || !selectedId) return;
    commit({ ...active, elements: active.elements.filter(e => e.id !== selectedId) });
    setSelectedId(null);
  };

  const updateSelected = (changes: any) => {
    if (!active || !selectedId) return;
    commit({
      ...active,
      elements: active.elements.map(e => (e.id === selectedId ? { ...e, ...changes, style: { ...e.style, ...changes.style } } : e)),
    });
  };

  const onCreate = () => {
    const created = createTemplate(defaultTemplate());
    setTemplates(loadTemplates());
    setActiveId(created.id);
    toast({ title: 'Template created' });
  };

  const onDelete = () => {
    if (!active) return;
    deleteTemplate(active.id);
    const all = loadTemplates();
    setTemplates(all);
    setActiveId(all[0]?.id || null);
    setSelectedId(null);
    toast({ title: 'Template deleted' });
  };

  const onRename = (name: string) => {
    if (!active) return;
    commit({ ...active, name });
  };

  const onSaveAll = () => {
    saveTemplates(templates);
    toast({ title: 'Templates saved' });
  };

  const selected = active?.elements.find(e => e.id === selectedId) || null;

  const applyPreset = (presetName: string) => {
    if (!active) return;
    const base = presetName === 'classic' ? presetClassicCentered() : presetName === 'left' ? presetLeftLogo() : presetBoldDivider();
    commit({ ...active, name: base.name, description: base.description, settings: { ...active.settings, ...base.settings }, elements: base.elements });
    toast({ title: 'Preset applied', description: base.name });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Label>Template</Label>
        <select
          className="border rounded p-2 text-sm"
          value={activeId || ''}
          onChange={(e) => setActiveId(e.target.value || null)}
        >
          {templates.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <Button variant="outline" onClick={onCreate}>New</Button>
        <Button variant="outline" onClick={onSaveAll}>Save All</Button>
        <Button variant="destructive" onClick={onDelete} disabled={!active}>Delete</Button>
        <div className="flex items-center gap-2 ml-auto">
          <Label>Load Preset</Label>
          <select className="border rounded p-2 text-sm" onChange={(e) => { if (e.target.value) { applyPreset(e.target.value); e.target.value=''; } }}>
            <option value="">Select…</option>
            <option value="classic">Classic Centered</option>
            <option value="left">Left Logo</option>
            <option value="bold">Bold Divider</option>
          </select>
        </div>
      </div>

      {active && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Canvas (Header Area)</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                ref={canvasRef}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                className="border rounded bg-white relative overflow-hidden"
                style={{ width: canvasSize.w, height: canvasSize.h, fontFamily: active.settings.fontFamily, background: active.settings.backgroundColor || '#fff' }}
              >
                {/* Watermark preview */}
                {active.settings.watermark?.text && active.settings.watermark?.opacity !== 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none',
                      opacity: active.settings.watermark.opacity ?? 0.06,
                      transform: `rotate(${active.settings.watermark.angle ?? -30}deg)`,
                      color: active.settings.watermark.color || 'rgba(0,0,0,0.06)',
                      fontSize: 48,
                      fontWeight: 700,
                      userSelect: 'none',
                    }}
                  >
                    {active.settings.watermark.text}
                  </div>
                )}
                {active.elements.map(el => (
                  <div
                    key={el.id}
                    onMouseDown={(e) => onMouseDown(e, el)}
                    className={`absolute cursor-move ${selectedId === el.id ? 'ring-2 ring-primary' : ''}`}
                    style={{ left: el.position.x, top: el.position.y, width: el.size?.w, height: el.size?.h, color: el.style?.color, textAlign: el.style?.textAlign as any }}
                  >
                    {el.type === 'text' && <div style={{ fontSize: el.style?.fontSize }}>{(el as any).text}</div>}
                    {el.type === 'html' && <div dangerouslySetInnerHTML={{ __html: (el as any).html }} />}
                    {el.type === 'logo' && <img src={(el as any).src} alt="logo" style={{ width: el.size?.w, height: el.size?.h, objectFit: 'contain' }} />}
                    {el.type === 'line' && <div style={{ width: el.size?.w, height: (el as any).thickness || 2, background: (el as any).color || '#333' }} />}
                    {el.type === 'field' && <div style={{ fontSize: el.style?.fontSize }}>[{(el as any).field}]</div>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Elements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => addElement('text')}>Add Text</Button>
                  <Button variant="outline" onClick={() => addElement('logo')}>Add Logo</Button>
                  <Button variant="outline" onClick={() => addElement('field')}>Add Field</Button>
                  <Button variant="outline" onClick={() => addElement('line')}>Add Line</Button>
                  <Button variant="outline" onClick={() => addElement('html')}>Add HTML</Button>
                </div>
                <div className="text-xs text-muted-foreground">Drag items on the canvas to reposition. Click an item to edit properties.</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Template Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Label>Name</Label>
                <Input value={active.name} onChange={e => onRename(e.target.value)} />
                <Label>Primary Color</Label>
                <input type="color" value={active.settings.primaryColor || '#2563eb'} onChange={(e) => commit({ ...active, settings: { ...active.settings, primaryColor: e.target.value } })} />
                <Label>Font Family</Label>
                <select className="border rounded p-2" value={active.settings.fontFamily} onChange={(e) => commit({ ...active, settings: { ...active.settings, fontFamily: e.target.value } })}>
                  <option>Arial, sans-serif</option>
                  <option>Georgia, serif</option>
                  <option>Times New Roman</option>
                  <option>Courier New</option>
                </select>
                <Label>Background</Label>
                <input type="color" value={active.settings.backgroundColor || '#ffffff'} onChange={(e) => commit({ ...active, settings: { ...active.settings, backgroundColor: e.target.value } })} />
                <div className="pt-2 border-t mt-2">
                  <div className="font-medium">Watermark</div>
                  <Label>Text</Label>
                  <Input value={active.settings.watermark?.text || ''} onChange={(e) => commit({ ...active, settings: { ...active.settings, watermark: { ...(active.settings.watermark || {}), text: e.target.value } } })} />
                  <Label>Color</Label>
                  <input type="color" value={active.settings.watermark?.color || '#000000'} onChange={(e) => commit({ ...active, settings: { ...active.settings, watermark: { ...(active.settings.watermark || {}), color: e.target.value } } })} />
                  <Label>Angle</Label>
                  <Input type="number" value={active.settings.watermark?.angle ?? -30} onChange={(e) => commit({ ...active, settings: { ...active.settings, watermark: { ...(active.settings.watermark || {}), angle: Number(e.target.value) } } })} />
                  <Label>Opacity (0-1)</Label>
                  <Input type="number" step="0.01" min="0" max="1" value={active.settings.watermark?.opacity ?? 0.06} onChange={(e) => commit({ ...active, settings: { ...active.settings, watermark: { ...(active.settings.watermark || {}), opacity: Math.max(0, Math.min(1, Number(e.target.value))) } } })} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Selected Element</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {!selected && <div className="text-muted-foreground text-xs">Select an element to edit.</div>}
                {selected && (
                  <>
                    <div className="text-xs">ID: {selected.id}</div>
                    {'text' in selected && (selected as any).text !== undefined && (
                      <>
                        <Label>Text</Label>
                        <Input value={(selected as any).text} onChange={(e) => updateSelected({ text: e.target.value })} />
                      </>
                    )}
                    {'html' in selected && (selected as any).html !== undefined && (
                      <>
                        <Label>HTML</Label>
                        <textarea className="border rounded p-2 h-24" value={(selected as any).html} onChange={(e) => updateSelected({ html: e.target.value })} />
                        <div className="text-[10px] text-muted-foreground">Note: HTML is inserted as-is. Ensure it is safe.</div>
                      </>
                    )}
                    {'field' in selected && (selected as any).field !== undefined && (
                      <>
                        <Label>Field</Label>
                        <select className="border rounded p-2" value={(selected as any).field} onChange={(e) => updateSelected({ field: e.target.value })}>
                          <option value="name">Hospital Name</option>
                          <option value="address">Address</option>
                          <option value="phone">Phone</option>
                          <option value="email">Email</option>
                          <option value="gstin">GSTIN</option>
                          <option value="registration">Registration</option>
                        </select>
                        <Label>Font Size</Label>
                        <Input type="number" value={selected.style?.fontSize || 14} onChange={(e) => updateSelected({ style: { fontSize: Number(e.target.value) } })} />
                      </>
                    )}
                    <div className="flex gap-2">
                      <Button variant="destructive" onClick={removeSelected}>Delete</Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {!active && (
        <Card>
          <CardHeader>
            <CardTitle>No template selected</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={onCreate}>Create Template</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LetterheadDesigner;
