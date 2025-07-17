import { type User, type InsertUser, type Course, type Test, type Question, type Option, type TestScore, type CourseProgress, type CreateCourse, type CreateTest } from "@shared/schema";
import { prisma } from "./db";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Course methods
  getAllCourses(): Promise<Course[]>;
  getCoursesByTeacher(teacherId: number): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(courseData: CreateCourse & { teacherId: number }): Promise<Course>;
  updateCourse(id: number, courseData: Partial<CreateCourse>): Promise<Course>;
  deleteCourse(id: number): Promise<void>;
  
  // Test methods
  getTestsByCourse(courseId: number): Promise<Test[]>;
  getTest(id: number): Promise<Test | undefined>;
  createTest(testData: { courseId: number; type: string; passingScore?: number }): Promise<Test>;
  deleteTest(id: number): Promise<void>;
  
  // Question methods
  createQuestion(questionData: { testId: number; questionText: string }): Promise<Question>;
  getQuestionsByTest(testId: number): Promise<Question[]>;
  
  // Option methods
  createOption(optionData: { questionId: number; text: string; isCorrect: boolean }): Promise<Option>;
  getOptionsByQuestion(questionId: number): Promise<Option[]>;
  
  // Test score methods
  createTestScore(scoreData: { testId: number; userId: number; score: number }): Promise<TestScore>;
  getTestScoresByUser(userId: number): Promise<TestScore[]>;
  getTestScoresByTest(testId: number): Promise<TestScore[]>;
  getUserTestScore(testId: number, userId: number): Promise<TestScore | undefined>;
  
  // Course progress methods
  getCourseProgress(courseId: number, userId: number): Promise<CourseProgress | undefined>;
  updateCourseProgress(courseId: number, userId: number, status: string): Promise<CourseProgress>;
}

export class DatabaseStorage implements IStorage {
  // User methods
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

  // Course methods
  async getAllCourses(): Promise<Course[]> {
    return await prisma.course.findMany({
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async getCoursesByTeacher(teacherId: number): Promise<Course[]> {
    return await prisma.course.findMany({
      where: { teacherId },
    });
  }

  async getCourse(id: number): Promise<Course | undefined> {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        tests: {
          include: {
            questions: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    });
    return course || undefined;
  }

  async createCourse(courseData: CreateCourse & { teacherId: number }): Promise<Course> {
    return await prisma.course.create({
      data: courseData,
    });
  }

  async updateCourse(id: number, courseData: Partial<CreateCourse>): Promise<Course> {
    return await prisma.course.update({
      where: { id },
      data: courseData,
    });
  }

  async deleteCourse(id: number): Promise<void> {
    await prisma.course.delete({
      where: { id },
    });
  }

  // Test methods
  async getTestsByCourse(courseId: number): Promise<Test[]> {
    return await prisma.test.findMany({
      where: { courseId },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });
  }

  async createTest(testData: { courseId: number; type: string; passingScore?: number }): Promise<Test> {
    return await prisma.test.create({
      data: testData,
    });
  }

  async deleteTest(id: number): Promise<void> {
    await prisma.test.delete({
      where: { id },
    });
  }

  async getTest(id: number): Promise<Test | undefined> {
    const test = await prisma.test.findUnique({
      where: { id },
      include: {
        course: true,
      },
    });
    return test || undefined;
  }

  // Question methods
  async createQuestion(questionData: { testId: number; questionText: string }): Promise<Question> {
    return await prisma.question.create({
      data: questionData,
    });
  }

  async getQuestionsByTest(testId: number): Promise<Question[]> {
    return await prisma.question.findMany({
      where: { testId },
      include: {
        options: true,
      },
    });
  }

  // Option methods
  async createOption(optionData: { questionId: number; text: string; isCorrect: boolean }): Promise<Option> {
    return await prisma.option.create({
      data: optionData,
    });
  }

  async getOptionsByQuestion(questionId: number): Promise<Option[]> {
    return await prisma.option.findMany({
      where: { questionId },
    });
  }

  // Test score methods
  async createTestScore(scoreData: { testId: number; userId: number; score: number }): Promise<TestScore> {
    return await prisma.testScore.upsert({
      where: {
        testId_userId: {
          testId: scoreData.testId,
          userId: scoreData.userId,
        },
      },
      update: {
        score: scoreData.score,
        takenAt: new Date(),
      },
      create: scoreData,
    });
  }

  async getTestScoresByUser(userId: number): Promise<TestScore[]> {
    return await prisma.testScore.findMany({
      where: { userId },
      include: {
        test: {
          include: {
            course: true,
          },
        },
      },
    });
  }

  async getTestScoresByTest(testId: number): Promise<TestScore[]> {
    return await prisma.testScore.findMany({
      where: { testId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async getUserTestScore(testId: number, userId: number): Promise<TestScore | undefined> {
    const score = await prisma.testScore.findUnique({
      where: {
        testId_userId: {
          testId,
          userId,
        },
      },
    });
    return score || undefined;
  }

  // Course progress methods
  async getCourseProgress(courseId: number, userId: number): Promise<CourseProgress | undefined> {
    const progress = await prisma.courseProgress.findUnique({
      where: {
        courseId_userId: {
          courseId,
          userId,
        },
      },
    });
    return progress || undefined;
  }

  async updateCourseProgress(courseId: number, userId: number, status: string): Promise<CourseProgress> {
    return await prisma.courseProgress.upsert({
      where: {
        courseId_userId: {
          courseId,
          userId,
        },
      },
      update: {
        status,
        updatedAt: new Date(),
      },
      create: {
        courseId,
        userId,
        status,
      },
    });
  }
}

export const storage = new DatabaseStorage();