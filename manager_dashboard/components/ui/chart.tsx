"use client"

import type React from "react"
import {
  Area,
  AreaChart as RechartsAreaChart,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts"

interface ChartProps {
  data: any[]
  index: string
  categories: string[]
  colors: string[]
  valueFormatter?: (value: number) => string
  className?: string
}

export const AreaChart = ({ data, index, categories, colors, valueFormatter, className }: ChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      <RechartsAreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={index} />
        <YAxis tickFormatter={valueFormatter} />
        <Tooltip formatter={(value: any) => (valueFormatter ? valueFormatter(value) : value)} />
        <Legend />
        {categories.map((category, i) => (
          <Area
            key={category}
            type="monotone"
            dataKey={category}
            stroke={colors[i % colors.length]}
            fill={colors[i % colors.length]}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  )
}

export const BarChart = ({ data, index, categories, colors, valueFormatter, className }: ChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      <RechartsBarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={index} />
        <YAxis tickFormatter={valueFormatter} />
        <Tooltip formatter={(value: any) => (valueFormatter ? valueFormatter(value) : value)} />
        <Legend />
        {categories.map((category, i) => (
          <Bar key={category} dataKey={category} fill={colors[i % colors.length]} />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

export const PieChart = ({ data, index, categories, colors, valueFormatter, className }: ChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      <RechartsPieChart>
        <Pie
          dataKey={categories[0]}
          isAnimationActive={true}
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill={colors[0]}
          label
        >
          {data.map((entry, indexInner) => (
            <Pie
              data={data}
              dataKey={categories[0]}
              nameKey={index}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill={colors[indexInner % colors.length]}
              key={`slice-${indexInner}`}
            />
          ))}
        </Pie>
        <Tooltip formatter={(value: any) => (valueFormatter ? valueFormatter(value) : value)} />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}

export const Card = ({ children }: { children: React.ReactNode }) => {
  return <div className="rounded-md border bg-card text-card-foreground shadow-sm">{children}</div>
}

export const Title = ({ children }: { children: React.ReactNode }) => {
  return <div className="text-lg font-semibold">{children}</div>
}

export const Subtitle = ({ children }: { children: React.ReactNode }) => {
  return <div className="text-sm text-muted-foreground">{children}</div>
}
