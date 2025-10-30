import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  AlertIcon,
  Box,
  Flex,
  Icon,
  IconButton,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import ReactFlow, { Background } from 'reactflow';
import GameHeader from '../components/GameHeader.jsx';
import RightNeighborsPanel from '../components/RightNeighborsPanel.jsx';
import fetchNeighbors from '../utils/fetchNeighbors.js';

const ENDPOINTS_URL = 'https://api.sixdegrees.kabirwahi.com/api/football?path=endpoints';
const VIEWPORT_POSITION_TOLERANCE = 1;
const VIEWPORT_ZOOM_TOLERANCE = 0.005;

const viewportEquals = (a, b) => {
  if (!a || !b) return false;
  return (
    Math.abs(a.x - b.x) <= VIEWPORT_POSITION_TOLERANCE &&
    Math.abs(a.y - b.y) <= VIEWPORT_POSITION_TOLERANCE &&
    Math.abs(a.zoom - b.zoom) <= VIEWPORT_ZOOM_TOLERANCE
  );
};

const QuickPlayView = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [endpoints, setEndpoints] = useState(null);
  const [defaultViewport, setDefaultViewport] = useState(null);
  const [showRecenter, setShowRecenter] = useState(false);
  const reactFlowInstanceRef = useRef(null);
  const [flowReady, setFlowReady] = useState(false);
  const pendingResetRef = useRef(false);
  const resetTimeoutRef = useRef(null);
  const neighborsCacheRef = useRef({});
  const pendingRequestsRef = useRef({});
  const [neighborsMap, setNeighborsMap] = useState({});
  const [loadingNodeId, setLoadingNodeId] = useState(null);
  const [errorByNode, setErrorByNode] = useState({});
  const [panelState, setPanelState] = useState({
    isOpen: false,
    nodeId: null,
  });
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
          cursor: 'pointer',
        },
      },
    ];
  }, [endpoints, sourceName]);

  const edges = useMemo(() => [], []);

  const scheduleResetRelease = useCallback((duration = 0, hideButton = false) => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }

    if (duration > 0) {
      resetTimeoutRef.current = setTimeout(() => {
        pendingResetRef.current = false;
        if (hideButton) setShowRecenter(false);
        resetTimeoutRef.current = null;
      }, duration);
    } else {
      pendingResetRef.current = false;
      if (hideButton) setShowRecenter(false);
    }
  }, []);

  useEffect(
    () => () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = null;
      }
    },
    [],
  );

  const resetViewport = useCallback(
    (instance, options = {}) => {
      const targetInstance = instance ?? reactFlowInstanceRef.current;
      if (!targetInstance || nodes.length === 0) return;

      pendingResetRef.current = true;
      requestAnimationFrame(() => {
        if (!reactFlowInstanceRef.current) return;
        targetInstance.fitView({ padding: 0.35, minZoom: 0.8, duration: options.duration ?? 0 });
        const viewport = targetInstance.getViewport();
        setDefaultViewport({ ...viewport });
        setShowRecenter(false);
        scheduleResetRelease(options.duration ?? 0, false);
      });
    },
    [nodes, scheduleResetRelease],
  );

  const handleInit = useCallback(
    (instance) => {
      reactFlowInstanceRef.current = instance;
      setFlowReady(true);
      if (nodes.length > 0) {
        resetViewport(instance);
      }
    },
    [nodes.length, resetViewport],
  );

  useEffect(() => {
    if (!flowReady || nodes.length === 0) return;
    resetViewport(reactFlowInstanceRef.current);
  }, [flowReady, nodes, resetViewport]);

  const handleMove = useCallback(
    (_, viewport) => {
      if (pendingResetRef.current || !defaultViewport) return;
      const shouldShow = !viewportEquals(viewport, defaultViewport);
      setShowRecenter((prev) => (prev === shouldShow ? prev : shouldShow));
    },
    [defaultViewport],
  );

  const handleRecenter = useCallback(() => {
    if (!reactFlowInstanceRef.current || !defaultViewport) return;
    pendingResetRef.current = true;
    reactFlowInstanceRef.current.setViewport({ ...defaultViewport }, { duration: 400 });
    scheduleResetRelease(400, true);
  }, [defaultViewport, scheduleResetRelease]);

  const recenterActive = !loading && !error && endpoints && showRecenter;
  const panelNeighbors = panelState.nodeId ? neighborsMap[panelState.nodeId] ?? [] : [];
  const panelLoading = Boolean(panelState.nodeId && loadingNodeId === panelState.nodeId);
  const panelError = panelState.nodeId ? errorByNode[panelState.nodeId] : null;

  const requestNeighbors = useCallback(
    (nodeId, options = {}) => {
      if (!nodeId) {
        return Promise.resolve([]);
      }

      const cached = neighborsCacheRef.current[nodeId];
      if (cached) {
        setNeighborsMap((prev) => (prev[nodeId] ? prev : { ...prev, [nodeId]: cached }));
        return Promise.resolve(cached);
      }

      if (pendingRequestsRef.current[nodeId]) {
        return pendingRequestsRef.current[nodeId];
      }

      setLoadingNodeId(nodeId);
      setErrorByNode((prev) => {
        const next = { ...prev };
        delete next[nodeId];
        return next;
      });

      const promise = (async () => {
        try {
          const data = await fetchNeighbors(nodeId, options);
          neighborsCacheRef.current[nodeId] = data;
          setNeighborsMap((prev) => ({ ...prev, [nodeId]: data }));
          return data;
        } catch (fetchError) {
          if (fetchError?.name !== 'AbortError') {
            setErrorByNode((prev) => ({ ...prev, [nodeId]: fetchError }));
          }
          throw fetchError;
        } finally {
          setLoadingNodeId((current) => (current === nodeId ? null : current));
          delete pendingRequestsRef.current[nodeId];
        }
      })();

      pendingRequestsRef.current[nodeId] = promise;
      return promise;
    },
    [],
  );

  useEffect(() => {
    const sourceId = endpoints?.source?.[0];
    if (!sourceId) return;
    if (neighborsCacheRef.current[sourceId]) return;

    const controller = new AbortController();

    requestNeighbors(sourceId, { signal: controller.signal }).catch(() => {});

    return () => {
      controller.abort();
    };
  }, [endpoints, requestNeighbors]);

  const handleNodeClick = useCallback(
    (_, node) => {
      if (!node?.id) return;
      setPanelState({ isOpen: true, nodeId: node.id });
      requestNeighbors(node.id).catch(() => {});
    },
    [requestNeighbors],
  );

  const handleClosePanel = useCallback(() => {
    setPanelState({ isOpen: false, nodeId: null });
  }, []);

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
                  onInit={handleInit}
                  onNodeClick={handleNodeClick}
                  onMove={handleMove}
                  onMoveEnd={handleMove}
                  nodesConnectable={false}
                  proOptions={{ hideAttribution: true }}
                  style={{ width: '100%', height: '100%' }}
                >
                  <Background color="rgba(148, 163, 184, 0.14)" gap={26} />
                </ReactFlow>

                {recenterActive && (
                  <Box position="absolute" bottom={{ base: 4, md: 6 }} right={{ base: 4, md: 6 }}>
                    <IconButton
                      aria-label="Recenter view"
                      icon={<CrosshairIcon boxSize={5} />}
                      onClick={handleRecenter}
                      bg="rgba(26, 34, 54, 0.96)"
                      color="#E4E8FF"
                      borderRadius="full"
                      h="48px"
                      w="48px"
                      boxShadow="0 12px 24px -12px rgba(15, 23, 42, 0.8)"
                      _hover={{ bg: 'rgba(44, 56, 88, 0.96)' }}
                      _active={{ bg: 'rgba(18, 23, 40, 0.96)' }}
                    />
                  </Box>
                )}
              </Box>
              <RightNeighborsPanel
                isOpen={panelState.isOpen}
                neighbors={panelNeighbors}
                isLoading={panelLoading}
                error={panelError}
                onClose={handleClosePanel}
              />
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

const CrosshairIcon = (props) => (
  <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <circle cx="12" cy="12" r="3.5" />
    <line x1="12" y1="3" x2="12" y2="7.5" strokeLinecap="round" />
    <line x1="12" y1="16.5" x2="12" y2="21" strokeLinecap="round" />
    <line x1="3" y1="12" x2="7.5" y2="12" strokeLinecap="round" />
    <line x1="16.5" y1="12" x2="21" y2="12" strokeLinecap="round" />
  </Icon>
);

CrosshairIcon.propTypes = {
  boxSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default QuickPlayView;
