import PropTypes from 'prop-types';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';

const STATUS_COPY = {
  win: {
    title: 'You Win!',
    description: 'You connected the players before running out of moves.',
    replayLabel: 'New Challenge',
  },
  lose: {
    title: 'Out of Steps',
    description: 'You reached the maximum of six steps without finding the target.',
    replayLabel: 'Try Again',
  },
};

const GameResultModal = ({
  isOpen,
  status,
  title,
  description,
  onBack,
  onReplay,
  backLabel,
  replayLabel,
}) => {
  const fallback = STATUS_COPY[status] ?? STATUS_COPY.lose;
  const effectiveTitle = title || fallback.title;
  const effectiveDescription = description || fallback.description;
  const effectiveReplayLabel = replayLabel || fallback.replayLabel;
  const accentGlow =
    status === 'win'
      ? 'inset 0 0 10px rgba(56,232,198,0.08)'
      : status === 'lose'
        ? 'inset 0 0 10px rgba(255,90,126,0.08)'
        : 'none';

  return (
    <Modal isOpen={isOpen} onClose={() => {}} isCentered closeOnOverlayClick={false}>
      <ModalOverlay bg="rgba(6,10,16,0.6)" backdropFilter="blur(4px)" />
      <ModalContent
        bg="rgba(18,24,36,0.92)"
        border="1px solid rgba(255,255,255,0.05)"
        borderRadius="20px"
        boxShadow={`0 12px 32px rgba(0,0,0,0.4), ${accentGlow}`}
      >
        <ModalHeader color="#E4E8FF" fontWeight="700" pb={2} pt={6} textAlign="center">
          {effectiveTitle}
        </ModalHeader>
        <ModalBody textAlign="center" pb={4}>
          <Text color="rgba(232,236,255,0.75)" maxW="28ch" mx="auto">
            {effectiveDescription}
          </Text>
        </ModalBody>
        <ModalFooter display="flex" gap={4} justifyContent="center" pb={6}>
          <Button
            variant="outline"
            borderColor="rgba(255,255,255,0.2)"
            color="#E4E8FF"
            onClick={onBack}
            _hover={{ boxShadow: '0 0 8px rgba(100,140,255,0.3)' }}
            _focusVisible={{ boxShadow: '0 0 0 2px rgba(100,140,255,0.35)' }}
          >
            {backLabel}
          </Button>
          <Button
            colorScheme="brand"
            onClick={onReplay}
            _hover={{ boxShadow: '0 0 8px rgba(100,140,255,0.3)' }}
            _focusVisible={{ boxShadow: '0 0 0 2px rgba(100,140,255,0.35)' }}
          >
            {effectiveReplayLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

GameResultModal.propTypes = {
  isOpen: PropTypes.bool,
  status: PropTypes.oneOf(['win', 'lose', undefined]),
  title: PropTypes.string,
  description: PropTypes.string,
  onBack: PropTypes.func.isRequired,
  onReplay: PropTypes.func.isRequired,
  backLabel: PropTypes.string,
  replayLabel: PropTypes.string,
};

GameResultModal.defaultProps = {
  isOpen: false,
  status: undefined,
  title: undefined,
  description: undefined,
  backLabel: 'Back to Modes',
  replayLabel: undefined,
};

export default GameResultModal;
