import { Box, Text } from '@chakra-ui/react';
import PropTypes from 'prop-types';

const StatPanel = ({ title, description }) => (
  <Box
    bg="#10131F"
    borderRadius="xl"
    border="1px solid rgba(255,255,255,0.08)"
    px={5}
    py={4}
  >
    <Text fontSize="xl" fontWeight="700" color="#E4E8FF">
      {title}
    </Text>
    <Text fontSize="sm" color="#9CA3AF" mt={2}>
      {description}
    </Text>
  </Box>
);

StatPanel.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

export default StatPanel;
