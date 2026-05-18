const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../db');

// GET all - JOIN với HoiVien và Sach để lấy tên
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT t.*, h.ho_ten AS ten_hoivien_full, s.ten_sach AS ten_sach_full
      FROM TheMuonSach t
      LEFT JOIN HoiVien h ON t.id_hoivien = h.id_hoivien
      LEFT JOIN Sach s ON t.id_sach = s.id_sach
      ORDER BY t.tm_stt
    `);
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
      .query(`
        SELECT t.*, h.ho_ten AS ten_hoivien_full, s.ten_sach AS ten_sach_full
        FROM TheMuonSach t
        LEFT JOIN HoiVien h ON t.id_hoivien = h.id_hoivien
        LEFT JOIN Sach s ON t.id_sach = s.id_sach
        WHERE t.tm_stt = @id
      `);
    if (result.recordset.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      tm_ten_hoivien, id_hoivien, tm_so_dien_thoai, tm_email,
      id_sach, tm_ten_sach, tm_ngay_muon, tm_ngay_den_han_tra,
      tm_ghi_chu, tm_trang_thai
    } = req.body;
    const pool = await getPool();
    const result = await pool.request()
      .input('tm_ten_hoivien', sql.NVarChar(100), tm_ten_hoivien || null)
      .input('id_hoivien', sql.Int, id_hoivien || null)
      .input('tm_so_dien_thoai', sql.VarChar(20), tm_so_dien_thoai || null)
      .input('tm_email', sql.VarChar(100), tm_email || null)
      .input('id_sach', sql.Int, id_sach || null)
      .input('tm_ten_sach', sql.NVarChar(200), tm_ten_sach || null)
      .input('tm_ngay_muon', sql.Date, tm_ngay_muon || null)
      .input('tm_ngay_den_han_tra', sql.Date, tm_ngay_den_han_tra || null)
      .input('tm_ghi_chu', sql.NVarChar(500), tm_ghi_chu || null)
      .input('tm_trang_thai', sql.NVarChar(50), tm_trang_thai || 'Đang mượn')
      .query(`INSERT INTO TheMuonSach
              (tm_ten_hoivien, id_hoivien, tm_so_dien_thoai, tm_email,
               id_sach, tm_ten_sach, tm_ngay_muon, tm_ngay_den_han_tra, tm_ghi_chu, tm_trang_thai)
              OUTPUT INSERTED.*
              VALUES (@tm_ten_hoivien, @id_hoivien, @tm_so_dien_thoai, @tm_email,
                      @id_sach, @tm_ten_sach, @tm_ngay_muon, @tm_ngay_den_han_tra, @tm_ghi_chu, @tm_trang_thai)`);
    res.status(201).json({ success: true, data: result.recordset[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const {
      tm_ten_hoivien, id_hoivien, tm_so_dien_thoai, tm_email,
      id_sach, tm_ten_sach, tm_ngay_muon, tm_ngay_den_han_tra,
      tm_ghi_chu, tm_trang_thai
    } = req.body;
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('tm_ten_hoivien', sql.NVarChar(100), tm_ten_hoivien || null)
      .input('id_hoivien', sql.Int, id_hoivien || null)
      .input('tm_so_dien_thoai', sql.VarChar(20), tm_so_dien_thoai || null)
      .input('tm_email', sql.VarChar(100), tm_email || null)
      .input('id_sach', sql.Int, id_sach || null)
      .input('tm_ten_sach', sql.NVarChar(200), tm_ten_sach || null)
      .input('tm_ngay_muon', sql.Date, tm_ngay_muon || null)
      .input('tm_ngay_den_han_tra', sql.Date, tm_ngay_den_han_tra || null)
      .input('tm_ghi_chu', sql.NVarChar(500), tm_ghi_chu || null)
      .input('tm_trang_thai', sql.NVarChar(50), tm_trang_thai || 'Đang mượn')
      .query(`UPDATE TheMuonSach SET
              tm_ten_hoivien=@tm_ten_hoivien, id_hoivien=@id_hoivien,
              tm_so_dien_thoai=@tm_so_dien_thoai, tm_email=@tm_email,
              id_sach=@id_sach, tm_ten_sach=@tm_ten_sach,
              tm_ngay_muon=@tm_ngay_muon, tm_ngay_den_han_tra=@tm_ngay_den_han_tra,
              tm_ghi_chu=@tm_ghi_chu, tm_trang_thai=@tm_trang_thai
              OUTPUT INSERTED.* WHERE tm_stt=@id`);
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
      .query('DELETE FROM TheMuonSach WHERE tm_stt = @id');
    res.json({ success: true, message: 'Đã xóa thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
