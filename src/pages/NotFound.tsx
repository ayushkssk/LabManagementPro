import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, Stethoscope } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex-1 min-h-0 flex items-center justify-center bg-gradient-subtle p-4">
      <Card className="max-w-md w-full shadow-elevated">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-medical rounded-2xl flex items-center justify-center shadow-medical mb-4">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-4xl font-bold text-foreground">404</CardTitle>
          <CardDescription className="text-xl">
            Page not found
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => navigate(-1)} 
              variant="outline" 
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button 
              onClick={() => navigate('/login')} 
              className="flex-1 bg-gradient-medical hover:opacity-90"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
