const { sql } = require("../config/dbConfig");

//GET ALL DEPARTMENTS
exports.getAllDepartments = async (req, res, next) => {
  const pool = await sql.connect();
  const qfind = `SELECT DEPARTMENT_ID, DEPARTMENT_NAME FROM tblDepartment`;
  const result = await pool.request().query(qfind);
  res.status(200).json(result);
};

//GET A SINGLE DEPARTMENT

exports.getDepartmentById = async (req, res, next) => {
  const { id } = req.params.id;

  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("DEPARTMENT_ID", sql.Int, id)
      .query(
        `SELECT DEPARTMENT_ID, DEPARTMENT_NAME, HOD_ID FROM tblDepartment WHERE DEPARTMENT_ID = @DEPARTMENT_ID`
      );
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Department not found" });
    }
    res.status(200).json(result);
  } catch (error) {
    console.log("Failed to get department", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//ADD NEW DEPARTMENT
exports.addDepartment = async (req, res, next) => {
  const { departmentName, HOD_ID } = req.body;
  if (!departmentName || !HOD_ID) {
    return res
      .status(400)
      .json({ message: "Department Name and HOD is required" });
  }

  try {
    const pool = await sql.connect();
    const qadd = `INSERT INTO tblDepartment (DEPARTMENT_NAME, HOD_ID) VALUES (@departmentName, @HOD_ID)`;
    const result = await pool
      .request()
      .input("departmentName", sql.VarChar(50), departmentName)
      .input("HOD_ID", sql.Int, HOD_ID)
      .query(qadd);
    res.status(201).json({ message: "Department added successfully" });
  } catch (error) {
    console.log("Failed to add department", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//DELETE A DEPARTMENT

exports.deleteDepartment = async (req, res, next) => {
  const { id } = req.params.id;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("DEPARTMENT_ID", sql.Int, id)
      .query(`DELETE FROM tblDepartment WHERE DEPARTMENT_ID = @DEPARTMENT_ID`);
    if (result.rowsAffected === 0) {
      return res.status(404).json({ message: "Department not found" });
    }
    res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    console.log("Failed to delete department", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//UPDATE A DEPARTMENT

exports.updateDepartment = async (req, res, next) => {
  const { id } = req.params.id;
  const { departmentName, hodId } = req.body;

  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("DEPARTMENT_ID", sql.Int, id)
      .input("departmentName", sql.NVarChar, departmentName)
      .input("HOD_ID", sql.Int, hodId)
      .query(
        `UPDATE tblDepartment 
        SET DEPARTMENT_NAME=@departmentName, 
        HOD_ID=@HOD_ID 
        WHERE DEPARTMENT_ID = @DEPARTMENT_ID`
      );
    if (result.rowsAffected === 0) {
      return res.status(404).json({ message: "Department not found" });
    }
    res.status(200).json(result);
  } catch (error) {
    console.log("Failed to update department", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
