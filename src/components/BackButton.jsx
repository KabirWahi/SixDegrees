import PropTypes from 'prop-types';
import { Button } from '@chakra-ui/react';

const BackButton = ({ children, onClick, ...props }) => (
  <Button
    variant="outline"
    borderColor="rgba(255,255,255,0.15)"
    color="#E4E8FF"
    borderRadius="full"
    size="sm"
    px={6}
    fontWeight="600"
    bg="rgba(255,255,255,0.04)"
    _hover={{ bg: 'rgba(255,255,255,0.08)' }}
    _active={{ bg: 'rgba(255,255,255,0.12)' }}
    onClick={onClick}
    {...props}
  >
    {children ?? '← Back'}
  </Button>
);

BackButton.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func.isRequired,
};

BackButton.defaultProps = {
  children: undefined,
};

export default BackButton;
