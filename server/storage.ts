import { type User, type InsertUser } from "@shared/schema";
import { prisma } from "./db";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { confirmPassword, ...userData } = insertUser;
    const user = await prisma.user.create({
      data: userData,
    });
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await prisma.user.findMany();
  }
}

export const storage = new DatabaseStorage();