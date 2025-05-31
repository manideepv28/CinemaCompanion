import { Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Content } from "@/types/content";
import { getCurrentUser, updateUserFavorites } from "@/lib/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ContentCardProps {
  content: Content;
  onSelect: (content: Content) => void;
}

export function ContentCard({ content, onSelect }: ContentCardProps) {
  const currentUser = getCurrentUser();
  const queryClient = useQueryClient();
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

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!currentUser) {
      return;
    }

    const currentFavorites = currentUser.favorites || [];
    const newFavorites = isFavorite
      ? currentFavorites.filter(id => id !== content.id)
      : [...currentFavorites, content.id];

    favoriteMutation.mutate(newFavorites);
  };

  return (
    <div 
      className="bg-slate-800 rounded-lg overflow-hidden hover:bg-slate-700 transition-all duration-300 cursor-pointer"
      onClick={() => onSelect(content)}
    >
      <img 
        src={content.image} 
        alt={content.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg leading-tight">{content.title}</h3>
          {currentUser && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFavorite}
              className={`p-1 h-auto ${
                isFavorite 
                  ? 'text-accent hover:text-yellow-300' 
                  : 'text-slate-400 hover:text-accent'
              }`}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-slate-400 mb-2">
          <Badge variant="secondary" className="bg-slate-700 text-slate-300 uppercase text-xs">
            {content.type}
          </Badge>
          <span>{content.year}</span>
          <span>•</span>
          <span className="flex items-center">
            <Star className="h-3 w-3 text-accent mr-1 fill-current" />
            {(content.rating / 10).toFixed(1)}
          </span>
        </div>
        
        <p className="text-slate-400 text-sm line-clamp-2 mb-3">
          {content.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">{content.duration}</span>
          <Badge className="bg-primary text-primary-foreground">
            {content.genre}
          </Badge>
        </div>
      </div>
    </div>
  );
}
