import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Flex,
  Icon,
  IconButton,
  Input,
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
  const [playerSearch, setPlayerSearch] = useState('');
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

  const filteredPlayers = useMemo(() => {
    if (!playerSearch.trim()) return playerList;
    const normalizedQuery = normalizeText(playerSearch);
    return playerList.filter(([, name]) => normalizeText(name).includes(normalizedQuery));
  }, [playerList, playerSearch]);

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
      setPlayerSearch('');
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
          title="Explorer"
          subtitle="Pick any player and wander freely through their connections."
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
            players={filteredPlayers}
            searchValue={playerSearch}
            onSearchChange={setPlayerSearch}
            onSelectPlayer={handlePlayerSelect}
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
  searchValue,
  onSearchChange,
  onSelectPlayer,
}) => {
  const inputRef = useRef(null);

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
              <Input
                ref={inputRef}
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
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
              <Box maxH="45vh" overflowY="auto" pr={2}>
                {players.length === 0 ? (
                  <Text color="#9CA3AF" textAlign="center">
                    No players match your search.
                  </Text>
                ) : (
                  <Stack spacing={1}>
                    {players.map(([id, name]) => (
                      <Box
                        key={id}
                        as="button"
                        type="button"
                        w="100%"
                        textAlign="left"
                        borderRadius="lg"
                        px={3}
                        py={2.5}
                        bg="rgba(255,255,255,0.02)"
                        color="#E4E8FF"
                        _hover={{ bg: 'rgba(255,255,255,0.05)' }}
                        _focusVisible={{
                          outline: '2px solid #6d74d1',
                          outlineOffset: '2px',
                        }}
                        onClick={() => onSelectPlayer(id, name)}
                      >
                        {name}
                      </Box>
                    ))}
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
  searchValue: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onSelectPlayer: PropTypes.func.isRequired,
};

PlayerSelectModal.defaultProps = {
  isLoading: false,
  error: null,
};

const ReplayIcon = (props) => (
  <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path d="M12 5v4l3-3-3-3v4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 5a7 7 0 1 0 7 7" strokeLinecap="round" />
  </Icon>
);

export default ExplorerView;
