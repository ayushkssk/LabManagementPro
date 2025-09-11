import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>Customize Super Admin appearance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm">Primary Color</label>
              <Input type="text" defaultValue="#3b82f6" />
            </div>
            <div>
              <label className="text-sm">Secondary Color</label>
              <Input type="text" defaultValue="#1d4ed8" />
            </div>
            <div>
              <label className="text-sm">Accent</label>
              <Input type="text" defaultValue="#8b5cf6" />
            </div>
          </div>
          <Button className="mt-2">Save</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Session and access controls</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline">Force logout all sessions</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
