import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  Icon,
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import GameHeader from '../components/GameHeader.jsx';
import RightNeighborsPanel from '../components/RightNeighborsPanel.jsx';
import fetchNeighbors from '../utils/fetchNeighbors.js';

const ENDPOINTS_URL = 'https://api.sixdegrees.kabirwahi.com/api/football?path=endpoints';
const VIEWPORT_POSITION_TOLERANCE = 1;
const VIEWPORT_ZOOM_TOLERANCE = 0.005;

const getZoomValue = (transform) => {
  if (!transform) return null;
  if (typeof transform.k === 'number') return transform.k;
  if (typeof transform.zoom === 'number') return transform.zoom;
  return null;
};

const viewportEquals = (a, b) => {
  if (!a || !b) return false;
  const zoomA = getZoomValue(a);
  const zoomB = getZoomValue(b);
  const zoomDiff =
    typeof zoomA === 'number' && typeof zoomB === 'number'
      ? Math.abs(zoomA - zoomB)
      : 0;

  return (
    Math.abs(a.x - b.x) <= VIEWPORT_POSITION_TOLERANCE &&
    Math.abs(a.y - b.y) <= VIEWPORT_POSITION_TOLERANCE &&
    zoomDiff <= VIEWPORT_ZOOM_TOLERANCE
  );
};

const QuickPlayView = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [endpoints, setEndpoints] = useState(null);
  const [showRecenter, setShowRecenter] = useState(false);
  const [graphNodes, setGraphNodes] = useState([]);
  const [graphLinks, setGraphLinks] = useState([]);
  const [gameVersion, setGameVersion] = useState(0);
  const svgRef = useRef(null);
  const graphLayerRef = useRef(null);
  const zoomBehaviorRef = useRef(null);
  const defaultViewportRef = useRef(d3.zoomIdentity);
  const [zoomReady, setZoomReady] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const containerRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 720, height: 540 });
  const [nodePositions, setNodePositions] = useState({});
  const latestPositionsRef = useRef({});
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
    nodeName: 'Unknown',
  });
  const [resultState, setResultState] = useState(null);
  const maxSteps = 6;

  useEffect(() => {
    let observer = null;
    let rafId = null;

    const attachObserver = () => {
      const element = containerRef.current;
      if (!element) {
        rafId = requestAnimationFrame(attachObserver);
        return;
      }

      const updateSize = () => {
        const rect = element.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        setCanvasSize((prev) => {
          if (prev.width === rect.width && prev.height === rect.height) {
            return prev;
          }
          return { width: rect.width, height: rect.height };
        });
      };

      updateSize();

      if (typeof ResizeObserver === 'undefined') {
        observer = null;
        return;
      }

      observer = new ResizeObserver(updateSize);
      observer.observe(element);
    };

    attachObserver();

    return () => {
      if (observer) {
        observer.disconnect();
      }
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

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
  }, [gameVersion]);

  const refsReady = Boolean(svgRef.current && graphLayerRef.current);

  useEffect(() => {
    if (!refsReady) return;

    const svgSelection = d3.select(svgRef.current);
    const layerSelection = d3.select(graphLayerRef.current);

    const zoomBehavior = d3
      .zoom()
      .scaleExtent([0.6, 2])
      .on('start', () => setIsPanning(true))
      .on('zoom', (event) => {
        layerSelection.attr('transform', event.transform);
        if (pendingResetRef.current) return;

        const baseline = defaultViewportRef.current;
        if (!baseline) return;

        const shouldShow = !viewportEquals(event.transform, baseline);
        setShowRecenter((prev) => (prev === shouldShow ? prev : shouldShow));
      })
      .on('end', () => setIsPanning(false));

    svgSelection.call(zoomBehavior).on('dblclick.zoom', null);

    zoomBehaviorRef.current = zoomBehavior;
    defaultViewportRef.current = d3.zoomIdentity;
    setShowRecenter(false);
    setZoomReady(true);

    return () => {
      svgSelection.on('.zoom', null);
      zoomBehaviorRef.current = null;
      defaultViewportRef.current = d3.zoomIdentity;
      setZoomReady(false);
      setIsPanning(false);
    };
  }, [refsReady]);

  const sourceId = endpoints?.source?.[0];
  const sourceName = endpoints?.source?.[1] ?? 'Unknown';
  const targetId = endpoints?.target?.[0];
  const targetName = endpoints?.target?.[1] ?? 'Unknown';

  useEffect(() => {
    if (!sourceId) return;
    setPanelState({ isOpen: false, nodeId: null, nodeName: 'Unknown' });
    setGraphNodes([
      {
        id: sourceId,
        label: sourceName,
        parentId: null,
      },
    ]);
    setGraphLinks([]);
    latestPositionsRef.current = {};
    setNodePositions({});
    setNeighborsMap({});
    setErrorByNode({});
    neighborsCacheRef.current = {};
    pendingRequestsRef.current = {};
    setResultState(null);
  }, [sourceId, sourceName]);


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

  const applyViewportTransform = useCallback(
    (
      transform,
      { duration = 0, hideButton = false, updateBaseline = true } = {},
    ) => {
      const svgElement = svgRef.current;
      const zoomBehavior = zoomBehaviorRef.current;
      if (!svgElement || !zoomBehavior) return;

      const svgSelection = d3.select(svgElement);
      pendingResetRef.current = true;

      const finalize = () => {
        if (updateBaseline) {
          defaultViewportRef.current = transform;
        }
        setShowRecenter(false);
        scheduleResetRelease(duration, hideButton);
      };

      if (duration > 0) {
        const transition = svgSelection.transition().duration(duration);
        transition.call(zoomBehavior.transform, transform);
        transition.on('end', finalize);
        transition.on('interrupt', finalize);
      } else {
        svgSelection.call(zoomBehavior.transform, transform);
        finalize();
      }
    },
    [scheduleResetRelease],
  );

  const computeCenterTransform = useCallback(
    (positions = latestPositionsRef.current) => {
      const ids = Object.keys(positions ?? {});
      if (
        ids.length === 0 ||
        !Number.isFinite(canvasSize.width) ||
        !Number.isFinite(canvasSize.height)
      ) {
        return d3.zoomIdentity;
      }

      const bounds = ids.reduce(
        (acc, id) => {
          const point = positions[id];
          if (point) {
            acc.minX = Math.min(acc.minX, point.x);
            acc.maxX = Math.max(acc.maxX, point.x);
            acc.minY = Math.min(acc.minY, point.y);
            acc.maxY = Math.max(acc.maxY, point.y);
          }
          return acc;
        },
        {
          minX: Infinity,
          maxX: -Infinity,
          minY: Infinity,
          maxY: -Infinity,
        },
      );

      if (
        !Number.isFinite(bounds.minX) ||
        !Number.isFinite(bounds.maxX) ||
        !Number.isFinite(bounds.minY) ||
        !Number.isFinite(bounds.maxY)
      ) {
        return d3.zoomIdentity;
      }

      const centerX = (bounds.minX + bounds.maxX) / 2;
      const centerY = (bounds.minY + bounds.maxY) / 2;

      const translateX = canvasSize.width / 2 - centerX;
      const translateY = canvasSize.height / 2 - centerY;

      return d3.zoomIdentity.translate(translateX, translateY);
    },
    [canvasSize.height, canvasSize.width],
  );

  const resetViewport = useCallback(
    (options = {}) => {
      const transform = options.overrideTransform ?? computeCenterTransform();
      applyViewportTransform(transform, options);
    },
    [applyViewportTransform, computeCenterTransform],
  );

  useEffect(() => {
    if (!zoomReady || graphNodes.length === 0) return;
    resetViewport({ duration: 0, hideButton: true });
  }, [zoomReady, graphNodes.length, resetViewport]);

  const handleRecenter = useCallback(() => {
    resetViewport({ duration: 400, hideButton: true });
  }, [resetViewport]);

  const recenterActive = !loading && !error && endpoints && showRecenter;
  const panelNeighbors = panelState.nodeId ? neighborsMap[panelState.nodeId] ?? [] : [];
  const panelLoading = Boolean(panelState.nodeId && loadingNodeId === panelState.nodeId);
  const panelError = panelState.nodeId ? errorByNode[panelState.nodeId] : null;
  const onboardNodeIds = useMemo(
    () => new Set(graphNodes.map((node) => node.id)),
    [graphNodes],
  );
  const hasReachedTarget = useMemo(
    () => Boolean(targetId && graphNodes.some((node) => node.id === targetId)),
    [targetId, graphNodes],
  );
  const steps = useMemo(() => Math.max(0, graphNodes.length - 1), [graphNodes]);
  const gameComplete = Boolean(resultState?.status);

  const connectNode = useCallback(
    (parentId, nodeId, label) => {
      if (!nodeId || !label) return false;
      let addedNode = false;
      setGraphNodes((prev) => {
        if (prev.some((node) => node.id === nodeId)) {
          return prev;
        }
        addedNode = true;
        return [
          ...prev,
          {
            id: nodeId,
            label,
            parentId: parentId ?? null,
          },
        ];
      });
      if (parentId) {
        setGraphLinks((prev) => {
          if (prev.some((link) => link.source === parentId && link.target === nodeId)) {
            return prev;
          }
          return [
            ...prev,
            {
              source: parentId,
              target: nodeId,
            },
          ];
        });
      }
      return addedNode;
    },
    [],
  );

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
    (nodeId) => {
      if (!nodeId || gameComplete) return;
      const currentNode = graphNodes.find((node) => node.id === nodeId);
      setPanelState({
        isOpen: true,
        nodeId,
        nodeName: currentNode?.label ?? 'Unknown',
      });
      requestNeighbors(nodeId).catch(() => {});
    },
    [gameComplete, graphNodes, requestNeighbors],
  );

  const handleNeighborSelect = useCallback(
    (neighborId, neighborName) => {
      if (!panelState.nodeId || !neighborId || gameComplete) return;
      connectNode(panelState.nodeId, neighborId, neighborName);
      setPanelState({
        isOpen: true,
        nodeId: neighborId,
        nodeName: neighborName,
      });
      requestNeighbors(neighborId).catch(() => {});
    },
    [connectNode, gameComplete, panelState.nodeId, requestNeighbors],
  );

  useEffect(() => {
    if (graphNodes.length === 0) {
      latestPositionsRef.current = {};
      setNodePositions({});
      return;
    }

    const nodesCopy = graphNodes.map((node) => {
      const existing = latestPositionsRef.current[node.id];
      const parentPosition = node.parentId ? latestPositionsRef.current[node.parentId] : null;
      const fallbackX = parentPosition?.x ?? canvasSize.width / 2;
      const fallbackY = parentPosition?.y ?? canvasSize.height / 2;
      return {
        ...node,
        x: existing?.x ?? fallbackX,
        y: existing?.y ?? fallbackY,
      };
    });

    const linksCopy = graphLinks.map((link) => ({ ...link }));

    let simulation = null;
    if (graphNodes.length > 1) {
      simulation = d3
        .forceSimulation(nodesCopy)
        .force(
          'link',
          d3
            .forceLink(linksCopy)
            .id((node) => node.id)
            .distance(200)
            .strength(0.3),
        )
        .force('center', d3.forceCenter(canvasSize.width / 2, canvasSize.height / 2))
        .force('charge', d3.forceManyBody().strength(-80))
        .force('collision', d3.forceCollide().radius(80))
        .stop();

      simulation.tick(Math.max(1, 40 - nodesCopy.length * 2));
    }

    const rawPositions = nodesCopy.reduce((acc, node) => {
      acc[node.id] = {
        x: Number.isFinite(node.x) ? node.x : canvasSize.width / 2,
        y: Number.isFinite(node.y) ? node.y : canvasSize.height / 2,
      };
      return acc;
    }, {});

    latestPositionsRef.current = rawPositions;
    setNodePositions(rawPositions);

    if (zoomReady) {
      const targetTransform = computeCenterTransform(rawPositions);
      applyViewportTransform(targetTransform, {
        duration: 0,
        hideButton: true,
        updateBaseline: true,
      });
    }

    return () => {
      simulation?.stop();
    };
  }, [
    graphNodes,
    graphLinks,
    canvasSize.width,
    canvasSize.height,
    zoomReady,
    computeCenterTransform,
    applyViewportTransform,
  ]);

  const handleClosePanel = useCallback(() => {
    setPanelState({ isOpen: false, nodeId: null, nodeName: 'Unknown' });
  }, []);

  useEffect(() => {
    if (!endpoints || !sourceId || gameComplete) return;
    if (hasReachedTarget) {
      setResultState({ status: 'win' });
      return;
    }
    if (steps >= maxSteps && steps > 0 && !hasReachedTarget) {
      setResultState({ status: 'lose' });
    }
  }, [endpoints, sourceId, hasReachedTarget, steps, maxSteps, gameComplete]);

  const handleNewChallenge = useCallback(() => {
    setResultState(null);
    setPanelState({ isOpen: false, nodeId: null, nodeName: 'Unknown' });
    setGraphNodes([]);
    setGraphLinks([]);
    setNeighborsMap({});
    setErrorByNode({});
    neighborsCacheRef.current = {};
    pendingRequestsRef.current = {};
    setEndpoints(null);
    setLoading(true);
    setGameVersion((prev) => prev + 1);
  }, []);

  const resultTitle =
    resultState?.status === 'win' ? 'You Win!' : 'Out of Steps';
  const resultDescription =
    resultState?.status === 'win'
      ? 'You connected the players before running out of moves.'
      : 'You reached the maximum of six steps without finding the target.';

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
                <Box
                  as="span"
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                  px={{ base: 4, md: 5 }}
                  py={{ base: 2.5, md: 3 }}
                  borderRadius="full"
                  bg="rgba(255,255,255,0.03)"
                  border="1px solid rgba(255,255,255,0.08)"
                  color="rgba(230,233,246,0.88)"
                  fontSize={{ base: 'sm', md: 'md' }}
                  fontWeight="600"
                  backdropFilter="blur(6px)"
                >
                  Steps: {steps} / {maxSteps}
                </Box>
              </Stack>

              <Box position="absolute" inset="0" ref={containerRef}>
                <svg
                  ref={svgRef}
                  width="100%"
                  height="100%"
                  role="presentation"
                  aria-label="Player graph"
                  style={{ display: 'block', cursor: isPanning ? 'grabbing' : 'grab' }}
                >
                  <g ref={graphLayerRef}>
                    {graphLinks.map((link) => {
                      const sourcePosition = nodePositions[link.source];
                      const targetPosition = nodePositions[link.target];
                      if (!sourcePosition || !targetPosition) {
                        return null;
                      }
                      return (
                        <line
                          key={`${link.source}-${link.target}`}
                          x1={sourcePosition.x}
                          y1={sourcePosition.y}
                          x2={targetPosition.x}
                          y2={targetPosition.y}
                          stroke="rgba(56, 232, 198, 0.4)"
                          strokeWidth={2}
                          strokeLinecap="round"
                        />
                      );
                    })}
                    {graphNodes.map((node) => {
                      const position =
                        nodePositions[node.id] ?? {
                          x: canvasSize.width / 2,
                          y: canvasSize.height / 2,
                        };
                      const isSourceNode = node.id === sourceId;
                      const isTargetNode = node.id === targetId;
                      let circleFill = 'rgba(56, 232, 198, 0.18)';
                      let circleStroke = 'rgba(56, 232, 198, 0.5)';
                      let shadowColor = '0px 10px 25px rgba(56, 232, 198, 0.35)';

                      if (!isSourceNode && !isTargetNode) {
                        circleFill = 'rgba(109, 116, 209, 0.22)';
                        circleStroke = 'rgba(109, 116, 209, 0.6)';
                        shadowColor = '0px 10px 25px rgba(109, 116, 209, 0.35)';
                      }

                      return (
                        <g
                          key={node.id}
                          transform={`translate(${position.x}, ${position.y})`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleNodeClick(node.id)}
                        >
                          <circle
                            r={72}
                            fill={circleFill}
                            stroke={circleStroke}
                            strokeWidth={2.5}
                            style={{ filter: `drop-shadow(${shadowColor})` }}
                          />
                          <text
                            textAnchor="middle"
                            dy="0.35em"
                            fill="#E4E8FF"
                            fontSize={16}
                            fontWeight={600}
                          >
                            {node.label}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                </svg>

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
                onNeighborSelect={handleNeighborSelect}
                selectedNodeName={panelState.nodeName}
                disabledNeighborIds={onboardNodeIds}
                isSelectionDisabled={gameComplete}
              />
            </>
          )}
        </Box>
      </Flex>
      <Modal isOpen={Boolean(resultState)} onClose={() => {}} isCentered closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent bg="#0F1320" border="1px solid rgba(255,255,255,0.08)" borderRadius="2xl">
          <ModalHeader color="#E4E8FF">{resultTitle}</ModalHeader>
          <ModalBody>
            <Text color="#9CA3AF">{resultDescription}</Text>
          </ModalBody>
          <ModalFooter display="flex" gap={3}>
            <Button variant="outline" borderColor="rgba(255,255,255,0.2)" color="#E4E8FF" onClick={onBack}>
              Back to Modes
            </Button>
            <Button colorScheme="brand" onClick={handleNewChallenge}>
              New Challenge
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
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
    textAlign="center"
  >
    <Text fontSize="xs" letterSpacing="0.2em" color={textColor} mb={1} textAlign="center">
      {label}
    </Text>
    <Text fontSize={{ base: 'md', md: 'lg' }} color="#E4E8FF" fontWeight="600" textAlign="center">
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
