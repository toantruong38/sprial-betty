// Editing
const startEditingPhoto = () => ({
  type: 'START_EDITING_PHOTO'
})
const endEditingPhoto = () => ({
  type: 'END_EDITING_PHOTO'
})

// Preview
const updatePreviewLength = (length) => ({
  type: 'UPDATE_PREVIEW_LENGTH',
  length
})

// Img
const updateContrast = (contrast) => ({
  type: 'UPDATE_IMG_CONTRAST',
  contrast
})
const updateLightness = (lightness) => ({
  type: 'UPDATE_IMG_LIGHTNESS',
  lightness
})
const clearImg = () => ({
  type: 'CLEAR_IMG'
})
const addImgData = (blobUrl, contrast, lightness, scale, width, height, data, orientation, name) => ({
  type: 'ADD_IMG_DATA',
  blobUrl,
  contrast,
  scale,
  width,
  height,
  data,
  orientation,
  name,
  lightness
})
const updateImgPos = (scale, cx, cy) => ({
  type: 'UPDATE_IMG_POSITION',
  scale,
  cx,
  cy
})

// Filter
const addFilter = (name, data, colorIndex) => ({
  type: 'ADD_FILTER',
  name,
  data,
  colorIndex
})
const updateFilter = (name, colorIndex, data) => ({
  type: 'UPDATE_FILTER',
  name,
  colorIndex,
  data
})

// Setup
const setup = () => ({
  type: 'STORE_INIT',
})

// Temp
const addTempProp = (prop, value) => ({
  type: 'TEMP',
  prop,
  value
})

export {
  startEditingPhoto,
  endEditingPhoto,
  updatePreviewLength,
  updateContrast,
  updateLightness,
  addImgData,
  updateImgPos,
  addFilter,
  updateFilter,
  setup,
  addTempProp,
  clearImg
}