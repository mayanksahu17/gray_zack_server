"use client"

import { Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, PieChart } from "@/components/ui/chart"
import { useEffect, useState } from "react"
import { getPaymentsData } from "@/app/api/psyment"
import { Skeleton } from "@/components/ui/skeleton"

// Define types for the API response
interface Transaction {
  id: string
  guest: string
  amount: string
  date: string
  method: string
  status: string
}

interface PaymentMethod {
  method: string
  percentage: number
}

interface RevenueSource {
  source: string
  amount: number
}

interface PaymentsData {
  transactions: Transaction[]
  paymentMethods: PaymentMethod[]
  revenueBySource: RevenueSource[]
}

export default function PaymentsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [paymentsData, setPaymentsData] = useState<PaymentsData>({
    transactions: [],
    paymentMethods: [],
    revenueBySource: []
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const data = await getPaymentsData()
        setPaymentsData(data)
      } catch (error) {
        console.error("Error fetching payment data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const { transactions, paymentMethods, revenueBySource } = paymentsData

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
      case "Paid":
        return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>
      case "Partial":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">{status}</Badge>
      case "Pending":
        return <Badge className="bg-red-500 hover:bg-red-600">{status}</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payments & Billing</h1>
        <p className="text-muted-foreground">Manage payments, transactions, and billing information.</p>
      </div>

      <div className="relative w-full md:w-96">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input type="search" placeholder="Search transactions..." className="pl-8" />
      </div>

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Sources</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>View all payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Guest</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.length > 0 ? (
                        transactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell className="font-medium">{transaction.id}</TableCell>
                            <TableCell>{transaction.guest}</TableCell>
                            <TableCell>{transaction.amount}</TableCell>
                            <TableCell>{transaction.date}</TableCell>
                            <TableCell>{transaction.method}</TableCell>
                            <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">No transaction data available</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="methods" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Distribution of payment methods used</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Skeleton className="h-[350px] w-[350px] rounded-full" />
                </div>
              ) : paymentMethods.length > 0 ? (
                <PieChart
                  data={paymentMethods}
                  index="method"
                  categories={["percentage"]}
                  colors={["blue", "cyan", "indigo", "violet", "fuchsia"]}
                  valueFormatter={(value) => `${value}%`}
                  className="h-[400px]"
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No payment method data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="revenue" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Source</CardTitle>
              <CardDescription>Revenue breakdown by booking source</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {isLoading ? (
                <div className="space-y-2">
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : revenueBySource.length > 0 ? (
                <BarChart
                  data={revenueBySource}
                  index="source"
                  categories={["amount"]}
                  colors={["blue"]}
                  valueFormatter={(value) => `$${value.toLocaleString()}`}
                  className="h-[400px]"
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No revenue source data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
