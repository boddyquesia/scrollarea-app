"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Eye, ImageIcon } from "lucide-react"
import ImageViewer from "./image-viewer"

interface PostImagesProps {
  images: string[]
  postTitle?: string
}

export default function PostImages({ images, postTitle }: PostImagesProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  if (!images || images.length === 0) return null

  const openViewer = (index: number) => {
    setSelectedImageIndex(index)
    setIsViewerOpen(true)
  }

  const renderImageGrid = () => {
    if (images.length === 1) {
      return (
        <div className="relative group cursor-pointer" onClick={() => openViewer(0)}>
          <img
            src={images[0] || "/placeholder.svg"}
            alt={postTitle || "Imagen"}
            className="rounded-lg object-cover w-full h-64 transition-transform group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="secondary" size="sm" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>Ver imagen</span>
              </Button>
            </div>
          </div>
        </div>
      )
    }

    if (images.length === 2) {
      return (
        <div className="grid grid-cols-2 gap-2">
          {images.map((image, index) => (
            <div key={index} className="relative group cursor-pointer" onClick={() => openViewer(index)}>
              <img
                src={image || "/placeholder.svg"}
                alt={`${postTitle || "Imagen"} ${index + 1}`}
                className="rounded-lg object-cover w-full h-32 transition-transform group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (images.length === 3) {
      return (
        <div className="grid grid-cols-2 gap-2">
          <div className="relative group cursor-pointer" onClick={() => openViewer(0)}>
            <img
              src={images[0] || "/placeholder.svg"}
              alt={`${postTitle || "Imagen"} 1`}
              className="rounded-lg object-cover w-full h-40 transition-transform group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          <div className="grid grid-rows-2 gap-2">
            {images.slice(1, 3).map((image, index) => (
              <div key={index + 1} className="relative group cursor-pointer" onClick={() => openViewer(index + 1)}>
                <img
                  src={image || "/placeholder.svg"}
                  alt={`${postTitle || "Imagen"} ${index + 2}`}
                  className="rounded-lg object-cover w-full h-[76px] transition-transform group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    // 4 o más imágenes
    return (
      <div className="grid grid-cols-2 gap-2">
        {images.slice(0, 3).map((image, index) => (
          <div key={index} className="relative group cursor-pointer" onClick={() => openViewer(index)}>
            <img
              src={image || "/placeholder.svg"}
              alt={`${postTitle || "Imagen"} ${index + 1}`}
              className="rounded-lg object-cover w-full h-32 transition-transform group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        ))}
        {images.length > 3 && (
          <div className="relative group cursor-pointer" onClick={() => openViewer(3)}>
            <img
              src={images[3] || "/placeholder.svg"}
              alt={`${postTitle || "Imagen"} 4`}
              className="rounded-lg object-cover w-full h-32 transition-transform group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors rounded-lg flex items-center justify-center">
              <div className="text-white text-center">
                <ImageIcon className="h-6 w-6 mx-auto mb-1" />
                <span className="text-sm font-medium">+{images.length - 3} más</span>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="mb-4">{renderImageGrid()}</div>
      <ImageViewer
        images={images}
        initialIndex={selectedImageIndex}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />
    </>
  )
}
