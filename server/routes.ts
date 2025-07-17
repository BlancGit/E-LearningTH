import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, createCourseSchema, type User } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'ไม่พบ token การเข้าสู่ระบบ' });
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) {
        return res.status(403).json({ message: 'Token ไม่ถูกต้อง' });
      }
      req.user = user;
      next();
    });
  };

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create user
      const userData = {
        ...validatedData,
        password: hashedPassword,
      };
      delete userData.confirmPassword;

      const user = await storage.createUser(userData);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json({ 
        message: 'สมัครสมาชิกสำเร็จ',
        user: userWithoutPassword 
      });
    } catch (error: any) {
      if (error.issues) {
        return res.status(400).json({ 
          message: 'ข้อมูลไม่ถูกต้อง',
          errors: error.issues 
        });
      }
      res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({ message: 'บัญชีผู้ใช้ถูกระงับ' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      res.json({
        message: 'เข้าสู่ระบบสำเร็จ',
        token,
        user: userWithoutPassword
      });
    } catch (error: any) {
      if (error.issues) {
        return res.status(400).json({ 
          message: 'ข้อมูลไม่ถูกต้อง',
          errors: error.issues 
        });
      }
      res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
      }

      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
    }
  });

  // User routes
  app.get('/api/users', authenticateToken, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map((user: User) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json({ users: usersWithoutPasswords });
    } catch (error) {
      res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
    }
  });

  app.get('/api/users/:id', authenticateToken, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
      }

      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
    }
  });

  // Course routes
  app.get('/api/courses', async (req, res) => {
    try {
      const courses = await storage.getAllCourses();
      res.json({ courses });
    } catch (error) {
      res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
    }
  });

  app.get('/api/courses/teacher/:teacherId', authenticateToken, async (req, res) => {
    try {
      const teacherId = parseInt(req.params.teacherId);
      const courses = await storage.getCoursesByTeacher(teacherId);
      res.json({ courses });
    } catch (error) {
      res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
    }
  });

  app.post('/api/courses', authenticateToken, async (req: any, res) => {
    try {
      // Check if user is a teacher
      if (req.user.role !== 'TEACHER') {
        return res.status(403).json({ message: 'เฉพาะครูเท่านั้นที่สามารถสร้างหลักสูตรได้' });
      }

      const validatedData = createCourseSchema.parse(req.body);
      const courseData = {
        ...validatedData,
        teacherId: req.user.userId,
      };

      const course = await storage.createCourse(courseData);
      res.status(201).json({ 
        message: 'สร้างหลักสูตรสำเร็จ',
        course 
      });
    } catch (error: any) {
      if (error.issues) {
        return res.status(400).json({ 
          message: 'ข้อมูลไม่ถูกต้อง',
          errors: error.issues 
        });
      }
      res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
    }
  });

  app.get('/api/courses/:id', async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).json({ message: 'ไม่พบหลักสูตร' });
      }

      res.json({ course });
    } catch (error) {
      res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
    }
  });

  app.put('/api/courses/:id', authenticateToken, async (req: any, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).json({ message: 'ไม่พบหลักสูตร' });
      }

      // Check if user is the course owner or admin
      if (req.user.role !== 'TEACHER' || course.teacherId !== req.user.userId) {
        return res.status(403).json({ message: 'คุณไม่มีสิทธิ์แก้ไขหลักสูตรนี้' });
      }

      const validatedData = createCourseSchema.parse(req.body);
      const updatedCourse = await storage.updateCourse(courseId, validatedData);
      
      res.json({ 
        message: 'อัปเดตหลักสูตรสำเร็จ',
        course: updatedCourse 
      });
    } catch (error: any) {
      if (error.issues) {
        return res.status(400).json({ 
          message: 'ข้อมูลไม่ถูกต้อง',
          errors: error.issues 
        });
      }
      res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
    }
  });

  app.delete('/api/courses/:id', authenticateToken, async (req: any, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).json({ message: 'ไม่พบหลักสูตร' });
      }

      // Check if user is the course owner or admin
      if (req.user.role !== 'TEACHER' || course.teacherId !== req.user.userId) {
        return res.status(403).json({ message: 'คุณไม่มีสิทธิ์ลบหลักสูตรนี้' });
      }

      await storage.deleteCourse(courseId);
      res.json({ message: 'ลบหลักสูตรสำเร็จ' });
    } catch (error) {
      res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
