"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Calendar,
  Clock,
  Users,
  Video,
  MoreVertical,
  Copy,
  Edit,
  Trash2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CalendarClock,
  Link,
  Check,
} from "lucide-react";
import { format, isPast, isFuture, isToday, addDays } from "date-fns";

import Header from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Sample data - would be replaced with API data
const COURSES = [
  { id: "course1", name: "Web Development Fundamentals" },
  { id: "course2", name: "React Masterclass" },
  { id: "course3", name: "Data Science Basics" },
  { id: "course4", name: "UX Design Principles" },
];

const MEETING_TYPES = [
  { id: "class", name: "Class Session" },
  { id: "office", name: "Office Hours" },
  { id: "group", name: "Group Project" },
  { id: "individual", name: "Individual Meeting" },
];

// Sample meeting data
const MEETINGS = [
  {
    id: "meeting1",
    title: "Week 5: JavaScript Fundamentals",
    description: "Covering variables, functions, and basic DOM manipulation",
    courseId: "course1",
    type: "class",
    date: addDays(new Date(), 2).toISOString(),
    startTime: "14:00",
    endTime: "15:30",
    link: "https://meet.example.com/abc123",
    isRecurring: true,
    attendees: 28,
    maxAttendees: 30,
  },
  {
    id: "meeting2",
    title: "Office Hours",
    description: "Drop-in session for any course questions",
    courseId: "course1",
    type: "office",
    date: new Date().toISOString(),
    startTime: "16:00",
    endTime: "18:00",
    link: "https://meet.example.com/def456",
    isRecurring: true,
    attendees: 0,
    maxAttendees: 10,
  },
  {
    id: "meeting3",
    title: "React Hooks Workshop",
    description: "Practical workshop on React hooks usage",
    courseId: "course2",
    type: "class",
    date: addDays(new Date(), -1).toISOString(),
    startTime: "10:00",
    endTime: "12:00",
    link: "https://meet.example.com/ghi789",
    isRecurring: false,
    attendees: 22,
    maxAttendees: 25,
  },
  {
    id: "meeting4",
    title: "Final Project Discussion",
    description: "Group meeting to discuss final project requirements",
    courseId: "course2",
    type: "group",
    date: addDays(new Date(), 5).toISOString(),
    startTime: "15:00",
    endTime: "16:00",
    link: "https://meet.example.com/jkl012",
    isRecurring: false,
    attendees: 5,
    maxAttendees: 8,
  },
];

// Form schema for creating/editing meetings
const meetingFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  courseId: z.string().min(1, "Course is required"),
  type: z.string().min(1, "Meeting type is required"),
  date: z.date({
    required_error: "Date is required",
  }),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  link: z.string().url("Please enter a valid URL").min(1, "Meeting link is required"),
  isRecurring: z.boolean().default(false),
  maxAttendees: z.coerce.number().int().min(1, "Max attendees must be at least 1"),
});

type MeetingFormValues = z.infer<typeof meetingFormSchema>;

const TeacherMeetings = () => {
  const router = useRouter();
  const [meetings, setMeetings] = useState(MEETINGS);
  const [filteredMeetings, setFilteredMeetings] = useState(MEETINGS);
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [currentTab, setCurrentTab] = useState("upcoming");
  const [showNewMeetingDialog, setShowNewMeetingDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState<any>(null);
  
  const form = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingFormSchema),
    defaultValues: {
      title: "",
      description: "",
      courseId: "",
      type: "",
      date: new Date(),
      startTime: "",
      endTime: "",
      link: "",
      isRecurring: false,
      maxAttendees: 30,
    },
  });
  
  useEffect(() => {
    // Filter meetings based on search term, course filter, and current tab
    let filtered = meetings;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(meeting => 
        meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply course filter
    if (courseFilter !== "all") {
      filtered = filtered.filter(meeting => meeting.courseId === courseFilter);
    }
    
    // Apply tab filter
    if (currentTab === "upcoming") {
      filtered = filtered.filter(meeting => isFuture(new Date(meeting.date)) || isToday(new Date(meeting.date)));
    } else if (currentTab === "past") {
      filtered = filtered.filter(meeting => isPast(new Date(meeting.date)) && !isToday(new Date(meeting.date)));
    }
    
    // Sort by date
    filtered = filtered.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    setFilteredMeetings(filtered);
  }, [meetings, searchTerm, courseFilter, currentTab]);
  
  const openMeetingDialog = (meeting?: any) => {
    if (meeting) {
      // Edit mode
      setIsEditMode(true);
      setCurrentMeeting(meeting);
      form.reset({
        title: meeting.title,
        description: meeting.description || "",
        courseId: meeting.courseId,
        type: meeting.type,
        date: new Date(meeting.date),
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        link: meeting.link,
        isRecurring: meeting.isRecurring,
        maxAttendees: meeting.maxAttendees,
      });
    } else {
      // Create mode
      setIsEditMode(false);
      setCurrentMeeting(null);
      form.reset({
        title: "",
        description: "",
        courseId: "",
        type: "",
        date: new Date(),
        startTime: "",
        endTime: "",
        link: "",
        isRecurring: false,
        maxAttendees: 30,
      });
    }
    setShowNewMeetingDialog(true);
  };
  
  const handleDeleteMeeting = (meetingId: string) => {
    setMeetings(meetings.filter(meeting => meeting.id !== meetingId));
    toast.success("Meeting deleted successfully");
  };
  
  const copyMeetingLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Meeting link copied to clipboard");
  };
  
  const onSubmit = (values: MeetingFormValues) => {
    if (isEditMode && currentMeeting) {
      // Update existing meeting
      const updatedMeetings = meetings.map(meeting => 
        meeting.id === currentMeeting.id ? { ...meeting, ...values } : meeting
      );
      setMeetings(updatedMeetings);
      toast.success("Meeting updated successfully");
    } else {
      // Create new meeting
      const newMeeting = {
        id: `meeting${meetings.length + 1}`,
        ...values,
        date: values.date.toISOString(),
        attendees: 0,
      };
      setMeetings([...meetings, newMeeting]);
      toast.success("Meeting created successfully");
    }
    setShowNewMeetingDialog(false);
  };
  
  const getMeetingTypeLabel = (type: string) => {
    const meetingType = MEETING_TYPES.find(t => t.id === type);
    return meetingType ? meetingType.name : type;
  };
  
  const getMeetingStatusBadge = (meeting: any) => {
    const meetingDate = new Date(meeting.date);
    
    if (isPast(meetingDate) && !isToday(meetingDate)) {
      return <Badge className="bg-gray-600">Completed</Badge>;
    } else if (isToday(meetingDate)) {
      return <Badge className="bg-green-600">Today</Badge>;
    } else {
      return <Badge className="bg-blue-600">Upcoming</Badge>;
    }
  };
  
  const getCourseName = (courseId: string) => {
    const course = COURSES.find(c => c.id === courseId);
    return course ? course.name : "Unknown Course";
  };
  
  return (
    <div className="space-y-6">
      <Header
        title="Virtual Meetings"
        subtitle="Schedule and manage your virtual meetings"
        rightElement={
          <Button onClick={() => openMeetingDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            New Meeting
          </Button>
        }
      />
      
      {/* Filters and Search */}
      <Card className="bg-customgreys-secondarybg border-none shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-customgreys-dirtyGrey" />
              <Input
                placeholder="Search meetings..."
                className="pl-10 bg-customgreys-primarybg border-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="w-[240px] bg-customgreys-primarybg border-none">
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent className="bg-customgreys-primarybg border-gray-700">
                  <SelectItem value="all">All Courses</SelectItem>
                  {COURSES.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs and Meeting Cards */}
      <Tabs defaultValue="upcoming" value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="bg-customgreys-secondarybg border-b border-gray-700 rounded-none p-0 h-12">
          <TabsTrigger
            value="upcoming"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-500 data-[state=active]:bg-transparent px-6"
          >
            Upcoming
          </TabsTrigger>
          <TabsTrigger
            value="past"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-500 data-[state=active]:bg-transparent px-6"
          >
            Past
          </TabsTrigger>
          <TabsTrigger
            value="all"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-500 data-[state=active]:bg-transparent px-6"
          >
            All
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={currentTab} className="pt-6">
          {filteredMeetings.length === 0 ? (
            <div className="text-center py-10">
              <Video className="h-12 w-12 mx-auto text-gray-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">No meetings found</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm || courseFilter !== "all" 
                  ? "Try adjusting your filters to see more results" 
                  : `You don't have any ${currentTab} meetings scheduled`}
              </p>
              <Button onClick={() => openMeetingDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Schedule New Meeting
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMeetings.map(meeting => (
                <Card 
                  key={meeting.id} 
                  className="bg-customgreys-secondarybg border-none shadow-md hover:bg-customgreys-darkerGrey transition overflow-hidden"
                >
                  <CardHeader className="pb-2 relative">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        {getMeetingStatusBadge(meeting)}
                        <CardTitle className="text-lg mt-2 pr-8">
                          {meeting.title}
                        </CardTitle>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 absolute top-4 right-4">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-customgreys-primarybg border-gray-700">
                          <DropdownMenuItem onClick={() => router.push(`/teacher/meetings/${meeting.id}`)}>
                            <Video className="mr-2 h-4 w-4" />
                            Join Meeting
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => copyMeetingLink(meeting.link)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openMeetingDialog(meeting)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteMeeting(meeting.id)}
                            className="text-red-500"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-sm text-gray-400">{getCourseName(meeting.courseId)}</p>
                  </CardHeader>
                  <CardContent>
                    {meeting.description && (
                      <p className="text-sm text-gray-300 line-clamp-2 mb-4">
                        {meeting.description}
                      </p>
                    )}
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-primary-500" />
                        {format(new Date(meeting.date), "MMM d, yyyy")}
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-amber-500" />
                        {meeting.startTime} - {meeting.endTime}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4 text-blue-500" />
                        {meeting.attendees} / {meeting.maxAttendees}
                      </div>
                      <Badge variant="outline" className="text-primary-500 border-primary-500">
                        {getMeetingTypeLabel(meeting.type)}
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-gray-700 pt-4">
                    <div className="w-full flex justify-between items-center">
                      {meeting.isRecurring && (
                        <div className="text-sm text-gray-400 flex items-center">
                          <CalendarClock className="mr-2 h-4 w-4" />
                          Recurring
                        </div>
                      )}
                      <Button 
                        className="ml-auto"
                        size="sm" 
                        onClick={() => router.push(`/teacher/meetings/${meeting.id}`)}
                      >
                        Join
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Create/Edit Meeting Dialog */}
      <Dialog open={showNewMeetingDialog} onOpenChange={setShowNewMeetingDialog}>
        <DialogContent className="bg-customgreys-primarybg border-none max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Meeting" : "Schedule New Meeting"}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Update your virtual meeting details below."
                : "Fill out the form below to schedule a new virtual meeting."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Title<span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter meeting title" 
                        className="bg-customgreys-secondarybg border-gray-700"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course<span className="text-red-500">*</span></FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-customgreys-secondarybg border-gray-700">
                            <SelectValue placeholder="Select a course" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-customgreys-primarybg border-gray-700">
                          {COURSES.map(course => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meeting Type<span className="text-red-500">*</span></FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-customgreys-secondarybg border-gray-700">
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-customgreys-primarybg border-gray-700">
                          {MEETING_TYPES.map(type => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date<span className="text-red-500">*</span></FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="bg-customgreys-secondarybg border-gray-700 w-full justify-start text-left font-normal"
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-customgreys-secondarybg border-gray-700">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time<span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          className="bg-customgreys-secondarybg border-gray-700"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time<span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          className="bg-customgreys-secondarybg border-gray-700"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Link<span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-customgreys-dirtyGrey" />
                        <Input
                          placeholder="https://meet.example.com/your-meeting"
                          className="bg-customgreys-secondarybg border-gray-700 pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="maxAttendees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Attendees<span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          className="bg-customgreys-secondarybg border-gray-700"
                          min={1}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isRecurring"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-x-2 rounded-md border border-gray-700 p-4 bg-customgreys-secondarybg">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Recurring Meeting</FormLabel>
                        <FormDescription className="text-sm text-gray-400">
                          This meeting will repeat weekly
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter meeting description"
                        className="bg-customgreys-secondarybg border-gray-700 min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setShowNewMeetingDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditMode ? "Update Meeting" : "Schedule Meeting"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherMeetings; 