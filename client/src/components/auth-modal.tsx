import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { setCurrentUser } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoginMode: boolean;
  onToggleMode: () => void;
}

export function AuthModal({ isOpen, onClose, isLoginMode, onToggleMode }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const authMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; username?: string }) => {
      const endpoint = isLoginMode ? "/api/auth/login" : "/api/auth/register";
      const response = await apiRequest("POST", endpoint, data);
      return response.json();
    },
    onSuccess: (user) => {
      setCurrentUser(user);
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
      toast({
        title: isLoginMode ? "Welcome back!" : "Account created!",
        description: isLoginMode 
          ? "You have successfully logged in."
          : "Your account has been created and you are now logged in.",
      });
      onClose();
      // Refresh the page to update the UI
      window.location.reload();
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
    onToggleMode();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isLoginMode ? "Login" : "Sign Up"}
          </DialogTitle>
        </DialogHeader>
        
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
        
        <p className="text-center text-slate-400">
          {isLoginMode ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={handleToggleMode}
            className="text-primary hover:text-blue-400"
          >
            {isLoginMode ? "Sign up" : "Login"}
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
}
