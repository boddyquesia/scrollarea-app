import { type NextRequest, NextResponse } from "next/server"
import { getExpiringPosts } from "@/lib/posts"
import { verifyToken } from "@/lib/auth"

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

    const posts = await getExpiringPosts(decoded.userId)

    return NextResponse.json({ success: true, posts })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Error al obtener publicaciones" }, { status: 500 })
  }
}
