import axios from "axios";
import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { baseURL } from "../baseURL";
import SearchBar from "../components/SearchBar";
import ReusableTable from "../components/ReusableTable";
import RemarkDialog from "../components/RemarkDialog";
import SelectManager from "../components/SelectManager";

const columns = [
  { id: "FILE_NAME", label: "File Name" },
  {
    id: "VOUCHER_NAME",
    label: "Voucher Type",
  },
  {
    id: "CREATED_ON",
    label: "Created On",
  },
  {
    id: "REMARKS",
    label: "Remarks",
  },
  {
    id: "NAME",
    label: "Created By",
  },
];

const DocumentsToSignPage = () => {
  const [data, setData] = useState([]);
  const [remarkDialogOpen, setRemarkDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [managerDialogOpen, setManagerDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [signaturesRequired, setSignaturesRequired] = useState(0);
  const navigate = useNavigate();

  const refreshData = useCallback(() => {
    setRefreshKey((prevKey) => prevKey + 1);
  }, []);

  const handleOpenRemarkDialog = (row) => {
    setSelectedRow(row);
    setRemarkDialogOpen(true);
  };
  const handleCloseRemarkDialog = () => {
    setSelectedRow(null);
    setRemarkDialogOpen(false);
  };

  const handleOpenManagerDialog = (row) => {
    setSelectedRow(row);
    setManagerDialogOpen(true);
    setSignaturesRequired(row.SIGNATURES_REQUIRED);
  };
  const handleCloseManagerDialog = () => {
    setManagerDialogOpen(false);
  };

  const handleSubmitRemarks = async (remarks) => {
    if (selectedRow) {
      try {
        await axios.patch(
          `${baseURL}/files/declinefile/${selectedRow.FILE_ID}`,
          { remarks }
        );
        alert("File has been declined successfully ");
        refreshData();
      } catch (error) {
        console.error("Failed to decline file", error.message);
      }
      handleCloseRemarkDialog();
    }
  };

  const handleMangerSubmit = async (manager) => {
    if (!selectedRow) return;
    try {
      const result = await axios.patch(
        `${baseURL}/files/${selectedRow.FILE_ID}`,
        {
          sendTo: manager,
        }
      );
      if (result.status === 200) {
        alert("File has been sent to manager successfully ");
        refreshData();
      }
    } catch (error) {
      console.error("Failed to send file to manager", error.message);
    }
    handleCloseManagerDialog();
  };

  const actions = [
    {
      label: "Approve",
      handler: async (row) => {
        if (row.SIGNATURES_REQUIRED === row.SIGNATURES_DONE) {
          const result = await axios.patch(`${baseURL}/files/${row.FILE_ID}`);
          if (result.status === 200) {
            alert("File has been approved successfully ");
            refreshData();
          }
        } else {
          handleOpenManagerDialog(row);
        }
      },
      color: "Green",
    },
    {
      label: "Decline",
      handler: (row) => handleOpenRemarkDialog(row),
      color: "Red",
    },
    {
      label: "View",
      handler: (row) => navigate(`/view-file/${row.FILE_ID}`),
      color: "Blue",
    },
  ];

  const conditionalActions = (row) => {
    const availableActions = ["View", "Approve", "Delete"];
    return availableActions;
  };

  return (
    <div className="top-margin">
      <SearchBar
        endPoint={`${baseURL}/files/unsignedfiles`}
        setData={setData}
        filterKeys={["FILE_NAME", "VOUCHER_NAME", "NAME"]}
        placeholder="Search files for approval"
        refreshKey={refreshKey}
      />
      <ReusableTable
        columns={columns}
        rows={data}
        actions={actions}
        conditionalActions={conditionalActions}
      />
      <RemarkDialog
        open={remarkDialogOpen}
        handleClose={handleCloseRemarkDialog}
        handleSubmit={handleSubmitRemarks}
      />
      <SelectManager
        open={managerDialogOpen}
        handleClose={handleCloseManagerDialog}
        handleSubmit={handleMangerSubmit}
        signaturesRequired={signaturesRequired}
      />
    </div>
  );
};

export default DocumentsToSignPage;
