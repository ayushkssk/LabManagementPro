import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Billing: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Professional (Monthly)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹2,999</div>
            <p className="text-sm text-muted-foreground mt-1">Renews on 01 Oct 2025</p>
            <div className="mt-4">
              <Button variant="outline">Manage Subscription</Button>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>Download past invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Aug 2025</span>
                <Button size="sm" variant="outline">Download</Button>
              </div>
              <div className="flex items-center justify-between">
                <span>Jul 2025</span>
                <Button size="sm" variant="outline">Download</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader>
            <CardTitle>Usage</CardTitle>
            <CardDescription>Current month usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4,562 reports</div>
            <p className="text-sm text-muted-foreground">Included: 10,000 / month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Billing;
