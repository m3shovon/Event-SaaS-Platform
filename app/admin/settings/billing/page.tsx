"use client"

import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  fetchSubscriptionPlans,
  fetchCurrentSubscription,
  fetchPaymentRequests,
  fetchPaymentHistory,
  createPaymentRequest,
  cancelSubscription,
} from "@/store/slices/billingSlice"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  Loader2,
  CreditCard,
  Check,
  Calendar,
  Users,
  Building,
  Star,
  Upload,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react"

export default function BillingPage() {
  const dispatch = useAppDispatch()
  const { plans, currentSubscription, paymentRequests, paymentHistory, loading, paymentLoading } = useAppSelector(
    (state) => state.billing,
  )
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [paymentData, setPaymentData] = useState({
    paymentMethod: "",
    transactionId: "",
    paymentProof: "",
    notes: "",
  })

  useEffect(() => {
    dispatch(fetchSubscriptionPlans())
    dispatch(fetchCurrentSubscription())
    dispatch(fetchPaymentRequests())
    dispatch(fetchPaymentHistory())
  }, [dispatch])

  const handleSubscribe = (planId: number) => {
    setSelectedPlan(planId)
    setShowPaymentDialog(true)
  }

  const handlePaymentSubmit = async () => {
    if (!selectedPlan) return

    if (!paymentData.paymentMethod || !paymentData.transactionId) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      await dispatch(
        createPaymentRequest({
          planId: selectedPlan,
          billingCycle,
          paymentMethod: paymentData.paymentMethod,
          transactionId: paymentData.transactionId,
          paymentProof: paymentData.paymentProof,
          notes: paymentData.notes,
        }),
      ).unwrap()

      toast.success("Payment request submitted successfully!")
      setShowPaymentDialog(false)
      setSelectedPlan(null)
      setPaymentData({
        paymentMethod: "",
        transactionId: "",
        paymentProof: "",
        notes: "",
      })
      dispatch(fetchPaymentRequests())
    } catch (error: any) {
      toast.error(error || "Failed to submit payment request")
    }
  }

  const handleCancelSubscription = async () => {
    if (confirm("Are you sure you want to cancel your subscription?")) {
      try {
        await dispatch(cancelSubscription()).unwrap()
        toast.success("Subscription cancelled successfully")
      } catch (error: any) {
        toast.error(error || "Failed to cancel subscription")
      }
    }
  }

  const getSelectedPlan = () => {
    return plans.find((plan) => plan.id === selectedPlan)
  }

  const getPrice = (plan: any) => {
    return billingCycle === "monthly" ? plan.price_monthly : plan.price_yearly
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
      case "submitted":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <CreditCard className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Billing & Subscription</h1>
      </div>

      {/* Current Subscription */}
      {currentSubscription && currentSubscription.plan && (
        <Card>
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>Your active subscription details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{currentSubscription.plan.display_name}</h3>
                <p className="text-muted-foreground">{currentSubscription.plan.description}</p>
              </div>
              <Badge variant={currentSubscription.status === "active" ? "default" : "secondary"}>
                {currentSubscription.status}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Billing Cycle</p>
                <p className="font-medium capitalize">{currentSubscription.billing_cycle}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Next Billing Date</p>
                <p className="font-medium">{new Date(currentSubscription.current_period_end).toLocaleDateString()}</p>
              </div>
            </div>
            {currentSubscription.status === "active" && (
              <Button variant="destructive" onClick={handleCancelSubscription}>
                Cancel Subscription
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Instructions</CardTitle>
          <CardDescription>How to make payments for your subscription</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Bank Transfer</h4>
              <p className="text-sm text-muted-foreground">
                Bank: ABC Bank
                <br />
                Account: 1234567890
                <br />
                Routing: 123456789
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Mobile Banking</h4>
              <p className="text-sm text-muted-foreground">
                bKash: 01712345678
                <br />
                Nagad: 01712345678
                <br />
                Rocket: 01712345678
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            After making payment, please submit your payment details below. We will verify and activate your
            subscription within 24 hours.
          </p>
        </CardContent>
      </Card>

      {/* Billing Cycle Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Plan</CardTitle>
          <CardDescription>Select the plan that best fits your needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <Label htmlFor="billing-toggle">Monthly</Label>
            <Switch
              id="billing-toggle"
              checked={billingCycle === "yearly"}
              onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
            />
            <Label htmlFor="billing-toggle">
              Yearly{" "}
              <Badge variant="secondary" className="ml-1">
                Save 20%
              </Badge>
            </Label>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan) => (
                <Card key={plan.id} className={`relative ${plan.name === "pro" ? "border-primary shadow-lg" : ""}`}>
                  {plan.name === "pro" && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2">
                      {plan.name === "enterprise" && <Star className="h-5 w-5" />}
                      {plan.display_name}
                    </CardTitle>
                    <div className="space-y-1">
                      <div className="text-3xl font-bold">
                        ${getPrice(plan)}
                        <span className="text-sm font-normal text-muted-foreground">
                          /{billingCycle === "monthly" ? "month" : "year"}
                        </span>
                      </div>
                      {billingCycle === "yearly" && (
                        <p className="text-sm text-muted-foreground">
                          ${(plan.price_monthly * 12).toFixed(2)} billed annually
                        </p>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{plan.description}</p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>{plan.max_events} events</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4" />
                        <span>{plan.max_guests_per_event} guests per event</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="h-4 w-4" />
                        <span>{plan.max_vendors} vendors</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      className="w-full"
                      variant={plan.name === "pro" ? "default" : "outline"}
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={currentSubscription?.plan.id === plan.id && currentSubscription.status === "active"}
                    >
                      {currentSubscription?.plan.id === plan.id && currentSubscription.status === "active"
                        ? "Current Plan"
                        : plan.name === "free"
                          ? "Current Plan"
                          : "Subscribe"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Requests */}
      {paymentRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Requests</CardTitle>
            <CardDescription>Track your submitted payment requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(request.status)}
                    <div>
                      <p className="font-medium">
                        {request.plan_name} - ${request.amount} {request.currency.toUpperCase()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {request.payment_method} • {new Date(request.created_at).toLocaleDateString()}
                      </p>
                      {request.admin_notes && (
                        <p className="text-sm text-muted-foreground mt-1">Admin: {request.admin_notes}</p>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={
                      request.status === "approved"
                        ? "default"
                        : request.status === "rejected"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {request.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      {paymentHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Your completed payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentHistory.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        ${payment.amount} {payment.currency.toUpperCase()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {payment.payment_method} • {new Date(payment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      payment.status === "completed"
                        ? "default"
                        : payment.status === "failed"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {payment.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Submit Payment Details</DialogTitle>
            <DialogDescription>
              Please provide your payment information. We will verify and activate your subscription within 24 hours.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedPlan && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{getSelectedPlan()?.display_name}</p>
                <p className="text-sm text-muted-foreground">
                  ${getPrice(getSelectedPlan())} - {billingCycle}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method *</Label>
              <Select
                value={paymentData.paymentMethod}
                onValueChange={(value) => setPaymentData((prev) => ({ ...prev, paymentMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="mobile_banking">Mobile Banking (bKash/Nagad/Rocket)</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction-id">Transaction ID / Reference Number *</Label>
              <Input
                id="transaction-id"
                value={paymentData.transactionId}
                onChange={(e) => setPaymentData((prev) => ({ ...prev, transactionId: e.target.value }))}
                placeholder="Enter transaction ID or reference number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-proof">Payment Proof URL (Optional)</Label>
              <Input
                id="payment-proof"
                value={paymentData.paymentProof}
                onChange={(e) => setPaymentData((prev) => ({ ...prev, paymentProof: e.target.value }))}
                placeholder="Upload receipt to cloud and paste URL here"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={paymentData.notes}
                onChange={(e) => setPaymentData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional information about the payment"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handlePaymentSubmit} disabled={paymentLoading} className="flex-1">
                {paymentLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Submit Payment
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
