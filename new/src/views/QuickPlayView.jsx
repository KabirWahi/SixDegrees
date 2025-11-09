import { useCallback, useEffect, useMemo, useState } from 'react';
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
import RightNeighborsPanel from '../components/RightNeighborsPanel.jsx';
import GraphCanvas from '../components/GraphCanvas.jsx';
import GameResultModal from '../components/GameResultModal.jsx';
import { SidebarCounterCard, SidebarTargetCard } from '../components/SidebarCards.jsx';
import useGraphGame from '../hooks/useGraphGame.js';

const PAGE_BACKGROUND_PROPS = {
  bg: '#0A0F1A',
  bgImage:
    'radial-gradient(circle at center, rgba(40,80,180,0.08) 0%, transparent 50%), radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)',
  bgSize: 'cover, 8px 8px',
};
const QUICK_PLAY_ACCENT = '#FFC54D';

const QuickPlayView = ({ onBack }) => {
  const {
    loading,
    error,
    source,
    target,
    graphNodes,
    graphLinks,
    steps,
    maxSteps,
    resultState,
    gameComplete,
    neighborsMap,
    loadingNodeId,
    errorByNode,
    requestNeighbors,
    connectNode,
    startNewChallenge,
  } = useGraphGame({ maxSteps: 6 });

  const [panelState, setPanelState] = useState({
    isOpen: false,
    nodeId: null,
    nodeName: 'Unknown',
  });

  const sourceId = source?.[0];
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
    if (!sourceId) return;
    const controller = new AbortController();
    requestNeighbors(sourceId, { signal: controller.signal }).catch(() => {});
    return () => controller.abort();
  }, [requestNeighbors, sourceId]);

  useEffect(() => {
    setPanelState({ isOpen: false, nodeId: null, nodeName: 'Unknown' });
  }, [sourceId]);

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

  const handleClosePanel = useCallback(() => {
    setPanelState({ isOpen: false, nodeId: null, nodeName: 'Unknown' });
  }, []);

  const handleNewChallenge = useCallback(() => {
    handleClosePanel();
    startNewChallenge();
  }, [handleClosePanel, startNewChallenge]);

  const resultTitle =
    resultState?.status === 'win'
      ? 'You Win!'
      : resultState?.status === 'lose'
        ? 'Out of Steps'
        : undefined;
  const resultDescription =
    resultState?.status === 'win'
      ? 'You connected the players before running out of moves.'
      : resultState?.status === 'lose'
        ? 'You reached the maximum of six steps without finding the target.'
        : undefined;

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
                <SidebarTargetCard
                  label="Target Player"
                  value={targetName}
                  maxW={{ base: '260px', md: '320px' }}
                />
                <SidebarCounterCard
                  label="Steps"
                  value={`${steps} / ${maxSteps}`}
                  minW={{ base: '200px', md: '220px' }}
                />
              </Stack>

              <GraphCanvas
                nodes={graphNodes}
                links={graphLinks}
                sourceId={sourceId}
                targetId={targetId}
                onNodeClick={handleNodeClick}
                isInteractionDisabled={gameComplete}
                activeNodeId={panelState.nodeId}
                accentColor={QUICK_PLAY_ACCENT}
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
                isSelectionDisabled={gameComplete}
              />
            </>
          )}
        </Box>
      </Flex>

      <GameResultModal
        isOpen={Boolean(resultState)}
        status={resultState?.status}
        title={resultTitle}
        description={resultDescription}
        onBack={onBack}
        onReplay={handleNewChallenge}
      />
    </Box>
  );
};

QuickPlayView.propTypes = {
  onBack: PropTypes.func.isRequired,
};

export default QuickPlayView;
