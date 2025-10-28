import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';

const ENDPOINTS_URL = 'https://api.sixdegrees.kabirwahi.com/api/football?path=endpoints';

const QuickPlayView = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [endpoints, setEndpoints] = useState(null);

  useEffect(() => {
    let isSubscribed = true;

    const fetchEndpoints = async () => {
      try {
        setLoading(true);
        const response = await fetch(ENDPOINTS_URL);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data = await response.json();
        if (isSubscribed) {
          setEndpoints(data);
          setError(null);
        }
      } catch (err) {
        if (isSubscribed) {
          setError(err);
          setEndpoints(null);
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchEndpoints();

    return () => {
      isSubscribed = false;
    };
  }, []);

  const sourceName = endpoints?.source?.[1] ?? 'Unknown';
  const targetName = endpoints?.target?.[1] ?? 'Unknown';

  return (
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
        maxW="5xl"
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        py={{ base: 16, md: 20 }}
      >
        <Stack
          spacing={10}
          w="full"
          bg="#10131F"
          borderRadius="3xl"
          borderWidth="1px"
          borderColor="brand.600"
          p={{ base: 8, md: 12 }}
          boxShadow="0 20px 60px -40px rgba(109, 116, 209, 0.65)"
        >
          <Stack spacing={2} textAlign="center">
            <Heading size={{ base: 'md', md: 'lg' }} color="#E4E8FF">
              Quick Play
            </Heading>
            <Text fontSize={{ base: 'sm', md: 'md' }} color="#9CA3AF">
              Connect the source player to the target in six steps or fewer.
            </Text>
          </Stack>

          {loading && (
            <Flex align="center" justify="center" py={10}>
              <Spinner size="xl" color="brand.400" thickness="4px" />
            </Flex>
          )}

          {!loading && error && (
            <Alert status="error" borderRadius="xl" bg="rgba(230,57,70,0.12)" border="none">
              <AlertIcon />
              {error.message ?? 'Unable to fetch quick play endpoints.'}
            </Alert>
          )}

          {!loading && !error && endpoints && (
            <Flex
              direction={{ base: 'column', md: 'row' }}
              gap={{ base: 6, md: 12 }}
              justify="space-between"
            >
              <Stack
                flex="1"
                spacing={3}
                bg="rgba(56, 232, 198, 0.08)"
                border="1px solid rgba(56, 232, 198, 0.2)"
                borderRadius="2xl"
                p={{ base: 6, md: 8 }}
              >
                <Text fontSize="sm" color="#38E8C6" textTransform="uppercase" letterSpacing="wide">
                  Source Player
                </Text>
                <Heading size="lg" color="#E4E8FF">
                  {sourceName}
                </Heading>
                <Text fontSize="sm" color="#9CA3AF">
                  Player ID: {endpoints.source?.[0]}
                </Text>
              </Stack>

              <Stack
                flex="1"
                spacing={3}
                bg="rgba(255, 90, 126, 0.08)"
                border="1px solid rgba(255, 90, 126, 0.2)"
                borderRadius="2xl"
                p={{ base: 6, md: 8 }}
              >
                <Text fontSize="sm" color="#FF5A7E" textTransform="uppercase" letterSpacing="wide">
                  Target Player
                </Text>
                <Heading size="lg" color="#E4E8FF">
                  {targetName}
                </Heading>
                <Text fontSize="sm" color="#9CA3AF">
                  Player ID: {endpoints.target?.[0]}
                </Text>
              </Stack>
            </Flex>
          )}
        </Stack>
      </Container>
    </Box>
  );
};

QuickPlayView.propTypes = {
  onBack: PropTypes.func.isRequired,
};

export default QuickPlayView;
