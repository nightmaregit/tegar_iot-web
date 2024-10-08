import {
  Flex,
  Heading,
  Switch,
  Button,
  Box,
  Text,
  useColorMode,
  useBreakpointValue,
  Spinner,
  IconButton,
} from "@chakra-ui/react";
import { useState, useEffect, useCallback } from "react";
import {
  MdLightbulbOutline,
  MdLogout,
  MdDarkMode,
  MdLightMode,
} from "react-icons/md";
import { auth, db } from "../firebase";
import { ref, onValue, set } from "firebase/database";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function ControlLampu() {
  const [lights, setLights] = useState({
    dapur: false,
    tamu: false,
    makan: false,
  });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();

  // Fetch data secara terpusat
  useEffect(() => {
    const lampuRef = ref(db, "Lampu");
    const unsubscribe = onValue(lampuRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setLights(data);
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup saat komponen unmount
  }, []);

  // Toggle untuk lampu yang debounced
  const toggleLight = useCallback(
    async (room) => {
      try {
        const lampRef = ref(db, `Lampu/${room}`);

        await set(lampRef, !lights[room]);
      } catch (error) {
        const user = auth.currentUser;
        if (user && user.email !== "coba@gmail.com") {
          Swal.fire({
            icon: "error",
            title: `Tidak dapat menyalakan Ruangan ${room}`,
            text: "Anda tidak login menggunakan akun pemilik rumah",
            footer: error.message,
            confirmButtonText: "OK",
          });
        } else {
          console.error(`Error toggling light for ${room}: `, error);
        }
      }
    },
    [lights]
  );

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error during logout: ", error);
    }
  };

  const headingSize = useBreakpointValue({ base: "2xl", md: "3xl", lg: "4xl" });
  const bulbSize = useBreakpointValue({ base: 100, md: 150, lg: 200 });

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }
  return (
    <Flex
      minH="100vh"
      bgGradient={
        colorMode === "light"
          ? "linear(to-r, blue.100, purple.100)"
          : "gray.800"
      }
      p={8}
      alignItems="center"
      justifyContent="center"
    >
      <Flex
        maxW="7xl"
        w="full"
        bg={colorMode === "light" ? "white" : "gray.700"}
        boxShadow="lg"
        rounded="lg"
        p={8}
        direction="column"
      >
        <Flex
          justify="space-between"
          flexWrap="wrap"
          gap={5}
          align="center"
          mb={8}
          direction={{ base: "column", md: "row" }}
        >
          <Heading
            as="h1"
            size={headingSize}
            color={colorMode === "light" ? "gray.800" : "white"}
          >
            Smart Home
          </Heading>
          <Flex gap={4}>
            <IconButton
              aria-label="Toggle Dark Mode"
              onClick={toggleColorMode}
              icon={colorMode === "light" ? <MdDarkMode /> : <MdLightMode />}
            />
            <Button
              aria-label="Logout"
              onClick={handleLogout}
              variant="outline"
              w={{ base: "full", md: "auto" }}
              color={colorMode === "light" ? "gray.800" : "white"}
            >
              <Flex gap={2}>
                <MdLogout size={20} />
                <Text>LogOut</Text>
              </Flex>
            </Button>
          </Flex>
        </Flex>

        <Flex
          flexWrap="wrap"
          justifyContent="space-between"
          gap={8}
          direction={{ base: "column", md: "row" }}
        >
          {Object.entries(lights).map(([room, isOn]) => (
            <Flex
              key={room}
              bg={colorMode === "light" ? "gray.100" : "gray.600"}
              p={4}
              direction="row"
              rounded="md"
              align="center"
              flexWrap="wrap"
              justify="space-between"
              w={{ base: "full", md: "48%" }}
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "md",
              }}
              transition="all 0.2s ease-in-out"
              onClick={() => toggleLight(room)}
            >
              <Flex w="full" justify="space-between" alignItems="center">
                <Text
                  fontSize={{ base: "lg", md: "xl" }}
                  fontWeight="bold"
                  color={colorMode === "light" ? "gray.800" : "white"}
                >
                  {`Ruang ${room.charAt(0).toUpperCase() + room.slice(1)}`}
                </Text>
                <Box
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Switch
                    isChecked={isOn ?? false}
                    onChange={() => toggleLight(room)}
                    colorScheme="purple"
                  />
                </Box>
              </Flex>

              <Flex
                flexWrap="wrap"
                w="full"
                justifyContent="center"
                align="center"
              >
                <MdLightbulbOutline
                  size={bulbSize}
                  color={
                    isOn ? "yellow" : colorMode === "light" ? "gray" : "white"
                  }
                  style={{ transition: "color 0.3s" }}
                />
              </Flex>
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
}

export default ControlLampu;
