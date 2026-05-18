const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../db');

// GET all
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM NhanVien ORDER BY id_nhanvien');
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET by ID
router.get('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM NhanVien WHERE id_nhanvien = @id');
    if (result.recordset.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create
router.post('/', async (req, res) => {
  try {
    const { ho_ten, ngay_sinh, so_dien_thoai, ngay_nhan_viec, chuc_vu } = req.body;
    const pool = await getPool();
    const result = await pool.request()
      .input('ho_ten', sql.NVarChar(100), ho_ten)
      .input('ngay_sinh', sql.Date, ngay_sinh || null)
      .input('so_dien_thoai', sql.VarChar(20), so_dien_thoai || null)
      .input('ngay_nhan_viec', sql.Date, ngay_nhan_viec || null)
      .input('chuc_vu', sql.NVarChar(100), chuc_vu || null)
      .query(`INSERT INTO NhanVien (ho_ten, ngay_sinh, so_dien_thoai, ngay_nhan_viec, chuc_vu)
              OUTPUT INSERTED.*
              VALUES (@ho_ten, @ngay_sinh, @so_dien_thoai, @ngay_nhan_viec, @chuc_vu)`);
    res.status(201).json({ success: true, data: result.recordset[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update
router.put('/:id', async (req, res) => {
  try {
    const { ho_ten, ngay_sinh, so_dien_thoai, ngay_nhan_viec, chuc_vu } = req.body;
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('ho_ten', sql.NVarChar(100), ho_ten)
      .input('ngay_sinh', sql.Date, ngay_sinh || null)
      .input('so_dien_thoai', sql.VarChar(20), so_dien_thoai || null)
      .input('ngay_nhan_viec', sql.Date, ngay_nhan_viec || null)
      .input('chuc_vu', sql.NVarChar(100), chuc_vu || null)
      .query(`UPDATE NhanVien SET ho_ten=@ho_ten, ngay_sinh=@ngay_sinh,
              so_dien_thoai=@so_dien_thoai, ngay_nhan_viec=@ngay_nhan_viec, chuc_vu=@chuc_vu
              OUTPUT INSERTED.*
              WHERE id_nhanvien=@id`);
    if (result.recordset.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM NhanVien WHERE id_nhanvien = @id');
    res.json({ success: true, message: 'Đã xóa thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
