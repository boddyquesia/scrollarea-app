"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertTriangle, RefreshCw, X, Clock } from "lucide-react"

interface ExpiringPost {
  id: string
  title: string
  type: string
  expires_at: string
  created_at: string
}

interface ExpiringPostsNotificationProps {
  userId: string
}

const typeLabels = {
  pedir: "Pedir",
  ofrecer: "Ofrecer",
  intercambiar: "Intercambiar",
  vender: "Vender",
}

const typeColors = {
  pedir: "bg-blue-100 text-blue-800 border-blue-200",
  ofrecer: "bg-green-100 text-green-800 border-green-200",
  intercambiar: "bg-purple-100 text-purple-800 border-purple-200",
  vender: "bg-orange-100 text-orange-800 border-orange-200",
}

export default function ExpiringPostsNotification({ userId }: ExpiringPostsNotificationProps) {
  const [expiringPosts, setExpiringPosts] = useState<ExpiringPost[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchExpiringPosts()
  }, [userId])

  const fetchExpiringPosts = async () => {
    try {
      const response = await fetch("/api/posts/expiring")
      const data = await response.json()

      if (data.success && data.posts.length > 0) {
        setExpiringPosts(data.posts)
        setIsDialogOpen(true)
      }
    } catch (error) {
      console.error("Error fetching expiring posts:", error)
    }
  }

  const handleExtendPost = async (postId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/posts/${postId}/extend`, {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        // Remover el post de la lista
        setExpiringPosts(expiringPosts.filter((post) => post.id !== postId))
        console.log("✅ Post extended successfully")
      }
    } catch (error) {
      console.error("Error extending post:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getDaysUntilExpiry = (expiresAt: string) => {
    const days = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return Math.max(0, days)
  }

  if (expiringPosts.length === 0) {
    return null
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Publicaciones por Expirar
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Tienes {expiringPosts.length} publicación{expiringPosts.length !== 1 ? "es" : ""} que expira
            {expiringPosts.length !== 1 ? "n" : ""} pronto. ¿Quieres extenderlas por 30 días más?
          </p>

          <div className="space-y-3">
            {expiringPosts.map((post) => {
              const daysLeft = getDaysUntilExpiry(post.expires_at)
              return (
                <Card key={post.id} className="border-orange-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={typeColors[post.type as keyof typeof typeColors]}>
                            {typeLabels[post.type as keyof typeof typeLabels]}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-orange-600">
                            <Clock className="h-3 w-3" />
                            <span>{daysLeft > 0 ? `${daysLeft} días restantes` : "Expira hoy"}</span>
                          </div>
                        </div>
                        <h4 className="font-medium text-sm">{post.title}</h4>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleExtendPost(post.id)}
                        disabled={isLoading}
                        className="flex-1 flex items-center gap-2"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Extender</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpiringPosts(expiringPosts.filter((p) => p.id !== post.id))}
                        className="px-3"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
              Cerrar
            </Button>
            <Button
              onClick={async () => {
                // Extender todos los posts
                for (const post of expiringPosts) {
                  await handleExtendPost(post.id)
                }
                setIsDialogOpen(false)
              }}
              disabled={isLoading}
              className="flex-1"
            >
              Extender Todos
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
