import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, BarChart3, Download, TrendingUp, Users, FileText, Target } from "lucide-react";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { AuthService } from "@/lib/auth";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function TeacherAnalytics() {
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const { toast } = useToast();

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

  // Mock analytics data
  const mockAnalytics = {
    overview: {
      totalStudents: 85,
      averageImprovement: 23,
      completionRate: 76,
      averageScore: 78,
    },
    improvementData: [
      { name: 'ม.ค.', preTest: 65, postTest: 78 },
      { name: 'ก.พ.', preTest: 68, postTest: 82 },
      { name: 'มี.ค.', preTest: 70, postTest: 85 },
      { name: 'เม.ย.', preTest: 72, postTest: 88 },
      { name: 'พ.ค.', preTest: 75, postTest: 90 },
    ],
    courseStats: [
      { name: 'อ่านหนังสือ', students: 25, avgScore: 85, completion: 92 },
      { name: 'คণิตศาสตร์', students: 42, avgScore: 72, completion: 78 },
      { name: 'ศิลปะ', students: 18, avgScore: 88, completion: 100 },
    ],
    studentScores: [
      { id: 1, name: 'สมศรี ใจดี', course: 'อ่านหนังสือ', preTest: 65, postTest: 88, improvement: 23 },
      { id: 2, name: 'สมชาย รักเรียน', course: 'คณิตศาสตร์', preTest: 72, postTest: 85, improvement: 13 },
      { id: 3, name: 'สมหญิง สร้างสรรค์', course: 'ศิลปะ', preTest: 78, postTest: 92, improvement: 14 },
      { id: 4, name: 'สมปอง เก่งคณิต', course: 'คณิตศาสตร์', preTest: 55, postTest: 80, improvement: 25 },
      { id: 5, name: 'สมใจ อ่านดี', course: 'อ่านหนังสือ', preTest: 70, postTest: 90, improvement: 20 },
    ],
  };

  const exportToCSV = () => {
    const csvData = [
      ['ชื่อ-นามสกุล', 'หลักสูตร', 'คะแนน Pre-test', 'คะแนน Post-test', 'การพัฒนา (%)'],
      ...mockAnalytics.studentScores.map(student => [
        student.name,
        student.course,
        student.preTest,
        student.postTest,
        student.improvement
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'student-scores.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "ส่งออกสำเร็จ",
      description: "ไฟล์ CSV ได้ถูกดาวน์โหลดแล้ว",
    });
  };

  const getImprovementBadge = (improvement: number) => {
    if (improvement >= 20) return <Badge className="bg-green-100 text-green-800">ดีมาก</Badge>;
    if (improvement >= 10) return <Badge className="bg-blue-100 text-blue-800">ดี</Badge>;
    if (improvement >= 5) return <Badge className="bg-yellow-100 text-yellow-800">ปานกลาง</Badge>;
    return <Badge className="bg-red-100 text-red-800">ต้องปรับปรุง</Badge>;
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
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">รายงานผลการเรียน</h1>
                    <p className="text-gray-600">วิเคราะห์ผลการเรียนรู้และความก้าวหน้าของนักเรียน</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="เลือกหลักสูตร" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">หลักสูตรทั้งหมด</SelectItem>
                      {courses?.map((course: any) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700">
                    <Download className="w-4 h-4 mr-2" />
                    ส่งออก CSV
                  </Button>
                </div>
              </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">นักเรียนทั้งหมด</p>
                      <p className="text-2xl font-bold text-gray-900">{mockAnalytics.overview.totalStudents}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">การพัฒนาเฉลี่ย</p>
                      <p className="text-2xl font-bold text-gray-900">+{mockAnalytics.overview.averageImprovement}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Target className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">อัตราผ่าน</p>
                      <p className="text-2xl font-bold text-gray-900">{mockAnalytics.overview.completionRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">คะแนนเฉลี่ย</p>
                      <p className="text-2xl font-bold text-gray-900">{mockAnalytics.overview.averageScore}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Improvement Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>การพัฒนาคะแนนตลอดเวลา</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mockAnalytics.improvementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="preTest" stroke="#8884d8" name="Pre-test" />
                      <Line type="monotone" dataKey="postTest" stroke="#82ca9d" name="Post-test" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Course Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>ผลการเรียนแต่ละหลักสูตร</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockAnalytics.courseStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="avgScore" fill="#8884d8" name="คะแนนเฉลี่ย" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Course Statistics */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>สถิติแต่ละหลักสูตร</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {mockAnalytics.courseStats.map((course, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <h3 className="font-semibold text-gray-900">{course.name}</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">นักเรียน:</span>
                          <span className="font-medium">{course.students} คน</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">คะแนนเฉลี่ย:</span>
                          <span className="font-medium">{course.avgScore}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">อัตราผ่าน:</span>
                          <span className="font-medium">{course.completion}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Student Scores Table */}
            <Card>
              <CardHeader>
                <CardTitle>คะแนนรายบุคคล</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ชื่อ-นามสกุล</TableHead>
                        <TableHead>หลักสูตร</TableHead>
                        <TableHead>คะแนน Pre-test</TableHead>
                        <TableHead>คะแนน Post-test</TableHead>
                        <TableHead>การพัฒนา</TableHead>
                        <TableHead>ระดับ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockAnalytics.studentScores.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.course}</TableCell>
                          <TableCell>
                            <span className="font-medium">{student.preTest}</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{student.postTest}</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-green-600">+{student.improvement}%</span>
                          </TableCell>
                          <TableCell>
                            {getImprovementBadge(student.improvement)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}