import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  CloseButton,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Text,
} from '@chakra-ui/react';
import normalizeText from '../utils/normalizeText.js';

const RightNeighborsPanel = ({ isOpen, neighbors, isLoading, error, onClose }) => {
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
            <Flex justify="flex-end" mb={3}>
              <CloseButton
                onClick={onClose}
                color="#9CA3AF"
                _hover={{ bg: 'rgba(255,255,255,0.08)' }}
                size="lg"
              />
            </Flex>

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
                {filteredNeighbors.map(([neighborId, neighborName]) => (
                  <Box
                    key={neighborId}
                    borderRadius="lg"
                    px={4}
                    py={3}
                    color="#E4E8FF"
                    bg="rgba(255,255,255,0.02)"
                    transition="background 120ms ease"
                    _hover={{ bg: 'rgba(255,255,255,0.04)' }}
                  >
                    {neighborName}
                  </Box>
                ))}
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
};

RightNeighborsPanel.defaultProps = {
  neighbors: [],
  isLoading: false,
  error: null,
};

export default RightNeighborsPanel;
