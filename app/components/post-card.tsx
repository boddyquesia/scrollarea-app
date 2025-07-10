"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Clock,
  MessageCircle,
  Flag,
  MoreVertical,
  Edit,
  Trash2,
  Camera,
  X,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"

import PostImages from "./post-images"

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

interface PostCardProps {
  post: any
  currentUserId: string
  userLocation: any
  onContact: (userId: string, userName: string, postTitle: string) => void
  onViewProfile: (userId: string) => void
  onReport: (postId: string) => void
  onUpdate: (postId: string, updates: any) => void
  onDelete: (postId: string) => void
  onExtend: (postId: string) => void
}

export default function PostCard({
  post,
  currentUserId,
  userLocation,
  onContact,
  onViewProfile,
  onReport,
  onUpdate,
  onDelete,
  onExtend,
}: PostCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editForm, setEditForm] = useState({
    type: post.type,
    title: post.title,
    description: post.description,
    images: post.images || [],
  })

  const isOwner = post.user.id === currentUserId
  const isExpiringSoon = post.expires_at && new Date(post.expires_at) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  const daysUntilExpiry = post.expires_at
    ? Math.ceil((new Date(post.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`
    }
    return `${distance.toFixed(1)}km`
  }

  const handleEdit = async () => {
    setIsLoading(true)
    try {
      await onUpdate(post.id, editForm)
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Error updating post:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newImages = []
      for (const file of Array.from(files)) {
        try {
          const formData = new FormData()
          formData.append("file", file)

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          })

          const data = await response.json()
          if (data.success) {
            newImages.push(data.url)
          }
        } catch (error) {
          console.error("Error uploading image:", error)
        }
      }
      setEditForm({ ...editForm, images: [...editForm.images, ...newImages] })
    }
  }

  const removeImage = (index: number) => {
    const updatedImages = editForm.images.filter((_, i) => i !== index)
    setEditForm({ ...editForm, images: updatedImages })
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                onClick={() => onViewProfile(post.user.id)}
              >
                <AvatarImage src={post.user.avatar_url || "/placeholder.svg"} alt={post.user.name} />
                <AvatarFallback>{post.user.initials}</AvatarFallback>
              </Avatar>
              <div>
                <p
                  className="font-medium text-sm cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => onViewProfile(post.user.id)}
                >
                  {post.user.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MapPin className="h-3 w-3" />
                  <span>
                    {userLocation.method !== "none" ? formatDistance(post.distance) : `CP ${post.postal_code}`}
                  </span>
                  <span>•</span>
                  <Clock className="h-3 w-3" />
                  <span>{post.timeAgo}</span>
                  {isExpiringSoon && (
                    <>
                      <span>•</span>
                      <AlertTriangle className="h-3 w-3 text-orange-500" />
                      <span className="text-orange-600">
                        {daysUntilExpiry > 0 ? `${daysUntilExpiry}d restantes` : "Expira hoy"}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={typeColors[post.type as keyof typeof typeColors]}>
                {typeLabels[post.type as keyof typeof typeLabels]}
              </Badge>

              {/* Menu de opciones */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isOwner ? (
                    <>
                      <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      {isExpiringSoon && (
                        <DropdownMenuItem onClick={() => onExtend(post.id)}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Extender 30 días
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar publicación?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. La publicación será eliminada permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete(post.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                          <Flag className="h-4 w-4 mr-2" />
                          Reportar
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reportar publicación</AlertDialogTitle>
                          <AlertDialogDescription>
                            ¿Estás seguro de que quieres reportar esta publicación como inapropiada?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onReport(post.id)} className="bg-red-600 hover:bg-red-700">
                            Reportar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
          <p className="text-gray-600 mb-4">{post.description}</p>

          {/* Images */}
          {post.images && post.images.length > 0 && <PostImages images={post.images} postTitle={post.title} />}

          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
              <MessageCircle className="h-4 w-4" />
              <span>
                {post.responses_count || post.responses || 0} respuesta
                {(post.responses_count || post.responses || 0) !== 1 ? "s" : ""}
              </span>
            </Button>
            {!isOwner && (
              <Button size="sm" onClick={() => onContact(post.user.id, post.user.name, post.title)}>
                Contactar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Publicación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Tipo</Label>
              <Select value={editForm.type} onValueChange={(value) => setEditForm({ ...editForm, type: value })}>
                <SelectTrigger>
                  <SelectValue />
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
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="¿Qué necesitas u ofreces?"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Descripción</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Proporciona más detalles..."
                rows={3}
              />
            </div>

            {/* Image Upload */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Fotos</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="edit-image-upload"
                  />
                  <Label
                    htmlFor="edit-image-upload"
                    className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Agregar fotos</span>
                  </Label>
                </div>

                {/* Image Preview */}
                {editForm.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {editForm.images.map((image, index) => (
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
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="flex-1"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button onClick={handleEdit} className="flex-1" disabled={isLoading || !editForm.title || !editForm.type}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
