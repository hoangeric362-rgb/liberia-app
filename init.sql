-- =============================================
-- LIBERIA - Tạo bảng cho PostgreSQL
-- Chạy file này trong Render PostgreSQL
-- =============================================

-- 1. Bảng Nhân Viên
CREATE TABLE IF NOT EXISTS NhanVien (
  id_nhanvien    SERIAL PRIMARY KEY,
  ho_ten         VARCHAR(100) NOT NULL,
  ngay_sinh      DATE,
  so_dien_thoai  VARCHAR(20),
  ngay_nhan_viec DATE,
  chuc_vu        VARCHAR(100)
);

-- 2. Bảng Hội Viên
CREATE TABLE IF NOT EXISTS HoiVien (
  id_hoivien     SERIAL PRIMARY KEY,
  ho_ten         VARCHAR(100) NOT NULL,
  ngay_sinh      DATE,
  so_dien_thoai  VARCHAR(20),
  email          VARCHAR(100),
  ngay_tao_the   DATE,
  ngay_het_han   DATE
);

-- 3. Bảng Sách
CREATE TABLE IF NOT EXISTS Sach (
  id_sach        SERIAL PRIMARY KEY,
  ten_sach       VARCHAR(200) NOT NULL,
  the_loai       VARCHAR(100),
  nam_xuat_ban   INTEGER,
  ten_tac_gia    VARCHAR(100),
  ngay_nhap_sach DATE,
  so_luong       INTEGER DEFAULT 0
);

-- 4. Bảng Thẻ Mượn Sách
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

-- 5. Bảng Tài Khoản Admin
CREATE TABLE IF NOT EXISTS TaiKhoanAdmin (
  id_admin   SERIAL PRIMARY KEY,
  ten_admin  VARCHAR(100) NOT NULL,
  ghi_chu    VARCHAR(200),
  ngay_tao   TIMESTAMP DEFAULT NOW()
);

-- 6. Bảng Tài Khoản Nhân Viên
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

-- 7. Bảng Tài Khoản Hội Viên
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

-- 8. Thêm admin mặc định
INSERT INTO TaiKhoanAdmin (ten_admin, ghi_chu)
VALUES ('Administrator', 'Tài khoản quản trị mặc định')
ON CONFLICT DO NOTHING;

-- 9. Dữ liệu sách mẫu
INSERT INTO Sach (ten_sach, the_loai, nam_xuat_ban, ten_tac_gia, ngay_nhap_sach, so_luong) VALUES
('Dế Mèn Phiêu Lưu Ký',        'Văn học',   1941, 'Tô Hoài',              '2024-01-10', 5),
('Số Đỏ',                        'Văn học',   1936, 'Vũ Trọng Phụng',       '2024-01-10', 4),
('Tắt Đèn',                      'Văn học',   1939, 'Ngô Tất Tố',           '2024-01-10', 3),
('Đắc Nhân Tâm',                 'Kỹ năng',   1936, 'Dale Carnegie',        '2024-02-05', 6),
('Thói Quen Thứ 7',              'Kỹ năng',   1989, 'Stephen Covey',        '2024-02-05', 4),
('Nghĩ Giàu Làm Giàu',          'Kỹ năng',   1937, 'Napoleon Hill',        '2024-02-05', 5),
('Lược Sử Thời Gian',            'Khoa học',  1988, 'Stephen Hawking',      '2024-03-01', 3),
('Sapiens: Lược Sử Loài Người',  'Khoa học',  2011, 'Yuval Noah Harari',    '2024-03-01', 4),
('Vũ Trụ Trong Vỏ Hạt Dẻ',     'Khoa học',  2001, 'Stephen Hawking',      '2024-03-01', 2),
('Hoàng Tử Bé',                  'Thiếu nhi', 1943, 'Antoine de Saint',     '2024-04-01', 7),
('Charlie Và Nhà Máy Sôcôla',   'Thiếu nhi', 1964, 'Roald Dahl',           '2024-04-01', 5),
('Doraemon - Tập 1',             'Thiếu nhi', 1969, 'Fujiko F. Fujio',      '2024-04-01', 8),
('Đất Rừng Phương Nam',          'Lịch sử',   1957, 'Đoàn Giỏi',            '2024-05-01', 4),
('Việt Nam Sử Lược',             'Lịch sử',   1919, 'Trần Trọng Kim',       '2024-05-01', 3),
('Hồ Chí Minh Toàn Tập',        'Lịch sử',   2011, 'Hồ Chí Minh',          '2024-05-01', 2)
ON CONFLICT DO NOTHING;
