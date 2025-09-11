import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, FileText, TrendingUp, CreditCard, Download, Eye, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const mockTransactions = [
  { id: 'TXN001', type: 'Sale', amount: 156.50, date: '2024-01-15', status: 'completed' },
  { id: 'TXN002', type: 'Refund', amount: -25.99, date: '2024-01-15', status: 'processed' },
  { id: 'TXN003', type: 'Sale', amount: 89.99, date: '2024-01-14', status: 'completed' },
  { id: 'TXN004', type: 'Sale', amount: 245.00, date: '2024-01-14', status: 'pending' },
];

const mockInvoices = [
  { id: 'INV-001', customer: 'Acme Corp', amount: 1250.00, date: '2024-01-10', status: 'paid' },
  { id: 'INV-002', customer: 'Tech Solutions', amount: 875.50, date: '2024-01-12', status: 'overdue' },
  { id: 'INV-003', customer: 'Green Energy Co', amount: 2150.00, date: '2024-01-14', status: 'sent' },
];

const FinanceDashboard = () => {

    const [managerName, setManagerName] = useState('');
    const [managerEmail, setManagerEmail] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [managers, setManagers] = useState([]);
    const [isLoadingManagers, setIsLoadingManagers] = useState(true);
    const managerRole = "manager:finance";

  const getTransactionBadge = (status) => {
    switch (status) {
      case 'completed': return <Badge variant="default">Completed</Badge>;
      case 'pending': return <Badge variant="outline">Pending</Badge>;
      case 'processed': return <Badge variant="secondary">Processed</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getInvoiceBadge = (status) => {
    switch (status) {
      case 'paid': return <Badge variant="default">Paid</Badge>;
      case 'overdue': return <Badge variant="destructive">Overdue</Badge>;
      case 'sent': return <Badge variant="outline">Sent</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  // view managers
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
      const managerRole = "manager:finance";
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
  
        toast.success(`Sales Manager created! Password: ${data.password}`);
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
          <CardTitle>Create Finance Manager</CardTitle>
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
          <CardTitle>Finance Managers</CardTitle>
          <CardDescription>List of all registered finance managers</CardDescription>
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

      {/* Financial Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹12,845.23</div>
            <p className="text-xs text-muted-foreground">+15.3% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹3,025.50</div>
            <p className="text-xs text-muted-foreground">2 overdue invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹8,456.12</div>
            <p className="text-xs text-muted-foreground">-5.2% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest financial transactions and payments</CardDescription>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.id}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell className={transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}>
                    {transaction.amount < 0 ? '-' : ''}₹{Math.abs(transaction.amount)}
                  </TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{getTransactionBadge(transaction.status)}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invoice Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Invoice Management</CardTitle>
              <CardDescription>Track and manage customer invoices</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
              <Button variant="outline">View All</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.customer}</TableCell>
                  <TableCell>₹{invoice.amount}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>{getInvoiceBadge(invoice.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
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

export default FinanceDashboard;
