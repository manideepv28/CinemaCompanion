import { Star, Heart, X, User, Music } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Content } from "@/types/content";
import { getCurrentUser, updateUserFavorites } from "@/lib/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ContentModalProps {
  content: Content | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ContentModal({ content, isOpen, onClose }: ContentModalProps) {
  const currentUser = getCurrentUser();
  const queryClient = useQueryClient();
  
  if (!content) return null;
  
  const isFavorite = currentUser?.favorites?.includes(content.id) || false;

  const favoriteMutation = useMutation({
    mutationFn: async (favorites: number[]) => {
      if (!currentUser) return;
      
      updateUserFavorites(favorites);
      const response = await apiRequest("POST", `/api/users/${currentUser.id}/favorites`, {
        favorites
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
    },
  });

  const toggleFavorite = () => {
    if (!currentUser) return;

    const currentFavorites = currentUser.favorites || [];
    const newFavorites = isFavorite
      ? currentFavorites.filter(id => id !== content.id)
      : [...currentFavorites, content.id];

    favoriteMutation.mutate(newFavorites);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700 text-slate-100 p-0">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-slate-400 hover:text-white bg-black/50 hover:bg-black/70"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <img 
            src={content.image} 
            alt={content.title}
            className="w-full h-64 object-cover"
          />
          
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">{content.title}</h2>
                <div className="flex items-center space-x-4 text-slate-400">
                  <Badge 
                    variant="secondary" 
                    className="bg-slate-700 text-slate-300 uppercase text-xs"
                  >
                    {content.type}
                  </Badge>
                  <span>{content.year}</span>
                  <span>{content.duration}</span>
                  <span className="flex items-center">
                    <Star className="h-4 w-4 text-accent mr-1 fill-current" />
                    {(content.rating / 10).toFixed(1)}
                  </span>
                </div>
              </div>
              
              {currentUser && (
                <Button
                  variant="outline"
                  onClick={toggleFavorite}
                  className={`bg-slate-700 border-slate-600 hover:bg-slate-600 ${
                    isFavorite ? 'text-accent border-accent' : 'text-slate-400'
                  }`}
                  disabled={favoriteMutation.isPending}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </Button>
              )}
            </div>
            
            <div className="mb-4">
              <Badge className="bg-primary text-primary-foreground">
                {content.genre}
              </Badge>
            </div>
            
            <p className="text-slate-300 mb-6 leading-relaxed">
              {content.description}
            </p>
            
            <div className="space-y-4">
              {content.director && (
                <div className="border-t border-slate-700 pt-4">
                  <div className="flex items-center mb-2">
                    <User className="h-4 w-4 text-slate-400 mr-2" />
                    <h4 className="text-sm font-medium text-slate-400">Director</h4>
                  </div>
                  <p className="text-slate-300">{content.director}</p>
                </div>
              )}
              
              {content.artist && (
                <div className="border-t border-slate-700 pt-4">
                  <div className="flex items-center mb-2">
                    <Music className="h-4 w-4 text-slate-400 mr-2" />
                    <h4 className="text-sm font-medium text-slate-400">Artist</h4>
                  </div>
                  <p className="text-slate-300">{content.artist}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
