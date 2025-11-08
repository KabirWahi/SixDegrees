import { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Divider,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react';

const MODES = [
  {
    title: 'Quick Play',
    description: 'Connect two random players within six steps. Fast, focused, one-off challenges.',
  },
  {
    title: 'Time Trial',
    description: 'Two-minute timer with infinite steps. Earn +20 seconds for every connection you find.',
  },
  {
    title: 'Explorer',
    description: 'Start anywhere and wander freely through the football network. No time, no limits.',
  },
];

const LearnMoreView = ({ onBack }) => {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onBack();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onBack]);

  return (
  <Box bg="#060912" minH="100vh" color="#A0A5C5" position="relative" overflow="hidden">
    <Backdrop />
    <Flex
      direction="column"
      align="center"
      px={{ base: 6, md: 12 }}
      pt="12vh"
      pb="10vh"
      gap={{ base: 10, md: 14 }}
      position="relative"
      zIndex={1}
    >
      <Stack spacing={2} textAlign="center" maxW="720px">
        <Heading size="lg" color="#E4E8FF">
          Behind the Graph
        </Heading>
        <Text>
          Explore the leagues, players, and modes that make up the world of Six Degrees of Football.
        </Text>
      </Stack>

      <Stack spacing={2} align="center" textAlign="center">
        <ScopeRow />
      </Stack>

      <Stack spacing={4} textAlign="center" maxW="720px">
        <Text>
          Each node represents a player, and each connection marks a shared teammate or transfer between top-flight European clubs over thirteen seasons.
        </Text>
      </Stack>

      <Stack spacing={4} align="center" textAlign="center" maxW="640px" w="full">
        <Text fontSize="sm" letterSpacing="0.2em" textTransform="uppercase" color="#7E82A5">
          The Modes
        </Text>
        <Stack spacing={6} w={{ base: '100%', md: '70%' }}>
          {MODES.map((mode) => (
            <Box key={mode.title} textAlign="left">
              <Text fontWeight="600" color="#E4E8FF">
                {mode.title}
              </Text>
              <Text mt={1}>{mode.description}</Text>
            </Box>
          ))}
        </Stack>
      </Stack>

      <Stack spacing={2} textAlign="center">
        <Text fontSize="sm" color="#A0A5C5">
          Built using real data from Transfermarkt (2010 – 2023/24 seasons).
        </Text>
      </Stack>

      <Divider opacity={0.08} w="60%" />

      <Link
        color="#6d74d1"
        fontSize="sm"
        href="https://kabirwahi.com"
        target="_blank"
        rel="noreferrer"
        _hover={{ color: '#8c92ff' }}
      >
        Designed by Kabir Wahi
      </Link>
    </Flex>
  </Box>
  );
};

const ScopeRow = () => (
  <Box
    display="flex"
    flexWrap="wrap"
    justifyContent="center"
    gap={3}
    fontSize={{ base: 'sm', md: 'md' }}
  >
    <ScopeChip>13 Seasons (2010 – 2023/24)</ScopeChip>
    <ScopeChip>25 000 Players</ScopeChip>
    <ScopeChip>5 Leagues (PL, La Liga, Serie A, Bundesliga, Ligue 1)</ScopeChip>
  </Box>
);

const ScopeChip = ({ children }) => (
  <Box
    px={4}
    py={2}
    borderRadius="full"
    border="1px solid rgba(255,255,255,0.08)"
    bg="rgba(255,255,255,0.02)"
  >
    {children}
  </Box>
);

ScopeChip.propTypes = {
  children: PropTypes.node.isRequired,
};

const Backdrop = () => (
  <Box>
    <Box
      position="absolute"
      inset="0"
      bg="radial-gradient(circle at top, rgba(99,102,241,0.25), transparent 65%)"
    />
    <Box
      position="absolute"
      inset="0"
      opacity={0.25}
      bg={`url("data:image/svg+xml,%3Csvg width='220' height='220' viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%236d74d1' stroke-width='0.4' stroke-opacity='0.4'%3E%3Ccircle cx='110' cy='110' r='1.4'/%3E%3Ccircle cx='50' cy='190' r='1'/%3E%3Ccircle cx='180' cy='40' r='1'/%3E%3Ccircle cx='70' cy='60' r='1'/%3E%3Ccircle cx='160' cy='170' r='1'/%3E%3C/g%3E%3C/svg%3E")`}
      animation="float 80s linear infinite"
      sx={{
        '@keyframes float': {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-50px)' },
          '100%': { transform: 'translateY(0px)' },
        },
      }}
    />
  </Box>
);

LearnMoreView.propTypes = {
  onBack: PropTypes.func.isRequired,
};

export default LearnMoreView;
