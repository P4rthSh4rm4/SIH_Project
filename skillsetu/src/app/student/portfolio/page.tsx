"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FolderGit2, Plus, Image as ImageIcon, Link as LinkIcon, 
  Trash2, Loader2, Code, Trophy, Briefcase, ExternalLink
} from "lucide-react";
import { usePortfolio } from "@/lib/hooks/usePortfolio";
import { toast } from "sonner";
import { awardXp } from "@/lib/supabase/queries";
import Image from "next/image";

export default function PortfolioPage() {
  const { items, loading, addItem, deleteItem } = usePortfolio();
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [type, setType] = useState<"project" | "achievement" | "internship">("project");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      toast.error("Title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const { success, error } = await addItem({ type, title, description, url }, imageFile);
      if (success) {
        toast.success("Portfolio item added!");
        setIsAdding(false);
        // Reset form
        setTitle("");
        setDescription("");
        setUrl("");
        setImageFile(null);
        await awardXp("portfolio_item_added");
      } else {
        toast.error(error || "Failed to add item");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    setDeletingId(id);
    try {
      const { success, error } = await deleteItem(id);
      if (success) {
        toast.success("Item deleted");
      } else {
        toast.error(error || "Failed to delete item");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const getTypeIcon = (itemType: string) => {
    switch (itemType) {
      case "project": return Code;
      case "achievement": return Trophy;
      case "internship": return Briefcase;
      default: return FolderGit2;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-muted-foreground mt-1">Loading your projects and achievements...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-muted-foreground mt-1">
            Showcase your projects, internships, and key achievements.
          </p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="w-4 h-4 mr-2" /> {isAdding ? "Cancel" : "Add Item"}
        </Button>
      </div>

      {isAdding && (
        <Card className="border-primary/50 shadow-sm mb-8 animate-in fade-in slide-in-from-top-4">
          <CardHeader>
            <CardTitle className="text-lg">Add New Portfolio Item</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Item Type</Label>
                  <div className="flex gap-2">
                    {(["project", "achievement", "internship"] as const).map((t) => (
                      <Badge 
                        key={t}
                        variant={type === t ? "default" : "outline"}
                        className="cursor-pointer capitalize py-1.5 px-3"
                        onClick={() => setType(t)}
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input 
                    id="title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder={`E.g., ${type === 'project' ? 'E-commerce Platform' : type === 'achievement' ? 'Hackathon Winner' : 'Software Engineering Intern'}`}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe what you did, technologies used, or impact made."
                    className="resize-none h-20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">Link / URL (Optional)</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="url" 
                      type="url"
                      value={url} 
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://github.com/..."
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Cover Image (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => document.getElementById('image-upload')?.click()}
                      className="w-full justify-start text-muted-foreground font-normal"
                    >
                      <ImageIcon className="w-4 h-4 mr-2" /> 
                      {imageFile ? imageFile.name : "Upload image (JPG/PNG)"}
                    </Button>
                    <input 
                      id="image-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    />
                    {imageFile && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => setImageFile(null)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Save Item"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {items.length === 0 && !isAdding ? (
        <Card className="border-border/50 border-dashed bg-secondary/20">
          <CardContent className="p-12 text-center text-muted-foreground">
            <FolderGit2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Your portfolio is empty</p>
            <p className="text-sm mb-4">Add your projects and achievements to stand out to recruiters.</p>
            <Button variant="outline" onClick={() => setIsAdding(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add First Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const Icon = getTypeIcon(item.type);
            const isDeleting = deletingId === item.id;
            
            return (
              <Card key={item.id} className="border-border/50 hover:border-primary/30 transition-all flex flex-col overflow-hidden group">
                {item.image_url ? (
                  <div className="relative w-full h-40 bg-secondary border-b border-border/50 overflow-hidden">
                    <Image 
                      src={item.image_url} 
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <Badge className="absolute top-3 right-3 capitalize shadow-sm backdrop-blur-sm bg-background/80 text-foreground">
                      <Icon className="w-3 h-3 mr-1" /> {item.type}
                    </Badge>
                  </div>
                ) : (
                  <div className="w-full h-24 bg-gradient-to-br from-secondary to-muted border-b border-border/50 flex items-center justify-center relative">
                    <Icon className="w-10 h-10 text-muted-foreground/30" />
                    <Badge className="absolute top-3 right-3 capitalize shadow-sm">
                      <Icon className="w-3 h-3 mr-1" /> {item.type}
                    </Badge>
                  </div>
                )}
                
                <CardContent className="p-5 flex-1">
                  <h3 className="font-semibold text-lg line-clamp-1 mb-2" title={item.title}>
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {item.description}
                    </p>
                  )}
                </CardContent>
                
                <CardFooter className="p-4 pt-0 flex justify-between items-center border-t border-border/10 mt-auto bg-muted/10">
                  {item.url ? (
                    <Button variant="ghost" size="sm" asChild className="h-8 px-2 -ml-2 text-muted-foreground hover:text-primary">
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-1.5" /> View link
                      </a>
                    </Button>
                  ) : <span />}
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    disabled={isDeleting}
                    onClick={() => handleDelete(item.id)}
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
