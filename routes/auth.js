const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const crypto = require('crypto');

function hashPwd(pwd) {
  return crypto.createHash('md5').update(pwd).digest('hex');
}

// ĐĂNG KÝ NHÂN VIÊN
router.post('/dangky/nhanvien', async (req, res) => {
  try {
    const { ten_dangnhap, mat_khau, ho_ten, ngay_sinh, so_dien_thoai, ngay_nhan_viec, chuc_vu } = req.body;
    if (!ten_dangnhap || !mat_khau || !ho_ten) return res.json({ success: false, message: 'Vui lòng điền đầy đủ thông tin!' });

    const check = await pool.query('SELECT id_tknv FROM TaiKhoanNhanVien WHERE ten_dangnhap=$1', [ten_dangnhap]);
    if (check.rows.length > 0) return res.json({ success: false, message: 'Tên đăng nhập đã tồn tại!' });

    const nvR = await pool.query(
      `INSERT INTO NhanVien (ho_ten,ngay_sinh,so_dien_thoai,ngay_nhan_viec,chuc_vu) VALUES ($1,$2,$3,$4,$5) RETURNING id_nhanvien`,
      [ho_ten, ngay_sinh||null, so_dien_thoai||null, ngay_nhan_viec||null, chuc_vu||null]
    );
    const id_nhanvien = nvR.rows[0].id_nhanvien;

    await pool.query(
      `INSERT INTO TaiKhoanNhanVien (id_nhanvien,ten_dangnhap,mat_khau,ho_ten,ngay_sinh,so_dien_thoai,ngay_nhan_viec,chuc_vu)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [id_nhanvien, ten_dangnhap, hashPwd(mat_khau), ho_ten, ngay_sinh||null, so_dien_thoai||null, ngay_nhan_viec||null, chuc_vu||null]
    );

    res.json({ success: true, message: 'Đăng ký thành công! Vui lòng đăng nhập.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ĐĂNG KÝ HỘI VIÊN
router.post('/dangky/hoivien', async (req, res) => {
  try {
    const { ten_dangnhap, mat_khau, ho_ten, ngay_sinh, so_dien_thoai, email } = req.body;
    if (!ten_dangnhap || !mat_khau || !ho_ten) return res.json({ success: false, message: 'Vui lòng điền đầy đủ thông tin!' });

    const check = await pool.query('SELECT id_tkhv FROM TaiKhoanHoiVien WHERE ten_dangnhap=$1', [ten_dangnhap]);
    if (check.rows.length > 0) return res.json({ success: false, message: 'Tên đăng nhập đã tồn tại!' });

    const today = new Date().toISOString().split('T')[0];
    const expire = new Date(); expire.setFullYear(expire.getFullYear() + 1);
    const expireDate = expire.toISOString().split('T')[0];

    const hvR = await pool.query(
      `INSERT INTO HoiVien (ho_ten,ngay_sinh,so_dien_thoai,email,ngay_tao_the,ngay_het_han) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id_hoivien`,
      [ho_ten, ngay_sinh||null, so_dien_thoai||null, email||null, today, expireDate]
    );
    const id_hoivien = hvR.rows[0].id_hoivien;

    await pool.query(
      `INSERT INTO TaiKhoanHoiVien (id_hoivien,ten_dangnhap,mat_khau,ho_ten,ngay_sinh,so_dien_thoai,email,ngay_tao_the,ngay_het_han)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [id_hoivien, ten_dangnhap, hashPwd(mat_khau), ho_ten, ngay_sinh||null, so_dien_thoai||null, email||null, today, expireDate]
    );

    res.json({ success: true, message: 'Đăng ký thành công! Vui lòng đăng nhập.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ĐĂNG NHẬP
router.post('/dangnhap', async (req, res) => {
  try {
    const { ten_dangnhap, mat_khau, vai_tro } = req.body;
    if (!ten_dangnhap || !mat_khau) return res.json({ success: false, message: 'Vui lòng nhập đầy đủ!' });

    const hashed = hashPwd(mat_khau);
    let user = null;

    if (vai_tro === 'nhanvien') {
      const r = await pool.query(
        `SELECT id_tknv AS id, ho_ten, ten_dangnhap, chuc_vu, id_nhanvien, so_dien_thoai
         FROM TaiKhoanNhanVien WHERE ten_dangnhap=$1 AND mat_khau=$2 AND trang_thai='Hoạt động'`,
        [ten_dangnhap, hashed]
      );
      if (r.rows.length > 0) user = { ...r.rows[0], vai_tro: 'nhanvien' };
    } else {
      const r = await pool.query(
        `SELECT id_tkhv AS id, ho_ten, ten_dangnhap, email, id_hoivien, ngay_het_han, so_dien_thoai
         FROM TaiKhoanHoiVien WHERE ten_dangnhap=$1 AND mat_khau=$2 AND trang_thai='Hoạt động'`,
        [ten_dangnhap, hashed]
      );
      if (r.rows.length > 0) user = { ...r.rows[0], vai_tro: 'hoivien' };
    }

    if (!user) return res.json({ success: false, message: 'Tài khoản hoặc mật khẩu không đúng!' });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
