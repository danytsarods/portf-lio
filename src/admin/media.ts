/** Preparação de arquivos no navegador antes do envio (redimensiona fotos, gera capa de vídeo). */

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024

export type Encoded = { blob: Blob; width: number; height: number }

const toJpeg = (canvas: HTMLCanvasElement, quality = 0.86) =>
  new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Não foi possível gerar a imagem.'))),
      'image/jpeg',
      quality,
    ),
  )

function draw(source: CanvasImageSource, w: number, h: number, maxEdge: number) {
  const scale = Math.min(1, maxEdge / Math.max(w, h))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(w * scale)
  canvas.height = Math.round(h * scale)
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height)
  return canvas
}

/** Gera as versões grande (2400 px) e pequena (1200 px) de uma foto, em JPEG. */
export async function preparePhoto(file: File): Promise<{ large: Encoded; small: Encoded | null }> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new Error(`Não foi possível abrir “${file.name}”. Use JPG, PNG ou WEBP.`)
  }
  const largeCanvas = draw(bitmap, bitmap.width, bitmap.height, 2400)
  const large = { blob: await toJpeg(largeCanvas), width: largeCanvas.width, height: largeCanvas.height }
  let small: Encoded | null = null
  if (Math.max(large.width, large.height) > 1400) {
    const c = draw(bitmap, bitmap.width, bitmap.height, 1200)
    small = { blob: await toJpeg(c, 0.82), width: c.width, height: c.height }
  }
  bitmap.close()
  return { large, small }
}

/** Lê dimensões e duração de um vídeo e captura um quadro para a capa. */
export async function prepareVideo(
  file: File,
): Promise<{ width: number; height: number; duration: number; poster: Encoded | null }> {
  if (file.size > MAX_UPLOAD_BYTES)
    throw new Error(
      `“${file.name}” tem ${(file.size / 1024 / 1024).toFixed(0)} MB. O limite é 50 MB: exporte em 1080p ou 720p e tente de novo.`,
    )
  const url = URL.createObjectURL(file)
  const video = document.createElement('video')
  video.muted = true
  video.playsInline = true
  video.preload = 'auto'
  video.src = url
  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve()
      video.onerror = () =>
        reject(
          new Error(`O navegador não conseguiu ler “${file.name}”. Exporte o vídeo em MP4 (H.264) e tente de novo.`),
        )
    })
    const { videoWidth: width, videoHeight: height, duration } = video
    let poster: Encoded | null = null
    try {
      video.currentTime = Math.min(1, duration / 3)
      await new Promise<void>((resolve, reject) => {
        video.onseeked = () => resolve()
        setTimeout(() => reject(new Error('timeout')), 8000)
      })
      const canvas = draw(video, width, height, 1280)
      poster = { blob: await toJpeg(canvas, 0.84), width: canvas.width, height: canvas.height }
    } catch {
      poster = null
    }
    return { width, height, duration: Number.isFinite(duration) ? duration : 0, poster }
  } finally {
    URL.revokeObjectURL(url)
  }
}

export const extensionOf = (file: File) => {
  const fromName = file.name.split('.').pop()?.toLowerCase()
  if (fromName && /^[a-z0-9]{2,5}$/.test(fromName)) return fromName
  return file.type.split('/')[1] ?? 'bin'
}
