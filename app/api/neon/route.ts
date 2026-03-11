import sql from '@/lib/db'
import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'

function getUniqueConstraintMessage(error: unknown): string | null {
  const dbError = error as { code?: string; constraint?: string; detail?: string }

  if (dbError?.code !== '23505') {
    return null
  }

  const constraint = dbError.constraint || 'unknown'

  if (constraint === 'users_member_id_key') {
    return 'Email has already been used'
  }

  if (constraint === 'members_name_unique') {
    return 'Name has already been used'
  }

  return 'Value already exists'
}

export async function initializeDatabase() {
  try {
    // Members table
    await sql`
      CREATE TABLE IF NOT EXISTS members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone_number TEXT,
        address TEXT,
        role TEXT DEFAULT 'member',
        is_active BOOLEAN DEFAULT true,
        emergency_contact_name TEXT,
        emergency_contact_phone TEXT,
        emergency_contact_relationship TEXT,
        waiver_signed BOOLEAN DEFAULT false,
        waiver_signed_date TIMESTAMP,
        waiver_document_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Ensure name is unique for existing databases
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'members_name_unique'
        ) THEN
          ALTER TABLE members
          ADD CONSTRAINT members_name_unique UNIQUE (name);
        END IF;
      END$$;
    `

    // Rides table
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

    // Media table
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

    // Users table for authentication
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        member_id UUID UNIQUE REFERENCES members(id) ON DELETE CASCADE,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    console.log('Database initialized successfully!')
    return true
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  }
}

export async function signup(data: { email: string; password: string; name: string }) {
  try {
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Check if member already exists
    const existingMember = await sql`
      SELECT id FROM members WHERE email = ${data.email}
    `

    let memberId

    if (existingMember[0]) {
      // Member exists, use their ID
      memberId = existingMember[0].id
    } else {
      // Create new member
      const memberResult = await sql`
        INSERT INTO members (name, email, role)
        VALUES (${data.name}, ${data.email}, 'member')
        RETURNING id
      `
      memberId = memberResult[0].id
    }

    // Create user (this will fail if user already exists due to UNIQUE constraint)
    const userResult = await sql`
      INSERT INTO users (member_id, email, password)
      VALUES (${memberId}, ${data.email}, ${hashedPassword})
      RETURNING id, email
    `

    return userResult[0]
  } catch (error) {
    console.error('Error signing up:', error)
    throw error
  }
}

export async function login(data: { email: string; password: string }) {
  try {
    const userResult = await sql`SELECT * FROM users WHERE email = ${data.email}`

    if (!userResult[0]) {
      throw new Error('Invalid credentials')
    }

    const isValid = await bcrypt.compare(data.password, userResult[0].password)
    if (!isValid) {
      throw new Error('Invalid credentials')
    }

    const token = uuidv4()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await sql`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (${userResult[0].id}, ${token}, ${expiresAt.toISOString()})
    `

    return { token, userId: userResult[0].id }
  } catch (error) {
    console.error('Error logging in:', error)
    throw error
  }
}

export async function logout(token: string) {
  try {
    await sql`DELETE FROM sessions WHERE token = ${token}`
    return true
  } catch (error) {
    console.error('Error logging out:', error)
    throw error
  }
}

export async function verifyToken(token: string) {
  try {
    const sessionResult = await sql`
      SELECT s.*, u.member_id 
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ${token} AND s.expires_at > CURRENT_TIMESTAMP
    `

    if (!sessionResult[0]) {
      throw new Error('Invalid or expired token')
    }

    return sessionResult[0]
  } catch (error) {
    console.error('Error verifying token:', error)
    throw error
  }
}

export async function getMembers() {
  try {
    const members = await sql`SELECT * FROM members ORDER BY name`
    return members
  } catch (error) {
    console.error('Error fetching members:', error)
    throw error
  }
}

export async function createMember(data: {
  name: string
  email: string
  phone_number?: string
  address?: string
  role?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relationship?: string
}) {
  try {
    const phoneDigits = data.phone_number ? data.phone_number.replace(/\D/g, '') : ''
    if (phoneDigits && phoneDigits.length !== 10) {
      throw new Error('Phone number must be exactly 10 digits')
    }

    const emergencyPhoneDigits = data.emergency_contact_phone ? data.emergency_contact_phone.replace(/\D/g, '') : ''
    if (emergencyPhoneDigits && emergencyPhoneDigits.length !== 10) {
      throw new Error('Emergency contact phone must be exactly 10 digits')
    }

    const result = await sql`
      INSERT INTO members (
        name, email, phone_number, address, role,
        emergency_contact_name, emergency_contact_phone, emergency_contact_relationship
      )
      VALUES (
        ${data.name}, 
        ${data.email}, 
        ${phoneDigits || null}, 
        ${data.address || null}, 
        ${data.role || 'member'},
        ${data.emergency_contact_name || null},
        ${emergencyPhoneDigits || null},
        ${data.emergency_contact_relationship || null}
      )
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error('Error creating member:', error)
    throw error
  }
}

export async function updateMember(id: string, data: any) {
  try {
    const phoneDigits = data.phone_number ? String(data.phone_number).replace(/\D/g, '') : null
    if (phoneDigits && phoneDigits.length !== 10) {
      throw new Error('Phone number must be exactly 10 digits')
    }

    const emergencyPhoneDigits = data.emergency_contact_phone
      ? String(data.emergency_contact_phone).replace(/\D/g, '')
      : null
    if (emergencyPhoneDigits && emergencyPhoneDigits.length !== 10) {
      throw new Error('Emergency contact phone must be exactly 10 digits')
    }

    const result = await sql`
      UPDATE members 
      SET 
        name = COALESCE(${data.name || null}, name),
        email = COALESCE(${data.email || null}, email),
        phone_number = COALESCE(${phoneDigits}, phone_number),
        address = COALESCE(${data.address || null}, address),
        role = COALESCE(${data.role || null}, role),
        emergency_contact_name = COALESCE(${data.emergency_contact_name || null}, emergency_contact_name),
        emergency_contact_phone = COALESCE(${emergencyPhoneDigits}, emergency_contact_phone),
        emergency_contact_relationship = COALESCE(${data.emergency_contact_relationship || null}, emergency_contact_relationship),
        waiver_signed = COALESCE(${data.waiver_signed || null}, waiver_signed),
        waiver_signed_date = COALESCE(${data.waiver_signed_date || null}, waiver_signed_date),
        waiver_document_url = COALESCE(${data.waiver_document_url || null}, waiver_document_url),
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

export async function getRides() {
  try {
    const rides = await sql`SELECT * FROM rides ORDER BY date DESC`
    return rides
  } catch (error) {
    console.error('Error fetching rides:', error)
    throw error
  }
}

export async function createRide(data: any) {
  try {
    const result = await sql`
      INSERT INTO rides (title, description, date, meeting_location, destination, distance_miles, difficulty, max_participants, created_by)
      VALUES (${data.title}, ${data.description || null}, ${data.date}, ${data.meeting_location}, ${data.destination || null}, ${data.distance_miles || null}, ${data.difficulty || null}, ${data.max_participants || null}, ${data.created_by})
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error('Error creating ride:', error)
    throw error
  }
}

export async function updateRide(id: string, data: any) {
  try {
    const result = await sql`
      UPDATE rides
      SET
        title = COALESCE(${data.title || null}, title),
        description = COALESCE(${data.description || null}, description),
        date = COALESCE(${data.date || null}, date),
        meeting_location = COALESCE(${data.meeting_location || null}, meeting_location),
        destination = COALESCE(${data.destination || null}, destination),
        distance_miles = COALESCE(${data.distance_miles || null}, distance_miles),
        difficulty = COALESCE(${data.difficulty || null}, difficulty),
        max_participants = COALESCE(${data.max_participants || null}, max_participants),
        status = COALESCE(${data.status || null}, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error('Error updating ride:', error)
    throw error
  }
}

export async function deleteRide(id: string) {
  try {
    await sql`DELETE FROM rides WHERE id = ${id}`
    return true
  } catch (error) {
    console.error('Error deleting ride:', error)
    throw error
  }
}

export async function getMedia(rideId?: string) {
  try {
    if (rideId) {
      const media = await sql`SELECT * FROM media WHERE ride_id = ${rideId} ORDER BY uploaded_at DESC`
      return media
    }
    const media = await sql`SELECT * FROM media ORDER BY uploaded_at DESC`
    return media
  } catch (error) {
    console.error('Error fetching media:', error)
    throw error
  }
}

export async function createMedia(data: any) {
  try {
    const result = await sql`
      INSERT INTO media (ride_id, uploaded_by, blob_url, caption, tags, visibility)
      VALUES (${data.ride_id || null}, ${data.uploaded_by}, ${data.blob_url}, ${data.caption || null}, ${data.tags ? JSON.stringify(data.tags) : null}, ${data.visibility || 'members'})
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error('Error creating media:', error)
    throw error
  }
}

export async function deleteMedia(id: string) {
  try {
    await sql`DELETE FROM media WHERE id = ${id}`
    return true
  } catch (error) {
    console.error('Error deleting media:', error)
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

    if (action === 'signup') {
      const user = await signup(data)
      return NextResponse.json(user)
    }

    if (action === 'login') {
      const result = await login(data)
      return NextResponse.json(result)
    }

    if (action === 'logout') {
      await logout(data.token)
      return NextResponse.json({ success: true })
    }

    if (action === 'verifyToken') {
      const session = await verifyToken(data.token)
      return NextResponse.json(session)
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

    if (action === 'getRides') {
      const rides = await getRides()
      return NextResponse.json(rides)
    }

    if (action === 'createRide') {
      const ride = await createRide(data)
      return NextResponse.json(ride)
    }

    if (action === 'updateRide') {
      const ride = await updateRide(data.id, data)
      return NextResponse.json(ride)
    }

    if (action === 'deleteRide') {
      await deleteRide(data.id)
      return NextResponse.json({ success: true })
    }

    if (action === 'getMedia') {
      const media = await getMedia(data.rideId)
      return NextResponse.json(media)
    }

    if (action === 'createMedia') {
      const media = await createMedia(data)
      return NextResponse.json(media)
    }

    if (action === 'deleteMedia') {
      await deleteMedia(data.id)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 500 })
  } catch (error) {
    console.error(error)
    const uniqueMessage = getUniqueConstraintMessage(error)
    if (uniqueMessage) {
      return NextResponse.json({ error: uniqueMessage }, { status: 409 })
    }

    return NextResponse.json({ error: (error as any).message }, { status: 500 })
  }
}