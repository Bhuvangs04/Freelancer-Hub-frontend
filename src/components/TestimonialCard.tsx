import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
  rating: number;
  image: string;
}

export const TestimonialCard = ({
  name,
  role,
  content,
  rating,
  image,
}: TestimonialCardProps) => {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <img
            src={image}
            alt={name}
            className="h-12 w-12 rounded-full object-cover"
          />
          <div>
            <h4 className="font-semibold">{name}</h4>
            <p className="text-sm text-gray-500">{role}</p>
          </div>
        </div>
        <div className="flex mb-4">
          {[...Array(rating)].map((_, i) => (
            <Star
              key={i}
              className="w-4 h-4 fill-yellow-400 text-yellow-400"
            />
          ))}
        </div>
        <p className="text-gray-600">{content}</p>
      </CardContent>
    </Card>
  );
};