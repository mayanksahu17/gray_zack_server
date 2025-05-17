"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get("token")
  const emailParam = params.get("email")

  const handleRequest = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")
    try {
      const res = await fetch("http://56.228.32.222:8000/api/v1/staff/hotel/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (data.success) setMessage("Reset link sent to your email.")
      else setError(data.message || "Failed to send reset link.")
    } catch (err) {
      setError("Failed to send reset link.")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")
    try {
      const res = await fetch("http://56.228.32.222:8000/api/v1/staff/hotel/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailParam, token, newPassword })
      })
      const data = await res.json()
      if (data.success) {
        setMessage("Password reset successfully. You can now log in.")
        setTimeout(() => router.push("/"), 2000)
      } else setError(data.message || "Failed to reset password.")
    } catch (err) {
      setError("Failed to reset password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <Card className="w-full max-w-md shadow-lg border-blue-100">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-blue-800">
            {token ? "Set New Password" : "Reset Password"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {token ? (
            <form onSubmit={handleReset} className="space-y-4">
              <Input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
              <Button type="submit" disabled={loading}>{loading ? "Resetting..." : "Reset Password"}</Button>
              {message && <div className="text-green-600 mt-2">{message}</div>}
              {error && <div className="text-red-600 mt-2">{error}</div>}
            </form>
          ) : (
            <form onSubmit={handleRequest} className="space-y-4">
              <Input type="email" placeholder="Your Email" value={email} onChange={e => setEmail(e.target.value)} required />
              <Button type="submit" disabled={loading}>{loading ? "Sending..." : "Send Reset Link"}</Button>
              {message && <div className="text-green-600 mt-2">{message}</div>}
              {error && <div className="text-red-600 mt-2">{error}</div>}
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  )
} 