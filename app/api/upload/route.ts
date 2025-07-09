import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { uploadImage, compressImage } from "@/lib/storage"

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

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ success: false, error: "No se proporcionó archivo" }, { status: 400 })
    }

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, error: "El archivo debe ser una imagen" }, { status: 400 })
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "La imagen es demasiado grande (máximo 5MB)" }, { status: 400 })
    }

    console.log("📤 Processing file upload:", { name: file.name, size: file.size, type: file.type })

    // Comprimir imagen si es muy grande
    let processedFile = file
    if (file.size > 1024 * 1024) {
      // Si es mayor a 1MB, comprimir
      console.log("🔄 Compressing large image...")
      processedFile = await compressImage(file)
      console.log("✅ Image compressed:", {
        originalSize: file.size,
        compressedSize: processedFile.size,
      })
    }

    // Convertir a base64
    const imageUrl = await uploadImage(processedFile)

    if (!imageUrl) {
      return NextResponse.json({ success: false, error: "Error al procesar la imagen" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      url: imageUrl,
    })
  } catch (error) {
    console.error("💥 Upload error:", error)
    return NextResponse.json({ success: false, error: "Error al procesar la imagen" }, { status: 500 })
  }
}
