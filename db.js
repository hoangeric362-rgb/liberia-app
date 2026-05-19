const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS NhanVien (
        id_nhanvien    SERIAL PRIMARY KEY,
        ho_ten         VARCHAR(100) NOT NULL,
        ngay_sinh      DATE,
        so_dien_thoai  VARCHAR(20),
        ngay_nhan_viec DATE,
        chuc_vu        VARCHAR(100)
      );
      CREATE TABLE IF NOT EXISTS HoiVien (
        id_hoivien     SERIAL PRIMARY KEY,
        ho_ten         VARCHAR(100) NOT NULL,
        ngay_sinh      DATE,
        so_dien_thoai  VARCHAR(20),
        email          VARCHAR(100),
        ngay_tao_the   DATE,
        ngay_het_han   DATE
      );
      CREATE TABLE IF NOT EXISTS Sach (
        id_sach        SERIAL PRIMARY KEY,
        ten_sach       VARCHAR(200) NOT NULL,
        the_loai       VARCHAR(100),
        nam_xuat_ban   INTEGER,
        ten_tac_gia    VARCHAR(100),
        ngay_nhap_sach DATE,
        so_luong       INTEGER DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS TheMuonSach (
        tm_stt              SERIAL PRIMARY KEY,
        tm_ten_hoivien      VARCHAR(100),
        id_hoivien          INTEGER REFERENCES HoiVien(id_hoivien) ON DELETE SET NULL,
        tm_so_dien_thoai    VARCHAR(20),
        tm_email            VARCHAR(100),
        id_sach             INTEGER REFERENCES Sach(id_sach) ON DELETE SET NULL,
        tm_ten_sach         VARCHAR(200),
        tm_ngay_muon        DATE,
        tm_ngay_den_han_tra DATE,
        tm_ghi_chu          VARCHAR(500),
        tm_trang_thai       VARCHAR(50) DEFAULT 'Đang mượn'
      );
      CREATE TABLE IF NOT EXISTS TaiKhoanAdmin (
        id_admin  SERIAL PRIMARY KEY,
        ten_admin VARCHAR(100) NOT NULL,
        ghi_chu   VARCHAR(200),
        ngay_tao  TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS TaiKhoanNhanVien (
        id_tknv        SERIAL PRIMARY KEY,
        id_nhanvien    INTEGER REFERENCES NhanVien(id_nhanvien) ON DELETE SET NULL,
        ten_dangnhap   VARCHAR(50) NOT NULL UNIQUE,
        mat_khau       VARCHAR(255) NOT NULL,
        ho_ten         VARCHAR(100) NOT NULL,
        ngay_sinh      DATE,
        so_dien_thoai  VARCHAR(20),
        ngay_nhan_viec DATE,
        chuc_vu        VARCHAR(100),
        trang_thai     VARCHAR(20) DEFAULT 'Hoạt động',
        ngay_tao       TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS TaiKhoanHoiVien (
        id_tkhv        SERIAL PRIMARY KEY,
        id_hoivien     INTEGER REFERENCES HoiVien(id_hoivien) ON DELETE SET NULL,
        ten_dangnhap   VARCHAR(50) NOT NULL UNIQUE,
        mat_khau       VARCHAR(255) NOT NULL,
        ho_ten         VARCHAR(100) NOT NULL,
        ngay_sinh      DATE,
        so_dien_thoai  VARCHAR(20),
        email          VARCHAR(100),
        ngay_tao_the   DATE,
        ngay_het_han   DATE,
        trang_thai     VARCHAR(20) DEFAULT 'Hoạt động',
        ngay_tao       TIMESTAMP DEFAULT NOW()
      );
    `);

    // Thêm admin mặc định nếu chưa có
    await pool.query(`
      INSERT INTO TaiKhoanAdmin (ten_admin, ghi_chu)
      SELECT 'Administrator', 'Tài khoản quản trị mặc định'
      WHERE NOT EXISTS (SELECT 1 FROM TaiKhoanAdmin LIMIT 1);
    `);

    // Thêm sách mẫu nếu chưa có
    const check = await pool.query('SELECT COUNT(*) FROM Sach');
    if (parseInt(check.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO Sach (ten_sach, the_loai, nam_xuat_ban, ten_tac_gia, ngay_nhap_sach, so_luong) VALUES
        ('Dế Mèn Phiêu Lưu Ký','Văn học',1941,'Tô Hoài','2024-01-10',5),
        ('Số Đỏ','Văn học',1936,'Vũ Trọng Phụng','2024-01-10',4),
        ('Tắt Đèn','Văn học',1939,'Ngô Tất Tố','2024-01-10',3),
        ('Đắc Nhân Tâm','Kỹ năng',1936,'Dale Carnegie','2024-02-05',6),
        ('Thói Quen Thứ 7','Kỹ năng',1989,'Stephen Covey','2024-02-05',4),
        ('Nghĩ Giàu Làm Giàu','Kỹ năng',1937,'Napoleon Hill','2024-02-05',5),
        ('Lược Sử Thời Gian','Khoa học',1988,'Stephen Hawking','2024-03-01',3),
        ('Sapiens: Lược Sử Loài Người','Khoa học',2011,'Yuval Noah Harari','2024-03-01',4),
        ('Vũ Trụ Trong Vỏ Hạt Dẻ','Khoa học',2001,'Stephen Hawking','2024-03-01',2),
        ('Hoàng Tử Bé','Thiếu nhi',1943,'Antoine de Saint','2024-04-01',7),
        ('Charlie Và Nhà Máy Sôcôla','Thiếu nhi',1964,'Roald Dahl','2024-04-01',5),
        ('Doraemon - Tập 1','Thiếu nhi',1969,'Fujiko F. Fujio','2024-04-01',8),
        ('Đất Rừng Phương Nam','Lịch sử',1957,'Đoàn Giỏi','2024-05-01',4),
        ('Việt Nam Sử Lược','Lịch sử',1919,'Trần Trọng Kim','2024-05-01',3),
        ('Hồ Chí Minh Toàn Tập','Lịch sử',2011,'Hồ Chí Minh','2024-05-01',2);
      `);
    }

    console.log('✅ Database đã sẵn sàng!');
  } catch (err) {
    console.error('❌ Lỗi khởi tạo DB:', err.message);
  }
}

pool.connect()
  .then(() => { console.log('✅ Kết nối PostgreSQL thành công!'); initDB(); })
  .catch(err => console.error('❌ Lỗi kết nối:', err.message));

module.exports = { pool };
