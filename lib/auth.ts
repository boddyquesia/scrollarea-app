import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { supabase } from "./supabase"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key"

export interface User {
  id: string
  email: string
  name: string
  bio?: string
  avatar_url?: string
  rating: number
  total_posts: number
  completed_exchanges: number
  created_at: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    const result = await bcrypt.compare(password, hashedPassword)
    console.log("Password verification result:", result)
    return result
  } catch (error) {
    console.error("Password verification error:", error)
    return false
  }
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}

export async function createUser(email: string, password: string, name: string, bio?: string): Promise<User> {
  try {
    const hashedPassword = await hashPassword(password)
    console.log("Creating user with email:", email)

    const { data, error } = await supabase
      .from("users")
      .insert({
        email: email.toLowerCase().trim(),
        password_hash: hashedPassword,
        name: name.trim(),
        bio: bio || "Nuevo miembro de la comunidad VeciNet",
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase create user error:", error)
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    console.error("Create user error:", error)
    throw error
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    console.log("🔍 Authenticating user:", email)

    // Verificar conexión a Supabase
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .single()

    console.log("📊 Supabase query result:", { user: user?.id, error })

    if (error) {
      console.error("❌ Supabase auth error:", error)
      return null
    }

    if (!user) {
      console.log("❌ User not found:", email)
      return null
    }

    console.log("✅ User found, checking password...")
    console.log("🔑 Password hash exists:", !!user.password_hash)

    // Verificar contraseña
    const isValid = await verifyPassword(password, user.password_hash)
    console.log("🔐 Password verification:", isValid)

    if (!isValid) {
      console.log("❌ Password verification failed")
      return null
    }

    console.log("✅ Authentication successful")

    // No devolver el hash de la contraseña
    const { password_hash, ...userWithoutPassword } = user
    return userWithoutPassword
  } catch (error) {
    console.error("💥 Authentication error:", error)
    return null
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, name, bio, avatar_url, rating, total_posts, completed_exchanges, created_at")
      .eq("id", id)
      .single()

    if (error) {
      return null
    }

    return data
  } catch (error) {
    return null
  }
}
