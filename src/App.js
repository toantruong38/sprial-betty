import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import './App.css'

import Upload from './Upload'
import Workspace from './Workspace'
import Guides from './Guides'
import EditPhoto from './EditPhoto'
import Sidebar from './Sidebar'
import DemoImage from './DemoImage'
import Filter from './Filter'
import FilterMask from './FilterMask'
import DownloadCanvas from './DownloadCanvas'
import Size from './Size'
import SectionSlider from './SectionSlider'
import Swatches from './Swatches'

import {
  addFilter,
  setup,
  updateImgPos,
  clearImg,
  addTempProp,
  updateFilter,
  startEditingPhoto,
  updateContrast,
  endEditingPhoto,
  addImgData,
  updateLightness
} from './redux/actions'
import { scaleInputId } from './lib/constants'
import { getImageData } from './lib/img'
import styled from 'styled-components'
import { SecondaryButton } from './Button';

const Main = styled.div`
  position: absolute;
  height: 100%;
  overflow: auto;
  left: 235px;
  width: calc(100% - 550px);
`

const Hidden = styled.div`
  pointer-events: none;
  position: absolute;
  left: -100%;
  top: -100%;
  z-index: -1000;
`

const rings = {
  default: 40,
  min: 6,
  max: 160,
  step: 1
}

const contrastVals = {
  default: 0,
  min: -100,
  max: 100,
  step: 1
}

const lightnessVals = {
  default: 0,
  min: -50,
  max: 50,
  step: 1
}

class App extends Component {
  constructor() {
    super()
    this.handleRingChange = val => {
      this.props.updateRings(val)
    }
    this.handleScaleChange = scale => {
      const {
        img: { scale: prevScale, cx: prevCx, cy: prevCy, width, height },
        updateImgPos
      } = this.props
      if (prevScale <= scale) {
        // Increasing in scale, we're good to go and update
        updateImgPos(scale)
      } else {
        // Decreasing in scale, need to double check that cx & cy are still ok or fix

        // We need to make sure that we are still in bounds...
        const isLandscape = width > height

        // Starting pt... will change if not valid anymore
        let cx = prevCx
        let cy = prevCy

        // Fitting a square in our photo... what is the size of our photo area compared to our photo
        const dzRad = isLandscape ? height / scale / 2 : width / scale / 2

        // Find mix/max cx/cy for this new value
        // Put this square in our photo upper left
        const minCx = dzRad
        const minCy = dzRad
        // Put this square in our photo lower right
        const maxCx = width - minCx
        const maxCy = height - minCy

        // Is our current cx/cy fine?
        if (prevCx < minCx) {
          cx = minCx
        }
        if (prevCx > maxCx) {
          cx = maxCx
        }
        if (prevCy < minCy) {
          cy = minCy
        }
        if (prevCy > maxCy) {
          cy = maxCy
        }

        updateImgPos(scale, cx, cy)
      }
    }
  }
  handleContrastChange = val => {
    const { updateContrast } = this.props
    updateContrast(val)
  }
  handleLightnessChange = val => {
    const { updateLightness } = this.props
    updateLightness(val)
  }
  updateImage = updates => {
    const { scale, cx, cy, endEditing } = updates
    const { updateImgPos, endEditingPhoto } = this.props
    updateImgPos(scale, cx, cy)
    if (endEditing) endEditingPhoto()
  }
  handleFile = (url, file, revokeUrl) => {
    // TODO: get img data for 2x the size of the spiral length
    this.getOrientation(file, orientation => {
      getImageData(url, orientation).then(
        ({ status, width, height, imgData: data }) => {
          if (status === 'ok') {
            const { startEditingPhoto, addImgData } = this.props
            if (revokeUrl) window.URL.revokeObjectURL(revokeUrl) // we have had some success... now time to revoke old url
            startEditingPhoto()
            addImgData(
              url,
              contrastVals.default,
              lightnessVals.default,
              1,
              width,
              height,
              data,
              orientation || 1,
              file.name
            )
          } else {
            // TODO: error with img have a warning of some sort
            console.error(
              'Something has gone terribly wrong we need to add an warning'
            )
          }
        }
      )
    })
  }
  handleFileChange = e => {
    const file = e.target.files[0]
    if (!file || !file.name) return
    const allowedFileExt = ['png', 'gif', 'jpg', 'jpeg']
    const ext = file.name
      .split('.')
      .slice(-1)[0]
      .toLowerCase()
    if (
      allowedFileExt.indexOf(ext) !== -1 &&
      file.type.indexOf('image/') !== -1
    ) {
      const blobUrl = URL.createObjectURL(file)
      const revokeUrl = this.props.blobUrl
      this.handleFile(blobUrl, file, revokeUrl)
    } else {
      // TODO: will need to give a warning if not supported
    }
    // Now clear out file...
    e.target.value = ''
  }
  getOrientation(file, callback) {
    // TODO: move to img utils
    // Source: https://stackoverflow.com/a/32490603/2824643
    var reader = new FileReader()
    reader.onload = function(e) {
      var view = new DataView(e.target.result)
      if (view.getUint16(0, false) !== 0xffd8) return callback(-2)
      var length = view.byteLength,
        offset = 2
      while (offset < length) {
        if (view.getUint16(offset + 2, false) <= 8) return callback(-1)
        var marker = view.getUint16(offset, false)
        offset += 2
        if (marker === 0xffe1) {
          if (view.getUint32((offset += 2), false) !== 0x45786966)
            return callback(-1)

          var little = view.getUint16((offset += 6), false) === 0x4949
          offset += view.getUint32(offset + 4, little)
          var tags = view.getUint16(offset, little)
          offset += 2
          for (var i = 0; i < tags; i++) {
            if (view.getUint16(offset + i * 12, little) === 0x0112) {
              return callback(view.getUint16(offset + i * 12 + 8, little))
            }
          }
        } else if ((marker & 0xff00) !== 0xff00) {
          break
        } else {
          offset += view.getUint16(offset, false)
        }
      }
      return callback(-1)
    }
    reader.readAsArrayBuffer(file.slice(0, 131072)) // just to get exif
  }
  componentWillMount() {
    // Setup store
    const { addFilter, setup } = this.props
    addFilter()
    setup()
  }
  render() {
    const {
      init,
      length,
      clearImg,
      scale,
      editing,
      img: { blobUrl, data: imgData }
    } = this.props
    if (!init) return null
    return (
      <Fragment>
        <Main
          style={{
            minWidth: (length || 0) + 100,
            minHeight: (length || 0) + 100,
            overflow: 'hidden'
          }}>
          <Workspace>
            <Filter />
            <EditPhoto updatePhoto={this.updateImage} />
            <Guides />
            <Upload onChange={this.handleFileChange} />
            {blobUrl &&
              !editing && (
                <SecondaryButton
                  onClick={clearImg}
                  style={{
                    position: 'absolute',
                    bottom: -30,
                    left: '50%',
                    transform: 'translate(-50%)'
                  }}>
                  <span style={{top: '-1px', position: 'relative'}}>&times;</span> Clear image
                </SecondaryButton>
              )}
          </Workspace>
        </Main>
        {!!imgData && (
          <Sidebar>
            <Swatches />
          </Sidebar>
        )}
        <div
          style={{
            position: 'absolute',
            right: '0',
            top: '0',
            width: '300px',
            height: '100%',
            padding: 40
          }}>
          <Size />
          <SectionSlider
            sliderProps={{ id: scaleInputId }}
            title={'Scale'}
            min={1}
            max={3}
            onValueChange={v => {
              return `${Math.round(v * 100)}%`
            }}
            step={0.05}
            value={scale || 1}
            defaultValue={scale || 1}
            onChange={this.handleScaleChange}
          />
          <SectionSlider
            title={'Contrast'}
            startCenter
            onValueChange={v => {
              if (v > 0) {
                return `+${v}`
              }
              if (v === 0) {
                return `${String.fromCharCode(177)}${v}`
              }
              if (v < 0) {
                return v
              }
            }}
            min={contrastVals.min}
            max={contrastVals.max}
            step={contrastVals.step}
            defaultValue={contrastVals.default}
            onChange={this.handleContrastChange}
          />
          <SectionSlider
            title={'Lightness'}
            startCenter
            onValueChange={v => {
              if (v > 0) {
                return `+${v}`
              }
              if (v === 0) {
                return `${String.fromCharCode(177)}${v}`
              }
              if (v < 0) {
                return v
              }
            }}
            min={lightnessVals.min}
            max={lightnessVals.max}
            step={lightnessVals.step}
            defaultValue={lightnessVals.default}
            onChange={this.handleLightnessChange}
          />
          <SectionSlider
            title={'Rings'}
            min={rings.min}
            max={rings.max}
            step={rings.step}
            defaultValue={rings.default}
            onChange={this.handleRingChange}
          />
          <DownloadCanvas />
          <DemoImage blobUrl={blobUrl} handleFile={this.handleFile} />
        </div>
        <Hidden>
          <FilterMask />
        </Hidden>
      </Fragment>
    )
  }
}

const mapStateToProps = state => {
  const {
    editing: { editing },
    setup: { init },
    preview: { length },
    img: { scale, blobUrl },
    img
  } = state
  return { init, length, scale, img, blobUrl, editing }
}
const mapDispatchToProps = dispatch => {
  return {
    addFilter: () => dispatch(addFilter('spiral', { rings: rings.default }, 0)),
    setup: () => dispatch(setup()),
    updateRings: rings =>
      dispatch(updateFilter(undefined, undefined, { rings })),
    startEditingPhoto: () => dispatch(startEditingPhoto()),
    endEditingPhoto: () => dispatch(endEditingPhoto()),
    addImgData: (
      blobUrl,
      contrast,
      lightness,
      scale,
      width,
      height,
      data,
      orientation,
      name
    ) =>
      dispatch(
        addImgData(
          blobUrl,
          contrast,
          lightness,
          scale,
          width,
          height,
          data,
          orientation,
          name
        )
      ),
    updateImgPos: (scale, cx, cy) => dispatch(updateImgPos(scale, cx, cy)),
    updateContrast: contrast => dispatch(updateContrast(contrast)),
    updateLightness: lightness => dispatch(updateLightness(lightness)),
    addTempProp: (prop, value) => dispatch(addTempProp(prop, value)),
    clearImg: () => dispatch(clearImg())
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
