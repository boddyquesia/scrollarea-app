import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Login API called")

    const body = await request.json()
    console.log("📝 Request body:", body)

    const { email, password } = body

    // Verificar variables de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log("🔧 Environment check:", {
      supabaseUrl: supabaseUrl ? "✅" : "❌",
      supabaseKey: supabaseKey ? "✅" : "❌",
    })

    if (!supabaseUrl || !supabaseKey) {
      console.error("❌ Missing Supabase environment variables")
      return NextResponse.json({ success: false, error: "Configuración del servidor incompleta" }, { status: 500 })
    }

    // Importar Supabase dinámicamente
    const { createClient } = await import("@supabase/supabase-js")
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log("🔍 Searching for user:", email)

    // Buscar usuario
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .single()

    console.log("📊 User query result:", {
      found: !!user,
      error: error?.message,
      userId: user?.id,
    })

    if (error || !user) {
      console.log("❌ User not found")
      return NextResponse.json({ success: false, error: "Credenciales inválidas" }, { status: 401 })
    }

    // Verificar contraseña con bcrypt
    const bcrypt = await import("bcryptjs")
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    console.log("🔐 Password check:", isValidPassword)

    if (!isValidPassword) {
      console.log("❌ Invalid password")
      return NextResponse.json({ success: false, error: "Credenciales inválidas" }, { status: 401 })
    }

    // Generar token JWT
    const jwt = await import("jsonwebtoken")
    const jwtSecret = process.env.JWT_SECRET || "fallback-secret-key"
    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: "7d" })

    console.log("✅ Login successful")

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
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    console.error("💥 Login error:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
