import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import fs from 'node:fs';
import path from 'node:path';
import serveStatic from 'serve-static';

const cesiumBuildRoot = 'node_modules/cesium/Build';
const cesiumBuildPath = path.join(cesiumBuildRoot, 'Cesium');
const cesiumStaticFolders = ['Assets', 'ThirdParty', 'Workers', 'Widgets'];
const cesiumBaseUrl = 'Cesium';

const cesiumStatic = () => {
  let outDir;
  return {
    name: 'cesium-static',
    configResolved(config) {
      outDir = config.build.outDir;
    },
    configureServer({ middlewares }) {
      const cesiumPath = path.join(cesiumBuildRoot, 'CesiumUnminified');
      middlewares.use(
        '/' + cesiumBaseUrl,
        serveStatic(cesiumPath, {
          setHeaders: (res) => res.setHeader('Access-Control-Allow-Origin', '*')
        })
      );
    },
    closeBundle() {
      if (!fs.existsSync(cesiumBuildPath)) return;
      const target = path.join(outDir, cesiumBaseUrl);
      for (const folder of cesiumStaticFolders) {
        fs.cpSync(path.join(cesiumBuildPath, folder), path.join(target, folder), { recursive: true });
      }
    }
  };
}

export default defineConfig({
  integrations: [react()],
  trailingSlash: 'never',
  vite: {
    plugins: [cesiumStatic()],
    optimizeDeps: {
      exclude: ['cesium'],
      include: ['mersenne-twister', 'grapheme-splitter', 'urijs', 'bitmap-sdf', 'lerc', 'nosleep.js']
    },
    build: {
      assetsInlineLimit: 0
    }
  }
});
