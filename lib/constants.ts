// Configuraciones para producción
export const APP_CONFIG = {
  name: "VeciNet",
  description: "Tu red de vecinos",
  url: process.env.NEXTAUTH_URL || "https://vecinet.vercel.app",
  version: "1.0.0",
  maxImageSize: 5 * 1024 * 1024, // 5MB
  maxImagesPerPost: 4,
  defaultRadius: 5, // km
  maxRadius: 20, // km
}

export const MADRID_POSTAL_CODES = {
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
