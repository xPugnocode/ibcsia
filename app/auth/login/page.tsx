'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleLogin() {
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
    }
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
      <button onClick={handleLogin} style={{ width: '100%', padding: '8px' }}>
        Login
      </button>
      <button onClick={() => router.push('/auth/signup')} style={{ width: '100%', padding: '8px', marginTop: '10px' }}>
        Don't have an account?<br></br>Sign Up
      </button>
    </div>
  )
}