const express = require('express');
const cors = require('cors');
const oracledb = require('oracledb');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Oracle Instant Client Init (Thick mode)
try {
  oracledb.initOracleClient({ libDir: 'D:\\softwares\\instantclient-basic-windows.x64-21.22.0.0.0dbru\\instantclient_21_22' });
} catch (err) {
  console.error('Oracle Client Init Error:', err);
}

// 2. Oracle Database Configuration
const dbConfig = {
  user: 'ais',
  password: 'ais',
  connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=172.24.90.20)(PORT=1521))(CONNECT_DATA=(SERVER=dedicated)(SID=beelife)))`
};

// Test Database Connection at startup
async function testDB() {
  let conn;
  try {
    conn = await oracledb.getConnection(dbConfig);
    console.log('✅ Oracle Database connected successfully to USER_ACCOUNTS!');
  } catch (err) {
    console.error('❌ Oracle DB Connection Failed:', err.message);
  } finally {
    if (conn) {
      try { await conn.close(); } catch (e) { console.error(e); }
    }
  }
}
testDB();

// 3. REGISTER API Endpoint
app.post('/api/register', async (req, res) => {
  const { fullName, epfNumber, nicNumber, department, username, password } = req.body;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    // Username හෝ EPF එක දැනටමත් පවතීදැයි පරීක්ෂා කිරීම
    const checkUser = await connection.execute(
      `SELECT USERNAME FROM USER_ACCOUNTS WHERE UPPER(USERNAME) = UPPER(:username) OR EPF_NUMBER = :epfNumber`,
      { username, epfNumber }
    );

    if (checkUser.rows && checkUser.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username or EPF Number already exists!' 
      });
    }

    // Password එක Encrypt (Hash) කිරීම
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const insertQuery = `
      INSERT INTO USER_ACCOUNTS (FULL_NAME, EPF_NUMBER, NIC_NUMBER, DEPARTMENT, USERNAME, PASSWORD) 
      VALUES (:fullName, :epfNumber, :nicNumber, :department, :username, :password)
    `;

    await connection.execute(
      insertQuery,
      { fullName, epfNumber, nicNumber, department, username, password: hashedPassword },
      { autoCommit: true }
    );

    res.json({ 
      success: true, 
      message: 'Account created successfully! Please login.' 
    });

  } catch (err) {
    console.error('❌ Register Error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Database error: ' + err.message 
    });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) { console.error(e); }
    }
  }
});

// 4. LOGIN API Endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    const query = `
      SELECT FULL_NAME, EPF_NUMBER, DEPARTMENT, USERNAME, PASSWORD 
      FROM USER_ACCOUNTS 
      WHERE UPPER(USERNAME) = UPPER(:username)
    `;

    const result = await connection.execute(
      query,
      { username },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows && result.rows.length > 0) {
      const user = result.rows[0];

      // Password සසඳා බලමු
      const isPasswordValid = await bcrypt.compare(password, user.PASSWORD);

      if (isPasswordValid) {
        res.json({
          success: true,
          user: {
            username: user.USERNAME,
            fullName: user.FULL_NAME,
            epfNumber: user.EPF_NUMBER,
            epf: user.EPF_NUMBER,
            department: user.DEPARTMENT
          },
          message: 'Login successful!'
        });
      } else {
        res.status(401).json({ 
          success: false, 
          message: 'Invalid Username or Password!' 
        });
      }
    } else {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid Username or Password!' 
      });
    }

  } catch (err) {
    console.error('❌ Login Error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Database error: ' + err.message 
    });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) { console.error(e); }
    }
  }
});

// 5. DASHBOARD METRICS API Endpoint
app.get('/api/dashboard-metrics', (req, res) => {
  res.json({
    totalDownloads: '1,248',
    totalPayments: 'LKR 4,850,000',
    zones: [
      { title: "Central and Southern", downloads: "440", lastMonthDownloads: "352", payments: "LKR 1,800,000", themeColor: "#6366F1" },
      { title: "Northern and Eastern", downloads: "280", lastMonthDownloads: "224", payments: "LKR 950,000", themeColor: "#F59E0B" },
      { title: "Wayamba and Western", downloads: "528", lastMonthDownloads: "422", payments: "LKR 1,100,000", themeColor: "#10B981" }
    ]
  });
});

// 6. ACTIVITY MONITORING ANALYTICS API Endpoint (Live DB)
app.get('/api/am-analytics', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    // 1. User Categories Query
    const catResult = await connection.execute(
      `SELECT cat_type AS "category", COUNT(cat_type) AS "count"
       FROM SLI_APPS.am_login_users@LIVE 
       WHERE is_default = 'N' AND is_active = 'Y' 
       GROUP BY cat_type`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // 2. Zone-wise Users Query (Includes Miscellaneous and exact DB zones)
    const zoneResult = await connection.execute(
      `SELECT NVL(A3.zone_name, 'Miscellaneous') AS "zone", COUNT(A1.username) AS "userCount"
       FROM SLI_APPS.am_login_users@LIVE A1
       LEFT OUTER JOIN AGENT.AGENT@LIVE A2 ON TRIM(UPPER(A1.username)) = TRIM(UPPER(A2.email)) 
       LEFT OUTER JOIN BAU.SLIC_BRANCH_LIST@LIVE A3 ON TRIM(A2.branch) = TRIM(A3.csp_code)
       WHERE A1.is_default = 'N' AND A1.is_active = 'Y' AND A2.stcd IN (0, 1)
       GROUP BY A3.zone_name
       ORDER BY "userCount" DESC`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json({
      success: true,
      categories: catResult.rows || [],
      zones: zoneResult.rows || []
    });

  } catch (err) {
    console.error('❌ Analytics API Error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch analytics: ' + err.message 
    });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) { console.error(e); }
    }
  }
});

// Server Listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));