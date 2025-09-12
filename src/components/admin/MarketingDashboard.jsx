import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Megaphone, Users, TrendingUp, Calendar, Plus, Eye, Play, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';


const mockCampaigns = [
  { id: 1, name: 'Spring Sale 2024', type: 'Email', status: 'active', clicks: 1250, conversions: 45, budget: 500 },
  { id: 2, name: 'Eco Product Launch', type: 'Social Media', status: 'completed', clicks: 2850, conversions: 123, budget: 1200 },
  { id: 3, name: 'Holiday Special', type: 'Paid Ads', status: 'draft', clicks: 0, conversions: 0, budget: 800 },
];

const mockSocialPosts = [
  { id: 1, platform: 'Instagram', content: 'New eco-friendly products...', scheduled: '2024-01-16 10:00', status: 'scheduled' },
  { id: 2, platform: 'Facebook', content: 'Check out our sustainability...', scheduled: '2024-01-15 14:30', status: 'published' },
  { id: 3, platform: 'Twitter', content: 'Join our green movement...', scheduled: '2024-01-17 09:00', status: 'draft' },
];

const MarketingDashboard = () => {

  const [managerName, setManagerName] = useState('');
      const [managerEmail, setManagerEmail] = useState('');
      const [isCreating, setIsCreating] = useState(false);
      const [managers, setManagers] = useState([]);
      const [isLoadingManagers, setIsLoadingManagers] = useState(true);
      const managerRole = "manager:marketing";

  const getCampaignBadge = (status) => {
    switch (status) {
      case 'active': return <Badge variant="default">Active</Badge>;
      case 'completed': return <Badge variant="secondary">Completed</Badge>;
      case 'draft': return <Badge variant="outline">Draft</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getPostBadge = (status) => {
    switch (status) {
      case 'published': return <Badge variant="default">Published</Badge>;
      case 'scheduled': return <Badge variant="secondary">Scheduled</Badge>;
      case 'draft': return <Badge variant="outline">Draft</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const fetchManagers = async () => {
      try {
        const res = await fetch("/api/admin/managers/sales");
        const data = await res.json();
        if (res.ok) {
          const filteredManagers = data.managers.filter(m => m.role === managerRole);
          setManagers(filteredManagers);
        } else {
          toast.error(data.message || "Failed to fetch managers");
        }
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong");
      } finally {
        setIsLoadingManagers(false);
      }
    };
  
    useEffect(() => {
      fetchManagers();
    }, []);
  
    // create manager
      const handleCreateManager = async () => {
        if (!managerEmail || !managerName) return toast.error("All fields are required!");
    
        setIsCreating(true);
        try {
          const res = await fetch("/api/admin/managers/sales", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name:managerName, email: managerEmail, role: managerRole}),
          });
          const data = await res.json();
          
          if (!res.ok) return toast.error(data.message || "Failed to create manager");
    
          toast.success("Manager created!");
          setManagerEmail("");
          fetchManagers();
        } catch (err) {
          console.error(err);
          toast.error("Something went wrong");
        } finally {
          setIsCreating(false);
        }
      };
  
      // Delete sales manager
    const handleDeleteManager = async (id) => {
      if (!confirm("Are you sure you want to delete this manager?")) return;
  
      try {
        const res = await fetch(`/api/admin/managers/sales/${id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (res.ok) {
          toast.success("Manager deleted");
          fetchManagers();
        } else {
          toast.error(data.message || "Failed to delete manager");
        }
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong");
      }
    };

  return (
    <div className="space-y-4">

      <Card>
        <CardHeader>
          <CardTitle>Create Marketing Manager</CardTitle>
          <CardDescription>
            Enter manager's email to create an account. A strong password will be auto-generated.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2 items-center">
          <Input
            type="name"
            placeholder="Manager Name"
            value={managerName}
            onChange={(e) => setManagerName(e.target.value)}
            className="flex-1"
          />
          <Input
            type="email"
            placeholder="Manager Email"
            value={managerEmail}
            onChange={(e) => setManagerEmail(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleCreateManager} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Manager"}
          </Button>
        </CardContent>
      </Card>

    <Card>
        <CardHeader>
          <CardTitle>Marketing Managers</CardTitle>
          <CardDescription>List of all registered marketing managers</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingManagers ? (
            <p>Loading...</p>
          ) : managers.length === 0 ? (
            <p className="text-muted-foreground">No manager found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {managers.map((manager) => (
                  <TableRow key={manager._id}>
                    <TableCell className="font-medium">{manager.name}</TableCell>
                    <TableCell>{manager.email}</TableCell>
                    <TableCell>{new Date(manager.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteManager(manager._id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Marketing Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campaign Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.2%</div>
            <p className="text-xs text-muted-foreground">Conversion rate this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Social Engagement</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4,521</div>
            <p className="text-xs text-muted-foreground">+15.3% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">3 ending this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue from Marketing</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹18,453</div>
            <p className="text-xs text-muted-foreground">+28.4% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Campaign Management</CardTitle>
              <CardDescription>Monitor and manage your marketing campaigns</CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>Conversions</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>{campaign.type}</TableCell>
                  <TableCell>{campaign.clicks.toLocaleString()}</TableCell>
                  <TableCell>{campaign.conversions}</TableCell>
                  <TableCell>₹{campaign.budget}</TableCell>
                  <TableCell>{getCampaignBadge(campaign.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">Edit</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Social Media Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Social Media Posts</CardTitle>
              <CardDescription>Schedule and manage your social media content</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSocialPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.platform}</TableCell>
                  <TableCell className="max-w-xs truncate">{post.content}</TableCell>
                  <TableCell>{post.scheduled}</TableCell>
                  <TableCell>{getPostBadge(post.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {post.status === 'draft' && (
                        <Button size="sm" variant="outline">
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketingDashboard;
