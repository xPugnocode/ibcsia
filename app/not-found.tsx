"use client"

import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '72px', margin: '0', color: '#333' }}>404</h1>
      <h2 style={{ fontSize: '24px', marginTop: '10px', color: '#666' }}>Page Not Found</h2>
      <p style={{ marginTop: '10px', color: '#888' }}>
        Sorry, we couldn&apos;t find the page you&apos;re looking for.
      </p>
      <button
        type="button"
        onClick={() => router.push('/')}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '4px'
        }}
      >
        Go back home
      </button>
    </div>
  )
}
