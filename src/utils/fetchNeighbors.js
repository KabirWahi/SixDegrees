const buildNeighborsUrl = (nodeId) =>
  `https://api.sixdegrees.kabirwahi.com/api/football?path=neighbors&key=${encodeURIComponent(nodeId)}`;

const normalizeNeighbors = (neighbors) => {
  if (!Array.isArray(neighbors)) return [];
  return neighbors
    .filter(
      (entry) =>
        Array.isArray(entry) &&
        entry.length >= 2 &&
        typeof entry[0] === 'string' &&
        typeof entry[1] === 'string',
    )
    .map(([id, name]) => [id, name]);
};

const fetchNeighbors = async (nodeId, { signal } = {}) => {
  if (!nodeId) return [];

  const response = await fetch(buildNeighborsUrl(nodeId), { signal });
  if (!response.ok) {
    throw new Error(`Neighbors request failed with status ${response.status}`);
  }

  const payload = await response.json();
  return normalizeNeighbors(payload?.neighbors);
};

export default fetchNeighbors;
