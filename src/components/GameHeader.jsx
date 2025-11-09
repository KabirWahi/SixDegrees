import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import BackButton from './BackButton.jsx';

const buildAccentGradient = (color) =>
  color
    ? `linear-gradient(90deg, ${color}33 0%, ${color}99 50%, ${color}33 100%)`
    : null;

const GameHeader = ({
  title,
  subtitle = undefined,
  onBack = undefined,
  rightContent = null,
  backButtonProps = {},
  containerProps = {},
  accentColor = undefined,
}) => (
  <Box position="relative" {...containerProps}>
    <Flex
      align="center"
      justify="space-between"
      gap={{ base: 3, md: 6 }}
      px={{ base: 0, md: 0 }}
    >
      <Box
        minW={{ base: '96px', md: '112px' }}
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
      >
        {onBack && (
          <BackButton onClick={onBack} mt={{ base: 1, md: 2 }} {...backButtonProps} />
        )}
      </Box>

      <Stack spacing={3} textAlign="center" flex="1" align="center">
        <Heading
          as="h1"
          fontSize={{ base: 'xl', md: '2xl' }}
          fontWeight={700}
          letterSpacing="0.02em"
          color="#E8ECFF"
        >
          {title}
        </Heading>
        {subtitle ? (
          <Text
            fontSize={{ base: 'sm', md: 'sm' }}
            color="rgba(232, 236, 255, 0.75)"
            maxW="640px"
          >
            {subtitle}
          </Text>
        ) : null}
      </Stack>

      <Box
        minW={{ base: '96px', md: '112px' }}
        display="flex"
        alignItems="center"
        justifyContent="flex-end"
        textAlign="right"
      >
        {rightContent ?? null}
      </Box>
    </Flex>
  </Box>
);

GameHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  onBack: PropTypes.func,
  rightContent: PropTypes.node,
  backButtonProps: PropTypes.object,
  containerProps: PropTypes.object,
  accentColor: PropTypes.string,
};

export default GameHeader;
