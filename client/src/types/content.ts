export interface Content {
  id: number;
  title: string;
  type: 'documentary' | 'music';
  genre: string;
  year: number;
  rating: number; // scaled by 10 (8.5 -> 85)
  duration: string;
  description: string;
  image: string;
  director?: string;
  artist?: string;
  imdbId?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  favorites: number[];
}

export interface FilterOptions {
  contentType: 'all' | 'documentary' | 'music';
  genre: string;
  year: string;
  rating: string;
  search: string;
}

export interface SortOption {
  value: 'title' | 'year' | 'rating';
  label: string;
}
