"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles, Send, Loader2, Bot, User, Brain, Briefcase,
  Trash2, Lightbulb, CheckCircle2
} from "lucide-react";
import { useCopilotChat } from "@/lib/hooks/useCopilotChat";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { useSkillAnalytics } from "@/lib/hooks/useSkillAnalytics";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

const SUGGESTIONS = [
  "What skills should I learn for Full-Stack Development?",
  "Review my current skill gaps.",
  "Give me a mock interview question for React.",
  "How can I improve my communication skills?",
];

export default function CopilotPage() {
  const { messages, isLoading, sendMessage, clearChat } = useCopilotChat();
  const { profile } = useUserProfile();
  const { skills } = useSkillAnalytics();

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent, textOverride?: string) => {
    e?.preventDefault();
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    setInput("");

    // Build context payload
    const studentContext = profile ? {
      name: profile.name,
      careerObjective: undefined,
      skills: skills.map(s => ({ name: s.name, proficiency: s.score })),
      education: undefined,
    } : undefined;

    await sendMessage(textToSend, studentContext);
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear the conversation?")) {
      clearChat();
      toast.success("Chat cleared");
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4 max-w-5xl mx-auto pb-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" /> Career Copilot
          </h1>
          <p className="text-muted-foreground mt-1">
            Your AI career mentor powered by Gemini 2.0 Flash.
          </p>
        </div>

        <div className="flex gap-2">
          {messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClear}>
              <Trash2 className="w-4 h-4 mr-2" /> Clear Chat
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">

        {/* Chat Area */}
        <Card className="lg:col-span-3 flex flex-col border-border/50 shadow-md h-full overflow-hidden">
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Hello, {profile?.name || 'there'}!</h3>
                <p className="text-muted-foreground">
                  I'm your personalized AI Career Mentor. I know about your verified skills and profile. How can I help you advance your career today?
                </p>

                <div className="w-full space-y-2 mt-4">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(undefined, s)}
                      className="w-full text-left p-3 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors text-sm text-muted-foreground hover:text-foreground flex items-center gap-3 group"
                    >
                      <Lightbulb className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-emerald-500/10 text-emerald-600'
                    }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-secondary/50 text-foreground rounded-tl-sm border border-border/50'
                    }`}>
                    <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : 'dark:prose-invert'} prose-p:leading-relaxed prose-pre:bg-background/80 prose-pre:border prose-pre:border-border/50`}>
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex gap-4 flex-row">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-emerald-500/10 text-emerald-600">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-secondary/50 text-foreground rounded-2xl rounded-tl-sm border border-border/50 p-4 flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"></span>
                  </div>
                  <span className="text-sm text-muted-foreground ml-2">Thinking...</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-background border-t border-border/50">
            <form
              onSubmit={handleSend}
              className="relative flex items-center"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about skills, interviews, or career advice..."
                className="pr-12 h-12 rounded-full bg-secondary/30 border-border/50 focus-visible:ring-1"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1.5 h-9 w-9 rounded-full"
                disabled={!input.trim() || isLoading}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
              </Button>
            </form>
            <p className="text-center text-[10px] text-muted-foreground mt-2">
              Copilot uses Gemini AI. Content may be inaccurate. Check your API key if it fails.
            </p>
          </div>
        </Card>

        {/* Sidebar Context panel (Hidden on small screens) */}
        <div className="hidden lg:flex flex-col gap-4">
          <Card className="border-border/50 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" /> Active Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                The Copilot is aware of your profile and can give personalized advice based on:
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium">Verified Skills</p>
                    <p className="text-[10px] text-muted-foreground">{skills.length} skills mapped</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium">Account Details</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-2">
                      {profile?.email || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" /> Top Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              {skills.length === 0 ? (
                <p className="text-xs text-muted-foreground">No skills mapped yet. Take an assessment to give Copilot more context.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {skills.slice(0, 10).map(s => (
                    <Badge key={s.id} variant="secondary" className="text-[10px] bg-secondary/50">
                      {s.name}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
