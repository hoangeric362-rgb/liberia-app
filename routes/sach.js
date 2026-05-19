const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM Sach ORDER BY id_sach');
    res.json({ success: true, data: r.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM Sach WHERE id_sach=$1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, data: r.rows[0] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { ten_sach, the_loai, nam_xuat_ban, ten_tac_gia, ngay_nhap_sach, so_luong } = req.body;
    const r = await pool.query(
      `INSERT INTO Sach (ten_sach,the_loai,nam_xuat_ban,ten_tac_gia,ngay_nhap_sach,so_luong)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [ten_sach, the_loai||null, nam_xuat_ban||null, ten_tac_gia||null, ngay_nhap_sach||null, so_luong||0]
    );
    res.status(201).json({ success: true, data: r.rows[0] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { ten_sach, the_loai, nam_xuat_ban, ten_tac_gia, ngay_nhap_sach, so_luong } = req.body;
    const r = await pool.query(
      `UPDATE Sach SET ten_sach=$1,the_loai=$2,nam_xuat_ban=$3,ten_tac_gia=$4,ngay_nhap_sach=$5,so_luong=$6
       WHERE id_sach=$7 RETURNING *`,
      [ten_sach, the_loai||null, nam_xuat_ban||null, ten_tac_gia||null, ngay_nhap_sach||null, so_luong||0, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, data: r.rows[0] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM Sach WHERE id_sach=$1', [req.params.id]);
    res.json({ success: true, message: 'Đã xóa thành công' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
