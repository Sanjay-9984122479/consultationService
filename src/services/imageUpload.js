const File = require("../models/fileUpload");
const path = require("path");
const {env} = require('process');

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = new File({ path: `${env.IMAGE_PATH}/${req.file.path}`  });
    await file.save();

    res.status(201).json({ id: file._id, path: file.path });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};


const getFileById = async (req, res) => {
    try {
      const file = await File.findById(req.body.id);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
  
      res.status(200).json({ id: file._id, path: file.path });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error });
    }
  };

module.exports = { uploadFile,getFileById };
