import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

console.log("🔧 Supabase config:", {
  url: supabaseUrl ? "✅ Set" : "❌ Missing",
  key: supabaseAnonKey ? "✅ Set" : "❌ Missing",
})

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente para el servidor
export const createServerClient = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  console.log("🔧 Server client config:", {
    serviceKey: serviceKey ? "✅ Set" : "❌ Missing",
  })
  return createClient(supabaseUrl, serviceKey)
}

// Función de prueba de conexión
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from("users").select("count").limit(1)
    console.log("🧪 Supabase connection test:", { success: !error, error })
    return !error
  } catch (error) {
    console.error("🧪 Supabase connection failed:", error)
    return false
  }
}
