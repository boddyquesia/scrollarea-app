import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, bio } = await request.json()

    console.log("Registration attempt for:", email)

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Crear usuario en Supabase
    const { data: user, error } = await supabase
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
      console.error("Registration error:", error)
      if (error.code === "23505") {
        return NextResponse.json({ success: false, error: "Este email ya está registrado" }, { status: 400 })
      }
      return NextResponse.json({ success: false, error: "Error al crear la cuenta" }, { status: 500 })
    }

    // Generar token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "fallback-secret", { expiresIn: "7d" })

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        avatar_url: user.avatar_url,
        rating: user.rating || 5.0,
        total_posts: user.total_posts || 0,
        completed_exchanges: user.completed_exchanges || 0,
        initials: user.name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase(),
      },
    })

    // Establecer cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    })

    console.log("Registration successful for:", email)
    return response
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ success: false, error: "Error al crear la cuenta" }, { status: 500 })
  }
}
