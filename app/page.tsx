"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MapPin,
  Search,
  Plus,
  MessageCircle,
  Clock,
  Filter,
  Camera,
  Flag,
  X,
  Home,
  Mail,
  Settings,
  Navigation,
  User,
  LogOut,
} from "lucide-react"
import MessagesPage from "./messages/page"
import LocationSettings from "./components/location-settings"
import AuthPage from "./auth/page"
import ProfilePage from "./profile/page"
import PublicProfilePage from "./profile/[userId]/page"

// Simulamos coordenadas para diferentes códigos postales de Madrid
const postalCodeCoordinates: Record<string, { lat: number; lng: number; area: string }> = {
  "28001": { lat: 40.4168, lng: -3.7038, area: "Centro - Sol" },
  "28002": { lat: 40.4095, lng: -3.6934, area: "Centro - Cortes" },
  "28003": { lat: 40.4021, lng: -3.6987, area: "Centro - Embajadores" },
  "28004": { lat: 40.42, lng: -3.698, area: "Centro - Justicia" },
  "28005": { lat: 40.4089, lng: -3.6801, area: "Centro - Inclán" },
  "28006": { lat: 40.424, lng: -3.689, area: "Centro - Universidad" },
  "28007": { lat: 40.4315, lng: -3.692, area: "Centro - Palacio" },
  "28008": { lat: 40.438, lng: -3.685, area: "Chamberí" },
  "28009": { lat: 40.428, lng: -3.71, area: "Moncloa" },
  "28010": { lat: 40.415, lng: -3.72, area: "Arganzuela" },
}

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

interface UserLocation {
  lat: number
  lng: number
  postalCode?: string
  area?: string
  method: "gps" | "postal" | "none"
}

interface CommunityAppProps {
  onStartConversation?: (userId: string, userName: string, postTitle: string) => void
}

// Función para calcular distancia entre dos puntos (fórmula de Haversine)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const mockUsers = {
  "1": { id: "1", name: "User 1", avatar: "/user1.svg", initials: "U1" },
  "2": { id: "2", name: "User 2", avatar: "/user2.svg", initials: "U2" },
}

export default function CommunityApp({ onStartConversation }: CommunityAppProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("todos")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false)
  const [posts, setPosts] = useState<any[]>([])
  const [currentView, setCurrentView] = useState<"home" | "messages" | "auth" | "profile" | "publicProfile">("home")
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userLocation, setUserLocation] = useState<UserLocation>({ lat: 0, lng: 0, method: "none" })
  const [maxDistance, setMaxDistance] = useState([5]) // Radio en km
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [newPost, setNewPost] = useState({
    type: "",
    title: "",
    description: "",
    images: [] as string[],
  })

  // Cargar usuario y ubicación guardada al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem("vecinetUser")
    const savedLocation = localStorage.getItem("vecinetLocation")

    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser))
    }

    if (savedLocation) {
      setUserLocation(JSON.parse(savedLocation))
    }
  }, [])

  // Y agrega un useEffect para cargar posts reales:
  useEffect(() => {
    // Aquí cargarías posts desde tu API
    // fetchPosts().then(setPosts)

    // Por ahora, array vacío hasta que implementes la API
    setPosts([])
  }, [])

  // Filtrar y ordenar posts por distancia
  const filteredPosts = posts
    .filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = selectedType === "todos" || post.type === selectedType

      // Filtrar por distancia si hay ubicación del usuario
      let withinDistance = true
      if (userLocation.method !== "none") {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          post.coordinates.lat,
          post.coordinates.lng,
        )
        withinDistance = distance <= maxDistance[0]
      }

      return matchesSearch && matchesType && withinDistance
    })
    .map((post) => {
      // Agregar distancia calculada
      let distance = 0
      if (userLocation.method !== "none") {
        distance = calculateDistance(userLocation.lat, userLocation.lng, post.coordinates.lat, post.coordinates.lng)
      }
      return { ...post, distance }
    })
    .sort((a, b) => a.distance - b.distance) // Ordenar por distancia

  const handleCreatePost = async () => {
    const postData = {
      ...newPost,
      userId: currentUser.id,
      coordinates:
        userLocation.method !== "none"
          ? { lat: userLocation.lat, lng: userLocation.lng }
          : { lat: 40.4168, lng: -3.7038 },
      postalCode: userLocation.postalCode || "28001",
    }

    // Llamada a API real:
    // const response = await fetch('/api/posts', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(postData)
    // })
    // const newPost = await response.json()

    // Por ahora, agregar localmente:
    const post = {
      id: Date.now(),
      ...newPost,
      user: currentUser,
      coordinates: postData.coordinates,
      postalCode: postData.postalCode,
      timeAgo: "hace unos momentos",
      responses: 0,
      reports: 0,
    }

    setPosts([post, ...posts])
    setIsCreateDialogOpen(false)
    setNewPost({ type: "", title: "", description: "", images: [] })
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const imageUrls = Array.from(files).map((file) => URL.createObjectURL(file))
      setNewPost({ ...newPost, images: [...newPost.images, ...imageUrls] })
    }
  }

  const removeImage = (index: number) => {
    const updatedImages = newPost.images.filter((_, i) => i !== index)
    setNewPost({ ...newPost, images: updatedImages })
  }

  const handleReport = (postId: number) => {
    setPosts(
      (prevPosts) =>
        prevPosts
          .map((post) => {
            if (post.id === postId) {
              const newReports = post.reports + 1
              if (newReports >= 3) {
                return null
              }
              return { ...post, reports: newReports }
            }
            return post
          })
          .filter(Boolean) as any[],
    )
  }

  const handleContact = (userId: string, userName: string, postTitle: string) => {
    if (onStartConversation) {
      onStartConversation(userId, userName, postTitle)
    }
    setCurrentView("messages")
  }

  const handleLocationUpdate = (location: UserLocation) => {
    setUserLocation(location)
    localStorage.setItem("vecinetLocation", JSON.stringify(location))
    setIsLocationDialogOpen(false)
  }

  const getCurrentLocation = () => {
    setIsLoadingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: UserLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            method: "gps",
            area: "Ubicación actual",
          }
          handleLocationUpdate(newLocation)
          setIsLoadingLocation(false)
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error)
          setIsLoadingLocation(false)
        },
      )
    } else {
      setIsLoadingLocation(false)
    }
  }

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`
    }
    return `${distance.toFixed(1)}km`
  }

  const handleLogin = (userData: any) => {
    setCurrentUser(userData)
    localStorage.setItem("vecinetUser", JSON.stringify(userData))
    setCurrentView("home")
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem("vecinetUser")
    setCurrentView("auth")
  }

  const handleViewProfile = (userId: string) => {
    if (userId === currentUser?.id) {
      setCurrentView("profile")
    } else {
      setSelectedUserId(userId)
      setCurrentView("publicProfile")
    }
  }

  // Si no hay usuario logueado, mostrar página de autenticación
  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} />
  }

  // Renderizar diferentes vistas
  if (currentView === "messages") {
    return <MessagesPage onBackToHome={() => setCurrentView("home")} />
  }

  if (currentView === "profile") {
    return (
      <ProfilePage
        user={currentUser}
        posts={posts.filter((post) => post.user.id === currentUser.id)}
        onBackToHome={() => setCurrentView("home")}
        onStartConversation={handleContact}
      />
    )
  }

  if (currentView === "publicProfile" && selectedUserId) {
    const selectedUser = Object.values(mockUsers).find((user) => user.id === selectedUserId)
    if (selectedUser) {
      return (
        <PublicProfilePage
          user={selectedUser}
          posts={posts.filter((post) => post.user.id === selectedUserId)}
          onBack={() => setCurrentView("home")}
          onStartConversation={handleContact}
          currentUserId={currentUser.id}
        />
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-2">
                <span className="font-bold text-lg">VN</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">VeciNet</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLocationDialogOpen(true)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {userLocation.method === "none" ? "Configurar ubicación" : userLocation.area || "Mi ubicación"}
                </span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView("messages")}
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">Mensajes</span>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                      <AvatarFallback className="text-xs">{currentUser.initials}</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">{currentUser.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setCurrentView("profile")}>
                    <User className="h-4 w-4 mr-2" />
                    Mi Perfil
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Location and Distance Filter */}
          {userLocation.method !== "none" && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <Navigation className="h-4 w-4" />
                  <span>Mostrando posts dentro de {maxDistance[0]}km</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLocationDialogOpen(true)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 min-w-0">Radio:</span>
                <Slider
                  value={maxDistance}
                  onValueChange={setMaxDistance}
                  max={20}
                  min={0.5}
                  step={0.5}
                  className="flex-1"
                />
                <span className="text-sm font-medium min-w-0">{maxDistance[0]}km</span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant={currentView === "home" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentView("home")}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              <span>Inicio</span>
            </Button>
            <Button
              variant={currentView === "messages" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentView("messages")}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Mensajes</span>
            </Button>
            <Button
              variant={currentView === "profile" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentView("profile")}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              <span>Mi Perfil</span>
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar publicaciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pedir">Pedir</SelectItem>
                <SelectItem value="ofrecer">Ofrecer</SelectItem>
                <SelectItem value="intercambiar">Intercambiar</SelectItem>
                <SelectItem value="vender">Vender</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type Tabs */}
          <Tabs value={selectedType} onValueChange={setSelectedType} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="pedir">Pedir</TabsTrigger>
              <TabsTrigger value="ofrecer">Ofrecer</TabsTrigger>
              <TabsTrigger value="intercambiar">Intercambiar</TabsTrigger>
              <TabsTrigger value="vender">Vender</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {filteredPosts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-medium mb-2">No hay publicaciones cerca</h3>
                <p className="text-sm">
                  {userLocation.method === "none"
                    ? "Configura tu ubicación para ver posts cercanos"
                    : `Intenta aumentar el radio de búsqueda o cambia los filtros`}
                </p>
                {userLocation.method === "none" && (
                  <Button onClick={() => setIsLocationDialogOpen(true)} className="mt-4">
                    Configurar ubicación
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar
                        className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                        onClick={() => handleViewProfile(post.user.id)}
                      >
                        <AvatarImage src={post.user.avatar || "/placeholder.svg"} alt={post.user.name} />
                        <AvatarFallback>{post.user.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p
                          className="font-medium text-sm cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => handleViewProfile(post.user.id)}
                        >
                          {post.user.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {userLocation.method !== "none" ? formatDistance(post.distance) : `CP ${post.postalCode}`}
                          </span>
                          <span>•</span>
                          <Clock className="h-3 w-3" />
                          <span>{post.timeAgo}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={typeColors[post.type as keyof typeof typeColors]}>
                        {typeLabels[post.type as keyof typeof typeLabels]}
                      </Badge>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-red-500">
                            <Flag className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reportar publicación</AlertDialogTitle>
                            <AlertDialogDescription>
                              ¿Estás seguro de que quieres reportar esta publicación como inapropiada?
                              {post.reports > 0 &&
                                ` Esta publicación ya tiene ${post.reports} reporte${post.reports > 1 ? "s" : ""}.`}
                              {post.reports >= 2 && " Un reporte más y será eliminada automáticamente."}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleReport(post.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Reportar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                  <p className="text-gray-600 mb-4">{post.description}</p>

                  {/* Images */}
                  {post.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {post.images.map((image, index) => (
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
                    <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                      <MessageCircle className="h-4 w-4" />
                      <span>
                        {post.responses} respuesta{post.responses !== 1 ? "s" : ""}
                      </span>
                    </Button>
                    <Button size="sm" onClick={() => handleContact(post.user.id, post.user.name, post.title)}>
                      Contactar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Location Settings Dialog */}
      <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configurar Ubicación</DialogTitle>
          </DialogHeader>
          <LocationSettings
            currentLocation={userLocation}
            onLocationUpdate={handleLocationUpdate}
            onClose={() => setIsLocationDialogOpen(false)}
            isLoading={isLoadingLocation}
            onGetCurrentLocation={getCurrentLocation}
            postalCodeCoordinates={postalCodeCoordinates}
          />
        </DialogContent>
      </Dialog>

      {/* Floating Action Button */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button size="lg" className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg">
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nueva Publicación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Tipo</Label>
              <Select value={newPost.type} onValueChange={(value) => setNewPost({ ...newPost, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo de publicación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pedir">Pedir - Necesito algo</SelectItem>
                  <SelectItem value="ofrecer">Ofrecer - Doy/ayudo</SelectItem>
                  <SelectItem value="intercambiar">Intercambiar - Cambio servicios</SelectItem>
                  <SelectItem value="vender">Vender - Vendo algo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Título</Label>
              <Input
                placeholder="¿Qué necesitas u ofreces?"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Descripción</Label>
              <Textarea
                placeholder="Proporciona más detalles..."
                value={newPost.description}
                onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                rows={3}
              />
            </div>

            {/* Image Upload */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Fotos (opcional)</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Label
                    htmlFor="image-upload"
                    className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Subir fotos</span>
                  </Label>
                </div>

                {/* Image Preview */}
                {newPost.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {newPost.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          className="rounded-lg object-cover w-full h-20"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleCreatePost} className="flex-1" disabled={!newPost.type || !newPost.title}>
                Publicar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
