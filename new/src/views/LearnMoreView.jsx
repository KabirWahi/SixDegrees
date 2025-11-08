import { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
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

const ACCENT_COLORS = ['#FFC54D', '#FF5A7E', '#38E8C6'];

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
    <Button
      position="absolute"
      top={{ base: 4, md: 6 }}
      left={{ base: 4, md: 6 }}
      variant="outline"
      borderColor="rgba(255,255,255,0.15)"
      color="#E4E8FF"
      borderRadius="full"
      size="sm"
      px={6}
      onClick={onBack}
      _hover={{ bg: 'rgba(255,255,255,0.06)' }}
      zIndex={2}
    >
      ← Back
    </Button>
    <Flex
      direction="column"
      align="center"
      px={{ base: 6, md: 12 }}
      pt="14vh"
      pb="10vh"
      gap={{ base: 12, md: 16 }}
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

      <Stack spacing={2.5} align="center" textAlign="center">
        <ScopeRow />
      </Stack>

      <Stack spacing={5} textAlign="center" maxW="720px">
        <Text>
          Each node represents a player, and each connection marks a shared teammate or transfer between top-flight European clubs over thirteen seasons.
        </Text>
      </Stack>

      <Stack spacing={5} align="center" textAlign="center" maxW="640px" w="full" mt={2}>
        <Text fontSize="sm" letterSpacing="0.35em" textTransform="uppercase" color="rgba(126,130,165,0.85)">
          The Modes
        </Text>
        <Stack spacing={6} w={{ base: '100%', md: '70%' }}>
          {MODES.map((mode, index) => (
            <Box key={mode.title} textAlign="left">
              <Text fontWeight="700" color="#E4E8FF">
                {mode.title}
              </Text>
              <Text mt={1}>{mode.description}</Text>
              <Box mt={2} w="90px" h="2px" bg={ACCENT_COLORS[index]} borderRadius="full" opacity={0.85} />
            </Box>
          ))}
        </Stack>
      </Stack>

      <Stack spacing={3} textAlign="center" mt={6}>
        <Divider opacity={0.08} w="60%" />
        <Link
          color="#6d74d1"
          fontSize="sm"
          href="https://kabirwahi.com"
          target="_blank"
          rel="noreferrer"
          opacity={0.7}
          _hover={{ color: '#8c92ff', opacity: 1 }}
        >
          Designed by Kabir Wahi
        </Link>
      </Stack>
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
      bg="radial-gradient(circle at top, rgba(99,102,241,0.25), transparent 55%)"
      opacity={0.6}
    />
    <Box
      position="absolute"
      inset="0"
      bg={`url("data:image/svg+xml,%3Csvg width='160' height='160' viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-opacity='0.2' stroke='%236d74d1' stroke-width='0.5'%3E%3Ccircle cx='80' cy='80' r='1'/%3E%3Ccircle cx='20' cy='40' r='1'/%3E%3Ccircle cx='120' cy='20' r='1'/%3E%3Ccircle cx='140' cy='120' r='1'/%3E%3Ccircle cx='40' cy='130' r='1'/%3E%3C/g%3E%3C/svg%3E")`}
      opacity={0.4}
      animation="drift 60s linear infinite"
      sx={{
        '@keyframes drift': {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-40px)' },
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
