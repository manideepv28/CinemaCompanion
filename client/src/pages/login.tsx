import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Film } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { setCurrentUser, getCurrentUser } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";

export default function Login() {
  const [, setLocation] = useLocation();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setLocation("/");
    }
  }, [setLocation]);

  const authMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; username?: string }) => {
      const endpoint = isLoginMode ? "/api/auth/login" : "/api/auth/register";
      const response = await apiRequest("POST", endpoint, data);
      return response.json();
    },
    onSuccess: (user) => {
      setCurrentUser(user);
      toast({
        title: isLoginMode ? "Welcome back!" : "Account created!",
        description: isLoginMode 
          ? "You have successfully logged in."
          : "Your account has been created and you are now logged in.",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Authentication failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!isLoginMode && !username) {
      toast({
        title: "Missing username",
        description: "Please provide a username for registration.",
        variant: "destructive",
      });
      return;
    }

    authMutation.mutate({
      email,
      password,
      ...(isLoginMode ? {} : { username }),
    });
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setUsername("");
  };

  const handleToggleMode = () => {
    resetForm();
    setIsLoginMode(!isLoginMode);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <Film className="text-primary text-3xl" />
          <h1 className="text-3xl font-bold text-white">DocuStream</h1>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-center">
              {isLoginMode ? "Welcome Back" : "Create Account"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLoginMode && (
                <div>
                  <Label htmlFor="username" className="text-slate-300">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-slate-100"
                    required={!isLoginMode}
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-slate-100"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-slate-100"
                  required
                />
              </div>
              
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-blue-600"
                disabled={authMutation.isPending}
              >
                {authMutation.isPending 
                  ? (isLoginMode ? "Logging in..." : "Creating account...")
                  : (isLoginMode ? "Login" : "Sign Up")
                }
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-slate-400">
                {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={handleToggleMode}
                  className="text-primary hover:text-blue-400 font-medium"
                >
                  {isLoginMode ? "Sign up" : "Login"}
                </button>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                onClick={() => setLocation("/")}
                className="text-slate-400 hover:text-slate-300"
              >
                Continue as guest
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
