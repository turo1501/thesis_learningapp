"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser } from '@clerk/nextjs';
import { useCreateBlogPostMutation, useUpdateBlogPostMutation, BlogPost } from '@/state/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const categories = [
  { value: 'programming', label: 'Programming' },
  { value: 'design', label: 'Design' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'ai', label: 'Artificial Intelligence' },
  { value: 'web-development', label: 'Web Development' },
  { value: 'mobile-development', label: 'Mobile Development' },
  { value: 'devops', label: 'DevOps' },
  { value: 'career', label: 'Career Advice' },
];

const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters' }).max(100),
  content: z.string().min(50, { message: 'Content must be at least 50 characters' }),
  category: z.string({ required_error: 'Please select a category' }),
  tags: z.string().optional(),
  featuredImage: z.string()
    .url({ message: 'Please enter a valid URL' })
    .refine(url => {
      // Allow empty string
      if (!url) return true;
      
      // Check if URL is from allowed domains
      try {
        const urlObj = new URL(url);
        const allowedDomains = [
          'images.pexels.com',
          'localhost',
          '127.0.0.1',
          'img.clerk.com',
          'images.clerk.dev',
          'picsum.photos',
          'via.placeholder.com',
          'placehold.co',
          'placekitten.com',
          'unsplash.com',
          'images.unsplash.com'
        ];
        return allowedDomains.some(domain => urlObj.hostname.includes(domain));
      } catch (e) {
        return false;
      }
    }, { message: 'Image URL must be from an allowed domain' })
    .optional()
    .or(z.literal('')),
  status: z.enum(['draft', 'pending']),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateEditPostDialogProps {
  open: boolean;
  onClose: () => void;
  post?: BlogPost | null;
}

export default function CreateEditPostDialog({ 
  open, 
  onClose,
  post 
}: CreateEditPostDialogProps) {
  const { user } = useUser();
  const isEditing = !!post;
  
  const [createPost, { isLoading: isCreating }] = useCreateBlogPostMutation();
  const [updatePost, { isLoading: isUpdating }] = useUpdateBlogPostMutation();
  
  const isLoading = isCreating || isUpdating;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      category: '',
      tags: '',
      featuredImage: '',
      status: 'draft',
    },
  });
  
  // Update form when post changes
  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title,
        content: post.content,
        category: post.category,
        tags: post.tags?.join(', ') || '',
        featuredImage: post.featuredImage || '',
        status: post.status === 'published' || post.status === 'rejected' ? 'draft' : post.status,
      });
    } else {
      form.reset({
        title: '',
        content: '',
        category: '',
        tags: '',
        featuredImage: '',
        status: 'draft',
      });
    }
  }, [post, form]);

  const onSubmit = async (values: FormValues) => {
    // Format tags
    const tags = values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
    
    try {
      if (isEditing && post) {
        // Update existing post
        await updatePost({
          postId: post.postId,
          post: {
            ...values,
            tags,
          }
        }).unwrap();
        
        toast.success('Post updated successfully');
      } else {
        // Create new post
        await createPost({
          title: values.title,
          content: values.content,
          category: values.category,
          tags,
          status: values.status,
          featuredImage: values.featuredImage || undefined,
        }).unwrap();
        
        toast.success('Post created successfully');
      }
      
      onClose();
    } catch (error) {
      toast.error(isEditing ? 'Failed to update post' : 'Failed to create post');
    }
  };
  
  const handleSaveAsDraft = () => {
    form.setValue('status', 'draft');
    form.handleSubmit(onSubmit)();
  };
  
  const handleSubmitForReview = () => {
    form.setValue('status', 'pending');
    form.handleSubmit(onSubmit)();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
          </DialogTitle>
          <DialogDescription>
            Share your knowledge and experiences with the community. Posts will be reviewed by teachers before publication.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter a descriptive title" 
                      {...field} 
                      className="text-lg"
                    />
                  </FormControl>
                  <FormDescription>
                    Make it specific and eye-catching
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem 
                            key={category.value} 
                            value={category.value}
                          >
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      What topic does your post relate to?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="react, javascript, beginner" 
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Comma-separated tags to help with search
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Write your post content here..."
                      rows={12}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Share your experience, code examples, tips, or lessons learned
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="featuredImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Featured Image URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/image.jpg" 
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional: Add a URL to an image from allowed sources like Unsplash, Pexels, or Picsum Photos.
                    Example: https://images.unsplash.com/photo-xxx or https://picsum.photos/800/600
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        
        <Separator />
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={handleSaveAsDraft}
            disabled={isLoading}
          >
            Save as Draft
          </Button>
          
          <Button
            onClick={handleSubmitForReview}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Submit for Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 