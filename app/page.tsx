// app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

interface Candle {
  date: string
  close: number
  // Các field khác nếu cần
}

export default function StockChartPage() {
  const [timeFrame, setTimeFrame] = useState<'hourly' | 'daily' | 'weekly' | 'monthly'>('daily')
  const [data, setData] = useState<Candle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch(`https://chart.stockscan.io/candle/v3/TSLA/${timeFrame}/NASDAQ`)
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        const json = await response.json()
        // Lấy candles và map chỉ lấy date và close
        const candles: Candle[] = json.candles.map((c: { date: string; close: number }) => ({
          date: c.date,
          close: c.close,
        }))
        // Sort by date nếu cần, nhưng API có lẽ đã sort
        setData(candles)
      } catch (error) {
        console.error('Error fetching data:', error)
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [timeFrame])

  // Hàm format tick dựa trên timeFrame
  // Hàm format tick dựa trên timeFrame
  const formatTick = (value: string) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">TSLA Stock Chart</h1>
      {loading ? (
        <div className="flex flex-col items-center justify-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
          <span className="text-muted-foreground">Loading data...</span>
        </div>
      ) : data.length === 0 ? (
        <p>No data available.</p>
      ) : (
        <div className="w-full">
          <ChartContainer
            config={{
              close: {
                label: 'Close Price',
                color: 'hsl(var(--chart-1))',
              },
            }}
            className="aspect-auto h-[80vh] w-full"
          >
            <LineChart
              accessibilityLayer
              data={data}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                angle={-30}
                tickFormatter={(value) => formatTick(value)}
              />
              <YAxis
                dataKey="close"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
                className='mr-4'
                label={{ value: 'Price', angle: -90, position: 'insideLeft', dy: -30 }}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Line
                dataKey="close"
                type="monotone"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
          <div className="flex justify-center space-x-2 mt-6">
            <Button 
              variant={timeFrame === 'hourly' ? 'default' : 'outline'}
              onClick={() => setTimeFrame('hourly')}
            >
              Hourly
            </Button>
            <Button 
              variant={timeFrame === 'daily' ? 'default' : 'outline'}
              onClick={() => setTimeFrame('daily')}
            >
              Daily
            </Button>
            <Button 
              variant={timeFrame === 'weekly' ? 'default' : 'outline'}
              onClick={() => setTimeFrame('weekly')}
            >
              Weekly
            </Button>
            <Button 
              variant={timeFrame === 'monthly' ? 'default' : 'outline'}
              onClick={() => setTimeFrame('monthly')}
            >
              Monthly
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}