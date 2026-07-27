import React from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  })

  const close = () => {
    setNeedRefresh(false)
  }

  return (
    <div>
      {needRefresh && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#1e293b',
          color: '#ffffff',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <span>A new version is available! Click reload to update.</span>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button 
              onClick={() => updateServiceWorker(true)}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
              Reload
            </button>
            <button 
              onClick={close}
              style={{
                backgroundColor: 'transparent',
                color: '#94a3b8',
                border: '1px solid #475569',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReloadPrompt