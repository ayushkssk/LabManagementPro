import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Eye, Save } from 'lucide-react';
import { templateOptions, InvoiceTemplate } from './InvoiceTemplates';
import { demoHospital, demoBills, demoPatients } from '@/data/demoData';
import { toast } from '@/hooks/use-toast';

export const PrintSettings = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<'classic' | 'modern' | 'minimal' | 'colorful' | 'professional' | 'elegant'>('classic');
  const [withLetterhead, setWithLetterhead] = useState(true);
  const [headerAlign, setHeaderAlign] = useState<'left' | 'center' | 'right'>('left');
  const [footerAlign, setFooterAlign] = useState<'left' | 'center' | 'right'>('center');
  const [customHeader, setCustomHeader] = useState('');
  const [customFooter, setCustomFooter] = useState('Thank you for choosing our services!');
  const [showPreview, setShowPreview] = useState(false);

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Print settings have been updated successfully.",
    });
  };

  const demoBill = demoBills[0];
  const demoPatient = demoPatients.find(p => p.id === demoBill.patientId)!;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Panel */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Print & Billing Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Template Selection */}
            <div className="space-y-4">
              <Label>Invoice Template</Label>
              <Select value={selectedTemplate} onValueChange={(value: any) => setSelectedTemplate(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templateOptions.map((template) => (
                    <SelectItem key={template.value} value={template.value}>
                      <div>
                        <div className="font-medium">{template.label}</div>
                        <div className="text-sm text-muted-foreground">{template.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Letterhead Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Use Hospital Letter Head</Label>
                <p className="text-sm text-muted-foreground">
                  Include hospital logo and details on printed documents
                </p>
              </div>
              <Switch
                checked={withLetterhead}
                onCheckedChange={setWithLetterhead}
              />
            </div>

            <Separator />

            {/* Header Customization */}
            <div className="space-y-4">
              <Label>Custom Header</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-4">
                  <Label className="text-sm">Alignment:</Label>
                  <Select value={headerAlign} onValueChange={(value: any) => setHeaderAlign(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  placeholder="Enter custom header HTML (optional)"
                  value={customHeader}
                  onChange={(e) => setCustomHeader(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  You can use HTML tags for formatting. Leave empty for default header.
                </p>
              </div>
            </div>

            <Separator />

            {/* Footer Customization */}
            <div className="space-y-4">
              <Label>Custom Footer</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-4">
                  <Label className="text-sm">Alignment:</Label>
                  <Select value={footerAlign} onValueChange={(value: any) => setFooterAlign(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  placeholder="Enter custom footer HTML"
                  value={customFooter}
                  onChange={(e) => setCustomFooter(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  You can use HTML tags for formatting.
                </p>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowPreview(!showPreview)}
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </Button>
              <Button onClick={handleSave} className="bg-gradient-medical hover:opacity-90">
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview Panel */}
        {showPreview && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Invoice Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-border rounded-lg p-4 bg-muted/10 max-h-[600px] overflow-y-auto">
                <div className="transform scale-75 origin-top-left" style={{ width: '133.33%' }}>
                  <InvoiceTemplate
                    template={selectedTemplate}
                    hospital={demoHospital}
                    bill={demoBill}
                    patient={demoPatient}
                    withLetterhead={withLetterhead}
                    headerAlign={headerAlign}
                    footerAlign={footerAlign}
                    customHeader={customHeader}
                    customFooter={customFooter}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Template Showcase */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Available Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templateOptions.map((template) => (
              <div
                key={template.value}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedTemplate === template.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedTemplate(template.value as any)}
              >
                <h3 className="font-semibold text-primary">{template.label}</h3>
                <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                <div className="mt-3 h-20 bg-gradient-to-b from-primary/10 to-primary/5 rounded border" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};