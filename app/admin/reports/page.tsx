"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchEventAnalytics, fetchOverallAnalytics } from "@/store/slices/analyticsSlice"
import { fetchEvents } from "@/store/slices/eventSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, FileText, Search, Calendar, DollarSign, Users, TrendingUp, AlertCircle } from "lucide-react"
import { toast } from "sonner"

export default function ReportsPage() {
  const dispatch = useAppDispatch()
  const { eventAnalytics, overallAnalytics, loading, error } = useAppSelector((state) => state.analytics)
  const { events } = useAppSelector((state) => state.events)

  const [selectedEventId, setSelectedEventId] = useState<string>("all")
  const [reportType, setReportType] = useState<string>("summary")
  const [dateRange, setDateRange] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("")

  useEffect(() => {
    dispatch(fetchEvents())
    dispatch(fetchOverallAnalytics())
  }, [dispatch])

  useEffect(() => {
    if (selectedEventId !== "all") {
      dispatch(fetchEventAnalytics(Number.parseInt(selectedEventId)))
    }
  }, [dispatch, selectedEventId])

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
      month: "long",
      day: "numeric",
    })
  }

  const handleExportCSV = () => {
    if (!overallAnalytics) return

    const csvData = [
      ["Event Name", "Date", "Status", "Category", "Budget"],
      ...overallAnalytics.recent_events.map((event) => [
        event.name,
        event.date,
        event.status,
        event.category,
        event.budget.toString(),
      ]),
    ]

    const csvContent = csvData.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `events-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast.success("Report exported as CSV")
  }

  const handleExportPDF = () => {
    // In a real application, you would use a library like jsPDF or html2pdf
    toast.info("PDF export functionality would be implemented here")
  }

  const filteredEvents = events.filter(
    (event) =>
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Reports</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => dispatch(fetchOverallAnalytics())}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Generate comprehensive reports for your events</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={handleExportPDF} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Report Configuration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
          <CardDescription>Customize your report parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Executive Summary</SelectItem>
                  <SelectItem value="detailed">Detailed Analysis</SelectItem>
                  <SelectItem value="financial">Financial Report</SelectItem>
                  <SelectItem value="guest">Guest Analysis</SelectItem>
                  <SelectItem value="vendor">Vendor Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event">Event</Label>
              <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                <SelectTrigger>
                  <SelectValue placeholder="All events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id.toString()}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                  <SelectItem value="thisYear">This Year</SelectItem>
                  <SelectItem value="lastYear">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search">Search Events</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      {reportType === "summary" && overallAnalytics && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
              <CardDescription>High-level overview of your event management performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-900">{overallAnalytics.overall_stats.total_events}</div>
                  <div className="text-sm text-blue-700">Total Events</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-900">
                    {formatCurrency(overallAnalytics.overall_stats.total_budget)}
                  </div>
                  <div className="text-sm text-green-700">Total Budget</div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-900">
                    {overallAnalytics.overall_stats.total_expected_guests}
                  </div>
                  <div className="text-sm text-purple-700">Expected Guests</div>
                </div>

                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-900">
                    {overallAnalytics.overall_stats.completed_events}
                  </div>
                  <div className="text-sm text-orange-700">Completed Events</div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Success Rate:</span>
                      <span className="font-semibold">
                        {overallAnalytics.overall_stats.total_events > 0
                          ? (
                              (overallAnalytics.overall_stats.completed_events /
                                overallAnalytics.overall_stats.total_events) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Events:</span>
                      <span className="font-semibold">{overallAnalytics.overall_stats.active_events}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Budget per Event:</span>
                      <span className="font-semibold">
                        {formatCurrency(
                          overallAnalytics.overall_stats.total_events > 0
                            ? overallAnalytics.overall_stats.total_budget / overallAnalytics.overall_stats.total_events
                            : 0,
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Top Event Categories</h3>
                  <div className="space-y-2">
                    {overallAnalytics.events_by_category.slice(0, 5).map((category, index) => (
                      <div key={category.category} className="flex justify-between items-center">
                        <span className="capitalize">{category.category}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{category.count}</Badge>
                          <span className="text-sm text-gray-600">{formatCurrency(category.total_budget)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Event-Specific Report */}
      {selectedEventId !== "all" && eventAnalytics && (
        <Card>
          <CardHeader>
            <CardTitle>{eventAnalytics.event.name} - Detailed Report</CardTitle>
            <CardDescription>
              {formatDate(eventAnalytics.event.date)} • {eventAnalytics.event.category}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Event Overview */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Event Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge className="mt-1">{eventAnalytics.event.status}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Budget</p>
                    <p className="font-semibold text-lg">{formatCurrency(eventAnalytics.event.budget)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Expected Guests</p>
                    <p className="font-semibold text-lg">{eventAnalytics.event.expected_guests}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Financial Summary */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Estimated Cost:</span>
                      <span className="font-semibold">
                        {formatCurrency(eventAnalytics.budget.stats.total_estimated)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Actual Cost:</span>
                      <span className="font-semibold">{formatCurrency(eventAnalytics.budget.stats.total_actual)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Budget Variance:</span>
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

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Paid Items:</span>
                      <span className="font-semibold text-green-600">{eventAnalytics.budget.stats.paid_items}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending Items:</span>
                      <span className="font-semibold text-yellow-600">{eventAnalytics.budget.stats.pending_items}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Overdue Items:</span>
                      <span className="font-semibold text-red-600">{eventAnalytics.budget.stats.overdue_items}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Budget Items:</span>
                      <span className="font-semibold">{eventAnalytics.budget.stats.total_items}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Guest Analysis */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Guest Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Guests:</span>
                      <span className="font-semibold">{eventAnalytics.guests.stats.total_guests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Attendees (with +1s):</span>
                      <span className="font-semibold">{eventAnalytics.guests.stats.total_attendees}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Confirmed Guests:</span>
                      <span className="font-semibold text-green-600">
                        {eventAnalytics.guests.stats.confirmed_guests}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>RSVP Rate:</span>
                      <span className="font-semibold">{eventAnalytics.guests.rsvp_rate.toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Pending RSVPs:</span>
                      <span className="font-semibold text-yellow-600">
                        {eventAnalytics.guests.stats.pending_guests}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Declined:</span>
                      <span className="font-semibold text-red-600">{eventAnalytics.guests.stats.declined_guests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Checked In:</span>
                      <span className="font-semibold text-blue-600">
                        {eventAnalytics.guests.stats.checked_in_guests}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Attendance Rate:</span>
                      <span className="font-semibold">{eventAnalytics.guests.attendance_rate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Budget Breakdown by Category */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Budget Breakdown by Category</h3>
                <div className="space-y-3">
                  {eventAnalytics.budget.by_category.map((category) => (
                    <div
                      key={category.category}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium capitalize">{category.category}</p>
                        <p className="text-sm text-gray-600">{category.count} items</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(category.actual || 0)}</p>
                        <p className="text-sm text-gray-600">Est: {formatCurrency(category.estimated || 0)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Guest Categories */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Guest Categories</h3>
                <div className="space-y-3">
                  {eventAnalytics.guests.by_category.map((category) => (
                    <div
                      key={category.category}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium capitalize">{category.category}</p>
                        <p className="text-sm text-gray-600">
                          {category.confirmed} confirmed of {category.count} invited
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{category.attendees} attendees</p>
                        <p className="text-sm text-gray-600">
                          {category.count > 0 ? ((category.confirmed / category.count) * 100).toFixed(1) : 0}% confirmed
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events List */}
      {selectedEventId === "all" && (
        <Card>
          <CardHeader>
            <CardTitle>All Events Summary</CardTitle>
            <CardDescription>Overview of all your events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div>
                      <h4 className="font-semibold">{event.name}</h4>
                      <p className="text-sm text-gray-600">
                        {formatDate(event.date)} • {event.category} • {event.venue}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(event.budget)}</p>
                      <p className="text-sm text-gray-600">{event.expected_guests} guests</p>
                    </div>
                    <Badge variant={event.status === "completed" ? "default" : "secondary"}>{event.status}</Badge>
                    <Button variant="outline" size="sm" onClick={() => setSelectedEventId(event.id.toString())}>
                      View Report
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
