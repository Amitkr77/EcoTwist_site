import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  FileText,
  Plus,
  Eye,
  Calendar,
  TrendingUp,
  Search,
  Users,
  BookOpen,
  ImageIcon,
  Save,
  ImageOff,
  Trash2,
  Edit2
} from "lucide-react";
import toast from "react-hot-toast";
import category from "@/models/category";

const mockBlogPosts = [
  {
    id: 1,
    title: "10 Ways to Live More Sustainably",
    status: "published",
    views: 1534,
    publishDate: "2024-01-10",
    author: "Sarah Johnson",
    category: "Lifestyle",
    readTime: "5 min",
  },
  {
    id: 2,
    title: "The Future of Eco-Friendly Products",
    status: "draft",
    views: 0,
    publishDate: null,
    author: "Mike Chen",
    category: "Technology",
    readTime: "8 min",
  },
  {
    id: 3,
    title: "Our Carbon Footprint Reduction Journey",
    status: "scheduled",
    views: 0,
    publishDate: "2024-01-20",
    author: "Emily Davis",
    category: "Company",
    readTime: "6 min",
  },
  {
    id: 4,
    title: "Sustainable Business Practices Guide",
    status: "published",
    views: 2847,
    publishDate: "2024-01-08",
    author: "David Wilson",
    category: "Business",
    readTime: "12 min",
  },
];

const contentPerformanceData = [
  { date: "2024-01-10", views: 245, shares: 32, comments: 18 },
  { date: "2024-01-11", views: 312, shares: 45, comments: 28 },
  { date: "2024-01-12", views: 189, shares: 21, comments: 15 },
  { date: "2024-01-13", views: 425, shares: 67, comments: 42 },
  { date: "2024-01-14", views: 356, shares: 54, comments: 31 },
  { date: "2024-01-15", views: 298, shares: 38, comments: 24 },
];

const seoKeywords = [
  {
    keyword: "sustainable products",
    ranking: 3,
    traffic: 1250,
    difficulty: "Medium",
  },
  {
    keyword: "eco-friendly business",
    ranking: 7,
    traffic: 890,
    difficulty: "High",
  },
  { keyword: "green technology", ranking: 12, traffic: 620, difficulty: "Low" },
  {
    keyword: "carbon footprint",
    ranking: 5,
    traffic: 1100,
    difficulty: "Medium",
  },
];

const ContentMarketing = () => {
  const [activeTab, setActiveTab] = useState("blog");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    headerImage: "",
    tags: [],
    status: "draft",
    author: "",
    readTime: "",
    category: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagInput, setTagInput] = useState("");
  const [previewPost, setPreviewPost] = useState(null);
  const [showHeaderPreview, setShowHeaderPreview] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const res = await fetch("/api/blogs");
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error("Failed to fetch posts", err);
    }
  };

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
      .map((t) => t.trim())
      .filter(Boolean);
    setCurrentPost((prev) => ({ ...prev, tags }));
  };

  const handleSave = async (status) => {
    if (!currentPost.title || !currentPost.content)
      return toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      });

    const newPost = {
      ...currentPost,
      status,
      slug: currentPost.slug || generateSlug(currentPost.title),
    };

    try {
      const res = await fetch("/api/blogs", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });

      const result = await res.json(); // log result

      console.log("Save response:", res.status, result);

      if (!res.ok) throw new Error(result.message || "Failed to save post");

      await loadPosts();
      if (status === "published") {
        toast.success("Post published successfully");
      } else {
        toast("Post saved as draft");
      }

      resetForm();
    } catch (err) {
      console.error("Save error:", err);
      toast.err(err.message);
    }
  };

  const handleEdit = (post) => {
    setCurrentPost(post);
    setTagInput(Array.isArray(post.tags) ? post.tags.join(", ") : "");
    setIsEditing(true);
    setShowEditDialog(true);
  };

  const handleDelete = async (id) => {
    try {
      console.log("ID is", id);
      await fetch(`/api/blogs/${id}`, { method: "DELETE" });
      toast.success("Blog Deleted");
      loadPosts();
    } catch {
      toast.err("Failed to delete blog!");
    }
  };

  const resetForm = () => {
    setCurrentPost({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      headerImage: "",
      tags: [],
      status: "draft",
      author: "",
      readTime: "",
      category: "",
    });
    setTagInput("");
    setIsEditing(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch("/api/blogs/uploadImage", {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      setCurrentPost((prev) => ({
        ...prev,
        headerImage: data.url,
      }));
      toast.success("Image uploaded");
    } catch (err) {
      console.error("Image upload error:", err);
      toast.err("Image upload failed!");
    }
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

  const getStatusBadge = (status) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-600">Published</Badge>;
      case "scheduled":
        return <Badge variant="secondary">Scheduled</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRankingColor = (ranking) => {
    if (ranking <= 3) return "text-green-600";
    if (ranking <= 10) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Content Marketing & Blog Management
          </h2>
          <p className="text-muted-foreground">
            Create and manage your content strategy
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Content
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Post" : "Create New Post"}
              </DialogTitle>
              <DialogDescription>
                Fill in the details below to {isEditing ? "update" : "create"}{" "}
                your post.
              </DialogDescription>
            </DialogHeader>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {isEditing ? "Edit Post" : "Create Post"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <Label>Title *</Label>
                <Input
                  value={currentPost.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter post title"
                />

                {/* Slug */}
                <Label>Slug</Label>
                <Input
                  value={currentPost.slug}
                  onChange={(e) =>
                    setCurrentPost((p) => ({ ...p, slug: e.target.value }))
                  }
                  placeholder="Enter slug"
                />

                {/* Excerpt */}
                <Label>Excerpt</Label>
                <Input
                  value={currentPost.excerpt}
                  onChange={(e) =>
                    setCurrentPost((p) => ({ ...p, excerpt: e.target.value }))
                  }
                  placeholder="Enter excerpt"
                />

                {/* Header Image */}
                <Label>Header Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
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
                {showHeaderPreview && currentPost.headerImage && (
                  <img
                    src={currentPost.headerImage}
                    alt="Header Preview"
                    className="w-full h-32 object-cover mt-2 rounded border"
                  />
                )}

                {/* Content */}
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

                {/* Tags */}
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={tagInput}
                  onChange={(e) => handleTagsChange(e.target.value)}
                />
                <div className="flex flex-wrap gap-1 mt-1">
                  {Array.isArray(currentPost.tags) &&
                    currentPost.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                </div>

                {/* Categories */}
                <Label>Category</Label>
                <Input
                  value={currentPost.category}
                  onChange={(e) =>
                    setCurrentPost((p) => ({ ...p, category: e.target.value }))
                  }
                  placeholder="Enter category (e.g. Eco-friendly, etc)"
                />

                {/* Author */}
                <Label>Author</Label>
                <Input
                  value={currentPost.author}
                  onChange={(e) =>
                    setCurrentPost((p) => ({ ...p, author: e.target.value }))
                  }
                  placeholder="Author name"
                />

                {/* Read Time */}
                <Label>Read time</Label>
                <Input
                  value={currentPost.readTime}
                  onChange={(e) =>
                    setCurrentPost((p) => ({ ...p, readTime: e.target.value }))
                  }
                  placeholder="e.g. 5 min read"
                />

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => {
                      handleSave("draft");
                      setShowCreateDialog(false);
                    }}
                    disabled={!currentPost.title || !currentPost.content}
                    variant="outline"
                  >
                    <Save className="w-4 h-4 mr-2" /> Save Draft
                  </Button>
                  <Button
                    onClick={() => {
                      handleSave("published");
                      setShowCreateDialog(false);
                    }}
                    disabled={!currentPost.title || !currentPost.content}
                  >
                    Publish
                  </Button>

                  {/* Cancel with confirmation */}
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
                        <AlertDialogAction
                          onClick={() => {
                            resetForm();
                            setShowCreateDialog(false);
                          }}
                        >
                          Discard
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>
      </div>

      {/* Editor Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Post" : "Create New Post"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to {isEditing ? "update" : "create"}{" "}
              your post.
            </DialogDescription>
          </DialogHeader>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {isEditing ? "Edit Post" : "Create Post"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <Label>Title *</Label>
              <Input
                value={currentPost.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter post title"
              />

              {/* Slug */}
              <Label>Slug</Label>
              <Input
                value={currentPost.slug}
                onChange={(e) =>
                  setCurrentPost((p) => ({ ...p, slug: e.target.value }))
                }
                placeholder="Enter slug"
              />

              {/* Excerpt */}
              <Label>Excerpt</Label>
              <Input
                value={currentPost.excerpt}
                onChange={(e) =>
                  setCurrentPost((p) => ({ ...p, excerpt: e.target.value }))
                }
                placeholder="Enter excerpt"
              />

              {/* Header Image */}
              <Label>Header Image (Max 1Mb)</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
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
              {showHeaderPreview && currentPost.headerImage && (
                <img
                  src={currentPost.headerImage}
                  alt="Header Preview"
                  className="w-full h-32 object-cover mt-2 rounded border"
                />
              )}

              {/* Content */}
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

              {/* Tags */}
              <Label>Tags (comma-separated)</Label>
              <Input
                value={tagInput}
                onChange={(e) => handleTagsChange(e.target.value)}
              />
              <div className="flex flex-wrap gap-1 mt-1">
                {Array.isArray(currentPost.tags) &&
                  currentPost.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
              </div>

              {/* Categories */}
              <Label>Category</Label>
              <Input
                value={currentPost.category}
                onChange={(e) =>
                  setCurrentPost((p) => ({ ...p, category: e.target.value }))
                }
                placeholder="Enter category (e.g. Eco-friendly, etc)"
              />

              {/* Author */}
              <Label>Author</Label>
              <Input
                value={currentPost.author}
                onChange={(e) =>
                  setCurrentPost((p) => ({ ...p, author: e.target.value }))
                }
                placeholder="Author name"
              />

              {/* Read Time */}
              <Label>Read time</Label>
              <Input
                value={currentPost.readTime}
                onChange={(e) =>
                  setCurrentPost((p) => ({ ...p, readTime: e.target.value }))
                }
                placeholder="e.g. 5 min read"
              />

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    handleSave("draft");
                    setShowCreateDialog(false);
                  }}
                  disabled={!currentPost.title || !currentPost.content}
                  variant="outline"
                >
                  <Save className="w-4 h-4 mr-2" /> Save Draft
                </Button>
                <Button
                  onClick={() => {
                    handleSave("published");
                    setShowCreateDialog(false);
                  }}
                  disabled={!currentPost.title || !currentPost.content}
                >
                  Publish
                </Button>

                {/* Cancel with confirmation */}
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
                      <AlertDialogAction
                        onClick={() => {
                          resetForm();
                          setShowCreateDialog(false);
                        }}
                      >
                        Discard
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <FileText className="h-4 w-4 mr-2" />
              Total Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockBlogPosts.length}</div>
            <p className="text-xs text-muted-foreground">Published content</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <Eye className="h-4 w-4 mr-2" />
              Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,450</div>
            <p className="text-xs text-green-600">+18% this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <Users className="h-4 w-4 mr-2" />
              Avg. Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2%</div>
            <p className="text-xs text-green-600">Above industry avg</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <Search className="h-4 w-4 mr-2" />
              SEO Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87</div>
            <p className="text-xs text-green-600">Good optimization</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="blog">Blog Management</TabsTrigger>
          <TabsTrigger value="calendar">Content Calendar</TabsTrigger>
          <TabsTrigger value="seo">SEO Insights</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="blog">
          <Card>
            <CardHeader>
              <CardTitle>Blog Posts</CardTitle>
              <CardDescription>
                Manage your blog content and publications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Read Time</TableHead>
                    <TableHead>Publish Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">
                        {post.title}
                      </TableCell>
                      <TableCell>{post.author}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{post.category}</Badge>
                      </TableCell>
                      <TableCell>18</TableCell>
                      <TableCell>{post.readTime}</TableCell>
                      <TableCell>
                        {post.publishDate || "Not scheduled"}
                      </TableCell>
                      <TableCell>{getStatusBadge(post.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => setPreviewPost(post)}
                            size="sm"
                            variant="outline"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleEdit(post)}
                            size="sm"
                            variant="outline"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
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
                                  onClick={() => handleDelete(post._id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Content Calendar</CardTitle>
              <CardDescription>
                Plan and schedule your content publication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Content Calendar</h3>
                <p className="text-muted-foreground mb-4">
                  Visualize your content publication schedule
                </p>
                <Button>Open Calendar View</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO Keywords Performance</CardTitle>
              <CardDescription>
                Track your search engine rankings and traffic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Keyword</TableHead>
                    <TableHead>Ranking</TableHead>
                    <TableHead>Monthly Traffic</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seoKeywords.map((keyword, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {keyword.keyword}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-bold ${getRankingColor(
                            keyword.ranking
                          )}`}
                        >
                          #{keyword.ranking}
                        </span>
                      </TableCell>
                      <TableCell>{keyword.traffic.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            keyword.difficulty === "Low"
                              ? "default"
                              : keyword.difficulty === "Medium"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {keyword.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          Optimize
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Content Performance Analytics</CardTitle>
              <CardDescription>
                Track views, shares, and engagement over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={contentPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#2563eb"
                    strokeWidth={2}
                    name="Views"
                  />
                  <Line
                    type="monotone"
                    dataKey="shares"
                    stroke="#16a34a"
                    strokeWidth={2}
                    name="Shares"
                  />
                  <Line
                    type="monotone"
                    dataKey="comments"
                    stroke="#dc2626"
                    strokeWidth={2}
                    name="Comments"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentMarketing;
