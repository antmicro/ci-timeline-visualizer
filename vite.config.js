import { defineConfig } from "vite"
// vite.config.js
export default defineConfig({
    server: {
        port: 5500
    },
    preview: {
        port: 5500
    },
    build: {
        target: 'esnext',
        outDir: './build',
        lib: {
            entry: [
                './ci-timeline-visualizer.js',
                './ci-timeline-visualizer.css'
            ],
            formats: ['es'],
            name: 'ci-timeline-visualizer',
            fileName: 'ci-timeline-visualizer'
        },
        rollupOptions: {
            output: {
                assetFileNames: 'ci-timeline-visualizer.css'
            }
        }
    }
})