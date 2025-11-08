import { Box, Button, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import PropTypes from 'prop-types';

const GameHeader = ({
  title,
  subtitle = undefined,
  onBack = undefined,
  rightContent = null,
  backButtonProps = {},
  containerProps = {},
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
          <Button
            onClick={onBack}
            colorScheme="brand"
            borderRadius="full"
            px={{ base: 6, md: 7 }}
            mt={{ base: 1, md: 2 }}
            {...backButtonProps}
          >
            ← Back
          </Button>
        )}
      </Box>

      <Stack spacing={1} textAlign="center" flex="1" align="center">
        <Heading size={{ base: 'md', md: 'lg' }} color="#E4E8FF">
          {title}
        </Heading>
        {subtitle ? (
          <Text fontSize={{ base: 'sm', md: 'md' }} color="#9CA3AF">
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
};

export default GameHeader;
