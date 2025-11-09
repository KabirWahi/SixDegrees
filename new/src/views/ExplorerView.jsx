import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  CloseButton,
  Flex,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import GameHeader from '../components/GameHeader.jsx';
import GraphCanvas from '../components/GraphCanvas.jsx';
import RightNeighborsPanel from '../components/RightNeighborsPanel.jsx';
import useGraphGame from '../hooks/useGraphGame.js';
import normalizeText from '../utils/normalizeText.js';

const PLAYER_LIST_URL = 'https://api.sixdegrees.kabirwahi.com/api/football?path=playerlist';

const PAGE_BACKGROUND_PROPS = {
  bg: '#0A0F1A',
  bgImage:
    'radial-gradient(circle at center, rgba(40,80,180,0.08) 0%, transparent 50%), radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)',
  bgSize: 'cover, 8px 8px',
};
const EXPLORER_ACCENT = '#38E8C6';

const ExplorerView = ({ onBack }) => {
  const {
    loading,
    error,
    source,
    graphNodes,
    graphLinks,
    neighborsMap,
    loadingNodeId,
    errorByNode,
    requestNeighbors,
    connectNode,
    setManualSource,
    resetManualGame,
  } = useGraphGame({ maxSteps: null, mode: 'manual' });

  const [panelState, setPanelState] = useState({
    isOpen: false,
    nodeId: null,
    nodeName: 'Unknown',
  });
  const [playerList, setPlayerList] = useState([]);
  const [playerLoading, setPlayerLoading] = useState(true);
  const [playerError, setPlayerError] = useState(null);

  const sourceId = source?.[0];
  useEffect(() => {
    let isMounted = true;
    const fetchPlayers = async () => {
      try {
        setPlayerLoading(true);
        const response = await fetch(PLAYER_LIST_URL);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data = await response.json();
        if (!isMounted) return;
        const entries = Object.entries(data ?? {}).map(([id, name]) => [id, name]);
        entries.sort((a, b) => a[1].localeCompare(b[1]));
        setPlayerList(entries);
        setPlayerError(null);
      } catch (err) {
        if (isMounted) {
          setPlayerError(err);
          setPlayerList([]);
        }
      } finally {
        if (isMounted) {
          setPlayerLoading(false);
        }
      }
    };

    fetchPlayers();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!sourceId) {
      setPanelState({ isOpen: false, nodeId: null, nodeName: 'Unknown' });
      return;
    }
    const controller = new AbortController();
    requestNeighbors(sourceId, { signal: controller.signal }).catch(() => {});
    return () => controller.abort();
  }, [requestNeighbors, sourceId]);

  const panelNeighbors = panelState.nodeId ? neighborsMap[panelState.nodeId] ?? [] : [];
  const panelLoading = Boolean(panelState.nodeId && loadingNodeId === panelState.nodeId);
  const panelError = panelState.nodeId ? errorByNode[panelState.nodeId] : null;
  const onboardNodeIds = useMemo(
    () => new Set(graphNodes.map((node) => node.id)),
    [graphNodes],
  );

  const handlePlayerSelect = useCallback(
    (playerId, playerName) => {
      setManualSource(playerId, playerName);
    },
    [setManualSource],
  );

  const handleNodeClick = useCallback(
    (nodeId) => {
      if (!nodeId) return;
      const currentNode = graphNodes.find((node) => node.id === nodeId);
      setPanelState({
        isOpen: true,
        nodeId,
        nodeName: currentNode?.label ?? 'Unknown',
      });
      requestNeighbors(nodeId).catch(() => {});
    },
    [graphNodes, requestNeighbors],
  );

  const handleNeighborSelect = useCallback(
    (neighborId, neighborName) => {
      if (!panelState.nodeId || !neighborId) return;
      connectNode(panelState.nodeId, neighborId, neighborName);
      setPanelState({
        isOpen: true,
        nodeId: neighborId,
        nodeName: neighborName,
      });
      requestNeighbors(neighborId).catch(() => {});
    },
    [connectNode, panelState.nodeId, requestNeighbors],
  );

  const handleClosePanel = useCallback(() => {
    setPanelState({ isOpen: false, nodeId: null, nodeName: 'Unknown' });
  }, []);

  const handleReset = useCallback(() => {
    handleClosePanel();
    resetManualGame();
  }, [handleClosePanel, resetManualGame]);

  const hasStartPlayer = Boolean(sourceId);

  return (
    <Box minH="100vh" {...PAGE_BACKGROUND_PROPS}>
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
          title="Explorer"
          subtitle="Pick any player and wander freely through their connections."
          onBack={onBack}
          containerProps={{
            px: { base: 4, md: 6 },
            pt: 0,
            pb: { base: 3, md: 4 },
          }}
          accentColor={EXPLORER_ACCENT}
        />

        <Box
          position="relative"
          flex="1"
          minH="0"
          borderRadius="3xl"
          overflow="hidden"
          bg="#050713"
          bgImage="radial-gradient(circle at center, rgba(40,80,180,0.05) 0%, transparent 55%), radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)"
          bgSize="cover, 12px 12px"
          bgPosition="center, center"
          border="1px solid rgba(109, 116, 209, 0.15)"
          w="100%"
        >
          {loading && (
            <Flex align="center" justify="center" h="100%">
              <Spinner size="xl" color="brand.400" thickness="4px" />
            </Flex>
          )}

          {!loading && error && (
            <Flex align="center" justify="center" h="100%" px={6}>
              <AlertMessage message={error.message ?? 'Unable to load explorer data.'} />
            </Flex>
          )}

          {!loading && !error && graphNodes.length > 0 && (
            <>
              <GraphCanvas
                nodes={graphNodes}
                links={graphLinks}
                sourceId={sourceId}
                onNodeClick={handleNodeClick}
                isInteractionDisabled={!hasStartPlayer}
                useUniformColors
                activeNodeId={panelState.nodeId}
                accentColor={EXPLORER_ACCENT}
              />

              <RightNeighborsPanel
                isOpen={panelState.isOpen}
                neighbors={panelNeighbors}
                isLoading={panelLoading}
                error={panelError}
                onClose={handleClosePanel}
                onNeighborSelect={handleNeighborSelect}
                selectedNodeName={panelState.nodeName}
                disabledNeighborIds={onboardNodeIds}
                accentColor={EXPLORER_ACCENT}
              />

              {hasStartPlayer ? (
                <IconButton
                  aria-label="Reset explorer graph"
                  icon={<ReplayIcon boxSize={5} />}
                  position="absolute"
                  bottom={{ base: 4, md: 6 }}
                  left={{ base: 4, md: 6 }}
                  bg="rgba(26, 34, 54, 0.96)"
                  color="#E4E8FF"
                  borderRadius="full"
                  h="48px"
                  w="48px"
                  boxShadow="0 12px 24px -12px rgba(15, 23, 42, 0.8)"
                  _hover={{ bg: 'rgba(44, 56, 88, 0.96)' }}
                  _active={{ bg: 'rgba(18, 23, 40, 0.96)' }}
                  onClick={handleReset}
                />
              ) : null}
            </>
          )}

          <PlayerSelectModal
            isOpen={!hasStartPlayer}
            isLoading={playerLoading}
            error={playerError}
            players={playerList}
            onSelectPlayer={handlePlayerSelect}
            accentColor={EXPLORER_ACCENT}
          />
        </Box>
      </Flex>
    </Box>
  );
};

ExplorerView.propTypes = {
  onBack: PropTypes.func.isRequired,
};

const AlertMessage = ({ message }) => (
  <Box
    borderRadius="lg"
    bg="rgba(230,57,70,0.12)"
    border="1px solid rgba(230,57,70,0.3)"
    px={6}
    py={4}
    color="#FCA5A5"
    textAlign="center"
  >
    {message}
  </Box>
);

AlertMessage.propTypes = {
  message: PropTypes.string.isRequired,
};

const PlayerSelectModal = ({
  isOpen,
  isLoading,
  error,
  players,
  onSelectPlayer,
  accentColor,
}) => {
  const inputRef = useRef(null);
  const listItemRefs = useRef([]);
  const playersRef = useRef([]);
  const [query, setQuery] = useState('');
  const sortedPlayers = useMemo(() => {
    if (!Array.isArray(players)) return [];
    return [...players].sort((a, b) => a[1].localeCompare(b[1]));
  }, [players]);
  const filteredPlayers = useMemo(() => {
    if (!query.trim()) return sortedPlayers;
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery) return sortedPlayers;
    return sortedPlayers.filter(([, name]) => normalizeText(name).includes(normalizedQuery));
  }, [query, sortedPlayers]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const playerCount = filteredPlayers.length;
  const hasPlayers = playerCount > 0;

  listItemRefs.current = [];
  useEffect(() => {
    playersRef.current = filteredPlayers;
  }, [filteredPlayers]);

  useEffect(() => {
    if (highlightedIndex >= playerCount) {
      setHighlightedIndex(playerCount > 0 ? playerCount - 1 : -1);
    }
  }, [playerCount, highlightedIndex]);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [isOpen, query]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || isLoading) return;
    const frame = requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen, isLoading]);

  const handleSelect = useCallback(
    (playerId, playerName) => {
      if (!playerId || !playerName) return;
      onSelectPlayer(playerId, playerName);
      setHighlightedIndex(-1);
      setQuery('');
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      });
    },
    [onSelectPlayer],
  );

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKey = (event) => {
      if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) return;
      if (isLoading || error || !hasPlayers) return;
      const currentPlayers = playersRef.current ?? [];

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setHighlightedIndex((prev) => {
          if (prev === -1 || prev >= playerCount - 1) return 0;
          return prev + 1;
        });
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setHighlightedIndex((prev) => {
          if (prev <= 0) return playerCount - 1;
          return prev - 1;
        });
      } else if (event.key === 'Enter') {
        if (highlightedIndex < 0 || highlightedIndex >= currentPlayers.length) return;
        event.preventDefault();
        const [playerId, playerName] = currentPlayers[highlightedIndex];
        handleSelect(playerId, playerName);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [error, handleSelect, hasPlayers, highlightedIndex, isLoading, isOpen, playerCount]);

  useEffect(() => {
    if (highlightedIndex < 0) return;
    const target = listItemRefs.current[highlightedIndex];
    if (target) {
      target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [highlightedIndex]);

  return (
    <Modal isOpen={isOpen} onClose={() => {}} isCentered closeOnOverlayClick={false}>
      <ModalOverlay bg="rgba(6, 9, 18, 0.9)" backdropFilter="blur(4px)" />
      <ModalContent bg="#0F1320" border="1px solid rgba(255,255,255,0.08)" borderRadius="2xl" maxH="80vh">
        <ModalHeader color="#E4E8FF">Choose a Starting Player</ModalHeader>
        <ModalBody>
          {isLoading ? (
            <Flex align="center" justify="center" py={8}>
              <Spinner size="lg" color="brand.400" thickness="4px" />
            </Flex>
          ) : error ? (
            <AlertMessage message={error.message ?? 'Unable to load player list.'} />
          ) : (
            <Stack spacing={4}>
              <InputGroup>
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search players"
                  bg="rgba(255,255,255,0.02)"
                  borderColor="rgba(255,255,255,0.08)"
                  color="#E4E8FF"
                  _placeholder={{ color: 'rgba(255,255,255,0.4)' }}
                  _hover={{ borderColor: 'rgba(255,255,255,0.16)' }}
                  _focusVisible={{
                    borderColor: '#6d74d1',
                    boxShadow: '0 0 0 1px rgba(109, 116, 209, 0.45)',
                  }}
                />
                {query ? (
                  <InputRightElement height="100%" pr={1.5}>
                    <CloseButton
                      size="sm"
                      color="#9CA3AF"
                      onClick={() => {
                        setQuery('');
                        if (inputRef.current) {
                          inputRef.current.focus();
                          inputRef.current.select();
                        }
                      }}
                      _hover={{ bg: 'rgba(255,255,255,0.12)' }}
                    />
                  </InputRightElement>
                ) : null}
              </InputGroup>

              <Box
                maxH="45vh"
                overflowY="auto"
                pr="2"
                css={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(255,255,255,0.08) transparent',
                  '::-webkit-scrollbar': { width: '10px' },
                  '::-webkit-scrollbar-thumb': {
                    background: 'rgba(255,255,255,0.07)',
                    borderRadius: '10px',
                    border: '3px solid transparent',
                    backgroundClip: 'content-box',
                  },
                  '::-webkit-scrollbar-thumb:hover': {
                    background: 'rgba(255,255,255,0.12)',
                  },
                }}
              >
                {playerCount === 0 ? (
                  <Flex align="center" justify="center" py={10}>
                    <Text color="#9CA3AF" textAlign="center">
                      No players match your search.
                    </Text>
                  </Flex>
                ) : (
                  <Stack spacing={2}>
                    {filteredPlayers.map(([id, name], index) => {
                      const isHighlighted = index === highlightedIndex;
                      const baseBg = isHighlighted ? `${accentColor}1f` : 'rgba(255,255,255,0.02)';
                      const hoverBg = isHighlighted ? `${accentColor}33` : 'rgba(255,255,255,0.04)';
                      return (
                        <Box
                          key={id}
                          as="button"
                          type="button"
                          w="100%"
                          textAlign="left"
                          borderRadius="lg"
                          px={4}
                          py={3}
                          bg={baseBg}
                          color="#E4E8FF"
                          transition="background 120ms ease"
                          _hover={{ bg: hoverBg }}
                          _active={{ bg: `${accentColor}33` }}
                          _focusVisible={{
                            outline: `2px solid ${accentColor}`,
                            outlineOffset: '2px',
                          }}
                          ref={(element) => {
                            listItemRefs.current[index] = element;
                          }}
                          onClick={() => handleSelect(id, name)}
                        >
                          {name}
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Box>
            </Stack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

PlayerSelectModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.object,
  players: PropTypes.arrayOf(PropTypes.array).isRequired,
  onSelectPlayer: PropTypes.func.isRequired,
  accentColor: PropTypes.string,
};

PlayerSelectModal.defaultProps = {
  isLoading: false,
  error: null,
  accentColor: '#38E8C6',
};

const ReplayIcon = (props) => (
  <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path d="M12 5v4l3-3-3-3v4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 5a7 7 0 1 0 7 7" strokeLinecap="round" />
  </Icon>
);

export default ExplorerView;
