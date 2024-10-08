const { sql } = require("../config/dbConfig");
const { PDFDocument } = require("pdf-lib");
const fetch = require("node-fetch");

//GET ALL FILES
exports.getAllFiles = async (req, res, next) => {
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .query(
        `SELECT f.FILE_ID, f.FILE_NAME, f.CREATED_ON,e.FIRST_NAME + " " + e.LAST_NAME AS NAME, f.REMARKS FROM tblFile f INNER JOIN tblDepartment ON tblEmployee AS e ON f.CREATED_BY = e.EMPLOYEE_ID WHERE f.SIGNED_BY_ALL = 1`
      );
    res.status(200).json(result);
  } catch (error) {
    console.log("Error in getting   all files: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//GET A SINGLE FILE
exports.getFileById = async (req, res, next) => {
  const { id } = req.params.id;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("ID", sql.Int, id)
      .query(`SELECT FILE_DATA,FILE_NAME FROM tblFile WHERE FILE_ID = @ID `);
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "File not found" });
    }
    const { FILE_DATA, FILE_NAME } = result.recordset[0];

    res.setHeader("Content-Disposition", `attachment;filename = ${FILE_NAME}`);
    res.contentType("Content-Type", "application/pdf");
    res.status(200).send(FILE_DATA);
  } catch (error) {
    console.log("Error in getting file by id: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//GET ALL UNSIGNED FILES PER USER
exports.getAllUnsignedFilePerUser = async (req, res, next) => {
  const employeeId = res.locals.id;
  try {
    const pool = await sql.connect();
    const getFilesQuery = `SELECT 
    s.FILE_ID,
    f.FILE_NAME, 
    e.FIRST_NAME + ' ' + e.LAST_NAME AS NAME,
    v.SIGNATURES_REQUIRED,
    f.SIGNATURES_DONE,
    v.VOUCHER_NAME,
    f.REMARKS 
    FROM tblSignatureLog s
    INNER JOIN tblFile f ON s.FILE_ID = f.FILE_ID
    INNER JOIN tblVoucherType v ON f.VOUCHER_ID = v.VOUCHER_ID
    INNER JOIN tblEmployee e ON f.CREATED_BY = e.EMPLOYEE_ID
    WHERE s.EMPLOYEE_ID = @EMPLOYEE_ID AND s.STATUS = 0
    ORDER BY f.CREATED_ON DESC`;

    const result = await pool
      .request()
      .input("EMPLOYEE_ID", sql.Int, employeeId)
      .query(getFilesQuery);

    if (!result) {
      return res.status(404).json({ message: "No unsigned files found" });
    }
    res.status(200).json(result);
  } catch (error) {
    console.log("error in getting all unsigned files: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//GET ALL FILES PER USER THAT ARE CREATED BY THEM
exports.getAllFilesCreatedByUser = async (req, res, next) => {
  const employeeId = res.locals.id;
  try {
    const pool = await sql.connect();
    const getFilesQuery = `SELECT 
    f.FILE_ID, 
    f.FILE_NAME ,
    v.VOUCHER_NAME, 
    f.CREATED_ON,
    f.REMARKS,
    f.SIGNED_BY_UPLOADER,
    f.SIGNED_BY_ALL 
    FROM tblFile f
    INNER JOIN tblVoucherType v 
    ON f.VOUCHER_ID = v.VOUCHER_ID
    WHERE f.CREATED_BY = @EMPLOYEE_ID
    ORDER BY f.CREATED_ON DESC`;

    const result = await pool
      .request()
      .input("EMPLOYEE_ID", sql.Int, employeeId)
      .query(getFilesQuery);

    if (!result) {
      return res.status(404).json({ error: "Try again later" });
    }
    res.status(200).json(result);
  } catch (error) {
    console.log("error in getting all files: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//DELETE FILE BY USER
exports.deleteFileByUser = async (req, res, next) => {
 const {employeeId, pool} = req;
 const {fileId} = req.params;

  try {
    const getCreatedBy = `SELECT CREATED_BY FROM tblFile WHERE FILE_ID = @FILE_ID`;

    const getResult = await pool
      .request()
      .input("FILE_ID", sql.Int, id)
      .query(getCreatedBy);

    if (!getResult.recordset[0]) {
      return res.status(404).json({ error: "File not found" });
    } 

    //extract created_by
    const createdBy = getResult.recordset[0].CREATED_BY;

    //check if createdby is equal to employeeid
    if (createdBy !== employeeId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this file" });
    }

    const deleteFileQuery = `DELETE FROM tblFile WHERE FILE_ID = @FILE_ID AND CREATED_BY = @EMPLOYEE_ID`;

    const result = await pool
      .request()
      .input("FILE_ID", sql.Int, id)
      .input("EMPLOYEE_ID", sql.Int, employeeId)
      .query(deleteFileQuery);

    if (!result) {
      return res.status(404).json({ error: "File not found" });
    }
    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.log("error in deleting file: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// AUTHENTICATED USER
exports.authenticateUser = async (req, res, next) => {
  const employeeId = res.locals.id;

  if (!employeeId) {
    return res.status(401).json({ error: "Unauthorized Access" });
  }
  req.employeeId = employeeId;
  next();
};

// FILE VALIDATION
exports.validateFileUpload = async (req, res, next) => {
  // TODO: WHY TO REASSIGN ON 509 LINE
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  if (!["pdf"].includes(file.mimetype.split("/")[1])) {
    return res
      .status(400)
      .json({ error: "Invalid file type. Only PDF are allowed" });
  }
  req.file = file;
  next();
};

// CONNECT TO DB
exports.connectToDatabase = async (req, res, next) => {
  try {
    const pool = await sql.connect();
    req.pool = pool;
    next();
  } catch (error) {
    console.log("Database connection error: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//UPLOAD FILE WITHOUT SIGNATURE
exports.insertFileWithoutSignature = async (req, res, next) => {
  const { fileName, departmentId, remarks, fileUploadValue } = req.body;
  const { file, pool, voucherId, employeeId } = req;

  if (fileUploadValue === 1) {
    const uploadWithoutSignQuery = `INSERT INTO tblFile(FILE_NAME,FILE_DATA,CREATED_BY,DEPARTMENT_ID,VOUCHER_ID,REMARKS)
    VALUES(@FILE_NAME,@FILE_DATA,@CREATED_BY,@DEPARTMENT_ID,@VOUCHER_ID,@REMARKS)`;
    await pool
      .request()
      .input("FILE_NAME", sql.NVarChar, fileName)
      .input("FILE_DATA", sql.VarBinary(sql.MAX), file.Buffer())
      .input("CREATED_BY", sql.Int, employeeId)
      .input("DEPARTMENT_ID", sql.Int, departmentId)
      .input("VOUCHER_ID", sql.Int, voucherId)
      .input("REMARKS", sql.NVarChar, remarks)
      .query(uploadWithoutSignQuery);

    return res.status(200).json({ message: "File just saved!!" });
  }
  next();
};

//GET DIGITAL SIGNATURE
exports.fetchDigitalSignature = async (req, res, next) => {
  const { pool, employeeId } = req;
  try {
    const getDigitalSignatureQuery = `SELECT FILE_DATA FROM tblDigitalSignature WHERE EMPLOYEE_ID = @EMPLOYEE_ID`;
    const result = await pool
      .request()
      .input("EMPLOYEE_ID", sql.Int, employeeId)
      .query(getDigitalSignatureQuery);

    if (!result.recordset.length) {
      return res
        .status(404)
        .json({ error: "No digital signature found for this user" });
    }
    const digitalSignature = result.recordset[0].FILE_DATA;
    if (!Buffer.isBuffer(digitalSignature)) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
    req.digitalSignature = digitalSignature;
    next();
  } catch (error) {
    console.log("error in fetching digital signature: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//PROCESS PDF
exports.addDigitalSognature = async (req, res, next) => {
  const { pool, employeeId, digitalSignature, file } = req;
  try {
    const pdfDoc = await PDFDocument.load(file.buffer);
    const pngImage = await pdfDoc.embedPng(digitalSignature);
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];
    const pageWidth = lastPage.getWidth();
    //TODO: CHECKING IF THE IMAGE DOES NOT OVERWRITE THE PDF
    const desiredWidth = 100;
    const desiredHeight = 50;
    const margin = 50;
    console.log(pageWidth);
    const gapBetweenSignatures =
      (pageWidth - 2 * margin - desiredWidth * signaturesRequired) /
      (signaturesRequired - 1);

    let signaturesDone;
    signaturesDone = 0;
    const positionX =
      margin +
      desiredWidth * signaturesDone +
      gapBetweenSignatures * (signaturesDone === 0 ? 0 : signaturesDone);

    lastPage.drawImage(pngImage, {
      x: positionX,
      y: margin,
      width: desiredWidth,
      height: desiredHeight,
    });
    const updatedPdfBytes = await pdfDoc.save();
    req.updatedPdfBuffer = Buffer.from(updatedPdfBytes);
    next();
  } catch (error) {
    console.log("error in adding digital signature: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//INSERT SIGNED FILE IN DB
exports.insertFileWithSignature = async (req, res, next) => {
  const { fileName, departmentId, remarks } = req.body;
  const { updatedPdfBuffer, pool, employeeId, voucherId } = req;

  try {
    const uQuery = `INSERT INTO tblFile (FILE_NAME,FILE_DATA,CREATED_BY,DEPARTMENT_ID,VOUCHER_ID,REMARKS,SIGNATURES_DONE,SIGNED_BY_UPLOADER) 
    OUTPUT INSERTED.FILE_ID 
    VALUES (@FILE_NAME,@FILE_DATA,@CREATED_BY,@DEPARTMENT_ID,@VOUCHER_ID,@REMARKS,@SIGNATURES_DONE,@SIGNED_BY_UPLOADER)`;

    const result = await pool
      .request()
      .input("FILE_NAME", sql.NVarChar, fileName)
      .input("FILE_DATA", sql.VarBinary(sql.MAX), updatedPdfBuffer)
      .input("CREATED_BY", sql.Int, employeeId)
      .input("DEPARTMENT_ID", sql.Int, departmentId)
      .input("VOUCHER_ID", sql.Int, voucherId)
      .input("REMARKS", sql.NVarChar, remarks)
      .input("SIGNATURES_DONE", sql.Int, 1)
      .input("SIGNED_BY_UPLOADER", sql.Bit, 1)
      .query(uQuery);

    const fileId = result.recordset[0].FILE_ID;
    req.fileId = fileId;

    const insertIntoSignatureLogQuery = `INSERT INTO tblSignatureLog(FILE_ID,EMPLOYEE_ID,SIGNED_ON,STATUS) VALUES(@FILE_ID,@EMPLOYEE_ID,@SIGNED_ON,@STATUS)`;

    await pool
      .request()
      .input("FILE_ID", sql.Int, fileId)
      .input("EMPLOYEE_ID", sql.Int, employeeId)
      .input("SIGNED_ON", sql.Date, new Date())
      .input("STATUS", sql.Int, 1)
      .query(insertIntoSignatureLogQuery);

    next();
  } catch (error) {v
    console.log("error in inserting file with signature: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//SENDING FORWARD FOR APPROVAL
exports.forwardForApproval = async (req, res, next) => {
  const { fileId, pool, body, employeeId, voucherId, signaturesRequired } = req;
  const { fileUploadValue, sendFileTo } = body;
  try {
    if (signaturesRequired == 1) {
      const updateTheFileQuery = `
      UPDATE tblFile
      SET SIGNED_BY_ALL = @SIGNED_BY_ALL,
      WHERE FILE_ID = @FILE_ID
      `;
      const updateResult = await pool
        .request()
        .input("SIGNED_BY_ALL", sql.Bit, 1)
        .input("FILE_ID", sql.Int, fileId)
        .query(updateTheFileQuery);

      return res.status(200).json({ message: "File approved for approval" });
    }
    if (fileUploadValue == 3) {
      //insert into signature log
      const insertIntoSignatureLogQuery = `
      INSERT INTO tblSignatureLog(FILE_ID, EMPLOYEE_ID, SIGNED_ON, STATUS) VALUES(@FILE_ID,@EMPLOYEE_ID,@SIGNED_ON,@STATUS)`;
      await pool
        .request()
        .input("FILE_ID", sql.Int, fileId)
        .input("EMPLOYEE_ID", sql.Int, employeeId)
        //TODO: YEH NEW DATE NAHI JANA HAI
        .input("SIGNED_ON", sql.Date, new Date())
        .input("STATUS", sql.Int, 0)
        .query(insertIntoSignatureLogQuery);
      return res.status(200).json({ message: "File forwarded for approval" });
    }
    res.status(200).json({ message: "File uploaded and saved successfullyg" });
  } catch (error) {
    console.log("error in forwarding for approval: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//GET THE EXISTING PDF

//DECLINE A FILE
exports.declineFile = async (req, res, next) => {
  const { remarks } = req.body;
  const { pool, employeeId } = req;
  const { id } = req.params;
  const fileId = id;
  try {
    //TODO: FIND IF ITS THE CORRECT MANAGER!!
    const declineQuery = `
    UPDATE tblSignatureLog
    SET 
    STATUS = 2,
    SIGNED_ON = @SIGNED_ON,
    REMARKS = @REMARKS
    WHERE FILE_ID = @FILE_ID AND EMPLOYEE_ID = @EMPLOYEE_ID
    `;
    const declineResult = await pool
      .request()
      .input("SIGNED_ON", sql.Date, new Date())
      .input("REMARKS", sql.NVarChar, remarks)
      .input("FILE_ID", sql.Int, fileId)
      .input("EMPLOYEE_ID", sql.Int, employeeId)
      .query(declineQuery);

    return res.status(200).json({ message: "File declined for approval" });
  } catch (error) {
    console.log("error in declining file: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// GET ALL APPROVED FILES PER USER
exports.approvedFilesPerUser = async (req, res, next) => {
  const { employeeId, pool } = req;
  try {
    const searchQuery = ` 
    SELECT
    f.FILE_ID,
    f.FILE_NAME,
    f.CREATED_BY,
    f.REMARKS,
    v.VOUCHER_NAME
    FROM tblFile f
    INNER JOIN tblVoucher v ON f.VOUCHER_ID = v.VOUCHER_ID
    WHERE f.SIGNED_BY_ALL = 1 AND f.EMPLOYEE_ID = @EMPLOYEE_ID
    ORDER BY
    f.CREATED_ON DESC
    `;
    const result = await pool
      .request()
      .input("EMPLOYEE_ID", sql.Int, employeeId)
      .query(searchQuery);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.log("error in fetching approved files: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// GET ALL DECLINED FILES PER USER
exports.declinedFilesPerUser = async (req, res, next) => {
  const { employeeId, pool } = req;
  try {
    const searchQuery = `
    SELECT
    f.FILE_ID,
    f.FILE_NAME,
    f.CREATED_BY,
    f.REMARKS,
    sl.REMARKS,
    e.FIRST_NAME + ' ' + e.LAST_NAME AS PERSON_WHO_DECLINED,
    v.VOUCHER_NAME
    FROM tblFile f
    INNER JOIN tblVoucher v ON f.VOUCHER_ID = v.VOUCHER_ID
    INNER JOIN tblSignatureLog sl ON f.FILE_ID = sl.FILE_ID
    WHERE f.STATUS = 2 AND f.EMPLOYEE_ID = @EMPLOYEE_ID
    ORDER BY
    f.CREATED_ON DESC
    `;
    const result = await pool
      .request()
      .input("EMPLOYEE_ID", sql.Int, employeeId)
      .query(searchQuery);
    res.status(200).json(result);
  } catch (error) {
    console.log("error in fetching declined files: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//GET ALL UNSIGNED SAVED FILES PER USER

exports.unsignedSavedFilesPerUser = async (req, res, next) => {
  const { employeeId, pool } = req;
  try {
    const searchQuery = `
    SELECT
    f.FILE_ID,
    f.FILE_NAME,
    f.CREATED_BY,
    f.REMARKS,
    v.VOUCHER_NAME
    FROM tblFile f
    INNER JOIN tblVoucher v ON f.VOUCHER_ID = v.VOUCHER_ID
    WHERE f((f.SIGNATURES_DONE = 0 AND f.SIGNED_BY_UPLOADER = 0) OR (SIGNED_BY_UPLOADER = 1)) AND CREATED_BY = @EMPLOYEE_ID
    ORDER BY
    f.CREATED_ON DESC
    `;
    const result = await pool
      .request()
      .input("EMPLOYEE_ID", sql.Int, employeeId)
      .query(searchQuery);
    res.status(200).json(result);
  } catch (error) {
    console.log("error in fetching unsigned saved files: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
