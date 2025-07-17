import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Plus, Edit, Trash2, Eye, Users, BarChart3, FileText, Settings } from "lucide-react";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import type { Course } from "@shared/schema";
import TestBuilder from "@/components/test-builder";

export default function TeacherCourseDetail() {
  const [, params] = useRoute("/teacher/course/:id");
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [showTestBuilder, setShowTestBuilder] = useState(false);
  const [testType, setTestType] = useState<"pre" | "post">("pre");
  const { toast } = useToast();

  const courseId = params?.id ? parseInt(params.id) : 0;

  const { data: course, isLoading, refetch } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${courseId}`);
      if (!response.ok) throw new Error("Failed to fetch course");
      const data = await response.json();
      return data.course as Course;
    },
  });

  const { data: tests, refetch: refetchTests } = useQuery({
    queryKey: ["course-tests", courseId],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${courseId}/tests`);
      if (!response.ok) throw new Error("Failed to fetch tests");
      const data = await response.json();
      return data.tests;
    },
  });

  useEffect(() => {
    if (course) {
      setEditTitle(course.title);
      setEditDescription(course.description || "");
    }
  }, [course]);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
        }),
      });

      if (!response.ok) throw new Error("Failed to update course");

      toast({
        title: "อัปเดตหลักสูตรสำเร็จ",
        description: "ข้อมูลหลักสูตรได้รับการอัปเดตแล้ว",
      });

      setIsEditing(false);
      refetch();
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถอัปเดตหลักสูตรได้",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete course");

      toast({
        title: "ลบหลักสูตรสำเร็จ",
        description: "หลักสูตรได้ถูกลบออกจากระบบแล้ว",
      });

      setLocation("/teacher/dashboard");
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถลบหลักสูตรได้",
        variant: "destructive",
      });
    }
  };

  const handleTestCreated = () => {
    setShowTestBuilder(false);
    refetchTests();
    toast({
      title: "สร้างแบบทดสอบสำเร็จ",
      description: "แบบทดสอบได้ถูกเพิ่มในหลักสูตรแล้ว",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Header onToggleSidebar={() => setSidebarOpen(true)} />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Header onToggleSidebar={() => setSidebarOpen(true)} />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">ไม่พบหลักสูตร</h2>
            <p className="text-gray-600 mb-4">หลักสูตรที่คุณต้องการดูไม่พบในระบบ</p>
            <Button onClick={() => setLocation("/teacher/dashboard")}>
              กลับสู่หน้าหลัก
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const preTest = tests?.find((test: any) => test.type === "pre");
  const postTest = tests?.find((test: any) => test.type === "post");

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
                <div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="text-2xl font-bold"
                      />
                      <Textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="คำอธิบายหลักสูตร"
                      />
                    </div>
                  ) : (
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                      <p className="text-gray-600 mt-2">{course.description}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSave}>บันทึก</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        ยกเลิก
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => setIsEditing(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        แก้ไข
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            ลบ
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>คุณแน่ใจหรือไม่?</AlertDialogTitle>
                            <AlertDialogDescription>
                              การลบหลักสูตรนี้จะไม่สามารถกู้คืนได้ ข้อมูลทั้งหมดรวมถึงแบบทดสอบและคะแนนจะถูกลบไปด้วย
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>ลบหลักสูตร</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
                <TabsTrigger value="tests">แบบทดสอบ</TabsTrigger>
                <TabsTrigger value="students">นักเรียน</TabsTrigger>
                <TabsTrigger value="analytics">สถิติ</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Users className="h-8 w-8 text-blue-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">นักเรียน</p>
                          <p className="text-2xl font-bold text-gray-900">0</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <FileText className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">แบบทดสอบ</p>
                          <p className="text-2xl font-bold text-gray-900">{tests?.length || 0}</p>
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
                          <p className="text-2xl font-bold text-gray-900">-</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Tests Tab */}
              <TabsContent value="tests" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">แบบทดสอบในหลักสูตร</h2>
                  <Dialog open={showTestBuilder} onOpenChange={setShowTestBuilder}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setShowTestBuilder(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        สร้างแบบทดสอบ
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>สร้างแบบทดสอบใหม่</DialogTitle>
                      </DialogHeader>
                      <TestBuilder
                        courseId={courseId}
                        onTestCreated={handleTestCreated}
                        onCancel={() => setShowTestBuilder(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pre-test */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>แบบทดสอบก่อนเรียน</span>
                        <Badge variant={preTest ? "default" : "secondary"}>
                          {preTest ? "มีแล้ว" : "ยังไม่มี"}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {preTest ? (
                        <div className="space-y-4">
                          <p className="text-sm text-gray-600">
                            จำนวนคำถาม: {preTest.questions?.length || 0} ข้อ
                          </p>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              ดูแบบทดสอบ
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-1" />
                              แก้ไข
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-4">ยังไม่มีแบบทดสอบก่อนเรียน</p>
                          <Button
                            onClick={() => {
                              setTestType("pre");
                              setShowTestBuilder(true);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            สร้างแบบทดสอบ
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Post-test */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>แบบทดสอบหลังเรียน</span>
                        <Badge variant={postTest ? "default" : "secondary"}>
                          {postTest ? "มีแล้ว" : "ยังไม่มี"}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {postTest ? (
                        <div className="space-y-4">
                          <p className="text-sm text-gray-600">
                            จำนวนคำถาม: {postTest.questions?.length || 0} ข้อ
                          </p>
                          <p className="text-sm text-gray-600">
                            คะแนนผ่าน: {postTest.passingScore || 0} คะแนน
                          </p>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              ดูแบบทดสอบ
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-1" />
                              แก้ไข
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-4">ยังไม่มีแบบทดสอบหลังเรียน</p>
                          <Button
                            onClick={() => {
                              setTestType("post");
                              setShowTestBuilder(true);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            สร้างแบบทดสอบ
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Students Tab */}
              <TabsContent value="students">
                <Card>
                  <CardHeader>
                    <CardTitle>นักเรียนในหลักสูตร</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">ยังไม่มีนักเรียนลงทะเบียนในหลักสูตรนี้</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics">
                <Card>
                  <CardHeader>
                    <CardTitle>สถิติการเรียนรู้</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">จะมีข้อมูลสถิติเมื่อมีนักเรียนทำแบบทดสอบ</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}