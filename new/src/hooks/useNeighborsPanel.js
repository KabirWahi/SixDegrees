import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_DEBOUNCE_MS = 150;

const createUpdatedMap = (prev, key, value) => {
  if (prev[key] === value) return prev;
  const next = { ...prev };
  if (value === undefined) {
    delete next[key];
    return next;
  }
  next[key] = value;
  return next;
};

const normalizeName = (name) => (typeof name === 'string' && name.trim().length > 0 ? name : 'Unknown');

const useNeighborsPanel = ({
  requestNeighbors,
  targetNodeId = null,
  debounceMs = DEFAULT_DEBOUNCE_MS,
} = {}) => {
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedNodeName, setSelectedNodeName] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [neighborsMap, setNeighborsMap] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  const [errorMap, setErrorMap] = useState({});

  const abortRef = useRef(null);
  const debounceRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(
    () => () => {
      isMountedRef.current = false;
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    },
    [],
  );

  const getNeighbors = useCallback(
    (nodeId) => (nodeId ? neighborsMap[nodeId] : undefined),
    [neighborsMap],
  );

  const getIsLoading = useCallback(
    (nodeId) => Boolean(nodeId && loadingMap[nodeId]),
    [loadingMap],
  );

  const getError = useCallback(
    (nodeId) => (nodeId ? errorMap[nodeId] : null),
    [errorMap],
  );

  const startFetch = useCallback(
    async (nodeId, { force = false } = {}) => {
      if (!nodeId || nodeId === targetNodeId) return;

      const cached = neighborsMap[nodeId];
      if (!force && Array.isArray(cached)) return;

      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }

      const controller = new AbortController();
      abortRef.current = controller;

      setLoadingMap((prev) => createUpdatedMap(prev, nodeId, true));
      setErrorMap((prev) => createUpdatedMap(prev, nodeId, undefined));

      try {
        const neighbors = await requestNeighbors(nodeId, controller.signal);
        if (controller.signal.aborted || !isMountedRef.current) return;

        setNeighborsMap((prev) => createUpdatedMap(prev, nodeId, neighbors));
      } catch (error) {
        if (controller.signal.aborted || !isMountedRef.current) return;
        setErrorMap((prev) => createUpdatedMap(prev, nodeId, error));
      } finally {
        if (controller.signal.aborted || !isMountedRef.current) return;
        setLoadingMap((prev) => createUpdatedMap(prev, nodeId, undefined));
        abortRef.current = null;
      }
    },
    [neighborsMap, requestNeighbors, targetNodeId],
  );

  const scheduleFetch = useCallback(
    (nodeId, { force = false, debounced = true } = {}) => {
      if (!nodeId || nodeId === targetNodeId) return;
      const cached = neighborsMap[nodeId];
      if (!force && Array.isArray(cached)) return;
      if (debounced && getIsLoading(nodeId)) return;

      if (debounced) {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
          debounceRef.current = null;
          startFetch(nodeId, { force });
        }, debounceMs);
        return;
      }

      startFetch(nodeId, { force });
    },
    [debounceMs, getIsLoading, neighborsMap, startFetch, targetNodeId],
  );

  const open = useCallback(
    (nodeId, nodeName) => {
      if (!nodeId) return;
      setSelectedNodeId(nodeId);
      setSelectedNodeName(normalizeName(nodeName));
      setIsOpen(true);
      scheduleFetch(nodeId, { debounced: true });
    },
    [scheduleFetch],
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setSelectedNodeId(null);
    setSelectedNodeName(null);
  }, []);

  const refresh = useCallback(() => {
    if (!selectedNodeId) return;
    startFetch(selectedNodeId, { force: true });
  }, [selectedNodeId, startFetch]);

  const prefetch = useCallback(
    (nodeId) => {
      scheduleFetch(nodeId, { debounced: false });
    },
    [scheduleFetch],
  );

  const selectedNeighbors = useMemo(
    () => getNeighbors(selectedNodeId) ?? [],
    [getNeighbors, selectedNodeId],
  );

  const selectedLoading = useMemo(
    () => getIsLoading(selectedNodeId),
    [getIsLoading, selectedNodeId],
  );

  const selectedError = useMemo(
    () => getError(selectedNodeId),
    [getError, selectedNodeId],
  );

  return {
    isOpen,
    selectedNodeId,
    selectedNodeName,
    neighbors: selectedNeighbors,
    isLoading: selectedLoading,
    error: selectedError,
    open,
    close,
    refresh,
    prefetch,
    getNeighbors,
  };
};

export default useNeighborsPanel;
