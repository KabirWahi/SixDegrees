import { Box, Button, Container, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import ModeCardButton from '../components/ModeCardButton.jsx';

const MODES = [
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
];

const ModeSelectView = ({ onBack, onSelectMode = undefined }) => (
  <Box minH="100vh" bg="#0B0E17" position="relative">
    <Button
      position="absolute"
      top={{ base: 4, md: 6 }}
      left={{ base: 4, md: 8 }}
      colorScheme="brand"
      borderRadius="full"
      onClick={onBack}
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
          {MODES.map(({ label, description, accent }) => (
            <ModeCardButton
              key={label}
              accent={accent}
              label={label}
              description={description}
              onClick={() => onSelectMode?.(label)}
            />
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  </Box>
);

ModeSelectView.propTypes = {
  onBack: PropTypes.func.isRequired,
  onSelectMode: PropTypes.func,
};

export default ModeSelectView;
