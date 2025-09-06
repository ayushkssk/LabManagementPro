import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Mail, Lock, User, FlaskConical } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'technician'>('admin');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await login(email, password);
    if (success) {
      toast({
        title: "Login Successful",
        description: "Welcome to Hospital Lab Management System",
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDemoLogin = (role: 'admin' | 'technician') => {
    if (role === 'admin') {
      setEmail('admin@healthcare.com');
    } else {
      setEmail('tech@healthcare.com');
    }
    setPassword('demo123');
    setSelectedRole(role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-medical rounded-2xl flex items-center justify-center shadow-medical">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">LabManager Pro</h1>
            <p className="text-muted-foreground">Hospital Lab Management System</p>
          </div>
        </div>

        {/* Demo Login Options */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => handleDemoLogin('admin')}
            className="p-4 h-auto flex flex-col space-y-2 hover:bg-primary/5 hover:border-primary/30 transition-smooth"
          >
            <User className="w-6 h-6 text-primary" />
            <div>
              <div className="font-medium">Admin</div>
              <div className="text-xs text-muted-foreground">Hospital Owner</div>
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleDemoLogin('technician')}
            className="p-4 h-auto flex flex-col space-y-2 hover:bg-accent/5 hover:border-accent/30 transition-smooth"
          >
            <FlaskConical className="w-6 h-6 text-accent" />
            <div>
              <div className="font-medium">Technician</div>
              <div className="text-xs text-muted-foreground">Lab Staff</div>
            </div>
          </Button>
        </div>

        {/* Login Form */}
        <Card className="shadow-card">
          <CardHeader className="text-center">
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-medical hover:opacity-90 transition-smooth" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Info */}
        <Card className="border-dashed border-2 bg-muted/30">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              <strong>Demo Credentials:</strong><br />
              Email: admin@healthcare.com or tech@healthcare.com<br />
              Password: demo123
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;