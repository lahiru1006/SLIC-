import React, { useState, useEffect } from 'react';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false); // Toggle Login / Register View
  
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

  // Status Messages & User Details
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [user, setUser] = useState(null);

  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [metrics, setMetrics] = useState(null);

  // Live Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const optionsDate = { month: 'short', day: '2-digit', year: 'numeric' };
      setDateStr(now.toLocaleDateString('en-US', optionsDate));
      setTimeStr(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetch('http://localhost:5000/api/dashboard-metrics')
        .then((res) => res.json())
        .then((data) => setMetrics(data))
        .catch((err) => console.error(err));
    }
  }, [isLoggedIn]);

  // Handle Login
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
      } else {
        setAuthError(data.message || 'Invalid Username or Password!');
      }
    } catch (error) {
      setAuthError('Cannot connect to Backend Server!');
    }
  };

  // Handle Register
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
        setIsRegistering(false); // Switch back to Login Form
        // Clear inputs
        setRegFullName(''); setRegEpf(''); setRegNic(''); setRegDept(''); setRegUsername(''); setRegPassword('');
      } else {
        setAuthError(data.message || 'Registration failed!');
      }
    } catch (error) {
      setAuthError('Cannot connect to Backend Server!');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setUsername('');
    setPassword('');
    setAuthError('');
    setAuthSuccess('');
  };

  // --- LOGIN / REGISTER AUTHENTICATION PAGE ---
  if (!isLoggedIn) {
    return (
      <div style={styles.loginBg}>
        <div style={{ ...styles.loginCard, width: isRegistering ? '440px' : '380px' }}>
          <div style={{ textAlign: 'center', marginBottom: '15px' }}>
            <img 
              src="/slic.png" 
              alt="SLIC Logo" 
              style={{ height: '45px', width: 'auto', objectFit: 'contain' }}
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

          {/* Status Alert Messages */}
          {authError && <div style={styles.errorAlert}>{authError}</div>}
          {authSuccess && <div style={styles.successAlert}>{authSuccess}</div>}

          {/* 1. REGISTER FORM */}
          {isRegistering ? (
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

              {/* Bottom Switch Link */}
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
            /* 2. LOGIN FORM */
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

              {/* Bottom Switch Link */}
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
      </div>
    );
  }

  // --- DASHBOARD VIEW ---
  return (
    <div style={styles.appContainer}>
      {/* 1. TOP NAVBAR */}
      <div style={styles.topNavbar}>
        <div style={styles.brandLogoContainer}>
          <img src="/slic.png" alt="SLIC Logo" style={styles.logoImg} onError={(e) => { e.target.style.display = 'none'; }} />
          <span style={styles.brandText}>Activity Monitoring</span>
        </div>

        <div style={styles.topBarBadge}>National level's View</div>
        
        <div style={styles.dateTimeContainer}>
          <div style={styles.pillBox}>{dateStr || 'Jul 24, 2026'}</div>
          <div style={styles.pillBox}>{timeStr || '02:36:34 PM'}</div>
        </div>
      </div>

      {/* 2. LOWER CONTENT SECTION */}
      <div style={styles.contentLayout}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <ul style={styles.navList}>
            <li style={{ ...styles.navItem, ...styles.navActive }}><span style={styles.navIcon}>📊</span> Dashboard</li>
            <li style={styles.navItem}><span style={styles.navIcon}>📈</span> Analytics</li>
            <li style={styles.navItem}><span style={styles.navIcon}>👥</span> Agents' Data</li>
            <li style={styles.navItem}><span style={styles.navIcon}>👤</span> Profile</li>
          </ul>

          <div style={styles.sidebarBottomArea}>
            <div style={styles.userInfoCard}>
              <div style={styles.userLabel}>LOGGED IN AS:</div>
              <div style={styles.userName}>{user?.fullName || 'Software Division User'}</div>
              <div style={styles.userEpf}>EPF: {user?.epf} ({user?.department})</div>
            </div>

            <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={styles.mainContent}>
          <h2 style={styles.welcomeHeading}>Welcome back, {user?.fullName}!</h2>

          <div style={styles.topCardsGrid}>
            <div style={{ ...styles.kpiCard, backgroundColor: '#E2A93B' }}>
              <h3 style={styles.kpiTitle}>CustomerApp / Portal Downloads (This Week)</h3>
              <p style={styles.kpiValue}>{metrics ? metrics.totalDownloads : '1,248'}</p>
            </div>
            <div style={{ ...styles.kpiCard, backgroundColor: '#5FB3A1' }}>
              <h3 style={styles.kpiTitle}>Payments through CustomerApp / Portal (This Week)</h3>
              <p style={styles.kpiValue}>{metrics ? metrics.totalPayments : 'LKR 4,850,000'}</p>
            </div>
          </div>

          <h3 style={styles.sectionTitle}>Zonal Performance Overview (This Week)</h3>

          <div style={styles.zonalGrid}>
            {(metrics ? metrics.zones : []).map((zone, idx) => (
              <div key={idx} style={{ ...styles.zonalCard, borderTop: `4px solid ${zone.themeColor || '#6366F1'}` }}>
                <h4 style={styles.zonalTitle}>{zone.title}</h4>

                <div style={styles.downloadBox}>
                  <span style={styles.subText}>CustomerApp Downloads</span>
                  <div style={{ ...styles.zoneStatValue, color: zone.themeColor || '#6366F1' }}>{zone.downloads}</div>
                  <span style={styles.lastMonthText}>Last Month: {zone.lastMonthDownloads}</span>
                </div>

                <div style={styles.paymentRow}>
                  <span style={styles.paymentLabel}>Total Payments</span>
                  <span style={styles.paymentVal}>{zone.payments}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  appContainer: { display: 'flex', flexDirection: 'column', width: '100vw', minHeight: '100vh', backgroundColor: '#E8F3F3', fontFamily: "'Segoe UI', Roboto, sans-serif" },
  topNavbar: { backgroundColor: '#3B8B88', height: '60px', display: 'flex', alignItems: 'center', padding: '0 25px', width: '100%', boxSizing: 'border-box', position: 'relative' },
  brandLogoContainer: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoImg: { height: '32px', width: 'auto', objectFit: 'contain' },
  brandText: { fontSize: '15px', fontWeight: 'bold', color: '#FFF' },
  topBarBadge: { backgroundColor: '#E2952B', color: '#000', padding: '6px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', position: 'absolute', left: '50%', transform: 'translateX(-50%)' },
  dateTimeContainer: { display: 'flex', gap: '10px', marginLeft: 'auto' },
  pillBox: { backgroundColor: 'rgba(255, 255, 255, 0.25)', color: '#FFF', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' },
  contentLayout: { display: 'flex', flex: 1, width: '100%' },
  sidebar: { width: '240px', backgroundColor: '#DDF0F0', padding: '20px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexShrink: 0 },
  navList: { listStyle: 'none', padding: 0, margin: 0 },
  navItem: { padding: '12px 16px', borderRadius: '10px', marginBottom: '8px', fontSize: '14px', color: '#4A5568', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' },
  navActive: { backgroundColor: '#C4EAE8', color: '#2C7A7B', fontWeight: 'bold' },
  navIcon: { fontSize: '16px' },
  sidebarBottomArea: { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto' },
  userInfoCard: { backgroundColor: '#C3E3E1', padding: '12px 14px', borderRadius: '8px' },
  userLabel: { fontSize: '10px', fontWeight: 'bold', color: '#4A5568' },
  userName: { fontSize: '13px', fontWeight: 'bold', color: '#1A202C', marginTop: '3px' },
  userEpf: { fontSize: '11px', color: '#718096', marginTop: '2px' },
  logoutBtn: { width: '100%', padding: '12px', backgroundColor: '#E53E3E', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' },
  mainContent: { padding: '30px 35px', flex: 1 },
  welcomeHeading: { fontSize: '20px', fontWeight: '600', color: '#1A202C', marginBottom: '25px' },
  topCardsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' },
  kpiCard: { padding: '24px 28px', borderRadius: '12px', color: '#1A202C' },
  kpiTitle: { fontSize: '15px', fontWeight: 'bold' },
  kpiValue: { fontSize: '36px', fontWeight: '800', marginTop: '12px' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: '#2D3748', marginBottom: '18px' },
  zonalGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  zonalCard: { backgroundColor: '#FFF', padding: '20px', borderRadius: '12px' },
  zonalTitle: { fontSize: '15px', fontWeight: 'bold', color: '#2D3748', marginBottom: '16px' },
  downloadBox: { backgroundColor: '#F7FAFC', padding: '16px', borderRadius: '8px', textAlign: 'center', marginBottom: '16px' },
  subText: { fontSize: '12px', color: '#718096' },
  zoneStatValue: { fontSize: '32px', fontWeight: '800', margin: '6px 0' },
  lastMonthText: { fontSize: '11px', color: '#A0AEC0' },
  paymentRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' },
  paymentLabel: { color: '#475569' },
  paymentVal: { color: '#0F172A', fontWeight: 'bold' },

  // LOGIN & REGISTER UI STYLES
  loginBg: { display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', minHeight: '100vh', backgroundColor: '#E8F3F3' },
  loginCard: { backgroundColor: '#FFF', padding: '35px 30px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', transition: '0.3s width' },
  badgeWrapper: { marginBottom: '15px' },
  orangeBadge: { backgroundColor: '#E2952B', color: '#000', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' },
  loginTitle: { fontSize: '22px', fontWeight: 'bold', color: '#1E293B', marginBottom: '6px' },
  loginSubtitle: { fontSize: '12px', color: '#64748B', marginBottom: '22px' },
  form: { textAlign: 'left' },
  inputGroup: { marginBottom: '14px' },
  label: { display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' },
  loginBtn: { width: '100%', padding: '12px', backgroundColor: '#3B8B88', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  
  // BOTTOM TOGGLE TEXT
  bottomToggleText: { fontSize: '13px', color: '#64748B', textAlign: 'center', marginTop: '18px' },
  toggleLink: { color: '#3B8B88', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' },

  errorAlert: { backgroundColor: '#FED7D7', color: '#9B2C2C', padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px', textAlign: 'center' },
  successAlert: { backgroundColor: '#C6F6D5', color: '#22543D', padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px', textAlign: 'center' }
};

export default App;