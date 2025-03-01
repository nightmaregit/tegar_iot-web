import {
  Box,
  Flex,
  Heading,
  IconButton,
  Text,
  Button,
  VStack,
  useColorMode,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  MdDarkMode,
  MdLightMode,
  MdLightbulbOutline,
  MdLogout,
} from "react-icons/md";
import { FaFan, FaHome } from "react-icons/fa";
import GaugeChart from "react-gauge-chart";
import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db, auth } from "../firebase";
import { signOut } from "firebase/auth";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";

function Dashboard() {
  const bulbSize = useBreakpointValue({ base: 100, md: 150, lg: 200 });

  const { colorMode, toggleColorMode } = useColorMode();
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [temperature, setTemperature] = useState(0);
  const [humidity, setHumidity] = useState(0);

  const headingSize = useBreakpointValue({ base: "xl", md: "xl", lg: "xl" });

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

  useEffect(() => {
    const tempRef = ref(db, "/dht22/temperature");
    const humRef = ref(db, "/dht22/humidity");
    const user = auth.currentUser;
    if (user) {
      setUserName(user.displayName || user.email); // Gunakan displayName jika ada, jika tidak gunakan email
    }

    const unsubTemp = onValue(tempRef, (snapshot) => {
      if (snapshot.exists()) {
        setTemperature(snapshot.val());
      }
    });

    const unsubHum = onValue(humRef, (snapshot) => {
      if (snapshot.exists()) {
        setHumidity(snapshot.val());
      }
    });

    return () => {
      unsubTemp();
      unsubHum();
    };
  }, []);

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

      {/* Main Content */}

      <Flex
        minH="100vh"
        w="full"
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
              Selamat datang, {userName}!
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
            {/* gauge */}
            <Flex
              bg={colorMode === "light" ? "gray.100" : "gray.600"}
              p={4}
              pb={8}
              direction="row"
              rounded="md"
              align="center"
              flexWrap="wrap"
              justify="space-between"
              w={{ base: "full", md: 1 === 1 ? "full" : "48%" }}
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "md",
              }}
              transition="all 0.2s ease-in-out"
            >
              <Flex w="full" justify="space-between" alignItems="center">
                <Text
                  fontSize={{ base: "lg", md: "xl" }}
                  mb={"20px"}
                  fontWeight="bold"
                  color={colorMode === "light" ? "gray.800" : "white"}
                >
                  {`Temperature dan Humidity`}
                </Text>
              </Flex>

              <Flex
                flexWrap="wrap"
                w="full"
                justifyContent="space-around"
                align="center"
                gap={8}
              >
                {/* Gauge for temperature */}
                <Flex>
                  <Box
                    bg={colorMode === "light" ? "gray.100" : "gray.800"}
                    rounded="2xl"
                    shadow="lg"
                    w={{ base: "230px" }}
                    textAlign="center"
                  >
                    <Text fontSize="lg" fontWeight="bold" mb={2}>
                      Temperature
                    </Text>
                    <GaugeChart
                      id="temperature-gauge"
                      nrOfLevels={10}
                      hideText={true}
                      animate={false}
                      // const deg = Math.round(((percent / 100) * 180 - 45) * 10) / 10;
                      percent={temperature / 100 + 0.5}
                      arcWidth={0.2}
                      colors={["#00ff00", "#ffcc00", "#ff0000"]}
                    />
                    <Text fontSize="2xl" fontWeight="bold" mt={2}>
                      {temperature}°C
                    </Text>
                  </Box>
                </Flex>

                {/* Gauge for Humidity */}
                <Flex>
                  <Box
                    bg={colorMode === "light" ? "gray.100" : "gray.800"}
                    rounded="2xl"
                    shadow="lg"
                    textAlign="center"
                  >
                    <Text fontSize="lg" fontWeight="bold" mb={2}>
                      Humidity
                    </Text>
                    <GaugeChart
                      id="humidity-gauge"
                      nrOfLevels={10}
                      hideText={true}
                      //animDelay={0}
                      animate={false}
                      percent={humidity / 100}
                      arcWidth={0.2}
                      colors={["#00f", "#0ff", "#fff"]}
                    />
                    <Text fontSize="2xl" fontWeight="bold" mt={2}>
                      {humidity}%
                    </Text>
                  </Box>
                </Flex>
              </Flex>
            </Flex>

            {/* Lampu */}
            <Flex
              onClick={() => navigate("/controlLampu")}
              bg={colorMode === "light" ? "gray.100" : "gray.600"}
              p={4}
              direction="row"
              rounded="md"
              align="center"
              flexWrap="wrap"
              justify="space-between"
              w={{ base: "full", md: 2 === 1 ? "full" : "48%" }}
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "md",
              }}
              transition="all 0.2s ease-in-out"
            >
              <Flex w="full" justify="space-between" alignItems="center">
                <Text
                  fontSize={{ base: "lg", md: "xl" }}
                  fontWeight="bold"
                  color={colorMode === "light" ? "gray.800" : "white"}
                >
                  {`Kontrol Lampu`}
                </Text>
              </Flex>

              <Flex
                flexWrap="wrap"
                w="full"
                justifyContent="center"
                align="center"
              >
                <MdLightbulbOutline
                  size={bulbSize}
                  style={{ transition: "color 0.3s" }}
                />
              </Flex>
            </Flex>

            {/* Kipas */}
            <Flex
              onClick={() => navigate("/controlKipas")}
              bg={colorMode === "light" ? "gray.100" : "gray.600"}
              p={4}
              direction="row"
              rounded="md"
              align="center"
              flexWrap="wrap"
              justify="space-between"
              w={{ base: "full", md: 2 === 1 ? "full" : "48%" }}
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "md",
              }}
              transition="all 0.2s ease-in-out"
            >
              <Flex w="full" justify="space-between" alignItems="center">
                <Text
                  fontSize={{ base: "lg", md: "xl" }}
                  fontWeight="bold"
                  color={colorMode === "light" ? "gray.800" : "white"}
                >
                  {`Kontrol Kipas`}
                </Text>
              </Flex>

              <Flex
                flexWrap="wrap"
                w="full"
                justifyContent="center"
                align="center"
              >
                <FaFan size={bulbSize} />
              </Flex>
            </Flex>
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

export default Dashboard;
