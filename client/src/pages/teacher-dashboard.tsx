import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Plus, BookOpen, Users, BarChart3, FileText, Settings, Eye } from "lucide-react";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuthService } from "@/lib/auth";
import type { User } from "@shared/schema";

// Mock data for teacher dashboard
const dashboardData = {
  totalCourses: 3,
  totalStudents: 85,
  totalTests: 6,
  averageScore: 78,
  recentCourses: [
    {
      id: 1,
      title: "อ่านหนังสือแบบไหนง่ายที่สุด",
      studentCount: 25,
      completionRate: 92,
      averageScore: 85,
      lastUpdate: "2 วันที่แล้ว",
    },
    {
      id: 2,
      title: "คณิตศาสตร์พื้นฐาน",
      studentCount: 42,
      completionRate: 78,
      averageScore: 72,
      lastUpdate: "5 วันที่แล้ว",
    },
    {
      id: 3,
      title: "ศิลปะและสร้างสรรค์",
      studentCount: 18,
      completionRate: 100,
      averageScore: 88,
      lastUpdate: "1 สัปดาห์ที่แล้ว",
    },
  ],
  recentActivity: [
    { action: "นักเรียนใหม่ลงทะเบียนในหลักสูตร \"อ่านหนังสือแบบไหนง่ายที่สุด\"", time: "30 นาทีที่แล้ว" },
    { action: "นักเรียน 5 คนสำเร็จการสอบ Post-test ในหลักสูตร \"คณิตศาสตร์พื้นฐาน\"", time: "2 ชั่วโมงที่แล้ว" },
    { action: "ได้รับผลงานใหม่จากนักเรียนในหลักสูตร \"ศิลปะและสร้างสรรค์\"", time: "1 วันที่แล้ว" },
  ],
};

export default function TeacherDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = AuthService.getUser();
    setUser(currentUser);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header onToggleSidebar={() => setSidebarOpen(true)} />
      
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 lg:ml-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                สวัสดี, {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-gray-600 mt-2">
                ภาพรวมการสอนและผลการเรียนของนักเรียน
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Link href="/teacher/create-course">
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed border-2 border-primary/50 hover:border-primary">
                  <CardContent className="p-6 text-center">
                    <Plus className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="font-medium text-primary">สร้างหลักสูตรใหม่</p>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/courses">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="font-medium text-gray-700">จัดการหลักสูตร</p>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/teacher/students">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="font-medium text-gray-700">จัดการนักเรียน</p>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/teacher/analytics">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="font-medium text-gray-700">รายงานผลการเรียน</p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <BookOpen className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">หลักสูตรทั้งหมด</p>
                      <p className="text-2xl font-bold text-gray-900">{dashboardData.totalCourses}</p>
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
                      <p className="text-2xl font-bold text-gray-900">{dashboardData.totalStudents}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">แบบทดสอบทั้งหมด</p>
                      <p className="text-2xl font-bold text-gray-900">{dashboardData.totalTests}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">คะแนนเฉลี่ย</p>
                      <p className="text-2xl font-bold text-gray-900">{dashboardData.averageScore}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Courses */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>หลักสูตรล่าสุด</span>
                    <Link href="/courses">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        ดูทั้งหมด
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.recentCourses.map((course) => (
                      <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{course.title}</h4>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <span>{course.studentCount} นักเรียน</span>
                            <span>อัตราผ่าน {course.completionRate}%</span>
                            <span>คะแนนเฉลี่ย {course.averageScore}%</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">อัปเดตล่าสุด: {course.lastUpdate}</p>
                        </div>
                        <Link href={`/teacher/course/${course.id}`}>
                          <Button variant="outline" size="sm">
                            จัดการ
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>กิจกรรมล่าสุด</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 border-l-4 border-primary/20 bg-gray-50 rounded-r-lg">
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.action}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}