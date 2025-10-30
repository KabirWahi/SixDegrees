const removeDiacritics = (value) => {
  if (typeof value !== 'string') return '';
  const normalized = value.normalize('NFD');

  try {
    return normalized.replace(/\p{Diacritic}/gu, '');
  } catch (error) {
    // Fallback for environments lacking Unicode property escapes support.
    return normalized.replace(/[\u0300-\u036f]/g, '');
  }
};

const normalizeText = (value) => removeDiacritics(value ?? '').toLowerCase().trim();

export default normalizeText;
