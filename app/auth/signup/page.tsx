'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSignup() {
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
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto' }}>
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
      <button onClick={handleSignup} style={{ width: '100%', padding: '8px' }}>
        Sign Up
      </button>
      <button onClick={() => router.push('/auth/login')} style={{ width: '100%', padding: '8px', marginTop: '10px' }}>
        Already have an account?<br></br>Login
      </button>
    </div>
  )
}