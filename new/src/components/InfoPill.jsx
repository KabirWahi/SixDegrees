import PropTypes from 'prop-types';
import { Box, Text } from '@chakra-ui/react';

const InfoPill = ({ label, value, minW, children }) => (
  <Box
    px={{ base: 4, md: 5 }}
    py={{ base: 2.5, md: 3 }}
    borderRadius="full"
    bg="rgba(255,255,255,0.03)"
    border="1px solid rgba(255,255,255,0.08)"
    textAlign="center"
    minW={minW ?? { base: '140px', md: '160px' }}
  >
    {label ? (
      <Text fontSize="xs" letterSpacing="0.2em" color="rgba(255,255,255,0.7)">
        {label}
      </Text>
    ) : null}
    <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="600" color="#E4E8FF">
      {value}
    </Text>
    {children}
  </Box>
);

InfoPill.propTypes = {
  label: PropTypes.string,
  value: PropTypes.node.isRequired,
  minW: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  children: PropTypes.node,
};

InfoPill.defaultProps = {
  label: undefined,
  minW: undefined,
  children: null,
};

export default InfoPill;
