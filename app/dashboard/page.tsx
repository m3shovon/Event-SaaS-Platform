"use client"
import { Heart, Building, Briefcase, PartyPopper } from "lucide-react"
import { Suspense } from "react"
import DashboardClientComponent from "@/components/dashboard-client"

function DashboardFallback() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-slate-600">Loading dashboard...</p>
      </div>
    </div>
  )
}

const categoryIcons = {
  wedding: Heart,
  community: Building,
  corporate: Briefcase,
  social: PartyPopper,
}

const categoryNames = {
  wedding: "Wedding Planning",
  community: "Community Management",
  corporate: "Corporate Events",
  social: "Social Events",
}

const sampleEvents = [
  {
    id: 1,
    name: "Sarah & Ahmed's Wedding",
    category: "wedding",
    date: "2024-03-15",
    budget: 150000,
    spent: 89000,
    guests: 250,
    status: "planning",
    progress: 65,
  },
  {
    id: 2,
    name: "Community Eid Celebration",
    category: "community",
    date: "2024-04-10",
    budget: 50000,
    spent: 23000,
    guests: 150,
    status: "confirmed",
    progress: 45,
  },
  {
    id: 3,
    name: "Tech Conference 2024",
    category: "corporate",
    date: "2024-05-20",
    budget: 200000,
    spent: 145000,
    guests: 300,
    status: "planning",
    progress: 80,
  },
]

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardClientComponent />
    </Suspense>
  )
}
