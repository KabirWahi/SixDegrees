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

  return (
    <Modal isOpen={isOpen} onClose={() => {}} isCentered closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent bg="#0F1320" border="1px solid rgba(255,255,255,0.08)" borderRadius="2xl">
        <ModalHeader color="#E4E8FF">{effectiveTitle}</ModalHeader>
        <ModalBody>
          <Text color="#9CA3AF">{effectiveDescription}</Text>
        </ModalBody>
        <ModalFooter display="flex" gap={3}>
          <Button variant="outline" borderColor="rgba(255,255,255,0.2)" color="#E4E8FF" onClick={onBack}>
            {backLabel}
          </Button>
          <Button colorScheme="brand" onClick={onReplay}>
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
