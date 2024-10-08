const express = require("express");
const router = express.Router();
const corsMiddleware = require("../middlewares/corsMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const fileController = require("../controllers/fileController");

//GET ALL FILES
router.get(
  "/",
  corsMiddleware,
  authMiddleware.protect,
  fileController.getAllFiles
);
//ADD SIGNATURE TO THE FILE
router.patch(
  "/:id",
  corsMiddleware,
  authMiddleware.protect,
  fileController.editAndAddDigitalSignature
);

//GET FILE BY ID
router.get(
  "/getasigned/:id",
  corsMiddleware,
  authMiddleware.protect,
  fileController.getFileById
);

//GET ALL UNSIGNED FILES PER USER
router.get(
  "/unsignedfiles",
  corsMiddleware,
  authMiddleware.protect,
  fileController.getAllUnsignedFilePerUser
);

//UPLOAD A FILE
router.post(
  "/",
  corsMiddleware,
  upload.single("file"),
  authMiddleware.protect,
  fileController.uploadFile
);

//GET ALL FILES CREATED BY USER
router.get(
  "/getfilesbyuser",
  corsMiddleware,
  authMiddleware.protect,
  fileController.getAllFilesCreatedByUser
);

//DELETE FILE
router.delete(
  "/deletefile/:id",
  corsMiddleware,
  authMiddleware.protect,
  fileController.deleteFile
);

//DECLINE A FILE
router.patch(
  "declinefile/:id",
  corsMiddleware,
  authMiddleware.protect,
  fileController.authenticateUser,
  fileController.connectToDatabase,
  fileController.declineFile
);

//GET ALL APPROVED FILES PER USER
router.get(
  "/approvedfiles",
  corsMiddleware,
  authMiddleware.protect,
  fileController.authenticateUser,
  fileController.connectToDatabase,
  fileController.approvedFilesPerUser
);

//GET ALL THE DECLINED FILES PER USER
router.get(
  "/declinedfiles",
  corsMiddleware,
  authMiddleware.protect,
  fileController.authenticateUser,
  fileController.connectToDatabase,
  fileController.declinedFilesPerUser
);

//GET ALL SAVED FILES THAT ARE NOT SIGNED

router.get(
  "/savedfiles",
  corsMiddleware,
  authMiddleware.protect,
  fileController.authenticateUser,
  fileController.connectToDatabase,
  fileController.unsignedSavedFilesPerUser
);

module.exports = router;
