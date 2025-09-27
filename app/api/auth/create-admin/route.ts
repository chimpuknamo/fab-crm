import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      )
    }

    // Use Supabase Admin client to create user without email confirmation
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email confirmation
      user_metadata: {
        full_name: fullName,
        role: 'admin'
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 400 }
      )
    }

    // Create user profile with admin role
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: authData.user.id,
        email: authData.user.email,
        full_name: fullName,
        role: 'admin',
        avatar_url: null,
        preferences: {
          notifications: true,
          theme: 'light',
          language: 'en'
        }
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Try to clean up the created auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Admin user created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: 'admin'
      }
    })

  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// This endpoint should only be available during development/setup
export async function GET() {
  // Check if admin already exists
  try {
    const { data: existingAdmins, error } = await supabase
      .from('user_profiles')
      .select('email')
      .eq('role', 'admin')
      .limit(1)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to check existing admins' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      hasAdmin: existingAdmins && existingAdmins.length > 0,
      message: existingAdmins && existingAdmins.length > 0 
        ? 'Admin user already exists' 
        : 'No admin user found'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}