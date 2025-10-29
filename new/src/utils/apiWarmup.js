const PING_URL = 'https://api.sixdegrees.kabirwahi.com/api/football?path=ping';
const MAX_ATTEMPTS = 3;
const TIMEOUT_RANGE_MS = { min: 1000, max: 2000 };
const RETRY_DELAY_RANGE_MS = { min: 200, max: 500 };

const getRandomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const sleep = (duration) =>
  new Promise((resolve) => {
    setTimeout(resolve, duration);
  });

const fetchWithTimeout = async (url, timeoutMs) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return await response.text();
  } finally {
    clearTimeout(timeoutId);
  }
};

const responseIsPong = (body) => {
  if (!body) return false;
  const trimmed = body.trim();
  if (trimmed.toLowerCase() === 'pong') {
    return true;
  }

  try {
    const parsed = JSON.parse(trimmed);
    return typeof parsed?.message === 'string' && parsed.message.toLowerCase() === 'pong';
  } catch (error) {
    return false;
  }
};

export const warmOnRender = async () => {
  try {
    const timeout = getRandomInRange(TIMEOUT_RANGE_MS.min, TIMEOUT_RANGE_MS.max);
    await fetchWithTimeout(PING_URL, timeout);
  } catch (error) {
    console.debug('API warm-up ping failed (ignored):', error);
  }
};

export const pingForPlay = async () => {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const timeout = getRandomInRange(TIMEOUT_RANGE_MS.min, TIMEOUT_RANGE_MS.max);
      const body = await fetchWithTimeout(PING_URL, timeout);

      if (responseIsPong(body)) {
        return true;
      }

      throw new Error('Unexpected ping response');
    } catch (error) {
      const isLastAttempt = attempt === MAX_ATTEMPTS;
      if (isLastAttempt) {
        return false;
      }

      const delay = getRandomInRange(RETRY_DELAY_RANGE_MS.min, RETRY_DELAY_RANGE_MS.max);
      await sleep(delay);
    }
  }

  return false;
};
