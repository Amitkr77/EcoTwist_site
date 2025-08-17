"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Edit,
  Trash2,
  Eye,
  Search,
  Plus,
  Upload,
  Save,
  FileText,
  ImageOff,
  Image as ImageIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const page = () => {
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState({
    title: "",
    slug: "",
    content: "",
    headerImage: "",
    tags: [],
    status: "draft",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagInput, setTagInput] = useState("");
  const [previewPost, setPreviewPost] = useState(null);
  const [showHeaderPreview, setShowHeaderPreview] = useState(true);
  const { toast } = useToast();

  const [prefersDark, setPrefersDark] = useState(false);
  useEffect(() => {
    setPrefersDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("posts") || "[]");
    setPosts(stored.length ? stored : mockData());
  }, []);

  useEffect(() => {
    localStorage.setItem("posts", JSON.stringify(posts));
  }, [posts]);

  const mockData = () => [
    {
      id: "1",
      title: "Sustainable Gifting: A Complete Guide",
      slug: "sustainable-gifting-guide",
      content: "Discover eco-friendly choices for corporate gifts...",
      headerImage:
        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800",
      tags: ["sustainability", "corporate", "eco-friendly"],
      status: "published",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-15",
    },
    {
      id: "2",
      title: "The Impact of Bamboo Products",
      slug: "bamboo-products-impact",
      content: "Explore the benefits of bamboo products...",
      headerImage:
        "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800",
      tags: ["bamboo", "environment", "materials"],
      status: "draft",
      createdAt: "2024-01-10",
      updatedAt: "2024-01-12",
    },
  ];

  const generateSlug = (title) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleTitleChange = (title) => {
    setCurrentPost((prev) => ({
      ...prev,
      title,
      slug: isEditing ? prev.slug : generateSlug(title),
    }));
  };

  const handleTagsChange = (tagsString) => {
    setTagInput(tagsString);
    const tags = tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    setCurrentPost((prev) => ({ ...prev, tags }));
  };

  const handleSave = (status) => {
    if (!currentPost.title || !currentPost.content) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    const newPost = {
      ...currentPost,
      id: isEditing ? currentPost.id : Date.now().toString(),
      slug: currentPost.slug || generateSlug(currentPost.title),
      status,
      createdAt: isEditing
        ? currentPost.createdAt
        : new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    setPosts((prev) =>
      isEditing
        ? prev.map((p) => (p.id === newPost.id ? newPost : p))
        : [newPost, ...prev]
    );

    toast({
      title: "Success",
      description: `Post ${
        status === "published" ? "published" : "saved as draft"
      } successfully.`,
    });

    resetForm();
  };

  const handleEdit = (post) => {
    setCurrentPost(post);
    setTagInput(post.tags.join(", "));
    setIsEditing(true);
  };

  const handleDelete = (id) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    toast({ title: "Deleted", description: "Post removed successfully." });
  };

  const resetForm = () => {
    setCurrentPost({
      title: "",
      slug: "",
      content: "",
      headerImage: "",
      tags: [],
      status: "draft",
    });
    setTagInput("");
    setIsEditing(false);
  };

  const filteredPosts = posts.filter((post) => {
    const term = searchTerm.toLowerCase();
    return (
      (statusFilter === "all" || post.status === statusFilter) &&
      (post.title.toLowerCase().includes(term) ||
        post.slug.toLowerCase().includes(term))
    );
  });

  const highlight = (text) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    return (
      <span
        dangerouslySetInnerHTML={{
          __html: text.replace(regex, "<mark>$1</mark>"),
        }}
      />
    );
  };

  return (
    <div className="min-h-screen p-6 bg-white lg:p-12 ">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Blog Manager</h1>
          <p className="text-gray-500">Manage your blog posts with ease</p>
        </div>

        {/* Form & List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {isEditing ? "Edit Post" : "Create Post"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label>Title *</Label>
              <Input
                value={currentPost.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter post title"
              />

              <Label>Slug</Label>
              <Input
                value={currentPost.slug}
                onChange={(e) =>
                  setCurrentPost((p) => ({ ...p, slug: e.target.value }))
                }
                placeholder="Enter slug"
              />

              <Label>Header Image URL</Label>
              <div className="flex gap-2">
                <Input
                  value={currentPost.headerImage}
                  onChange={(e) =>
                    setCurrentPost((p) => ({
                      ...p,
                      headerImage: e.target.value,
                    }))
                  }
                />
                <Button
                  onClick={() => setShowHeaderPreview((p) => !p)}
                  variant="outline"
                  size="icon"
                >
                  {showHeaderPreview ? (
                    <ImageOff className="w-4 h-4" />
                  ) : (
                    <ImageIcon className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {showHeaderPreview && currentPost.headerImage && (
                <img
                  src={currentPost.headerImage}
                  className="w-full h-32 object-cover rounded border"
                  alt="Header preview"
                />
              )}

              <Label>Content *</Label>
              <Textarea
                value={currentPost.content}
                onChange={(e) =>
                  setCurrentPost((p) => ({ ...p, content: e.target.value }))
                }
                rows={8}
              />
              <div className="text-sm text-gray-400 text-right">
                {currentPost.content.length} characters
              </div>

              <Label>Tags (comma-separated)</Label>
              <Input
                value={tagInput}
                onChange={(e) => handleTagsChange(e.target.value)}
              />
              <div className="flex flex-wrap gap-1 mt-1">
                {currentPost.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => handleSave("draft")}
                  disabled={!currentPost.title || !currentPost.content}
                  variant="outline"
                >
                  <Save className="w-4 h-4 mr-2" /> Save Draft
                </Button>
                <Button
                  onClick={() => handleSave("published")}
                  disabled={!currentPost.title || !currentPost.content}
                >
                  Publish
                </Button>
                {isEditing && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost">Cancel</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Your unsaved changes will be lost.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Go Back</AlertDialogCancel>
                        <AlertDialogAction onClick={resetForm}>
                          Discard
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardContent>
          </Card>

          {/* List */}
          <Card>
            <CardHeader>
              <CardTitle>All Posts ({filteredPosts.length})</CardTitle>
              <div className="flex gap-2 mt-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                  <Input
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search posts..."
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="overflow-auto max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="font-medium">
                          {highlight(post.title)}
                        </div>
                        <div className="text-sm text-gray-500">{post.slug}</div>
                      </TableCell>
                      <TableCell>
                        <Badge>{post.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {post.createdAt}
                      </TableCell>
                      <TableCell className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setPreviewPost(post)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(post)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Blog Post
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete{" "}
                                <b>{post.title}</b>?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(post.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {!filteredPosts.length && (
                <div className="text-center text-gray-500 py-6">
                  No posts found.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview Dialog */}
        <Dialog open={!!previewPost} onOpenChange={() => setPreviewPost(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
            {previewPost && (
              <>
                <DialogHeader>
                  <DialogTitle>{previewPost.title}</DialogTitle>
                  <DialogDescription className="flex items-center gap-3 text-sm text-gray-600">
                    <Badge>{previewPost.status}</Badge>
                    Created: {previewPost.createdAt}
                  </DialogDescription>
                </DialogHeader>
                {previewPost.headerImage && (
                  <img
                    src={previewPost.headerImage}
                    className="rounded w-full h-64 object-cover"
                  />
                )}
                <div className="prose prose-sm max-w-none whitespace-pre-wrap mt-4">
                  {previewPost.content}
                </div>
                <div className="flex flex-wrap gap-1 mt-4">
                  {previewPost.tags.map((tag, i) => (
                    <Badge key={i} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default page;
