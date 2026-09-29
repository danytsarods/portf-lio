/** Logo oficial (arquivo original, apenas com a margem transparente aparada). */
const RATIO = 1406 / 400

export function Brand({ height = 30, className = '' }: { height?: number; className?: string }) {
  const width = Math.round(height * RATIO)
  return (
    <img
      src="/brand/logo-480.png"
      srcSet="/brand/logo-240.png 240w, /brand/logo-480.png 480w, /brand/logo-960.png 960w"
      sizes={`${width}px`}
      width={width}
      height={height}
      alt="RODS AUDIOVISUAL"
      decoding="async"
      className={`block h-auto select-none ${className}`}
      style={{ width, maxWidth: '100%' }}
      draggable={false}
    />
  )
}
