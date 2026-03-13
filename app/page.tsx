'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Header() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const [nextBikeRide, setNextBikeRide] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('authToken')

    if (!token) {
      return
    }

    fetch('/api/neon', {
      method: 'POST',
      body: JSON.stringify({ action: 'verifyToken', token }),
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Invalid or expired token')
        }
        return res.json()
      })
      .then(data => {
        if (!data.user_id) {
          throw new Error('Invalid or expired token')
        }

        setIsLoggedIn(true)

        fetch('/api/neon', {
          method: 'POST',
          body: JSON.stringify({ action: 'getMembers' }),
        })
          .then(res => res.json())
          .then(members => {
            const member = members.find((m: any) => m.id === data.member_id)
            if (member) setUserName(member.name)
          })

        fetch('/api/neon', {
          method: 'POST',
          body: JSON.stringify({ action: 'getRides' }),
        })
          .then(res => res.json())
          .then(rides => {
            const now = new Date()
            const futureRides = rides
              .filter((ride: any) => new Date(ride.date) > now)
              .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

            if (futureRides.length > 0) {
              setNextBikeRide(futureRides[0].title)
            } else {
              setNextBikeRide(null)
            }
          })
          .catch(() => setNextBikeRide(null))
      })
      .catch(() => {
        localStorage.removeItem('authToken')
        setIsLoggedIn(false)
        setUserName('')
        setNextBikeRide(null)
      })
  }, [])

  function handleLogout() {
    setIsLoading(true)
    localStorage.removeItem('authToken')
    setIsLoggedIn(false)
    setUserName('')
    setNextBikeRide(null)
    setTimeout(() => {
      router.push('/')
      setIsLoading(false)
    }, 300)
  }

  function handleLoginClick() {
    setIsLoading(true)
    router.push('/auth/login')
  }

  return (
    <><header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 20px',
      borderBottom: '1px solid #ccc',
      backgroundColor: '#f9f9f9'
    }}>
      <h1 style={{ margin: 0, fontSize: '20px' }}>Lincoln Bike Club</h1>
      <nav style={{ display: 'flex', gap: '15px' }}>
        <Link href="/info" style={{ textDecoration: 'none', color: '#333' }}>Info</Link>
        {isLoggedIn && (
          <>
            <Link href="/gallery" style={{ textDecoration: 'none', color: '#333' }}>Gallery</Link>
            <Link href="/members" style={{ textDecoration: 'none', color: '#333' }}>Members</Link>
          </>
        )}
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            disabled={isLoading}
            style={{
              padding: '8px 15px',
              backgroundColor: isLoading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Logging out...' : 'Logout'}
          </button>
        ) : (
          <button
            onClick={handleLoginClick}
            disabled={isLoading}
            style={{
              padding: '8px 15px',
              backgroundColor: isLoading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              textDecoration: 'none'
            }}
          >
            {isLoading ? 'Loading...' : 'Login'}
          </button>
        )}
      </nav>
    </header><main style={{ padding: '20px' }}>
        <h2>Welcome to the Lincoln Bike Club!</h2>
        {isLoggedIn ? (
          <>
            <p>Hello, <strong>{userName || 'Member'}</strong>!</p>
            {nextBikeRide ? (
              <p>The next bike ride is the <strong>{nextBikeRide}</strong>.</p>
            ) : (
              <p>The next bike ride has not been set.</p>
            )}
          </>
        ) : (
          <p>Please log in to view more information!</p>
        )}
      </main></>
  )
}
