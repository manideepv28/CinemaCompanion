import { users, content, type User, type InsertUser, type Content, type InsertContent } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserFavorites(userId: number, favorites: number[]): Promise<User | undefined>;
  
  // Content operations
  getAllContent(): Promise<Content[]>;
  getContentById(id: number): Promise<Content | undefined>;
  createContent(content: InsertContent): Promise<Content>;
  getContentByType(type: string): Promise<Content[]>;
  searchContent(query: string): Promise<Content[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private content: Map<number, Content>;
  private currentUserId: number;
  private currentContentId: number;

  constructor() {
    this.users = new Map();
    this.content = new Map();
    this.currentUserId = 1;
    this.currentContentId = 1;
    
    // Initialize with some music content
    this.initializeContent();
  }

  private initializeContent() {
    const musicContent: InsertContent[] = [
      {
        title: "Beethoven's Symphony Collection",
        type: "music",
        genre: "Classical",
        year: 2021,
        rating: 92,
        duration: "180 min",
        description: "Complete collection of Beethoven's symphonies performed by the Vienna Philharmonic Orchestra.",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        artist: "Ludwig van Beethoven"
      },
      {
        title: "Jazz at Lincoln Center",
        type: "music", 
        genre: "Jazz",
        year: 2022,
        rating: 87,
        duration: "120 min",
        description: "Live jazz performances featuring contemporary artists and classic compositions.",
        image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        artist: "Various Artists"
      },
      {
        title: "Miles Davis: Kind of Blue Sessions",
        type: "music",
        genre: "Jazz", 
        year: 2020,
        rating: 95,
        duration: "75 min",
        description: "Rare recordings and outtakes from the legendary Kind of Blue sessions.",
        image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        artist: "Miles Davis"
      },
      {
        title: "World Music Anthology",
        type: "music",
        genre: "World",
        year: 2023,
        rating: 83,
        duration: "240 min",
        description: "A journey through traditional and contemporary music from around the globe.",
        image: "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        artist: "Various Artists"
      }
    ];

    musicContent.forEach(content => {
      this.createContent(content);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      favorites: []
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserFavorites(userId: number, favorites: number[]): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (user) {
      user.favorites = favorites;
      this.users.set(userId, user);
      return user;
    }
    return undefined;
  }

  async getAllContent(): Promise<Content[]> {
    return Array.from(this.content.values());
  }

  async getContentById(id: number): Promise<Content | undefined> {
    return this.content.get(id);
  }

  async createContent(insertContent: InsertContent): Promise<Content> {
    const id = this.currentContentId++;
    const contentItem: Content = { ...insertContent, id };
    this.content.set(id, contentItem);
    return contentItem;
  }

  async getContentByType(type: string): Promise<Content[]> {
    return Array.from(this.content.values()).filter(item => item.type === type);
  }

  async searchContent(query: string): Promise<Content[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.content.values()).filter(item => 
      item.title.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.genre.toLowerCase().includes(lowerQuery)
    );
  }
}

export const storage = new MemStorage();
