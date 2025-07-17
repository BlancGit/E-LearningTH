import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CourseCardProps {
  title: string;
  description: string;
  duration: string;
  imageUrl: string;
  onEnroll?: () => void;
}

export default function CourseCard({
  title,
  description,
  duration,
  imageUrl,
  onEnroll,
}: CourseCardProps) {
  return (
    <Card className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
      <div className="relative overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{duration}</span>
          </div>
          <Button size="sm" onClick={onEnroll}>
            เรียนเลย
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
