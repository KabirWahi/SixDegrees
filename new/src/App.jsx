import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react';

const App = () => {
  const [view, setView] = useState('home');

  if (view !== 'home') {
    return (
      <Box minH="100vh" display="grid" placeItems="center" bg="surface.900" px={4}>
        <Stack spacing={6} align="center" textAlign="center">
          <Heading size="lg" color="gray.100">
            {view === 'modes'
              ? 'Mode selection is on the way.'
              : 'Learn more content coming soon.'}
          </Heading>
          <Button onClick={() => setView('home')} colorScheme="brand" size="lg" borderRadius="full">
            Return Home
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-br, #0B0E17, #10131F)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
      py={{ base: 16, md: 24 }}
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top="-25%"
        left="-20%"
        w="420px"
        h="420px"
        bgGradient="radial(#6d74d1 0%, transparent 70%)"
        opacity={0.08}
      />
      <Container maxW="6xl">
        <Flex
          direction={{ base: 'column', lg: 'row' }}
          align={{ base: 'flex-start', lg: 'center' }}
          gap={{ base: 12, lg: 16 }}
        >
          <Stack spacing={6} maxW="3xl">
            <Box
              px={4}
              py={1.5}
              borderRadius="full"
              bg="#10131F"
              borderWidth="1px"
              borderColor="brand.500"
              width="fit-content"
              fontSize="sm"
              color="#9CA3AF"
              letterSpacing="wider"
              textTransform="uppercase"
            >
              Six Degrees of Football
            </Box>
            <Heading size="2xl" lineHeight="1.1" color="#E4E8FF">
              Can you connect the world of football in six steps?
            </Heading>
            <Text fontSize="lg" color="#9CA3AF" maxW="2xl">
              Dive into thirteen seasons of Europe&apos;s top leagues. Trace teammates, rivals, and
              transfer paths to link legends in record time.
            </Text>
            <HStack spacing={4} wrap="wrap">
              <Button
                size="lg"
                colorScheme="brand"
                borderRadius="full"
                px={10}
                onClick={() => setView('modes')}
              >
                Play Now
              </Button>
              <Link
                fontSize="md"
                color="gray.300"
                _hover={{ color: 'gray.100', textDecoration: 'none' }}
                onClick={() => setView('learn')}
              >
                Learn More
              </Link>
            </HStack>
            <Text fontSize="sm" color="#6f768a" letterSpacing="wide">
              13 seasons • 25,000 players • 5 leagues
            </Text>
          </Stack>

          <Box
            flex="1"
            maxW={{ base: '100%', lg: '460px' }}
            alignSelf="stretch"
            bg="#0B0E17"
            borderRadius="3xl"
            borderWidth="1px"
            borderColor="brand.600"
            boxShadow="2xl"
            p={6}
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top="-30%"
              right="-15%"
              w="360px"
              h="360px"
              bgGradient="radial(#6d74d1 0%, transparent 70%)"
              opacity={0.08}
            />
            <Stack spacing={6} position="relative">
              <Heading size="md" color="#E4E8FF">
                Game Modes
              </Heading>
              <Stack spacing={4}>
                <ModeCard
                  title="Explorer"
                  description="Free graph exploration"
                  accent="#38E8C6"
                />
                <ModeCard
                  title="Time Trial"
                  description="Beat the clock"
                  accent="#FF5A7E"
                />
                <ModeCard
                  title="Quick Play"
                  description="Random player challenge"
                  accent="#FFC54D"
                />
              </Stack>
              <Text fontSize="sm" color="#9CA3AF">
                Select your mode after pressing Play Now.
              </Text>
            </Stack>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

const ModeCard = ({ title, description, accent }) => (
  <Stack
    spacing={3}
    borderRadius="xl"
    borderWidth="1px"
    borderColor={`rgba(${parseInt(accent.slice(1, 3), 16)}, ${parseInt(accent.slice(3, 5), 16)}, ${parseInt(accent.slice(5, 7), 16)}, 0.3)`}
    bg="#10131F"
    px={4}
    py={3}
  >
    <Stack spacing={1}>
      <Text fontWeight="semibold" fontSize="lg" color="#E4E8FF">
        {title}
      </Text>
      <Text fontSize="sm" color="#9CA3AF">
        {description}
      </Text>
    </Stack>
    <Box
      h="3px"
      w="full"
      bg={`${accent}cc`}
      borderRadius="full"
    />
  </Stack>
);

export default App;
