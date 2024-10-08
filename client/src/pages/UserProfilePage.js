import React from "react";

const UserProfilePage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeComponent, setActiveComponent] = useState("Profile");
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      axios;
      const fetchUserProfile = async () => {
        try {
          const response = await axios.get(`${baseURL}/users/getuserprofile`);
          setData(response.data.recordsets[0]);
        } catch (error) {
          console.error("Error fetching user info:", error);
        }
      };

      fetchUserProfile();
    }
  }, [isAuthenticated, navigate]);

  const renderComponent = () => {
    switch (activeComponent) {
      case "Profile":
        return <Profile data={data} />;
      case "DigitalSignature":
        return <DigitalSignature />;
    }
  };

  return (
    <div className="top-margin">
      <div>
        <Tabs
          setActiveComponent={setActiveComponent}
          activeComponent={activeComponent}
        />
      </div>
      <div>{renderComponent()}</div>
    </div>
  );
};

export default UserProfilePage;
