'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface MessageStatsChartProps {
  data: Array<{
    date: string;
    delivered: number;
    pending: number;
    failed: number;
  }>;
  isLoading?: boolean;
}

export function MessageStatsChart({ data, isLoading = false }: MessageStatsChartProps) {
  if (isLoading) {
    return (
      <Card className="p-6 border border-gray-100 shadow-sm">
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-[250px] w-full" />
      </Card>
    );
  }

  // Format dates and take last 14 days for cleaner display
  const formattedData = data.slice(-14).map((item) => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <Card className="p-6 border border-gray-100 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Message Delivery</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={formattedData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                      <p className="text-sm text-gray-500 mb-2">
                        {payload[0].payload.displayDate}
                      </p>
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="inline-block w-3 h-3 rounded-sm bg-green-500 mr-2" />
                          Delivered: {payload[0].value}
                        </p>
                        <p className="text-sm">
                          <span className="inline-block w-3 h-3 rounded-sm bg-amber-500 mr-2" />
                          Pending: {payload[1]?.value || 0}
                        </p>
                        <p className="text-sm">
                          <span className="inline-block w-3 h-3 rounded-sm bg-red-500 mr-2" />
                          Failed: {payload[2]?.value || 0}
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
              formatter={(value) => (
                <span className="text-sm text-gray-600 capitalize">{value}</span>
              )}
            />
            <Bar
              dataKey="delivered"
              stackId="a"
              fill="#22c55e"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="pending"
              stackId="a"
              fill="#f59e0b"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="failed"
              stackId="a"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
