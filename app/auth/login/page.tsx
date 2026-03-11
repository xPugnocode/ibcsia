'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isNavigatingToSignup, setIsNavigatingToSignup] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    const trimmedEmail = email.trim()
    const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!basicEmailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/neon', {
        method: 'POST',
        body: JSON.stringify({ action: 'login', email: trimmedEmail, password }),
      })
      const data = await res.json()
      
      if (data.error) {
        setError(data.error)
        return
      }

      localStorage.setItem('authToken', data.token)
      router.push('/')
    } catch (err) {
      setError('Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  function handleNavigateToSignup() {
    setIsNavigatingToSignup(true)
    router.push('/auth/signup')
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto' }}>
      <h1>Login</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ marginBottom: '10px' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '8px' }}
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '8px' }}
        />
      </div>
      <button
        onClick={handleLogin}
        disabled={isLoading || isNavigatingToSignup}
        style={{
          width: '100%',
          padding: '8px',
          backgroundColor: isLoading || isNavigatingToSignup ? '#6c757d' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading || isNavigatingToSignup ? 'not-allowed' : 'pointer',
          opacity: isLoading || isNavigatingToSignup ? 0.7 : 1
        }}
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
      <button
        onClick={handleNavigateToSignup}
        disabled={isLoading || isNavigatingToSignup}
        style={{
          width: '100%',
          padding: '8px',
          marginTop: '10px',
          backgroundColor: isLoading || isNavigatingToSignup ? '#6c757d' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading || isNavigatingToSignup ? 'not-allowed' : 'pointer',
          opacity: isLoading || isNavigatingToSignup ? 0.7 : 1
        }}
      >
        {isNavigatingToSignup ? 'Loading...' : <><span>Don't have an account?</span><br></br><span>Sign Up</span></>}
      </button>
    </div>
  )
}