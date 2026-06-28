export const CATEGORIES = [
  'AV', 'BMS', 'CIVIL', 'CARPENTER', 'ELECTRICAL',
  'FIRE FIGHTING', 'FURNITURE', 'GENERAL', 'GENERATOR',
  'HOUSEKEEPING', 'HVAC', 'IT', 'KITCHEN EQPT',
  'MECH', 'PLUMBING', 'MISC', 'SECURITY SYSTEMS'
] as const;

export const STATUS_OPTIONS = ['open', 'in-progress', 'closed'] as const;
export const PRIORITY_OPTIONS = ['low', 'medium', 'high'] as const;

export const STATUS_COLORS = {
  open:        'bg-blue-100 text-blue-700',
  'in-progress': 'bg-yellow-100 text-yellow-700',
  closed:      'bg-green-100 text-green-700'
};

export const PRIORITY_COLORS = {
  low:    'bg-gray-100 text-gray-600',
  medium: 'bg-orange-100 text-orange-700',
  high:   'bg-red-100 text-red-700'
};

export const CATEGORY_COLORS = [
  '#3B82F6','#F97316','#10B981','#8B5CF6','#EF4444',
  '#06B6D4','#F59E0B','#84CC16','#EC4899','#6366F1',
  '#14B8A6','#F43F5E','#A855F7','#0EA5E9','#22D3EE','#FB923C','#4ADE80'
];