import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  CloseButton,
  Flex,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import normalizeText from '../utils/normalizeText.js';

const RightNeighborsPanel = ({
  isOpen,
  neighbors = [],
  isLoading = false,
  error = null,
  onClose,
  onNeighborSelect = undefined,
  selectedNodeName = 'Unknown',
  disabledNeighborIds = new Set(),
  isSelectionDisabled = false,
  accentColor = '#38E8C6',
}) => {
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const listItemRefs = useRef([]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setHighlightedIndex(-1);
      return;
    }

    const frame = requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    });

    return () => cancelAnimationFrame(frame);
  }
  , [isOpen]);

  const sortedNeighbors = useMemo(() => {
    if (!Array.isArray(neighbors)) return [];
    return [...neighbors].sort(([, nameA], [, nameB]) => {
      const normalizedA = normalizeText(nameA);
      const normalizedB = normalizeText(nameB);
      if (normalizedA === normalizedB) {
        return nameA.localeCompare(nameB);
      }
      return normalizedA.localeCompare(normalizedB);
    });
  }, [neighbors]);

  const filteredNeighbors = useMemo(() => {
    if (sortedNeighbors.length === 0) return [];
    if (!query.trim()) return sortedNeighbors;

    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery) return sortedNeighbors;

    return sortedNeighbors.filter(([, name]) => normalizeText(name).includes(normalizedQuery));
  }, [sortedNeighbors, query]);

  const showEmptyState = !isLoading && !error && filteredNeighbors.length === 0;
  listItemRefs.current = [];

  useEffect(() => {
    if (highlightedIndex >= filteredNeighbors.length) {
      setHighlightedIndex(-1);
    }
  }, [filteredNeighbors.length, highlightedIndex]);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKey = (event) => {
      if (!['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(event.key)) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (showEmptyState || isLoading || error) return;
      if (event.key === 'ArrowDown') {
        if (!filteredNeighbors.length) return;
        event.preventDefault();
        setHighlightedIndex((prev) => {
          if (prev === -1 || prev >= filteredNeighbors.length - 1) {
            return 0;
          }
          return prev + 1;
        });
      } else if (event.key === 'ArrowUp') {
        if (!filteredNeighbors.length) return;
        event.preventDefault();
        setHighlightedIndex((prev) => {
          if (prev <= 0) {
            return filteredNeighbors.length - 1;
          }
          return prev - 1;
        });
      } else if (event.key === 'Enter') {
        if (highlightedIndex < 0 || highlightedIndex >= filteredNeighbors.length) return;
        event.preventDefault();
        const [neighborId, neighborName] = filteredNeighbors[highlightedIndex];
        const isDisabled =
          isSelectionDisabled ||
          (Boolean(disabledNeighborIds?.has) && disabledNeighborIds.has(neighborId));
        if (isDisabled || !onNeighborSelect) return;
        onNeighborSelect(neighborId, neighborName);
        setQuery('');
        setHighlightedIndex(-1);
        requestAnimationFrame(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
          }
        });
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [
    disabledNeighborIds,
    error,
    filteredNeighbors,
    highlightedIndex,
    isLoading,
    isOpen,
    isSelectionDisabled,
    onClose,
    onNeighborSelect,
    showEmptyState,
  ]);

  useEffect(() => {
    if (highlightedIndex < 0) return;
    const target = listItemRefs.current[highlightedIndex];
    if (target) {
      target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [highlightedIndex]);

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      blockScrollOnMount={false}
      trapFocus={false}
      autoFocus={false}
      returnFocusOnClose={false}
    >
      <DrawerOverlay bg="transparent" pointerEvents="none" />
      <DrawerContent
        pointerEvents="auto"
        bg="#0F1320"
        borderLeft="1px solid rgba(255,255,255,0.05)"
        boxShadow="-4px 0 16px rgba(0,0,0,0.30)"
        maxW="400px"
        w={{ base: '100vw', md: '380px' }}
        maxH="100dvh"
        borderRadius="0"
      >
        <DrawerBody px={6} py={6} display="flex" flexDirection="column" gap={4}>
          <Box
            position="sticky"
            top={0}
            zIndex={1}
            bg="#0F1320"
            borderBottom="1px solid rgba(255,255,255,0.05)"
            pb={4}
          >
            <Box pt={2} pb={3}>
              <Text fontSize="xs" letterSpacing="0.3em" color="rgba(255,255,255,0.5)" mb={1}>
                CURRENT NODE
              </Text>
              <Text fontSize="lg" fontWeight="600" color="#E4E8FF" noOfLines={2}>
                {selectedNodeName ?? 'Unknown'}
              </Text>
              <Box
                mt={3}
                w="48px"
                h="2px"
                borderRadius="full"
                bg={`${accentColor}88`}
                opacity={0.85}
              />
            </Box>

            <Box mt={3}>
              <InputGroup>
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search neighbors"
                  aria-label="Search neighbors"
                  bg="rgba(255,255,255,0.02)"
                  borderColor="rgba(255,255,255,0.08)"
                  color="#E4E8FF"
                  _placeholder={{ color: 'rgba(255,255,255,0.35)' }}
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
                        if (inputRef.current) inputRef.current.focus();
                      }}
                      _hover={{ bg: 'rgba(255,255,255,0.12)' }}
                    />
                  </InputRightElement>
                ) : null}
              </InputGroup>
            </Box>
          </Box>

          <Box
            flex="1"
            overflowY="auto"
            pt={2}
            pb={4}
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
            {error ? (
              <Flex align="center" justify="center" h="100%">
                <Text color="#FCA5A5" textAlign="center">
                  Unable to load neighbors. Please try again later.
                </Text>
              </Flex>
            ) : isLoading ? (
              <Flex align="center" justify="center" h="100%">
                <Text color="#9CA3AF">Loading neighbors…</Text>
              </Flex>
            ) : showEmptyState ? (
              <Flex align="center" justify="center" h="100%">
                <Text color="#9CA3AF" textAlign="center">
                  No matching neighbors found.
                </Text>
              </Flex>
            ) : (
              <Stack spacing={2}>
                {filteredNeighbors.map(([neighborId, neighborName], index) => {
                  const isHighlighted = index === highlightedIndex;
                  const isDisabled =
                    isSelectionDisabled ||
                    (Boolean(disabledNeighborIds?.has) && disabledNeighborIds.has(neighborId));

                  const handleClick = () => {
                    if (!onNeighborSelect || isDisabled) return;
                    onNeighborSelect(neighborId, neighborName);
                    setQuery('');
                    requestAnimationFrame(() => {
                      if (inputRef.current) {
                        inputRef.current.focus();
                        inputRef.current.select();
                      }
                    });
                  };

                  return (
                    <Tooltip
                      key={neighborId}
                      label="Already on the board"
                      isDisabled={!isDisabled}
                      isOpen={isDisabled && index === highlightedIndex}
                      placement="left"
                      shouldWrapChildren
                    >
                      <Box
                        ref={(element) => {
                          listItemRefs.current[index] = element;
                        }}
                        as={onNeighborSelect ? 'button' : 'div'}
                        type={onNeighborSelect ? 'button' : undefined}
                        borderRadius="lg"
                        px={4}
                        py={3}
                        color={isDisabled ? 'rgba(228, 232, 255, 0.6)' : '#E4E8FF'}
                        bg={isHighlighted ? `${accentColor}1f` : 'rgba(255,255,255,0.02)'}
                        transition="background 120ms ease"
                        _hover={{ bg: isHighlighted ? `${accentColor}33` : 'rgba(255,255,255,0.04)' }}
                        textAlign="left"
                        w="100%"
                        onClick={onNeighborSelect && !isSelectionDisabled ? handleClick : undefined}
                        cursor={isDisabled ? 'not-allowed' : 'pointer'}
                        aria-disabled={isDisabled}
                        _focusVisible={
                          onNeighborSelect && !isDisabled
                            ? {
                                outline: '2px solid rgba(56, 232, 198, 0.65)',
                                outlineOffset: '2px',
                              }
                            : undefined
                        }
                      >
                        {neighborName}
                      </Box>
                    </Tooltip>
                  );
                })}
              </Stack>
            )}
          </Box>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

RightNeighborsPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  neighbors: PropTypes.arrayOf(PropTypes.array),
  isLoading: PropTypes.bool,
  error: PropTypes.any,
  onClose: PropTypes.func.isRequired,
  onNeighborSelect: PropTypes.func,
  selectedNodeName: PropTypes.string,
  disabledNeighborIds: PropTypes.instanceOf(Set),
  isSelectionDisabled: PropTypes.bool,
  accentColor: PropTypes.string,
};

RightNeighborsPanel.defaultProps = {
  neighbors: [],
  isLoading: false,
  error: null,
  onNeighborSelect: undefined,
  selectedNodeName: 'Unknown',
  disabledNeighborIds: new Set(),
  isSelectionDisabled: false,
  accentColor: '#38E8C6',
};

export default RightNeighborsPanel;
