import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Clock, AlertTriangle, CheckCircle, X } from "lucide-react";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { AuthService } from "@/lib/auth";

export default function TakeTest() {
  const [, params] = useRoute("/test/:id");
  const [, setLocation] = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour default
  const [warningCount, setWarningCount] = useState(0);
  const { toast } = useToast();

  const testId = params?.id ? parseInt(params.id) : 0;
  const user = AuthService.getUser();

  const { data: questions, isLoading } = useQuery({
    queryKey: ["test-questions", testId],
    queryFn: async () => {
      const response = await fetch(`/api/tests/${testId}/questions`);
      if (!response.ok) throw new Error("Failed to fetch questions");
      const data = await response.json();
      return data.questions;
    },
  });

  // Copy-paste prevention
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+C, Ctrl+V, Ctrl+A, Ctrl+X, F12, etc.
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'a', 'x', 's', 'p'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        setWarningCount(prev => prev + 1);
        toast({
          title: "การกระทำไม่อนุญาต",
          description: "ห้ามใช้ Copy/Paste ระหว่างการทำแบบทดสอบ",
          variant: "destructive",
        });
      }
      
      // Prevent F12, Ctrl+Shift+I, etc.
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
        setWarningCount(prev => prev + 1);
        toast({
          title: "การกระทำไม่อนุญาต",
          description: "ห้ามเปิด Developer Tools ระหว่างการทำแบบทดสอบ",
          variant: "destructive",
        });
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setWarningCount(prev => prev + 1);
      toast({
        title: "การกระทำไม่อนุญาต",
        description: "ห้ามใช้เมนูคลิกขวาระหว่างการทำแบบทดสอบ",
        variant: "destructive",
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarningCount(prev => prev + 1);
        toast({
          title: "คำเตือน",
          description: "ห้ามเปลี่ยนแท็บหรือหน้าต่างระหว่างการทำแบบทดสอบ",
          variant: "destructive",
        });
      }
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Disable text selection
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';

    return () => {
      // Clean up
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    };
  }, [toast]);

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft, showResult]);

  // Too many warnings
  useEffect(() => {
    if (warningCount >= 3) {
      toast({
        title: "การทำแบบทดสอบถูกยกเลิก",
        description: "คุณได้รับคำเตือนเกินกำหนด แบบทดสอบจะถูกส่งอัตโนมัติ",
        variant: "destructive",
      });
      setTimeout(() => handleSubmit(), 3000);
    }
  }, [warningCount]);

  const handleAnswerChange = (questionId: number, optionId: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      const submissionData = {
        answers: Object.entries(answers).map(([questionId, optionId]) => ({
          questionId: parseInt(questionId),
          selectedOptionId: optionId,
        })),
      };

      const response = await fetch(`/api/tests/${testId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) throw new Error("Failed to submit test");
      
      const data = await response.json();
      setResult(data);
      setShowResult(true);
      
      // Update course progress if it's a post-test and passed
      if (data.score >= 70) { // Assuming 70% is passing
        // We need to get the course ID from the test to update progress
        // This would need to be implemented in the API
      }
      
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถส่งแบบทดสอบได้",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Header onToggleSidebar={() => {}} />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดแบบทดสอบ...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Header onToggleSidebar={() => {}} />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">ไม่พบแบบทดสอบ</h2>
            <p className="text-gray-600 mb-4">แบบทดสอบนี้ไม่มีคำถาม</p>
            <Button onClick={() => setLocation("/courses")}>
              กลับไปหน้าหลักสูตร
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Header onToggleSidebar={() => {}} />
        <div className="flex flex-1 items-center justify-center">
          <div className="max-w-md w-full mx-4">
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-blue-100">
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle>ผลการทำแบบทดสอบ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-2">
                  <div className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
                    {result.score}%
                  </div>
                  <p className="text-gray-600">
                    ตอบถูก {result.correctAnswers} จาก {result.totalQuestions} ข้อ
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">คะแนน:</span>
                    <span className="font-medium">{result.score}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">สถานะ:</span>
                    <Badge variant={result.score >= 70 ? "default" : "destructive"}>
                      {result.score >= 70 ? "ผ่าน" : "ไม่ผ่าน"}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Button onClick={() => setLocation("/courses")}>
                    กลับไปหน้าหลักสูตร
                  </Button>
                  <Button variant="outline" onClick={() => window.print()}>
                    พิมพ์ผลคะแนน
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestionData = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header onToggleSidebar={() => {}} />
      
      <div className="flex-1">
        {/* Test Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">แบบทดสอบ</h1>
              <Badge variant="outline">
                ข้อ {currentQuestion + 1} จาก {questions.length}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              {warningCount > 0 && (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">คำเตือน: {warningCount}/3</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2">
          <div className="max-w-4xl mx-auto">
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 p-4">
          <div className="max-w-4xl mx-auto">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  {currentQuestionData.questionText}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={answers[currentQuestionData.id]?.toString()}
                  onValueChange={(value) => handleAnswerChange(currentQuestionData.id, parseInt(value))}
                >
                  {currentQuestionData.options.map((option: any, index: number) => (
                    <div key={option.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value={option.id.toString()} id={`option-${option.id}`} />
                      <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer">
                        <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                ข้อก่อนหน้า
              </Button>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  ตอบแล้ว {Object.keys(answers).length} จาก {questions.length} ข้อ
                </span>
              </div>
              
              {currentQuestion === questions.length - 1 ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button disabled={isSubmitting}>
                      {isSubmitting ? "กำลังส่ง..." : "ส่งแบบทดสอบ"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>ยืนยันการส่งแบบทดสอบ</AlertDialogTitle>
                      <AlertDialogDescription>
                        คุณได้ตอบคำถามแล้ว {Object.keys(answers).length} จาก {questions.length} ข้อ
                        <br />
                        หากส่งแล้วจะไม่สามารถแก้ไขได้ คุณต้องการส่งแบบทดสอบหรือไม่?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSubmit}>ส่งแบบทดสอบ</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button
                  onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                  disabled={currentQuestion === questions.length - 1}
                >
                  ข้อถัดไป
                  <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}