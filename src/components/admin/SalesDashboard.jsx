"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '../ui/input';
import { ShoppingCart, Package, TrendingUp, AlertTriangle, Plus, Eye, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const mockProducts = [
  { id: 1, name: 'Eco Water Bottle', stock: 150, price: 25.99, sales: 45, status: 'active' },
  { id: 2, name: 'Bamboo Phone Case', stock: 5, price: 15.99, sales: 23, status: 'low_stock' },
  { id: 3, name: 'Solar Power Bank', stock: 80, price: 49.99, sales: 67, status: 'active' },
  { id: 4, name: 'Organic Cotton Tote', stock: 0, price: 12.99, sales: 12, status: 'out_of_stock' },
];

const mockOrders = [
  { id: '#1234', customer: 'John Doe', items: 3, total: 87.97, status: 'pending' },
  { id: '#1235', customer: 'Jane Smith', items: 1, total: 25.99, status: 'shipped' },
  { id: '#1236', customer: 'Mike Johnson', items: 2, total: 65.98, status: 'processing' },
];

const SalesDashboard = () => {
  const [managerName, setManagerName] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [managers, setManagers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoadingManagers, setIsLoadingManagers] = useState(true);
  const managerRole = "manager:sales";

  const getStockBadge = (status) => {
    switch (status) {
      case 'low_stock': return <Badge variant="destructive">Low Stock</Badge>;
      case 'out_of_stock': return <Badge variant="secondary">Out of Stock</Badge>;
      default: return <Badge variant="default">In Stock</Badge>;
    }
  };

  const getOrderBadge = (status) => {
    switch (status) {
      case 'pending': return <Badge variant="outline">Pending</Badge>;
      case 'confirmed': return <Badge variant="outline" className="bg-green-400">Confirmed</Badge>;
      case 'shipped': return (
        <Badge variant="default" className="bg-yellow-400 text-black">
          Shipped
        </Badge>
      );
      case 'delivered': return (
        <Badge variant="default" className="bg-blend-hue">
          Delivered
        </Badge>
      );
      case 'cancelled': return (
        <Badge variant="destructive">
          Cancelled
        </Badge>
      );
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
    if (!managerEmail || !managerName) return toast.error("Please enter an name and email of manager");

    setIsCreating(true);
    try {
      const res = await fetch("/api/admin/managers/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name:managerName, email: managerEmail, role: managerRole }),
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

  // ✅ Delete sales manager
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

 useEffect(() => {
   const fetchOrders = async () => {
     try {
       const res = await fetch("/api/admin/order", {
         credentials: "include",
       });

       const data = await res.json();

       if (res.ok) {
         setOrders(data);
       } else {
         console.error("Fetch failed:", data.message || "Unknown error");
       }
     } catch (error) {
       console.error("Error fetching orders:", error);
     }
   };

   fetchOrders();
 }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update order status");
      }

      // Update the UI optimistically
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      toast.success("✅ Status updated succesfully")
    } catch (error) {
      console.error("Error updating status:", error);
      toast.err("❌ Something went wrong!");
    }
  };


  return (
    <div className="space-y-4">
      {/* Create Sales Manager Card */}
      <Card>
        <CardHeader>
          <CardTitle>Create Sales Manager</CardTitle>
          <CardDescription>
            Enter manager's email to create an account. A strong password will
            be auto-generated.
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

      {/* ✅ Sales Managers List */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Managers</CardTitle>
          <CardDescription>
            List of all registered sales managers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingManagers ? (
            <p>Loading...</p>
          ) : managers.length === 0 ? (
            <p className="text-muted-foreground">No sales managers found</p>
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
                    <TableCell className="font-medium">
                      {manager.name}
                    </TableCell>
                    <TableCell>{manager.email}</TableCell>
                    <TableCell>
                      {new Date(manager.createdAt).toLocaleDateString()}
                    </TableCell>
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

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹2,847.50</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Orders
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Need processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Items
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Require restocking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">147</div>
            <p className="text-xs text-muted-foreground">Active products</p>
          </CardContent>
        </Card>
      </div>

      {/* Products Management */}
      {/* <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Product Management</CardTitle>
              <CardDescription>
                Manage your product inventory and pricing
              </CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Sales</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>₹{product.price}</TableCell>
                  <TableCell>{product.sales}</TableCell>
                  <TableCell>{getStockBadge(product.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card> */}

      {/* Recent Orders */}
      <Card className="max-h-80 overflow-y-scroll">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Orders that need attention</CardDescription>
            </div>
            <Button variant="outline">View All Orders</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Addres</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.orderId}>
                  <TableCell className="font-medium">{order.orderId}</TableCell>
                  <TableCell>{order.deliveryAddress?.fullName}</TableCell>
                  <TableCell>₹{order.totalAmount}</TableCell>
                  <TableCell>{order.deliveryAddress?.city}</TableCell>
                  <TableCell>{getOrderBadge(order.status)}</TableCell>
                  <TableCell>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order._id, e.target.value)
                      }
                      className="border rounded px-2 py-1 text-sm"
                    >
                      {[
                        "pending",
                        "confirmed",
                        "shipped",
                        "delivered",
                        "cancelled",
                      ].map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
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

export default SalesDashboard;
