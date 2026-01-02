import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah M.',
    transformation: 'Lost 25lbs in 3 months',
    quote:
      'I\'ve tried personal trainers before, but could never stick with it because of scheduling. With GymText, I get personalized coaching whenever I need it. The text format is perfect for my busy life.',
    initials: 'SM',
  },
  {
    name: 'Mike T.',
    transformation: 'Building strength while traveling for work',
    quote:
      'As someone who travels constantly, having a trainer who adapts to hotel gyms, home workouts, or whatever I have access to is game-changing. Plus, I can ask questions at midnight in a different timezone.',
    initials: 'MT',
  },
  {
    name: 'Jessica R.',
    transformation: 'Consistency for the first time',
    quote:
      'The daily text message is like having an accountability partner who actually knows what they\'re doing. I\'ve been more consistent in 2 months than I was in 2 years of trying on my own.',
    initials: 'JR',
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-muted">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 text-foreground">
            Real People. Real Results.
          </h2>

          <p className="text-center text-muted-foreground text-lg mb-12 max-w-2xl mx-auto">
            Join thousands of people transforming their fitness with GymText.
          </p>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="transition-all hover:shadow-xl">
                <div className="p-6 space-y-4">
                  {/* Quote Icon */}
                  <div className="flex justify-start">
                    <Quote className="h-8 w-8 text-primary/20" />
                  </div>

                  {/* Quote */}
                  <p className="text-muted-foreground leading-relaxed italic">
                    &quot;{testimonial.quote}&quot;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <Avatar className="h-12 w-12 bg-primary text-white flex items-center justify-center font-semibold">
                      {testimonial.initials}
                    </Avatar>
                    <div>
                      <div className="font-semibold text-foreground">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.transformation}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
