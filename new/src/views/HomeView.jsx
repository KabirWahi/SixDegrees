import PropTypes from 'prop-types';
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
import StatPanel from '../components/StatPanel.jsx';

const HomeView = ({ onPlay, onLearnMore, isPlayLoading }) => (
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
            Dive into thirteen seasons of Europe&apos;s top leagues. Explore teammates, rivals, and
            transfers that connect football&apos;s biggest names.
          </Text>
          <HStack spacing={4} wrap="wrap">
            <Button
              size="lg"
              colorScheme="brand"
              borderRadius="full"
              px={10}
              onClick={onPlay}
              isLoading={isPlayLoading}
            >
              Play Now
            </Button>
            <Link
              fontSize="md"
              color="gray.300"
              _hover={{ color: 'gray.100', textDecoration: 'none' }}
              onClick={onLearnMore}
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
              <StatPanel title="13 seasons" description="Top-flight campaigns from 2010 to 2023/24." />
              <StatPanel title="25,000 players" description="Every debut, transfer, and teammate link." />
              <StatPanel title="5 leagues" description="Premier League, La Liga, Serie A, Bundesliga, Ligue 1." />
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

HomeView.propTypes = {
  onPlay: PropTypes.func.isRequired,
  onLearnMore: PropTypes.func.isRequired,
  isPlayLoading: PropTypes.bool,
};

HomeView.defaultProps = {
  isPlayLoading: false,
};

export default HomeView;
