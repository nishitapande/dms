import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { baseURL } from "../baseURL";
import { Stack, TextField, Typography } from "@mui/material";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const validateForm = () => {
    if (!email || !password) {
      setError("All fields are required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const result = await axios.post(
        `${baseURL}/users/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      if (result.status === 200) {
        setSuccess(true);
        navigate("/");
      }
      setError(false);
    } catch (error) {
      if (error.response) {
        setError(
          error.response.data.message ||
            "An error occurred. Please try again later"
        );
      } else if (error.request) {
        setError("Network Error. Please try again later");
      } else {
        setError("An error occurred. Please try again later");
      }

      setSuccess(false);
    }
  };

  return (
    <Box
      component="form"
      sx={{
        "& > :not style": { m: 1, width: "40ch" },
      }}
      onSubmit={handleSubmit}
      noValidate
      autoComplete="off"
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <Stack spacing={2}>
        <Typography variant="h3" gutterBottom align="center">
          Login
        </Typography>
        {success && (
          <Alert severity="success">Login successful. Redirecting...</Alert>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Email"
          variant="outlined"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          value={email}
        />
        <TextField
          value={password}
          label="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Typography variant="body2">
          <Link to="/forgot-password" variant="body2">
            Forgot password?
          </Link>
        </Typography>

        <Button type="submit" variant="contained" color="primary" fullWidth>
          Login
        </Button>
      </Stack>
    </Box>
  );
};

export default LoginPage;
