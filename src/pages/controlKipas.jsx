import {
  Flex,
  Heading,
  Switch,
  Button,
  Box,
  Text,
  useColorMode,
  Spinner,
  IconButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useBreakpointValue,
  VStack,
} from "@chakra-ui/react";
import { FaFan, FaHome } from "react-icons/fa";
import { useState, useEffect } from "react";
import {
  MdLogout,
  MdDarkMode,
  MdLightbulbOutline,
  MdLightMode,
} from "react-icons/md";
import { auth, db } from "../firebase";
import { ref, onValue, set } from "firebase/database";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const fans = ["kamar"];

function ControlKipas() {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [userName, setUserName] = useState("");
  const [fanStates, setFanStates] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserName(user.displayName || user.email); // Gunakan displayName jika ada, jika tidak gunakan email
    }
    const unsubscribes = fans.map((fan) => {
      const statusRef = ref(db, `Kipas/${fan}`);
      const speedRef = ref(db, `Kipas/kecepatan${fan}`);

      const unsubscribeStatus = onValue(statusRef, (snapshot) => {
        setFanStates((prev) => ({
          ...prev,
          [fan]: { ...prev[fan], isOn: snapshot.val() },
        }));
        setLoading(false);
      });

      const unsubscribeSpeed = onValue(speedRef, (snapshot) => {
        const speedValue = snapshot.val();
        setFanStates((prev) => ({
          ...prev,
          [fan]: { ...prev[fan], speed: Math.round((speedValue / 180) * 100) },
        }));
      });

      return () => {
        unsubscribeStatus();
        unsubscribeSpeed();
      };
    });

    return () => unsubscribes.forEach((unsub) => unsub());
  }, []);

  const toggleFan = async (fan) => {
    const fanRef = ref(db, `Kipas/${fan}`);
    await set(fanRef, !fanStates[fan]?.isOn);
  };

  const handleSpeedChange = async (fan, value) => {
    const speedValue = Math.round((value * 180) / 100); // Konversi ke skala 0-180
    const speedRef = ref(db, `Kipas/kecepatan${fan}`);
    await set(speedRef, speedValue);
    setFanStates((prev) => ({
      ...prev,
      [fan]: { ...prev[fan], speed: value },
    }));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Swal.fire({
        icon: "success",
        title: "LogOut Berhasil",
        confirmButtonText: "OK",
      });
      navigate("/");
    } catch (error) {
      console.error("Error during logout: ", error);
    }
  };

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
              size="xl"
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
              <Button onClick={handleLogout} variant="outline">
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
            {fans.map((fan) => (
              <Flex
                key={fan}
                bg={colorMode === "light" ? "gray.100" : "gray.600"}
                p={4}
                direction="row"
                rounded="md"
                align="center"
                flexWrap="wrap"
                justify="space-between"
                w={{ base: "full", md: fans.length === 1 ? "full" : "48%" }}
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "md",
                }}
                transition="all 0.2s ease-in-out"
              >
                <Flex w="full" justify="space-between" alignItems="center">
                  <Text
                    fontSize="xl"
                    fontWeight="bold"
                    color={colorMode === "light" ? "gray.800" : "white"}
                  >
                    {fan
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                  </Text>
                  <Switch
                    isChecked={fanStates[fan]?.isOn}
                    onChange={() => toggleFan(fan)}
                    colorScheme="purple"
                  />
                </Flex>

                <Flex
                  flexWrap="wrap"
                  w="full"
                  justifyContent="center"
                  align="center"
                >
                  <FaFan
                    //   size={80}
                    size={fans.length === 1 ? 200 : 80}
                    color={
                      fanStates[fan]?.isOn
                        ? "blue"
                        : colorMode === "light"
                        ? "gray"
                        : "white"
                    }
                    style={{
                      transition: "color 0.3s",
                      animation: fanStates[fan]?.isOn
                        ? `spin ${
                            2 / (fanStates[fan]?.speed / 100)
                          }s linear infinite`
                        : "none",
                    }}
                  />
                </Flex>

                {fanStates[fan]?.isOn && (
                  <Box w="full" mt={4}>
                    <Text
                      fontSize="lg"
                      fontWeight="bold"
                      color={colorMode === "light" ? "gray.800" : "white"}
                    >
                      Kecepatan: {fanStates[fan]?.speed}%
                    </Text>
                    <Slider
                      defaultValue={fanStates[fan]?.speed}
                      min={0}
                      max={100}
                      step={1}
                      onChange={(value) => handleSpeedChange(fan, value)}
                      colorScheme="purple"
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb />
                    </Slider>
                  </Box>
                )}
              </Flex>
            ))}
          </Flex>

          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
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

export default ControlKipas;
