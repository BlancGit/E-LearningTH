import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Search } from "lucide-react";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import CourseCard from "@/components/course-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthService } from "@/lib/auth";
import type { User } from "@shared/schema";

const courses = [
  {
    id: 1,
    title: "อ่านหนังสือแบบไหนง่ายที่สุด",
    description: "เคล็ดลับการอ่านหนังสือง่ายๆภายใน 3 นาที",
    duration: "3 นาที 32 วินาที",
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
  },
  {
    id: 2,
    title: "อ่านหนังสือแบบไหนง่ายที่สุด",
    description: "เคล็ดลับการอ่านหนังสือง่ายๆภายใน 3 นาที",
    duration: "3 นาที 32 วินาที",
    imageUrl: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
  },
  {
    id: 3,
    title: "อ่านหนังสือแบบไหนง่ายที่สุด",
    description: "เคล็ดลับการอ่านหนังสือง่ายๆภายใน 3 นาที",
    duration: "3 นาที 32 วินาที",
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
  },
];

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const currentUser = AuthService.getUser();
    setUser(currentUser);
    
    // Redirect based on user role
    if (currentUser?.role === "TEACHER") {
      setLocation("/teacher/dashboard");
    } else if (currentUser?.role === "STUDENT") {
      setLocation("/courses");
    }
  }, [setLocation]);

  const handleCourseEnroll = (courseId: number) => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }
    // Handle course enrollment
    console.log('Enrolling in course:', courseId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header onToggleSidebar={() => setSidebarOpen(true)} />
      
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 lg:ml-0">
          {/* Search Bar (Mobile) */}
          <div className="md:hidden p-4 bg-white border-b border-gray-200">
            <div className="relative">
              <Input
                type="text"
                placeholder="ค้นหาหลักสูตร..."
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </div>

          {/* Hero Section */}
          <div className="bg-gradient-to-r from-primary to-primary/80 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
              <div className="text-center">
                <h1 className="text-3xl lg:text-5xl font-bold mb-4">เรียนรู้ได้ทุกที่ ทุกเวลา</h1>
                <p className="text-xl lg:text-2xl text-primary-foreground/80 mb-8">
                  แพลตฟอร์มการเรียนรู้ออนไลน์ที่ดีที่สุดสำหรับคุณ
                </p>
                <Button size="lg" variant="secondary" className="text-primary">
                  เริ่มเรียนเลย
                </Button>
              </div>
            </div>
          </div>

          {/* Course Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">การอ่าน</h2>
              <p className="text-lg text-gray-600">
                พื้นฐานการอ่านของเด็กๆ ด้วยหลักสูตรที่ถูกออกแบบมาจากครูชำนาญการ
              </p>
            </div>

            {/* Course Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  title={course.title}
                  description={course.description}
                  duration={course.duration}
                  imageUrl={course.imageUrl}
                  onEnroll={() => handleCourseEnroll(course.id)}
                />
              ))}
            </div>

            {/* Additional Sections */}
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">หลักสูตรแนะนำ</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-xl">📊</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">คณิตศาสตร์พื้นฐาน</h3>
                      <p className="text-gray-600">เรียนรู้คณิตศาสตร์ง่ายๆ</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    หลักสูตรคณิตศาสตร์สำหรับเด็ก พร้อมแบบฝึกหัดที่น่าสนใจ
                  </p>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    เรียนเลย
                  </Button>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 text-xl">🎨</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">ศิลปะและสร้างสรรค์</h3>
                      <p className="text-gray-600">พัฒนาความคิดสร้างสรรค์</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    กิจกรรมศิลปะที่สนุกสนาน ช่วยพัฒนาจินตนาการของเด็ก
                  </p>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    เรียนเลย
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
