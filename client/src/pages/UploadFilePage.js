import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../Context";
import { Box, Stack, Typography } from "@mui/material";
import UploadFile from "../components/UploadFile";

const UploadFilePage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        className="top-margin"
      >
        <Stack alignItems="center">
          <Typography variant="h4" align="center">
            Upload a file
          </Typography>
          <UploadFile />
        </Stack>
      </Box>
    </div>
  );
};

export default UploadFilePage;
