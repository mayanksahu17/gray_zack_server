"use client"

import { Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components_m2/ui/card"
import { Input } from "@/components_m2/ui/input"
import { Badge } from "@/components_m2/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components_m2/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components_m2/ui/tabs"
import { staffData } from "@/lib/mock-data"
import { BarChart, PieChart } from "@/components_m2/ui/chart"
import { Progress } from "@/components_m2/ui/progress"
import { useState } from 'react';
import axios from 'axios';

export default function StaffPage() {
  const { staff, performanceByRole, staffByShift } = staffData
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: '', permissions: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const roleOptions = [
    { value: 'front_desk', label: 'Front Desk' },
    { value: 'housekeeper', label: 'Housekeeper' },
    { value: 'restaurant_manager', label: 'Restaurant Manager' },
    { value: 'spa_manager', label: 'Spa Manager' },
    { value: 'hotel_owner', label: 'Hotel Owner' },
    { value: 'admin', label: 'Admin' },
  ];
  const permissionOptions = [
    { value: 'clean_rooms', label: 'Clean Rooms' },
    { value: 'manage_bookings', label: 'Manage Bookings' },
    { value: 'view_reports', label: 'View Reports' },
    // Add more as needed
  ];
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "On Duty":
        return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>
      case "Off Duty":
        return <Badge className="bg-gray-500 hover:bg-gray-600">{status}</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPerformanceBadge = (performance: number) => {
    if (performance >= 90) {
      return <Badge className="bg-green-500 hover:bg-green-600">Excellent</Badge>
    } else if (performance >= 80) {
      return <Badge className="bg-blue-500 hover:bg-blue-600">Good</Badge>
    } else if (performance >= 70) {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Average</Badge>
    } else {
      return <Badge className="bg-red-500 hover:bg-red-600">Needs Improvement</Badge>
    }
  }

  const shiftData = [
    { shift: "Morning", count: staffByShift.morning },
    { shift: "Evening", count: staffByShift.evening },
    { shift: "Night", count: staffByShift.night },
  ]

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const token = typeof window !== 'undefined' ? require('js-cookie').get('adminAccessToken') : '';
      const res = await axios.post(
        `http://localhost:8000/api/v1/admin/hotels/67dd8f8173deaf59ece8e7f3/roles`,
        {
          ...form,
          permissions: selectedPermissions,
          password: Math.random().toString(36).slice(-8),
        },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      setSuccess('Staff created and credentials sent by email.');
      setForm({ name: '', email: '', phone: '', role: '', permissions: '' });
      setSelectedPermissions([]);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error creating staff');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staff Performance</h1>
        <p className="text-muted-foreground">Manage and monitor staff performance and schedules.</p>
      </div>

      <div className="relative w-full md:w-96">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input type="search" placeholder="Search staff..." className="pl-8" />
      </div>

      {/* Staff Creation Form */}
      <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-md">
        <h2 className="text-xl font-semibold">Add New Staff</h2>
        <div className="flex gap-4 flex-wrap">
          <Input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
          <Input name="email" value={form.email} onChange={handleChange} placeholder="Email" required type="email" />
          <Input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" required />
          {/* Role dropdown */}
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            required
            className="border rounded px-2 py-1"
          >
            <option value="">Select Role</option>
            {roleOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {/* Permissions multi-select */}
          <select
            multiple
            value={selectedPermissions}
            onChange={e => setSelectedPermissions(Array.from(e.target.selectedOptions, option => option.value))}
            className="border rounded px-2 py-1"
          >
            {permissionOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Creating...' : 'Create Staff'}</button>
        {success && <div className="text-green-600">{success}</div>}
        {error && <div className="text-red-600">{error}</div>}
      </form>

      <Tabs defaultValue="staff">
        <TabsList>
          <TabsTrigger value="staff">Staff List</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="shifts">Shift Distribution</TabsTrigger>
        </TabsList>
        <TabsContent value="staff" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Members</CardTitle>
              <CardDescription>All staff members and their current status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Shift</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staff.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.id}</TableCell>
                        <TableCell>{member.name}</TableCell>
                        <TableCell>{member.role}</TableCell>
                        <TableCell>{member.shift}</TableCell>
                        <TableCell>{getStatusBadge(member.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={member.performance} className="h-2 w-20" />
                            <span className="text-sm">{member.performance}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="performance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Role</CardTitle>
              <CardDescription>Average performance metrics by staff role</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <BarChart
                data={performanceByRole}
                index="role"
                categories={["performance"]}
                colors={["blue"]}
                valueFormatter={(value) => `${value}%`}
                className="h-[400px]"
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="shifts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff by Shift</CardTitle>
              <CardDescription>Distribution of staff across different shifts</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <PieChart
                data={shiftData}
                index="shift"
                categories={["count"]}
                colors={["blue", "indigo", "violet"]}
                valueFormatter={(value) => `${value} staff`}
                className="h-[400px]"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
