"use client"

import { useState, useEffect } from "react"
import { RoomCard } from "./room-card"
import { DashboardHeader } from "./dashboard-header"
import { DashboardSidebar } from "./dashboard-sidebar"
import { BASE_URL } from "@/lib/constants"
import AuthUtils from "@/utills/authUtills"

// Local Room type definition (should match the UI and API)
type Room = {
  id: string
  number: string
  floor: number
  type: string
  beds: string
  price: number
  status: string
}

export function HousekeeperDashboard() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [activeTab, setActiveTab] = useState("rooms")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const user = AuthUtils.getUserData();

  // Fetch rooms from API
  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`http://56.228.32.222:8000/api/v1/room`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || "Failed to fetch rooms")
        // Map API data to Room type expected by UI
        const mappedRooms: Room[] = data.data.map((room: any) => ({
          id: room._id,
          number: room.roomNumber,
          floor: room.floor,
          type: room.type,
          beds: room.beds,
          price: room.pricePerNight,
          status: room.status,
        }))
        setRooms(mappedRooms)
      } catch (err: any) {
        setError(err.message || "Failed to fetch rooms")
      } finally {
        setLoading(false)
      }
    }
    fetchRooms()
  }, [])

  // Update room status via API
  const updateRoomStatus = async (roomId: string, newStatus: string) => {
    try {
      const res = await fetch(`http://56.228.32.222:8000/api/v1/room/${roomId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus.toLowerCase() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to update status")
      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.id === roomId ? { ...room, status: newStatus } : room
        )
      )
    } catch (err: any) {
      alert(err.message || "Failed to update status")
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={AuthUtils.logout} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader user={user} onLogout={AuthUtils.logout} />

        <main className="flex-1 overflow-auto p-8">
          {activeTab === "rooms" && (
            <>
              <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
                <p className="text-xl text-gray-600 mt-2">Manage and update room statuses</p>
              </div>

              {loading ? (
                <div className="text-center text-lg">Loading rooms...</div>
              ) : error ? (
                <div className="text-center text-red-600">{error}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {rooms.map((room) => (
                    <RoomCard key={room.id} room={room} onStatusChange={(status) => updateRoomStatus(room.id, status)} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "profile" && user && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                <p className="text-xl text-gray-600 mt-2">View and manage your profile</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
                <div className="flex items-center space-x-6 mb-8">
                  <div className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <p className="text-xl text-gray-600">{user.role}</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <h3 className="text-lg font-bold text-gray-700 mb-2">Email</h3>
                    <p className="text-xl">{user.email}</p>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <h3 className="text-lg font-bold text-gray-700 mb-2">Staff ID</h3>
                    <p className="text-xl">{user._id}</p>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <h3 className="text-lg font-bold text-gray-700 mb-2">Department</h3>
                    <p className="text-xl">Housekeeping</p>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <h3 className="text-lg font-bold text-gray-700 mb-2">Hotel ID</h3>
                    <p className="text-xl">{user.hotelId}</p>
                  </div>
                </div>
                <div className="pt-8 flex justify-end">
                  <button onClick={AuthUtils.logout} className="px-6 py-3 bg-red-600 text-white text-lg font-medium rounded-lg hover:bg-red-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-red-500">
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-xl text-gray-600 mt-2">Manage your account settings</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
                <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-lg font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      defaultValue="Jane Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-lg font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      defaultValue="jane.doe@hotelexample.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="current-password" className="block text-lg font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="current-password"
                      className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-password" className="block text-lg font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="new-password"
                      className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className="block text-lg font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirm-password"
                      className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="pt-4">
                    <button className="px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
