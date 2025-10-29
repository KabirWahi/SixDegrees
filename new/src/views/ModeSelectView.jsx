import { Container, Flex, SimpleGrid, Stack } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import GameHeader from '../components/GameHeader.jsx';
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
  <Flex direction="column" minH="100vh" bg="#0B0E17" position="relative">
    <GameHeader
      title="Choose Mode"
      subtitle="Three ways to play"
      onBack={onBack}
      containerProps={{
        px: { base: 6, md: 10 },
        pt: { base: 4, md: 6 },
        pb: { base: 4, md: 6 },
      }}
    />
    <Container
      maxW="6xl"
      flex="1"
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={{ base: 8, md: 12 }}
    >
      <Stack spacing={{ base: 8, md: 10 }} w="full" maxW="5xl" textAlign="center" mt={{ base: 2, md: 0 }}>
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
  </Flex>
);

ModeSelectView.propTypes = {
  onBack: PropTypes.func.isRequired,
  onSelectMode: PropTypes.func,
};

export default ModeSelectView;
