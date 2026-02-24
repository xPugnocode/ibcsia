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
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<Member>>({})
  const [addFormData, setAddFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    role: 'member'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [addError, setAddError] = useState('')

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

  function handleEditClick(member: Member) {
    if ((isLeader || member.id === currentUserId)) {
      setEditingMember(member)
      setEditFormData({ ...member })
      setSubmitError('')
      setShowEditModal(true)
    }
  }

  async function handleEditSubmit() {
    if (!editingMember) return
    
    setIsSubmitting(true)
    setSubmitError('')
    
    try {
      const response = await fetch('/api/neon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateMember',
          id: editingMember.id,
          ...editFormData
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setSubmitError(data.error || 'Failed to update member')
        return
      }
      
      // Update members list with new data
      setMembers(members.map(m => m.id === editingMember.id ? data : m))
      setShowEditModal(false)
      setEditingMember(null)
      setEditFormData({})
    } catch (error) {
      setSubmitError('An error occurred while updating the member')
      console.error('Update error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleEditInputChange(field: string, value: any) {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  function handleAddInputChange(field: string, value: any) {
    setAddFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  async function handleAddSubmit() {
    setIsSubmitting(true)
    setAddError('')

    // Validation
    if (!addFormData.name.trim() || !addFormData.email.trim()) {
      setAddError('Name and email are required')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/neon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createMember',
          ...addFormData
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setAddError(data.error || 'Failed to add member')
        setIsSubmitting(false)
        return
      }

      // Add new member to the list
      setMembers([...members, data])
      setShowAddModal(false)
      setAddFormData({
        name: '',
        email: '',
        phone_number: '',
        address: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relationship: '',
        role: 'member'
      })
    } catch (error) {
      setAddError('An error occurred while adding the member')
      console.error('Add member error:', error)
    } finally {
      setIsSubmitting(false)
    }
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
                  onClick={() => handleEditClick(member)}
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

      {/* Edit Member Modal */}
      {showEditModal && editingMember && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Edit Member Information</h2>
            
            {submitError && (
              <div style={{
                backgroundColor: '#f8d7da',
                color: '#721c24',
                padding: '12px',
                borderRadius: '4px',
                marginBottom: '15px',
                border: '1px solid #f5c6cb'
              }}>
                {submitError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {/* Name */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={editFormData.name || ''}
                  onChange={(e) => handleEditInputChange('name', e.target.value)}
                  disabled={currentUserRole !== 'admin' && currentUserRole !== 'leader'}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    opacity: currentUserRole !== 'admin' && currentUserRole !== 'leader' ? 0.6 : 1
                  }}
                />
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={editFormData.email || ''}
                  onChange={(e) => handleEditInputChange('email', e.target.value)}
                  disabled={currentUserRole !== 'admin' && currentUserRole !== 'leader'}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    opacity: currentUserRole !== 'admin' && currentUserRole !== 'leader' ? 0.6 : 1
                  }}
                />
              </div>

              {/* Phone Number */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editFormData.phone_number || ''}
                  onChange={(e) => handleEditInputChange('phone_number', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Address */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Address
                </label>
                <input
                  type="text"
                  value={editFormData.address || ''}
                  onChange={(e) => handleEditInputChange('address', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Emergency Contact Name */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  value={editFormData.emergency_contact_name || ''}
                  onChange={(e) => handleEditInputChange('emergency_contact_name', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Emergency Contact Phone */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  value={editFormData.emergency_contact_phone || ''}
                  onChange={(e) => handleEditInputChange('emergency_contact_phone', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Emergency Contact Relationship */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Emergency Contact Relationship
                </label>
                <input
                  type="text"
                  value={editFormData.emergency_contact_relationship || ''}
                  onChange={(e) => handleEditInputChange('emergency_contact_relationship', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Role - Admin/Leader only */}
              {isLeader && (
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Role
                  </label>
                  <select
                    value={editFormData.role || 'member'}
                    onChange={(e) => handleEditInputChange('role', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="member">Member</option>
                    <option value="leader">Leader</option>
                    {currentUserRole === 'admin' && <option value="admin">Admin</option>}
                  </select>
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  onClick={handleEditSubmit}
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    opacity: isSubmitting ? 0.6 : 1
                  }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.6 : 1
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Add New Member</h2>
            
            {addError && (
              <div style={{
                backgroundColor: '#f8d7da',
                color: '#721c24',
                padding: '12px',
                borderRadius: '4px',
                marginBottom: '15px',
                border: '1px solid #f5c6cb'
              }}>
                {addError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {/* Name */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Name <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <input
                  type="text"
                  value={addFormData.name}
                  onChange={(e) => handleAddInputChange('name', e.target.value)}
                  placeholder="Enter member name"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Email - for account linking */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Email <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666' }}>
                  This email will be used to link their account later
                </p>
                <input
                  type="email"
                  value={addFormData.email}
                  onChange={(e) => handleAddInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Phone Number */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={addFormData.phone_number}
                  onChange={(e) => handleAddInputChange('phone_number', e.target.value)}
                  placeholder="(123) 456-7890"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Address */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Address
                </label>
                <input
                  type="text"
                  value={addFormData.address}
                  onChange={(e) => handleAddInputChange('address', e.target.value)}
                  placeholder="Enter address"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Emergency Contact Name */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  value={addFormData.emergency_contact_name}
                  onChange={(e) => handleAddInputChange('emergency_contact_name', e.target.value)}
                  placeholder="Enter emergency contact name"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Emergency Contact Phone */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  value={addFormData.emergency_contact_phone}
                  onChange={(e) => handleAddInputChange('emergency_contact_phone', e.target.value)}
                  placeholder="(123) 456-7890"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Emergency Contact Relationship */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Emergency Contact Relationship
                </label>
                <input
                  type="text"
                  value={addFormData.emergency_contact_relationship}
                  onChange={(e) => handleAddInputChange('emergency_contact_relationship', e.target.value)}
                  placeholder="Enter relation to emergency contact"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Role */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Role
                </label>
                <select
                  value={addFormData.role}
                  onChange={(e) => handleAddInputChange('role', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="member">Member</option>
                  <option value="leader">Leader</option>
                  {currentUserRole === 'admin' && <option value="admin">Admin</option>}
                </select>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  onClick={handleAddSubmit}
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    opacity: isSubmitting ? 0.6 : 1
                  }}
                >
                  {isSubmitting ? 'Adding...' : 'Add Member'}
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setAddError('')
                    setAddFormData({
                      name: '',
                      email: '',
                      phone_number: '',
                      address: '',
                      emergency_contact_name: '',
                      emergency_contact_phone: '',
                      emergency_contact_relationship: '',
                      role: 'member'
                    })
                  }}
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.6 : 1
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
