import { type NextRequest, NextResponse } from "next/server"
import { extendPost } from "@/lib/posts"
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

    const post = await extendPost(params.id, decoded.userId)

    return NextResponse.json({ success: true, post })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Error al extender la publicación" }, { status: 500 })
  }
}
