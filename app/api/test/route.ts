import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🧪 Test API called")

    // Verificar variables de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const jwtSecret = process.env.JWT_SECRET

    console.log("🔧 Environment variables:", {
      supabaseUrl: supabaseUrl ? "✅ Set" : "❌ Missing",
      supabaseKey: supabaseKey ? "✅ Set" : "❌ Missing",
      jwtSecret: jwtSecret ? "✅ Set" : "❌ Missing",
    })

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: "Missing environment variables",
        env: {
          supabaseUrl: !!supabaseUrl,
          supabaseKey: !!supabaseKey,
          jwtSecret: !!jwtSecret,
        },
      })
    }

    // Probar conexión a Supabase
    const { createClient } = await import("@supabase/supabase-js")
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase.from("users").select("count").limit(1)

    console.log("🔗 Supabase connection test:", { success: !error, error: error?.message })

    return NextResponse.json({
      success: true,
      message: "API funcionando correctamente",
      supabaseConnection: !error,
      env: {
        supabaseUrl: !!supabaseUrl,
        supabaseKey: !!supabaseKey,
        jwtSecret: !!jwtSecret,
      },
    })
  } catch (error) {
    console.error("💥 Test error:", error)
    return NextResponse.json({
      success: false,
      error: "Error en la API de prueba",
    })
  }
}
