const express = require('express');
const router = express.Router();
const qr = require('qr-image');
const PDFDocument = require('pdfkit');
const { createCanvas } = require('canvas');
const fs = require('fs').promises;
const path = require('path');
const db = require('../config/db');

router.post('/generate', async (req, res) => {
  const { name, url } = req.body;

  // Ensure storage directories exist
  const storageDir = path.join(__dirname, '../../storage');
  await Promise.all([
    fs.mkdir(path.join(storageDir, 'qr_codes'), { recursive: true }),
    fs.mkdir(path.join(storageDir, 'pdfs'), { recursive: true }),
    fs.mkdir(path.join(storageDir, 'pdf_pngs'), { recursive: true }),
  ]);

  // Generate QR code
  const qrCode = qr.imageSync(url, { type: 'png', size: 10 });
  const canvas = createCanvas(500, 500);
  const ctx = canvas.getContext('2d');
  const qrImg = new Image();
  qrImg.src = qrCode;
  ctx.drawImage(qrImg, 0, 0, 500, 500);
  const qrCodePath = path.join(storageDir, 'qr_codes', `${name}_${Date.now()}_qrcode.png`);
  await fs.writeFile(qrCodePath, canvas.toBuffer('image/png'));

  // Generate PDF
  const doc = new PDFDocument({ size: 'A4' });
  const pdfPath = path.join(storageDir, 'pdfs', `${name}_${Date.now()}_document.pdf`);
  const stream = doc.pipe(fs.createWriteStream(pdfPath));
  doc.image(qrCodePath, 243.5, 226.67, { width: 108, height: 108 });
  doc.end();
  await new Promise((resolve) => stream.on('finish', resolve));

  // Generate PDF as PNG
  const pdfCanvas = createCanvas(595, 842);
  const pdfCtx = pdfCanvas.getContext('2d');
  const pdfImg = new Image();
  pdfImg.onload = async () => {
    pdfCtx.drawImage(pdfImg, 0, 0, 595, 842);
    const pdfAsPngPath = path.join(storageDir, 'pdf_pngs', `${name}_${Date.now()}_document.png`);
    await fs.writeFile(pdfAsPngPath, pdfCanvas.toBuffer('image/png'));

    // Store paths in database
    const connection = await db.getConnection();
    const [result] = await connection.query(
      'INSERT INTO files (name, url, qr_code_path, pdf_path, pdf_as_png_path) VALUES (?, ?, ?, ?, ?)',
      [name, url, qrCodePath, pdfPath, pdfAsPngPath]
    );
    connection.release();

    res.json({
      qrCodeUrl: `/files/${result.insertId}/qr_code`,
      pdfUrl: `/files/${result.insertId}/pdf`,
      pdfAsPngUrl: `/files/${result.insertId}/pdf_as_png`,
    });
  };
  pdfImg.src = `file://${pdfPath}`;
});

router.get('/', async (req, res) => {
  const searchTerm = req.query.search || '';
  const connection = await db.getConnection();
  const [files] = await connection.query(
    'SELECT id, name FROM files WHERE name LIKE ?',
    [`%${searchTerm}%`]
  );
  connection.release();
  res.json(files.map(file => ({
    name: file.name,
    qrCodeUrl: `/files/${file.id}/qr_code`,
    pdfUrl: `/files/${file.id}/pdf`,
    pdfAsPngUrl: `/files/${file.id}/pdf_as_png`,
  })));
});

router.get('/:id/:type', async (req, res) => {
  const { id, type } = req.params;
  const fieldMap = {
    'qr_code': { field: 'qr_code_path', mime: 'image/png' },
    'pdf': { field: 'pdf_path', mime: 'application/pdf' },
    'pdf_as_png': { field: 'pdf_as_png_path', mime: 'image/png' },
  };
  if (!fieldMap[type]) {
    return res.status(400).send('Invalid file type');
  }
  const connection = await db.getConnection();
  const [files] = await connection.query(
    'SELECT ?? FROM files WHERE id = ?',
    [fieldMap[type].field, id]
  );
  connection.release();
  if (files.length > 0) {
    res.set('Content-Type', fieldMap[type].mime);
    res.sendFile(files[0][fieldMap[type].field], { root: '/' });
  } else {
    res.status(404).send('File not found');
  }
});

module.exports = router;
