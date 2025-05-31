import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { FiltersSidebar } from "@/components/filters-sidebar";
import { ContentCard } from "@/components/content-card";
import { ContentModal } from "@/components/content-modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Content, FilterOptions, SortOption } from "@/types/content";
import { getCurrentUser } from "@/lib/auth";
import { generateRecommendations } from "@/lib/recommendations";
import { AlertCircle, Film, Music } from "lucide-react";

const sortOptions: SortOption[] = [
  { value: 'title', label: 'Sort by Title' },
  { value: 'year', label: 'Sort by Year' },
  { value: 'rating', label: 'Sort by Rating' },
];

export default function Home() {
  const [filters, setFilters] = useState<FilterOptions>({
    contentType: 'all',
    genre: '',
    year: '',
    rating: '',
    search: '',
  });
  const [sortBy, setSortBy] = useState<SortOption['value']>('title');
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  const currentUser = getCurrentUser();

  // Fetch all content
  const { data: allContent = [], isLoading: isLoadingContent, error: contentError } = useQuery<Content[]>({
    queryKey: ['/api/content'],
  });

  // Fetch documentaries from IMDB
  const { data: documentariesResponse, isLoading: isLoadingDocs, error: docsError } = useQuery({
    queryKey: ['/api/documentaries'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch recommendations
  const { data: recommendations = [] } = useQuery<Content[]>({
    queryKey: ['/api/recommendations', currentUser?.id],
    enabled: !!currentUser,
  });

  // Combine content and filter
  const filteredContent = useMemo(() => {
    let content = allContent;

    // Show favorites only if requested
    if (showFavoritesOnly && currentUser) {
      content = content.filter(item => currentUser.favorites?.includes(item.id));
    }

    // Apply filters
    content = content.filter(item => {
      const matchesSearch = !filters.search || 
        item.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.description.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesType = filters.contentType === 'all' || item.type === filters.contentType;
      const matchesGenre = !filters.genre || item.genre === filters.genre;
      const matchesYear = !filters.year || item.year.toString() === filters.year;
      const matchesRating = !filters.rating || item.rating >= parseInt(filters.rating);

      return matchesSearch && matchesType && matchesGenre && matchesYear && matchesRating;
    });

    // Apply sorting
    content.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'year':
          return b.year - a.year;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    return content;
  }, [allContent, filters, sortBy, showFavoritesOnly, currentUser]);

  // Generate user-specific recommendations
  const userRecommendations = useMemo(() => {
    if (!currentUser || !currentUser.favorites || currentUser.favorites.length === 0) {
      return [];
    }

    const favoriteContent = allContent.filter(item => currentUser.favorites?.includes(item.id));
    return generateRecommendations(allContent, favoriteContent);
  }, [allContent, currentUser]);

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, search: query }));
  };

  const handleShowFavorites = () => {
    setShowFavoritesOnly(!showFavoritesOnly);
  };

  const isLoading = isLoadingContent || isLoadingDocs;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      <Header onSearch={handleSearch} onShowFavorites={handleShowFavorites} />
      
      <div className="flex">
        <FiltersSidebar filters={filters} onFiltersChange={setFilters} />
        
        <main className="flex-1 p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            {currentUser ? (
              <>
                <h2 className="text-3xl font-bold mb-2">
                  Welcome back, {currentUser.username}!
                </h2>
                <p className="text-slate-400">
                  Continue exploring amazing documentaries and music
                </p>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold mb-2">Discover Amazing Content</h2>
                <p className="text-slate-400">
                  Explore documentaries and music curated just for you
                </p>
              </>
            )}
          </div>

          {/* Error Messages */}
          {contentError && (
            <Alert className="mb-6 bg-red-900/20 border-red-900">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load content. Please try again later.
              </AlertDescription>
            </Alert>
          )}

          {docsError && (
            <Alert className="mb-6 bg-yellow-900/20 border-yellow-900">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                IMDB API is currently unavailable. Showing fallback documentary content.
              </AlertDescription>
            </Alert>
          )}

          {/* User Recommendations */}
          {currentUser && userRecommendations.length > 0 && !showFavoritesOnly && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Recommended for You</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {userRecommendations.slice(0, 4).map(content => (
                  <ContentCard
                    key={content.id}
                    content={content}
                    onSelect={setSelectedContent}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Content Grid Header */}
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-semibold">
              {showFavoritesOnly ? 'Your Favorites' : 'Browse Content'}
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-slate-400">
                {isLoading ? 'Loading...' : `${filteredContent.length} items`}
              </span>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption['value'])}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100 w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600 text-slate-100">
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-slate-800 rounded-lg overflow-hidden">
                  <Skeleton className="w-full h-48 bg-slate-700" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-6 bg-slate-700" />
                    <Skeleton className="h-4 bg-slate-700 w-3/4" />
                    <Skeleton className="h-4 bg-slate-700 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Content Grid */}
          {!isLoading && filteredContent.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredContent.map(content => (
                <ContentCard
                  key={content.id}
                  content={content}
                  onSelect={setSelectedContent}
                />
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && filteredContent.length === 0 && (
            <div className="text-center py-12">
              {showFavoritesOnly ? (
                <>
                  <Heart className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">No favorites yet!</p>
                  <p className="text-slate-500">Start exploring and save your favorite content.</p>
                </>
              ) : (
                <>
                  <div className="flex justify-center space-x-4 mb-4">
                    <Film className="h-16 w-16 text-slate-400" />
                    <Music className="h-16 w-16 text-slate-400" />
                  </div>
                  <p className="text-slate-400 text-lg">No content found</p>
                  <p className="text-slate-500">Try adjusting your filters or search terms.</p>
                </>
              )}
            </div>
          )}
        </main>
      </div>

      <ContentModal
        content={selectedContent}
        isOpen={!!selectedContent}
        onClose={() => setSelectedContent(null)}
      />
    </div>
  );
}
