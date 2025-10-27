import { Card, CardContent } from '@/components/ui/card';
import {
  ClipboardList,
  MessageCircle,
  Target,
  TrendingUp,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';

const benefits = [
  {
    icon: ClipboardList,
    title: 'Daily Personalized Workouts',
    description:
      'Wake up to a workout plan designed specifically for you. Every single day.',
  },
  {
    icon: MessageCircle,
    title: '24/7 Text Coaching',
    description:
      'Questions at 6am? 10pm? Your trainer is always available via text. No scheduling needed.',
  },
  {
    icon: Target,
    title: 'Adaptive Programming',
    description:
      'Feeling sore? Traveling? Your program adapts to your life, not the other way around.',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description:
      'Track your lifts, measurements, and milestones. See how far you\'ve come.',
  },
  {
    icon: BookOpen,
    title: 'Exercise Library',
    description:
      'Video demonstrations and form tips sent right to your phone. Never guess again.',
  },
  {
    icon: CheckCircle2,
    title: 'No App Required',
    description:
      'Just text. Works with any phone. No downloads, no updates, no distractions.',
  },
];

export function BenefitsSection() {
  return (
    <section className="bg-muted py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 text-foreground">
            Everything You Need. Nothing You Don&apos;t.
          </h2>

          <p className="text-center text-muted-foreground text-lg mb-12 max-w-2xl mx-auto">
            All the tools to reach your fitness goals, delivered in the simplest way possible.
          </p>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="transition-all hover:shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-start space-y-4">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {benefit.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
