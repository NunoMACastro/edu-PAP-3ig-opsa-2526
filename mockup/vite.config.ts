import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
<<<<<<< HEAD
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

=======

// Figma asset resolver (mantido)
>>>>>>> 29b2b88 (update)
function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(process.cwd(), 'src/assets', filename)
      }
      return null
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    react(),
  ],

  resolve: {
    alias: {
<<<<<<< HEAD
      '@': path.resolve(__dirname, './src'),
    },
  },
=======
      '@': path.resolve(process.cwd(), './src'),
    },
  },

>>>>>>> 29b2b88 (update)
  assetsInclude: ['**/*.svg', '**/*.csv'],
})