import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { AuthContextProvider } from "./Context";

function App() {
  return (
    <div>
      <AuthContextProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </AuthContextProvider>
    </div>
  );
}

export default App;
