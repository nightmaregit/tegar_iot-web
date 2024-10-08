import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react"; // Tambahkan ini
import theme from "./them"; // Import tema yang akan kita buat
import LoginPage from "./pages/LoginPage";
import ControlLampu from "./pages/controlLampu";

function App() {
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Simpan user jika ada yang login
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/controlLampu"
            element={user ? <ControlLampu /> : <LoginPage />} // Jika user belum login, arahkan ke login
          />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
