import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Users, Calendar, DollarSign, MapPin, Star } from "lucide-react"
import Link from "next/link"

const categories = [
  {
    id: "wedding",
    title: "Wedding Planning Platform",
    description:
      "Comprehensive tool for Bangladesh's elaborate wedding industry - vendor management, guest lists, and budget tracking.",
    icon: Heart,
    color: "bg-pink-500",
    features: ["Vendor Management", "Guest Lists", "Budget Tracking", "Timeline Planning"],
    popular: true,
  },
  {
    id: "community",
    title: "Community Management System",
    description:
      "Digital platform for housing societies and communities to manage maintenance, communications, and events.",
    icon: Users,
    color: "bg-blue-500",
    features: ["Maintenance Tracking", "Communication Hub", "Event Planning", "Member Directory"],
  },
  {
    id: "corporate",
    title: "Corporate Event Platform",
    description: "Professional event management for conferences, seminars, and corporate gatherings.",
    icon: Calendar,
    color: "bg-green-500",
    features: ["Registration Management", "Speaker Coordination", "Venue Booking", "Analytics"],
  },
  {
    id: "social",
    title: "Social Event Organizer",
    description: "Perfect for birthday parties, anniversaries, and social gatherings with friends and family.",
    icon: MapPin,
    color: "bg-purple-500",
    features: ["RSVP Management", "Photo Sharing", "Gift Registry", "Activity Planning"],
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                {/* <Calendar className="w-5 h-5 text-white" /> */}
                <img  
                  src="/letsorganize.png"
                  alt="letsorganize Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                LetsOrganize
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center max-w-4xl mx-auto">
          <Badge className="mb-4" variant="secondary">
            <Star className="w-3 h-3 mr-1" />
            Trusted by 10,000+ Event Organizers
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Plan Perfect Events with Ease
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed">
            From intimate weddings to large community gatherings, manage every detail with our comprehensive event
            management platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="text-lg px-8">
                Start Free Trial
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Event Category</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Select the perfect platform tailored to your specific event needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <Card
                key={category.id}
                className="relative group hover:shadow-xl transition-all duration-300 border-0 shadow-lg"
              >
                {category.popular && (
                  <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center mb-4`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-xl mb-2">{category.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {category.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    <Link href={`/auth/signup?category=${category.id}`}>
                      <Button className="w-full group-hover:bg-slate-900 transition-colors">Get Started</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-lg text-slate-600">Powerful features to make your events unforgettable</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Budget Tracking</h3>
              <p className="text-slate-600">Keep track of expenses and stay within budget with real-time monitoring</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Guest Management</h3>
              <p className="text-slate-600">Manage invitations, RSVPs, and guest communications effortlessly</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Timeline Planning</h3>
              <p className="text-slate-600">Create detailed timelines and coordinate all event activities</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                {/* <Calendar className="w-5 h-5 text-white" /> */}
                <img  
                  src="/letsorganize.png"
                  alt="LetsOrganize Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-bold">LetsOrganize</span>
            </div>
            <p className="text-slate-400">© 2025 LetsOrganize. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
