"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchSettings, updateSettings } from "@/store/slices/settingsSlice"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Loader2, Settings, Save, Bell, Shield, Download, Trash2, AlertTriangle } from "lucide-react"

export default function GeneralSettingsPage() {
  const dispatch = useAppDispatch()
  const { settings, loading } = useAppSelector((state) => state.settings)
  const [formData, setFormData] = useState({
    email_notifications: true,
    sms_notifications: false,
    whatsapp_notifications: true,
    event_reminders: true,
    marketing_emails: false,
    data_export_format: "csv",
    default_event_privacy: "private",
    auto_backup: true,
  })
  const [saving, setSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    dispatch(fetchSettings())
  }, [dispatch])

  useEffect(() => {
    if (settings) {
      setFormData({
        email_notifications: settings.email_notifications ?? true,
        sms_notifications: settings.sms_notifications ?? false,
        whatsapp_notifications: settings.whatsapp_notifications ?? true,
        event_reminders: settings.event_reminders ?? true,
        marketing_emails: settings.marketing_emails ?? false,
        data_export_format: settings.data_export_format ?? "csv",
        default_event_privacy: settings.default_event_privacy ?? "private",
        auto_backup: settings.auto_backup ?? true,
      })
    }
  }, [settings])

  const handleSwitchChange = (field: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await dispatch(updateSettings(formData)).unwrap()
      toast.success("Settings updated successfully!")
    } catch (error: any) {
      toast.error(error || "Failed to update settings")
    } finally {
      setSaving(false)
    }
  }

  const handleDataExport = () => {
    toast.info("Data export feature coming soon!")
  }

  const handleDeleteAccount = () => {
    toast.error("Account deletion feature coming soon!")
    setShowDeleteDialog(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">General Settings</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>Choose how you want to receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch
                checked={formData.email_notifications}
                onCheckedChange={(checked) => handleSwitchChange("email_notifications", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
              </div>
              <Switch
                checked={formData.sms_notifications}
                onCheckedChange={(checked) => handleSwitchChange("sms_notifications", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>WhatsApp Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via WhatsApp</p>
              </div>
              <Switch
                checked={formData.whatsapp_notifications}
                onCheckedChange={(checked) => handleSwitchChange("whatsapp_notifications", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Event Reminders</Label>
                <p className="text-sm text-muted-foreground">Get reminders about upcoming events</p>
              </div>
              <Switch
                checked={formData.event_reminders}
                onCheckedChange={(checked) => handleSwitchChange("event_reminders", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">Receive promotional emails and updates</p>
              </div>
              <Switch
                checked={formData.marketing_emails}
                onCheckedChange={(checked) => handleSwitchChange("marketing_emails", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Data Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Data
            </CardTitle>
            <CardDescription>Control your privacy and data preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default Event Privacy</Label>
              <Select
                value={formData.default_event_privacy}
                onValueChange={(value) => handleSelectChange("default_event_privacy", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">Choose the default privacy setting for new events</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Data Export Format</Label>
              <Select
                value={formData.data_export_format}
                onValueChange={(value) => handleSelectChange("data_export_format", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">Choose your preferred format for data exports</p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Backup</Label>
                <p className="text-sm text-muted-foreground">Automatically backup your data</p>
              </div>
              <Switch
                checked={formData.auto_backup}
                onCheckedChange={(checked) => handleSwitchChange("auto_backup", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>Export or manage your account data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Export Data</Label>
                <p className="text-sm text-muted-foreground">Download all your account data</p>
              </div>
              <Button variant="outline" onClick={handleDataExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-destructive">Delete Account</Label>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Delete Account
                    </DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove all your data
                      from our servers.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex gap-2">
                    <Button variant="destructive" onClick={handleDeleteAccount} className="flex-1">
                      Yes, Delete Account
                    </Button>
                    <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
