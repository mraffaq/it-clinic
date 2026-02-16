import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wrench, Users, Award, Clock, Target, Heart } from 'lucide-react'

const stats = [
  { number: '10+', label: 'Years Experience' },
  { number: '5000+', label: 'Repairs Completed' },
  { number: '98%', label: 'Customer Satisfaction' },
  { number: '24h', label: 'Average Turnaround' },
]

const values = [
  {
    icon: Target,
    title: 'Excellence',
    description: 'We strive for excellence in every repair and service we provide.'
  },
  {
    icon: Heart,
    title: 'Customer First',
    description: 'Your satisfaction is our priority. We listen and deliver what you need.'
  },
  {
    icon: Award,
    title: 'Integrity',
    description: 'Honest assessments, fair pricing, and quality work guaranteed.'
  },
  {
    icon: Clock,
    title: 'Efficiency',
    description: 'Fast turnaround times without compromising on quality.'
  },
]

const team = [
  {
    name: 'Alex Johnson',
    role: 'Lead Technician',
    bio: '10+ years experience in laptop and desktop repairs. Certified by major manufacturers.',
  },
  {
    name: 'Sarah Chen',
    role: 'Network Specialist',
    bio: 'Expert in network infrastructure and cybersecurity solutions for businesses.',
  },
  {
    name: 'Mike Rodriguez',
    role: 'Data Recovery Expert',
    bio: 'Specialized in recovering data from damaged and corrupted storage devices.',
  },
  {
    name: 'Emily Taylor',
    role: 'Customer Relations',
    bio: 'Ensures every customer receives exceptional service and support.',
  },
]

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">About Us</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Your Trusted <span className="gradient-text">Tech Partner</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              IT Clinic has been providing professional IT services and tech solutions since 2014.
              Our mission is to make technology work for you, not against you.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <Card key={stat.label} className="text-center">
                <CardContent className="p-6">
                  <p className="text-3xl sm:text-4xl font-bold gradient-text">{stat.number}</p>
                  <p className="text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  IT Clinic started with a simple mission: to provide honest, reliable, and affordable
                  tech repair services to our community. What began as a small one-person operation
                  has grown into a full-service IT company serving both individual and business clients.
                </p>
                <p>
                  Over the years, we&apos;ve expanded our services to include not just repairs, but also
                  network solutions, data recovery, cybersecurity consultations, and a retail store
                  offering quality tech products.
                </p>
                <p>
                  Our commitment to excellence and customer satisfaction has earned us a reputation
                  as one of the most trusted IT service providers in the region. We take pride in
                  our work and treat every device as if it were our own.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-xl bg-gradient-to-br from-blue-600/20 via-cyan-600/20 to-teal-500/20 flex items-center justify-center">
                <Wrench className="h-24 w-24 text-primary/50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These core principles guide everything we do at IT Clinic.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <Card key={value.title}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg gradient-bg flex items-center justify-center mb-4">
                    <value.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our experienced technicians and support staff are here to help you with all your IT needs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <Card key={member.name} className="text-center">
                <CardContent className="p-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{member.name}</h3>
                  <p className="text-primary text-sm mb-2">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
