"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { toggleChat, addMessage, setLoading, ChatMessage } from "@/state/chatSlice";
import { useSendChatMessageMutation, useGetChatHistoryQuery } from "@/state/api";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Form, FormControl, FormField, FormItem } from "./ui/form";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

const messageSchema = z.object({
  message: z.string().min(1, "Please enter a message"),
});

type MessageFormValues = z.infer<typeof messageSchema>;

const ChatBot = () => {
  const dispatch = useAppDispatch();
  const { isOpen, messages, isLoading } = useAppSelector((state) => state.chat);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const [sendMessage] = useSendChatMessageMutation();
  const { data: chatHistory } = useGetChatHistoryQuery(user?.id || "", {
    skip: !user,
  });

  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: "",
    },
  });

  // Load chat history if available
  useEffect(() => {
    if (chatHistory && chatHistory.messages.length > 0) {
      chatHistory.messages.forEach((msg) => {
        dispatch(
          addMessage({
            id: uuidv4(),
            content: msg.content,
            role: msg.role,
            timestamp: msg.timestamp,
          })
        );
      });
    }
  }, [chatHistory, dispatch]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const onSubmit = async (data: MessageFormValues) => {
    const userMessage = {
      id: uuidv4(),
      content: data.message,
      role: "user" as const,
      timestamp: Date.now(),
    };

    dispatch(addMessage(userMessage));
    form.reset();
    
    dispatch(setLoading(true));
    
    try {
      if (!user?.id) {
        throw new Error("User ID is not available");
      }

      const response = await sendMessage({
        message: data.message,
        userId: user.id,
      }).unwrap();
      
      dispatch(
        addMessage({
          id: response.id,
          content: response.response,
          role: "bot",
          timestamp: Date.now(),
        })
      );
    } catch (error: any) {
      console.error("Failed to send message:", {
        error,
        status: error?.status,
        data: error?.data,
        message: error?.message,
      });
      
      const errorMessage = error?.data?.message || error?.message || "Sorry, I couldn't process your request. Please try again later.";
      
      dispatch(
        addMessage({
          id: uuidv4(),
          content: errorMessage,
          role: "bot",
          timestamp: Date.now(),
        })
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => dispatch(toggleChat())}
        className="chatbot-trigger fixed bottom-6 right-6 rounded-full w-12 h-12 bg-primary-700 hover:bg-primary-600 flex items-center justify-center shadow-lg"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <div className="chatbot fixed bottom-6 right-6 w-96 h-[500px] bg-customgreys-darkGrey rounded-lg shadow-lg flex flex-col z-50 overflow-hidden">
      <div className="chatbot__header bg-primary-700 py-3 px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/logo.svg" alt="Course Assistant" />
            <AvatarFallback>CA</AvatarFallback>
          </Avatar>
          <h3 className="chatbot__title text-white-100 font-medium">Course Assistant</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(toggleChat())}
          className="chatbot__close-btn p-0 hover:bg-primary-600 text-white-100"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div 
        ref={chatContainerRef}
        className="chatbot__messages flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="chatbot__empty-state text-center text-customgreys-dirtyGrey p-4">
            <p>How can I help you with your courses today?</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "chatbot__message flex items-start gap-2",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <Avatar className="h-8 w-8 mt-1">
                {msg.role === "user" ? (
                  <>
                    <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
                    <AvatarFallback>{user?.firstName?.[0] || "U"}</AvatarFallback>
                  </>
                ) : (
                  <>
                    <AvatarImage src="/logo.svg" alt="Course Assistant" />
                    <AvatarFallback>CA</AvatarFallback>
                  </>
                )}
              </Avatar>
              <div
                className={cn(
                  "max-w-[75%] rounded-lg p-3",
                  msg.role === "user"
                    ? "bg-primary-700 text-white-100"
                    : "bg-customgreys-foreground text-white-100"
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <div className="text-xs opacity-70 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="chatbot__loading flex items-center justify-center py-2">
            <Loader2 className="w-5 h-5 animate-spin text-customgreys-dirtyGrey" />
          </div>
        )}
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="chatbot__input-container border-t border-customgreys-foreground p-3"
        >
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <div className="flex w-full rounded-md border border-customgreys-foreground">
                    <Input
                      placeholder="Type your message..."
                      className="flex-1 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                      {...field}
                    />
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
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
};

export default ChatBot;