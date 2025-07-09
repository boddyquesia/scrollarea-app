"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navigation, MapPin, Loader2, CheckCircle } from "lucide-react"

interface UserLocation {
  lat: number
  lng: number
  postalCode?: string
  area?: string
  method: "gps" | "postal" | "none"
}

interface LocationSettingsProps {
  currentLocation: UserLocation
  onLocationUpdate: (location: UserLocation) => void
  onClose: () => void
  isLoading: boolean
  onGetCurrentLocation: () => void
  postalCodeCoordinates: Record<string, { lat: number; lng: number; area: string }>
}

export default function LocationSettings({
  currentLocation,
  onLocationUpdate,
  onClose,
  isLoading,
  onGetCurrentLocation,
  postalCodeCoordinates,
}: LocationSettingsProps) {
  const [selectedMethod, setSelectedMethod] = useState<"gps" | "postal">(
    currentLocation.method === "none" ? "gps" : currentLocation.method,
  )
  const [postalCode, setPostalCode] = useState(currentLocation.postalCode || "")
  const [customPostalCode, setCustomPostalCode] = useState("")

  const handlePostalCodeSubmit = () => {
    const code = postalCode || customPostalCode
    if (code && postalCodeCoordinates[code]) {
      const coords = postalCodeCoordinates[code]
      const newLocation: UserLocation = {
        lat: coords.lat,
        lng: coords.lng,
        postalCode: code,
        area: coords.area,
        method: "postal",
      }
      onLocationUpdate(newLocation)
    } else {
      // Mostrar error - código postal no válido
      alert("Código postal no válido. Por favor, ingresa un código postal de Madrid.")
    }
  }

  const availablePostalCodes = Object.keys(postalCodeCoordinates)

  return (
    <div className="space-y-6">
      {/* Current Location Display */}
      {currentLocation.method !== "none" && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 text-green-700 mb-2">
            <CheckCircle className="h-4 w-4" />
            <span className="font-medium">Ubicación actual</span>
          </div>
          <p className="text-sm text-green-600">
            {currentLocation.area}
            {currentLocation.postalCode && ` (CP: ${currentLocation.postalCode})`}
          </p>
          <p className="text-xs text-green-500 mt-1">
            Método: {currentLocation.method === "gps" ? "GPS" : "Código Postal"}
          </p>
        </div>
      )}

      {/* Method Selection */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Método de ubicación</Label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant={selectedMethod === "gps" ? "default" : "outline"}
            onClick={() => setSelectedMethod("gps")}
            className="flex flex-col items-center gap-2 h-auto py-4"
          >
            <Navigation className="h-5 w-5" />
            <span className="text-sm">GPS Automático</span>
          </Button>
          <Button
            variant={selectedMethod === "postal" ? "default" : "outline"}
            onClick={() => setSelectedMethod("postal")}
            className="flex flex-col items-center gap-2 h-auto py-4"
          >
            <MapPin className="h-5 w-5" />
            <span className="text-sm">Código Postal</span>
          </Button>
        </div>
      </div>

      {/* GPS Method */}
      {selectedMethod === "gps" && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 mb-3">
              Usaremos tu ubicación actual para mostrarte posts cercanos con mayor precisión.
            </p>
            <Button onClick={onGetCurrentLocation} disabled={isLoading} className="w-full flex items-center gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Obteniendo ubicación...</span>
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4" />
                  <span>Usar mi ubicación actual</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Postal Code Method */}
      {selectedMethod === "postal" && (
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Selecciona tu código postal</Label>
            <Select value={postalCode} onValueChange={setPostalCode}>
              <SelectTrigger>
                <SelectValue placeholder="Elige un código postal de Madrid" />
              </SelectTrigger>
              <SelectContent>
                {availablePostalCodes.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code} - {postalCodeCoordinates[code].area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">O</span>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Ingresa otro código postal</Label>
            <Input
              placeholder="Ej: 28001"
              value={customPostalCode}
              onChange={(e) => setCustomPostalCode(e.target.value)}
              maxLength={5}
            />
            <p className="text-xs text-gray-500 mt-1">Solo códigos postales de Madrid (28001-28999)</p>
          </div>

          <Button onClick={handlePostalCodeSubmit} disabled={!postalCode && !customPostalCode} className="w-full">
            Confirmar ubicación
          </Button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
          Cancelar
        </Button>
        {currentLocation.method !== "none" && (
          <Button
            variant="destructive"
            onClick={() => {
              onLocationUpdate({ lat: 0, lng: 0, method: "none" })
              localStorage.removeItem("vecinetLocation")
            }}
            className="flex-1"
          >
            Limpiar ubicación
          </Button>
        )}
      </div>
    </div>
  )
}
