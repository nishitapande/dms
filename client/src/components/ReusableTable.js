import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Button,
  Paper,
} from "@mui/material";

const ReusableTable = ({ columns, rows, actions, conditionalActions }) => {
  const getButtonColor = (actionLabel) => {
    const action = actions.find((a) => a.label === actionLabel);
    return action ? action.color : "default";
  };
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>S.No</TableCell>
            {columns.map((column) => (
              <TableCell key={column.id}>
                <TableSortLabel> {column.label} </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              <TableCell> {index + 1} </TableCell>
              {columns.map((column) => (
                <TableCell key={column.id}>{row[column.id]}</TableCell>
              ))}

              <TableCell>
                {conditionalActions(row).map((action, i) => (
                  <Button
                    key={i}
                    onClick={() => {
                      const actionHandler = actions.find(
                        (a) => a.label === action
                      )?.handler;
                      if (actionHandler) actionHandler(row);
                    }}
                    variant="contained"
                    
                    style={{
                      marginRight: "5px",
                      backgroundColor: getButtonColor(action),
                      color: "white",
                    }}
                  >
                    {" "}
                    {action}{" "}
                  </Button>
                ))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ReusableTable;
