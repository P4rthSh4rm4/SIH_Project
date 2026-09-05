"use client";

import { useState, useCallback } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: number;
}

export function useCopilotChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (
      content: string,
      studentContext?: {
        name?: string;
        careerObjective?: string;
        skills?: Array<{ name: string; proficiency: number }>;
        education?: string;
        completedAssessmentsCount?: number;
      }
    ) => {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        // Build conversation history for the API
        const apiMessages = [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch("/api/gemini/copilot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages, studentContext }),
        });

        if (!res.ok) throw new Error("Failed to get AI response");

        const data = await res.json();

        const aiMsg: ChatMessage = {
          id: `model-${Date.now()}`,
          role: "model",
          content: data.reply,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, aiMsg]);
      } catch (err) {
        const errorMsg: ChatMessage = {
          id: `error-${Date.now()}`,
          role: "model",
          content:
            "I'm sorry, I couldn't process your request. Please check your API key configuration and try again.",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMsg]);
        console.error("[useCopilotChat] error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [messages]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, isLoading, sendMessage, clearChat };
}
