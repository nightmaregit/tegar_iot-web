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
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { MdLogout, MdDarkMode, MdLightMode } from "react-icons/md";
import { FaFan } from "react-icons/fa";
import { auth, db } from "../firebase";
import { ref, onValue, set } from "firebase/database";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const fans = ["kamar"];

function ControlKipas() {
  const [fanStates, setFanStates] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
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
        setFanStates((prev) => ({
          ...prev,
          [fan]: { ...prev[fan], speed: snapshot.val() },
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
    const speedRef = ref(db, `Kipas/kecepatan${fan}`);
    await set(speedRef, value);
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
            size="xl"
            color={colorMode === "light" ? "gray.800" : "white"}
          >
            Smart Fan Control
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
  );
}

export default ControlKipas;
