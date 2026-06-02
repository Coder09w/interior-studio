export default function Loading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #F5F0E8 0%, #EDE5D8 50%, #F0E8DC 100%)',
      }}
    >
      <div className="text-center">
        {/* Animated room icon with glow */}
        <div
          className="loader-glow mx-auto mb-4"
          style={{
            width: '72px', height: '72px',
            borderRadius: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #C17F4E, #A86A3D)',
            boxShadow: '0 4px 20px rgba(193,127,78,0.25)',
          }}
        >
          <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" />
            <path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0Z" />
            <path d="M4 18v2" />
            <path d="M20 18v2" />
          </svg>
        </div>

        {/* Animated brand text */}
        <h2 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '1.1rem',
          fontWeight: 700,
          color: '#2D2D2D',
          marginBottom: '12px',
        }}>
          <span className="loader-letter" style={{ animationDelay: '0s' }}>I</span>
          <span className="loader-letter" style={{ animationDelay: '0.06s' }}>n</span>
          <span className="loader-letter" style={{ animationDelay: '0.12s' }}>s</span>
          <span className="loader-letter" style={{ animationDelay: '0.18s' }}>t</span>
          <span className="loader-letter" style={{ animationDelay: '0.24s' }}>o</span>
          <span className="loader-letter" style={{ animationDelay: '0.3s' }}>d</span>
        </h2>

        {/* Pulsing dots */}
        <div className="loader-dot-pulse" style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}
