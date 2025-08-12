"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Users, Phone, Copy, Settings, Plus } from "lucide-react"
import { toast } from "sonner"
import { apiClient } from "@/lib/api"

interface Event {
  id: number
  name: string
  date: string
  guest_count: number
}

interface Guest {
  id: number
  name: string
  phone: string
  email: string
}

interface Profile {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  whatsapp_number: string
}

export default function WhatsAppPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>("")
  const [guests, setGuests] = useState<Guest[]>([])
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setSaving] = useState(false)
  const [isLoadingContacts, setIsLoadingContacts] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (selectedEventId) {
      loadEventContacts()
    }
  }, [selectedEventId])

  const loadInitialData = async () => {
    try {
      setIsLoading(true)

      const [profileResponse, eventsResponse] = await Promise.all([apiClient.getProfile(), apiClient.getEvents()])

      setProfile(profileResponse)
      setWhatsappNumber(profileResponse.whatsapp_number || "")

      // Handle different response formats
      const eventsData = eventsResponse.results || eventsResponse || []
      setEvents(eventsData)
    } catch (error: any) {
      console.error("Error loading initial data:", error)
      toast.error("Failed to load data")
    } finally {
      setIsLoading(false)
    }
  }

  const loadEventContacts = async () => {
    if (!selectedEventId) return

    try {
      setIsLoadingContacts(true)
      const contactsResponse = await apiClient.getEventContacts(Number.parseInt(selectedEventId))

      // Handle different response formats
      const contactsData = contactsResponse.guests || contactsResponse || []
      setGuests(contactsData)
    } catch (error: any) {
      console.error("Error loading event contacts:", error)
      toast.error("Failed to load event contacts")
      setGuests([])
    } finally {
      setIsLoadingContacts(false)
    }
  }

  const handleSaveWhatsAppNumber = async () => {
    if (!whatsappNumber.trim()) {
      toast.error("Please enter a WhatsApp number")
      return
    }

    try {
      setSaving(true)

      await apiClient.updateProfile({
        whatsapp_number: whatsappNumber,
      })

      toast.success("WhatsApp number saved successfully")

      // Reload profile to get updated data
      const updatedProfile = await apiClient.getProfile()
      setProfile(updatedProfile)
    } catch (error: any) {
      console.error("Error saving WhatsApp number:", error)
      toast.error("Failed to save WhatsApp number")
    } finally {
      setSaving(false)
    }
  }

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return ""

    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, "")

    // Add Bangladesh country code if not present
    if (cleaned.startsWith("880")) {
      return `+${cleaned}`
    } else if (cleaned.startsWith("01")) {
      return `+880${cleaned.substring(1)}`
    } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
      return `+880${cleaned}`
    }

    return `+880${cleaned}`
  }

  const handleCreateWhatsAppGroup = async () => {
    if (!selectedEventId) {
      toast.error("Please select an event first")
      return
    }

    if (guests.length === 0) {
      toast.error("No guests found for this event")
      return
    }

    try {
      const phoneNumbers = guests
        .filter((guest) => guest.phone)
        .map((guest) => formatPhoneNumber(guest.phone))
        .filter((phone) => phone.length > 4)

      if (phoneNumbers.length === 0) {
        toast.error("No valid phone numbers found")
        return
      }

      const selectedEvent = events.find((e) => e.id === Number.parseInt(selectedEventId))
      const groupName = `${selectedEvent?.name || "Event"} - ${new Date().toLocaleDateString()}`

      // Create WhatsApp group URL
      const phoneList = phoneNumbers.join(",")
      const message = `Welcome to ${groupName}! This group is for event coordination and updates.`
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`

      // Copy phone numbers to clipboard
      await navigator.clipboard.writeText(phoneNumbers.join("\n"))

      toast.success("Phone numbers copied to clipboard!")

      // Open WhatsApp
      window.open(whatsappUrl, "_blank")

      // Show instructions
      toast.info("Create a new group in WhatsApp and add the copied phone numbers", {
        duration: 5000,
      })
    } catch (error: any) {
      console.error("Error creating WhatsApp group:", error)
      toast.error("Failed to create WhatsApp group")
    }
  }

  const copyPhoneNumbers = async () => {
    if (guests.length === 0) {
      toast.error("No guests to copy")
      return
    }

    const phoneNumbers = guests
      .filter((guest) => guest.phone)
      .map((guest) => `${guest.name}: ${formatPhoneNumber(guest.phone)}`)
      .join("\n")

    if (phoneNumbers) {
      await navigator.clipboard.writeText(phoneNumbers)
      toast.success("Phone numbers copied to clipboard!")
    } else {
      toast.error("No phone numbers to copy")
    }
  }

  const selectedEvent = events.find((e) => e.id === Number.parseInt(selectedEventId))
  const validPhoneNumbers = guests.filter((guest) => guest.phone).length
  const totalGuests = guests.length
  const guestsWithEmail = guests.filter((guest) => guest.email).length

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-2 bg-green-100 rounded-lg">
          <MessageCircle className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp Integration</h1>
          <p className="text-muted-foreground">Manage WhatsApp groups for your events</p>
        </div>
        <Badge variant="secondary" className="ml-auto">
          New
        </Badge>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Group Management
          </TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Configuration</CardTitle>
              <CardDescription>Configure your WhatsApp number for group management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp">Your WhatsApp Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="+880 1234 567890"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleSaveWhatsAppNumber} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter your WhatsApp number with country code (e.g., +880 for Bangladesh)
                </p>
              </div>

              {profile?.whatsapp_number && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Current WhatsApp: {profile.whatsapp_number}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Group Management Tab */}
        <TabsContent value="groups">
          <div className="space-y-6">
            {/* Event Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Event</CardTitle>
                <CardDescription>Choose an event to create a WhatsApp group</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">No events available</div>
                    ) : (
                      events.map((event) => (
                        <SelectItem key={event.id} value={event.id.toString()}>
                          {event.name} - {new Date(event.date).toLocaleDateString()}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Event Details & Stats */}
            {selectedEvent && (
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalGuests}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Phone Numbers</CardTitle>
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{validPhoneNumbers}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Email Addresses</CardTitle>
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{guestsWithEmail}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Event Date</CardTitle>
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-bold">{new Date(selectedEvent.date).toLocaleDateString()}</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Group Creation */}
            {selectedEventId && (
              <Card>
                <CardHeader>
                  <CardTitle>WhatsApp Group Creation</CardTitle>
                  <CardDescription>Create a WhatsApp group with all event guests</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingContacts ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">Loading contacts...</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-4">
                        <Button
                          onClick={handleCreateWhatsAppGroup}
                          className="flex items-center gap-2"
                          disabled={validPhoneNumbers === 0}
                        >
                          <Plus className="h-4 w-4" />
                          Create WhatsApp Group
                        </Button>

                        <Button variant="outline" onClick={copyPhoneNumbers} disabled={validPhoneNumbers === 0}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Phone Numbers
                        </Button>
                      </div>

                      {validPhoneNumbers === 0 && totalGuests > 0 && (
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <p className="text-sm text-yellow-800">
                            No phone numbers found for this event's guests. Add phone numbers to guest profiles to
                            create WhatsApp groups.
                          </p>
                        </div>
                      )}

                      {validPhoneNumbers > 0 && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="font-medium text-blue-900 mb-2">How to create the group:</h4>
                          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                            <li>Click "Create WhatsApp Group" to copy phone numbers and open WhatsApp</li>
                            <li>Create a new group in WhatsApp</li>
                            <li>Add the copied phone numbers to the group</li>
                            <li>Set a group name and description</li>
                            <li>Send the welcome message</li>
                          </ol>
                        </div>
                      )}

                      {/* Guest List Preview */}
                      {guests.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Guest Contacts ({guests.length})</h4>
                          <div className="max-h-64 overflow-y-auto border rounded-lg">
                            <div className="space-y-1 p-2">
                              {guests.map((guest) => (
                                <div
                                  key={guest.id}
                                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                                >
                                  <div>
                                    <p className="font-medium">{guest.name}</p>
                                    {guest.phone && (
                                      <p className="text-sm text-muted-foreground">{formatPhoneNumber(guest.phone)}</p>
                                    )}
                                  </div>
                                  <div className="flex gap-1">
                                    {guest.phone && <Badge variant="secondary">Phone</Badge>}
                                    {guest.email && <Badge variant="outline">Email</Badge>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
