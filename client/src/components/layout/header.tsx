import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Search, Menu, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const currentUser = AuthService.getUser();
    setUser(currentUser);
  }, []);

  const handleLogout = async () => {
    await AuthService.logout();
    setUser(null);
    toast({
      title: "ออกจากระบบแล้ว",
      description: "คุณได้ออกจากระบบเรียบร้อยแล้ว",
    });
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2"
              onClick={onToggleSidebar}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <GraduationCap className="text-white h-6 w-6" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">เรียนรู้ออนไลน์</h1>
              </div>
            </Link>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="w-full relative">
              <Input
                type="text"
                placeholder="ค้นหาหลักสูตร..."
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700 hidden sm:inline">
                  สวัสดี, {user.firstName}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700"
                >
                  ออกจากระบบ
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                    เข้าสู่ระบบ
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    สมัครสมาชิก
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
