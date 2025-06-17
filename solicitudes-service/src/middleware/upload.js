const multer = require('multer');
const path = require('path');

// Carpeta destino local
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${name}-${unique}${ext}`);
  }
});

const upload = multer({ storage });

module.exports = upload;
