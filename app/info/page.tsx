'use client'
import { useRouter } from 'next/navigation'


export default function InfoPage() {
  const router = useRouter()
  return (
    <main style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
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
      
      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>Who We Are</h2>
        <p style={{ lineHeight: '1.6', color: '#333' }}>
          The Lincoln Bike Club is a community of students seeking to create a space where students can enjoy cycling together in a fun and active environment. This will provide them with the opportunity to not only ride bikes but also engage socially, making the activity both enjoyable and community-focused.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>What We Do</h2>
        <ul style={{ lineHeight: '1.8', color: '#333', paddingLeft: '20px', margin: '0', listStyleType: 'disc' }}>
          <li>Organize monthly group rides.</li>
          <li>Host various workshops and guest speakers.</li>
          <li>Share routes and cycling tips.</li>
          <li>Build a supportive cycling community.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>How to Join</h2>
        <p style={{ lineHeight: '1.6', color: '#333' }}>
          Interested in joining us? Create an account to access our member directory, 
          view upcoming rides, and connect with fellow cyclists. Membership is open to all skill levels!
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>Contact Us</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '8px', fontWeight: 'bold' }}>Club Leader</h3>
          <p style={{ lineHeight: '1.6', color: '#333', margin: '0' }}>
            <strong>Scott Yao</strong><br />
            Email: <a href="mailto:syao5621@student.pps.net" style={{ color: '#007bff' }}>syao5621@student.pps.net</a><br />
            Phone: 503-935-1583
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '8px', fontWeight: 'bold' }}>Club Co-Leaders</h3>
          <p style={{ lineHeight: '1.6', color: '#333', margin: '0 0 10px 0' }}>
            <strong>Bennett Shahrokhi</strong><br />
            Email: <a href="mailto:bshahrokhi0762@student.pps.net" style={{ color: '#007bff' }}>bshahrokhi0762@student.pps.net</a><br />
            Phone: 702-343-8010
          </p>
          <p style={{ lineHeight: '1.6', color: '#333', margin: '0 0 10px 0' }}>
            <strong>Brian Wei</strong><br />
            Email: <a href="mailto:bwei5634@student.pps.net" style={{ color: '#007bff' }}>bwei5634@student.pps.net</a><br />
            Phone: 503-933-6013
          </p>
          <p style={{ lineHeight: '1.6', color: '#333', margin: '0' }}>
            <strong>Rian Sbarro</strong><br />
            Email: <a href="mailto:risbarro8321@student.pps.net" style={{ color: '#007bff' }}>risbarro8321@student.pps.net</a><br />
            Phone: 503-847-4264
          </p>
        </div>

        <div>
          <h3 style={{ fontSize: '16px', marginBottom: '8px', fontWeight: 'bold' }}>Club Advisor</h3>
          <p style={{ lineHeight: '1.6', color: '#333', margin: '0' }}>
            <strong>Alex Park</strong><br />
            Email: <a href="mailto:apark@pps.net" style={{ color: '#007bff' }}>apark@pps.net</a>
          </p>
        </div>
      </section>
    </main>
  )
}
