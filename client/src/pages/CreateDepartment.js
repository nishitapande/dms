import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../Context";
import { baseURL } from "../baseURL";
import axios from "axios";

const CreateDepartment = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [departmentName, setDepartmentName] = useState("");
  const [hodId, setHodId] = useState(0);
  const [managers, setManagers] = useState([]);
  const [errors, setErrors] = useState({ departmentName: "", hodId: 0 });

  useEffect(() => {
    const getManagers = async () => {
      try {
        const response = await fetch(`${baseURL}/users/employeenames`);
        setManagers(response.data.recordsets[0]);
      } catch (error) {
        console.log("Failed to get managers", error.message);
      }
    };

    getManagers();
  }, []);

  const validateForm = () => {
    let valid = true;

    const newErrors = { departmentName: "", hodId: 0 };

    if (!departmentName) {
      newErrors.departmentName = "Deparment Name is required";
      valid = false;
    }

    if (hodId === 0) {
      newErrors.hodId = "Head of Department is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const result = await axios.post(
        `${baseURL}/departments/adddepartment`,
        {
          departmentName,
          hodId,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (result.status === 200) {
        alert("Department created successfully");
        setDepartmentName("");
        setHodId(0);
        setErrors({ departmentName: "", hodId: 0 });
        navigate("/departments");
      }
    } catch (error) {
      console.log("Failed to create department", error.message);
      alert("Failed to create department");
    }
  };

  if (!user || user.IS_ADMIN !== true) {
    navigate("/login");
  }
  return (
    <Container maxWidth="sm" className="top-margin">
      <Typography variant="h4 gutterBottom">Craete Deparment</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          required
          fullWidth
          label="Department Name"
          name="departmentName"
          value={departmentName}
          onChange={(e) => setDepartmentName(e.target.value)}
          error={!!errors.departmentName}
          helperText={errors.departmentName}
          style={{
            marginBottom: "1rem",
          }}
        />

        <FormControl
          fullWidth
          style={{
            marginBottom: "1rem",
          }}
          error={!!errors.hodId}
        >
          <InputLabel>Select HOD</InputLabel>
          <Select
            required
            value={hodId}
            onChange={(e) => setHodId(parseInt(e.target.value))}
          >
            <MenuItem value={0}>Select Head of Department</MenuItem>
            {managers.map((manager) => (
              <MenuItem key={manager.EMPLOYEE_ID} value={manager.EMPLOYEE_ID}>
                {manager.NAME}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{errors.hodId}</FormHelperText>
        </FormControl>
        <Button variant="contained" color="primary" type="submit" fullWidth>
          Submit
        </Button>
      </form>
    </Container>
  );
};

export default CreateDepartment;
