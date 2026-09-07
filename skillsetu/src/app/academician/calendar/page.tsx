"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, MapPin, Clock, Video } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Mock data for the current month
const MOCK_EVENTS = [
  { day: 5, title: "1-on-1 Mentorship: Parth", type: "Mentorship", time: "2:00 PM", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { day: 6, title: "Advanced Pedagogy FDP", type: "FDP", time: "9:00 AM", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { day: 12, title: "Research Paper Review", type: "Research", time: "4:00 PM", color: "bg-violet-100 text-violet-700 border-violet-200" },
  { day: 15, title: "Consultancy Kick-off", type: "Consultancy", time: "11:30 AM", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { day: 18, title: "Mentorship Check-in: Parth", type: "Mentorship", time: "3:00 PM", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { day: 22, title: "AI/ML Workshop Series", type: "FDP", time: "10:00 AM", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { day: 25, title: "Industry Sync: Fintech Models", type: "Consultancy", time: "2:00 PM", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { day: 28, title: "Final Review: Parth Project", type: "Mentorship", time: "1:00 PM", color: "bg-amber-100 text-amber-700 border-amber-200" },
];

const DAYS_IN_MONTH = 31;
const STARTING_DAY_OF_WEEK = 3; // 0 = Sun, 1 = Mon, ..., 3 = Wed

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  // Create an array of days to render the grid
  const daysArray = Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: STARTING_DAY_OF_WEEK }, (_, i) => i);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-8 h-8 text-emerald-500" />
            My Calendar
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Manage your schedule, upcoming FDPs, research deadlines, and student mentorship sessions.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/academician/dashboard">Back to Dashboard</Link>
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" /> New Event
          </Button>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/20 border-b border-border/50 py-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-foreground">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <div className="flex items-center gap-1 bg-background border border-border/50 rounded-lg p-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentMonth(prev => (prev === 0 ? 11 : prev - 1))}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs font-medium px-2">Today</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentMonth(prev => (prev === 11 ? 0 : prev + 1))}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1 bg-background border border-border/50 rounded-lg p-1">
            <Button variant="ghost" size="sm" className="h-7 text-xs bg-muted">Month</Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs">Week</Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs">Day</Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b border-border/50 bg-muted/10">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider border-r border-border/50 last:border-r-0">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 auto-rows-[120px] bg-border/30 gap-[1px]">
            {paddingDays.map(i => (
              <div key={`empty-${i}`} className="bg-background opacity-50 p-2" />
            ))}
            
            {daysArray.map(day => {
              const dayEvents = MOCK_EVENTS.filter(e => e.day === day);
              const isToday = day === 5; // Hardcoded "today" for demo

              return (
                <div key={day} className={`bg-background p-2 transition-colors hover:bg-muted/10 overflow-hidden flex flex-col group ${isToday ? 'bg-emerald-50/20' : ''}`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-emerald-500 text-white' : 'text-foreground'}`}>
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        {dayEvents.length} events
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-1 no-scrollbar pb-1">
                    {dayEvents.map((event, idx) => (
                      <div 
                        key={idx} 
                        className={`text-[10px] sm:text-xs px-1.5 py-1 rounded border leading-tight truncate font-medium flex items-center gap-1 ${event.color}`}
                        title={`${event.time} - ${event.title}`}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0" />
                        <span className="truncate">{event.time} - {event.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 items-center justify-center text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-amber-100 border border-amber-200"></div>
          <span>Mentorship</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200"></div>
          <span>FDPs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-violet-100 border border-violet-200"></div>
          <span>Research</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200"></div>
          <span>Consultancy</span>
        </div>
      </div>
    </div>
  );
}
