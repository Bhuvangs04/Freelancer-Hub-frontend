import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileUploadZone } from './FileUploadZone';
import { TagInput } from './TagInput';
import { Card } from '@/components/ui/card';
import { Check, AlertCircle } from 'lucide-react';

const categories = [
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Graphic Design',
  'Content Writing',
  'Digital Marketing',
];

export const ProjectSubmissionForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: [1000],
    category: '',
    tags: [] as string[],
    files: [] as File[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (formData.tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Here you would typically send the data to your backend
    console.log('Submitting project:', formData);
    
    toast({
      title: 'Success!',
      description: 'Your project has been submitted successfully',
      action: (
        <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
          <Check className="h-5 w-5 text-white" />
        </div>
      ),
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">Submit Your Project</h1>
      
      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Project Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.title}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`min-h-[150px] ${errors.description ? 'border-red-500' : ''}`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Budget (USD)</label>
            <div className="pt-6">
              <Slider
                value={formData.budget}
                onValueChange={(value) => setFormData({ ...formData, budget: value })}
                max={10000}
                step={100}
              />
              <p className="text-sm text-muted-foreground mt-2">
                ${formData.budget[0].toLocaleString()}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.category}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <TagInput
              tags={formData.tags}
              onChange={(tags) => setFormData({ ...formData, tags })}
              error={errors.tags}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Files</label>
            <FileUploadZone
              files={formData.files}
              onChange={(files) => setFormData({ ...formData, files })}
            />
          </div>

          <Button type="submit" className="w-full">
            Submit Project
          </Button>
        </form>

        <div className="lg:sticky lg:top-8 space-y-6">
          <h2 className="text-xl font-semibold">Preview</h2>
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">{formData.title || 'Project Title'}</h3>
            <p className="text-gray-600 mb-4">
              {formData.description || 'Project description will appear here...'}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
            <div className="text-sm text-gray-500">
              <p>Budget: ${formData.budget[0].toLocaleString()}</p>
              <p>Category: {formData.category || 'Not selected'}</p>
              <p>Files: {formData.files.length} attached</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};