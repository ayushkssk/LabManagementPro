import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Mail, Lock, User, FlaskConical, HelpCircle, MessageCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { FcGoogle } from 'react-icons/fc';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'technician'>('admin');
  const { login, loginWithGoogle, isLoading } = useAuth();
  
  const handleGoogleSignIn = async () => {
    const success = await loginWithGoogle();
    if (success) {
      toast({
        title: "Google Sign-In Successful",
        description: "Welcome to Hospital Lab Management System",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Only the Super Admin account can sign in with Google.",
        variant: "destructive",
      });
    }
  };

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
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col md:flex-row bg-white relative">
      {/* Left Side - Login Form */}
      <div className="w-full max-w-full md:w-1/2 lg:w-2/5 xl:w-1/3 p-4 md:p-8 lg:p-12 flex flex-col justify-center overflow-x-hidden">
        {/* Logo and Header */}
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Please sign in to your account</p>
          </div>

          {/* Demo Login Options */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => handleDemoLogin('admin')}
              className="group p-5 h-auto flex flex-col space-y-3 transition-all duration-300 ease-in-out
                        hover:bg-primary/10 hover:border-primary/50 hover:shadow-md hover:scale-[1.02]
                        border-2 rounded-xl hover:shadow-primary/10 relative"
            >
              <div className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                Demo
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                <User className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-base group-hover:text-primary transition-colors duration-300">Admin</div>
                <div className="text-xs text-muted-foreground group-hover:text-primary/80 transition-colors duration-300">Hospital Owner</div>
                <div className="mt-2 text-xs font-mono bg-primary/5 px-2 py-1 rounded group-hover:bg-primary/10">admin@healthcare.com</div>
              </div>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDemoLogin('technician')}
              className="group p-5 h-auto flex flex-col space-y-3 transition-all duration-300 ease-in-out
                        hover:bg-accent/10 hover:border-accent/50 hover:shadow-md hover:scale-[1.02]
                        border-2 rounded-xl hover:shadow-accent/10 relative"
            >
              <div className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                Demo
              </div>
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors duration-300">
                <FlaskConical className="w-6 h-6 text-accent group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-base group-hover:text-accent transition-colors duration-300">Technician</div>
                <div className="text-xs text-muted-foreground group-hover:text-accent/80 transition-colors duration-300">Lab Staff</div>
                <div className="mt-2 text-xs font-mono bg-accent/5 px-2 py-1 rounded group-hover:bg-accent/10">tech@healthcare.com</div>
              </div>
            </Button>
          </div>

          {/* Login Form */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                    Forgot password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Demo Accounts</h3>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Admin Account</p>
                    <p className="text-xs text-gray-500">admin@healthcare.com</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FlaskConical className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Technician Account</p>
                    <p className="text-xs text-gray-500">tech@healthcare.com</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Lock className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Password for both</p>
                    <p className="text-xs text-gray-500">demo123</p>
                  </div>
                </div>
                
                {/* Google Sign-In Button */}
                <div className="pt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-50"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                    >
                      <FcGoogle className="h-5 w-5" />
                      <span>Super Admin Login with Google</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Side - Image */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 xl:w-2/3 bg-blue-50 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-0">
          <img 
            src="/login.png" 
            alt="Hospital Lab Management" 
            className="w-auto h-auto max-w-[100%] max-h-[100%] object-contain"
          />
        </div>
      </div>
      
      {/* Support FAB - Positioned at bottom */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
        {/* WhatsApp Button */}
        <Button 
          variant="outline" 
          size="icon"
          className="rounded-full h-12 w-12 shadow-lg bg-white hover:bg-green-50 group relative"
          onClick={() => window.open('https://wa.me/916202899289?text=I%20am%20using%20your%20LabPro%20software%20need%20support,%20Help,%20Details', '_blank')}
        >
          <MessageCircle className="h-6 w-6 text-green-600 group-hover:scale-110 transition-transform" />
          <div className="absolute -right-2 -top-2 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            <span>1</span>
          </div>
        </Button>

        {/* Support Info Card (Hidden by default, shown on hover) */}
        <div className="bg-white p-4 rounded-lg shadow-lg w-64 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto mb-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">IT4B.in Support</h3>
            </div>
            <p className="text-sm text-gray-600">LabManagerPro v1.0</p>
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">Need help? Message us on WhatsApp</p>
              <a 
                href="https://wa.me/916202899289?text=I%20am%20using%20your%20LabPro%20software%20need%20support,%20Help,%20Details" 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700"
              >
                <MessageCircle className="h-4 w-4" />
                +91 6202 899 289
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;