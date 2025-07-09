import { type NextRequest, NextResponse } from "next/server"
import { getUserById, verifyToken } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Token inválido" }, { status: 401 })
    }

    const user = await getUserById(decoded.userId)
    if (!user) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        initials: user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase(),
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Error al obtener el usuario" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Token inválido" }, { status: 401 })
    }

    const { name, bio, avatar_url } = await request.json()

    console.log("🔄 Updating user profile:", {
      userId: decoded.userId,
      name,
      bio,
      hasAvatar: !!avatar_url,
    })

    const { data, error } = await supabase
      .from("users")
      .update({
        name: name?.trim(),
        bio: bio?.trim(),
        avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", decoded.userId)
      .select()
      .single()

    if (error) {
      console.error("❌ Update error:", error)
      return NextResponse.json({ success: false, error: "Error al actualizar el perfil" }, { status: 500 })
    }

    console.log("✅ Profile updated successfully")

    return NextResponse.json({
      success: true,
      user: {
        ...data,
        initials: data.name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase(),
      },
    })
  } catch (error) {
    console.error("💥 Profile update error:", error)
    return NextResponse.json({ success: false, error: "Error al actualizar el perfil" }, { status: 500 })
  }
}
