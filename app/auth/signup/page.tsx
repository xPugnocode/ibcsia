'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isNavigatingToLogin, setIsNavigatingToLogin] = useState(false)
  const [isNavigatingBack, setIsNavigatingBack] = useState(false)
  const router = useRouter()

  async function handleSignup() {
    setIsLoading(true)

    try {
      const res = await fetch('/api/neon', {
        method: 'POST',
        body: JSON.stringify({ action: 'signup', name, email, password }),
      })
      const data = await res.json()
      
      if (data.error) {
        setError(data.error)
        return
      }
    } catch (err) {
      setError('Signup failed')
    }
    try {
      const res = await fetch('/api/neon', {
        method: 'POST',
        body: JSON.stringify({ action: 'login', email, password }),
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

  function handleNavigateToLogin() {
    setIsNavigatingToLogin(true)
    router.push('/auth/login')
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
      <h1>Sign Up</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: '100%', padding: '8px' }}
        />
      </div>
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
        onClick={handleSignup}
        disabled={isLoading || isNavigatingToLogin || isNavigatingBack}
        style={{
          width: '100%',
          padding: '8px',
          backgroundColor: isLoading || isNavigatingToLogin || isNavigatingBack ? '#6c757d' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          fontWeight: 500,
          lineHeight: '1.2',
          appearance: 'none',
          WebkitAppearance: 'none',
          cursor: isLoading || isNavigatingToLogin || isNavigatingBack ? 'not-allowed' : 'pointer'
        }}
      >
        {isLoading ? 'Signing up...' : 'Sign Up'}
      </button>
      <p style={{ marginTop: '22px', marginBottom: '0', color: '#495057' }}>
        Already have an account?
      </p>
      <button
        onClick={handleNavigateToLogin}
        disabled={isLoading || isNavigatingToLogin || isNavigatingBack}
        style={{
          width: '100%',
          padding: '8px',
          marginTop: '8px',
          backgroundColor: isLoading || isNavigatingToLogin || isNavigatingBack ? '#6c757d' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          fontWeight: 500,
          lineHeight: '1.2',
          appearance: 'none',
          WebkitAppearance: 'none',
          cursor: isLoading || isNavigatingToLogin || isNavigatingBack ? 'not-allowed' : 'pointer'
        }}
      >
        {isNavigatingToLogin ? 'Loading...' : 'Login'}
      </button>
      <button
        onClick={handleBack}
        disabled={isLoading || isNavigatingToLogin || isNavigatingBack}
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
          cursor: isLoading || isNavigatingToLogin || isNavigatingBack ? 'not-allowed' : 'pointer'
        }}
      >
        {isNavigatingBack ? 'Returning to menu...' : 'Return to menu'}
      </button>
    </div>
  )
}