import { type NextRequest, NextResponse } from "next/server"
import { getUserById, verifyToken } from "@/lib/auth"

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
