// Supplied filenames are deliberately preserved, including spaces and spelling.
const assetUrl = (filename: string) => `/preview-assets/web/${encodeURIComponent(filename)}`
export const heroPreviewBackground = assetUrl('HERO BG.jpg')
export const heroPreviewLogo = assetUrl('LOGO .PNG.png')
export const heroPreviewAssets = [
  { id: 'pop-g', family: 'POP-G', file: 'POP-G BBQ.png', width: 403, height: 1200 },
  { id: 'trigger', family: 'TRIGGER', file: 'TRIGGER SUSHI.png', width: 343, height: 1200 },
  { id: 'loots', family: 'LOOTS', file: 'LOOTS CORN HOT.png', width: 468, height: 1200 },
  { id: 'x-stix', family: 'X-STIX', file: 'X-STIX BBQ.png', width: 468, height: 1200 },
].map(asset => ({ ...asset, src: assetUrl(asset.file) }))
