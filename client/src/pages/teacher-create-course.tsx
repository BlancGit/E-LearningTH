import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { createCourseSchema, type CreateCourse } from "@shared/schema";

export default function TeacherCreateCourse() {
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<CreateCourse>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmit = async (data: CreateCourse) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create course');
      }

      const result = await response.json();
      
      toast({
        title: "สร้างหลักสูตรสำเร็จ",
        description: result.message,
      });

      // Redirect to course detail page
      setLocation(`/teacher/course/${result.course.id}`);
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถสร้างหลักสูตรได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header onToggleSidebar={() => setSidebarOpen(true)} />
      
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 lg:ml-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">สร้างหลักสูตรใหม่</h1>
                  <p className="text-gray-600">กรอกรายละเอียดหลักสูตรที่คุณต้องการสร้าง</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลหลักสูตร</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ชื่อหลักสูตร *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="กรอกชื่อหลักสูตร"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>คำอธิบายหลักสูตร</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="กรอกคำอธิบายหลักสูตร (ไม่บังคับ)"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center space-x-4 pt-4">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="px-8"
                      >
                        {isLoading ? "กำลังสร้าง..." : "สร้างหลักสูตร"}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setLocation("/teacher/dashboard")}
                      >
                        ยกเลิก
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-lg">ขั้นตอนถัดไป</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• หลังจากสร้างหลักสูตรแล้ว คุณจะสามารถเพิ่มแบบทดสอบก่อนเรียน (Pre-test) และหลังเรียน (Post-test)</p>
                  <p>• เพิ่มเนื้อหาการเรียนรู้และกิจกรรม</p>
                  <p>• กำหนดเกณฑ์การผ่านสำหรับแบบทดสอบหลังเรียน</p>
                  <p>• เชิญนักเรียนเข้าร่วมหลักสูตร</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}