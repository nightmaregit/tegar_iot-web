import { StrictMode } from "react";
import App from "./App.jsx";
import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, CSSReset } from "@chakra-ui/react";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <ChakraProvider>
      <CSSReset />
      <App />
    </ChakraProvider>
  </StrictMode>
);
