const express = require('express');
const cors = require('cors');
const oracledb = require('oracledb');

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

    const insertQuery = `
      INSERT INTO USER_ACCOUNTS (FULL_NAME, EPF_NUMBER, NIC_NUMBER, DEPARTMENT, USERNAME, PASSWORD) 
      VALUES (:fullName, :epfNumber, :nicNumber, :department, :username, :password)
    `;

    await connection.execute(
      insertQuery,
      { fullName, epfNumber, nicNumber, department, username, password },
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

// 4. LOGIN API Endpoint (EPF and Department Field Fixed)
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    const query = `
      SELECT FULL_NAME, EPF_NUMBER, DEPARTMENT, USERNAME 
      FROM USER_ACCOUNTS 
      WHERE UPPER(USERNAME) = UPPER(:username) AND PASSWORD = :password
    `;

    const result = await connection.execute(
      query,
      { username, password },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows && result.rows.length > 0) {
      const user = result.rows[0];

      res.json({
        success: true,
        user: {
          username: user.USERNAME,
          fullName: user.FULL_NAME,
          epfNumber: user.EPF_NUMBER,
          epf: user.EPF_NUMBER,       // Front-end එක epf ලෙස ගත්තත් epfNumber ලෙස ගත්තත් හරියටම ලැබීමට
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

// 5. Dashboard Metrics API
app.get('/api/dashboard-metrics', (req, res) => {
  res.json({
    totalDownloads: '1,248',
    totalPayments: 'LKR 4,850,000',
    zones: [
      { title: "Central and Southern", downloads: "440", lastMonthDownloads: "352", payments: "LKR 1,800,000", themeColor: "#6366F1" },
      { title: "Northern and Eastern", downloads: "280", lastMonthDownloads: "224", payments: "LKR 950,000", themeColor: "#F59E0B" },
      { title: "Wayamba and Western", downloads: "528", lastMonthDownloads: "422", payments: "LKR 2,100,000", themeColor: "#10B981" }
    ]
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));