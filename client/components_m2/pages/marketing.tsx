"use client"

import { Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components_m2/ui/card"
import { Input } from "@/components_m2/ui/input"
import { Badge } from "@/components_m2/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components_m2/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components_m2/ui/tabs"
import { marketingData } from "@/lib/mock-data"
import { Progress } from "@/components_m2/ui/progress"

export default function MarketingPage() {
  const { campaigns, guestSegments, promoCodePerformance } = marketingData

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>
      case "Completed":
        return <Badge className="bg-blue-500 hover:bg-blue-600">{status}</Badge>
      case "Draft":
        return <Badge className="bg-gray-500 hover:bg-gray-600">{status}</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getLoyaltyBadge = (loyalty: string) => {
    switch (loyalty) {
      case "High":
        return <Badge className="bg-green-500 hover:bg-green-600">{loyalty}</Badge>
      case "Medium":
        return <Badge className="bg-blue-500 hover:bg-blue-600">{loyalty}</Badge>
      case "Low":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">{loyalty}</Badge>
      case "None":
        return <Badge className="bg-gray-500 hover:bg-gray-600">{loyalty}</Badge>
      default:
        return <Badge>{loyalty}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Marketing & Loyalty</h1>
        <p className="text-muted-foreground">Manage marketing campaigns and guest loyalty programs.</p>
      </div>

      <div className="relative w-full md:w-96">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input type="search" placeholder="Search campaigns..." className="pl-8" />
      </div>

      <Tabs defaultValue="campaigns">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="segments">Guest Segments</TabsTrigger>
          <TabsTrigger value="promo">Promo Codes</TabsTrigger>
        </TabsList>
        <TabsContent value="campaigns" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Marketing Campaigns</CardTitle>
              <CardDescription>All marketing campaigns and their performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Opened</TableHead>
                      <TableHead>Conversion</TableHead>
                      <TableHead>Open Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.id}</TableCell>
                        <TableCell>{campaign.name}</TableCell>
                        <TableCell>{campaign.type}</TableCell>
                        <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                        <TableCell>{campaign.sent.toLocaleString()}</TableCell>
                        <TableCell>{campaign.opened.toLocaleString()}</TableCell>
                        <TableCell>{campaign.conversion.toLocaleString()}</TableCell>
                        <TableCell>
                          {campaign.sent > 0 ? (
                            <div className="flex items-center gap-2">
                              <Progress value={(campaign.opened / campaign.sent) * 100} className="h-2 w-20" />
                              <span className="text-sm">{Math.round((campaign.opened / campaign.sent) * 100)}%</span>
                            </div>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="segments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Guest Segments</CardTitle>
              <CardDescription>Guest segmentation for targeted marketing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Segment</TableHead>
                      <TableHead>Count</TableHead>
                      <TableHead>Average Spend</TableHead>
                      <TableHead>Loyalty Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {guestSegments.map((segment, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{segment.segment}</TableCell>
                        <TableCell>{segment.count}</TableCell>
                        <TableCell>{segment.averageSpend}</TableCell>
                        <TableCell>{getLoyaltyBadge(segment.loyaltyPoints)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="promo" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Promo Code Performance</CardTitle>
              <CardDescription>Performance metrics for promotional codes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Promo Code</TableHead>
                      <TableHead>Redemptions</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Discount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promoCodePerformance.map((promo, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{promo.code}</TableCell>
                        <TableCell>{promo.redemptions}</TableCell>
                        <TableCell>{promo.revenue}</TableCell>
                        <TableCell>{promo.discount}</TableCell>
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
