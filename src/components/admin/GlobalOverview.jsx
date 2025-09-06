
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DollarSign, Users, ShoppingCart, TrendingUp, AlertTriangle, CheckCircle, Clock, Target } from 'lucide-react';

const GlobalOverview = () => {
  const metrics = [
    {
      title: 'Total Revenue',
      value: '₹124,592.40',
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
      description: 'vs last month'
    },
    {
      title: 'Active Users',
      value: '2,847',
      change: '+8.2%',
      changeType: 'positive',
      icon: Users,
      description: '5 departments active'
    },
    {
      title: 'Platform Orders',
      value: '1,249',
      change: '+15.3%',
      changeType: 'positive',
      icon: ShoppingCart,
      description: 'today'
    },
    {
      title: 'Marketing ROI',
      value: '324%',
      change: '+45.2%',
      changeType: 'positive',
      icon: Target,
      description: 'campaign performance'
    }
  ];

  const issues = [
    { type: 'critical', count: 2, label: 'Critical Issues', color: 'bg-red-500' },
    { type: 'warning', count: 5, label: 'Warnings', color: 'bg-yellow-500' },
    { type: 'info', count: 12, label: 'Info', color: 'bg-blue-500' }
  ];

  const departmentPerformance = [
    { name: 'Sales', revenue: 78450, target: 85000, progress: 92 },
    { name: 'Marketing', revenue: 34200, target: 30000, progress: 114 },
    { name: 'Finance', revenue: 11942, target: 15000, progress: 80 }
  ];

  return (
    <div className="space-y-6">
      {/* Global Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs ${metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change}
                </span>
                <span className="text-xs text-muted-foreground">{metric.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Outstanding Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <span>Outstanding Issues</span>
          </CardTitle>
          <CardDescription>Platform-wide issues requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {issues.map((issue) => (
              <div key={issue.type} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${issue.color}`}></div>
                  <div>
                    <p className="font-medium">{issue.label}</p>
                    <p className="text-sm text-gray-500">{issue.count} items</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">View</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Department Performance</CardTitle>
          <CardDescription>Revenue performance against targets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {departmentPerformance.map((dept) => (
              <div key={dept.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{dept.name}</span>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      ${dept.revenue.toLocaleString()} / ${dept.target.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">{dept.progress}% of target</div>
                  </div>
                </div>
                <Progress value={Math.min(dept.progress, 100)} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-20 flex flex-col space-y-2">
              <Users className="w-5 h-5" />
              <span className="text-xs">Add User</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-xs">View Issues</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-xs">Generate Report</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <CheckCircle className="w-5 h-5" />
              <span className="text-xs">System Health</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalOverview;
