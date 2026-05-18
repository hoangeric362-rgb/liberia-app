const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../db');

router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM HoiVien ORDER BY id_hoivien');
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM HoiVien WHERE id_hoivien = @id');
    if (result.recordset.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { ho_ten, ngay_sinh, so_dien_thoai, email, ngay_tao_the, ngay_het_han } = req.body;
    const pool = await getPool();
    const result = await pool.request()
      .input('ho_ten', sql.NVarChar(100), ho_ten)
      .input('ngay_sinh', sql.Date, ngay_sinh || null)
      .input('so_dien_thoai', sql.VarChar(20), so_dien_thoai || null)
      .input('email', sql.VarChar(100), email || null)
      .input('ngay_tao_the', sql.Date, ngay_tao_the || null)
      .input('ngay_het_han', sql.Date, ngay_het_han || null)
      .query(`INSERT INTO HoiVien (ho_ten, ngay_sinh, so_dien_thoai, email, ngay_tao_the, ngay_het_han)
              OUTPUT INSERTED.*
              VALUES (@ho_ten, @ngay_sinh, @so_dien_thoai, @email, @ngay_tao_the, @ngay_het_han)`);
    res.status(201).json({ success: true, data: result.recordset[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { ho_ten, ngay_sinh, so_dien_thoai, email, ngay_tao_the, ngay_het_han } = req.body;
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('ho_ten', sql.NVarChar(100), ho_ten)
      .input('ngay_sinh', sql.Date, ngay_sinh || null)
      .input('so_dien_thoai', sql.VarChar(20), so_dien_thoai || null)
      .input('email', sql.VarChar(100), email || null)
      .input('ngay_tao_the', sql.Date, ngay_tao_the || null)
      .input('ngay_het_han', sql.Date, ngay_het_han || null)
      .query(`UPDATE HoiVien SET ho_ten=@ho_ten, ngay_sinh=@ngay_sinh, so_dien_thoai=@so_dien_thoai,
              email=@email, ngay_tao_the=@ngay_tao_the, ngay_het_han=@ngay_het_han
              OUTPUT INSERTED.* WHERE id_hoivien=@id`);
    if (result.recordset.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM HoiVien WHERE id_hoivien = @id');
    res.json({ success: true, message: 'Đã xóa thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
