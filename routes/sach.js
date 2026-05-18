const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../db');

router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Sach ORDER BY id_sach');
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
      .query('SELECT * FROM Sach WHERE id_sach = @id');
    if (result.recordset.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { ten_sach, the_loai, nam_xuat_ban, ten_tac_gia, ngay_nhap_sach, so_luong } = req.body;
    const pool = await getPool();
    const result = await pool.request()
      .input('ten_sach', sql.NVarChar(200), ten_sach)
      .input('the_loai', sql.NVarChar(100), the_loai || null)
      .input('nam_xuat_ban', sql.Int, nam_xuat_ban || null)
      .input('ten_tac_gia', sql.NVarChar(100), ten_tac_gia || null)
      .input('ngay_nhap_sach', sql.Date, ngay_nhap_sach || null)
      .input('so_luong', sql.Int, so_luong || 0)
      .query(`INSERT INTO Sach (ten_sach, the_loai, nam_xuat_ban, ten_tac_gia, ngay_nhap_sach, so_luong)
              OUTPUT INSERTED.*
              VALUES (@ten_sach, @the_loai, @nam_xuat_ban, @ten_tac_gia, @ngay_nhap_sach, @so_luong)`);
    res.status(201).json({ success: true, data: result.recordset[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { ten_sach, the_loai, nam_xuat_ban, ten_tac_gia, ngay_nhap_sach, so_luong } = req.body;
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('ten_sach', sql.NVarChar(200), ten_sach)
      .input('the_loai', sql.NVarChar(100), the_loai || null)
      .input('nam_xuat_ban', sql.Int, nam_xuat_ban || null)
      .input('ten_tac_gia', sql.NVarChar(100), ten_tac_gia || null)
      .input('ngay_nhap_sach', sql.Date, ngay_nhap_sach || null)
      .input('so_luong', sql.Int, so_luong || 0)
      .query(`UPDATE Sach SET ten_sach=@ten_sach, the_loai=@the_loai, nam_xuat_ban=@nam_xuat_ban,
              ten_tac_gia=@ten_tac_gia, ngay_nhap_sach=@ngay_nhap_sach, so_luong=@so_luong
              OUTPUT INSERTED.* WHERE id_sach=@id`);
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
      .query('DELETE FROM Sach WHERE id_sach = @id');
    res.json({ success: true, message: 'Đã xóa thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
