import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const htmlPath = resolve(root, 'public', 'informe-dashboard.html')
const pdfPath = resolve(root, 'public', 'informe-dashboard.pdf')

if (!existsSync(htmlPath)) {
  console.error(`[ERROR] No existe: ${htmlPath}`)
  process.exit(1)
}

const url = pathToFileURL(htmlPath).href
console.log(`[pdf] Renderizando: ${url}`)

// En Windows, puppeteer.launch() suele fallar con `spawn UNKNOWN` (errno -4094)
// cuando se invoca desde shells basados en MSYS/Git-Bash. Usamos Chrome/Edge
// headless por CLI como fallback robusto.
const candidates = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
].filter(Boolean)

const chrome = candidates.find((p) => existsSync(p))
if (!chrome) {
  console.error('[ERROR] No se encontró Chrome ni Edge. Define CHROME_PATH.')
  process.exit(1)
}

console.log(`[pdf] Browser: ${chrome}`)

execFileSync(chrome, [
  '--headless',
  '--disable-gpu',
  '--no-sandbox',
  '--no-pdf-header-footer',
  `--print-to-pdf=${pdfPath}`,
  url,
], { stdio: 'inherit' })

console.log(`[pdf] Generado: ${pdfPath}`)
