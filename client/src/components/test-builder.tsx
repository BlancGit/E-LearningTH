import { useState } from "react";
import { Plus, Trash2, Check, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  questionText: string;
  options: Option[];
}

interface TestBuilderProps {
  courseId: number;
  onTestCreated: () => void;
  onCancel: () => void;
}

export default function TestBuilder({ courseId, onTestCreated, onCancel }: TestBuilderProps) {
  const [testType, setTestType] = useState<"pre" | "post">("pre");
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      questionText: '',
      options: [
        { id: '1-1', text: '', isCorrect: false },
        { id: '1-2', text: '', isCorrect: false },
      ]
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addQuestion = () => {
    const newId = Date.now().toString();
    const newQuestion: Question = {
      id: newId,
      questionText: '',
      options: [
        { id: `${newId}-1`, text: '', isCorrect: false },
        { id: `${newId}-2`, text: '', isCorrect: false },
      ]
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const updateQuestion = (questionId: string, questionText: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, questionText } : q
    ));
  };

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options.length < 5) {
        const newOptionId = `${questionId}-${Date.now()}`;
        return {
          ...q,
          options: [...q.options, { id: newOptionId, text: '', isCorrect: false }]
        };
      }
      return q;
    }));
  };

  const removeOption = (questionId: string, optionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options.length > 2) {
        return {
          ...q,
          options: q.options.filter(o => o.id !== optionId)
        };
      }
      return q;
    }));
  };

  const updateOption = (questionId: string, optionId: string, text: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: q.options.map(o => 
            o.id === optionId ? { ...o, text } : o
          )
        };
      }
      return q;
    }));
  };

  const setCorrectAnswer = (questionId: string, optionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: q.options.map(o => ({
            ...o,
            isCorrect: o.id === optionId
          }))
        };
      }
      return q;
    }));
  };

  const validateTest = () => {
    if (questions.length === 0) {
      toast({
        title: "ข้อผิดพลาด",
        description: "ต้องมีคำถามอย่างน้อย 1 ข้อ",
        variant: "destructive",
      });
      return false;
    }

    for (const question of questions) {
      if (!question.questionText.trim()) {
        toast({
          title: "ข้อผิดพลาด",
          description: "กรุณากรอกคำถามให้ครบถ้วน",
          variant: "destructive",
        });
        return false;
      }

      if (question.options.some(o => !o.text.trim())) {
        toast({
          title: "ข้อผิดพลาด",
          description: "กรุณากรอกตัวเลือกให้ครบถ้วน",
          variant: "destructive",
        });
        return false;
      }

      if (!question.options.some(o => o.isCorrect)) {
        toast({
          title: "ข้อผิดพลาด",
          description: "กรุณาเลือกคำตอบที่ถูกต้องให้ครบทุกข้อ",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateTest()) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      // Transform questions to match API format
      const transformedQuestions = questions.map(q => ({
        questionText: q.questionText,
        options: q.options.map(o => ({
          text: o.text,
          isCorrect: o.isCorrect,
        }))
      }));

      const response = await fetch(`/api/courses/${courseId}/tests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: testType,
          passingScore: testType === 'post' ? passingScore : undefined,
          questions: transformedQuestions,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create test');
      }

      onTestCreated();
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถสร้างแบบทดสอบได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Settings */}
      <Card>
        <CardHeader>
          <CardTitle>ตั้งค่าแบบทดสอบ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">ประเภทแบบทดสอบ</label>
              <Select value={testType} onValueChange={(value: "pre" | "post") => setTestType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pre">แบบทดสอบก่อนเรียน (Pre-test)</SelectItem>
                  <SelectItem value="post">แบบทดสอบหลังเรียน (Post-test)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {testType === "post" && (
              <div>
                <label className="block text-sm font-medium mb-2">คะแนนผ่าน (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={passingScore}
                  onChange={(e) => setPassingScore(parseInt(e.target.value) || 70)}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">คำถาม ({questions.length} ข้อ)</h3>
          <Button onClick={addQuestion} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มคำถาม
          </Button>
        </div>

        {questions.map((question, questionIndex) => (
          <Card key={question.id} className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="flex items-center space-x-2">
                <GripVertical className="w-4 h-4 text-gray-400" />
                <span className="font-medium">คำถามที่ {questionIndex + 1}</span>
              </div>
              {questions.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeQuestion(question.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">คำถาม</label>
                <Textarea
                  value={question.questionText}
                  onChange={(e) => updateQuestion(question.id, e.target.value)}
                  placeholder="กรอกคำถาม..."
                  className="min-h-[60px]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium">ตัวเลือก</label>
                  {question.options.length < 5 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addOption(question.id)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      เพิ่มตัวเลือก
                    </Button>
                  )}
                </div>

                {question.options.map((option, optionIndex) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Button
                      variant={option.isCorrect ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCorrectAnswer(question.id, option.id)}
                      className="flex-shrink-0"
                    >
                      {option.isCorrect && <Check className="w-4 h-4" />}
                      {String.fromCharCode(65 + optionIndex)}
                    </Button>
                    
                    <Input
                      value={option.text}
                      onChange={(e) => updateOption(question.id, option.id, e.target.value)}
                      placeholder={`ตัวเลือก ${String.fromCharCode(65 + optionIndex)}`}
                      className="flex-1"
                    />
                    
                    {question.options.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(question.id, option.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {question.options.some(o => o.isCorrect) && (
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="secondary">
                      คำตอบที่ถูกต้อง: {question.options.find(o => o.isCorrect)?.text || "ไม่ระบุ"}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-4 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          ยกเลิก
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "กำลังสร้าง..." : "สร้างแบบทดสอบ"}
        </Button>
      </div>
    </div>
  );
}