import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import GameHeader from '../components/GameHeader.jsx';
import GraphCanvas from '../components/GraphCanvas.jsx';
import RightNeighborsPanel from '../components/RightNeighborsPanel.jsx';
import GameResultModal from '../components/GameResultModal.jsx';
import InfoPill from '../components/InfoPill.jsx';
import useGraphGame from '../hooks/useGraphGame.js';

const INITIAL_TIME_SECONDS = 120;
const BONUS_TIME_SECONDS = 20;

const formatTime = (seconds) => {
  const clamped = Math.max(0, seconds);
  const mins = Math.floor(clamped / 60)
    .toString()
    .padStart(2, '0');
  const secs = (clamped % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

const TimedModeView = ({ onBack }) => {
  const {
    loading,
    error,
    source,
    target,
    graphNodes,
    graphLinks,
    neighborsMap,
    loadingNodeId,
    errorByNode,
    requestNeighbors,
    connectNode,
    startNewChallenge,
    resultState,
  } = useGraphGame({ maxSteps: null });

  const [panelState, setPanelState] = useState({
    isOpen: false,
    nodeId: null,
    nodeName: 'Unknown',
  });
  const [timeRemaining, setTimeRemaining] = useState(INITIAL_TIME_SECONDS);
  const [score, setScore] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [bonusVisible, setBonusVisible] = useState(false);
  const bonusTimeoutRef = useRef(null);

  const sourceId = source?.[0];
  const sourceName = source?.[1] ?? 'Unknown';
  const targetId = target?.[0];
  const targetName = target?.[1] ?? 'Unknown';

  const panelNeighbors = panelState.nodeId ? neighborsMap[panelState.nodeId] ?? [] : [];
  const panelLoading = Boolean(panelState.nodeId && loadingNodeId === panelState.nodeId);
  const panelError = panelState.nodeId ? errorByNode[panelState.nodeId] : null;
  const onboardNodeIds = useMemo(
    () => new Set(graphNodes.map((node) => node.id)),
    [graphNodes],
  );

  useEffect(() => {
    setPanelState({ isOpen: false, nodeId: null, nodeName: 'Unknown' });
  }, [sourceId]);

  useEffect(() => {
    if (!sourceId) return;
    const controller = new AbortController();
    requestNeighbors(sourceId, { signal: controller.signal }).catch(() => {});
    return () => controller.abort();
  }, [requestNeighbors, sourceId]);

  useEffect(() => {
    if (isTimeUp) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimeUp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimeUp]);

  const triggerBonusFlash = useCallback(() => {
    setBonusVisible(false);
    requestAnimationFrame(() => {
      setBonusVisible(true);
      if (bonusTimeoutRef.current) {
        clearTimeout(bonusTimeoutRef.current);
      }
      bonusTimeoutRef.current = setTimeout(() => {
        setBonusVisible(false);
        bonusTimeoutRef.current = null;
      }, 2800);
    });
  }, []);

  useEffect(
    () => () => {
      if (bonusTimeoutRef.current) {
        clearTimeout(bonusTimeoutRef.current);
        bonusTimeoutRef.current = null;
      }
    },
    [],
  );

  useEffect(() => {
    if (resultState?.status !== 'win' || isTimeUp) return;
    setScore((prev) => prev + 1);
    setTimeRemaining((prev) => prev + BONUS_TIME_SECONDS);
    triggerBonusFlash();
    startNewChallenge();
  }, [isTimeUp, resultState?.status, startNewChallenge, triggerBonusFlash]);

  const handleNodeClick = useCallback(
    (nodeId) => {
      if (!nodeId || isTimeUp) return;
      const currentNode = graphNodes.find((node) => node.id === nodeId);
      setPanelState({
        isOpen: true,
        nodeId,
        nodeName: currentNode?.label ?? 'Unknown',
      });
      requestNeighbors(nodeId).catch(() => {});
    },
    [graphNodes, isTimeUp, requestNeighbors],
  );

  const handleNeighborSelect = useCallback(
    (neighborId, neighborName) => {
      if (!panelState.nodeId || !neighborId || isTimeUp) return;
      connectNode(panelState.nodeId, neighborId, neighborName);
      setPanelState({
        isOpen: true,
        nodeId: neighborId,
        nodeName: neighborName,
      });
      requestNeighbors(neighborId).catch(() => {});
    },
    [connectNode, isTimeUp, panelState.nodeId, requestNeighbors],
  );

  const handleClosePanel = useCallback(() => {
    setPanelState({ isOpen: false, nodeId: null, nodeName: 'Unknown' });
  }, []);

  const handleReplay = useCallback(() => {
    setTimeRemaining(INITIAL_TIME_SECONDS);
    setScore(0);
    setIsTimeUp(false);
    setBonusActive(false);
    handleClosePanel();
    startNewChallenge();
  }, [handleClosePanel, startNewChallenge]);

  const formattedTime = formatTime(timeRemaining);

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
          title="Time Trial"
          subtitle="Race the clock to connect as many players as possible."
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
                {error.message ?? 'Unable to fetch time trial endpoints.'}
              </Alert>
            </Flex>
          )}

          {!loading && !error && graphNodes.length > 0 && (
            <>
              <Stack
                position="absolute"
                top={{ base: 3, md: 5 }}
                left={{ base: 3, md: 5 }}
                spacing={{ base: 2, md: 3 }}
                zIndex={2}
                pointerEvents="none"
              >
                <TimedChip
                  label="TARGET PLAYER"
                  value={targetName}
                  accent="rgba(255, 90, 126, 0.18)"
                  borderColor="rgba(255, 90, 126, 0.35)"
                  textColor="#FF5A7E"
                />
                <Stack spacing={{ base: 2, md: 3 }}>
                  <InfoPill label="TIME LEFT" value={formattedTime} />
                  <InfoPill label="SCORE" value={score} />
                </Stack>
              </Stack>

              <GraphCanvas
                nodes={graphNodes}
                links={graphLinks}
                sourceId={sourceId}
                targetId={targetId}
                onNodeClick={handleNodeClick}
                isInteractionDisabled={isTimeUp}
                activeNodeId={panelState.nodeId}
              />

              <Text
                position="absolute"
                top="12px"
                left="50%"
                transform="translateX(-50%)"
                color="#38E8C6"
                fontWeight="600"
                fontSize={{ base: 'md', md: 'lg' }}
                textAlign="center"
                pointerEvents="none"
                style={{
                  opacity: bonusVisible ? 1 : 0,
                  transition: 'opacity 0.4s ease',
                }}
              >
                +20s
              </Text>

              <RightNeighborsPanel
                isOpen={panelState.isOpen}
                neighbors={panelNeighbors}
                isLoading={panelLoading}
                error={panelError}
                onClose={handleClosePanel}
                onNeighborSelect={handleNeighborSelect}
                selectedNodeName={panelState.nodeName}
                disabledNeighborIds={onboardNodeIds}
                isSelectionDisabled={isTimeUp}
              />
            </>
          )}
        </Box>
      </Flex>

      <GameResultModal
        isOpen={isTimeUp}
        status="lose"
        title="Time's Up"
        description={`You connected ${score} ${score === 1 ? 'pair' : 'pairs'} before the clock ran out.`}
        onBack={onBack}
        onReplay={handleReplay}
        replayLabel="Play Again"
      />
    </Box>
  );
};

TimedModeView.propTypes = {
  onBack: PropTypes.func.isRequired,
};

const TimedChip = ({ label, value, accent, borderColor, textColor }) => (
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

TimedChip.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  accent: PropTypes.string.isRequired,
  borderColor: PropTypes.string.isRequired,
  textColor: PropTypes.string.isRequired,
};

export default TimedModeView;
