// Vercel serverless function entry point
import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { insertUserSchema, loginSchema, createCourseSchema, type User } from '../shared/schema';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Database
const prisma = new PrismaClient();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Add logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      console.log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

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
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });
    
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

    const user = await prisma.user.create({
      data: userData,
    });
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    res.status(201).json({ 
      message: 'สมัครสมาชิกสำเร็จ',
      user: userWithoutPassword 
    });
  } catch (error: any) {
    console.error('Registration error:', error);
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
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });
    
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
    console.error('Login error:', error);
    if (error.issues) {
      return res.status(400).json({ 
        message: 'ข้อมูลไม่ถูกต้อง',
        errors: error.issues 
      });
    }
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// Get all courses
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
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
    res.json({ courses });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// Get course by ID
app.get('/api/courses/:id', async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const course = await prisma.course.findUnique({
      where: { id: courseId },
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
    
    if (!course) {
      return res.status(404).json({ message: 'ไม่พบหลักสูตร' });
    }

    res.json({ course });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// Create course
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

    const course = await prisma.course.create({
      data: courseData,
    });
    
    res.status(201).json({ 
      message: 'สร้างหลักสูตรสำเร็จ',
      course 
    });
  } catch (error: any) {
    console.error('Create course error:', error);
    if (error.issues) {
      return res.status(400).json({ 
        message: 'ข้อมูลไม่ถูกต้อง',
        errors: error.issues 
      });
    }
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// Get tests for a course
app.get('/api/courses/:courseId/tests', async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    const tests = await prisma.test.findMany({
      where: { courseId },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });
    res.json({ tests });
  } catch (error) {
    console.error('Get tests error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// Default handler for all other routes
app.all('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

export default app;