/**
 * Coordena a reprodução: apenas um <video> toca por vez no site inteiro.
 * Quando um vídeo começa, todos os outros registrados são pausados.
 */
const players = new Set<HTMLVideoElement>()

export function registerPlayer(video: HTMLVideoElement) {
  players.add(video)
  const onPlay = () => players.forEach((p) => p !== video && !p.paused && p.pause())
  video.addEventListener('play', onPlay)
  return () => {
    video.removeEventListener('play', onPlay)
    players.delete(video)
  }
}

export function pauseAll() {
  players.forEach((p) => p.pause())
}
