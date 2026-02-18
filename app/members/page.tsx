'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Member {
  id: string
  name: string
  email: string
  phone_number?: string
  address?: string
  role: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relationship?: string
  waiver_signed: boolean
  waiver_signed_date?: string
  waiver_document_url?: string
  is_active: boolean
}

export default function MembersPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUserRole, setCurrentUserRole] = useState<string>('member')
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [members, setMembers] = useState<Member[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const token = localStorage.getItem('authToken')
    if (!token) {
      router.push('/auth/login')
      return
    }

    try {
      // Verify token and get user info
      const response = await fetch('/api/neon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verifyToken', token })
      })
      const data = await response.json()
      
      if (data.member_id) {
        setCurrentUserId(data.member_id)
        setIsLoggedIn(true)
        
        // Get member details to check role
        const membersResponse = await fetch('/api/neon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getMembers' })
        })
        const membersData = await membersResponse.json()
        setMembers(membersData)
        
        const currentMember = membersData.find((m: Member) => m.id === data.member_id)
        if (currentMember) {
          setCurrentUserRole(currentMember.role || 'member')
        }
      }
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/auth/login')
    } finally {
      setIsLoading(false)
    }
  }

  const isLeader = currentUserRole === 'leader' || currentUserRole === 'admin'

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
        <h1 style={{ margin: 0, fontSize: '24px' }}>Member Directory</h1>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          {isLeader && (
            <button
              onClick={() => setShowAddModal(true)}
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
              + Add Member
            </button>
          )}
          
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
      <div style={{ marginBottom: '20px' }}>
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
      </div>

      {/* Members List */}
      <div style={{ marginTop: '20px' }}>
        <p style={{ color: '#666', marginBottom: '10px' }}>
          {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''} found
        </p>
        
        <div style={{
          display: 'grid',
          gap: '15px',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
        }}>
          {filteredMembers.map(member => (
            <div
              key={member.id}
              style={{
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: member.id === currentUserId ? '#e7f3ff' : 'white'
              }}
            >
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>
                {member.name}
                {member.id === currentUserId && (
                  <span style={{ marginLeft: '8px', fontSize: '14px', color: '#007bff' }}>
                    (You)
                  </span>
                )}
              </h3>
                <p style={{ margin: '5px 0', color: '#666' }}>{member.email}</p>
                <p style={{ margin: '5px 0', color: '#666' }}>
                {member.phone_number ? member.phone_number.replace(/(\d{3})(\d{3})(\d{4})/,"($1) $2-$3") : 'Phone number not provided'}
                </p>
              <p style={{
                margin: '10px 0 0 0',
                fontSize: '12px',
                color: member.role === 'leader' || member.role === 'admin' ? '#28a745' : '#6c757d',
                fontWeight: 'bold',
                textTransform: 'capitalize'
              }}>
                {member.role}
              </p>
              
              {(isLeader || member.id === currentUserId) && (
                <button
                  style={{
                    marginTop: '10px',
                    padding: '6px 12px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  View/Edit Details
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
