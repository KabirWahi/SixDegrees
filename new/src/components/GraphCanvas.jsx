import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import { Box, Icon, IconButton } from '@chakra-ui/react';

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

const GraphCanvas = ({
  nodes,
  links,
  onNodeClick,
  sourceId,
  targetId,
  isInteractionDisabled,
  useUniformColors,
  activeNodeId,
}) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const graphLayerRef = useRef(null);
  const zoomBehaviorRef = useRef(null);
  const defaultViewportRef = useRef(d3.zoomIdentity);
  const latestPositionsRef = useRef({});
  const pendingResetRef = useRef(false);
  const resetTimeoutRef = useRef(null);

  const [canvasSize, setCanvasSize] = useState({ width: 720, height: 540 });
  const [zoomReady, setZoomReady] = useState(false);
  const [showRecenter, setShowRecenter] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [nodePositions, setNodePositions] = useState({});
  const [hoveredNodeId, setHoveredNodeId] = useState(null);

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
      if (observer) observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

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
    if (!zoomReady || nodes.length === 0) return;
    resetViewport({ duration: 0, hideButton: true });
  }, [nodes.length, resetViewport, zoomReady]);

  const normalizedLinks = useMemo(() => {
    const linkMap = new Map();

    if (Array.isArray(links) && links.length > 0) {
      links.forEach((link) => {
        const sourceId =
          typeof link.source === 'object' && link.source !== null ? link.source.id : link.source;
        const targetId =
          typeof link.target === 'object' && link.target !== null ? link.target.id : link.target;
        if (!sourceId || !targetId) return;
        const key = `${sourceId}-${targetId}`;
        if (!linkMap.has(key)) {
          linkMap.set(key, { sourceId, targetId });
        }
      });
    }

    nodes.forEach((node) => {
      if (!node.parentId) return;
      const key = `${node.parentId}-${node.id}`;
      if (!linkMap.has(key)) {
        linkMap.set(key, { sourceId: node.parentId, targetId: node.id });
      }
    });

    return Array.from(linkMap.values());
  }, [links, nodes]);

  useEffect(() => {
    if (nodes.length === 0) {
      latestPositionsRef.current = {};
      setNodePositions({});
      return;
    }

    const nodesCopy = nodes.map((node) => {
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

    const linksCopy = normalizedLinks.map((link) => ({
      source: link.sourceId,
      target: link.targetId,
    }));

    let simulation = null;
    if (nodesCopy.length > 1) {
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
  }, [nodes, normalizedLinks, canvasSize.width, canvasSize.height, zoomReady, computeCenterTransform, applyViewportTransform]);

  const handleRecenter = useCallback(() => {
    resetViewport({ duration: 400, hideButton: true });
  }, [resetViewport]);

  const circleStyles = useMemo(
    () => ({
      source: {
        fill: 'rgba(56, 232, 198, 0.18)',
        stroke: 'rgba(56, 232, 198, 0.5)',
        shadow: '0px 10px 25px rgba(56, 232, 198, 0.35)',
      },
      target: {
        fill: 'rgba(255, 90, 126, 0.22)',
        stroke: 'rgba(255, 90, 126, 0.6)',
        shadow: '0px 10px 25px rgba(255, 90, 126, 0.35)',
      },
      default: {
        fill: 'rgba(109, 116, 209, 0.22)',
        stroke: 'rgba(109, 116, 209, 0.6)',
        shadow: '0px 10px 25px rgba(109, 116, 209, 0.35)',
      },
    }),
    [],
  );

  return (
    <Box position="absolute" inset="0" ref={containerRef}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        role="presentation"
        aria-label="Player graph"
        style={{ display: 'block', cursor: isInteractionDisabled ? 'default' : isPanning ? 'grabbing' : 'grab' }}
      >
        <g ref={graphLayerRef}>
          {normalizedLinks.map((link) => {
            const sourcePosition = nodePositions[link.sourceId];
            const targetPosition = nodePositions[link.targetId];
            if (!sourcePosition || !targetPosition) {
              return null;
            }
            return (
              <line
                key={`${link.sourceId}-${link.targetId}`}
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
          {nodes.map((node) => {
            const position =
              nodePositions[node.id] ?? {
                x: canvasSize.width / 2,
                y: canvasSize.height / 2,
              };

            let palette = circleStyles.default;
            if (!useUniformColors) {
              if (node.id === sourceId) {
                palette = circleStyles.source;
              } else if (node.id === targetId) {
                palette = circleStyles.target;
              }
            }

            const isHovered = hoveredNodeId === node.id;
            const isActive = activeNodeId === node.id;
            const circleScale = isActive ? 1.08 : isHovered ? 1.04 : 1;
            const strokeColor =
              isHovered || isActive
                ? 'rgba(255,255,255,0.85)'
                : palette.stroke;
            const shadowColor = isHovered || isActive ? '0px 14px 32px rgba(255,255,255,0.25)' : palette.shadow;

            return (
              <g
                key={node.id}
                transform={`translate(${position.x}, ${position.y}) scale(${circleScale})`}
                style={{ cursor: isInteractionDisabled ? 'default' : 'pointer' }}
                onClick={
                  isInteractionDisabled
                    ? undefined
                    : () => {
                        onNodeClick?.(node.id);
                      }
                }
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId((current) => (current === node.id ? null : current))}
              >
                <circle
                  r={72}
                  fill={palette.fill}
                  stroke={strokeColor}
                  strokeWidth={2.5}
                  style={{ filter: `drop-shadow(${shadowColor})`, transition: 'filter 0.2s ease, stroke 0.2s ease' }}
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

      {!isInteractionDisabled && showRecenter && (
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
  );
};

GraphCanvas.propTypes = {
  nodes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      parentId: PropTypes.string,
    }),
  ).isRequired,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      source: PropTypes.string.isRequired,
      target: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onNodeClick: PropTypes.func,
  sourceId: PropTypes.string,
  targetId: PropTypes.string,
  isInteractionDisabled: PropTypes.bool,
  useUniformColors: PropTypes.bool,
  activeNodeId: PropTypes.string,
};

GraphCanvas.defaultProps = {
  onNodeClick: undefined,
  sourceId: undefined,
  targetId: undefined,
  isInteractionDisabled: false,
  useUniformColors: false,
  activeNodeId: undefined,
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

export default GraphCanvas;
