"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  MessageCircle,
  Users,
  Phone,
  Copy,
  Settings,
  CheckCircle,
  AlertCircle,
  Info,
  Send,
  UserPlus,
} from "lucide-react"
import { toast } from "sonner"
import { apiClient } from "@/lib/api"

interface Event {
  id: number
  name: string
  date: string
  venue: string
  expected_guests: number
}

interface Contact {
  id: number
  name: string
  phone: string
  email: string
  category: string
  rsvp_status: string
}

interface EventContacts {
  event: {
    id: number
    name: string
    date: string
  }
  total_guests: number
  contacts_with_phone: Contact[]
  contacts_with_email: Contact[]
  phone_count: number
  email_count: number
}

interface IndividualLink {
  name: string
  phone: string
  link: string
}

interface WhatsAppGroupData {
  group_name: string
  phone_numbers: string[]
  guest_names: string[]
  formatted_numbers: string
  welcome_message: string
  whatsapp_group_url: string
  individual_links: IndividualLink[]
  total_guests: number
  instructions: string[]
}

export default function WhatsAppPage() {
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<string>("")
  const [eventContacts, setEventContacts] = useState<EventContacts | null>(null)
  const [groupData, setGroupData] = useState<WhatsAppGroupData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingInitial, setIsLoadingInitial] = useState(true)

  useEffect(() => {
    loadUserProfile()
    loadEvents()
  }, [])

  const loadUserProfile = async () => {
    try {
      const data = await apiClient.getProfile()
      setWhatsappNumber(data.whatsapp_number || "")
    } catch (error) {
      console.error("Error loading profile:", error)
      toast.error("Failed to load profile")
    }
  }

  const loadEvents = async () => {
    try {
      setIsLoadingInitial(true)
      const data = await apiClient.getEvents()
      const eventsData = data.results || data || []
      setEvents(Array.isArray(eventsData) ? eventsData : [])
    } catch (error) {
      console.error("Error loading events:", error)
      toast.error("Failed to load events")
      setEvents([])
    } finally {
      setIsLoadingInitial(false)
    }
  }

  const saveWhatsAppNumber = async () => {
    setIsSaving(true)
    try {
      await apiClient.updateProfile({ whatsapp_number: whatsappNumber })
      toast.success("WhatsApp number saved successfully!")
    } catch (error) {
      console.error("Error saving WhatsApp number:", error)
      toast.error("Failed to save WhatsApp number")
    } finally {
      setIsSaving(false)
    }
  }

  const loadEventContacts = async (eventId: string) => {
    setIsLoading(true)
    try {
      const data = await apiClient.getEventContacts(Number.parseInt(eventId))
      setEventContacts(data)
    } catch (error) {
      console.error("Error loading event contacts:", error)
      toast.error("Failed to load event contacts")
      setEventContacts(null)
    } finally {
      setIsLoading(false)
    }
  }

  const createWhatsAppGroup = async () => {
    if (!selectedEvent) {
      toast.error("Please select an event first")
      return
    }

    setIsLoading(true)
    try {
      const data = await apiClient.createWhatsAppGroup(Number.parseInt(selectedEvent))
      setGroupData(data)
      toast.success("WhatsApp group data prepared successfully!")
    } catch (error) {
      console.error("Error creating WhatsApp group:", error)
      toast.error("Failed to create WhatsApp group")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied to clipboard!`)
    } catch (error) {
      toast.error("Failed to copy to clipboard")
    }
  }

  const handleEventChange = (eventId: string) => {
    setSelectedEvent(eventId)
    setEventContacts(null)
    setGroupData(null)
    if (eventId) {
      loadEventContacts(eventId)
    }
  }

  const openWhatsAppGroup = () => {
    if (groupData?.whatsapp_group_url) {
      window.open(groupData.whatsapp_group_url, "_blank")
      toast.success("WhatsApp opened! Create a group and add the phone numbers.")
    }
  }

  const openIndividualWhatsApp = (link: string, name: string) => {
    window.open(link, "_blank")
    toast.success(`WhatsApp opened for ${name}`)
  }

  if (isLoadingInitial) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp Integration</h1>
          <p className="text-muted-foreground">Create WhatsApp groups for your events with all guest contacts</p>
        </div>
        <Badge variant="secondary">New</Badge>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="groups">Group Management</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                WhatsApp Settings
              </CardTitle>
              <CardDescription>Configure your WhatsApp number for event communications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="whatsapp"
                    placeholder="+880 1234 567890"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={saveWhatsAppNumber} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">Include country code (e.g., +880 for Bangladesh)</p>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Your WhatsApp number will be used as the admin contact for event groups and communications.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Create WhatsApp Group
              </CardTitle>
              <CardDescription>Select an event to create a WhatsApp group with all guest phone numbers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event">Select Event</Label>
                <Select value={selectedEvent} onValueChange={handleEventChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.length > 0 ? (
                      events.map((event) => (
                        <SelectItem key={event.id} value={event.id.toString()}>
                          {event.name} - {new Date(event.date).toLocaleDateString()}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground">No events available</div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {eventContacts && (
                <div className="space-y-4">
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="text-2xl font-bold">{eventContacts.total_guests}</p>
                            <p className="text-sm text-muted-foreground">Total Guests</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-green-500" />
                          <div>
                            <p className="text-2xl font-bold">{eventContacts.phone_count}</p>
                            <p className="text-sm text-muted-foreground">With Phone Numbers</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-purple-500" />
                          <div>
                            <p className="text-2xl font-bold">{eventContacts.email_count}</p>
                            <p className="text-sm text-muted-foreground">With Email</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Button
                    onClick={createWhatsAppGroup}
                    disabled={isLoading || eventContacts.phone_count === 0}
                    className="w-full"
                    size="lg"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {isLoading ? "Creating..." : "Create WhatsApp Group"}
                  </Button>

                  {eventContacts.phone_count === 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No guests with phone numbers found for this event. Add phone numbers to your guest list first.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {groupData && (
                <div className="space-y-6">
                  <Separator />
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      WhatsApp group data prepared successfully! Follow the steps below to create your group.
                    </AlertDescription>
                  </Alert>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button onClick={openWhatsAppGroup} className="w-full" size="lg">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Open WhatsApp & Create Group
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" onClick={() => copyToClipboard(groupData.group_name, "Group name")}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Group Name
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => copyToClipboard(groupData.formatted_numbers, "Phone numbers")}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy All Numbers
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Group Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Group Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Group Name</Label>
                          <div className="flex gap-2">
                            <Input value={groupData.group_name} readOnly />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(groupData.group_name, "Group name")}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Total Members</Label>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-lg px-3 py-1">
                              {groupData.total_guests} guests
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Welcome Message</Label>
                        <div className="flex gap-2">
                          <textarea
                            value={groupData.welcome_message}
                            readOnly
                            className="flex-1 min-h-[120px] p-3 border rounded-md text-sm resize-none"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(groupData.welcome_message, "Welcome message")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Phone Numbers ({groupData.total_guests} contacts)</Label>
                        <ScrollArea className="h-40 w-full border rounded-md p-3">
                          <div className="space-y-1">
                            {groupData.phone_numbers.map((phone, index) => (
                              <div key={index} className="flex justify-between items-center text-sm">
                                <span className="font-medium">{groupData.guest_names[index]}</span>
                                <span className="font-mono text-muted-foreground">+{phone}</span>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(groupData.formatted_numbers, "All phone numbers")}
                          className="w-full"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy All Numbers
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Instructions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Step-by-Step Instructions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="space-y-2">
                        {groupData.instructions.map((instruction, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Badge variant="outline" className="mt-0.5 text-xs">
                              {index + 1}
                            </Badge>
                            <span className="text-sm">{instruction}</span>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>

                  {/* Individual Contact Links */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Individual Invitations</CardTitle>
                      <CardDescription>Send personal invitations to each guest</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-60 w-full">
                        <div className="space-y-2">
                          {groupData.individual_links.map((contact, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{contact.name}</p>
                                <p className="text-sm text-muted-foreground">{contact.phone}</p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openIndividualWhatsApp(contact.link, contact.name)}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Invite
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>

          {eventContacts && eventContacts.contacts_with_phone && eventContacts.contacts_with_phone.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Guest Contacts</CardTitle>
                <CardDescription>Guests with phone numbers for {eventContacts.event.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-60 w-full">
                  <div className="space-y-2">
                    {eventContacts.contacts_with_phone.map((contact) => (
                      <div key={contact.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-sm text-muted-foreground">{contact.phone}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{contact.category}</Badge>
                          <Badge variant={contact.rsvp_status === "confirmed" ? "default" : "secondary"}>
                            {contact.rsvp_status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
