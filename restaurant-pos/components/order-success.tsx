"use client"

import React, { useEffect, useState } from "react";
import { CheckCircle, Printer, Download, ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface OrderSuccessProps {
  restaurantId: string;
  orderId: string;
  onBackToOrders?: () => void;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  subtotal?: number;
  notes?: string;
  modifiers?: string[];
}

interface OrderData {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  orderDate: string;
  status: string;
  type: string;
  tableNumber?: string;
  customer?: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  payment?: {
    method: string;
    status: string;
    amount: number;
    transactionId?: string;
    paymentDate?: string;
  };
}

const statusColors: Record<string, string> = {
  COMPLETED: "bg-green-500",
  PENDING: "bg-yellow-500",
  PREPARING: "bg-blue-500",
  READY: "bg-purple-500",
  CANCELLED: "bg-red-500",
};

const typeBadges: Record<string, { label: string; className: string }> = {
  DINE_IN: { label: "Dine-in", className: "border-blue-500 text-blue-500" },
  TAKEOUT: { label: "Takeaway", className: "border-amber-500 text-amber-500" },
  DELIVERY: { label: "Delivery", className: "border-purple-500 text-purple-500" },
};

const OrderSuccess: React.FC<OrderSuccessProps> = ({ restaurantId, orderId, onBackToOrders }) => {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:8000/api/v1/admin/hotel/restaurant/${restaurantId}/orders/${orderId}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Failed to fetch order");
        setOrder(data.data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [restaurantId, orderId]);

  const printReceipt = () => {
    if (!order) return;
    const printWindow = window.open('', 'PRINT', 'height=800,width=600');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Order Receipt - ${order.orderNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            h1 { text-align: center; }
            .order-details { display: flex; justify-content: space-between; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .total { font-weight: bold; text-align: right; }
          </style>
        </head>
        <body>
          <h1>Order Receipt</h1>
          <div class="order-details">
            <div>
              <strong>Order ID:</strong> ${order.orderNumber}<br>
              <strong>Customer:</strong> ${order.customer?.name || "-"}<br>
              <strong>Date:</strong> ${new Date(order.orderDate).toLocaleString()}
            </div>
            <div>
              <strong>Order Type:</strong> ${order.type.replace('_', ' ')}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.price.toFixed(2)}</td>
                  <td>$${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            <p>Subtotal: $${order.subtotal.toFixed(2)}</p>
            <p>Tax: $${order.tax.toFixed(2)}</p>
            <p><strong>Total: $${order.total.toFixed(2)}</strong></p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const downloadInvoice = () => {
    if (!order) return;
    const invoice = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      customer: order.customer,
      date: order.orderDate,
      items: order.items,
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      type: order.type,
      status: order.status,
      paymentMethod: order.payment?.method,
    };
    const blob = new Blob([JSON.stringify(invoice, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `invoice_${order.orderNumber}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
        <span className="text-gray-600">Loading order details...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <span className="text-red-500 text-lg font-semibold mb-2">Error</span>
        <span className="text-gray-600 mb-4">{error || "Order not found."}</span>
        <Button onClick={() => window.location.reload()} variant="default">Retry</Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Button variant="ghost" size="sm" onClick={onBackToOrders || (() => window.location.href = "/")}
        className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
      </Button>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col items-center text-center pb-2">
          <CheckCircle className="text-green-500 w-16 h-16 mb-2" />
          <CardTitle className="text-2xl">Order Placed Successfully!</CardTitle>
          <CardDescription className="text-base mt-1">Thank you{order.customer?.name ? `, ${order.customer.name}` : ''}! Your order has been placed.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Order ID:</span>
              <span className="font-medium">{order.orderNumber}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Date:</span>
              <span className="font-medium">{new Date(order.orderDate).toLocaleString()}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge className={statusColors[order.status] || "bg-gray-400"}>{order.status.charAt(0) + order.status.slice(1).toLowerCase()}</Badge>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Type:</span>
              <Badge variant="outline" className={typeBadges[order.type]?.className || ""}>{typeBadges[order.type]?.label || order.type}</Badge>
            </div>
            {order.type === "DINE_IN" && order.tableNumber && (
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Table:</span>
                <span className="font-medium">{order.tableNumber}</span>
              </div>
            )}
          </div>
          <Separator className="my-4" />
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Order Items</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      {item.name}
                      {item.notes && <div className="text-xs text-muted-foreground">Note: {item.notes}</div>}
                      {item.modifiers && item.modifiers.length > 0 && (
                        <div className="text-xs text-muted-foreground">Modifiers: {item.modifiers.join(", ")}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="space-y-2 border-t pt-2 mt-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <h3 className="font-semibold mb-2">Customer Info</h3>
              <div className="text-sm space-y-1">
                <div><span className="text-muted-foreground">Name:</span> {order.customer?.name || '-'}</div>
                {order.customer?.phone && <div><span className="text-muted-foreground">Phone:</span> {order.customer.phone}</div>}
                {order.customer?.email && <div><span className="text-muted-foreground">Email:</span> {order.customer.email}</div>}
                {order.customer?.address && <div><span className="text-muted-foreground">Address:</span> {order.customer.address}</div>}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Payment Info</h3>
              <div className="text-sm space-y-1">
                <div><span className="text-muted-foreground">Method:</span> {order.payment?.method || '-'}</div>
                <div><span className="text-muted-foreground">Status:</span> <Badge className="bg-green-500">Paid</Badge></div>
                {order.payment?.transactionId && <div><span className="text-muted-foreground">Transaction ID:</span> {order.payment.transactionId}</div>}
                {order.payment?.paymentDate && <div><span className="text-muted-foreground">Payment Date:</span> {new Date(order.payment.paymentDate).toLocaleString()}</div>}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col md:flex-row gap-2 justify-end mt-4">
          <Button variant="outline" onClick={printReceipt}><Printer className="mr-2 h-4 w-4" /> Print Receipt</Button>
          <Button onClick={downloadInvoice}><Download className="mr-2 h-4 w-4" /> Download Invoice</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OrderSuccess;
