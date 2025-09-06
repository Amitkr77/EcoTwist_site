"use client";
import { useState } from "react";
import "../../scroll.css";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  Package,
  TrendingUp,
  AlertTriangle,
  Plus,
  Search,
  Users,
  DollarSign,
  Settings,
  BarChart3,
  Megaphone,
  MessageSquare,
  CreditCard,
  Zap,
  Home,
  FileText,
  Warehouse,
  UserCheck,
  Star,
  RefreshCw,
  ShoppingBag,
  Percent,
  Bell,
} from "lucide-react";
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
import ProductCatalog from "@/components/manager/sales/ProductCatalog";
import OrderManagement from "@/components/manager/sales/OrderManagement";
import InventoryManagement from "@/components/manager/sales/InventoryManagement";
import UserProfile from "@/components/manager/sales/UserProfile";
import AnalyticsReporting from "@/components/manager/sales/AnalyticsReporting";
import PromotionsDiscounts from "@/components/manager/sales/PromotionsDiscounts";
import CommunicationTools from "@/components/manager/sales/CommunicationTools";
import PaymentsAccounting from "@/components/manager/sales/PaymentsAccounting";
import ThirdPartyIntegrations from "@/components/manager/sales/ThirdPartyIntegrations";

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  {
    id: "products",
    label: "Product Management",
    icon: Package,
    subItems: [
      { id: "product-catalog", label: "Product Catalog" },
      { id: "add-product", label: "Add/Update Products" },
      { id: "bulk-upload", label: "Bulk Upload/Download" },
      { id: "categories", label: "Product Categories" },
      { id: "pricing", label: "Price & Discount Management" },
      { id: "reviews", label: "Product Reviews" },
    ],
  },
  {
    id: "orders",
    label: "Order Management",
    icon: ShoppingCart,
    subItems: [
      { id: "order-list", label: "Order List" },
      { id: "track-orders", label: "Track Orders" },
      { id: "order-history", label: "Order History" },
      { id: "returns-refunds", label: "Return/Refund Requests" },
      { id: "order-analytics", label: "Order Analytics" },
    ],
  },
  {
    id: "inventory",
    label: "Inventory Management",
    icon: Warehouse,
    subItems: [
      { id: "inventory-overview", label: "Inventory Overview" },
      { id: "low-stock-alerts", label: "Low Stock Alerts" },
      { id: "restocking", label: "Restocking Orders" },
      { id: "warehouse-management", label: "Warehouse Management" },
      { id: "inventory-reports", label: "Inventory Movement Reports" },
      { id: "stock-forecasting", label: "Stock Forecasting" },
    ],
  },
  {
    id: "profile",
    label: "User Profile",
    icon: UserCheck,
    subItems: [
      { id: "profile-settings", label: "Profile Settings" },
      { id: "account-permissions", label: "Account Permissions" },
      { id: "activity-log", label: "Activity Log" },
      { id: "notification-settings", label: "Notification Settings" },
      { id: "security-login", label: "Security & Login" },
    ],
  },
  {
    id: "analytics",
    label: "Analytics & Reporting",
    icon: BarChart3,
    subItems: [
      { id: "sales-reports", label: "Sales Reports" },
      { id: "order-reports", label: "Order Reports" },
      { id: "inventory-reports-detail", label: "Inventory Reports" },
      { id: "customer-insights", label: "Customer Insights" },
      { id: "custom-reports", label: "Custom Reports" },
    ],
  },
  {
    id: "promotions",
    label: "Promotions & Discounts",
    icon: Percent,
    subItems: [
      { id: "discount-codes", label: "Discount Codes" },
      { id: "campaign-management", label: "Campaign Management" },
      { id: "voucher-creation", label: "Voucher Creation" },
      { id: "promo-analytics", label: "Promo Analytics" },
    ],
  },
  {
    id: "communication",
    label: "Communication Tools",
    icon: MessageSquare,
    subItems: [
      { id: "customer-messaging", label: "Customer Messaging" },
      { id: "internal-chat", label: "Internal Chat/Team Communication" },
      { id: "order-notifications", label: "Order Notifications" },
    ],
  },
  {
    id: "payments",
    label: "Payments & Accounting",
    icon: CreditCard,
    subItems: [
      { id: "payment-gateway", label: "Payment Gateway Integration" },
      { id: "tax-calculation", label: "Tax Calculation" },
      { id: "payout-management", label: "Payout Management" },
      { id: "profit-loss", label: "Profit & Loss Statements" },
    ],
  },
  {
    id: "integrations",
    label: "Third-party Integrations",
    icon: Zap,
    subItems: [
      { id: "crm-integration", label: "CRM Integration" },
      { id: "erp-integration", label: "ERP Integration" },
      { id: "shipping-integration", label: "Shipping Provider Integration" },
      { id: "payment-integration", label: "Payment Gateway Integration" },
    ],
  },
];

const salesData = [
  { date: "2024-01-10", revenue: 1200, orders: 15, aov: 80 },
  { date: "2024-01-11", revenue: 1500, orders: 18, aov: 83 },
  { date: "2024-01-12", revenue: 1100, orders: 12, aov: 92 },
  { date: "2024-01-13", revenue: 1800, orders: 22, aov: 82 },
  { date: "2024-01-14", revenue: 2100, orders: 25, aov: 84 },
  { date: "2024-01-15", revenue: 1900, orders: 21, aov: 90 },
];

const SalesManagerDashboard = () => {
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
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">Active products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inventory Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$24,567</div>
            <p className="text-xs text-muted-foreground">Total stock value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Orders
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">₹2,847.50 value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Alerts
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Seller</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">Solar Power Bank</div>
            <p className="text-xs text-muted-foreground">67 sold today</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Performance</CardTitle>
          <CardDescription>Revenue and orders trends over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#16a34a"
                strokeWidth={2}
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
      case "product-catalog":
        return <ProductCatalog />;
      case "order-list":
        return <OrderManagement />;
      case "inventory-overview":
        return <InventoryManagement />;
      case "profile-settings":
        return <UserProfile />;
      case "sales-reports":
        return <AnalyticsReporting />;
      case "discount-codes":
        return <PromotionsDiscounts />;
      case "customer-messaging":
        return <CommunicationTools />;
      case "payment-gateway":
        return <PaymentsAccounting />;
      case "crm-integration":
        return <ThirdPartyIntegrations />;
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="hide-scrollbar w-72 bg-white border-r border-gray-200 flex flex-col h-screen overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Sales Manager</h2>
          <p className="text-sm text-gray-500">Dashboard</p>
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
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
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
                Manage your sales operations
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-8 w-64" />
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Quick Add
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

export default SalesManagerDashboard;
