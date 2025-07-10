import { supabase } from "./supabase"

export interface Post {
  id: string
  user_id: string
  type: "pedir" | "ofrecer" | "intercambiar" | "vender"
  title: string
  description: string
  images: string[]
  coordinates: { lat: number; lng: number }
  postal_code: string
  responses_count: number
  reports_count: number
  expires_at: string
  is_expired: boolean
  created_at: string
  updated_at: string
  user: {
    id: string
    name: string
    avatar_url?: string
    rating: number
  }
}

export async function createPost(
  userId: string,
  type: string,
  title: string,
  description: string,
  images: string[],
  coordinates: { lat: number; lng: number },
  postalCode: string,
): Promise<Post> {
  // Calcular fecha de expiración (30 días desde ahora)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)

  const { data, error } = await supabase
    .from("posts")
    .insert({
      user_id: userId,
      type,
      title,
      description,
      images,
      coordinates,
      postal_code: postalCode,
      expires_at: expiresAt.toISOString(),
    })
    .select(`
      *,
      user:users(id, name, avatar_url, rating)
    `)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  // Actualizar contador de posts del usuario
  await supabase.rpc("increment_user_posts", { user_id: userId })

  return data
}

export async function updatePost(
  postId: string,
  userId: string,
  updates: {
    title?: string
    description?: string
    images?: string[]
    type?: string
  },
): Promise<Post> {
  const { data, error } = await supabase
    .from("posts")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId)
    .eq("user_id", userId) // Solo el dueño puede editar
    .select(`
      *,
      user:users(id, name, avatar_url, rating)
    `)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function deletePost(postId: string, userId: string): Promise<boolean> {
  const { error } = await supabase.from("posts").delete().eq("id", postId).eq("user_id", userId) // Solo el dueño puede eliminar

  if (error) {
    throw new Error(error.message)
  }

  // Decrementar contador de posts del usuario
  await supabase.rpc("decrement_user_posts", { user_id: userId })

  return true
}

export async function extendPost(postId: string, userId: string): Promise<Post> {
  // Extender por otros 30 días
  const newExpiresAt = new Date()
  newExpiresAt.setDate(newExpiresAt.getDate() + 30)

  const { data, error } = await supabase
    .from("posts")
    .update({
      expires_at: newExpiresAt.toISOString(),
      is_expired: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId)
    .eq("user_id", userId)
    .select(`
      *,
      user:users(id, name, avatar_url, rating)
    `)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function getExpiringPosts(userId: string): Promise<Post[]> {
  // Posts que expiran en los próximos 3 días
  const threeDaysFromNow = new Date()
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)

  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      user:users(id, name, avatar_url, rating)
    `)
    .eq("user_id", userId)
    .eq("is_expired", false)
    .lte("expires_at", threeDaysFromNow.toISOString())
    .order("expires_at", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

export async function getPosts(limit = 50, offset = 0, type?: string, searchQuery?: string): Promise<Post[]> {
  let query = supabase
    .from("posts")
    .select(`
      *,
      user:users(id, name, avatar_url, rating)
    `)
    .lt("reports_count", 3) // No mostrar posts con 3+ reportes
    .eq("is_expired", false) // No mostrar posts expirados
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (type && type !== "todos") {
    query = query.eq("type", type)
  }

  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

export async function getPostsByUser(userId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      user:users(id, name, avatar_url, rating)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

export async function reportPost(postId: string, reporterId: string, reason?: string): Promise<boolean> {
  // Insertar reporte
  const { error: reportError } = await supabase.from("reports").insert({
    post_id: postId,
    reporter_id: reporterId,
    reason,
  })

  if (reportError) {
    // Si ya existe el reporte, no hacer nada
    if (reportError.code === "23505") {
      return false
    }
    throw new Error(reportError.message)
  }

  // Incrementar contador de reportes
  const { error: updateError } = await supabase.rpc("increment_post_reports", { post_id: postId })

  if (updateError) {
    throw new Error(updateError.message)
  }

  return true
}
