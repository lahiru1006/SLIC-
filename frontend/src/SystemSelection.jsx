import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SystemSelection() {
  const navigate = useNavigate();

  const systems = [
    {
      id: 'activity-monitoring',
      name: 'Activity Monitoring System',
      description: 'User logins, category distribution & branch analytics.',
      logo: '/activity monitoring logo.png',
      borderColor: '#6366F1'
    },
    {
      id: 'lifewire',
      name: 'Lifewire Portal Analytics',
      description: 'Comprehensive analysis on Lifewire portal performance & usage.',
      logo: '/lifewire logo.webp',
      borderColor: '#F59E0B'
    },
    {
      id: 'lifeconnect',
      name: 'LifeConnect App Analytics',
      description: 'Real-time payment transactions, downloads & customer analytics.',
      logo: '/lifeconnect logo.webp',
      borderColor: '#10B981'
    }
  ];

  return (
    <div style={{ padding: '40px 20px', minHeight: '100vh', backgroundColor: '#F3F4F6', textAlign: 'center' }}>
      <h1>Select System to Analyze</h1>
      <p style={{ color: '#6B7280', marginBottom: '30px' }}>Select an enterprise system below to generate real-time analytics</p>

      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {systems.map((sys) => (
          <div
            key={sys.id}
            onClick={() => navigate(`/analytics/${sys.id}`)}
            style={{
              background: '#fff',
              border: `2px solid ${sys.borderColor}`,
              borderRadius: '16px',
              padding: '24px',
              width: '280px',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s ease-in-out'
            }}
          >
            <img 
              src={sys.logo} 
              alt={sys.name} 
              style={{ height: '70px', objectFit: 'contain', marginBottom: '15px', maxWidth: '100%' }} 
            />
            <h3 style={{ color: '#1F2937', fontSize: '18px', marginBottom: '8px' }}>{sys.name}</h3>
            <p style={{ color: '#6B7280', fontSize: '13px', lineHeight: '1.4' }}>{sys.description}</p>
            <button style={{ marginTop: '15px', padding: '8px 16px', background: sys.borderColor, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              View Analytics →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}