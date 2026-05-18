const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../db');
const crypto = require('crypto');

// Hash mật khẩu đơn giản (MD5 - đủ dùng cho báo cáo)
function hashPwd(pwd) {
  return crypto.createHash('md5').update(pwd).digest('hex');
}

// ═══ ĐĂNG KÝ NHÂN VIÊN ═══
router.post('/dangky/nhanvien', async (req, res) => {
  try {
    const { ten_dangnhap, mat_khau, ho_ten, ngay_sinh, so_dien_thoai, ngay_nhan_viec, chuc_vu } = req.body;
    if (!ten_dangnhap || !mat_khau || !ho_ten) return res.json({ success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });

    const pool = await getPool();

    // Kiểm tra tên đăng nhập đã tồn tại chưa
    const check = await pool.request()
      .input('tdn', sql.VarChar(50), ten_dangnhap)
      .query('SELECT id_tknv FROM TaiKhoanNhanVien WHERE ten_dangnhap = @tdn');
    if (check.recordset.length > 0) return res.json({ success: false, message: 'Tên đăng nhập đã tồn tại!' });

    // Tạo bản ghi trong bảng NhanVien trước
    const nvResult = await pool.request()
      .input('ho_ten',        sql.NVarChar(100), ho_ten)
      .input('ngay_sinh',     sql.Date, ngay_sinh || null)
      .input('so_dien_thoai', sql.VarChar(20),   so_dien_thoai || null)
      .input('ngay_nhan_viec',sql.Date, ngay_nhan_viec || null)
      .input('chuc_vu',       sql.NVarChar(100), chuc_vu || null)
      .query(`INSERT INTO NhanVien (ho_ten, ngay_sinh, so_dien_thoai, ngay_nhan_viec, chuc_vu)
              OUTPUT INSERTED.id_nhanvien
              VALUES (@ho_ten, @ngay_sinh, @so_dien_thoai, @ngay_nhan_viec, @chuc_vu)`);
    const id_nhanvien = nvResult.recordset[0].id_nhanvien;

    // Tạo tài khoản NhanVien
    await pool.request()
      .input('id_nhanvien',   sql.Int,          id_nhanvien)
      .input('ten_dangnhap',  sql.VarChar(50),  ten_dangnhap)
      .input('mat_khau',      sql.VarChar(255), hashPwd(mat_khau))
      .input('ho_ten',        sql.NVarChar(100),ho_ten)
      .input('ngay_sinh',     sql.Date,         ngay_sinh || null)
      .input('so_dien_thoai', sql.VarChar(20),  so_dien_thoai || null)
      .input('ngay_nhan_viec',sql.Date,         ngay_nhan_viec || null)
      .input('chuc_vu',       sql.NVarChar(100),chuc_vu || null)
      .query(`INSERT INTO TaiKhoanNhanVien
              (id_nhanvien, ten_dangnhap, mat_khau, ho_ten, ngay_sinh, so_dien_thoai, ngay_nhan_viec, chuc_vu)
              VALUES (@id_nhanvien, @ten_dangnhap, @mat_khau, @ho_ten, @ngay_sinh, @so_dien_thoai, @ngay_nhan_viec, @chuc_vu)`);

    res.json({ success: true, message: 'Đăng ký thành công! Vui lòng đăng nhập.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ═══ ĐĂNG KÝ HỘI VIÊN ═══
router.post('/dangky/hoivien', async (req, res) => {
  try {
    const { ten_dangnhap, mat_khau, ho_ten, ngay_sinh, so_dien_thoai, email } = req.body;
    if (!ten_dangnhap || !mat_khau || !ho_ten) return res.json({ success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });

    const pool = await getPool();

    const check = await pool.request()
      .input('tdn', sql.VarChar(50), ten_dangnhap)
      .query('SELECT id_tkhv FROM TaiKhoanHoiVien WHERE ten_dangnhap = @tdn');
    if (check.recordset.length > 0) return res.json({ success: false, message: 'Tên đăng nhập đã tồn tại!' });

    // Tạo ngày tạo thẻ = hôm nay, hết hạn = 1 năm sau
    const today = new Date().toISOString().split('T')[0];
    const expire = new Date();
    expire.setFullYear(expire.getFullYear() + 1);
    const expireDate = expire.toISOString().split('T')[0];

    // Tạo bản ghi HoiVien
    const hvResult = await pool.request()
      .input('ho_ten',        sql.NVarChar(100), ho_ten)
      .input('ngay_sinh',     sql.Date,          ngay_sinh || null)
      .input('so_dien_thoai', sql.VarChar(20),   so_dien_thoai || null)
      .input('email',         sql.VarChar(100),  email || null)
      .input('ngay_tao_the',  sql.Date,          today)
      .input('ngay_het_han',  sql.Date,          expireDate)
      .query(`INSERT INTO HoiVien (ho_ten, ngay_sinh, so_dien_thoai, email, ngay_tao_the, ngay_het_han)
              OUTPUT INSERTED.id_hoivien
              VALUES (@ho_ten, @ngay_sinh, @so_dien_thoai, @email, @ngay_tao_the, @ngay_het_han)`);
    const id_hoivien = hvResult.recordset[0].id_hoivien;

    // Tạo tài khoản HoiVien
    await pool.request()
      .input('id_hoivien',    sql.Int,           id_hoivien)
      .input('ten_dangnhap',  sql.VarChar(50),   ten_dangnhap)
      .input('mat_khau',      sql.VarChar(255),  hashPwd(mat_khau))
      .input('ho_ten',        sql.NVarChar(100), ho_ten)
      .input('ngay_sinh',     sql.Date,          ngay_sinh || null)
      .input('so_dien_thoai', sql.VarChar(20),   so_dien_thoai || null)
      .input('email',         sql.VarChar(100),  email || null)
      .input('ngay_tao_the',  sql.Date,          today)
      .input('ngay_het_han',  sql.Date,          expireDate)
      .query(`INSERT INTO TaiKhoanHoiVien
              (id_hoivien, ten_dangnhap, mat_khau, ho_ten, ngay_sinh, so_dien_thoai, email, ngay_tao_the, ngay_het_han)
              VALUES (@id_hoivien, @ten_dangnhap, @mat_khau, @ho_ten, @ngay_sinh, @so_dien_thoai, @email, @ngay_tao_the, @ngay_het_han)`);

    res.json({ success: true, message: 'Đăng ký thành công! Vui lòng đăng nhập.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ═══ ĐĂNG NHẬP ═══
router.post('/dangnhap', async (req, res) => {
  try {
    const { ten_dangnhap, mat_khau, vai_tro } = req.body;
    if (!ten_dangnhap || !mat_khau) return res.json({ success: false, message: 'Vui lòng nhập tài khoản và mật khẩu!' });

    const pool = await getPool();
    const hashed = hashPwd(mat_khau);
    let user = null;

    if (vai_tro === 'nhanvien') {
      const r = await pool.request()
        .input('tdn', sql.VarChar(50),  ten_dangnhap)
        .input('mk',  sql.VarChar(255), hashed)
        .query(`SELECT id_tknv AS id, ho_ten, ten_dangnhap, chuc_vu, id_nhanvien
                FROM TaiKhoanNhanVien WHERE ten_dangnhap=@tdn AND mat_khau=@mk AND trang_thai=N'Hoạt động'`);
      if (r.recordset.length > 0) user = { ...r.recordset[0], vai_tro: 'nhanvien' };
    } else {
      const r = await pool.request()
        .input('tdn', sql.VarChar(50),  ten_dangnhap)
        .input('mk',  sql.VarChar(255), hashed)
        .query(`SELECT id_tkhv AS id, ho_ten, ten_dangnhap, email, id_hoivien, ngay_het_han
                FROM TaiKhoanHoiVien WHERE ten_dangnhap=@tdn AND mat_khau=@mk AND trang_thai=N'Hoạt động'`);
      if (r.recordset.length > 0) user = { ...r.recordset[0], vai_tro: 'hoivien' };
    }

    if (!user) return res.json({ success: false, message: 'Tài khoản hoặc mật khẩu không đúng!' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
