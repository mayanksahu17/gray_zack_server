"use client"

import { Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components_m2/ui/card"
import { Input } from "@/components_m2/ui/input"
import { Badge } from "@/components_m2/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components_m2/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components_m2/ui/tabs"
import { settingsData } from "@/lib/mock-data"
import { Button } from "@/components_m2/ui/button"

export default function SettingsPage() {
  const { userRoles, integrations } = settingsData

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Connected":
        return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>
      case "Disconnected":
        return <Badge className="bg-red-500 hover:bg-red-600">{status}</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings & Integrations</h1>
        <p className="text-muted-foreground">Manage system settings and third-party integrations.</p>
      </div>

      <div className="relative w-full md:w-96">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input type="search" placeholder="Search settings..." className="pl-8" />
      </div>

      <Tabs defaultValue="roles">
        <TabsList>
          <TabsTrigger value="roles">User Roles</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        <TabsContent value="roles" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>User Roles & Permissions</CardTitle>
              <CardDescription>Manage user roles and access permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userRoles.map((role, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{role.role}</TableCell>
                        <TableCell>{role.count}</TableCell>
                        <TableCell>{role.permissions}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="integrations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Third-Party Integrations</CardTitle>
              <CardDescription>Manage connections to external services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Integration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Sync</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {integrations.map((integration, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{integration.name}</TableCell>
                        <TableCell>{getStatusBadge(integration.status)}</TableCell>
                        <TableCell>{integration.lastSync}</TableCell>
                        <TableCell>
                          <Button variant={integration.status === "Connected" ? "outline" : "default"} size="sm">
                            {integration.status === "Connected" ? "Disconnect" : "Connect"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
