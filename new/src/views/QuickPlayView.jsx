import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  AlertIcon,
  Box,
  Flex,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import ReactFlow, { Background } from 'reactflow';
import GameHeader from '../components/GameHeader.jsx';

const ENDPOINTS_URL = 'https://api.sixdegrees.kabirwahi.com/api/football?path=endpoints';

const QuickPlayView = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [endpoints, setEndpoints] = useState(null);
  const steps = 0;
  const maxSteps = 6;

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

  const nodes = useMemo(() => {
    if (!endpoints?.source) return [];
    return [
      {
        id: endpoints.source[0],
        position: { x: 0, y: 0 },
        data: { label: sourceName },
        style: {
          padding: '12px 18px',
          borderRadius: '12px',
          border: '1px solid rgba(56, 232, 198, 0.4)',
          background: 'rgba(56, 232, 198, 0.18)',
          color: '#E4E8FF',
          fontWeight: 600,
          fontSize: '15px',
        },
      },
    ];
  }, [endpoints, sourceName]);

  const edges = useMemo(() => [], []);

  return (
    <Box bg="#060912" minH="100vh">
      <Flex
        direction="column"
        h="100vh"
        w="100%"
        px={{ base: 4, md: 6 }}
        py={{ base: 4, md: 6 }}
        gap={{ base: 4, md: 6 }}
        minW="0"
      >
        <GameHeader
          title="Quick Play"
          subtitle="Connect the source player to the target in six steps or fewer."
          onBack={onBack}
          rightContent={
            <Text fontSize={{ base: 'sm', md: 'md' }} color="#9CA3AF" minW="fit-content">
              Steps: {steps} / {maxSteps}
            </Text>
          }
          containerProps={{
            px: { base: 4, md: 6 },
            pt: 0,
            pb: { base: 3, md: 4 },
          }}
        />

        <Box
          position="relative"
          flex="1"
          minH="0"
          borderRadius="3xl"
          overflow="hidden"
          bg="#050713"
          border="1px solid rgba(109, 116, 209, 0.25)"
          w="100%"
        >
          {loading && (
            <Flex align="center" justify="center" h="100%">
              <Spinner size="xl" color="brand.400" thickness="4px" />
            </Flex>
          )}

          {!loading && error && (
            <Flex align="center" justify="center" h="100%" px={6}>
              <Alert
                status="error"
                borderRadius="lg"
                bg="rgba(230,57,70,0.12)"
                border="none"
                maxW="md"
              >
                <AlertIcon />
                {error.message ?? 'Unable to fetch quick play endpoints.'}
              </Alert>
            </Flex>
          )}

          {!loading && !error && endpoints && (
            <>
              <Stack
                position="absolute"
                top={{ base: 3, md: 5 }}
                left={{ base: 3, md: 5 }}
                spacing={{ base: 2, md: 3 }}
                zIndex={2}
                pointerEvents="none"
              >
                <Chip
                  label="TARGET PLAYER"
                  value={targetName}
                  accent="rgba(255, 90, 126, 0.18)"
                  borderColor="rgba(255, 90, 126, 0.35)"
                  textColor="#FF5A7E"
                />
              </Stack>

              <Box position="absolute" inset="0">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  fitView
                  fitViewOptions={{ padding: 0.35, minZoom: 0.8 }}
                  proOptions={{ hideAttribution: true }}
                  style={{ width: '100%', height: '100%' }}
                >
                  <Background color="rgba(148, 163, 184, 0.14)" gap={26} />
                </ReactFlow>
              </Box>
            </>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

QuickPlayView.propTypes = {
  onBack: PropTypes.func.isRequired,
};

const Chip = ({ label, value, accent, borderColor, textColor }) => (
  <Box
    px={{ base: 4, md: 5 }}
    py={{ base: 3, md: 3 }}
    borderRadius="xl"
    bg={accent}
    border={`1px solid ${borderColor}`}
    backdropFilter="blur(6px)"
    maxW={{ base: '260px', md: '340px' }}
  >
    <Text fontSize="xs" letterSpacing="0.2em" color={textColor} mb={1}>
      {label}
    </Text>
    <Text fontSize={{ base: 'md', md: 'lg' }} color="#E4E8FF" fontWeight="600">
      {value}
    </Text>
  </Box>
);

Chip.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  accent: PropTypes.string.isRequired,
  borderColor: PropTypes.string.isRequired,
  textColor: PropTypes.string.isRequired,
};

export default QuickPlayView;
