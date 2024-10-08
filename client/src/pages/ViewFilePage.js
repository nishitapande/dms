import React from "react";
import SearchBar from "../components/SearchBar";
import { Link } from "react-router-dom";

const ViewFilePage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);
  return (
    <div className="top-margin">
      <Box
        sx={{
          flexGrow: 1,
        }}
        classNamemargin-x
      >
        <SearchBar
          setData={setData}
          endpoint={`${baseURL}/security/userdepartments`}
          fileterKeys={["DEPARTMENT_NAME"]}
          placeholder="Search by department name"
        />
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
        >
          {data.length === 0 ? (
            <div> No departments found </div>
          ) : (
            data.map((department) => {
              <Grid item xs={2} sm={4} md={4} key={department.DEPARTMENT_ID}>
                <Link to={`/documentList/${department.DEPARTMENT_ID}`}>
                  <CardComp> {department.DEPARTMENT_NAME} </CardComp>
                </Link>
              </Grid>;
            })
          )}
        </Grid>
      </Box>
    </div>
  );
};

export default ViewFilePage;
