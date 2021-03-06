import React, { Component } from 'react';

export default class RenderText extends Component {
  state = {
    text: ''
  }

  componentWillMount = async () => {
    const response = await fetch(this.props.url);
    const text = await response.text();
    this.setState({ text });
  }

  render() {
    const { text } = this.state;
    return (
      <div>
        <div>--------</div>
        <div>{text}</div>
        <div>--------</div>
      </div>
    );
  }
}
