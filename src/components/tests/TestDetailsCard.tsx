import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ClipboardList } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { TestData } from '@/services/testService';

interface TestDetailsCardProps {
  test: TestData | null;
  isLoading?: boolean;
  error?: string | null;
}

export const TestDetailsCard: React.FC<TestDetailsCardProps> = ({
  test,
  isLoading = false,
  error = null,
}) => {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error || !test) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Test Not Found</AlertTitle>
        <AlertDescription>
          {error || 'The requested test details could not be found.'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{test.name}</CardTitle>
          <Badge variant="outline" className="text-sm">
            {test.category}
          </Badge>
        </div>
        {test.description && (
          <p className="text-sm text-muted-foreground">{test.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Price
              </h4>
              <p className="font-medium">₹{test.price?.toFixed(2) || 'N/A'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Test Code
              </h4>
              <p className="font-mono">{test.id || 'N/A'}</p>
            </div>
          </div>

          {test.fields && test.fields.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium">Parameters</h3>
              </div>
              <div className="border rounded-lg divide-y">
                {test.fields.map((field) => (
                  <div key={field.id} className="p-3 grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <p className="font-medium">{field.name}</p>
                      {field.normalRange && (
                        <p className="text-xs text-muted-foreground">
                          {field.normalRange}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2 flex items-center">
                      <div className="flex-1">
                        <div className="h-10 bg-muted rounded animate-pulse" />
                      </div>
                      {field.unit && (
                        <span className="ml-2 text-sm text-muted-foreground">
                          {field.unit}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
