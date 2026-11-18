// Florida Department of Revenue land-use codes (DOR_UC, Rule 12D-8.008 F.A.C.).
const CODES = {
  0: 'Vacant residential', 1: 'Single family', 2: 'Mobile home', 3: 'Multi-family (10+ units)',
  4: 'Condominium', 5: 'Cooperative', 6: 'Retirement home', 7: 'Misc. residential',
  8: 'Multi-family (<10 units)', 9: 'Residential common area',
  10: 'Vacant commercial', 11: 'Store, one story', 12: 'Mixed use store/office/residential',
  13: 'Department store', 14: 'Supermarket', 15: 'Regional shopping center', 16: 'Community shopping center',
  17: 'Office, one story', 18: 'Office, multi-story', 19: 'Professional services building',
  20: 'Airport / terminal', 21: 'Restaurant', 22: 'Drive-in restaurant', 23: 'Financial institution',
  24: 'Insurance office', 25: 'Repair service shop', 26: 'Service station', 27: 'Auto sales / repair',
  28: 'Parking lot / mobile home park', 29: 'Wholesale outlet', 30: 'Florist / greenhouse',
  31: 'Drive-in theater', 32: 'Theater / auditorium', 33: 'Nightclub / bar', 34: 'Bowling / arena',
  35: 'Tourist attraction', 36: 'Camp', 37: 'Race track', 38: 'Golf course', 39: 'Hotel / motel',
  40: 'Vacant industrial', 41: 'Light manufacturing', 42: 'Heavy industrial', 43: 'Lumber yard',
  44: 'Packing plant', 45: 'Cannery / brewery', 46: 'Food processing', 47: 'Mineral processing',
  48: 'Warehouse / distribution', 49: 'Open storage',
  50: 'Improved agricultural', 51: 'Cropland I', 52: 'Cropland II', 53: 'Cropland III',
  54: 'Timberland', 55: 'Timberland', 56: 'Timberland', 57: 'Timberland', 58: 'Timberland', 59: 'Timberland',
  60: 'Grazing land', 61: 'Grazing land', 62: 'Grazing land', 63: 'Grazing land', 64: 'Grazing land', 65: 'Grazing land',
  66: 'Orchard / grove', 67: 'Poultry / bees / fish', 68: 'Dairy / feed lot', 69: 'Ornamentals',
  70: 'Vacant institutional', 71: 'Church', 72: 'Private school', 73: 'Private hospital',
  74: 'Home for the aged', 75: 'Non-profit / orphanage', 76: 'Mortuary / cemetery', 77: 'Club / lodge',
  78: 'Sanitarium', 79: 'Cultural organization',
  81: 'Military', 82: 'Forest / park', 83: 'Public school', 84: 'College', 85: 'Hospital',
  86: 'County', 87: 'State', 88: 'Federal', 89: 'Municipal',
  90: 'Leasehold interest', 91: 'Utility', 92: 'Mining', 93: 'Subsurface rights', 94: 'Right-of-way',
  95: 'Submerged land', 96: 'Waste land', 97: 'Outdoor recreational', 98: 'Centrally assessed', 99: 'Acreage, non-ag',
};

export function useDescription(code) {
  if (code == null || code === '') return 'Unknown';
  const n = Number(code);
  return CODES[n] ?? `Use code ${code}`;
}

export function useCategory(code) {
  const n = Number(code);
  if (Number.isNaN(n)) return 'Other';
  if (n === 0 || n === 10 || n === 40 || n === 70) return 'Vacant land';
  if (n <= 9) return 'Residential';
  if (n <= 39) return 'Commercial';
  if (n <= 49) return 'Industrial';
  if (n <= 69) return 'Agricultural';
  if (n <= 79) return 'Institutional';
  if (n <= 89) return 'Government';
  return 'Other';
}
