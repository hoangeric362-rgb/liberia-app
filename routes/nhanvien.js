const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM NhanVien ORDER BY id_nhanvien');
    res.json({ success: true, data: r.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM NhanVien WHERE id_nhanvien=$1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, data: r.rows[0] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { ho_ten, ngay_sinh, so_dien_thoai, ngay_nhan_viec, chuc_vu } = req.body;
    const r = await pool.query(
      `INSERT INTO NhanVien (ho_ten,ngay_sinh,so_dien_thoai,ngay_nhan_viec,chuc_vu)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [ho_ten, ngay_sinh||null, so_dien_thoai||null, ngay_nhan_viec||null, chuc_vu||null]
    );
    res.status(201).json({ success: true, data: r.rows[0] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { ho_ten, ngay_sinh, so_dien_thoai, ngay_nhan_viec, chuc_vu } = req.body;
    const r = await pool.query(
      `UPDATE NhanVien SET ho_ten=$1,ngay_sinh=$2,so_dien_thoai=$3,ngay_nhan_viec=$4,chuc_vu=$5
       WHERE id_nhanvien=$6 RETURNING *`,
      [ho_ten, ngay_sinh||null, so_dien_thoai||null, ngay_nhan_viec||null, chuc_vu||null, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, data: r.rows[0] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM NhanVien WHERE id_nhanvien=$1', [req.params.id]);
    res.json({ success: true, message: 'Đã xóa thành công' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
