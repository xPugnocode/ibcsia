'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GalleryPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      router.push('/auth/login')
    } else {
      setIsLoading(false)
    }
  }, [router])

  if (isLoading) {
    return (
      <main style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading...</p>
      </main>
    )
  }

  return (
    <main style={{ padding: '20px' }}>
      <h1>Gallery</h1>
      <p>ts the gallery</p>
      <a href="/">Go back to home</a>
    </main>
  )
}
