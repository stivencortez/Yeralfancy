// Script para generar íconos PWA básicos
// Ejecutar con: node generar-iconos.mjs
// Los íconos se crean como SVG válidos que los navegadores pueden usar

import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const svgIcon = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#9B7B5B"/>
  <text x="${size / 2}" y="${size * 0.65}" font-family="Georgia, serif" font-size="${size * 0.38}" font-weight="bold" fill="white" text-anchor="middle">YF</text>
</svg>`

writeFileSync(join(__dirname, 'public/icons/pwa-192x192.svg'), svgIcon(192))
writeFileSync(join(__dirname, 'public/icons/pwa-512x512.svg'), svgIcon(512))

console.log('Íconos SVG generados en public/icons/')
console.log('Para usar íconos PNG reales, reemplaza los archivos con PNG de 192x192 y 512x512 píxeles.')
