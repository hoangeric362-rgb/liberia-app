const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT t.*, h.ho_ten AS ten_hoivien_full, s.ten_sach AS ten_sach_full
      FROM TheMuonSach t
      LEFT JOIN HoiVien h ON t.id_hoivien = h.id_hoivien
      LEFT JOIN Sach s ON t.id_sach = s.id_sach
      ORDER BY t.tm_stt
    `);
    res.json({ success: true, data: r.rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT t.*, h.ho_ten AS ten_hoivien_full, s.ten_sach AS ten_sach_full
      FROM TheMuonSach t
      LEFT JOIN HoiVien h ON t.id_hoivien = h.id_hoivien
      LEFT JOIN Sach s ON t.id_sach = s.id_sach
      WHERE t.tm_stt=$1`, [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, data: r.rows[0] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { tm_ten_hoivien, id_hoivien, tm_so_dien_thoai, tm_email, id_sach, tm_ten_sach, tm_ngay_muon, tm_ngay_den_han_tra, tm_ghi_chu, tm_trang_thai } = req.body;
    const r = await pool.query(
      `INSERT INTO TheMuonSach (tm_ten_hoivien,id_hoivien,tm_so_dien_thoai,tm_email,id_sach,tm_ten_sach,tm_ngay_muon,tm_ngay_den_han_tra,tm_ghi_chu,tm_trang_thai)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [tm_ten_hoivien||null, id_hoivien||null, tm_so_dien_thoai||null, tm_email||null, id_sach||null, tm_ten_sach||null, tm_ngay_muon||null, tm_ngay_den_han_tra||null, tm_ghi_chu||null, tm_trang_thai||'Đang mượn']
    );
    res.status(201).json({ success: true, data: r.rows[0] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { tm_ten_hoivien, id_hoivien, tm_so_dien_thoai, tm_email, id_sach, tm_ten_sach, tm_ngay_muon, tm_ngay_den_han_tra, tm_ghi_chu, tm_trang_thai } = req.body;
    const r = await pool.query(
      `UPDATE TheMuonSach SET tm_ten_hoivien=$1,id_hoivien=$2,tm_so_dien_thoai=$3,tm_email=$4,id_sach=$5,tm_ten_sach=$6,tm_ngay_muon=$7,tm_ngay_den_han_tra=$8,tm_ghi_chu=$9,tm_trang_thai=$10
       WHERE tm_stt=$11 RETURNING *`,
      [tm_ten_hoivien||null, id_hoivien||null, tm_so_dien_thoai||null, tm_email||null, id_sach||null, tm_ten_sach||null, tm_ngay_muon||null, tm_ngay_den_han_tra||null, tm_ghi_chu||null, tm_trang_thai||'Đang mượn', req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, data: r.rows[0] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM TheMuonSach WHERE tm_stt=$1', [req.params.id]);
    res.json({ success: true, message: 'Đã xóa thành công' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
