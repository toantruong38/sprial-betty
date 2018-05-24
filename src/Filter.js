import React, {PureComponent} from 'react'
import Spiral from './Spiral'
import { connect } from 'react-redux'

class Filter extends PureComponent {
  render () {
    switch (this.props.name) {
      case 'spiral':
        return (
          <Spiral />
        )
      default:
        return null
    }
  }
}

const mapStateToProps = (state) => {
  const {filter: {name}} = state
  return {name}
}

export default connect(
  mapStateToProps
)(Filter)

