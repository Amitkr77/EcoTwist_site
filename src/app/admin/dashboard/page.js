"use client"
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, ShoppingCart, DollarSign, TrendingUp, Package, FileText, Megaphone, Settings, Shield, Activity, Bell, AlertTriangle, Server, Database } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import UserManagement from '@/components/admin/UserManagement';
import SalesDashboard from '@/components/admin/SalesDashboard';
import FinanceDashboard from '@/components/admin/FinanceDashboard';
import MarketingDashboard from '@/components/admin/MarketingDashboard';
import GlobalOverview from '@/components/admin/GlobalOverview';
import MasterAnalytics from '@/components/admin/MasterAnalytics';
import DepartmentOverview from '@/components/admin/DepartmentOverview';
import SystemSettings from '@/components/admin/SystemSettings';
import AuditLogs from '@/components/admin/AuditLogs';
import NotificationCenter from '@/components/admin/NotificationCenter';
import IntegrationsPanel from '@/components/admin/IntegrationsPanel';
import BackupRecovery from '@/components/admin/BackupRecovery';

// Mock user data - replace with actual auth
const mockUser = {
  id: 1,
  name: 'John Admin',
  role: 'super_admin',
  department: 'all',
  permissions: ['all']
};

const Page = () => {
  const [currentUser] = useState(mockUser);
  const [activeTab, setActiveTab] = useState('overview');

  const sidebarMenuItems = [
    {
      label: 'Overview',
      items: [
        { id: 'overview', label: 'Global Overview', icon: TrendingUp },
        { id: 'analytics', label: 'Master Analytics', icon: FileText },
      ]
    },
    {
      label: 'Management',
      items: [
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'departments', label: 'Department Overview', icon: Package },
      ]
    },
    {
      label: 'Departments',
      items: [
        { id: 'sales', label: 'Sales & Products', icon: ShoppingCart },
        { id: 'finance', label: 'Finance', icon: DollarSign },
        { id: 'marketing', label: 'Marketing', icon: Megaphone },
      ]
    },
    {
      label: 'System',
      items: [
        { id: 'settings', label: 'System Settings', icon: Settings },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'audit', label: 'Audit Logs', icon: Activity },
        { id: 'integrations', label: 'Integrations', icon: Server },
        { id: 'backup', label: 'Backup & Recovery', icon: Database },
      ]
    }
  ];

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'overview':
        return <GlobalOverview />;
      case 'analytics':
        return <MasterAnalytics />;
      case 'users':
        return <UserManagement />;
      case 'departments':
        return <DepartmentOverview />;
      case 'sales':
        return <SalesDashboard />;
      case 'finance':
        return <FinanceDashboard />;
      case 'marketing':
        return <MarketingDashboard />;
      case 'settings':
        return <SystemSettings />;
      case 'notifications':
        return <NotificationCenter />;
      case 'audit':
        return <AuditLogs />;
      case 'integrations':
        return <IntegrationsPanel />;
      case 'backup':
        return <BackupRecovery />;
      default:
        return <GlobalOverview />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar className="border-r">
          <SidebarContent>
            <div className="p-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">Super Admin</h2>
                  <p className="text-sm text-gray-500">{currentUser.name}</p>
                </div>
              </div>
            </div>

            {sidebarMenuItems.map((section) => (
              <SidebarGroup key={section.label}>
                <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {section.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          onClick={() => setActiveTab(item.id)}
                          isActive={activeTab === item.id}
                          className="flex items-center space-x-3 w-full"
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {sidebarMenuItems
                      .flatMap(section => section.items)
                      .find(item => item.id === activeTab)?.label || 'Dashboard'}
                  </h1>
                  <p className="text-sm text-gray-500">
                    Manage your platform with comprehensive oversight
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm" className="relative">
                  <Bell className="w-4 h-4" />
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 text-xs bg-red-500">
                    3
                  </Badge>
                </Button>
                <Button variant="outline" size="sm">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  5 Issues
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            {renderActiveContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Page;
