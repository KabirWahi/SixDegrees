import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Flex,
  Heading,
  Icon,
  IconButton,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react';
import ModeCardButton from '../components/ModeCardButton.jsx';

const MODES = [
  {
    label: 'Explorer',
    description: 'Free graph exploration',
    accent: '#38E8C6',
    view: 'explorer',
  },
  {
    label: 'Time Trial',
    description: 'Race the clock',
    accent: '#FF5A7E',
    view: 'time-trial',
  },
  {
    label: 'Quick Play',
    description: 'Random player challenge',
    accent: '#FFC54D',
    view: 'quick-play',
  },
];

const DAILY_PAIRS = [
  ['Sam Kerr', 'Erling Haaland'],
  ['Alexia Putellas', 'Lionel Messi'],
  ['Megan Rapinoe', 'Kylian Mbappé'],
  ['Jude Bellingham', 'Sophia Smith'],
];

const HomeView = ({ onSelectMode, onLearnMore }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dailyPair] = useState(() => DAILY_PAIRS[Math.floor(Math.random() * DAILY_PAIRS.length)]);

  const handleSelect = useCallback(
    (mode) => {
      const index = MODES.findIndex((entry) => entry.label === mode.label);
      if (index !== -1) setSelectedIndex(index);
      onSelectMode(mode.view);
    },
    [onSelectMode],
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % MODES.length);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + MODES.length) % MODES.length);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        handleSelect(MODES[selectedIndex]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSelect, selectedIndex]);

  return (
    <Box position="relative" minH="100vh" bg="#060912" overflow="hidden">
      <BackgroundParticles />
      <Flex
        direction="column"
        align="center"
        justify="center"
        minH="100vh"
        px={{ base: 6, md: 12 }}
        py={{ base: 12, md: 16 }}
        textAlign="center"
        position="relative"
        zIndex={1}
      >
        <Stack spacing={3} align="center" maxW="3xl">
          <Box
            px={5}
            py={2}
            borderRadius="full"
            border="1px solid rgba(255,255,255,0.08)"
            bg="rgba(255,255,255,0.02)"
            color="#9CA3AF"
            letterSpacing="0.2em"
            fontSize="sm"
            textTransform="uppercase"
          >
            Six Degrees of Football
          </Box>
          <Heading size="2xl" color="#E4E8FF" letterSpacing="-0.02em">
            Connect the world of football in six steps.
          </Heading>
          <Text fontSize="lg" color="#9CA3AF">
            Explore thirteen seasons across Europe’s top leagues. Choose a mode and jump straight into the network.
          </Text>
        </Stack>

        <Flex
          mt={{ base: 10, md: 14 }}
          gap={{ base: 4, md: 6 }}
          wrap="wrap"
          justify="center"
          maxW="1140px"
        >
          {MODES.map((mode, index) => (
            <ModeCardButton
              key={mode.label}
              accent={mode.accent}
              label={mode.label}
              description={mode.description}
              isSelected={index === selectedIndex}
              onClick={() => handleSelect(mode)}
            />
          ))}
        </Flex>

        <Text mt={6} fontSize="sm" color="rgba(255,255,255,0.65)">
          Use ← → to choose a mode • Press Enter to start
        </Text>
      </Flex>

      <Link
        position="absolute"
        top={{ base: 4, md: 6 }}
        right={{ base: 4, md: 6 }}
        fontSize="sm"
        color="#E4E8FF"
        letterSpacing="0.2em"
        textTransform="uppercase"
        onClick={onLearnMore}
        _hover={{ color: '#fff' }}
      >
        Learn More
      </Link>

      <Box
        position="absolute"
        bottom={{ base: 4, md: 6 }}
        right={{ base: 4, md: 6 }}
        display="flex"
        alignItems="center"
        gap={3}
        bg="rgba(15,19,31,0.85)"
        border="1px solid rgba(255,255,255,0.08)"
        borderRadius="full"
        px={4}
        py={2}
        boxShadow="0 12px 32px -18px rgba(0,0,0,0.65)"
      >
        <Text fontSize="xs" color="#9CA3AF" letterSpacing="0.2em">
          Daily Challenge
        </Text>
        <Text fontSize="sm" color="#E4E8FF" fontWeight="600">
          {dailyPair[0]} → {dailyPair[1]}
        </Text>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Play daily challenge"
          icon={<ArrowIcon boxSize={4} />}
          color="#E4E8FF"
          onClick={() => handleSelect(MODES[2])}
        />
      </Box>
    </Box>
  );
};

const BackgroundParticles = () => (
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

HomeView.propTypes = {
  onSelectMode: PropTypes.func.isRequired,
  onLearnMore: PropTypes.func.isRequired,
};

const ArrowIcon = (props) => (
  <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
);

export default HomeView;
