import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../Context";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Checkbox,
  Alert,
} from "@mui/material";
import { baseURL } from "../baseURL";

const SignUpPage = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Create useState hooks for all fields
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [managerId, setManagerId] = useState(0);
  const [departmentId, setDepartmentId] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated && user.IS_ADMIN === true) {
      // Fetch managers and departments only if authenticated and admin
      fetchManagers();
      fetchDepartments();
    } else {
      // If not authenticated or not admin, navigate to login page
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);

  const fetchManagers = async () => {
    try {
      const response = await axios.get(`${baseURL}/users/employeenames`);
      setManagers(response.data.recordsets[0]);
    } catch (error) {
      console.error("Error fetching managers:", error);
      setErrors((prevErrors) => ({
        ...prevErrors,
        managers: "Failed to fetch managers",
      }));
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${baseURL}/departments/alldepartments`);
      setDepartments(response.data.recordsets[0]);
    } catch (error) {
      console.error("Error fetching departments:", error);
      setErrors((prevErrors) => ({
        ...prevErrors,
        departments: "Failed to fetch departments",
      }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    let newErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
      isValid = false;
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
      isValid = false;
    }

    if (!gender) {
      newErrors.gender = "Gender is required";
      isValid = false;
    }

    if (!address.trim()) {
      newErrors.address = "Address is required";
      isValid = false;
    }

    if (managerId === 0) {
      newErrors.managerId = "Manager selection is required";
      isValid = false;
    }

    if (departmentId === 0) {
      newErrors.departmentId = "Department selection is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await axios.post(
          `${baseURL}/users/register`,
          {
            first_name: firstName,
            middle_name: middleName,
            last_name: lastName,
            email,
            password,
            gender,
            address,
            managerId,
            departmentId,
            isAdmin,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        if (response.data.success) {
          setSuccess(true);
          // Reset form or navigate to another page
        } else {
          setErrors({ submit: "Registration failed. Please try again." });
        }
      } catch (error) {
        console.error("Error during registration:", error);
        setErrors({ submit: "An error occurred during registration." });
      }
    }
  };

  return (
    //Box from mui
    <Box
      component="form"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        width: "100%",
        marginTop: "90px auto ",
      }}
      onSubmit={handleSubmit}
    >
      <Typography variant="h4">Sign Up</Typography>
      {success && <Alert severity="success">Registration successful!</Alert>}
      {errors.submit && <Alert severity="error">{errors.submit}</Alert>}
      <Grid container spacing={2} marginTop="10px">
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Middle Name"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Manager"
            value={managerId}
            onChange={(e) => setManagerId(parseInt(e.target.value))}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Department"
            value={departmentId}
            onChange={(e) => setDepartmentId(parseInt(e.target.value))}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
              />
            }
            label="Is Admin"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Button type="submit">Register</Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SignUpPage;
