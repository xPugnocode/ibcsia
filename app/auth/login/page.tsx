'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isNavigatingToSignup, setIsNavigatingToSignup] = useState(false)
  const [isNavigatingBack, setIsNavigatingBack] = useState(false)
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

  function handleBack() {
    setIsNavigatingBack(true)
    router.push('/')
  }

  return (
    <div
      style={{
        padding: '20px',
        maxWidth: '400px',
        margin: '50px auto',
        backgroundColor: '#f9f9f9',
        border: '1px solid #e5e5e5',
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)'
      }}
    >
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
        disabled={isLoading || isNavigatingToSignup || isNavigatingBack}
        style={{
          width: '100%',
          padding: '8px',
          backgroundColor: isLoading || isNavigatingToSignup || isNavigatingBack ? '#6c757d' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          fontWeight: 500,
          lineHeight: '1.2',
          appearance: 'none',
          WebkitAppearance: 'none',
          cursor: isLoading || isNavigatingToSignup || isNavigatingBack ? 'not-allowed' : 'pointer'
        }}
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
      <p style={{ marginTop: '22px', marginBottom: '0', color: '#495057' }}>
        Don&apos;t have an account?
      </p>
      <button
        onClick={handleNavigateToSignup}
        disabled={isLoading || isNavigatingToSignup || isNavigatingBack}
        style={{
          width: '100%',
          padding: '8px',
          marginTop: '8px',
          backgroundColor: isLoading || isNavigatingToSignup || isNavigatingBack ? '#6c757d' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          fontWeight: 500,
          lineHeight: '1.2',
          appearance: 'none',
          WebkitAppearance: 'none',
          cursor: isLoading || isNavigatingToSignup || isNavigatingBack ? 'not-allowed' : 'pointer'
        }}
      >
        {isNavigatingToSignup ? 'Loading...' : 'Sign Up'}
      </button>
      <button
        onClick={handleBack}
        disabled={isLoading || isNavigatingToSignup || isNavigatingBack}
        style={{
          width: '100%',
          padding: '8px',
          marginTop: '10px',
          backgroundColor: isNavigatingBack ? '#495057' : '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          fontWeight: 500,
          lineHeight: '1.2',
          appearance: 'none',
          WebkitAppearance: 'none',
          cursor: isLoading || isNavigatingToSignup || isNavigatingBack ? 'not-allowed' : 'pointer'
        }}
      >
        {isNavigatingBack ? 'Returning to menu...' : 'Return to menu'}
      </button>
    </div>
  )
}