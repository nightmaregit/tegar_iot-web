import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  Spinner,
  useColorMode,
  IconButton,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { SunIcon, MoonIcon } from "@chakra-ui/icons"; // Ikon untuk toggle tema
import Swal from "sweetalert2";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();
  const { colorMode, toggleColorMode } = useColorMode(); // Hook untuk mengelola dark/light mode

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Mulai loading
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const akun = userCredential.user;
      Swal.fire({
        icon: "success",
        title: `Login Berhasil`,
        text: `Anda Menggunakan Akun ${akun.email}`,
        confirmButtonText: "OK",
      });
      setLoading(false); // Berhenti loading
      navigate("/controlLampu");
    } catch (err) {
      setLoading(false); // Berhenti loading
      Swal.fire({
        icon: "error",
        title: `Login Gagal`,
        text: `Silakan periksa email dan password Anda.`,
        confirmButtonText: "OK",
      });
      setError("Login gagal. Silakan periksa email dan password Anda.");
    }
  };

  return (
    <Flex
      minH="100vh"
      alignItems="center"
      justifyContent="center"
      bgGradient={
        colorMode === "light"
          ? "linear(to-r, blue.500, purple.600)"
          : "linear(to-r, gray.800, gray.900)"
      } // Sesuaikan gradien berdasarkan mode
      position="relative"
    >
      {/* Tombol untuk Toggle Dark/Light Mode */}
      <IconButton
        aria-label="Toggle Dark Mode"
        onClick={toggleColorMode}
        icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
        isRound
        size="lg"
        position="absolute"
        top="2rem" // Jarak dari atas
        right="2rem" // Jarak dari kanan
        bg={colorMode === "light" ? "gray.200" : "gray.700"}
        _hover={{ bg: colorMode === "light" ? "gray.300" : "gray.600" }}
      />

      <Box
        w="full"
        maxW="md"
        p={8}
        bg={colorMode === "light" ? "white" : "gray.700"} // Sesuaikan warna box
        color={colorMode === "light" ? "gray.900" : "white"}
        rounded="xl"
        shadow="2xl"
        transform
        transition="all"
        _hover={{ transform: "scale(1.05)" }}
      >
        <Center flexDir="column" mb={6}>
          <Heading as="h1" size="2xl">
            Welcome Back
          </Heading>
          <Text mt={2}>Sign in to control your smart home</Text>
        </Center>

        {error && <Text color="red.500">{error}</Text>}

        <form onSubmit={handleLogin}>
          <FormControl id="email" mb={4}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              bg={colorMode === "light" ? "gray.100" : "gray.600"} // Warna input sesuai mode
            />
          </FormControl>
          <FormControl id="password" mb={6}>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              bg={colorMode === "light" ? "gray.100" : "gray.600"} // Warna input sesuai mode
            />
          </FormControl>
          <Button
            bg={colorMode === "light" ? "black" : "purple.500"}
            color="white"
            width="full"
            type="submit"
            isDisabled={loading} // Disable button saat loading
            _hover={{ bg: colorMode === "light" ? "gray.800" : "purple.600" }} // Hover sesuai mode
          >
            {loading ? <Spinner size="sm" /> : "Sign In"}
          </Button>
        </form>
      </Box>
    </Flex>
  );
}

export default LoginPage;
