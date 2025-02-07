const express = require("express");
const multer = require("multer");
const path = require("path");
const { uploadFile,getFileById } = require("../services/imageUpload");

const router = express.Router();

// Configure Multer
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

router.post("/upload", upload.single("file"), uploadFile);
router.post("/getById",getFileById)

module.exports = router;
