// Solución simple sin Supabase Storage
export async function uploadImage(file: File): Promise<string | null> {
  try {
    // Validar archivo
    if (!file.type.startsWith("image/")) {
      console.error("❌ File is not an image")
      return null
    }

    if (file.size > 5 * 1024 * 1024) {
      console.error("❌ File too large (max 5MB)")
      return null
    }

    console.log("📤 Processing image:", { name: file.name, size: file.size, type: file.type })

    // Convertir a base64
    const base64 = await fileToBase64(file)
    console.log("✅ Image converted to base64")

    return base64
  } catch (error) {
    console.error("💥 Upload error:", error)
    return null
  }
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

// Función para comprimir imagen antes de convertir
export function compressImage(file: File, maxWidth = 800, quality = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!
    const img = new Image()

    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo proporción
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio

      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Convertir a blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })
            resolve(compressedFile)
          } else {
            resolve(file)
          }
        },
        file.type,
        quality,
      )
    }

    img.src = URL.createObjectURL(file)
  })
}

export async function deleteImage(url: string): Promise<boolean> {
  // Para base64, no hay nada que eliminar
  console.log("🔄 Image cleanup (base64 - no action needed)")
  return true
}
