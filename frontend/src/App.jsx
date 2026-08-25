import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useRegisterSW } from 'virtual:pwa-register/react';

// Analytics & System Selection Components
import SystemSelection from './SystemSelection';
import AnalyticsDashboard from './AnalyticsDashboard';

function MainApp() {
  const navigate = useNavigate();

  // Persistent User Authentication State
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('slic_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('slic_user'));
  const [isRegistering, setIsRegistering] = useState(false);

  // Login Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Register Form States
  const [regFullName, setRegFullName] = useState('');
  const [regEpf, setRegEpf] = useState('');
  const [regNic, setRegNic] = useState('');
  const [regDept, setRegDept] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Status Messages
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Clock States
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState('analytics');

  // Service Worker for PWA
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const closeUpdatePrompt = () => setNeedRefresh(false);

  // Live Clock Update Effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setDateStr(now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }));
      setTimeStr(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
        setIsLoggedIn(true);
        localStorage.setItem('slic_user', JSON.stringify(data.user));
        setActiveTab('analytics');
        navigate('/systems');
      } else {
        setAuthError(data.message || 'Invalid Username or Password!');
      }
    } catch (error) {
      setAuthError('Cannot connect to Backend Server!');
    }
  };

  // Register Handler
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: regFullName,
          epfNumber: regEpf,
          nicNumber: regNic,
          department: regDept,
          username: regUsername,
          password: regPassword
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAuthSuccess('Registration Successful! Please Sign In.');
        setIsRegistering(false);
        setRegFullName(''); setRegEpf(''); setRegNic(''); setRegDept(''); setRegUsername(''); setRegPassword('');
      } else {
        setAuthError(data.message || 'Registration failed!');
      }
    } catch (error) {
      setAuthError('Cannot connect to Backend Server!');
    }
  };

  // Logout Handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('slic_user');
    setUsername('');
    setPassword('');
    setAuthError('');
    setAuthSuccess('');
    navigate('/');
  };

  // PWA Reload Banner
  const renderUpdateNotification = () => {
    if (!needRefresh) return null;
    return (
      <div style={styles.pwaUpdateBanner}>
        <span>A new version is available! Click reload to update.</span>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button style={styles.pwaReloadBtn} onClick={() => updateServiceWorker(true)}>
            Reload
          </button>
          <button style={styles.pwaCloseBtn} onClick={closeUpdatePrompt}>
            Close
          </button>
        </div>
      </div>
    );
  };

  // --- LOGIN / REGISTER AUTHENTICATION VIEW ---
  if (!isLoggedIn) {
    return (
      <div style={styles.loginBg}>
        <div style={{ ...styles.loginCard, width: isRegistering ? '440px' : '380px' }}>
          <div style={{ textAlign: 'center', marginBottom: '15px' }}>
            <img 
              src="/slic.png" 
              alt="SLIC Logo" 
              style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; }} 
            />
          </div>

          <div style={styles.badgeWrapper}>
            <span style={styles.orangeBadge}>National level's View</span>
          </div>
          
          <h1 style={styles.loginTitle}>
            {isRegistering ? 'Create Account' : 'Activity Monitoring Portal'}
          </h1>
          <p style={styles.loginSubtitle}>
            {isRegistering ? 'Enter details to register new user' : 'Sign in with your software division account'}
          </p>

          {authError && <div style={styles.errorAlert}>{authError}</div>}
          {authSuccess && <div style={styles.successAlert}>{authSuccess}</div>}

          {isRegistering ? (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>FULL NAME</label>
                <input type="text" style={styles.input} value={regFullName} onChange={(e) => setRegFullName(e.target.value)} required />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>EPF NUMBER</label>
                  <input type="text" style={styles.input} value={regEpf} onChange={(e) => setRegEpf(e.target.value)} required />
                </div>
                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>NIC NUMBER</label>
                  <input type="text" style={styles.input} value={regNic} onChange={(e) => setRegNic(e.target.value)} required />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>DEPARTMENT</label>
                <input type="text" style={styles.input} value={regDept} onChange={(e) => setRegDept(e.target.value)} required />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>USERNAME</label>
                  <input type="text" style={styles.input} value={regUsername} onChange={(e) => setRegUsername(e.target.value)} required />
                </div>
                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>PASSWORD</label>
                  <input type="password" style={styles.input} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
                </div>
              </div>

              <button type="submit" style={styles.loginBtn}>Register User</button>

              <p style={styles.bottomToggleText}>
                Already have an account?{' '}
                <span 
                  style={styles.toggleLink} 
                  onClick={() => { setIsRegistering(false); setAuthError(''); setAuthSuccess(''); }}
                >
                  Sign In
                </span>
              </p>
            </form>
          ) : (
            /* LOGIN FORM */
            <form onSubmit={handleLogin} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>USERNAME</label>
                <input type="text" style={styles.input} value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>PASSWORD</label>
                <input type="password" style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>

              <button type="submit" style={styles.loginBtn}>Sign In</button>

              <p style={styles.bottomToggleText}>
                Don't have an account?{' '}
                <span 
                  style={styles.toggleLink} 
                  onClick={() => { setIsRegistering(true); setAuthError(''); setAuthSuccess(''); }}
                >
                  Register Here
                </span>
              </p>
            </form>
          )}
        </div>

        {renderUpdateNotification()}
      </div>
    );
  }

  // --- DASHBOARD LAYOUT & ROUTING VIEW ---
  return (
    <div style={styles.appContainer}>
      {/* TOP NAVBAR */}
      <div style={styles.topNavbar}>
        <div style={styles.brandLogoContainer}>
          <img src="/slic.png" alt="SLIC Logo" style={styles.logoImg} onError={(e) => { e.target.style.display = 'none'; }} />
          <span style={styles.brandText}>Activity Monitoring</span>
        </div>

        <div style={styles.topBarBadge}>National level's View</div>
        
        <div style={styles.dateTimeContainer}>
          <div style={styles.pillBox}>{dateStr}</div>
          <div style={styles.pillBox}>{timeStr}</div>
        </div>
      </div>

      {/* MAIN LAYOUT WITH SIDEBAR */}
      <div style={styles.contentLayout}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <ul style={styles.navList}>
            <li 
              style={{ ...styles.navItem, ...(activeTab === 'analytics' ? styles.navActive : {}) }}
              onClick={() => { setActiveTab('analytics'); navigate('/systems'); }}
            >
              <span style={styles.navIcon}>📈</span> Analytics
            </li>
            <li style={styles.navItem}><span style={styles.navIcon}>👥</span> Agents' Data</li>
            <li style={styles.navItem}><span style={styles.navIcon}>👤</span> Profile</li>
          </ul>

          <div style={styles.sidebarBottomArea}>
            <div style={styles.userInfoCard}>
              <div style={styles.userLabel}>LOGGED IN AS:</div>
              <div style={styles.userName}>{user?.fullName || 'Software Division User'}</div>
              <div style={styles.userEpf}>EPF: {user?.epfNumber || user?.epf || 'N/A'} ({user?.department || 'IT'})</div>
            </div>

            <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
          </div>
        </div>

        {/* Dynamic Route Content */}
        <div style={styles.mainContent}>
          <Routes>
            <Route path="/" element={<Navigate to="/systems" replace />} />
            <Route path="/systems" element={<SystemSelection />} />
            <Route path="/analytics/activity-monitoring" element={<AnalyticsDashboard />} />
            <Route 
              path="/analytics/lifewire" 
              element={<div style={styles.placeholderCard}> Lifewire Portal Analytics Coming Soon...</div>} 
            />
            <Route 
              path="/analytics/lifeconnect" 
              element={<div style={styles.placeholderCard}> LifeConnect App Analytics Coming Soon...</div>} 
            />
            <Route path="*" element={<Navigate to="/systems" />} />
          </Routes>
        </div>
      </div>

      {renderUpdateNotification()}
    </div>
  );
}

// Main App Wrapper
export default function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}

// Styling Object
const styles = {
  appContainer: { display: 'flex', flexDirection: 'column', width: '100vw', minHeight: '100vh', backgroundColor: '#F3F4F6', fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif" },
  topNavbar: { backgroundColor: '#3B8B88', height: '60px', display: 'flex', alignItems: 'center', padding: '0 25px', width: '100%', boxSizing: 'border-box', position: 'relative', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' },
  brandLogoContainer: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoImg: { height: '34px', width: 'auto', objectFit: 'contain' },
  brandText: { fontSize: '16px', fontWeight: '700', color: '#FFF' },
  topBarBadge: { backgroundColor: '#E2952B', color: '#000', padding: '5px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', position: 'absolute', left: '50%', transform: 'translateX(-50%)' },
  dateTimeContainer: { display: 'flex', gap: '8px', marginLeft: 'auto' },
  pillBox: { backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#FFF', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' },
  contentLayout: { display: 'flex', flex: 1, width: '100%' },
  sidebar: { width: '240px', backgroundColor: '#E0F2F1', padding: '20px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexShrink: 0 },
  navList: { listStyle: 'none', padding: 0, margin: 0 },
  navItem: { padding: '12px 16px', borderRadius: '10px', marginBottom: '8px', fontSize: '14px', color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s ease' },
  navActive: { backgroundColor: '#B2DFDB', color: '#004D40', fontWeight: '700' },
  navIcon: { fontSize: '16px' },
  sidebarBottomArea: { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto' },
  userInfoCard: { backgroundColor: '#B2DFDB', padding: '12px 14px', borderRadius: '8px' },
  userLabel: { fontSize: '10px', fontWeight: '700', color: '#004D40' },
  userName: { fontSize: '13px', fontWeight: '700', color: '#111827', marginTop: '3px' },
  userEpf: { fontSize: '11px', color: '#4B5563', marginTop: '2px' },
  logoutBtn: { width: '100%', padding: '12px', backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s' },
  mainContent: { padding: '30px', flex: 1, overflowY: 'auto' },
  placeholderCard: { backgroundColor: '#FFFFFF', padding: '30px', borderRadius: '12px', color: '#6B7280', fontWeight: '600', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },

  // Authentication UI Styles
  loginBg: { display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', minHeight: '100vh', backgroundColor: '#E0F2F1' },
  loginCard: { backgroundColor: '#FFF', padding: '35px 30px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', transition: 'all 0.3s ease' },
  badgeWrapper: { marginBottom: '15px' },
  orangeBadge: { backgroundColor: '#E2952B', color: '#000', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },
  loginTitle: { fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '6px' },
  loginSubtitle: { fontSize: '13px', color: '#6B7280', marginBottom: '22px' },
  form: { textAlign: 'left' },
  inputGroup: { marginBottom: '14px' },
  label: { display: 'block', fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '4px' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '13px', boxSizing: 'border-box', outline: 'none' },
  loginBtn: { width: '100%', padding: '12px', backgroundColor: '#3B8B88', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginTop: '10px', transition: 'background 0.2s' },
  bottomToggleText: { fontSize: '13px', color: '#6B7280', textAlign: 'center', marginTop: '18px' },
  toggleLink: { color: '#3B8B88', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' },
  errorAlert: { backgroundColor: '#FEE2E2', color: '#991B1B', padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', marginBottom: '15px', textAlign: 'center' },
  successAlert: { backgroundColor: '#D1FAE5', color: '#065F46', padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', marginBottom: '15px', textAlign: 'center' },

  // PWA Banner Styles
  pwaUpdateBanner: { position: 'fixed', bottom: '20px', right: '20px', backgroundColor: '#1F2937', color: '#FFFFFF', padding: '16px', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' },
  pwaReloadBtn: { backgroundColor: '#3B8B88', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' },
  pwaCloseBtn: { backgroundColor: 'transparent', color: '#9CA3AF', border: '1px solid #4B5563', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer' }
};