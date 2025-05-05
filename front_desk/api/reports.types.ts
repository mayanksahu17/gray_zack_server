import { DateRange } from './analytics'

export interface OccupancyData {
  value: number
  name: string
}

export interface RevenueBreakdownData {
  roomRevenue: number[]
  fbRevenue: number[]
  otherRevenue: number[]
}

export interface DailyMetricsData {
  date: string
  occupancyRate: number
  adr: number
  revenue: number
  roomRevenue: number
  additionalRevenue: number
}

export const RoomTypes = ['Standard', 'Deluxe', 'Suite', 'Accessible'] as const
export type RoomType = typeof RoomTypes[number] 