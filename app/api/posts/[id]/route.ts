import { type NextRequest, NextResponse } from "next/server"
import { updatePost, deletePost } from "@/lib/posts"
import { verifyToken } from "@/lib/auth"
import { z } from "zod"

const updatePostSchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres").optional(),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres").optional(),
  images: z.array(z.string()).optional(),
  type: z.enum(["pedir", "ofrecer", "intercambiar", "vender"]).optional(),
})

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    const updates = updatePostSchema.parse(body)

    const post = await updatePost(params.id, decoded.userId, updates)

    return NextResponse.json({ success: true, post })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 })
    }

    return NextResponse.json({ success: false, error: "Error al actualizar la publicación" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Token inválido" }, { status: 401 })
    }

    await deletePost(params.id, decoded.userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Error al eliminar la publicación" }, { status: 500 })
  }
}
