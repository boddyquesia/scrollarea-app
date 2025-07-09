import { type NextRequest, NextResponse } from "next/server"
import { createPost, getPosts } from "@/lib/posts"
import { verifyToken } from "@/lib/auth"
import { z } from "zod"

const createPostSchema = z.object({
  type: z.enum(["pedir", "ofrecer", "intercambiar", "vender"]),
  title: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  images: z.array(z.string()).default([]),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  postalCode: z.string(),
})

export async function POST(request: NextRequest) {
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
    const { type, title, description, images, coordinates, postalCode } = createPostSchema.parse(body)

    const post = await createPost(decoded.userId, type, title, description, images, coordinates, postalCode)

    return NextResponse.json({ success: true, post })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 })
    }

    return NextResponse.json({ success: false, error: "Error al crear la publicación" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || undefined
    const search = searchParams.get("search") || undefined
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const posts = await getPosts(limit, offset, type, search)

    return NextResponse.json({ success: true, posts })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Error al obtener las publicaciones" }, { status: 500 })
  }
}
