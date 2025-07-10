"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Star, Calendar, MessageCircle, MapPin, Clock, Mail, Award, TrendingUp } from "lucide-react"
import PostImages from "../../components/post-images"

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

interface PublicProfilePageProps {
  user: any
  posts: any[]
  onBack: () => void
  onStartConversation: (userId: string, userName: string, postTitle: string) => void
  currentUserId: string
}

export default function PublicProfilePage({
  user,
  posts,
  onBack,
  onStartConversation,
  currentUserId,
}: PublicProfilePageProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))
  }

  const handleContactUser = () => {
    onStartConversation(user.id, user.name, `Contacto directo con ${user.name}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Volver</span>
            </Button>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-2">
                <span className="font-bold text-lg">VN</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Perfil de {user.name}</h1>
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
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback className="text-2xl">{user.initials}</AvatarFallback>
                </Avatar>
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

                <Button onClick={handleContactUser} className="w-full flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>Contactar</span>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Posts */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="posts">
                  Publicaciones de {user.name} ({posts.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="space-y-4">
                {posts.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <div className="text-gray-500">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="font-medium mb-2">No hay publicaciones</h3>
                        <p className="text-sm">Este usuario aún no ha creado ninguna publicación.</p>
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
                        {post.images && post.images.length > 0 && (
                          <PostImages images={post.images} postTitle={post.title} />
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
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
                          <Button size="sm" onClick={() => onStartConversation(user.id, user.name, post.title)}>
                            Contactar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
