// These card variants are independent of the hero's product selection.
export const productWorldAssets = [
  { id: 'pop-g', family: 'POP-G', file: 'POP-G WHITE CHEESE.png', width: 351, height: 1200 },
  { id: 'trigger', family: 'TRIGGER', file: 'TRIGGER TACO.png', width: 312, height: 1200 },
  { id: 'loots', family: 'LOOTS', file: 'LOOTS CORN HOT.png', width: 468, height: 1200 },
  { id: 'x-stix', family: 'X-STIX', file: 'X-STIX SOUR CREAM&ONION.png', width: 481, height: 1200 },
].map(asset => ({ ...asset, src: `/preview-assets/web/${encodeURI(asset.file)}` }))
