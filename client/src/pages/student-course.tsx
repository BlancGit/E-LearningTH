import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Play, CheckCircle, Clock, FileText, Award, User, Calendar } from "lucide-react";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { AuthService } from "@/lib/auth";
import type { Course } from "@shared/schema";

export default function StudentCourse() {
  const [, params] = useRoute("/course/:id");
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();

  const courseId = params?.id ? parseInt(params.id) : 0;
  const user = AuthService.getUser();

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${courseId}`);
      if (!response.ok) throw new Error("Failed to fetch course");
      const data = await response.json();
      return data.course as Course;
    },
  });

  const { data: tests } = useQuery({
    queryKey: ["course-tests", courseId],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${courseId}/tests`);
      if (!response.ok) throw new Error("Failed to fetch tests");
      const data = await response.json();
      return data.tests;
    },
  });

  const { data: progress } = useQuery({
    queryKey: ["course-progress", courseId, user?.id],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/courses/${courseId}/progress/${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.progress;
    },
    enabled: !!user?.id,
  });

  const { data: userScores } = useQuery({
    queryKey: ["user-scores", user?.id],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/users/${user?.id}/scores`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.scores;
    },
    enabled: !!user?.id,
  });

  const updateProgress = async (status: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`/api/courses/${courseId}/progress/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const handleStartCourse = async () => {
    await updateProgress('in progress');
    toast({
      title: "เริ่มเรียนแล้ว",
      description: "คุณได้เริ่มเรียนหลักสูตรนี้แล้ว",
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
            <Button onClick={() => setLocation("/courses")}>
              กลับไปหน้าหลักสูตร
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const preTest = tests?.find((test: any) => test.type === "pre");
  const postTest = tests?.find((test: any) => test.type === "post");
  
  const preTestScore = userScores?.find((score: any) => score.testId === preTest?.id);
  const postTestScore = userScores?.find((score: any) => score.testId === postTest?.id);

  const currentStatus = progress?.status || "not started";
  
  // Calculate progress percentage
  let progressPercentage = 0;
  if (currentStatus === "in progress") progressPercentage = 50;
  if (currentStatus === "สำเร็จแล้ว") progressPercentage = 100;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "สำเร็จแล้ว":
        return <Badge className="bg-green-100 text-green-800">สำเร็จแล้ว</Badge>;
      case "in progress":
        return <Badge variant="secondary">กำลังเรียน</Badge>;
      case "not started":
        return <Badge variant="outline">ยังไม่เริ่ม</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header onToggleSidebar={() => setSidebarOpen(true)} />
      
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 lg:ml-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <Button
                variant="ghost"
                className="mb-4"
                onClick={() => setLocation("/courses")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                กลับไปหน้าหลักสูตร
              </Button>
              
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="w-4 h-4 mr-1" />
                      <span>โดย: {course.teacher?.firstName} {course.teacher?.lastName}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>สร้างเมื่อ: {new Date(course.createdAt).toLocaleDateString('th-TH')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {getStatusBadge(currentStatus)}
                    <div className="flex items-center space-x-2">
                      <Progress value={progressPercentage} className="w-32" />
                      <span className="text-sm text-gray-600">{progressPercentage}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="ml-8">
                  {currentStatus === "not started" && (
                    <Button onClick={handleStartCourse} className="bg-primary hover:bg-primary/90">
                      <Play className="w-4 h-4 mr-2" />
                      เริ่มเรียน
                    </Button>
                  )}
                  
                  {currentStatus === "สำเร็จแล้ว" && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">เรียนจบแล้ว</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Course Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
                    <TabsTrigger value="tests">แบบทดสอบ</TabsTrigger>
                    <TabsTrigger value="materials">เนื้อหา</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>เกี่ยวกับหลักสูตร</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">รายละเอียด</h3>
                          <p className="text-gray-600">{course.description}</p>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold mb-2">สิ่งที่คุณจะได้เรียนรู้</h3>
                          <ul className="space-y-2 text-gray-600">
                            <li>• พื้นฐานความรู้ในเรื่อง {course.title}</li>
                            <li>• การประยุกต์ใช้ในชีวิตประจำวัน</li>
                            <li>• เทคนิคและวิธีการปฏิบัติ</li>
                            <li>• แบบทดสอบเพื่อวัดความเข้าใจ</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="tests" className="mt-6">
                    <div className="space-y-6">
                      {/* Pre-test */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>แบบทดสอบก่อนเรียน</span>
                            {preTestScore && (
                              <Badge variant="secondary">
                                คะแนน: {preTestScore.score}
                              </Badge>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {preTest ? (
                            <div className="space-y-4">
                              <p className="text-gray-600">
                                ทำแบบทดสอบเพื่อประเมินความรู้พื้นฐานก่อนเรียน
                              </p>
                              <div className="flex items-center space-x-4">
                                <div className="text-sm text-gray-500">
                                  <FileText className="w-4 h-4 inline mr-1" />
                                  {preTest.questions?.length || 0} ข้อ
                                </div>
                                <div className="text-sm text-gray-500">
                                  <Clock className="w-4 h-4 inline mr-1" />
                                  ไม่จำกัดเวลา
                                </div>
                              </div>
                              <Button
                                onClick={() => setLocation(`/test/${preTest.id}`)}
                                disabled={!!preTestScore}
                                variant={preTestScore ? "outline" : "default"}
                              >
                                {preTestScore ? "ทำแล้ว" : "เริ่มทำแบบทดสอบ"}
                              </Button>
                            </div>
                          ) : (
                            <p className="text-gray-500">ไม่มีแบบทดสอบก่อนเรียน</p>
                          )}
                        </CardContent>
                      </Card>

                      {/* Post-test */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>แบบทดสอบหลังเรียน</span>
                            {postTestScore && (
                              <Badge variant="secondary">
                                คะแนน: {postTestScore.score}
                              </Badge>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {postTest ? (
                            <div className="space-y-4">
                              <p className="text-gray-600">
                                ทำแบบทดสอบเพื่อประเมินความรู้หลังการเรียน
                              </p>
                              <div className="flex items-center space-x-4">
                                <div className="text-sm text-gray-500">
                                  <FileText className="w-4 h-4 inline mr-1" />
                                  {postTest.questions?.length || 0} ข้อ
                                </div>
                                <div className="text-sm text-gray-500">
                                  <Award className="w-4 h-4 inline mr-1" />
                                  คะแนนผ่าน: {postTest.passingScore || 0}
                                </div>
                              </div>
                              <Button
                                onClick={() => setLocation(`/test/${postTest.id}`)}
                                disabled={currentStatus !== "in progress"}
                                variant={postTestScore ? "outline" : "default"}
                              >
                                {postTestScore ? "ทำแล้ว" : "เริ่มทำแบบทดสอบ"}
                              </Button>
                            </div>
                          ) : (
                            <p className="text-gray-500">ไม่มีแบบทดสอบหลังเรียน</p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="materials" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>เนื้อหาการเรียน</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">เนื้อหาการเรียนจะเปิดให้ใช้งานเร็วๆ นี้</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Progress Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>ความคืบหน้า</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">สถานะ</span>
                      {getStatusBadge(currentStatus)}
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">ความคืบหน้า</span>
                        <span className="text-sm font-medium">{progressPercentage}%</span>
                      </div>
                      <Progress value={progressPercentage} />
                    </div>
                  </CardContent>
                </Card>

                {/* Scores Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>คะแนนของคุณ</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Pre-test</span>
                      <span className="font-medium">
                        {preTestScore ? preTestScore.score : "-"}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Post-test</span>
                      <span className="font-medium">
                        {postTestScore ? postTestScore.score : "-"}
                      </span>
                    </div>
                    
                    {preTestScore && postTestScore && (
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">การพัฒนา</span>
                          <span className="font-medium text-green-600">
                            +{postTestScore.score - preTestScore.score}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Teacher Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>ผู้สอน</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {course.teacher?.firstName} {course.teacher?.lastName}
                        </p>
                        <p className="text-sm text-gray-600">ครูผู้สอน</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}