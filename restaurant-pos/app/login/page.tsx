"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff, Lock, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<{ username?: string; password?: string; general?: string }>({})
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    // Reset errors
    const newErrors: { username?: string; password?: string; general?: string } = {}

    // Validate fields
    if (!username.trim()) {
      newErrors.username = "Username is required"
    }

    if (!password) {
      newErrors.password = "Password is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Simulate login logic (replace with actual authentication)
    if (username === "admin" && password === "password") {
      // Successful login
      window.location.href = "/"
    } else {
      // Failed login
      const attempts = failedAttempts + 1
      setFailedAttempts(attempts)

      if (attempts >= 3) {
        setIsLocked(true)
        newErrors.general =
          "Your account has been temporarily locked due to multiple failed login attempts. Please try again later."
      } else {
        newErrors.general = "Incorrect username or password. Please try again."
      }

      setErrors(newErrors)
    }
  }

  const toggleShowPassword = () => {
    setShowPassword(!showPassword)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <Card className="w-full max-w-md shadow-lg border-blue-100">
        <CardHeader className="space-y-4 items-center">
          <div className="w-48 h-16 relative mb-2">
            <Image
              src="/placeholder.svg?height=64&width=192"
              alt="Hotel POS Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <CardTitle className="text-2xl font-semibold text-blue-800">Hotel Management POS</CardTitle>
          <CardDescription className="text-blue-600">Sign in to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <Label htmlFor="username" className="text-blue-800">
                  Username
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`pl-10 border-blue-200 focus:border-blue-400 ${
                      errors.username ? "border-red-300 focus:border-red-400" : ""
                    }`}
                    disabled={isLocked}
                    aria-invalid={!!errors.username}
                    aria-describedby={errors.username ? "username-error" : undefined}
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                </div>
                {errors.username && (
                  <p id="username-error" className="text-sm text-red-500 mt-1">
                    {errors.username}
                  </p>
                )}
              </div>

              <div className="relative">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-blue-800">
                    Password
                  </Label>
                  <Link href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-800 hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-10 border-blue-200 focus:border-blue-400 ${
                      errors.password ? "border-red-300 focus:border-red-400" : ""
                    }`}
                    disabled={isLocked}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-blue-500"
                    onClick={toggleShowPassword}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-sm text-red-500 mt-1">
                    {errors.password}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={isLocked}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <Label htmlFor="remember" className="text-sm text-blue-700 cursor-pointer">
                Remember me
              </Label>
            </div>

            {errors.general && (
              <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200 animate-fadeIn">
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              disabled={isLocked}
            >
              Login
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-blue-50 pt-4">
          <p className="text-sm text-blue-600">
            Need help? Contact{" "}
            <Link href="/support" className="font-medium hover:underline">
              IT Support
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  )
}

