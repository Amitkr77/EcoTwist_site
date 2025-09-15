"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Megaphone,
  Users,
  TrendingUp,
  Calendar,
  Plus,
  Search,
  Mail,
  FileText,
  Settings,
  BarChart3,
  MessageSquare,
  Instagram,
  Target,
  DollarSign,
  Home,
  Zap,
  Share,
} from "lucide-react";
import { CiLogout } from "react-icons/ci";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Import section components
import CampaignManagement from "@/components/manager/marketing/CampaignManagement";
import SocialMediaManagement from "@/components/manager/marketing/SocialMediaManagement";
import ContentMarketing from "@/components/manager/marketing/ContentMarketing";

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  {
    id: "campaigns",
    label: "Campaign Management",
    icon: Megaphone,
    subItems: [
      { id: "campaign-overview", label: "Campaign Overview" },
      { id: "campaign-analytics", label: "Performance Analytics" },
      { id: "ab-testing", label: "A/B Testing" },
      { id: "budget-tracking", label: "Budget Tracking" },
      { id: "campaign-calendar", label: "Campaign Calendar" },
      { id: "audience-segmentation", label: "Audience Segmentation" },
    ],
  },
  {
    id: "social",
    label: "Social Media Management",
    icon: Instagram,
    subItems: [
      { id: "social-dashboard", label: "Social Dashboard" },
      { id: "content-scheduling", label: "Content Scheduling" },
      { id: "engagement-metrics", label: "Engagement Metrics" },
      { id: "follower-growth", label: "Follower Growth" },
      { id: "hashtag-performance", label: "Hashtag Performance" },
      { id: "competitor-analysis", label: "Competitor Analysis" },
    ],
  },
  {
    id: "content",
    label: "Content Marketing",
    icon: FileText,
    subItems: [
      { id: "content-calendar", label: "Content Calendar" },
      { id: "blog-management", label: "Blog Management" },
      { id: "seo-insights", label: "SEO Insights" },
      { id: "content-performance", label: "Content Performance" },
      { id: "guest-blogging", label: "Guest Blogging" },
      { id: "content-collaboration", label: "Content Collaboration" },
    ],
  },
  {
    id: "email",
    label: "Email Marketing",
    icon: Mail,
    subItems: [
      { id: "email-campaigns", label: "Email Campaigns" },
      { id: "list-segmentation", label: "List Segmentation" },
      { id: "automated-emails", label: "Automated Emails" },
      { id: "email-testing", label: "A/B Testing" },
      { id: "email-analytics", label: "Email Analytics" },
      { id: "subscriber-growth", label: "Subscriber Growth" },
    ],
  },
  {
    id: "advertising",
    label: "Paid Advertising",
    icon: Target,
    subItems: [
      { id: "ad-campaigns", label: "Ad Campaign Performance" },
      { id: "ad-optimization", label: "Ad Spend Optimization" },
      { id: "creative-library", label: "Creative Library" },
      { id: "ad-targeting", label: "Ad Targeting Insights" },
      { id: "retargeting", label: "Retargeting Campaigns" },
      { id: "search-ads", label: "Paid Search Insights" },
    ],
  },
  {
    id: "analytics",
    label: "Analytics & Reporting",
    icon: BarChart3,
    subItems: [
      { id: "multi-channel", label: "Multi-Channel Reporting" },
      { id: "custom-reports", label: "Custom Reports" },
      { id: "attribution-modeling", label: "Attribution Modeling" },
      { id: "funnel-analysis", label: "Funnel Analysis" },
    ],
  },
  {
    id: "customers",
    label: "Customer Insights",
    icon: Users,
    subItems: [
      { id: "customer-segmentation", label: "Customer Segmentation" },
      { id: "lifetime-value", label: "Lifetime Value Tracking" },
      { id: "customer-journey", label: "Customer Journey Mapping" },
      { id: "feedback-surveys", label: "Feedback & Surveys" },
    ],
  },
  {
    id: "influencer",
    label: "Influencer & Affiliate",
    icon: Share,
    subItems: [
      { id: "influencer-management", label: "Influencer Management" },
      { id: "affiliate-program", label: "Affiliate Program" },
      { id: "campaign-attribution", label: "Campaign Attribution" },
    ],
  },
  {
    id: "collaboration",
    label: "Team Management",
    icon: MessageSquare,
    subItems: [
      { id: "task-management", label: "Task Management" },
      { id: "approval-workflow", label: "Approval Workflow" },
      { id: "team-communication", label: "Team Communication" },
    ],
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: Zap,
    subItems: [
      { id: "crm-integration", label: "CRM Integration" },
      { id: "ecommerce-integration", label: "E-commerce Integration" },
      { id: "social-listening", label: "Social Listening Tools" },
    ],
  },
];

const marketingData = [
  { date: "2024-01-10", leads: 120, conversions: 15, revenue: 2400 },
  { date: "2024-01-11", leads: 150, conversions: 18, revenue: 3200 },
  { date: "2024-01-12", leads: 110, conversions: 12, revenue: 1800 },
  { date: "2024-01-13", leads: 180, conversions: 22, revenue: 4100 },
  { date: "2024-01-14", leads: 210, conversions: 25, revenue: 4800 },
  { date: "2024-01-15", leads: 190, conversions: 21, revenue: 3900 },
];

const page = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [expandedItems, setExpandedItems] = useState(null);

  const toggleExpanded = (itemId) => {
    setExpandedItems((prev) => (prev === itemId ? null : itemId));
  };

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
  };

  const renderDashboardOverview = () => (
    <div className="space-y-6">
      {/* Overview Widgets */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Campaigns
            </CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">3 ending this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-green-600">+18.2% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.4%</div>
            <p className="text-xs text-green-600">+1.2% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Email Open Rate
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.8%</div>
            <p className="text-xs text-green-600">Above industry avg</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Social Reach</CardTitle>
            <Instagram className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">125K</div>
            <p className="text-xs text-green-600">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Marketing Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Marketing Performance</CardTitle>
          <CardDescription>
            Leads, conversions, and revenue trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={marketingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="leads"
                stroke="#2563eb"
                strokeWidth={2}
                name="Leads"
              />
              <Line
                type="monotone"
                dataKey="conversions"
                stroke="#16a34a"
                strokeWidth={2}
                name="Conversions"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return renderDashboardOverview();
      case "campaign-overview":
        return <CampaignManagement />;
      case "social-dashboard":
        return <SocialMediaManagement />;
      case "blog-management":
        return <ContentMarketing />;
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                Feature Coming Soon
              </h3>
              <p className="text-muted-foreground">
                This section is under development.
              </p>
            </div>
          </div>
        );
    }
  };

  const handleLogout = async (managerType) => {
  try {
    const res = await fetch("/api/managers/logout", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: managerType }),
    });

    if (res.ok) {
      window.location.href = "/manager/login";
    } else {
      console.error("Logout failed");
    }
  } catch (err) {
    console.error("Error during logout", err);
  }
};


  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-screen overflow-y-auto">
        <div className="p-4 flex gap-7 border-b border-gray-200">
          <div className="space-x-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Marketing Manager
          </h2>
          <p className="text-sm text-gray-500">Dashboard</p>
          </div>
          <div className="py-2">
            <Button variant="destructive" size="sm" onClick={() => handleLogout("marketing")}>
             <CiLogout className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {sidebarItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (item.subItems) {
                    toggleExpanded(item.id);
                  } else {
                    handleSectionChange(item.id);
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeSection === item.id
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                {item.subItems && (
                  <span className="text-xs">
                    {expandedItems === item.id ? "−" : "+"}
                  </span>
                )}
              </button>

              {item.subItems && expandedItems === item.id && (
                <div className="ml-4 mt-2 space-y-1">
                  {item.subItems.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => handleSectionChange(subItem.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        activeSection === subItem.id
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {sidebarItems.find((item) => item.id === activeSection)
                  ?.label ||
                  sidebarItems
                    .find((item) =>
                      item.subItems?.some((sub) => sub.id === activeSection)
                    )
                    ?.subItems?.find((sub) => sub.id === activeSection)
                    ?.label ||
                  "Dashboard"}
              </h1>
              <p className="text-sm text-gray-500">
                Manage your marketing campaigns and strategy
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-8 w-64" />
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">{renderContent()}</main>
      </div>
    </div>
  );
};

export default page;
