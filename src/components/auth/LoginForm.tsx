import React, { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, User, FlaskConical, MessageCircle, Microscope, TestTube, Activity, Droplets, Pill, Syringe, HeartPulse } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { FcGoogle } from 'react-icons/fc';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FloatingIconProps {
  icon: React.ElementType;
  style?: React.CSSProperties;
  className?: string;
}

const FloatingIcon: React.FC<FloatingIconProps> = ({ icon: Icon, style, className }) => {
  return (
    <motion.div
      className={cn("absolute text-blue-400/20", className)}
      style={style}
      initial={{ y: 0, x: 0, rotate: 0 }}
      animate={{
        y: [0, 15, 0],
        x: [0, 5, 0],
        rotate: [0, 5, 0],
      }}
      transition={{
        duration: 8 + Math.random() * 10,
        repeat: Infinity,
        ease: "easeInOut",
        repeatType: "reverse" as const,
      }}
    >
      <Icon size={40} />
    </motion.div>
  );
};

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole] = useState<'admin' | 'technician'>('admin');
  const { login, loginWithGoogle, isLoading } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Floating icons configuration
  const icons = [
    { id: 1, icon: FlaskConical, x: '10%', y: '20%' },
    { id: 2, icon: Microscope, x: '85%', y: '30%' },
    { id: 3, icon: TestTube, x: '20%', y: '70%' },
    { id: 4, icon: Activity, x: '75%', y: '60%' },
    { id: 5, icon: Droplets, x: '15%', y: '50%' },
    { id: 6, icon: Pill, x: '80%', y: '15%' },
    { id: 7, icon: Syringe, x: '25%', y: '25%' },
    { id: 8, icon: HeartPulse, x: '70%', y: '70%' },
  ];
  
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


  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {icons.map(({ id, icon, x, y }) => (
          <FloatingIcon 
            key={id} 
            icon={icon}
            style={{ 
              top: y, 
              left: x,
              zIndex: 0,
              filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.05))',
              opacity: 0.7
            }} 
          />
        ))}
        
        {/* Animated gradient blobs */}
        <motion.div 
          className="absolute -top-20 -left-20 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 20, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse" as const,
          }}
        />
        <motion.div 
          className="absolute -bottom-20 -right-20 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: "reverse" as const,
            delay: 2
          }}
        />
      </div>

      {/* Left Side - Image */}
      <div className="hidden md:flex md:w-1/2 lg:w-2/5 xl:w-2/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/20"></div>
        <div className="relative w-full h-full flex items-center justify-center p-8">
          <motion.img
            src="/login.png"
            alt="Laboratory Management System"
            className="max-w-full max-h-[80vh] object-contain"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
        </div>
      </div>

      {/* Right Side - Lab Features */}
      <div className="hidden lg:flex lg:w-1/5 flex-col justify-center p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-8"
        >
          {[
            { icon: FlaskConical, text: 'Sample Tracking', color: 'text-blue-500' },
            { icon: Microscope, text: 'Analysis', color: 'text-indigo-500' },
            { icon: Activity, text: 'Reports', color: 'text-cyan-500' },
            { icon: HeartPulse, text: 'Patient Care', color: 'text-pink-500' },
          ].map((item, index) => (
            <motion.div 
              key={index}
              className="flex items-center space-x-4 p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-white/30 shadow-sm"
              whileHover={{ x: 5, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
              transition={{ duration: 0.3 }}
            >
              <div className={`p-2 rounded-lg ${item.color} bg-opacity-10`}>
                <item.icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-gray-700">{item.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <motion.div 
        className="w-full md:w-1/2 lg:w-3/5 xl:w-2/5 flex flex-col justify-center p-8 sm:p-12 relative z-10 bg-white/80 backdrop-blur-sm"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full max-w-md mx-auto">
          <motion.div 
            className="text-center mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-center mb-4">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse" as const,
                }}
              >
                <FlaskConical className="h-12 w-12 text-blue-600" />
              </motion.div>
              <h1 className="ml-3 text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                LabManager Pro
              </h1>
            </div>
            <p className="text-gray-600">Precision Diagnostics, Seamless Management</p>
          </motion.div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Sign in with</span>
            </div>
          </div>

          <Card className="bg-white shadow-md">
            <CardContent className="p-7">
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-blue-400" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10 h-12 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </motion.div>

                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-blue-400" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      className="pl-10 h-12 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <button
                    type="submit"
                    className={cn(
                      "w-full flex justify-center py-3 px-4 rounded-xl text-sm font-medium text-white",
                      "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
                      "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                      "transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl",
                      "disabled:opacity-70 disabled:cursor-not-allowed"
                    )}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      'Sign in to Dashboard'
                    )}
                  </button>
                </motion.div>
              </form>
            </CardContent>
          </Card>

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
      </motion.div>
    </div>
  );
};

export default LoginForm;