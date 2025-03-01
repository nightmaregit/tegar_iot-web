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
  VStack,
  IconButton,
} from "@chakra-ui/react";
import { useState, useEffect, useCallback } from "react";
import {
  MdLightbulbOutline,
  MdLogout,
  MdDarkMode,
  MdLightMode,
} from "react-icons/md";
import { FaFan, FaHome } from "react-icons/fa";
import { auth, db } from "../firebase";
import { ref, onValue, set } from "firebase/database";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function ControlLampu() {
  const [userName, setUserName] = useState("");
  const [lights, setLights] = useState({
    dapur: false,
    makan: false,
  });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();

  // Fetch data secara terpusat
  useEffect(() => {
    const lampuRef = ref(db, "Lampu");
    const user = auth.currentUser;
    if (user) {
      setUserName(user.displayName || user.email); // Gunakan displayName jika ada, jika tidak gunakan email
    }
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
      Swal.fire({
        icon: "success",
        title: `LogOut Berhasil`,
        confirmButtonText: "OK",
      });
      navigate("/");
    } catch (error) {
      console.error("Error during logout: ", error);
    }
  };

  const headingSize = useBreakpointValue({ base: "2xl", md: "3xl", lg: "xl" });
  const bulbSize = useBreakpointValue({ base: 100, md: 150, lg: 200 });
  const isMobile = useBreakpointValue({ base: true, md: false });

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }
  return (
    <Flex minH="100vh" direction={isMobile ? "column" : "row"}>
      {/* Sidebar (Desktop) */}
      {!isMobile && (
        <VStack
          w="250px"
          p={4}
          bg={colorMode === "light" ? "white" : "gray.700"}
          shadow="lg"
          position="fixed"
          height="100vh"
        >
          <Heading mb={8} mt={8} textAlign="center" size="lg">
            Smart Home
          </Heading>

          <Flex gap={10} direction={"column"}>
            <Flex flex={1}>
              <Button
                w={"180px"}
                h={"50px"}
                fontSize={"20px"}
                leftIcon={<FaHome size={"30px"} />}
                onClick={() => navigate("/")}
                colorScheme={location.pathname === "/" ? "blue" : "gray"}
              >
                Dashboard
              </Button>
            </Flex>
            <Flex flex={1}>
              <Button
                w={"180px"}
                h={"50px"}
                fontSize={"20px"}
                leftIcon={<MdLightbulbOutline size={"30px"} />}
                onClick={() => navigate("/controlLampu")}
                colorScheme={
                  location.pathname === "/controlLampu" ? "blue" : "gray"
                }
              >
                Lampu
              </Button>
            </Flex>
            <Flex flex={1}>
              <Button
                w={"180px"}
                h={"50px"}
                fontSize={"20px"}
                leftIcon={<FaFan size={"30px"} />}
                onClick={() => navigate("/controlKipas")}
                colorScheme={
                  location.pathname === "/controlKipas" ? "blue" : "gray"
                }
              >
                Kipas
              </Button>
            </Flex>
          </Flex>
        </VStack>
      )}
      <Flex
        minH="100vh"
        ml={!isMobile ? "250px" : "0"}
        mb={!isMobile ? "0" : "72px"}
        bgGradient={
          colorMode === "light"
            ? "linear(to-r, blue.100, purple.100)"
            : "gray.800"
        }
        p={8}
        alignItems="center"
        justifyContent="center"
        w="full"
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
              textAlign="center"
              color={colorMode === "light" ? "gray.800" : "white"}
            >
              Kontrol Lampu {userName}
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
                w={{ base: "full", md: lights.length === 1 ? "full" : "48%" }}
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

      {isMobile && (
        <Flex
          w="full"
          p={4}
          bg={colorMode === "light" ? "gray.100" : "gray.800"}
          justify="space-around"
          position="fixed"
          bottom="0"
          left="0"
        >
          <Button
            w={"120px"}
            leftIcon={<FaHome />}
            onClick={() => navigate("/")}
            colorScheme={location.pathname === "/" ? "blue" : "gray"}
          >
            Dashboard
          </Button>

          <Button
            leftIcon={<MdLightbulbOutline />}
            onClick={() => navigate("/controlLampu")}
            colorScheme={
              location.pathname === "/controlLampu" ? "blue" : "gray"
            }
          >
            Lampu
          </Button>

          <Button
            leftIcon={<FaFan />}
            onClick={() => navigate("/controlKipas")}
            colorScheme={
              location.pathname === "/controlKipas" ? "blue" : "gray"
            }
          >
            Kipas
          </Button>
        </Flex>
      )}
    </Flex>
  );
}

export default ControlLampu;
