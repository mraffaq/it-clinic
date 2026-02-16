import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, Filter, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

const categories = [
  'All Products',
  'Laptops',
  'Accessories',
  'Components',
  'Networking',
  'Storage',
]

export default async function ProductsPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">Tech Store</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Quality <span className="gradient-text">Tech Products</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Browse our selection of laptops, accessories, components, and networking equipment.
              All products tested and guaranteed.
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === 'All Products' ? 'default' : 'outline'}
                size="sm"
                className={category === 'All Products' ? 'gradient-bg border-0' : ''}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Products */}
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
                      <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="destructive">Out of Stock</Badge>
                    </div>
                  )}
                  {product.stock > 0 && product.stock <= 5 && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="warning">Low Stock</Badge>
                    </div>
                  )}
                </div>
                <CardHeader className="p-4">
                  {product.category && (
                    <Badge variant="secondary" className="mb-2 w-fit">
                      {product.category}
                    </Badge>
                  )}
                  <CardTitle className="text-base">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2 text-sm">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-bold text-primary">${product.price}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )) || (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                <p>No products available yet. Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="gradient-bg border-0">
            <CardContent className="p-8 sm:p-12 text-center">
              <ShoppingBag className="h-12 w-12 text-white mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-4">
                Can&apos;t Find What You Need?
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Contact us for special orders or to inquire about products not listed in our store.
                We can source most IT products within 24-48 hours.
              </p>
              <Link href="/contact">
                <Button size="lg" variant="secondary">
                  Contact Us
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
