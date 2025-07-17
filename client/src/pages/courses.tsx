import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Plus, BookOpen, Users, Clock, ChevronRight } from "lucide-react";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuthService } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import type { User, Course } from "@shared/schema";

// Mock data for now - will be replaced with actual API calls
const mockCourses = [
  {
    id: 1,
    title: "อ่านหนังสือแบบไหนง่ายที่สุด",
    description: "เคล็ดลับการอ่านหนังสือง่ายๆภายใน 3 นาที พื้นฐานการอ่านของเด็กๆ ด้วยหลักสูตรที่ถูกออกแบบมาจากครูชำนาญการ",
    teacherId: 1,
    teacher: { firstName: "สมศรี", lastName: "ใจดี" },
    studentCount: 25,
    duration: "3 นาที 32 วินาที",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    title: "คณิตศาสตร์พื้นฐาน",
    description: "เรียนรู้คณิตศาสตร์ง่ายๆ สำหรับเด็ก พร้อมแบบฝึกหัดที่น่าสนใจ",
    teacherId: 1,
    teacher: { firstName: "สมชาย", lastName: "รักเรียน" },
    studentCount: 42,
    duration: "15 นาที",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    title: "ศิลปะและสร้างสรรค์",
    description: "กิจกรรมศิลปะที่สนุกสนาน ช่วยพัฒนาจินตนาการของเด็ก",
    teacherId: 2,
    teacher: { firstName: "สมหญิง", lastName: "สร้างสรรค์" },
    studentCount: 18,
    duration: "20 นาที",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function Courses() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = AuthService.getUser();
    setUser(currentUser);
  }, []);

  const isTeacher = user?.role === "TEACHER";

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header onToggleSidebar={() => setSidebarOpen(true)} />
      
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 lg:ml-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isTeacher ? "จัดการหลักสูตร" : "หลักสูตรทั้งหมด"}
                </h1>
                <p className="text-gray-600 mt-2">
                  {isTeacher 
                    ? "สร้างและจัดการหลักสูตรของคุณ" 
                    : "เลือกหลักสูตรที่คุณสนใจเพื่อเริ่มเรียนรู้"
                  }
                </p>
              </div>
              
              {isTeacher && (
                <Link href="/teacher/create-course">
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    สร้างหลักสูตรใหม่
                  </Button>
                </Link>
              )}
            </div>

            {/* Stats for Teachers */}
            {isTeacher && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <BookOpen className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">หลักสูตรทั้งหมด</p>
                        <p className="text-2xl font-bold text-gray-900">3</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Users className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">นักเรียนทั้งหมด</p>
                        <p className="text-2xl font-bold text-gray-900">85</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Clock className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">เวลาเรียนรวม</p>
                        <p className="text-2xl font-bold text-gray-900">38 นาที</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCourses.map((course) => (
                <Card key={course.id} className="bg-white hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <Badge variant="secondary" className="mb-2">
                        {isTeacher ? "หลักสูตรของคุณ" : "พร้อมเรียน"}
                      </Badge>
                      {isTeacher && (
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                      {course.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {course.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{course.studentCount} คน</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{course.duration}</span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        โดย: {course.teacher.firstName} {course.teacher.lastName}
                      </div>
                      
                      <div className="pt-2">
                        <Link href={isTeacher ? `/teacher/course/${course.id}` : `/course/${course.id}`}>
                          <Button className="w-full">
                            {isTeacher ? "จัดการหลักสูตร" : "เรียนเลย"}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {mockCourses.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {isTeacher ? "ยังไม่มีหลักสูตร" : "ไม่พบหลักสูตร"}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {isTeacher 
                    ? "เริ่มต้นสร้างหลักสูตรแรกของคุณ" 
                    : "ลองค้นหาหลักสูตรอื่นดู"
                  }
                </p>
                {isTeacher && (
                  <div className="mt-6">
                    <Link href="/teacher/create-course">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        สร้างหลักสูตรใหม่
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}