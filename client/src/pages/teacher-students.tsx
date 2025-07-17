import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Users, Search, Filter, Eye, Mail, Download } from "lucide-react";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { AuthService } from "@/lib/auth";

export default function TeacherStudents() {
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");

  const user = AuthService.getUser();

  const { data: courses } = useQuery({
    queryKey: ["teacher-courses", user?.id],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/courses/teacher/${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch courses");
      const data = await response.json();
      return data.courses;
    },
    enabled: !!user?.id,
  });

  // Mock student data - in real app, this would come from API
  const mockStudents = [
    {
      id: 1,
      firstName: "สมศรี",
      lastName: "ใจดี",
      email: "somsri@example.com",
      courseTitle: "อ่านหนังสือแบบไหนง่ายที่สุด",
      progress: "สำเร็จแล้ว",
      preTestScore: 65,
      postTestScore: 88,
      enrolledDate: "2024-01-15",
      lastActive: "2024-01-20",
    },
    {
      id: 2,
      firstName: "สมชาย",
      lastName: "รักเรียน",
      email: "somchai@example.com",
      courseTitle: "คณิตศาสตร์พื้นฐาน",
      progress: "in progress",
      preTestScore: 72,
      postTestScore: null,
      enrolledDate: "2024-01-18",
      lastActive: "2024-01-22",
    },
    {
      id: 3,
      firstName: "สมหญิง",
      lastName: "สร้างสรรค์",
      email: "somying@example.com",
      courseTitle: "ศิลปะและสร้างสรรค์",
      progress: "not started",
      preTestScore: null,
      postTestScore: null,
      enrolledDate: "2024-01-20",
      lastActive: "2024-01-20",
    },
  ];

  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === "all" || student.courseTitle === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const getProgressBadge = (progress: string) => {
    switch (progress) {
      case "สำเร็จแล้ว":
        return <Badge className="bg-green-100 text-green-800">สำเร็จแล้ว</Badge>;
      case "in progress":
        return <Badge variant="secondary">กำลังเรียน</Badge>;
      case "not started":
        return <Badge variant="outline">ยังไม่เริ่ม</Badge>;
      default:
        return <Badge variant="outline">{progress}</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header onToggleSidebar={() => setSidebarOpen(true)} />
      
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 lg:ml-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <Button
                variant="ghost"
                className="mb-4"
                onClick={() => setLocation("/teacher/dashboard")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                กลับสู่หน้าหลัก
              </Button>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">จัดการนักเรียน</h1>
                    <p className="text-gray-600">ดูข้อมูลและติดตามความคืบหน้าของนักเรียน</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline">
                    <Mail className="w-4 h-4 mr-2" />
                    ส่งอีเมล
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    ส่งออกข้อมูล
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">นักเรียนทั้งหมด</p>
                      <p className="text-2xl font-bold text-gray-900">{mockStudents.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 font-bold">✓</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">สำเร็จแล้ว</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {mockStudents.filter(s => s.progress === "สำเร็จแล้ว").length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <span className="text-yellow-600 font-bold">⏳</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">กำลังเรียน</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {mockStudents.filter(s => s.progress === "in progress").length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-600 font-bold">○</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">ยังไม่เริ่ม</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {mockStudents.filter(s => s.progress === "not started").length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="ค้นหานักเรียน..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="w-full sm:w-64">
                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกหลักสูตร" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">หลักสูตรทั้งหมด</SelectItem>
                        {courses?.map((course: any) => (
                          <SelectItem key={course.id} value={course.title}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Students Table */}
            <Card>
              <CardHeader>
                <CardTitle>รายชื่อนักเรียน ({filteredStudents.length} คน)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ชื่อ-นามสกุล</TableHead>
                        <TableHead>อีเมล</TableHead>
                        <TableHead>หลักสูตร</TableHead>
                        <TableHead>สถานะ</TableHead>
                        <TableHead>คะแนน Pre-test</TableHead>
                        <TableHead>คะแนน Post-test</TableHead>
                        <TableHead>วันลงทะเบียน</TableHead>
                        <TableHead>เข้าใช้ล่าสุด</TableHead>
                        <TableHead>การดำเนินการ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">
                            {student.firstName} {student.lastName}
                          </TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell className="max-w-48 truncate">
                            {student.courseTitle}
                          </TableCell>
                          <TableCell>
                            {getProgressBadge(student.progress)}
                          </TableCell>
                          <TableCell>
                            {student.preTestScore ? (
                              <span className="font-medium">{student.preTestScore}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {student.postTestScore ? (
                              <span className="font-medium">{student.postTestScore}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(student.enrolledDate).toLocaleDateString('th-TH')}
                          </TableCell>
                          <TableCell>
                            {new Date(student.lastActive).toLocaleDateString('th-TH')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                ดูรายละเอียด
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredStudents.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">ไม่พบนักเรียนที่ตรงกับเงื่อนไขการค้นหา</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}