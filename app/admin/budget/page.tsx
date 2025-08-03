"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { DollarSign, Plus, Search, Edit, Trash2, MoreHorizontal, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { fetchBudgetItems, deleteBudgetItem } from "@/store/slices/budgetSlice"
import { fetchEvents } from "@/store/slices/eventSlice"
import { toast } from "sonner"
import Link from "next/link"

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  partial: "bg-blue-100 text-blue-800",
  overdue: "bg-red-100 text-red-800",
}

const statusIcons = {
  pending: Clock,
  paid: CheckCircle,
  partial: AlertTriangle,
  overdue: AlertTriangle,
}

export default function BudgetPage() {
  const dispatch = useDispatch()
  const { budgetItems, isLoading } = useSelector((state: any) => state.budget)
  const { events } = useSelector((state: any) => state.events)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [eventFilter, setEventFilter] = useState("all")

  useEffect(() => {
    dispatch(fetchBudgetItems())
    dispatch(fetchEvents())
  }, [dispatch])

  const handleDeleteBudgetItem = async (itemId: number) => {
    if (window.confirm("Are you sure you want to delete this budget item?")) {
      try {
        await dispatch(deleteBudgetItem(itemId)).unwrap()
        toast.success("Budget item deleted successfully")
      } catch (error) {
        toast.error("Failed to delete budget item")
      }
    }
  }

  const filteredBudgetItems = budgetItems.filter((item: any) => {
    const matchesSearch =
      item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vendor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
    const matchesEvent = eventFilter === "all" || item.event.toString() === eventFilter

    return matchesSearch && matchesStatus && matchesCategory && matchesEvent
  })

  // Calculate totals
  const totalEstimated = budgetItems.reduce((sum: number, item: any) => sum + Number.parseFloat(item.estimated_cost), 0)
  const totalActual = budgetItems.reduce((sum: number, item: any) => sum + Number.parseFloat(item.actual_cost), 0)
  const budgetUsagePercentage = totalEstimated > 0 ? (totalActual / totalEstimated) * 100 : 0

  // Group by event for summary
  const eventSummary = events.map((event: any) => {
    const eventItems = budgetItems.filter((item: any) => item.event === event.id)
    const estimated = eventItems.reduce((sum: number, item: any) => sum + Number.parseFloat(item.estimated_cost), 0)
    const actual = eventItems.reduce((sum: number, item: any) => sum + Number.parseFloat(item.actual_cost), 0)
    return {
      ...event,
      estimated,
      actual,
      percentage: estimated > 0 ? (actual / estimated) * 100 : 0,
    }
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Management</h1>
          <p className="text-muted-foreground">Track and manage your event expenses</p>
        </div>
        <Link href="/admin/budget/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Budget Item
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estimated</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{totalEstimated.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{totalActual.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{budgetUsagePercentage.toFixed(1)}% of budget used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{(totalEstimated - totalActual).toLocaleString()}</div>
            <Progress value={budgetUsagePercentage} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Event Budget Summary */}
      {eventSummary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Budget by Event</CardTitle>
            <CardDescription>Budget breakdown for each event</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {eventSummary.map((event: any) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">{event.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      ৳{event.actual.toLocaleString()} / ৳{event.estimated.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm font-medium">{event.percentage.toFixed(1)}%</div>
                    <Progress value={event.percentage} className="w-24" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {events.map((event: any) => (
                  <SelectItem key={event.id} value={event.id.toString()}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="venue">Venue</SelectItem>
                <SelectItem value="catering">Catering</SelectItem>
                <SelectItem value="decoration">Decoration</SelectItem>
                <SelectItem value="photography">Photography</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="transportation">Transportation</SelectItem>
                <SelectItem value="flowers">Flowers</SelectItem>
                <SelectItem value="invitations">Invitations</SelectItem>
                <SelectItem value="gifts">Gifts</SelectItem>
                <SelectItem value="miscellaneous">Miscellaneous</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Budget Items */}
      {filteredBudgetItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {budgetItems.length === 0 ? "No Budget Items Yet" : "No Items Found"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {budgetItems.length === 0
                ? "Add your first budget item to start tracking expenses"
                : "Try adjusting your search or filter criteria"}
            </p>
            {budgetItems.length === 0 && (
              <Link href="/admin/budget/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Budget Item
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Budget Items</CardTitle>
            <CardDescription>All budget items across your events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredBudgetItems.map((item: any) => {
                const StatusIcon = statusIcons[item.status as keyof typeof statusIcons]
                const event = events.find((e: any) => e.id === item.event)
                const costPercentage = item.estimated_cost > 0 ? (item.actual_cost / item.estimated_cost) * 100 : 0

                return (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{item.item_name}</h4>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Item
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteBudgetItem(item.id)} className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Item
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="capitalize">{item.category}</span>
                        {event && (
                          <>
                            <span>•</span>
                            <span>{event.name}</span>
                          </>
                        )}
                        {item.vendor && (
                          <>
                            <span>•</span>
                            <span>{item.vendor}</span>
                          </>
                        )}
                        {item.due_date && (
                          <>
                            <span>•</span>
                            <span>Due: {new Date(item.due_date).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Badge className={statusColors[item.status as keyof typeof statusColors]}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {item.status}
                          </Badge>
                          <div className="text-sm">
                            <span className="font-medium">৳{Number.parseFloat(item.actual_cost).toLocaleString()}</span>
                            <span className="text-muted-foreground">
                              {" "}
                              / ৳{Number.parseFloat(item.estimated_cost).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{costPercentage.toFixed(1)}%</div>
                          <Progress value={costPercentage} className="w-24 mt-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
