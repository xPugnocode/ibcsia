'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GalleryPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const runAuthCheck = async () => {
      const token = localStorage.getItem('authToken')
      if (!token) {
        router.push('/auth/login')
        return
      }

      try {
        const response = await fetch('/api/neon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'verifyToken', token })
        })
        const data = await response.json()

        if (!response.ok || !data.member_id) {
          localStorage.removeItem('authToken')
          router.push('/auth/login')
          return
        }

        setIsLoading(false)
      } catch {
        localStorage.removeItem('authToken')
        router.push('/auth/login')
      }
    }

    void runAuthCheck()
  }, [router])

  if (isLoading) {
    return (
      <main style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading...</p>
      </main>
    )
  }

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <main style={{ padding: '20px' }}>
      {/* Navigation/Action Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Gallery</h1>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => console.log("button pressed fr  ")}
            style={{
              padding: '8px 15px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            + Add Media
          </button>
          
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '8px 15px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Return to Menu
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {/* <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search members by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        />
      </div> */}
    </main>
  )
}
