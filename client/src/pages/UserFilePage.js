import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../Context";
import SavedFiles from "../components/SavedFiles";
// import ViewFileCreatedByUserPage from "../components/ViewFileCreatedByUserPage";
import ApprovedFiles from "../components/ApprovedFiles";
import DeclinedFiles from "../components/DeclinedFiles";

const UserFilePage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeComponent, setActiveComponent] = useState("Saved Files");

  const renderComponent = () => {
    switch (activeComponent) {
      case "Saved Files":
        return <SavedFiles />;
      // case "Send":
      //   return <ViewFileCreatedByUserPage />;
      case "Approved":
        return <ApprovedFiles />;
      case "Declined":
        return <DeclinedFiles />;
    }
  };
  return (
    <div className="top-margin">
      <div className="tabs-container">
        <div className="tabs-wrapper">
          <ul className="tabs-list">
            <li
              className={`tabs-item ${
                activeComponent === "Saved Files" ? "active" : ""
              }`}
              onClick={() => setActiveComponent("Saved Files")}
            >
              {" "}
              Saved Files
            </li>
            <li
              className={`tabs-item ${
                activeComponent === "Send" ? "active" : ""
              }`}
              onClick={() => setActiveComponent("Send")}
            >
              {" "}
              Files Sent
            </li>
            <li
              className={`tabs-item ${
                activeComponent === "Approved" ? "active" : ""
              }`}
              onClick={() => setActiveComponent("Approved")}
            >
              {" "}
              Approved Files
            </li>
            <li
              className={`tabs-item ${
                activeComponent === "Declined" ? "active" : ""
              }`}
              onClick={() => setActiveComponent("Declined")}
            >
              {" "}
              Declined Files
            </li>
          </ul>
        </div>
      </div>
      <div>{renderComponent()}</div>
    </div>
  );
};

export default UserFilePage;
