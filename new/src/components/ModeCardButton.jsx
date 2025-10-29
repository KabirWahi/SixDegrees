import { Box, Text } from '@chakra-ui/react';
import PropTypes from 'prop-types';

const ModeCardButton = ({ accent, label, description, onClick = undefined, ...props }) => (
  <Box
    as="button"
    type="button"
    bg="#10131F"
    borderRadius="2xl"
    border="1px solid rgba(255,255,255,0.05)"
    px={{ base: 6, md: 8 }}
    py={{ base: 8, md: 10 }}
    display="flex"
    flexDirection="column"
    alignItems="flex-start"
    gap={4}
    position="relative"
    overflow="hidden"
    cursor="pointer"
    transition="all 0.25s ease"
    textAlign="left"
    _hover={{
      transform: 'translateY(-3px)',
      borderColor: `${accent}66`,
      boxShadow: `0 16px 30px -18px ${accent}80`,
      _after: { opacity: 0.12 },
    }}
    _focusVisible={{
      outline: '2px solid',
      outlineColor: `${accent}99`,
      outlineOffset: '4px',
    }}
    _after={{
      content: '""',
      position: 'absolute',
      inset: 0,
      bg: accent,
      opacity: 0,
      transition: 'opacity 0.25s ease',
      pointerEvents: 'none',
    }}
    onClick={onClick}
    {...props}
  >
    <Text
      fontSize={{ base: 'lg', md: 'xl' }}
      fontWeight="700"
      color="#E4E8FF"
      position="relative"
      zIndex={1}
    >
      {label}
    </Text>
    <Text
      fontSize={{ base: 'md', md: 'lg' }}
      fontWeight="400"
      color="#9CA3AF"
      position="relative"
      zIndex={1}
    >
      {description}
    </Text>
    <Box
      mt="auto"
      w="40%"
      minW="100px"
      h="3px"
      bg={`${accent}cc`}
      borderRadius="full"
      position="relative"
      zIndex={1}
    />
  </Box>
);

ModeCardButton.propTypes = {
  accent: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

export default ModeCardButton;
