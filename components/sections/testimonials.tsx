'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Quote } from 'lucide-react'
import { TestimonialCardSkeleton } from '@/components/shared/skeletons'

interface Testimonial {
  id: string
  name: string
  role: string
  content: string
  rating: number
  avatar_url: string | null
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(6)

      if (data) setTestimonials(data)
      setIsLoading(false)
    }

    fetchTestimonials()
  }, [supabase])

  if (isLoading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Apa Kata Pelanggan Kami</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Testimoni dari pelanggan yang telah mempercayakan perangkat mereka kepada kami
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <TestimonialCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (testimonials.length === 0) return null

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Apa Kata <span className="gradient-text">Pelanggan Kami</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Testimoni dari pelanggan yang telah mempercayakan perangkat mereka kepada kami
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <Quote className="h-8 w-8 text-primary/20 mb-4" />

                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < testimonial.rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-muted'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-muted-foreground flex-1 mb-6">
                  "{testimonial.content}"
                </p>

                <div className="flex items-center gap-3 pt-4 border-t">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-semibold">
                    {testimonial.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
