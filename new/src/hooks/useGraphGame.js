import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import fetchNeighbors from '../utils/fetchNeighbors.js';

const ENDPOINTS_URL = 'https://api.sixdegrees.kabirwahi.com/api/football?path=endpoints';

const useGraphGame = ({ maxSteps = 6, mode = 'challenge' } = {}) => {
  const isChallengeMode = mode === 'challenge';
  const [loading, setLoading] = useState(isChallengeMode);
  const [error, setError] = useState(null);
  const [endpoints, setEndpoints] = useState(null);
  const [manualSource, setManualSource] = useState(null);
  const [graphNodes, setGraphNodes] = useState([]);
  const [graphLinks, setGraphLinks] = useState([]);
  const [neighborsMap, setNeighborsMap] = useState({});
  const [loadingNodeId, setLoadingNodeId] = useState(null);
  const [errorByNode, setErrorByNode] = useState({});
  const [resultState, setResultState] = useState(null);
  const [challengeSeed, setChallengeSeed] = useState(0);

  const neighborsCacheRef = useRef({});
  const pendingRequestsRef = useRef({});

  const resetCaches = useCallback(() => {
    neighborsCacheRef.current = {};
    pendingRequestsRef.current = {};
    setNeighborsMap({});
    setErrorByNode({});
    setLoadingNodeId(null);
  }, []);

  useEffect(() => {
    if (!isChallengeMode) {
      setLoading(false);
      return;
    }

    let isSubscribed = true;
    const fetchEndpoints = async () => {
      try {
        setLoading(true);
        const response = await fetch(ENDPOINTS_URL);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data = await response.json();
        if (!isSubscribed) return;
        setEndpoints(data);
        setError(null);
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
  }, [challengeSeed, isChallengeMode]);

  const activeSource = isChallengeMode ? endpoints?.source ?? null : manualSource;
  const activeTarget = isChallengeMode ? endpoints?.target ?? null : null;

  const sourceId = activeSource?.[0];
  const sourceLabel = activeSource?.[1] ?? 'Unknown';
  const targetId = activeTarget?.[0];

  useEffect(() => {
    if (!sourceId) {
      setGraphNodes([]);
      setGraphLinks([]);
      setResultState(null);
      resetCaches();
      return;
    }

    setGraphNodes([
      {
        id: sourceId,
        label: sourceLabel,
        parentId: null,
      },
    ]);
    setGraphLinks([]);
    setResultState(null);
    resetCaches();
  }, [resetCaches, sourceId, sourceLabel]);

  const finalizeResult = useCallback((nextStatus) => {
    if (!nextStatus) return;
    setResultState((prev) => prev ?? nextStatus);
  }, []);

  const evaluateProgress = useCallback(
    (candidateNodes) => {
      if (!candidateNodes || candidateNodes.length === 0) return;

      const reachedTarget =
        Boolean(targetId) && candidateNodes.some((node) => node.id === targetId);
      if (reachedTarget) {
        finalizeResult({ status: 'win' });
        return;
      }

      if (typeof maxSteps === 'number' && maxSteps > 0) {
        const candidateSteps = Math.max(0, candidateNodes.length - 1);
        if (candidateSteps >= maxSteps) {
          finalizeResult({ status: 'lose' });
        }
      }
    },
    [finalizeResult, maxSteps, targetId],
  );

  const connectNode = useCallback(
    (parentId, nodeId, label) => {
      if (!nodeId || !label || resultState?.status) return false;
      let didAdd = false;

      setGraphNodes((prev) => {
        if (prev.some((node) => node.id === nodeId)) {
          return prev;
        }
        didAdd = true;
        const next = [
          ...prev,
          {
            id: nodeId,
            label,
            parentId: parentId ?? null,
          },
        ];
        evaluateProgress(next);
        return next;
      });

      if (didAdd && parentId) {
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

      return didAdd;
    },
    [evaluateProgress, resultState?.status],
  );

  const requestNeighbors = useCallback((nodeId, options = {}) => {
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
  }, []);

  const setManualStart = useCallback((nodeId, label) => {
    if (!nodeId || !label) return;
    setManualSource([nodeId, label]);
  }, []);

  const resetManualGame = useCallback(() => {
    setManualSource(null);
    setGraphNodes([]);
    setGraphLinks([]);
    setResultState(null);
    resetCaches();
  }, [resetCaches]);

  const handleNewChallenge = useCallback(() => {
    if (isChallengeMode) {
      resetCaches();
      setGraphNodes([]);
      setGraphLinks([]);
      setEndpoints(null);
      setResultState(null);
      setChallengeSeed((prev) => prev + 1);
    } else {
      resetManualGame();
    }
  }, [isChallengeMode, resetCaches, resetManualGame]);

  const steps = useMemo(() => Math.max(0, graphNodes.length - 1), [graphNodes]);
  const gameComplete = Boolean(resultState?.status);

  return {
    loading,
    error,
    endpoints,
    source: activeSource,
    target: activeTarget,
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
    startNewChallenge: handleNewChallenge,
    setManualSource: setManualStart,
    resetManualGame,
  };
};

export default useGraphGame;
