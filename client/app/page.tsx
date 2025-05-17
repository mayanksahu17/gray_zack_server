"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User } from "lucide-react"
import { Button } from "@/components/ui/button"
import AuthUtils from '@/utills/authUtills'
import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff, Lock,  } from "lucide-react"
import Cookies from "js-cookie" 
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import logo from "../public/logo.png"


export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const router = useRouter()
  const [userType, setUserType] = useState<'staff' | 'admin'>('staff')


  


// Check authentication
if (AuthUtils.isAuthenticated()) {
  // User is logged in
  const userRole = AuthUtils.getUserRole()
}

// Logout

// Check specific role
if (AuthUtils.hasRole('restaurant_manager')) {
  // Do something specific to restaurant manager
  router.push('/restaurant_manager')
}else if (AuthUtils.hasRole('hotel_owner')) {
   // Do something specific to restaurant manager
   router.push('/manager_dashboard')
}
else if (AuthUtils.hasRole('housekeeper')) {
   // Do something specific to restaurant manager
   router.push('/housekeeper-dashboard')
}
else if (AuthUtils.hasRole('front_desk')) {
   // Do something specific to restaurant manager
   router.push('/front_desk')
}

useEffect(() => {
  if (AuthUtils.isAuthenticated()) {
    const userRole = AuthUtils.getUserRole();
    switch(userRole) {
      case 'restaurant_manager':
        router.push('/restaurant_manager');
        break;
      case 'hotel_owner':
        router.push('/manager_dashboard');
        break;
      case 'housekeeper':
        router.push('/housekeeper-dashboard');
        break;
      case 'front_desk':
        router.push('/front_desk');
        break;
      default:
        router.push('/');
    }
  }
}, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Reset errors
    const newErrors: { email?: string; password?: string; general?: string } = {}

    // Validate fields
    if (!email.trim()) {
      newErrors.email = "Email is required"
    }

    if (!password) {
      newErrors.password = "Password is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      const loginUrl = userType === 'admin'
        ? 'http://56.228.32.222:8000/api/v1.0/admin/login'
        : 'http://56.228.32.222:8000/api/v1/staff/hotel/login'
      const response = await fetch(loginUrl, {
        method: 'POST',
        credentials: 'include', // Important for handling cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      const result = await response.json()

      if (result.success) {
        // Store user data securely
        Cookies.set('userData', JSON.stringify({
          _id: result.data._id,
          name: result.data.name,
          email: result.data.email,
          role: result.data.role,
          hotelId: result.data.hotelId
        }), { 
          expires: 1, // 1 day
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        })

        // Remember me functionality
        if (rememberMe) {
          Cookies.set('rememberMe', 'true', { expires: 30 }) // 30 days
        } else {
          Cookies.remove('rememberMe')
        }
        
        // Admin redirect
        if (userType === 'admin') {
          // Store admin accessToken for admin-protected endpoints
          if (result.data && result.data.accessToken) {
            Cookies.set('adminAccessToken', result.data.accessToken, {
              expires: 1,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict'
            });
          }
          router.push('/manager_dashboard')
          return
        }
        
        // Role-based routing
        switch(result.data.role) {
          case 'restaurant_manager':
            router.push('/restaurant_manager')
            break
          case 'hotel_owner':
            router.push('/manager_dashboard')
            break
          case 'housekeeper':
            router.push('/housekeeper-dashboard')
            break
          case 'front_desk':
            router.push('/front_desk')
            break
          default:
            router.push('/')
        }
      } else {
        const attempts = failedAttempts + 1
        setFailedAttempts(attempts)

        if (attempts >= 3) {
          setIsLocked(true)
          newErrors.general = "Your account has been temporarily locked due to multiple failed login attempts."
        } else {
          newErrors.general = result.message || "Login failed. Please check your credentials."
        }

        setErrors(newErrors)
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrors({
        general: "An error occurred. Please try again later."
      })
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
              src={logo}
              alt="Hotel POS Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <CardTitle className="text-2xl font-semibold text-blue-800">Hotel Management</CardTitle>
          <CardDescription className="text-blue-600">Sign in to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            {/* User type radio buttons */}
            <div className="mb-4 flex justify-center gap-4">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="userType"
                  value="staff"
                  checked={userType === 'staff'}
                  onChange={() => setUserType('staff')}
                  className="accent-blue-600"
                />
                <span className="text-blue-800">Staff</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="userType"
                  value="admin"
                  checked={userType === 'admin'}
                  onChange={() => setUserType('admin')}
                  className="accent-blue-600"
                />
                <span className="text-blue-800">Admin</span>
              </label>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Label htmlFor="email" className="text-blue-800">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-10 border-blue-200 focus:border-blue-400 ${
                      errors.email ? "border-red-300 focus:border-red-400" : ""
                    }`}
                    disabled={isLocked}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                </div>
                {errors.email && (
                  <p id="email-error" className="text-sm text-red-500 mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password input remains similar to previous implementation */}
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

            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Checkbox id="rememberMe" checked={rememberMe} onCheckedChange={setRememberMe} />
                <Label htmlFor="rememberMe" className="ml-2 text-blue-800">Remember me</Label>
              </div>
              <Link href="/reset-password" className="text-blue-600 hover:underline text-sm">Forgot password?</Link>
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