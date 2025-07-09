"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  ArrowLeft,
  Star,
  Calendar,
  MessageCircle,
  MapPin,
  Clock,
  Edit,
  Camera,
  Mail,
  Award,
  TrendingUp,
} from "lucide-react"

const typeColors = {
  pedir: "bg-blue-100 text-blue-800 border-blue-200",
  ofrecer: "bg-green-100 text-green-800 border-green-200",
  intercambiar: "bg-purple-100 text-purple-800 border-purple-200",
  vender: "bg-orange-100 text-orange-800 border-orange-200",
}

const typeLabels = {
  pedir: "Pedir",
  ofrecer: "Ofrecer",
  intercambiar: "Intercambiar",
  vender: "Vender",
}

interface ProfilePageProps {
  user: any
  posts: any[]
  onBackToHome: () => void
  onStartConversation: (userId: string, userName: string, postTitle: string) => void
}

export default function ProfilePage(props: Partial<ProfilePageProps>) {
  const [user, setUser] = useState<any | null>(props.user ?? null)
  const [posts, setPosts] = useState<any[]>(props.posts ?? [])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    avatar: user?.avatar || "",
  })

  useEffect(() => {
    if (!user && typeof window !== "undefined") {
      const storedUser = localStorage.getItem("vecinetUser")
      if (storedUser) {
        const u = JSON.parse(storedUser)
        setUser(u)
        // Filtra posts simulados (o podrías hacer fetch real)
        const storedPosts = (window as any).__MOCK_POSTS__ ?? []
        setPosts(storedPosts.filter((p: any) => p.user.id === u.id))
      }
    }
  }, [user])

  const handleSaveProfile = () => {
    // En una app real, esto actualizaría el perfil en la API
    console.log("Guardando perfil:", editForm)
    setIsEditDialogOpen(false)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setEditForm({ ...editForm, avatar: imageUrl })
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Cargando perfil…</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={props.onBackToHome} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Volver</span>
            </Button>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-2">
                <span className="font-bold text-lg">VN</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="relative inline-block">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback className="text-2xl">{user.initials}</AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl">{user.name}</CardTitle>
                <div className="flex items-center justify-center gap-1 mt-2">
                  {renderStars(user.rating)}
                  <span className="text-sm text-gray-600 ml-2">({user.rating})</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-center">{user.bio}</p>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Miembro desde {user.joinDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{user.email}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="font-semibold text-lg">{user.totalPosts}</span>
                    </div>
                    <p className="text-xs text-gray-600">Publicaciones</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Award className="h-4 w-4 text-green-500" />
                      <span className="font-semibold text-lg">{user.completedExchanges}</span>
                    </div>
                    <p className="text-xs text-gray-600">Intercambios</p>
                  </div>
                </div>

                <Button onClick={() => setIsEditDialogOpen(true)} className="w-full flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  <span>Editar Perfil</span>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Posts and Activity */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="posts">Mis Publicaciones ({posts.length})</TabsTrigger>
                <TabsTrigger value="activity">Actividad Reciente</TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="space-y-4">
                {posts.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <div className="text-gray-500">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="font-medium mb-2">No tienes publicaciones aún</h3>
                        <p className="text-sm">¡Crea tu primera publicación para conectar con tu comunidad!</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  posts.map((post) => (
                    <Card key={post.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={typeColors[post.type as keyof typeof typeColors]}>
                                {typeLabels[post.type as keyof typeof typeLabels]}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                <span>{post.timeAgo}</span>
                              </div>
                            </div>
                            <h3 className="font-semibold text-lg">{post.title}</h3>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-gray-600 mb-4">{post.description}</p>

                        {/* Images */}
                        {post.images.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            {post.images.map((image: string, index: number) => (
                              <img
                                key={index}
                                src={image || "/placeholder.svg"}
                                alt={`Imagen ${index + 1}`}
                                className="rounded-lg object-cover w-full h-32"
                              />
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MessageCircle className="h-4 w-4" />
                            <span>
                              {post.responses} respuesta{post.responses !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="h-4 w-4" />
                            <span>CP {post.postalCode}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="font-medium mb-2">Actividad reciente</h3>
                      <p className="text-sm">Aquí aparecerá tu actividad reciente en la comunidad</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Avatar Upload */}
            <div className="text-center">
              <Avatar className="h-20 w-20 mx-auto mb-4">
                <AvatarImage src={editForm.avatar || "/placeholder.svg"} alt={editForm.name} />
                <AvatarFallback className="text-lg">
                  {editForm.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="avatar-upload"
                />
                <Label
                  htmlFor="avatar-upload"
                  className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 w-fit mx-auto"
                >
                  <Camera className="h-4 w-4" />
                  <span>Cambiar foto</span>
                </Label>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Nombre</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Tu nombre completo"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Biografía</Label>
              <Textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                placeholder="Cuéntanos sobre ti..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSaveProfile} className="flex-1">
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
