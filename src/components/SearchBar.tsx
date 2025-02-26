import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchBarProps {
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

const SearchBar = ({ onSearchChange, onCategoryChange }: SearchBarProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 w-full max-w-4xl mx-auto mb-8">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          className="pl-10"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select onValueChange={onCategoryChange}>
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="web">Web Development</SelectItem>
          <SelectItem value="mobile">Mobile Development</SelectItem>
          <SelectItem value="design">Design</SelectItem>
          <SelectItem value="writing">Content Writing</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SearchBar;