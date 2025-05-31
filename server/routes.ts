import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertContentSchema } from "@shared/schema";
import { z } from "zod";

const IMDB_API_KEY = process.env.IMDB_API_KEY || process.env.VITE_IMDB_API_KEY || "";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Login failed" });
    }
  });

  // User favorites
  app.post("/api/users/:userId/favorites", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { favorites } = req.body;
      
      const user = await storage.updateUserFavorites(userId, favorites);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Failed to update favorites" });
    }
  });

  // Content routes
  app.get("/api/content", async (req, res) => {
    try {
      const { type, search } = req.query;
      
      let content;
      if (search) {
        content = await storage.searchContent(search as string);
      } else if (type && type !== 'all') {
        content = await storage.getContentByType(type as string);
      } else {
        content = await storage.getAllContent();
      }
      
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  app.get("/api/content/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contentItem = await storage.getContentById(id);
      
      if (!contentItem) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      res.json(contentItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  // IMDB documentaries endpoint
  app.get("/api/documentaries", async (req, res) => {
    try {
      // First check if we have documentaries in storage
      const existingDocs = await storage.getContentByType('documentary');
      
      if (existingDocs.length > 0) {
        return res.json(existingDocs);
      }

      // If no API key, return empty array with error message
      if (!IMDB_API_KEY) {
        return res.status(500).json({ 
          message: "IMDB API key not configured. Please add IMDB_API_KEY to environment variables.",
          content: []
        });
      }

      // Fetch from IMDB API (using a search for documentaries)
      const imdbResponse = await fetch(
        `https://imdb-api.com/en/API/AdvancedSearch/${IMDB_API_KEY}?title_type=documentary&num_votes=1000,&sort=user_rating,desc&count=20`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      if (!imdbResponse.ok) {
        throw new Error(`IMDB API error: ${imdbResponse.status}`);
      }

      const imdbData = await imdbResponse.json();
      
      if (imdbData.errorMessage) {
        throw new Error(imdbData.errorMessage);
      }

      // Transform IMDB data to our content format
      const documentaries = imdbData.results?.map((movie: any) => ({
        title: movie.title,
        type: "documentary",
        genre: movie.genres?.split(',')[0]?.trim() || "Documentary",
        year: parseInt(movie.year) || 2020,
        rating: Math.round(parseFloat(movie.imDbRating) * 10) || 70,
        duration: `${movie.runtimeMins || 90} min`,
        description: movie.plot || "An engaging documentary exploring important themes and stories.",
        image: movie.image || "https://images.unsplash.com/photo-1489599363582-b8c104a3e1be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        director: movie.directors || "Unknown Director",
        imdbId: movie.id
      })) || [];

      // Store documentaries in our storage
      const storedDocs = [];
      for (const doc of documentaries) {
        try {
          const stored = await storage.createContent(doc);
          storedDocs.push(stored);
        } catch (error) {
          console.error("Error storing documentary:", error);
        }
      }

      res.json(storedDocs);
    } catch (error) {
      console.error("IMDB API error:", error);
      
      // Return fallback documentary data
      const fallbackDocs = [
        {
          title: "Free Solo",
          type: "documentary",
          genre: "Sports",
          year: 2018,
          rating: 82,
          duration: "100 min",
          description: "Follow rock climber Alex Honnold as he prepares to achieve his lifelong dream: climbing the face of the world's most famous rock formation, El Capitan in Yosemite National Park, without a rope.",
          image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          director: "Jimmy Chin, Elizabeth Chai Vasarhelyi"
        },
        {
          title: "Won't You Be My Neighbor?",
          type: "documentary",
          genre: "Biography", 
          year: 2018,
          rating: 84,
          duration: "94 min",
          description: "An exploration of the life, lessons, and legacy of iconic children's television host Fred Rogers.",
          image: "https://images.unsplash.com/photo-1607706189992-eae578626c86?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          director: "Morgan Neville"
        }
      ];

      const storedFallbacks = [];
      for (const doc of fallbackDocs) {
        try {
          const stored = await storage.createContent(doc);
          storedFallbacks.push(stored);
        } catch (error) {
          console.error("Error storing fallback documentary:", error);
        }
      }

      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to fetch documentaries from IMDB API",
        content: storedFallbacks
      });
    }
  });

  // Recommendations endpoint
  app.get("/api/recommendations/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const allContent = await storage.getAllContent();
      const favoriteContent = allContent.filter(item => user.favorites?.includes(item.id));
      
      if (favoriteContent.length === 0) {
        return res.json([]);
      }

      // Generate recommendations based on favorite genres and high ratings
      const favoriteGenres = [...new Set(favoriteContent.map(item => item.genre))];
      const unwatchedContent = allContent.filter(item => !user.favorites?.includes(item.id));
      
      const recommendations = unwatchedContent
        .filter(item => 
          favoriteGenres.includes(item.genre) || item.rating >= 80
        )
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 8);

      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
