"use client";
import { useState, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DollarSign,
  FileText,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  BarChart3,
  Calculator,
  Wallet,
  Search,
  Plus,
  Home,
  Receipt,
  Building2,
  Target,
  Users,
  Settings,
  Zap,
  Bell,
  BookOpen,
  Shield,
  Archive,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import TransactionManagement from "@/components/manager/finance/TransactionManagement";
import InvoiceManagement from "@/components/manager/finance/InvoiceManagement";
import FinancialReporting from "@/components/manager/finance/FinancialReporting";
import BudgetForecasting from "@/components/manager/finance/BudgetForecasting";
import UserProfile from "@/components/manager/finance/userProfile";
const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  {
    id: "transactions",
    label: "Transaction Management",
    icon: CreditCard,
    subItems: [
      { id: "transaction-history", label: "Transaction History" },
      { id: "payment-tracking", label: "Payment Gateway Tracking" },
      { id: "bank-reconciliation", label: "Bank Reconciliation" },
      { id: "transaction-categories", label: "Transaction Categories" },
    ],
  },
  {
    id: "invoices",
    label: "Invoice Management",
    icon: FileText,
    subItems: [
      { id: "invoice-generation", label: "Invoice Generation" },
      { id: "invoice-tracking", label: "Invoice Tracking" },
      { id: "recurring-invoices", label: "Recurring Invoices" },
      { id: "invoice-history", label: "Invoice History" },
    ],
  },
  {
    id: "reports",
    label: "Financial Reporting",
    icon: BarChart3,
    subItems: [
      { id: "profit-loss", label: "Profit & Loss Reports" },
      { id: "balance-sheet", label: "Balance Sheet" },
      { id: "tax-reports", label: "Tax Reports" },
      { id: "expense-reports", label: "Expense Reports" },
      { id: "revenue-reports", label: "Revenue Reports" },
    ],
  },
  {
    id: "budget",
    label: "Budget & Forecasting",
    icon: Target,
    subItems: [
      { id: "budget-planning", label: "Budget Planning" },
      { id: "budget-vs-actual", label: "Budget vs Actual" },
      { id: "financial-forecasting", label: "Financial Forecasting" },
      { id: "scenario-planning", label: "Scenario Planning" },
    ],
  },
  {
    id: "accounts",
    label: "Accounts Payable/Receivable",
    icon: Building2,
    subItems: [
      { id: "accounts-payable", label: "Accounts Payable" },
      { id: "accounts-receivable", label: "Accounts Receivable" },
      { id: "payment-history", label: "Payment History" },
      { id: "payment-reminders", label: "Payment Reminders" },
    ],
  },
  {
    id: "cashflow",
    label: "Cash Flow Management",
    icon: Wallet,
    subItems: [
      { id: "cashflow-forecast", label: "Cash Flow Forecast" },
      { id: "liquidity-analysis", label: "Liquidity Analysis" },
      { id: "cashflow-trends", label: "Cash Flow Trends" },
      { id: "receivables-payables", label: "Receivables & Payables" },
    ],
  },
  {
    id: "Profile",
    label: "user profile",
    icon: Users,
  },
  {
    id: "tax",
    label: "Tax Management",
    icon: Receipt,
    subItems: [
      { id: "tax-rates", label: "Tax Rate Management" },
      { id: "sales-tax-report", label: "Sales Tax Reports" },
      { id: "tax-reminders", label: "Tax Filing Reminders" },
      { id: "tax-deductions", label: "Tax Deductions" },
    ],
  },
  {
    id: "compliance",
    label: "Compliance & Auditing",
    icon: Shield,
    subItems: [
      { id: "audit-trail", label: "Audit Trail" },
      { id: "compliance-reports", label: "Compliance Reports" },
      { id: "data-security", label: "Data Security" },
      { id: "user-access", label: "User Access Management" },
    ],
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: Zap,
    subItems: [
      { id: "bank-integration", label: "Bank Account Integration" },
      { id: "erp-integration", label: "ERP System Integration" },
      { id: "payment-integration", label: "Payment Gateway Integration" },
      {
        id: "accounting-integration",
        label: "Accounting Software Integration",
      },
    ],
  },
];

const quickStats = [
  {
    title: "Total Revenue",
    value: "₹125,450",
    change: "+12.5%",
    icon: DollarSign,
    color: "text-green-600",
  },
  {
    title: "Net Profit",
    value: "₹48,200",
    change: "+8.2%",
    icon: TrendingUp,
    color: "text-blue-600",
  },
  {
    title: "Outstanding",
    value: "₹12,340",
    change: "-5.1%",
    icon: FileText,
    color: "text-orange-600",
  },
  {
    title: "Cash Flow",
    value: "₹89,760",
    change: "+15.3%",
    icon: Wallet,
    color: "text-purple-600",
  },
];

const revenueData = [
  { month: "Jan", revenue: 12000, expenses: 8000, profit: 4000 },
  { month: "Feb", revenue: 15000, expenses: 9000, profit: 6000 },
  { month: "Mar", revenue: 18000, expenses: 10000, profit: 8000 },
  { month: "Apr", revenue: 16000, expenses: 9500, profit: 6500 },
  { month: "May", revenue: 20000, expenses: 11000, profit: 9000 },
  { month: "Jun", revenue: 22000, expenses: 12000, profit: 10000 },
];

const profitData = [
  { name: "Revenue", value: 125450, color: "#22c55e" },
  { name: "COGS", value: 45200, color: "#ef4444" },
  { name: "Operating Expenses", value: 32050, color: "#f59e0b" },
  { name: "Net Profit", value: 48200, color: "#3b82f6" },
];

const page = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [expandedItems, setExpandedItems] = useState(null);

  // Toggle expanded items in the sidebar
  const toggleExpanded = useCallback((itemId) => {
    setExpandedItems((prev) => (prev === itemId ? null : itemId));
  }, []);

  // Change active section
  const handleSectionChange = useCallback((sectionId) => {
    setActiveSection(sectionId);
  }, []);

  const renderDashboardOverview = useMemo(() => {
    return (
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs ${stat.color}`}>
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Financial Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Revenue vs Expenses */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Expenses</CardTitle>
              <CardDescription>6-month financial performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#22c55e"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#ef4444"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Financial Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Breakdown</CardTitle>
              <CardDescription>Current financial distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={profitData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {profitData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* P&L Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Profit & Loss Summary</CardTitle>
            <CardDescription>Current month financial summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                {["Gross Revenue", "Cost of Goods Sold", "Gross Profit"].map(
                  (title, index) => (
                    <div
                      key={index}
                      className={`flex justify-between items-center p-3 rounded-lg ${
                        index % 2 === 0 ? "bg-green-50" : "bg-red-50"
                      }`}
                    >
                      <span className="font-medium">{title}</span>
                      <span className="text-lg font-bold text-green-600">
                        ₹125,450
                      </span>
                    </div>
                  )
                )}
              </div>
              <div className="space-y-4">
                {[
                  "Operating Expenses",
                  "Other Income/Expenses",
                  "Net Profit",
                ].map((title, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      index === 2
                        ? "bg-blue-50 border-2 border-blue-200"
                        : "bg-yellow-50"
                    }`}
                  >
                    <span className="font-medium">{title}</span>
                    <span className="text-lg font-bold text-blue-600">
                      ₹48,200
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }, []);

  const renderContent = useMemo(() => {
    switch (activeSection) {
      case "dashboard":
        return renderDashboardOverview;
      case "transaction-history":
        return <TransactionManagement />;
      case "invoice-generation":
        return <InvoiceManagement />;
      case "profit-loss":
        return <FinancialReporting />;
      case "budget-planning":
        return <BudgetForecasting />;
      case "Profile":
        return <UserProfile />;
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
  }, [activeSection, renderDashboardOverview]);

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
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col h">
        <div className="p-4 flex gap-7 border-b border-gray-200">
          <div className="space-x-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Finance Manager
            </h2>
            <p className="text-sm text-gray-500">Dashboard</p>
          </div>
          <div className="py-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleLogout("finance")}
            >
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
                  <span className="">{item.label}</span>
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
                {activeSection === "dashboard" ? "Overview" : activeSection}
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 ">{renderContent}</main>
      </div>
    </div>
  );
};

export default page;
