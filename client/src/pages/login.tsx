import { useState } from "react";
import { Link, useLocation } from "wouter";
import { GraduationCap } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { AuthService } from "@/lib/auth";
import { loginSchema, type LoginCredentials } from "@shared/schema";

export default function Login() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await AuthService.login(data);
      
      toast({
        title: "เข้าสู่ระบบสำเร็จ",
        description: response.message,
      });
      
      // Redirect to home page
      setLocation("/");
      window.location.reload(); // Refresh to update auth state
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถเข้าสู่ระบบได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    toast({
      title: "ฟีเจอร์นี้จะเปิดใช้งานเร็วๆ นี้",
      description: "การเข้าสู่ระบบด้วย Google กำลังพัฒนา",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <GraduationCap className="text-white h-8 w-8" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">เข้าสู่ระบบ</h2>
          <p className="mt-2 text-sm text-gray-600">กรอกข้อมูลเพื่อเข้าสู่ระบบ</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-lg">
          <CardContent className="py-8 px-4 sm:px-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">หรือ</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                >
                  <span className="text-red-500 mr-3">🔗</span>
                  เข้าสู่ระบบด้วย Google
                </Button>
              </form>
            </Form>

            <div className="mt-6">
              <div className="text-center">
                <span className="text-sm text-gray-600">หากท่านยังไม่ได้ลงทะเบียน </span>
                <Link href="/register">
                  <Button variant="link" className="text-sm p-0 h-auto">
                    คลิกลงทะเบียน
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
