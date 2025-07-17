import { z } from "zod";

// Prisma types
export interface User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: number;
  title: string;
  description: string | null;
  teacherId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Test {
  id: number;
  courseId: number;
  type: string;
  passingScore: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: number;
  testId: number;
  questionText: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Option {
  id: number;
  questionId: number;
  text: string;
  isCorrect: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestScore {
  id: number;
  testId: number;
  userId: number;
  score: number;
  takenAt: Date;
}

export interface CourseProgress {
  id: number;
  courseId: number;
  userId: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export const insertUserSchema = z.object({
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  firstName: z.string().min(1, "กรุณากรอกชื่อจริง"),
  lastName: z.string().min(1, "กรุณากรอกนามสกุล"),
  role: z.enum(["STUDENT", "TEACHER"]).default("STUDENT"),
  confirmPassword: z.string().optional(),
}).refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

export const createCourseSchema = z.object({
  title: z.string().min(1, "กรุณากรอกชื่อหลักสูตร"),
  description: z.string().optional(),
});

export const createQuestionSchema = z.object({
  questionText: z.string().min(1, "กรุณากรอกคำถาม"),
  options: z.array(z.object({
    text: z.string().min(1, "กรุณากรอกตัวเลือก"),
    isCorrect: z.boolean(),
  })).min(2, "ต้องมีตัวเลือกอย่างน้อย 2 ตัว").max(5, "ตัวเลือกได้สูงสุด 5 ตัว"),
});

export const createTestSchema = z.object({
  type: z.enum(["pre", "post"]),
  passingScore: z.number().min(0).max(100).optional(),
  questions: z.array(createQuestionSchema).min(1, "ต้องมีคำถามอย่างน้อย 1 ข้อ"),
});

export const submitTestSchema = z.object({
  answers: z.array(z.object({
    questionId: z.number(),
    selectedOptionId: z.number(),
  })),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type CreateCourse = z.infer<typeof createCourseSchema>;
export type CreateQuestion = z.infer<typeof createQuestionSchema>;
export type CreateTest = z.infer<typeof createTestSchema>;
export type SubmitTest = z.infer<typeof submitTestSchema>;
