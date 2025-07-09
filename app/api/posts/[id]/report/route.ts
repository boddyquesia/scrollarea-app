import { type NextRequest, NextResponse } from "next/server"
import { reportPost } from "@/lib/posts"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Token inválido" }, { status: 401 })
    }

    const body = await request.json()
    const { reason } = body

    const reported = await reportPost(params.id, decoded.userId, reason)

    if (!reported) {
      return NextResponse.json({ success: false, error: "Ya has reportado esta publicación" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Error al reportar la publicación" }, { status: 500 })
  }
}
