import sql from '@/lib/db'
import { NextResponse } from 'next/server';


export async function initializeDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        role TEXT DEFAULT 'member',
        is_active BOOLEAN DEFAULT true,
        carpool_can_drive BOOLEAN DEFAULT false,
        carpool_seats_available INTEGER DEFAULT 0,
        carpool_needs_ride BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS emergency_contacts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        member_id UUID REFERENCES members(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        relationship TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS waivers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        member_id UUID UNIQUE REFERENCES members(id) ON DELETE CASCADE,
        signed_date TIMESTAMP NOT NULL,
        document_data BYTEA,
        is_valid BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS rides (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        date TIMESTAMP NOT NULL,
        meeting_location TEXT NOT NULL,
        destination TEXT,
        distance_miles DECIMAL,
        difficulty TEXT,
        max_participants INTEGER,
        status TEXT DEFAULT 'proposed',
        created_by UUID REFERENCES members(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS ride_votes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
        member_id UUID REFERENCES members(id) ON DELETE CASCADE,
        vote BOOLEAN NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(ride_id, member_id)
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS ride_participants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
        member_id UUID REFERENCES members(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'registered',
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(ride_id, member_id)
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS media (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
        uploaded_by UUID REFERENCES members(id),
        blob_url TEXT NOT NULL,
        caption TEXT,
        tags TEXT[],
        visibility TEXT DEFAULT 'members',
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    console.log('Database initialized successfully!')
    return true
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  }
}

export async function getMembers() {
  try {
    const members = await sql`SELECT * FROM members ORDER BY last_name`
    return members
  } catch (error) {
    console.error('Error fetching members:', error)
    throw error
  }
}

export async function createMember(data: {
  email: string
  first_name: string
  last_name: string
  phone?: string
  address?: string
  role?: string
}) {
  try {
    const result = await sql`
      INSERT INTO members (email, first_name, last_name, phone, address, role)
      VALUES (${data.email}, ${data.first_name}, ${data.last_name}, ${data.phone || null}, ${data.address || null}, ${data.role || 'member'})
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error('Error creating member:', error)
    throw error
  }
}

export async function updateMember(id: string, data: {
  email?: string
  first_name?: string
  last_name?: string
  phone?: string
  address?: string
  role?: string
}) {
  try {
    const result = await sql`
      UPDATE members 
      SET 
        email = COALESCE(${data.email || null}, email),
        first_name = COALESCE(${data.first_name || null}, first_name),
        last_name = COALESCE(${data.last_name || null}, last_name),
        phone = COALESCE(${data.phone || null}, phone),
        address = COALESCE(${data.address || null}, address),
        role = COALESCE(${data.role || null}, role),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error('Error updating member:', error)
    throw error
  }
}

export async function deleteMember(id: string) {
  try {
    await sql`DELETE FROM members WHERE id = ${id}`
    return true
  } catch (error) {
    console.error('Error deleting member:', error)
    throw error
  }
}

export async function POST(request: Request) {
  try {
    const { action, ...data } = await request.json()

    if (action === 'init') {
      await initializeDatabase()
      return NextResponse.json({ success: true, message: 'Database initialized' })
    }

    if (action === 'getMembers') {
      const members = await getMembers()
      return NextResponse.json(members)
    }

    if (action === 'createMember') {
      const member = await createMember(data)
      return NextResponse.json(member)
    }

    if (action === 'updateMember') {
      const member = await updateMember(data.id, data)
      return NextResponse.json(member)
    }

    if (action === 'deleteMember') {
      await deleteMember(data.id)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export default sql