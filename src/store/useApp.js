import { create } from 'zustand'

/**
 * Estado global de la aplicación.
 * `isReady` indica si la primera sincronización con Supabase ya terminó.
 * Se usa para mostrar skeletons en lugar del mensaje "sin productos"
 * mientras los datos están siendo descargados.
 */
export const useApp = create((set) => ({
  isReady: false,
  setReady: () => set({ isReady: true }),
}))
