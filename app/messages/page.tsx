"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Send, Search, MoreVertical } from "lucide-react"

const mockConversations = [
  {
    id: 1,
    user: { name: "Sarah Chen", avatar: "/placeholder.svg?height=40&width=40", initials: "SC" },
    lastMessage: "¡Hola! ¿Todavía tienes la escalera disponible?",
    timestamp: "hace 10 min",
    unread: 2,
    postTitle: "¿Alguien tiene una escalera que me pueda prestar?",
  },
  {
    id: 2,
    user: { name: "Mike Rodriguez", avatar: "/placeholder.svg?height=40&width=40", initials: "MR" },
    lastMessage: "Perfecto, nos vemos mañana a las 3pm",
    timestamp: "hace 1 hora",
    unread: 0,
    postTitle: "Clases gratuitas de piano para principiantes",
  },
  {
    id: 3,
    user: { name: "Emma Thompson", avatar: "/placeholder.svg?height=40&width=40", initials: "ET" },
    lastMessage: "¿Qué nivel de Excel necesitas aprender?",
    timestamp: "hace 2 horas",
    unread: 1,
    postTitle: "Intercambio clases de inglés por ayuda con Excel",
  },
]

const mockMessages = [
  {
    id: 1,
    senderId: "user1",
    text: "¡Hola! Vi tu publicación sobre la escalera. ¿Todavía la tienes disponible?",
    timestamp: "14:30",
    isOwn: false,
  },
  {
    id: 2,
    senderId: "current",
    text: "¡Hola! Sí, todavía la tengo. ¿Para cuándo la necesitas?",
    timestamp: "14:32",
    isOwn: true,
  },
  {
    id: 3,
    senderId: "user1",
    text: "La necesitaría para este fin de semana si es posible. ¿Cuánto cobras por el préstamo?",
    timestamp: "14:35",
    isOwn: false,
  },
  {
    id: 4,
    senderId: "current",
    text: "No te preocupes, no cobro nada. Solo necesito que dejes un depósito de seguridad de €50 que te devuelvo cuando la regreses en buen estado.",
    timestamp: "14:37",
    isOwn: true,
  },
  {
    id: 5,
    senderId: "user1",
    text: "¡Perfecto! Me parece muy justo. ¿Dónde podemos encontrarnos?",
    timestamp: "14:40",
    isOwn: false,
  },
]

interface MessagesPageProps {
  onBackToHome: () => void
}

export default function MessagesPage({ onBackToHome }: MessagesPageProps) {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredConversations = mockConversations.filter(
    (conv) =>
      conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.postTitle.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log("Enviando mensaje:", newMessage)
      setNewMessage("")
    }
  }

  const selectedConv = mockConversations.find((conv) => conv.id === selectedConversation)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBackToHome} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Volver</span>
            </Button>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-2">
                <span className="font-bold text-lg">VN</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Mensajes</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className={`${selectedConversation ? "hidden lg:block" : ""} lg:col-span-1`}>
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar conversaciones..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="space-y-1">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation.id)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 border-b transition-colors ${
                          selectedConversation === conversation.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={conversation.user.avatar || "/placeholder.svg"}
                              alt={conversation.user.name}
                            />
                            <AvatarFallback>{conversation.user.initials}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-sm truncate">{conversation.user.name}</p>
                              <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                            </div>
                            <p className="text-xs text-gray-600 mb-1 truncate">{conversation.postTitle}</p>
                            <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                          </div>
                          {conversation.unread > 0 && (
                            <div className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {conversation.unread}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className={`${selectedConversation ? "" : "hidden lg:block"} lg:col-span-2`}>
            {selectedConversation ? (
              <Card className="h-full flex flex-col">
                {/* Chat Header */}
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedConversation(null)}
                      className="lg:hidden"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={selectedConv?.user.avatar || "/placeholder.svg"}
                        alt={selectedConv?.user.name}
                      />
                      <AvatarFallback>{selectedConv?.user.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{selectedConv?.user.name}</p>
                      <p className="text-sm text-gray-600 truncate">{selectedConv?.postTitle}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 p-0">
                  <ScrollArea className="h-[calc(100vh-400px)] p-4">
                    <div className="space-y-4">
                      {mockMessages.map((message) => (
                        <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.isOwn ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                            <p className={`text-xs mt-1 ${message.isOwn ? "text-blue-100" : "text-gray-500"}`}>
                              {message.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Escribe un mensaje..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Send className="h-8 w-8" />
                  </div>
                  <h3 className="font-medium mb-2">Selecciona una conversación</h3>
                  <p className="text-sm">Elige una conversación de la lista para comenzar a chatear</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
