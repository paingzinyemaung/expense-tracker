import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Expense Tracker',
        short_name: 'Expense',
        description:
          'ဝင်ငွေ၊ ထွက်ငွေ မှတ်တမ်းတင်ပြီး လစဉ် အနှစ်ချုပ်ကြည့်နိုင်သော app',
        lang: 'my',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#fcfcf9',
        background_color: '#fcfcf9',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          {
            name: 'မှတ်တမ်းထည့်မည်',
            short_name: 'ထည့်မည်',
            url: '/transactions?add=1',
            icons: [
              {
                src: 'shortcut-add-96x96.png',
                sizes: '96x96',
                type: 'image/png',
              },
            ],
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
