import { Content } from "@/types/content";

export function generateRecommendations(
  allContent: Content[],
  favoriteContent: Content[]
): Content[] {
  if (favoriteContent.length === 0) {
    return [];
  }

  // Get favorite genres
  const genreCounts: Record<string, number> = {};
  favoriteContent.forEach(item => {
    genreCounts[item.genre] = (genreCounts[item.genre] || 0) + 1;
  });

  const favoriteGenres = Object.keys(genreCounts)
    .sort((a, b) => genreCounts[b] - genreCounts[a]);

  // Filter unwatched content
  const favoriteIds = new Set(favoriteContent.map(item => item.id));
  const unwatchedContent = allContent.filter(item => !favoriteIds.has(item.id));

  // Score content based on:
  // 1. Genre match (higher weight for more frequently liked genres)
  // 2. High rating (8.0+)
  // 3. Recent releases
  const recommendations = unwatchedContent
    .map(item => {
      let score = 0;
      
      // Genre match score
      const genreIndex = favoriteGenres.indexOf(item.genre);
      if (genreIndex !== -1) {
        score += (favoriteGenres.length - genreIndex) * 10;
      }
      
      // High rating bonus
      if (item.rating >= 80) {
        score += 15;
      } else if (item.rating >= 70) {
        score += 10;
      }
      
      // Recent release bonus
      const currentYear = new Date().getFullYear();
      if (item.year >= currentYear - 2) {
        score += 5;
      }
      
      return { ...item, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  return recommendations;
}

export function getFavoriteGenres(favoriteContent: Content[]): string[] {
  const genreCounts: Record<string, number> = {};
  
  favoriteContent.forEach(item => {
    genreCounts[item.genre] = (genreCounts[item.genre] || 0) + 1;
  });

  return Object.keys(genreCounts)
    .sort((a, b) => genreCounts[b] - genreCounts[a]);
}
