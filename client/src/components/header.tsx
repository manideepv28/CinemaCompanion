import { useState } from "react";
import { Link } from "wouter";
import { Search, Film, Heart, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthModal } from "./auth-modal";
import { getCurrentUser, clearCurrentUser } from "@/lib/auth";

interface HeaderProps {
  onSearch: (query: string) => void;
  onShowFavorites: () => void;
}

export function Header({ onSearch, onShowFavorites }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const currentUser = getCurrentUser();

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleLogout = () => {
    clearCurrentUser();
    window.location.reload();
  };

  const openLogin = () => {
    setIsLoginMode(true);
    setShowAuthModal(true);
  };

  const openSignup = () => {
    setIsLoginMode(false);
    setShowAuthModal(true);
  };

  return (
    <>
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <Film className="text-primary text-2xl" />
              <h1 className="text-2xl font-bold text-white">DocuStream</h1>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8 hidden md:block">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search documentaries, music..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 pl-10"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <>
                  <span className="text-slate-300 hidden sm:block">
                    Welcome, {currentUser.username}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onShowFavorites}
                    className="text-accent hover:text-yellow-300 hover:bg-slate-700"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="bg-slate-700 border-slate-600 hover:bg-slate-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={openLogin}
                    className="bg-primary hover:bg-blue-600"
                  >
                    Login
                  </Button>
                  <Button
                    variant="outline"
                    onClick={openSignup}
                    className="bg-slate-700 border-slate-600 hover:bg-slate-600"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        isLoginMode={isLoginMode}
        onToggleMode={() => setIsLoginMode(!isLoginMode)}
      />
    </>
  );
}
