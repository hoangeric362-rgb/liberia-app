const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM HoiVien ORDER BY id_hoivien');
    res.json({ success: true, data: r.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM HoiVien WHERE id_hoivien=$1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, data: r.rows[0] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { ho_ten, ngay_sinh, so_dien_thoai, email, ngay_tao_the, ngay_het_han } = req.body;
    const r = await pool.query(
      `INSERT INTO HoiVien (ho_ten,ngay_sinh,so_dien_thoai,email,ngay_tao_the,ngay_het_han)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [ho_ten, ngay_sinh||null, so_dien_thoai||null, email||null, ngay_tao_the||null, ngay_het_han||null]
    );
    res.status(201).json({ success: true, data: r.rows[0] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { ho_ten, ngay_sinh, so_dien_thoai, email, ngay_tao_the, ngay_het_han } = req.body;
    const r = await pool.query(
      `UPDATE HoiVien SET ho_ten=$1,ngay_sinh=$2,so_dien_thoai=$3,email=$4,ngay_tao_the=$5,ngay_het_han=$6
       WHERE id_hoivien=$7 RETURNING *`,
      [ho_ten, ngay_sinh||null, so_dien_thoai||null, email||null, ngay_tao_the||null, ngay_het_han||null, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, data: r.rows[0] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM HoiVien WHERE id_hoivien=$1', [req.params.id]);
    res.json({ success: true, message: 'Đã xóa thành công' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
