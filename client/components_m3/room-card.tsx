"use client"

import { useState } from "react"
import type { Room } from "@/lib/types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Bed, DoorOpen, Tag } from "lucide-react"

interface RoomCardProps {
  room: Room
  onStatusChange: (status: string) => void
}

export function RoomCard({ room, onStatusChange }: RoomCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "bg-green-100 text-green-800 border-green-300"
      case "occupied":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "maintenance":
        return "bg-amber-100 text-amber-800 border-amber-300"
      case "cleaning":
        return "bg-purple-100 text-purple-800 border-purple-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:translate-y-[-3px]">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-bold">Room {room.number}</h3>
          <span className={`text-base font-medium px-4 py-1.5 rounded-full border ${getStatusColor(room.status)}`}>
            {room.status}
          </span>
        </div>

        <div className="space-y-3 text-base text-gray-700 my-4">
          <div className="flex items-center">
            <DoorOpen className="w-5 h-5 mr-3 text-blue-600" />
            <span className="font-medium">Floor {room.floor}</span>
          </div>
          <div className="flex items-center">
            <Tag className="w-5 h-5 mr-3 text-blue-600" />
            <span className="font-medium">{room.type}</span>
          </div>
          <div className="flex items-center">
            <Bed className="w-5 h-5 mr-3 text-blue-600" />
            <span className="font-medium">{room.beds}</span>
          </div>
        </div>

        <div className="mt-5 flex justify-between items-center">
          <div className="text-xl font-bold text-blue-700">${room.price}/night</div>

          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger className="flex items-center text-base font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
              Update Status
              <ChevronDown className="ml-2 h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 animate-in fade-in-80 zoom-in-95 p-1">
              <DropdownMenuItem
                onClick={() => onStatusChange("Available")}
                className="text-base py-3 cursor-pointer hover:bg-green-50 focus:bg-green-50"
              >
                Available
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onStatusChange("Occupied")}
                className="text-base py-3 cursor-pointer hover:bg-blue-50 focus:bg-blue-50"
              >
                Occupied
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onStatusChange("Cleaning")}
                className="text-base py-3 cursor-pointer hover:bg-purple-50 focus:bg-purple-50"
              >
                Cleaning
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onStatusChange("Maintenance")}
                className="text-base py-3 cursor-pointer hover:bg-amber-50 focus:bg-amber-50"
              >
                Maintenance
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
