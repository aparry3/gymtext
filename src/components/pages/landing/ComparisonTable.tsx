import { Card, CardContent } from '@/components/ui/card';
import { Check, X } from 'lucide-react';

const comparisons = [
  {
    feature: 'Monthly Cost',
    traditional: '$200-400',
    gymtext: '$9.99',
    traditional_bad: true,
  },
  {
    feature: 'Availability',
    traditional: '1hr/week',
    gymtext: '24/7',
    traditional_bad: true,
  },
  {
    feature: 'Response Time',
    traditional: 'Days',
    gymtext: 'Minutes',
    traditional_bad: true,
  },
  {
    feature: 'Scheduling',
    traditional: 'Required',
    gymtext: 'Never',
    traditional_bad: true,
  },
  {
    feature: 'App Downloads',
    traditional: 'Multiple',
    gymtext: 'None',
    traditional_bad: true,
  },
  {
    feature: 'Program Updates',
    traditional: 'Manual',
    gymtext: 'Automatic',
    traditional_bad: true,
  },
];

export function ComparisonTable() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 text-foreground">
            Why Choose GymText?
          </h2>

          <p className="text-center text-muted-foreground text-lg mb-12">
            See how we compare to traditional personal trainers.
          </p>

          {/* Comparison Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Feature
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-primary">
                        GymText
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                        Traditional Trainer
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {comparisons.map((comparison, index) => (
                      <tr
                        key={index}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-foreground">
                          {comparison.feature}
                        </td>
                        <td className="px-6 py-4 text-left">
                          <div className="flex items-center justify-start gap-2">
                            <Check className="h-4 w-4 flex-shrink-0" style={{ color: 'hsl(var(--success))' }} />
                            <span className="font-semibold text-foreground">
                              {comparison.gymtext}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-left">
                          <div className="flex items-center justify-start gap-2">
                            {comparison.traditional_bad && (
                              <X className="h-4 w-4 flex-shrink-0" style={{ color: 'hsl(var(--destructive))' }} />
                            )}
                            <span className="text-muted-foreground">
                              {comparison.traditional}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
