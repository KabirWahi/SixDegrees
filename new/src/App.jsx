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
  SimpleGrid,
} from '@chakra-ui/react';

const App = () => {
  const [view, setView] = useState('home');

  if (view === 'modes') {
    return (
      <Box minH="100vh" bg="#0B0E17" position="relative">
        <Button
          position="absolute"
          top={{ base: 4, md: 6 }}
          left={{ base: 4, md: 8 }}
          colorScheme="brand"
          borderRadius="full"
          onClick={() => setView('home')}
          zIndex={1}
        >
          ← Back
        </Button>
        <Container
          maxW="6xl"
          minH="100vh"
          display="flex"
          alignItems="center"
          py={{ base: 16, md: 24 }}
        >
          <Stack spacing={12} w="full" mt={{ base: 16, md: -10 }}>
            <Stack spacing={2} textAlign={{ base: 'left', md: 'center' }} mx="auto">
              <Heading size={{ base: 'lg', md: 'xl' }} color="#E4E8FF">
                Choose Mode
              </Heading>
              <Text fontSize={{ base: 'md', md: 'lg' }} color="#9CA3AF">
                Three ways to play
              </Text>
            </Stack>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 6, md: 8 }}>
              {[
                {
                  label: 'Explorer',
                  description: 'Free graph exploration',
                  accent: '#38E8C6',
                },
                {
                  label: 'Time Trial',
                  description: 'Beat the clock',
                  accent: '#FF5A7E',
                },
                {
                  label: 'Quick Play',
                  description: 'Random player challenge',
                  accent: '#FFC54D',
                },
              ].map(({ label, description, accent }) => (
                <ModeCardButton
                  key={label}
                  accent={accent}
                  label={label}
                  description={description}
                />
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
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
          </Stack>

          <Box
            flex={{ base: '1', lg: '0 0 380px' }}
            w={{ base: '100%', lg: '380px' }}
            alignSelf="stretch"
            bg="#0B0E17"
            borderRadius="3xl"
            borderWidth="1px"
            borderColor="brand.600"
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
                Behind the Graph
              </Heading>
              <Stack spacing={4}>
                <StatPanel
                  title="13 seasons"
                  description="Top-flight campaigns from 2010 to 2023/24."
                />
                <StatPanel
                  title="25,000 players"
                  description="Every debut, transfer, and teammate link."
                />
                <StatPanel
                  title="5 leagues"
                  description="Premier League, La Liga, Serie A, Bundesliga, Ligue 1."
                />
              </Stack>
              <Text fontSize="sm" color="#9CA3AF">
                The network grows with every transfer window.
              </Text>
            </Stack>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

const ModeCardButton = ({ accent, label, description }) => (
  <Box
    as="button"
    type="button"
    bg="#10131F"
    borderRadius="2xl"
    border="1px solid rgba(255,255,255,0.05)"
    px={{ base: 6, md: 8 }}
    py={{ base: 8, md: 10 }}
    display="flex"
    flexDirection="column"
    alignItems="flex-start"
    gap={4}
    position="relative"
    overflow="hidden"
    cursor="pointer"
    transition="all 0.25s ease"
    textAlign="left"
    _hover={{
      transform: 'translateY(-3px)',
      borderColor: `${accent}66`,
      boxShadow: `0 16px 30px -18px ${accent}80`,
      _after: { opacity: 0.12 },
    }}
    _focusVisible={{
      outline: '2px solid',
      outlineColor: `${accent}99`,
      outlineOffset: '4px',
    }}
    _after={{
      content: '""',
      position: 'absolute',
      inset: 0,
      bg: accent,
      opacity: 0,
      transition: 'opacity 0.25s ease',
      pointerEvents: 'none',
    }}
  >
    <Text
      fontSize={{ base: 'lg', md: 'xl' }}
      fontWeight="700"
      color="#E4E8FF"
      position="relative"
      zIndex={1}
    >
      {label}
    </Text>
    <Text
      fontSize={{ base: 'md', md: 'lg' }}
      fontWeight="400"
      color="#9CA3AF"
      position="relative"
      zIndex={1}
    >
      {description}
    </Text>
    <Box
      mt="auto"
      w="40%"
      minW="100px"
      h="3px"
      bg={`${accent}cc`}
      borderRadius="full"
      position="relative"
      zIndex={1}
    />
  </Box>
);

const StatPanel = ({ title, description }) => (
  <Box
    bg="#10131F"
    borderRadius="xl"
    border="1px solid rgba(255,255,255,0.08)"
    px={5}
    py={4}
  >
    <Text fontSize="xl" fontWeight="700" color="#E4E8FF">
      {title}
    </Text>
    <Text fontSize="sm" color="#9CA3AF" mt={2}>
      {description}
    </Text>
  </Box>
);

export default App;
