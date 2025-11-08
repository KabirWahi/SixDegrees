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
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
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
          <Box position="sticky" top={0} zIndex={1} bg="#0F1320" pt={2} pb={4}>
            <Stack spacing={1} mb={4}>
              <Text fontSize="xs" letterSpacing="0.3em" color="rgba(255,255,255,0.5)">
                CURRENT NODE
              </Text>
              <Text fontSize="lg" fontWeight="600" color="#E4E8FF" noOfLines={2}>
                {selectedNodeName ?? 'Unknown'}
              </Text>
            </Stack>

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

          <Box flex="1" overflowY="auto" pt={2} pb={4} pr={1}>
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
                {filteredNeighbors.map(([neighborId, neighborName]) => {
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
                      placement="left"
                      shouldWrapChildren
                    >
                      <Box
                        as={onNeighborSelect ? 'button' : 'div'}
                        type={onNeighborSelect ? 'button' : undefined}
                        borderRadius="lg"
                        px={4}
                        py={3}
                        color={isDisabled ? 'rgba(228, 232, 255, 0.6)' : '#E4E8FF'}
                        bg="rgba(255,255,255,0.02)"
                        transition="background 120ms ease"
                        _hover={{ bg: 'rgba(255,255,255,0.04)' }}
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
};

export default RightNeighborsPanel;
