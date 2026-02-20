/**
 * Fixed background and fade overlay. Purely decorative, pointer-events-none.
 */
export default function BackgroundOverlay() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0" style={{ isolation: 'isolate' }}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/background.svg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, #000 0%, transparent 25%, transparent 85%, #000 100%)',
        }}
      />
    </div>
  )
}
