import { extendTheme } from "@chakra-ui/react";

const config = {
  initialColorMode: "light", // Atur default ke light mode
  useSystemColorMode: false, // Tidak menggunakan preferensi sistem
};

const theme = extendTheme({ config });

export default theme;
