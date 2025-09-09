import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Save, Eye, Download, Undo2, Redo2, 
  Type, Image, Square, Minus, Code, FileText, 
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, 
  Underline, List, ListOrdered, Link2, Trash2,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  GripVertical, ImagePlus, Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { toast } from '@/hooks/use-toast';
import { 
  LetterheadTemplate, 
  LHElement, 
  LHElementType, 
  LHPosition, 
  LHSize, 
  LHStyle, 
  LHTextElement, 
  LHLogoElement, 
  LHLineElement, 
  LHFieldElement, 
  LHHtmlElement 
} from '@/types/letterhead';

// Default template to use when creating a new one
const DEFAULT_TEMPLATE: LetterheadTemplate = {
  id: '',
  name: 'New Template',
  description: '',
  type: 'general',
  isDefault: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  pageSize: 'A4',
  orientation: 'portrait',
  header: {
    height: 30,
    showOnFirstPage: true,
    showOnOtherPages: true,
    elements: [],
  },
  body: {
    elements: [],
  },
  footer: {
    height: 20,
    showOnFirstPage: true,
    showOnOtherPages: true,
    elements: [],
  },
  styles: {
    primaryColor: '#1e40af',
    secondaryColor: '#6b7280',
    fontFamily: 'Arial, sans-serif',
    baseFontSize: '12pt',
    lineHeight: 1.5,
    textColor: '#1f2937',
    linkColor: '#3b82f6',
    borderColor: '#e5e7eb',
  },
  margins: {
    top: 15,
    right: 15,
    bottom: 15,
    left: 15,
    header: 10,
    footer: 10,
  },
  settings: {
    showPageNumbers: true,
    pageNumberFormat: 'Page {current} of {total}',
    printBackground: true,
    scale: 1,
  },
};

interface LetterheadEditorProps {
  hospitalName?: string;
}

const LetterheadEditor: React.FC<LetterheadEditorProps> = ({ hospitalName = '' }) => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const resolvedHospitalName = hospitalName || location.state?.hospitalName || '';
  const [template, setTemplate] = useState<LetterheadTemplate>(() => {
    const defaultTemplate = { ...DEFAULT_TEMPLATE, id: id || '' };
    // Use the resolved hospital name as the template name if available
    if (resolvedHospitalName) {
      defaultTemplate.name = resolvedHospitalName;
    }
    return defaultTemplate;
  });
  const [activeTab, setActiveTab] = useState('design');
  const [selectedElement, setSelectedElement] = useState<LHElement | null>(null);
  const [history, setHistory] = useState<LetterheadTemplate[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load template if editing
  useEffect(() => {
    if (id) {
      const savedTemplates = JSON.parse(localStorage.getItem('letterheadTemplates') || '[]');
      const existingTemplate = savedTemplates.find((t: LetterheadTemplate) => t.id === id);
      if (existingTemplate) {
        setTemplate(existingTemplate);
      }
    }
  }, [id]);

  // Save history for undo/redo
  const saveToHistory = (newTemplate: LetterheadTemplate) => {
    const newHistory = history.slice(0, historyIndex + 1);
    const templateCopy = JSON.parse(JSON.stringify(newTemplate));
    setHistory([...newHistory, templateCopy]);
    setHistoryIndex(newHistory.length);
  };

  // Handle template updates
  const updateTemplate = (updates: Partial<LetterheadTemplate>) => {
    const updated = { ...template, ...updates, updatedAt: new Date().toISOString() };
    setTemplate(updated);
    saveToHistory(updated);
  };

  // Save template
  const saveTemplate = () => {
    try {
      const savedTemplates = JSON.parse(localStorage.getItem('letterheadTemplates') || '[]');
      const existingIndex = savedTemplates.findIndex((t: LetterheadTemplate) => t.id === template.id);
      
      if (existingIndex >= 0) {
        savedTemplates[existingIndex] = template;
      } else {
        savedTemplates.push(template);
      }
      
      localStorage.setItem('letterheadTemplates', JSON.stringify(savedTemplates));
      
      toast({
        title: 'Template saved',
        description: 'Your changes have been saved',
      });
      
      // Navigate back if this is a new template
      if (!id) {
        navigate('/admin/letterheads');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive',
      });
    }
  };

  // Add a new element
  const addElement = (elementType: LHElementType) => {
    const baseElement = {
      id: `elem_${Date.now()}`,
      position: { x: 50, y: 50 } as LHPosition,
      size: { 
        w: elementType === 'text' ? 200 : elementType === 'logo' ? 100 : 200, 
        h: elementType === 'text' ? 30 : elementType === 'logo' ? 50 : 1 
      } as LHSize,
    };

    let newElement: LHElement;

    switch (elementType) {
      case 'text':
        newElement = {
          ...baseElement,
          type: 'text',
          text: 'New Text',
          style: {
            color: template.styles.textColor,
            fontFamily: template.styles.fontFamily,
            fontSize: '14px',
            fontWeight: 'normal',
            textAlign: 'left',
          },
        } as LHTextElement;
        break;
      
      case 'logo':
        newElement = {
          ...baseElement,
          type: 'logo',
          src: '',
        } as LHLogoElement;
        break;
        
      case 'line':
        newElement = {
          ...baseElement,
          type: 'line',
          thickness: 1,
          color: template.styles.borderColor,
        } as unknown as LHLineElement;
        break;
        
      case 'field':
        newElement = {
          ...baseElement,
          type: 'field',
          field: 'name',
          label: 'Name:',
        } as unknown as LHFieldElement;
        break;
        
      case 'html':
      default:
        newElement = {
          ...baseElement,
          type: 'html',
          html: '<div>Custom HTML</div>',
        } as unknown as LHHtmlElement;
    }

    // Add element to the header
    const updatedTemplate = { 
      ...template,
      header: {
        ...template.header,
        elements: [...template.header.elements, newElement]
      }
    };
    updateTemplate(updatedTemplate);
    setSelectedElement(newElement);
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const newElement: LHElement = {
        id: `elem_${Date.now()}`,
        type: 'logo',
        position: { x: 50, y: 50 },
        size: { w: 100, h: 50 },
        src: event.target?.result as string,
      };

      const updated = { ...template };
      updated.header.elements = [...updated.header.elements, newElement];
      updateTemplate(updated);
      setSelectedElement(newElement);
    };
    reader.readAsDataURL(file);
  };

  // Update element properties
  const updateElement = (id: string, updates: Partial<LHElement>) => {
    const elementIndex = template.header.elements.findIndex(el => el.id === id);
    
    if (elementIndex >= 0) {
      const updatedElements = [...template.header.elements];
      const originalElement = updatedElements[elementIndex];
      
      // Create a new element with the updates
      const updatedElement = { ...originalElement, ...updates } as LHElement;
      
      // Handle special cases for different element types
      if (updates.type) {
        // If type changed, we need to ensure we have all required fields for the new type
        switch (updates.type) {
          case 'text':
            if (originalElement.type !== 'text') {
              (updatedElement as unknown as LHTextElement).text = 'New Text';
            }
            break;
          case 'logo':
            if (originalElement.type !== 'logo') {
              (updatedElement as unknown as LHLogoElement).src = '';
            }
            break;
          case 'line':
            if (originalElement.type !== 'line') {
              (updatedElement as unknown as LHLineElement).thickness = 1;
              (updatedElement as unknown as LHLineElement).color = template.styles.borderColor;
            }
            break;
          case 'field':
            if (originalElement.type !== 'field') {
              (updatedElement as unknown as LHFieldElement).field = 'name';
              (updatedElement as unknown as LHFieldElement).label = 'Field:';
            }
            break;
          case 'html':
            if (originalElement.type !== 'html') {
              (updatedElement as unknown as LHHtmlElement).html = '<div>Custom HTML</div>';
            }
            break;
        }
      }
      
      // Update the elements array
      updatedElements[elementIndex] = updatedElement;
      
      // Update the template
      const updated = { 
        ...template,
        header: {
          ...template.header,
          elements: updatedElements
        }
      };
      
      // Update the selected element if it's the one being updated
      if (selectedElement && selectedElement.id === id) {
        setSelectedElement(updatedElement);
      }
      
      updateTemplate(updated);
    }
  };

  // Remove element
  const removeElement = (id: string) => {
    const updated = { 
      ...template,
      header: {
        ...template.header,
        elements: template.header.elements.filter(el => el.id !== id)
      }
    };
    
    updateTemplate(updated);
    
    if (selectedElement?.id === id) {
      setSelectedElement(null);
    }
  };

  // Move element in the stack
  const moveElement = (id: string, direction: 'up' | 'down') => {
    const index = template.header.elements.findIndex(el => el.id === id);
    
    if (index >= 0) {
      const newIndex = direction === 'up' ? index + 1 : index - 1;
      
      if (newIndex >= 0 && newIndex < template.header.elements.length) {
        const updatedElements = [...template.header.elements];
        const [moved] = updatedElements.splice(index, 1);
        updatedElements.splice(newIndex, 0, moved);
        
        const updated = {
          ...template,
          header: {
            ...template.header,
            elements: updatedElements
          }
        };
        
        updateTemplate(updated);
      }
    }
  };

  // Undo/Redo
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = () => {
    if (canUndo && history[historyIndex - 1]) {
      setHistoryIndex(prev => prev - 1);
      setTemplate(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (canRedo && history[historyIndex + 1]) {
      setHistoryIndex(prev => prev + 1);
      setTemplate(history[historyIndex + 1]);
    }
  };

  // Render element based on type
  const renderElement = (element: LHElement) => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${element.position.x}px`,
      top: `${element.position.y}px`,
      width: element.size?.w ? `${element.size.w}px` : 'auto',
      height: element.size?.h ? `${element.size.h}px` : 'auto',
      border: selectedElement?.id === element.id ? '2px dashed #3b82f6' : '1px dashed #e5e7eb',
      backgroundColor: selectedElement?.id === element.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
      cursor: 'move',
      userSelect: 'none',
      padding: '4px',
    };

    switch (element.type) {
      case 'text':
        return (
          <div 
            style={{
              ...baseStyle,
              fontFamily: (element as LHTextElement).style?.fontFamily || 'inherit',
              fontSize: (element as LHTextElement).style?.fontSize || '14px',
              color: (element as LHTextElement).style?.color || '#000000',
              textAlign: (element as LHTextElement).style?.textAlign as any || 'left',
              fontWeight: (element as LHTextElement).style?.fontWeight || 'normal',
              lineHeight: '1.5',
            }}
            onClick={() => setSelectedElement(element)}
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => updateElement(element.id, { text: e.currentTarget.textContent || '' })}
          >
            {(element as LHTextElement).text || 'Double click to edit'}
          </div>
        );
      case 'logo':
        return (
          <div 
            style={{
              ...baseStyle,
              backgroundImage: (element as LHLogoElement).src ? `url(${(element as LHLogoElement).src})` : 'none',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundColor: (element as LHLogoElement).src ? 'transparent' : '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9ca3af',
              fontSize: '12px',
            }}
            onClick={() => setSelectedElement(element)}
          >
            {!(element as LHLogoElement).src && 'Click to upload logo'}
          </div>
        );
      case 'line':
        return (
          <div 
            style={{
              ...baseStyle,
              height: `${(element as LHLineElement).thickness || 1}px`,
              backgroundColor: (element as LHLineElement).color || '#e5e7eb',
              border: 'none',
            }}
            onClick={() => setSelectedElement(element)}
          />
        );
      default:
        return null;
    }
  };

  // Render property panel for selected element
  const renderPropertyPanel = () => {
    if (!selectedElement) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          <p>Select an element to edit its properties</p>
          {resolvedHospitalName && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium mb-2">Hospital Name</h3>
              <Input 
                value={template.name}
                onChange={(e) => updateTemplate({ ...template, name: e.target.value })}
                className="mb-2"
              />
              <p className="text-xs text-gray-500">The hospital name will be used as the default template name</p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Element Properties</h3>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => removeElement(selectedElement.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Remove
          </Button>
        </div>

        {/* Common properties */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>X Position</Label>
              <Input 
                type="number" 
                value={selectedElement.position.x}
                onChange={(e) => updateElement(selectedElement.id, {
                  position: { ...selectedElement.position, x: parseInt(e.target.value) || 0 }
                })}
              />
            </div>
            <div>
              <Label>Y Position</Label>
              <Input 
                type="number" 
                value={selectedElement.position.y}
                onChange={(e) => updateElement(selectedElement.id, {
                  position: { ...selectedElement.position, y: parseInt(e.target.value) || 0 }
                })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Width</Label>
              <Input 
                type="number" 
                value={selectedElement.size?.w || 0}
                onChange={(e) => updateElement(selectedElement.id, {
                  size: { ...selectedElement.size, w: parseInt(e.target.value) || 0 }
                })}
              />
            </div>
            <div>
              <Label>Height</Label>
              <Input 
                type="number" 
                value={selectedElement.size?.h || 0}
                onChange={(e) => updateElement(selectedElement.id, {
                  size: { ...selectedElement.size, h: parseInt(e.target.value) || 0 }
                })}
              />
            </div>
          </div>
        </div>

        {/* Type-specific properties */}
        {selectedElement.type === 'text' && (
          <div className="space-y-4">
            <div>
              <Label>Text</Label>
              <Textarea 
                value={(selectedElement as any).text || ''}
                onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })}
                rows={3}
              />
            </div>
            
            <div>
              <Label>Font Family</Label>
              <Select
                value={selectedElement.style?.fontFamily || template.styles.fontFamily}
                onValueChange={(value) => updateElement(selectedElement.id, {
                  style: { ...selectedElement.style, fontFamily: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                  <SelectItem value="'Helvetica Neue', sans-serif">Helvetica</SelectItem>
                  <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
                  <SelectItem value="'Courier New', monospace">Courier New</SelectItem>
                  <SelectItem value="'Georgia', serif">Georgia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Font Size (px)</Label>
              <Input 
                type="number" 
                value={parseInt(selectedElement.style?.fontSize as string) || 14}
                onChange={(e) => updateElement(selectedElement.id, {
                  style: { ...selectedElement.style, fontSize: `${e.target.value}px` }
                })}
              />
            </div>

            <div>
              <Label>Text Color</Label>
              <ColorPicker
                color={selectedElement.style?.color || template.styles.textColor}
                onChange={(color) => updateElement(selectedElement.id, {
                  style: { ...selectedElement.style, color }
                })}
              />
            </div>

            <div className="flex items-center space-x-4">
              <Button 
                variant={selectedElement.style?.fontWeight === 'bold' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateElement(selectedElement.id, {
                  style: { 
                    ...selectedElement.style, 
                    fontWeight: selectedElement.style?.fontWeight === 'bold' ? 'normal' : 'bold'
                  }
                })}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button 
                variant={selectedElement.style?.fontStyle === 'italic' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateElement(selectedElement.id, {
                  style: { 
                    ...selectedElement.style, 
                    fontStyle: selectedElement.style?.fontStyle === 'italic' ? 'normal' : 'italic'
                  }
                })}
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button 
                variant={selectedElement.style?.textDecoration === 'underline' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateElement(selectedElement.id, {
                  style: { 
                    ...selectedElement.style, 
                    textDecoration: selectedElement.style?.textDecoration === 'underline' ? 'none' : 'underline'
                  }
                })}
              >
                <Underline className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button 
                variant={selectedElement.style?.textAlign === 'left' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateElement(selectedElement.id, {
                  style: { ...selectedElement.style, textAlign: 'left' }
                })}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant={selectedElement.style?.textAlign === 'center' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateElement(selectedElement.id, {
                  style: { ...selectedElement.style, textAlign: 'center' }
                })}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button 
                variant={selectedElement.style?.textAlign === 'right' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateElement(selectedElement.id, {
                  style: { ...selectedElement.style, textAlign: 'right' }
                })}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {selectedElement.type === 'logo' && (
          <div className="space-y-4">
            <div>
              <Label>Logo Image</Label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <div className="flex text-sm text-muted-foreground">
                    <label
                      htmlFor="logo-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/90 focus-within:outline-none"
                    >
                      <span>Upload a file</span>
                      <input 
                        id="logo-upload" 
                        name="logo-upload" 
                        type="file" 
                        className="sr-only" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        ref={fileInputRef}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, GIF up to 2MB
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedElement.type === 'line' && (
          <div className="space-y-4">
            <div>
              <Label>Line Thickness (px)</Label>
              <Input 
                type="number" 
                value={(selectedElement as any).thickness || 1}
                min={1}
                max={10}
                onChange={(e) => updateElement(selectedElement.id, { 
                  thickness: parseInt(e.target.value) || 1 
                })}
              />
            </div>
            <div>
              <Label>Line Color</Label>
              <ColorPicker
                color={(selectedElement as any).color || template.styles.borderColor}
                onChange={(color) => updateElement(selectedElement.id, { color })}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/admin/letterheads')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <h1 className="text-lg font-semibold">
              {id ? 'Edit Letterhead' : 'Create New Letterhead'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleUndo}
              disabled={!canUndo}
            >
              <Undo2 className="h-4 w-4 mr-1" /> Undo
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRedo}
              disabled={!canRedo}
            >
              <Redo2 className="h-4 w-4 mr-1" /> Redo
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveTab(activeTab === 'design' ? 'preview' : 'design')}
            >
              {activeTab === 'design' ? (
                <>
                  <Eye className="h-4 w-4 mr-1" /> Preview
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </>
              )}
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={saveTemplate}
            >
              <Save className="h-4 w-4 mr-1" /> Save
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Elements */}
        <div className="w-16 border-r bg-gray-50 flex flex-col items-center py-4 space-y-2">
          <Button 
            variant="outline" 
            size="icon"
            className="h-12 w-12"
            onClick={() => addElement('text')}
            title="Add Text"
          >
            <Type className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon"
            className="h-12 w-12"
            onClick={() => fileInputRef.current?.click()}
            title="Add Logo/Image"
          >
            <Image className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon"
            className="h-12 w-12"
            onClick={() => addElement('line')}
            title="Add Line"
          >
            <Minus className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon"
            className="h-12 w-12"
            disabled
            title="Add Shape (Coming Soon)"
          >
            <Square className="h-5 w-5" />
          </Button>
          
          <div className="border-t w-8 mx-auto my-2"></div>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="h-10 w-10 text-muted-foreground"
            title="Move Up"
            disabled={!selectedElement}
            onClick={() => moveElement(selectedElement!.id, 'up')}
          >
            <ChevronUp className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="h-10 w-10 text-muted-foreground"
            title="Move Down"
            disabled={!selectedElement}
            onClick={() => moveElement(selectedElement!.id, 'down')}
          >
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>

        {/* Main content - Canvas */}
        <div className="flex-1 bg-gray-100 overflow-auto p-8 flex items-center justify-center">
          <div 
            className="bg-white shadow-lg"
            style={{
              width: '210mm', // A4 width
              minHeight: '297mm', // A4 height
              position: 'relative',
              overflow: 'hidden',
            }}
            onClick={(e) => {
              // Deselect if clicking on empty space
              if (e.target === e.currentTarget) {
                setSelectedElement(null);
              }
            }}
          >
            {/* Header */}
            <div 
              className="border-b"
              style={{
                height: `${template.header.height}mm`,
                padding: '10mm',
                position: 'relative',
                backgroundColor: '#f9fafb',
              }}
            >
              {template.header.elements.map(element => (
                <div key={element.id} onClick={(e) => {
                  e.stopPropagation();
                  setSelectedElement(element);
                }}>
                  {renderElement(element)}
                </div>
              ))}
            </div>

            {/* Body */}
            <div 
              className="p-10"
              style={{
                minHeight: `calc(297mm - ${template.header.height}mm - ${template.footer.height}mm - 20mm)`,
              }}
            >
              {activeTab === 'design' ? (
                <div className="text-center text-muted-foreground py-20">
                  <p>Click on the left sidebar to add elements to your letterhead</p>
                  <p className="text-sm mt-2">Drag to position, resize, and customize each element</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Document Title</h2>
                  <p>This is a preview of how your document will look when printed or saved as PDF.</p>
                  <p>You can add text, images, and other elements to customize your letterhead.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div 
              className="border-t text-center text-xs text-muted-foreground py-2"
              style={{
                height: `${template.footer.height}mm`,
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '5mm',
                backgroundColor: '#f9fafb',
              }}
            >
              {template.footer.elements.map(element => (
                <div key={element.id} onClick={(e) => {
                  e.stopPropagation();
                  setSelectedElement(element);
                }}>
                  {renderElement(element)}
                </div>
              ))}
              
              {template.settings.showPageNumbers && (
                <div className="absolute bottom-2 right-4">
                  Page 1 of 1
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar - Properties */}
        <div className="w-80 border-l bg-white overflow-y-auto">
          <Tabs defaultValue="element" className="h-full flex flex-col">
            <TabsList className="w-full rounded-none border-b">
              <TabsTrigger value="element" className="flex-1">Element</TabsTrigger>
              <TabsTrigger value="document" className="flex-1">Document</TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-y-auto">
              <TabsContent value="element" className="m-0">
                {renderPropertyPanel()}
              </TabsContent>
              
              <TabsContent value="document" className="m-0 p-4 space-y-4">
                <div>
                  <Label>Template Name</Label>
                  <Input 
                    value={template.name}
                    onChange={(e) => updateTemplate({ name: e.target.value })}
                    placeholder="My Letterhead"
                  />
                </div>
                
                <div>
                  <Label>Description</Label>
                  <Textarea 
                    value={template.description || ''}
                    onChange={(e) => updateTemplate({ description: e.target.value })}
                    placeholder="Brief description of this template"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Page Size</Label>
                    <Select
                      value={template.pageSize}
                      onValueChange={(value) => updateTemplate({ 
                        pageSize: value as 'A4' | 'A5' | 'Letter' | 'Legal' 
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select page size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A4">A4 (210 × 297 mm)</SelectItem>
                        <SelectItem value="A5">A5 (148 × 210 mm)</SelectItem>
                        <SelectItem value="Letter">Letter (216 × 279 mm)</SelectItem>
                        <SelectItem value="Legal">Legal (216 × 356 mm)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Orientation</Label>
                    <Select
                      value={template.orientation}
                      onValueChange={(value) => updateTemplate({ 
                        orientation: value as 'portrait' | 'landscape' 
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select orientation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Portrait</SelectItem>
                        <SelectItem value="landscape">Landscape</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Header Height: {template.header.height}mm</Label>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(template.header.height * 3.78)}px
                    </span>
                  </div>
                  <Slider
                    value={[template.header.height]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={([value]) => {
                      const header = { ...template.header, height: value };
                      updateTemplate({ header });
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Footer Height: {template.footer.height}mm</Label>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(template.footer.height * 3.78)}px
                    </span>
                  </div>
                  <Slider
                    value={[template.footer.height]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={([value]) => {
                      const footer = { ...template.footer, height: value };
                      updateTemplate({ footer });
                    }}
                  />
                </div>
                
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <Label>Show Page Numbers</Label>
                    <Switch 
                      checked={template.settings.showPageNumbers}
                      onCheckedChange={(checked) => {
                        const settings = { ...template.settings, showPageNumbers: checked };
                        updateTemplate({ settings });
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Print Background</Label>
                    <Switch 
                      checked={template.settings.printBackground}
                      onCheckedChange={(checked) => {
                        const settings = { ...template.settings, printBackground: checked };
                        updateTemplate({ settings });
                      }}
                    />
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default LetterheadEditor;
