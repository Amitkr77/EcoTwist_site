
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Percent, Calendar, Edit, Trash, BarChart3 } from 'lucide-react';

const mockPromotions = [
  { id: 1, name: 'Summer Sale 2024', type: 'percentage', value: 20, code: 'SUMMER20', status: 'active', uses: 156, limit: 1000, startDate: '2024-06-01', endDate: '2024-08-31' },
  { id: 2, name: 'First Order Discount', type: 'fixed', value: 10, code: 'WELCOME10', status: 'active', uses: 89, limit: 500, startDate: '2024-01-01', endDate: '2024-12-31' },
  { id: 3, name: 'Flash Sale', type: 'percentage', value: 35, code: 'FLASH35', status: 'expired', uses: 234, limit: 300, startDate: '2024-01-15', endDate: '2024-01-20' },
  { id: 4, name: 'Bulk Order Discount', type: 'percentage', value: 15, code: 'BULK15', status: 'scheduled', uses: 0, limit: 200, startDate: '2024-02-01', endDate: '2024-02-28' },
];

const PromotionsDiscounts = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-600">Active</Badge>;
      case 'scheduled': return <Badge variant="secondary">Scheduled</Badge>;
      case 'expired': return <Badge variant="outline">Expired</Badge>;
      case 'paused': return <Badge variant="secondary">Paused</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const CreatePromotionForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>Create New Promotion</CardTitle>
        <CardDescription>Set up a new discount code or campaign</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="promoName">Promotion Name</Label>
            <Input id="promoName" placeholder="e.g., Spring Sale 2024" />
          </div>
          <div>
            <Label htmlFor="promoCode">Discount Code</Label>
            <Input id="promoCode" placeholder="e.g., SPRING20" />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="discountType">Discount Type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage (%)</SelectItem>
                <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                <SelectItem value="bogo">Buy One Get One</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="discountValue">Discount Value</Label>
            <Input id="discountValue" type="number" placeholder="e.g., 20" />
          </div>
          <div>
            <Label htmlFor="usageLimit">Usage Limit</Label>
            <Input id="usageLimit" type="number" placeholder="e.g., 1000" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input id="startDate" type="date" />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input id="endDate" type="date" />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button>Create Promotion</Button>
          <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Promotions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,456</div>
            <p className="text-xs text-muted-foreground">Customer savings this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18.3%</div>
            <p className="text-xs text-green-600">+2.4% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">SUMMER20</div>
            <p className="text-xs text-muted-foreground">156 uses this month</p>
          </CardContent>
        </Card>
      </div>

      {showCreateForm && <CreatePromotionForm />}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Promotions & Discount Codes</CardTitle>
              <CardDescription>Manage your marketing campaigns and discount codes</CardDescription>
            </div>
            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Promotion
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Promotion</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPromotions.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{promo.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {promo.startDate} - {promo.endDate}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{promo.code}</TableCell>
                  <TableCell className="capitalize">{promo.type}</TableCell>
                  <TableCell>
                    {promo.type === 'percentage' ? `${promo.value}%` : `$${promo.value}`}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {promo.uses} / {promo.limit}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full" 
                        style={{width: `${(promo.uses / promo.limit) * 100}%`}}
                      ></div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(promo.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
            <CardDescription>Top performing promotional campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Summer Sale 2024</div>
                  <div className="text-sm text-muted-foreground">20% off • 156 uses</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">₹3,420</div>
                  <div className="text-sm text-green-600">Revenue impact</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">First Order Discount</div>
                  <div className="text-sm text-muted-foreground">$10 off • 89 uses</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">$1,890</div>
                  <div className="text-sm text-green-600">Revenue impact</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Campaigns</CardTitle>
            <CardDescription>Scheduled promotional activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Bulk Order Discount</div>
                  <div className="text-sm text-muted-foreground">Starts Feb 1, 2024</div>
                </div>
                <Badge variant="secondary">Scheduled</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Valentine's Day Special</div>
                  <div className="text-sm text-muted-foreground">Starts Feb 10, 2024</div>
                </div>
                <Badge variant="secondary">Scheduled</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PromotionsDiscounts;
