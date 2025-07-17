import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Courses from "@/pages/courses";
import TeacherDashboard from "@/pages/teacher-dashboard";
import TeacherCreateCourse from "@/pages/teacher-create-course";
import TeacherCourseDetail from "@/pages/teacher-course-detail";
import TeacherStudents from "@/pages/teacher-students";
import TeacherAnalytics from "@/pages/teacher-analytics";
import StudentCourse from "@/pages/student-course";
import TakeTest from "@/pages/take-test";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/courses" component={Courses} />
      <Route path="/teacher/dashboard" component={TeacherDashboard} />
      <Route path="/teacher/create-course" component={TeacherCreateCourse} />
      <Route path="/teacher/course/:id" component={TeacherCourseDetail} />
      <Route path="/teacher/students" component={TeacherStudents} />
      <Route path="/teacher/analytics" component={TeacherAnalytics} />
      <Route path="/course/:id" component={StudentCourse} />
      <Route path="/test/:id" component={TakeTest} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="font-sarabun">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
