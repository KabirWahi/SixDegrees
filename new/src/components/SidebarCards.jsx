import PropTypes from 'prop-types';
import { Box, Flex, Text } from '@chakra-ui/react';

const labelStyles = {
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.3em',
  color: 'rgba(255,255,255,0.5)',
  textAlign: 'center',
};

export const SidebarTargetCard = ({ label, value, ...boxProps }) => (
  <Box
    px={{ base: 4, md: 5 }}
    py={{ base: 3, md: 3 }}
    borderRadius="12px"
    bg="linear-gradient(145deg, #4a1c25, #782f3d)"
    border="1px solid rgba(255, 255, 255, 0.05)"
    textAlign="center"
    boxShadow="0 4px 10px rgba(0,0,0,0.3)"
    {...boxProps}
  >
    <Text mb={1} {...labelStyles}>
      {label ?? 'Target Player'}
    </Text>
    <Text fontSize={{ base: 'lg', md: 'xl' }} color="#FCE7EC" fontWeight="700">
      {value}
    </Text>
  </Box>
);

SidebarTargetCard.propTypes = {
  label: PropTypes.string,
  value: PropTypes.node.isRequired,
};

SidebarTargetCard.defaultProps = {
  label: 'Target Player',
};

export const SidebarCounterCard = ({ label, value, ...flexProps }) => (
  <Flex
    direction="column"
    align="center"
    justify="center"
    borderRadius="12px"
    bg="linear-gradient(145deg, #12161f, #0c0f16)"
    border="1px solid rgba(255,255,255,0.05)"
    px={{ base: 4, md: 5 }}
    py={{ base: 3, md: 4 }}
    boxShadow="0 4px 10px rgba(0,0,0,0.3)"
    {...flexProps}
  >
    <Text mb={1} {...labelStyles}>
      {label}
    </Text>
    <Text fontSize="1.25rem" fontWeight="700" color="#FFFFFF">
      {value}
    </Text>
  </Flex>
);

SidebarCounterCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
};
