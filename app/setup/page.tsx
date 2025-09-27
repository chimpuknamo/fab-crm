'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  const [hasAdmin, setHasAdmin] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    checkAdminExists()
  }, [])

  const checkAdminExists = async () => {
    try {
      const response = await fetch('/api/auth/create-admin')
      const data = await response.json()
      setHasAdmin(data.hasAdmin)
    } catch (error) {
      console.error('Failed to check admin status:', error)
    } finally {
      setCheckingAdmin(false)
    }
  }

  const handleCreateAdmin = async (formData: FormData) => {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/auth/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          fullName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create admin user')
      }

      setMessage({ type: 'success', text: 'Admin user created successfully! You can now sign in at /auth' })
      setHasAdmin(true)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1F504B] via-[#5A8A84] to-[#D8E3E0] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Checking system setup...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1F504B] via-[#5A8A84] to-[#D8E3E0] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            FabriiQ Setup
          </CardTitle>
          <CardDescription className="text-center">
            Initial system configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Admin Status */}
          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
            {hasAdmin ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm">Admin user already exists</span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-sm">No admin user found</span>
              </>
            )}
          </div>

          {!hasAdmin && (
            <>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Create Admin User</h3>
                <p className="text-sm text-gray-600">
                  Create the first administrator account for your FabriiQ instance.
                </p>
              </div>

              <form action={handleCreateAdmin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    name="fullName" 
                    type="text" 
                    placeholder="Administrator Name"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="admin@example.com"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    placeholder="Strong password"
                    required 
                    minLength={8}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-[#1F504B] hover:bg-[#5A8A84]" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Admin...
                    </>
                  ) : (
                    'Create Admin User'
                  )}
                </Button>
              </form>
            </>
          )}

          {hasAdmin && (
            <div className="space-y-4">
              <Alert className="border-green-500">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  System is already configured. You can proceed to sign in.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Button 
                  onClick={() => window.location.href = '/auth'} 
                  className="w-full bg-[#1F504B] hover:bg-[#5A8A84]"
                >
                  Go to Sign In
                </Button>
                <Button 
                  onClick={() => window.location.href = '/'} 
                  variant="outline"
                  className="w-full"
                >
                  Go to Homepage
                </Button>
              </div>
            </div>
          )}

          {message && (
            <Alert className={`${message.type === 'error' ? 'border-red-500' : 'border-green-500'}`}>
              <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}