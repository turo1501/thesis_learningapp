"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Video,
  Share2,
  MessageSquare,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  ScreenShare,
  Phone,
  Copy,
  Check,
  List,
  UserPlus,
  Mail,
  AlertTriangle,
  Settings,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

// Sample data - would be replaced with API calls
const MEETING = {
  id: "meeting1",
  title: "Week 5: JavaScript Fundamentals",
  description: "In this session, we'll cover JavaScript variables, functions, and basic DOM manipulation. Please come prepared with your coding environment set up. We'll be doing live coding exercises throughout the session.",
  courseId: "course1",
  courseName: "Web Development Fundamentals",
  type: "class",
  date: new Date().toISOString(),
  startTime: "14:00",
  endTime: "15:30",
  link: "https://meet.example.com/abc123",
  isRecurring: true,
  attendees: [
    { id: "student1", name: "Alex Johnson", email: "alex@example.com", status: "present", avatar: "" },
    { id: "student2", name: "Jamie Smith", email: "jamie@example.com", status: "present", avatar: "" },
    { id: "student3", name: "Taylor Brown", email: "taylor@example.com", status: "absent", avatar: "" },
    { id: "student4", name: "Jordan Wilson", email: "jordan@example.com", status: "present", avatar: "" },
    { id: "student5", name: "Casey Miller", email: "casey@example.com", status: "late", avatar: "" },
  ],
  maxAttendees: 30,
  chatMessages: [
    { id: "msg1", userId: "teacher1", userName: "Dr. Richards", message: "Welcome to the class everyone! Today we'll be covering JavaScript fundamentals.", timestamp: new Date(Date.now() - 600000).toISOString() },
    { id: "msg2", userId: "student1", userName: "Alex Johnson", message: "Looking forward to it! I've been practicing my JavaScript.", timestamp: new Date(Date.now() - 540000).toISOString() },
    { id: "msg3", userId: "student4", userName: "Jordan Wilson", message: "Will we be covering arrow functions today?", timestamp: new Date(Date.now() - 300000).toISOString() },
    { id: "msg4", userId: "teacher1", userName: "Dr. Richards", message: "Yes, arrow functions are on our agenda! We'll be covering them in the second half.", timestamp: new Date(Date.now() - 240000).toISOString() },
  ]
};

const MeetingDetail = () => {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.id as string;
  
  const [meeting, setMeeting] = useState<any>(MEETING);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  
  useEffect(() => {
    // In a real implementation, fetch meeting data from API
    // Example:
    // const fetchMeetingData = async () => {
    //   try {
    //     const response = await fetch(`/api/meetings/${meetingId}`);
    //     const data = await response.json();
    //     setMeeting(data);
    //   } catch (error) {
    //     console.error("Error fetching meeting data:", error);
    //   }
    // };
    // fetchMeetingData();
  }, [meetingId]);
  
  const handleStartMeeting = () => {
    setHasStarted(true);
    toast.success("Meeting started successfully");
  };
  
  const handleEndMeeting = () => {
    setHasStarted(false);
    toast.success("Meeting ended successfully");
    // Redirect to meetings list after delay
    setTimeout(() => {
      router.push("/teacher/meetings");
    }, 1500);
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    const newMessage = {
      id: `msg${meeting.chatMessages.length + 1}`,
      userId: "teacher1",
      userName: "Dr. Richards",
      message: chatMessage,
      timestamp: new Date().toISOString(),
    };
    
    setMeeting({
      ...meeting,
      chatMessages: [...meeting.chatMessages, newMessage],
    });
    
    setChatMessage("");
  };
  
  const copyMeetingLink = () => {
    navigator.clipboard.writeText(meeting.link);
    toast.success("Meeting link copied to clipboard");
  };
  
  const sendInviteEmail = (email: string) => {
    // In a real app, this would call an API to send an email
    toast.success(`Invitation sent to ${email}`);
    setShowInviteDialog(false);
  };
  
  const getAttendanceStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-600";
      case "late":
        return "bg-amber-600";
      case "absent":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };
  
  const toggleAttendanceStatus = (studentId: string) => {
    const statuses = ["present", "late", "absent"];
    
    setMeeting({
      ...meeting,
      attendees: meeting.attendees.map((attendee: any) => {
        if (attendee.id === studentId) {
          const currentStatusIndex = statuses.indexOf(attendee.status);
          const nextStatusIndex = (currentStatusIndex + 1) % statuses.length;
          return { ...attendee, status: statuses[nextStatusIndex] };
        }
        return attendee;
      }),
    });
  };
  
  if (!meeting) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Meeting Not Found</h2>
        <p className="text-gray-400 mb-6">The meeting you are looking for doesn't exist or you don't have access to it.</p>
        <Button onClick={() => router.push("/teacher/meetings")}>
          Back to Meetings
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => router.push("/teacher/meetings")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{meeting.title}</h1>
            <p className="text-sm text-gray-400">{meeting.courseName}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!hasStarted ? (
            <Button onClick={handleStartMeeting}>
              <Video className="mr-2 h-4 w-4" />
              Start Meeting
            </Button>
          ) : (
            <Button 
              variant="destructive" 
              onClick={handleEndMeeting}
            >
              <Phone className="mr-2 h-4 w-4" />
              End Meeting
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Video Panel */}
          <Card className="bg-customgreys-secondarybg border-gray-700 overflow-hidden">
            <div className="relative bg-customgreys-primarybg aspect-video flex items-center justify-center">
              {hasStarted ? (
                <div className="w-full h-full">
                  {isVideoOn ? (
                    <div className="w-full h-full bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center">
                      {/* This would be replaced with actual video component */}
                      <Video className="h-16 w-16 text-primary-500" />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-customgreys-darkerGrey flex flex-col items-center justify-center">
                      <CameraOff className="h-16 w-16 text-gray-500 mb-4" />
                      <p className="text-gray-400">Camera is turned off</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <Video className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Meeting Not Started</h3>
                  <p className="text-gray-400 mb-6 max-w-md">
                    Click the "Start Meeting" button to begin the virtual meeting
                  </p>
                </div>
              )}
              
              {hasStarted && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-customgreys-primarybg rounded-full p-1 shadow-lg">
                  <Button 
                    variant={isAudioOn ? "default" : "destructive"} 
                    size="icon" 
                    className="rounded-full" 
                    onClick={() => setIsAudioOn(!isAudioOn)}
                  >
                    {isAudioOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </Button>
                  <Button 
                    variant={isVideoOn ? "default" : "destructive"} 
                    size="icon" 
                    className="rounded-full" 
                    onClick={() => setIsVideoOn(!isVideoOn)}
                  >
                    {isVideoOn ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
                  </Button>
                  <Button 
                    variant={isScreenSharing ? "default" : "outline"} 
                    size="icon" 
                    className="rounded-full" 
                    onClick={() => setIsScreenSharing(!isScreenSharing)}
                  >
                    <ScreenShare className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full" 
                    onClick={() => setShowInviteDialog(true)}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full"
                    onClick={copyMeetingLink}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </Card>
          
          {/* Meeting Info and Chat */}
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="bg-customgreys-secondarybg border-b border-gray-700 rounded-none p-0 h-12 w-full">
              <TabsTrigger
                value="chat"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-500 data-[state=active]:bg-transparent px-6 flex-1"
              >
                Chat
              </TabsTrigger>
              <TabsTrigger
                value="info"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-500 data-[state=active]:bg-transparent px-6 flex-1"
              >
                Meeting Info
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary-500 data-[state=active]:bg-transparent px-6 flex-1"
              >
                Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="pt-6">
              <Card className="bg-customgreys-secondarybg border-gray-700 h-[400px] flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Chat</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto space-y-4 p-4">
                  {meeting.chatMessages.map((message: any) => (
                    <div 
                      key={message.id} 
                      className={`flex gap-3 ${message.userId === 'teacher1' ? 'justify-end' : ''}`}
                    >
                      {message.userId !== 'teacher1' && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary-700 text-xs">
                            {message.userName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-[80%] ${message.userId === 'teacher1' ? 'bg-primary-700' : 'bg-customgreys-primarybg'} p-3 rounded-lg`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{message.userName}</span>
                          <span className="text-xs text-gray-400">
                            {format(new Date(message.timestamp), "h:mm a")}
                          </span>
                        </div>
                        <p className="text-sm">{message.message}</p>
                      </div>
                      {message.userId === 'teacher1' && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary-700 text-xs">
                            DR
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="border-t border-gray-700 p-4">
                  <form onSubmit={handleSendMessage} className="w-full flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      className="bg-customgreys-primarybg border-gray-700"
                      disabled={!hasStarted}
                    />
                    <Button type="submit" size="sm" disabled={!hasStarted}>
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </form>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="info" className="pt-6">
              <Card className="bg-customgreys-secondarybg border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">Meeting Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Description</h3>
                    <p className="text-sm text-gray-300 whitespace-pre-line bg-customgreys-primarybg p-3 rounded-md">
                      {meeting.description || "No description provided"}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Date & Time</h3>
                      <div className="bg-customgreys-primarybg p-3 rounded-md">
                        <div className="flex items-center text-sm mb-2">
                          <Calendar className="h-4 w-4 mr-2 text-primary-500" />
                          <span>{format(new Date(meeting.date), "EEEE, MMMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-amber-500" />
                          <span>{meeting.startTime} - {meeting.endTime}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Meeting Link</h3>
                      <div className="bg-customgreys-primarybg p-3 rounded-md">
                        <div className="flex justify-between items-center">
                          <p className="text-sm truncate max-w-[80%]">{meeting.link}</p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={copyMeetingLink}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="bg-gray-700" />
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium">Attendance</h3>
                      <Badge variant="outline">
                        {meeting.attendees.filter((a: any) => a.status === "present" || a.status === "late").length} / {meeting.maxAttendees}
                      </Badge>
                    </div>
                    <div className="bg-customgreys-primarybg rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-700 hover:bg-transparent">
                            <TableHead className="text-gray-400 w-[40%]">Name</TableHead>
                            <TableHead className="text-gray-400 w-[40%]">Email</TableHead>
                            <TableHead className="text-gray-400 text-right w-[20%]">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {meeting.attendees.map((attendee: any) => (
                            <TableRow 
                              key={attendee.id} 
                              className="border-gray-700 hover:bg-customgreys-secondarybg"
                            >
                              <TableCell className="font-medium">{attendee.name}</TableCell>
                              <TableCell>{attendee.email}</TableCell>
                              <TableCell className="text-right">
                                <Badge 
                                  className={`cursor-pointer ${getAttendanceStatusColor(attendee.status)}`}
                                  onClick={() => toggleAttendanceStatus(attendee.id)}
                                >
                                  {attendee.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="pt-6">
              <Card className="bg-customgreys-secondarybg border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">Meeting Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-customgreys-primarybg border-gray-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Audio & Video</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Mute participants on entry</span>
                          <Switch />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Allow participants to unmute</span>
                          <Switch checked={true} />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Allow participants to share screen</span>
                          <Switch checked={true} />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-customgreys-primarybg border-gray-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Chat & Recording</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Enable chat</span>
                          <Switch checked={true} />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Allow private messages</span>
                          <Switch />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Record meeting</span>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <Card className="bg-customgreys-secondarybg border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg">Participants ({meeting.attendees.length})</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto">
              <div className="space-y-2">
                {/* Host */}
                <div className="bg-customgreys-primarybg flex items-center justify-between p-3 rounded-md">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary-700">DR</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Dr. Richards (You)</p>
                      <p className="text-xs text-gray-400">Host</p>
                    </div>
                  </div>
                  <Badge className="bg-primary-700">Host</Badge>
                </div>
                
                {/* Participants */}
                {meeting.attendees.map((attendee: any) => (
                  <div 
                    key={attendee.id} 
                    className="bg-customgreys-primarybg flex items-center justify-between p-3 rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gray-700">
                          {attendee.name.charAt(0)}
                        </AvatarFallback>
                        {attendee.avatar && (
                          <AvatarImage src={attendee.avatar} />
                        )}
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{attendee.name}</p>
                        <p className="text-xs text-gray-400">Student</p>
                      </div>
                    </div>
                    <Badge className={getAttendanceStatusColor(attendee.status)}>
                      {attendee.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-700 p-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowInviteDialog(true)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Participants
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="bg-customgreys-secondarybg border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={copyMeetingLink}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Meeting Link
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setShowInviteDialog(true)}
              >
                <Mail className="mr-2 h-4 w-4" />
                Email Invitations
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
              >
                <List className="mr-2 h-4 w-4" />
                Take Attendance
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
              >
                <Settings className="mr-2 h-4 w-4" />
                Meeting Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="bg-customgreys-primarybg border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Participants</DialogTitle>
            <DialogDescription>
              Share the meeting link or send email invitations.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Meeting Link</label>
              <div className="flex">
                <Input
                  readOnly
                  value={meeting.link}
                  className="bg-customgreys-secondarybg border-gray-700 rounded-r-none"
                />
                <Button 
                  variant="secondary" 
                  className="rounded-l-none"
                  onClick={copyMeetingLink}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Separator className="bg-gray-700" />
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Send Email Invitation</label>
              <Input
                placeholder="Enter email address"
                className="bg-customgreys-secondarybg border-gray-700"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowInviteDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => sendInviteEmail("example@email.com")}>
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MeetingDetail; 