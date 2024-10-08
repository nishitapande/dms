import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { baseURL } from "../baseURL";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Typography,
} from "@mui/material";

import AuthContext from "../Context";

const SelectManager = ({ open, handleClose, handleSubmit }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [selectedManagerId, setSelectedManagerId] = useState(user.MANAGER_ID);
  const [error, setError] = useState(false);
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    const getManagers = async () => {
      try {
        const result = await axios.get(`${baseURL}/users/employeenames`);
        setManagers(result.data.recordsets[0]);
      } catch (error) {
        console.error("Error in fetching managers: ", error);
      }
    };

    getManagers();
  }, []);

  const onSubmit = () => {
    if (!selectedManagerId) {
      setError(true);
    } else {
      handleSubmit(selectedManagerId);
      setSelectedManagerId(0);
      setError(false);
    }
  };

  const handleChange = (e) => {
    setSelectedManagerId(parseInt(e.target.value));
    setError(false);
  };

  return (
    <Dialog open={open} onClose={handleChange} maxWidth="md" fullWidth>
      <DialogTitle>Select Manager</DialogTitle>
      <DialogContent>
        <FormControl fullWidth error={error}>
          <InputLabel>Manager</InputLabel>
          <Select
            value={user.MANAGER_ID}
            onChange={handleChange}
            label="Manager"
          >
            {managers.map((manager) => (
              <MenuItem key={manager.EMPLOYEE_ID}>
                {" "}
                value = {manager.EMPLOYEE_ID} {manager.NAME}{" "}
              </MenuItem>
            ))}
          </Select>
          {error && (
            <Typography variant="caption" color="error">
              Please select a manager
            </Typography>
          )}
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          color="primary"
          disabled={!selectedManagerId}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectManager;
