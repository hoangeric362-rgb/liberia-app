const sql = require('mssql');
require('dotenv').config();

const config = {
  server: 'localhost',
  port: 1433,
  database: 'QuanLyThuVien',
  user: 'sa',
  password: '123456',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

let pool = null;

async function getPool() {
  if (!pool) {
    pool = await sql.connect(config);
    console.log('✅ Kết nối SQL Server thành công!');
  }
  return pool;
}

module.exports = { getPool, sql };