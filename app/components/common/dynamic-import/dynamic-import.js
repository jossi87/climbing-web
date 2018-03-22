import React, {Component} from 'react';
class DynamicImport extends Component {
  state = {
    component: null
  }
  componentWillMount () {
    this.props.load()
      .then((component) => {
        this.setState(() => ({
          component: component.default ? component.default : component
        }))
      })
  }
  render() {
    return this.props.children(this.state.component)
  }
}
