import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Monitor, Cpu, Wifi, HardDrive, Smartphone, Printer, Shield, Zap, ArrowRight, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatRupiah } from '@/lib/currency'

const serviceCategories = [
  { icon: Monitor, name: 'Laptop Repair', count: 8 },
  { icon: Cpu, name: 'PC Services', count: 6 },
  { icon: Wifi, name: 'Networking', count: 4 },
  { icon: HardDrive, name: 'Data Recovery', count: 3 },
  { icon: Smartphone, name: 'Mobile Repair', count: 5 },
  { icon: Printer, name: 'Printer Services', count: 3 },
  { icon: Shield, name: 'Security', count: 4 },
  { icon: Zap, name: 'Upgrades', count: 6 },
]

export default async function ServicesPage() {
  const supabase = await createClient()

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .order('price', { ascending: true })

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">Professional Services</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Our <span className="gradient-text">IT Services</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              From hardware repairs to network solutions, we offer comprehensive IT services
              to keep your technology running smoothly.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {serviceCategories.map((category) => (
              <Card key={category.name} className="text-center hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <category.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium text-sm">{category.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{category.count} services</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Available Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Browse our complete range of IT services and book your appointment today.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services?.map((service) => (
              <Card key={service.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl">{service.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between mt-auto pt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Mulai dari</p>
                      <p className="text-2xl font-bold text-primary">{formatRupiah(service.price)}</p>
                    </div>
                    <Link href={`/services#booking`}>
                      <Button className="gradient-bg border-0">
                        Book Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )) || (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No services available yet. Please check back later.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We pride ourselves on delivering exceptional service quality and customer satisfaction.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Certified Technicians', desc: 'All our technicians are certified professionals with years of experience.' },
              { title: 'Fast Turnaround', desc: 'Most repairs completed within 24-48 hours with express options available.' },
              { title: 'Quality Parts', desc: 'We use only genuine and high-quality replacement parts for all repairs.' },
              { title: 'Warranty Included', desc: 'All services come with a minimum 90-day warranty for peace of mind.' },
              { title: 'Transparent Pricing', desc: 'No hidden fees. Get a clear quote before any work begins.' },
              { title: 'Data Security', desc: 'Your data privacy and security is our top priority.' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
