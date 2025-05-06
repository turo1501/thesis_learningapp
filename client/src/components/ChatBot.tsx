"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import { MessageCircle, X, Send, Loader2, Sparkles, Bot, Paperclip, Mic, ThumbsUp, ThumbsDown, Maximize2, Minimize2, User, Image as ImageIcon, BookOpen, School } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { toggleChat, addMessage, setLoading, ChatMessage } from "@/state/chatSlice";
import { useSendChatMessageMutation, useGetChatHistoryQuery, useSendChatFeedbackMutation, useGetChatCourseRecommendationsQuery } from "@/state/api";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Form, FormControl, FormField, FormItem } from "./ui/form";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { toast } from "sonner";

const messageSchema = z.object({
  message: z.string().min(1, "Please enter a message"),
});

type MessageFormValues = z.infer<typeof messageSchema>;

// Helper function to format code blocks in messages
const formatMessageContent = (content: string) => {
  // Process the content in stages for better formatting
  
  // First extract code blocks
  let formattedContent = content;
  const hasCodeBlocks = content.includes("```");
  
  if (hasCodeBlocks) {
    const parts = content.split("```");
    return (
      <>
        {parts.map((part, index) => {
          // Even indices are regular text, odd indices are code blocks
          if (index % 2 === 0) {
            // Process regular text for links and other formatting
            return <span key={index}>{formatTextWithLinks(part)}</span>;
          } else {
            // Handle code blocks with improved styling
            return (
              <pre key={index} className="bg-slate-800 p-4 rounded-md mt-3 mb-3 overflow-x-auto text-sm font-mono text-slate-50">
                <code>{part}</code>
              </pre>
            );
          }
        })}
      </>
    );
  }
  
  // If no code blocks, process for links
  return formatTextWithLinks(content);
};

// Helper to format text with clickable links
const formatTextWithLinks = (text: string) => {
  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // Split by URLs and create array of texts and links
  const parts = text.split(urlRegex);
  const matches = text.match(urlRegex) || [];
  
  // Return processed content
  return (
    <>
      {parts.map((part, index) => {
        // Check if this part is a URL
        const isUrl = matches.some(match => match === part);
        if (isUrl) {
          return (
            <a 
              key={index} 
              href={part} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 hover:underline break-all"
            >
              {part}
            </a>
          );
        }
        // Add paragraph breaks
        return <span key={index}>{part.split('\n\n').map((p, i) => 
          <span key={i}>
            {p}
            {i < part.split('\n\n').length - 1 && <br />}
            {i < part.split('\n\n').length - 1 && <br />}
          </span>
        )}</span>;
      })}
    </>
  );
};

// Client-side only ChatBot component
const ChatBot = () => {
  const dispatch = useAppDispatch();
  const { isOpen, messages, isLoading } = useAppSelector((state) => state.chat);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const [sendMessage] = useSendChatMessageMutation();
  const { data: chatHistory, error: chatHistoryError } = useGetChatHistoryQuery(user?.id || "", {
    skip: !user,
  });
  const [sendFeedback] = useSendChatFeedbackMutation();
  
  // Fetch course recommendations based on chat history
  const { data: courseRecommendations, isLoading: loadingRecommendations } = 
    useGetChatCourseRecommendationsQuery(user?.id || "", {
      skip: !user || messages.length < 3, // Only fetch when there's enough chat history
      pollingInterval: 900000, // Update every 15 minutes instead of 5
    });
  
  // Additional UI state
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [activeSuggestion, setActiveSuggestion] = useState<number | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [hasShownRecommendationHint, setHasShownRecommendationHint] = useState(false);
  const [hasRecommendations, setHasRecommendations] = useState(false);
  const [hasAnnouncedImprovement, setHasAnnouncedImprovement] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Client-side only code - use isMounted instead of isClient for clarity
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Enhanced suggestions for users that cover more topics
  const suggestions = [
    "How do I start learning React?",
    "What science courses do you offer?",
    "Are there any AI courses available?",
    "I'm interested in UX/UI design"
  ];
  
  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: "",
    },
  });

  // Load chat history if available
  useEffect(() => {
    if (chatHistory && chatHistory.messages && chatHistory.messages.length > 0) {
      // Clear any existing messages first to avoid duplicates
      dispatch({ type: 'chat/clearMessages' });
      
      chatHistory.messages.forEach((msg) => {
        if (msg && typeof msg.content === 'string' && msg.timestamp) {
          dispatch(
            addMessage({
              id: uuidv4(),
              content: msg.content,
              role: msg.role,
              timestamp: msg.timestamp,
            })
          );
        }
      });
    } else if (chatHistoryError) {
      console.error('Error loading chat history:', chatHistoryError);
      
      // Try to render a more informative error message
      let errorMessage = 'Could not load your chat history. Starting a new conversation.';
      if (chatHistoryError && typeof chatHistoryError === 'object') {
        const errorObj = chatHistoryError as any;
        if (errorObj.data?.message) {
          errorMessage = errorObj.data.message;
        } else if (errorObj.error) {
          errorMessage = errorObj.error;
        }
      }
      
      toast.error(errorMessage);
    }
  }, [chatHistory, dispatch, chatHistoryError]);

  // Track when recommendations are available
  useEffect(() => {
    if (courseRecommendations) {
      setHasRecommendations(true);
    }
  }, [courseRecommendations]);

  // Show notification when recommendations become available
  useEffect(() => {
    if (messages.length >= 5 && courseRecommendations && !hasShownRecommendationHint) {
      // Show a hint once that recommendations are available
      toast.info(
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4"/>
          <span>Course recommendations available. Click the book icon to view.</span>
        </div>,
        { duration: 4000 }
      );
      setHasShownRecommendationHint(true);
    }
  }, [messages.length, courseRecommendations, hasShownRecommendationHint]);

  // Notify users about improved AI capabilities
  useEffect(() => {
    if (isOpen && !hasAnnouncedImprovement) {
      setTimeout(() => {
        toast.success(
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4"/>
            <span>Our AI assistant has been improved with better course recommendations and smarter responses!</span>
          </div>,
          { duration: 5000 }
        );
        setHasAnnouncedImprovement(true);
      }, 1000);
    }
  }, [isOpen, hasAnnouncedImprovement]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, showRecommendations]);

  const onSubmit = async (data: MessageFormValues) => {
    const userMessage = {
      id: uuidv4(),
      content: data.message,
      role: "user" as const,
      timestamp: Date.now(),
    };

    dispatch(addMessage(userMessage));
    form.reset();
    
    // Hide suggestions after user sends a message
    setShowSuggestions(false);
    dispatch(setLoading(true));
    
    try {
      if (!user?.id) {
        throw new Error("User ID is not available");
      }

      const response = await sendMessage({
        message: data.message,
        userId: user.id,
      }).unwrap();
      
      // Validate that we got a proper response
      if (!response || !response.response) {
        throw new Error("Empty response from server");
      }
      
      // Add a small delay to make conversation feel more natural
      setTimeout(() => {
        dispatch(
          addMessage({
            id: response.id || uuidv4(),
            content: response.response,
            role: "bot",
            timestamp: Date.now(),
          })
        );
        dispatch(setLoading(false));
      }, 500);
    } catch (error: any) {
      console.error("Failed to send message:", {
        error,
        status: error?.status,
        data: error?.data,
        message: error?.message,
      });
      
      // Extract error message with better handling
      let errorMessage = "Sorry, I couldn't process your request. Please try again later.";
      
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.data?.error) {
        errorMessage = error.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      dispatch(
        addMessage({
          id: uuidv4(),
          content: errorMessage,
          role: "bot",
          timestamp: Date.now(),
        })
      );
      dispatch(setLoading(false));
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    form.setValue("message", suggestion);
    form.handleSubmit(onSubmit)();
  };
  
  const handleFeedback = async (messageId: string, isPositive: boolean) => {
    try {
      // Send feedback to the server
      const result = await sendFeedback({
        messageId,
        isPositive,
      }).unwrap();
      
      // Show a visual feedback to the user
      toast.success(`Thank you for your ${isPositive ? 'positive' : 'negative'} feedback!`);
    } catch (error) {
      console.error('Failed to send feedback:', error);
      toast.error('Could not save your feedback. Please try again.');
    }
  };
  
  const toggleExpandChat = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleRecommendations = () => {
    setShowRecommendations(!showRecommendations);
  };

  // Chat header with recommendations button
  const renderChatHeader = () => (
    <motion.div 
      className="chatbot__header bg-gradient-to-r from-primary-800 to-primary-600 py-3 px-4 flex justify-between items-center"
      layoutId="chatHeader"
    >
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8 border-2 border-primary-300">
          <AvatarImage src="/logo.svg" alt="Course Assistant" />
          <AvatarFallback className="bg-primary-500">
            <Bot className="w-4 h-4 text-white" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="chatbot__title text-white-100 font-medium flex items-center gap-1">
            Course Assistant <Sparkles className="w-3 h-3 text-yellow-300" />
          </h3>
          <p className="text-xs text-primary-200">AI-powered learning companion</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {hasRecommendations && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleRecommendations}
                  className={cn(
                    "p-0 hover:bg-primary-600/50 text-white-100 h-8 w-8 relative",
                    showRecommendations && "bg-primary-600/50"
                  )}
                >
                  <BookOpen className="w-4 h-4" />
                  {!hasShownRecommendationHint && (
                    <motion.span 
                      className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Course recommendations</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleExpandChat}
          className="p-0 hover:bg-primary-600/50 text-white-100 h-8 w-8"
        >
          {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(toggleChat())}
          className="p-0 hover:bg-primary-600/50 text-white-100 h-8 w-8"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );

  // Course recommendations component with improved animation
  const renderCourseRecommendations = () => {
    if (!showRecommendations || !courseRecommendations) return null;
    
    // Validate that we have recommendation content
    const recommendationText = courseRecommendations?.recommendations || '';
    if (!recommendationText.trim()) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: 10, height: 0 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 500, damping: 30 }}
          className="chatbot__recommendations bg-gradient-to-r from-primary-900/50 to-primary-800/50 rounded-lg p-4 mt-4 border border-primary-700/50"
        >
          <div className="flex items-center gap-2 mb-3">
            <School className="w-5 h-5 text-primary-300" />
            <h4 className="text-sm font-medium text-white-100">Recommended Courses</h4>
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-auto h-6 w-6 text-primary-300 hover:text-white-100"
              onClick={toggleRecommendations}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="text-sm text-white-100/90 whitespace-pre-wrap">
            No recommendations available yet. Continue chatting for personalized course suggestions.
          </div>
        </motion.div>
      );
    }
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: 10, height: 0 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 500, damping: 30 }}
        className="chatbot__recommendations bg-gradient-to-r from-primary-900/50 to-primary-800/50 rounded-lg p-4 mt-4 border border-primary-700/50"
      >
        <div className="flex items-center gap-2 mb-3">
          <School className="w-5 h-5 text-primary-300" />
          <h4 className="text-sm font-medium text-white-100">Recommended Courses</h4>
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto h-6 w-6 text-primary-300 hover:text-white-100"
            onClick={toggleRecommendations}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        <div className="text-sm text-white-100/90 whitespace-pre-wrap">
          {courseRecommendations.recommendations && formatMessageContent(courseRecommendations.recommendations)}
        </div>
      </motion.div>
    );
  };

  // Render nothing during server-side rendering or initial hydration
  if (!isMounted) {
    return null;
  }

  // Chat trigger button (when chat is not open)
  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => dispatch(toggleChat())}
                className="chatbot-trigger fixed bottom-6 right-6 rounded-full w-14 h-14 bg-primary-700 hover:bg-primary-600 flex items-center justify-center shadow-lg"
              >
                <Bot className="w-6 h-6" />
                <motion.div
                  className="absolute top-0 right-0 w-full h-full rounded-full border-4 border-primary-300"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.8, 0.2, 0], 
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Chat with our AI assistant</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "chatbot fixed bottom-6 right-6 bg-customgreys-darkGrey rounded-lg shadow-lg flex flex-col z-50 overflow-hidden",
          isExpanded ? "w-[480px] h-[600px]" : "w-96 h-[500px]"
        )}
      >
        {renderChatHeader()}

        <div 
          ref={chatContainerRef}
          className="chatbot__messages flex-1 overflow-y-auto p-4 space-y-4 bg-customgreys-darkGrey/95 backdrop-blur-sm"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <motion.div 
                className="chatbot__empty-state text-center text-customgreys-dirtyGrey p-6 bg-customgreys-foreground/10 rounded-lg backdrop-blur-sm max-w-[80%]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="mb-4 bg-primary-700/20 p-4 rounded-full inline-block">
                  <Bot className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className="text-lg font-medium text-white-100 mb-2">How can I help you today?</h3>
                <p className="text-sm text-customgreys-dirtyGrey mb-4">
                  I can answer questions about courses, recommend learning paths, and provide study resources.
                </p>
                
                {showSuggestions && (
                  <div className="grid gap-2">
                    {suggestions.map((suggestion, index) => (
                      <motion.button
                        key={index}
                        className={cn(
                          "text-sm text-left px-3 py-2 rounded-md border border-customgreys-foreground/30 hover:bg-customgreys-foreground/20 transition-colors",
                          activeSuggestion === index ? "bg-customgreys-foreground/30" : "bg-customgreys-foreground/10"
                        )}
                        onClick={() => handleSuggestionClick(suggestion)}
                        onMouseEnter={() => setActiveSuggestion(index)}
                        onMouseLeave={() => setActiveSuggestion(null)}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          ) : (
            <>
              {messages.map((msg, msgIndex) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: msgIndex === messages.length - 1 ? 0 : 0 }}
                  className={cn(
                    "chatbot__message flex items-start gap-2",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <Avatar className={cn(
                    "h-8 w-8 mt-1",
                    msg.role === "user" ? "border-2 border-primary-600" : "border-2 border-primary-300"
                  )}>
                    {msg.role === "user" ? (
                      <>
                        <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
                        <AvatarFallback className="bg-primary-600">
                          <User className="w-4 h-4 text-white" />
                        </AvatarFallback>
                      </>
                    ) : (
                      <>
                        <AvatarImage src="/logo.svg" alt="Course Assistant" />
                        <AvatarFallback className="bg-primary-500">
                          <Bot className="w-4 h-4 text-white" />
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg p-3 shadow-sm",
                      msg.role === "user"
                        ? "bg-primary-700 text-white-100 rounded-tr-none"
                        : "bg-customgreys-foreground text-white-100 rounded-tl-none"
                    )}
                  >
                    <div className="whitespace-pre-wrap">
                      {formatMessageContent(msg.content)}
                    </div>
                    <div className="text-xs opacity-70 mt-1 flex items-center justify-between">
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}</span>
                      
                      {msg.role === "bot" && (
                        <div className="flex gap-1 ml-2">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-5 w-5 opacity-50 hover:opacity-100"
                            onClick={() => handleFeedback(msg.id, true)}
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-5 w-5 opacity-50 hover:opacity-100"
                            onClick={() => handleFeedback(msg.id, false)}
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {renderCourseRecommendations()}
            </>
          )}
          
          {isLoading && (
            <motion.div 
              className="chatbot__loading flex items-center gap-2 text-customgreys-dirtyGrey p-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Avatar className="h-8 w-8 border-2 border-primary-300">
                <AvatarFallback className="bg-primary-500">
                  <Bot className="w-4 h-4 text-white" />
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center space-x-1.5 px-3 py-2 bg-customgreys-foreground/30 rounded-lg">
                <motion.div 
                  className="w-2 h-2 bg-customgreys-dirtyGrey rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.2 }}
                />
                <motion.div 
                  className="w-2 h-2 bg-customgreys-dirtyGrey rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.4, delay: 0.2 }}
                />
                <motion.div 
                  className="w-2 h-2 bg-customgreys-dirtyGrey rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.4, delay: 0.4 }}
                />
              </div>
            </motion.div>
          )}
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="chatbot__input-container border-t border-customgreys-foreground p-3 bg-customgreys-darkGrey"
          >
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="flex items-end space-x-2">
                  <div className="flex-1">
                    <FormControl>
                      <div className="flex w-full rounded-md border border-customgreys-foreground relative">
                        <Input
                          placeholder="Type your message..."
                          className="flex-1 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 pr-10"
                          {...field}
                          onKeyDown={(e) => {
                            if (e.key === 'ArrowUp' && messages.length > 0) {
                              // Find the last user message and set it as the current value
                              const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
                              if (lastUserMessage) {
                                e.preventDefault();
                                field.onChange(lastUserMessage.content);
                              }
                            }
                          }}
                        />
                        
                        <div className="absolute right-12 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  type="button" 
                                  size="icon" 
                                  variant="ghost"
                                  className="h-7 w-7 text-customgreys-dirtyGrey hover:text-white-100"
                                >
                                  <Paperclip className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p>Upload file (coming soon)</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  type="button" 
                                  size="icon" 
                                  variant="ghost"
                                  className="h-7 w-7 text-customgreys-dirtyGrey hover:text-white-100"
                                >
                                  <Mic className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p>Voice input (coming soon)</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        
                        <Button 
                          type="submit" 
                          size="icon"
                          disabled={isLoading}
                          className="rounded-l-none bg-primary-700 hover:bg-primary-600"
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatBot;