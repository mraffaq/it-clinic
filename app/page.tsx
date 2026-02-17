import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Wrench,
  ShoppingBag,
  Calendar,
  HeadphonesIcon,
  Cpu,
  Wifi,
  HardDrive,
  Monitor,
  ArrowRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatRupiah } from '@/lib/currency'
import { Stats } from '@/components/sections/stats'
import { TestimonialsSection as Testimonials } from '@/components/sections/testimonials'

const features = [
  {
    icon: Wrench,
    title: 'Expert Repairs',
    description: 'Professional repair services for laptops, desktops, and all tech devices.'
  },
  {
    icon: ShoppingBag,
    title: 'Quality Products',
    description: 'Wide range of IT products, accessories, and components at competitive prices.'
  },
  {
    icon: Calendar,
    title: 'Easy Booking',
    description: 'Book service appointments online with our simple reservation system.'
  },
  {
    icon: HeadphonesIcon,
    title: 'IT Support',
    description: '24/7 technical support and consultation for all your IT needs.'
  }
]

const services = [
  {
    icon: Monitor,
    title: 'Laptop Repair',
    description: 'Screen replacement, motherboard repair, battery replacement, and more.',
    price: 'Mulai Rp 750.000'
  },
  {
    icon: Cpu,
    title: 'PC Repair',
    description: 'Hardware diagnostics, component upgrades, and system optimization.',
    price: 'Mulai Rp 900.000'
  },
  {
    icon: Wifi,
    title: 'Network Setup',
    description: 'Home and office network installation, configuration, and troubleshooting.',
    price: 'Mulai Rp 1.500.000'
  },
  {
    icon: HardDrive,
    title: 'Data Recovery',
    description: 'Professional data recovery from damaged drives and storage devices.',
    price: 'Mulai Rp 2.250.000'
  }
]

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch featured products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(4)

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-cyan-600/10 to-teal-500/10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80')] bg-cover bg-center opacity-10" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="gradient-text">Expert IT Services</span>
              <br />
              <span className="text-foreground">& Tech Solutions</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Professional laptop repair, PC maintenance, network solutions, and quality tech products.
              Your one-stop destination for all IT needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/services">
                <Button size="lg" className="gradient-bg border-0 text-lg px-8">
                  Our Services
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/products">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Shop Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-card border-border/50">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg gradient-bg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Professional IT services delivered by certified technicians with years of experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <Card key={service.title} className="group hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-primary font-semibold">{service.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/services">
              <Button variant="outline" size="lg">
                View All Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Products Preview */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Quality tech products and accessories carefully selected for performance and reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products?.map((product) => (
              <Card key={product.id} className="group overflow-hidden">
                <div className="aspect-square bg-muted relative overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
                <CardHeader className="p-4">
                  <CardTitle className="text-base">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-lg font-bold text-primary">{formatRupiah(product.price)}</p>
                </CardContent>
              </Card>
            )) || (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No products available yet. Check back soon!
              </div>
            )}
          </div>

          <div className="text-center mt-10">
            <Link href="/products">
              <Button variant="outline" size="lg">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Stats Section */}
      <Stats />

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="gradient-bg border-0">
            <CardContent className="p-8 sm:p-12 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Book a service appointment today or visit our store for immediate assistance.
                Our expert technicians are ready to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/services">
                  <Button size="lg" variant="secondary" className="text-lg px-8">
                    Book Service
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="text-lg px-8 border-white text-white hover:bg-white/10">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
