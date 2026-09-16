// Temporary homepage art direction; product records and routes remain unchanged.
export const familyWorlds: Record<string, { accent: string; secondary: string; theme: string }> = {
  'pop-g': { accent: '#63ddff', secondary: '#b8f1ff', theme: 'ice' },
  trigger: { accent: '#ff945b', secondary: '#ff475a', theme: 'energy' },
  loots: { accent: '#ce99ff', secondary: '#ff197b', theme: 'reward' },
  'x-stix': { accent: '#cee96e', secondary: '#89bd40', theme: 'tactical' },
}

// Replace null with approved public artwork URLs when available.
export const homepageMedia: { about: string | null; arena: string | null; tournament: string | null } = {
  about: null, arena: null, tournament: null,
}
