import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit, Copy, Check, Download, Upload, Settings, FileText, FileCheck, FileTextIcon, Search, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { LetterheadType, LetterheadTemplate } from '@/types/letterhead';

const LetterheadManager: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<LetterheadTemplate[]>([]);
  const [activeTab, setActiveTab] = useState<LetterheadType>('billing');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Load templates on component mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const duplicateTemplate = (template: LetterheadTemplate) => {
    const newTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedTemplates = [...templates, newTemplate];
    saveTemplates(updatedTemplates);
  };

  const deleteTemplate = (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      const updatedTemplates = templates.filter(t => t.id !== id);
      saveTemplates(updatedTemplates);
    }
  };

  const setAsDefault = (id: string) => {
    const updatedTemplates = templates.map(template => ({
      ...template,
      isDefault: template.id === id
    }));
    saveTemplates(updatedTemplates);
  };

  const saveTemplates = (updatedTemplates: LetterheadTemplate[]) => {
    try {
      localStorage.setItem('letterheadTemplates', JSON.stringify(updatedTemplates));
      setTemplates(updatedTemplates);
    } catch (error) {
      console.error('Error saving templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to save templates',
        variant: 'destructive',
      });
    }
  };
  
  const loadTemplates = () => {
    try {
      const savedTemplates = localStorage.getItem('letterheadTemplates');
      if (savedTemplates) {
        setTemplates(JSON.parse(savedTemplates));
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load letterhead templates',
        variant: 'destructive',
      });
    }
  };

  const createNewTemplate = (type: LetterheadType, templateType: 'blank' | 'canva' | 'pdf' = 'blank') => {
    let newTemplate: LetterheadTemplate;
    
    if (templateType === 'pdf') {
      // Simple template without PDF background
      newTemplate = {
        id: `lh_${Date.now()}`,
        name: 'Simple Letterhead',
        description: 'Clean letterhead without background',
        type,
        isDefault: false,
        isPdf: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pageSize: 'A4',
        orientation: 'portrait',
        header: {
          height: 0,
          showOnFirstPage: false,
          showOnOtherPages: false,
          elements: []
        },
        footer: {
          height: 0,
          showOnFirstPage: false,
          showOnOtherPages: false,
          elements: []
        },
        content: [],
        settings: {
          showPageNumbers: false,
          pageNumberFormat: 'Page {current} of {total}',
          printBackground: false,
          scale: 1,
          fontFamily: 'Arial, sans-serif'
        },
        styles: {
          primaryColor: '#000000',
          secondaryColor: '#333333',
          fontFamily: 'Arial, sans-serif',
          baseFontSize: '12px',
          lineHeight: 1.5,
          textColor: '#000000',
          linkColor: '#000000',
          borderColor: '#000000'
        },
        margins: {
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
          header: 10,
          footer: 10
        }
      };
    } else if (templateType === 'canva') {
      // Canva template with white and green professional design
      newTemplate = {
        id: `lh_${Date.now()}`,
        name: 'Professional Green Letterhead',
        description: 'Elegant white and green professional letterhead template',
        type,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pageSize: 'A4',
        orientation: 'portrait',
        header: {
          height: 100,
          showOnFirstPage: true,
          showOnOtherPages: true,
          elements: [
            {
              id: `header-bg-${Date.now()}`,
              type: 'html',
              html: `<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: #f0fdf4; border: 1px solid #d1fae5;"></div>`,
              position: { x: 0, y: 0 },
              style: { zIndex: 0 }
            },
            {
              id: `header-logo-${Date.now()}`,
              type: 'logo',
              position: { x: 20, y: 20 },
              size: { w: 60, h: 60 },
              src: '/logo.png',
              style: { zIndex: 1 }
            },
            {
              id: `header-title-${Date.now()}`,
              type: 'text',
              text: 'YOUR HOSPITAL NAME',
              position: { x: 90, y: 25 },
              style: {
                fontSize: 20,
                fontWeight: 'bold',
                color: '#065f46',
                fontFamily: 'Arial, sans-serif',
                zIndex: 1
              }
            },
            {
              id: `header-subtitle-${Date.now()}`,
              type: 'text',
              text: 'Quality Healthcare Services',
              position: { x: 90, y: 50 },
              style: {
                fontSize: 12,
                color: '#065f46',
                fontStyle: 'italic',
                zIndex: 1
              }
            },
            {
              id: `header-line-${Date.now()}`,
              type: 'line',
              position: { x: 0, y: 95 },
              size: { w: 100, h: 2 },
              color: '#10b981',
              thickness: 2,
              style: { zIndex: 1 }
            }
          ]
        },
        body: {
          height: 0,
          showOnFirstPage: true,
          showOnOtherPages: true,
          elements: []
        },
        footer: {
          height: 40,
          showOnFirstPage: true,
          showOnOtherPages: true,
          elements: [
            {
              id: `footer-line-${Date.now()}`,
              type: 'line',
              position: { x: 0, y: 5 },
              size: { w: 100, h: 1 },
              color: '#10b981',
              thickness: 1,
              style: { zIndex: 1 }
            },
            {
              id: `footer-text-${Date.now()}`,
              type: 'text',
              text: '123 Hospital Street, City, State • Phone: (123) 456-7890 • Email: info@hospital.com',
              position: { x: 50, y: 15 },
              style: {
                fontSize: 8,
                color: '#065f46',
                textAlign: 'center',
                width: '100%',
                zIndex: 1
              }
            },
            {
              id: `footer-page-${Date.now()}`,
              type: 'text',
              text: 'Page {pageNumber} of {totalPages}',
              position: { x: 95, y: 30 },
              style: {
                fontSize: 8,
                color: '#065f46',
                textAlign: 'right',
                zIndex: 1
              }
            }
          ]
        },
        styles: {
          primaryColor: '#065f46',
          secondaryColor: '#10b981',
          fontFamily: 'Arial, sans-serif',
          baseFontSize: '12pt',
          lineHeight: 1.5,
          textColor: '#1f2937',
          linkColor: '#3b82f6',
          borderColor: '#e5e7eb',
        },
        margins: {
          top: 120, // Increased to accommodate the header
          right: 30,
          bottom: 50, // Increased to accommodate the footer
          left: 30,
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
    } else {
      // Default blank template
      newTemplate = {
        id: `lh_${Date.now()}`,
        name: `New ${type.replace('_', ' ')} Template`,
        description: '',
        type,
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
          height: 0,
          showOnFirstPage: true,
          showOnOtherPages: true,
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

    const updatedTemplates = [...templates, newTemplate];
    saveTemplates(updatedTemplates);
    const handleEditTemplate = (template: LetterheadTemplate) => {
      // Get the current hospital name from the URL or use a default
      const hospitalName = window.location.pathname.includes('/hospitals/') 
        ? window.location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Hospital'
        : 'Hospital';
        
      navigate(`/admin/letterheads/edit/${template.id}`, { 
        state: { hospitalName } 
      });
    };
    handleEditTemplate(newTemplate);
  };

  const deleteTemplate = (id: string) => {
    const updatedTemplates = templates.filter(t => t.id !== id);
    saveTemplates(updatedTemplates);
    toast({
      title: 'Template deleted',
      description: 'The template has been removed',
    });
  };

  const setAsDefault = (id: string) => {
    const updatedTemplates = templates.map(t => ({
      ...t,
      isDefault: t.id === id,
    }));
    saveTemplates(updatedTemplates);
    toast({
      title: 'Default template updated',
      description: 'The default template has been updated',
    });
  };

  const duplicateTemplate = (template: LetterheadTemplate) => {
    const newTemplate = {
      ...template,
      id: `lh_${Date.now()}`,
      name: `${template.name} (Copy)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedTemplates = [...templates, newTemplate];
    saveTemplates(updatedTemplates);
    toast({
      title: 'Template duplicated',
      description: 'A copy of the template has been created',
    });
  };

  const filteredTemplates = templates
    .filter(t => t.type === activeTab)
    .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      billing: 'Billing',
      test_report: 'Test Report',
      prescription: 'Prescription',
      general: 'General',
    };
    return labels[type] || type;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Letterhead Manager</h1>
          <p className="text-muted-foreground">Create and manage your letterhead templates</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => createNewTemplate(activeTab, 'canva')}>
            <FileText className="mr-2 h-4 w-4" /> Use Canva Template
          </Button>
          <Button onClick={() => createNewTemplate(activeTab)}>
            <Plus className="mr-2 h-4 w-4" /> New Blank Template
          </Button>
        </div>
      </div>

      <Tabs 
        defaultValue="billing" 
        className="space-y-4"
        onValueChange={(value) => setActiveTab(value as LetterheadType)}
      >
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="billing">
              <FileTextIcon className="mr-2 h-4 w-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="test_report">
              <FileCheck className="mr-2 h-4 w-4" />
              Test Reports
            </TabsTrigger>
            <TabsTrigger value="prescription">
              <FileText className="mr-2 h-4 w-4" />
              Prescriptions
            </TabsTrigger>
            <TabsTrigger value="general">
              <Settings className="mr-2 h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="saved">
              <File className="mr-2 h-4 w-4" />
              Saved Letterheads
            </TabsTrigger>
          </TabsList>
          
          <div className="w-64">
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9"
            />
          </div>
        </div>

        <TabsContent value="saved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saved Letterhead PDF</CardTitle>
              <CardDescription>Preview and use your saved letterhead PDF</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="aspect-[1/1.4142] w-full max-w-md mx-auto bg-white shadow-lg">
                  <iframe 
                    src="/letterheadgreen.pdf" 
                    className="w-full h-full border-0"
                    title="Letterhead Preview"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => createNewTemplate('general', 'pdf')}>
                  <Plus className="mr-2 h-4 w-4" /> Use This Letterhead
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value={activeTab} className="space-y-4">
          {filteredTemplates.length === 0 ? (
            <Card className="text-center p-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-medium">No templates found</h3>
                <p className="text-sm text-muted-foreground">
                  Get started by creating a new {getTypeLabel(activeTab).toLowerCase()} template
                </p>
                <Button onClick={() => createNewTemplate(activeTab)}>
                  <Plus className="mr-2 h-4 w-4" /> Create Template
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="relative overflow-hidden">
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => navigate(`/admin/letterheads/edit/${template.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => duplicateTemplate(template)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteTemplate(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      {template.isDefault && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-2">
                      {template.description || 'No description'}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="aspect-[1/1.414] bg-muted/50 rounded-md border flex items-center justify-center">
                      <div className="text-center p-4 space-y-2">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {template.pageSize.toUpperCase()} - {template.orientation}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Updated {new Date(template.updatedAt).toLocaleDateString()}
                      </div>
                      <Button
                        variant={template.isDefault ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setAsDefault(template.id)}
                      >
                        {template.isDefault ? (
                          <Check className="h-4 w-4 mr-2" />
                        ) : null}
                        {template.isDefault ? 'Default' : 'Set as Default'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Letterhead Manager</h1>
        <Button onClick={() => createNewTemplate(activeTab)}>
          <Plus className="mr-2 h-4 w-4" />
          New Letterhead
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as LetterheadType)}>
        <TabsList>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="report">Report</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="relative w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search letterheads..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {templates.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium">No letterheads found</h3>
                <p className="text-muted-foreground mt-1">Get started by creating a new letterhead.</p>
                <Button className="mt-4" onClick={() => createNewTemplate(activeTab)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Letterhead
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates
                  .filter(template => template.type === activeTab)
                  .filter(template => 
                    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
                  )
                  .map((template) => (
                    <Card key={template.id} className="overflow-hidden">
                      <div className="p-4 flex justify-end space-x-2 border-b">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => navigate(`/admin/letterhead/${template.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => duplicateTemplate(template)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => deleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          {template.isDefault && (
                            <Badge variant="secondary">Default</Badge>
                          )}
                        </div>
                        <CardDescription className="line-clamp-2">
                          {template.description || 'No description'}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="aspect-[1/1.414] bg-muted/50 rounded-md border flex items-center justify-center">
                          <div className="text-center p-4 space-y-2">
                            <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              {template.pageSize.toUpperCase()} - {template.orientation}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            Updated {new Date(template.updatedAt).toLocaleDateString()}
                          </div>
                          <Button
                            variant={template.isDefault ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setAsDefault(template.id)}
                          >
                            {template.isDefault && <Check className="h-4 w-4 mr-2" />}
                            {template.isDefault ? 'Default' : 'Set as Default'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Export the component as default
export default LetterheadManager;
