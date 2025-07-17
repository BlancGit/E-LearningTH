import { useState } from "react";
import { Link, useLocation } from "wouter";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { AuthService } from "@/lib/auth";
import { insertUserSchema, type InsertUser } from "@shared/schema";

export default function Register() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "STUDENT",
    },
  });

  const onSubmit = async (data: InsertUser) => {
    setIsLoading(true);
    try {
      const response = await AuthService.register(data);
      
      toast({
        title: "สมัครสมาชิกสำเร็จ",
        description: response.message,
      });
      
      // Redirect to login page
      setLocation("/login");
    } catch (error: any) {
      const errorData = await error.response?.json?.();
      toast({
        title: "เกิดข้อผิดพลาด",
        description: errorData?.message || error.message || "ไม่สามารถสมัครสมาชิกได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <UserPlus className="text-white h-8 w-8" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">สมัครสมาชิก</h2>
          <p className="mt-2 text-sm text-gray-600">กรอกข้อมูลเพื่อสมัครสมาชิก</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-lg">
          <CardContent className="py-8 px-4 sm:px-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ชื่อจริง</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>นามสกุล</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>อีเมล</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>รหัสผ่าน</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-gray-500">รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร</p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ยืนยันรหัสผ่าน</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ประเภทผู้ใช้</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 gap-3"
                        >
                          <div className="flex items-center space-x-2 border border-gray-300 rounded-lg p-3 hover:bg-gray-50">
                            <RadioGroupItem value="STUDENT" id="student" />
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 text-sm">🎓</span>
                              </div>
                              <label htmlFor="student" className="text-sm font-medium cursor-pointer">
                                นักเรียน
                              </label>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 border border-gray-300 rounded-lg p-3 hover:bg-gray-50">
                            <RadioGroupItem value="TEACHER" id="teacher" />
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 text-sm">👨‍🏫</span>
                              </div>
                              <label htmlFor="teacher" className="text-sm font-medium cursor-pointer">
                                ครู
                              </label>
                            </div>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
                </Button>
              </form>
            </Form>

            <div className="mt-6">
              <div className="text-center">
                <span className="text-sm text-gray-600">มีบัญชีอยู่แล้ว? </span>
                <Link href="/login">
                  <Button variant="link" className="text-sm p-0 h-auto">
                    เข้าสู่ระบบ
                  </Button>
                </Link>
              </div>
              <div className="mt-4 text-center">
                <Link href="/">
                  <Button variant="link" className="text-sm p-0 h-auto">
                    ← กลับสู่หน้าแรก
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
