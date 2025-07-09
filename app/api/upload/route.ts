import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Upload API called")

    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      console.log("❌ No token provided")
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      console.log("❌ Invalid token")
      return NextResponse.json({ success: false, error: "Token inválido" }, { status: 401 })
    }

    console.log("✅ User authenticated:", decoded.userId)

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.log("❌ No file provided")
      return NextResponse.json({ success: false, error: "No se proporcionó archivo" }, { status: 400 })
    }

    console.log("📁 File received:", {
      name: file.name,
      size: file.size,
      type: file.type,
    })

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      console.log("❌ File is not an image:", file.type)
      return NextResponse.json({ success: false, error: "El archivo debe ser una imagen" }, { status: 400 })
    }

    // Validar tamaño (10MB máximo para dar más margen)
    if (file.size > 10 * 1024 * 1024) {
      console.log("❌ File too large:", file.size)
      return NextResponse.json(
        { success: false, error: "La imagen es demasiado grande (máximo 10MB)" },
        { status: 400 },
      )
    }

    console.log("✅ File validation passed")

    // Convertir a ArrayBuffer y luego a base64
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString("base64")
    const mimeType = file.type
    const dataUrl = `data:${mimeType};base64,${base64}`

    console.log("✅ File converted to base64:", {
      originalSize: file.size,
      base64Length: base64.length,
      dataUrlLength: dataUrl.length,
    })

    return NextResponse.json({
      success: true,
      url: dataUrl,
      info: {
        originalName: file.name,
        size: file.size,
        type: file.type,
      },
    })
  } catch (error) {
    console.error("💥 Upload error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al procesar la imagen",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
