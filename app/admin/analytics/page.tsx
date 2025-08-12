"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchEventAnalytics, fetchOverallAnalytics } from "@/store/slices/analyticsSlice"
import { fetchEvents } from "@/store/slices/eventSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts"
import { Users, DollarSign, RefreshCw, Calendar, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function AnalyticsPage() {
  const dispatch = useAppDispatch()
  const { eventAnalytics, overallAnalytics, loading, error } = useAppSelector((state) => state.analytics)
  const { events } = useAppSelector((state) => state.events)
  console.log(events)
  const [selectedEventId, setSelectedEventId] = useState<string>("")
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    dispatch(fetchEvents())
    dispatch(fetchOverallAnalytics())
  }, [dispatch])

  useEffect(() => {
    if (selectedEventId) {
      dispatch(fetchEventAnalytics(Number.parseInt(selectedEventId)))
    }
  }, [dispatch, selectedEventId])

  const handleRefresh = () => {
    if (activeTab === "overview") {
      dispatch(fetchOverallAnalytics())
    } else if (selectedEventId) {
      dispatch(fetchEventAnalytics(Number.parseInt(selectedEventId)))
    }
    toast.success("Analytics refreshed")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Analytics</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into your event management performance</p>
        </div>
        <Button onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="event">Event Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {overallAnalytics && (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overallAnalytics.overall_stats.total_events}</div>
                    <p className="text-xs text-muted-foreground">
                      {overallAnalytics.overall_stats.active_events} active
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(overallAnalytics.overall_stats.total_budget)}
                    </div>
                    <p className="text-xs text-muted-foreground">Across all events</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Expected Guests</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overallAnalytics.overall_stats.total_expected_guests}</div>
                    <p className="text-xs text-muted-foreground">Total across events</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed Events</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overallAnalytics.overall_stats.completed_events}</div>
                    <p className="text-xs text-muted-foreground">Successfully completed</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Events by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={overallAnalytics.events_by_category}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ category, count }) => `${category}: ${count}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {overallAnalytics.events_by_category.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Events by Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={overallAnalytics.events_by_status}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="status" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Events */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Events</CardTitle>
                  <CardDescription>Your latest event activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {overallAnalytics.recent_events.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h4 className="font-semibold">{event.name}</h4>
                            <p className="text-sm text-gray-600">
                              {formatDate(event.date)} • {event.category}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge variant={event.status === "completed" ? "default" : "secondary"}>{event.status}</Badge>
                          <span className="font-semibold">{formatCurrency(event.budget)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="event" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Event for Analysis</CardTitle>
              <CardDescription>Choose an event to view detailed analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id.toString()}>
                      {event.name} - {formatDate(event.date)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {eventAnalytics && (
            <>
              {/* Event Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>{eventAnalytics.event.name}</CardTitle>
                  <CardDescription>
                    {formatDate(eventAnalytics.event.date)} • {eventAnalytics.event.category}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <Badge>{eventAnalytics.event.status}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Budget</p>
                      <p className="font-semibold">{formatCurrency(eventAnalytics.event.budget)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Expected Guests</p>
                      <p className="font-semibold">{eventAnalytics.event.expected_guests}</p>
                    </div>
                  </div>

                  {!eventAnalytics.progress.is_past_event && (
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-gray-600">Planning Progress</p>
                        <p className="text-sm font-semibold">{eventAnalytics.progress.planning_progress}%</p>
                      </div>
                      <Progress value={eventAnalytics.progress.planning_progress} className="w-full" />
                      <p className="text-xs text-gray-500 mt-1">
                        {eventAnalytics.progress.days_until_event} days until event
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Budget Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Budget Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Estimated:</span>
                        <span className="font-semibold">
                          {formatCurrency(eventAnalytics.budget.stats.total_estimated)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Actual:</span>
                        <span className="font-semibold">
                          {formatCurrency(eventAnalytics.budget.stats.total_actual)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Variance:</span>
                        <span
                          className={`font-semibold ${eventAnalytics.budget.variance >= 0 ? "text-red-600" : "text-green-600"}`}
                        >
                          {formatCurrency(eventAnalytics.budget.variance)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Budget Utilization:</span>
                        <span className="font-semibold">{eventAnalytics.budget.budget_utilization.toFixed(1)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Budget by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={eventAnalytics.budget.by_category}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Legend />
                        <Bar dataKey="estimated" fill="#8884d8" name="Estimated" />
                        <Bar dataKey="actual" fill="#82ca9d" name="Actual" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Guest Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Guest Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Guests:</span>
                        <span className="font-semibold">{eventAnalytics.guests.stats.total_guests}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Attendees (with +1s):</span>
                        <span className="font-semibold">{eventAnalytics.guests.stats.total_attendees}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Confirmed:</span>
                        <span className="font-semibold text-green-600">
                          {eventAnalytics.guests.stats.confirmed_guests}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>RSVP Rate:</span>
                        <span className="font-semibold">{eventAnalytics.guests.rsvp_rate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Attendance Rate:</span>
                        <span className="font-semibold">{eventAnalytics.guests.attendance_rate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Guests by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={eventAnalytics.guests.by_category}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ category, count }) => `${category}: ${count}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {eventAnalytics.guests.by_category.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {overallAnalytics && (
            <Card>
              <CardHeader>
                <CardTitle>Monthly Event Creation Trend</CardTitle>
                <CardDescription>Track your event planning activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={overallAnalytics.monthly_trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {eventAnalytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Budget Timeline</CardTitle>
                  <CardDescription>Monthly budget spending for this event</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={eventAnalytics.budget.timeline}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Line type="monotone" dataKey="amount" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Guest Registration Timeline</CardTitle>
                  <CardDescription>Guest registration activity over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={eventAnalytics.guests.timeline}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#82ca9d" name="Guests" />
                      <Line type="monotone" dataKey="attendees" stroke="#8884d8" name="Total Attendees" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
