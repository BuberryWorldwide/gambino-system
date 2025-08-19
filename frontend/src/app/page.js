import Link from 'next/link'

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1f2937 0%, #000000 50%, #1f2937 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '600px', padding: '20px' }}>
        <h1 style={{
          fontSize: '4rem',
          fontWeight: 'bold',
          color: '#FFD700',
          marginBottom: '1.5rem'
        }}>
          🎲 GAMBINO
        </h1>
        <p style={{
          fontSize: '1.5rem',
          color: '#D1D5DB',
          marginBottom: '3rem'
        }}>
          Farm Luck. Mine Destiny.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link 
            href="/onboard"
            style={{
              backgroundColor: '#FFD700',
              color: '#000000',
              padding: '1rem 2rem',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            Get Started
          </Link>
          <button style={{
            border: '2px solid #FFD700',
            color: '#FFD700',
            backgroundColor: 'transparent',
            padding: '1rem 2rem',
            borderRadius: '0.5rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            Learn More
          </button>
        </div>
      </div>
    </div>
  )
}
