import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const Wrapper = styled.div`
  position: relative;
  overflow: hidden;
  line-height: 0;
  margin-bottom: 10px;
`;

const Background = styled.img`
  position: relative;
  max-width: 100%;
`;

const Title = styled.h1`
  position: absolute;
  left: 3vw;
  right: 3vw;
  line-height: initial;
  text-shadow: 2px 2px 4px #000000;
`;

const Foreground = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  max-width: 100%;
`;

class Title3D extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      initialYOffset: 0,
      currentYOffset: 0
    };
    this.scrollHandler = this.scrollHandler.bind(this);
  }

  getCurrentYOffset() {
    return window.document.getElementById('title3d').getBoundingClientRect().top
  }

  scrollHandler() {
    this.setState({ currentYOffset: this.getCurrentYOffset() });
  }

  componentDidMount() {
    const currentYOffset = this.getCurrentYOffset();
    this.setState({
      initialYOffset: currentYOffset,
      currentYOffset
    })
    window.addEventListener('scroll', this.scrollHandler);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.scrollHandler);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.scrollTrigger && this.props.scrollTrigger !== nextProps.scrollTrigger) {
      this.scrollHandler();
    }
  }

  render() {
    const {reportPath, title, offsetY, fontSize, align} = this.props;
    let backgroundFile = 'title.jpg';
    if (process.env.NODE_ENV === `production`) {
      backgroundFile = title.split(' ').join('-').toLowerCase() + '_' + backgroundFile;
    }
    const yMovement = this.state.initialYOffset - this.state.currentYOffset;
    return (
      <Wrapper id='title3d' style={{ textAlign: align }}>
        <Background src={__PATH_PREFIX__ + '/photos' + reportPath + '/' + backgroundFile} style={{ top: yMovement / 20 + 'vh' }} />
        <Title style={{ top: 'calc(' + offsetY + 'vw + ' + yMovement / 40 + 'vh)', fontSize: fontSize + 'vw' }}>{title}</Title>
        <Foreground src={__PATH_PREFIX__ + '/photos' + reportPath + '/title-foreground.png'} />
      </Wrapper>
    )
  }
}

Title3D.propTypes = {
  reportPath: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  offsetY: PropTypes.number.isRequired,
  fontSize: PropTypes.number.isRequired,
  align: PropTypes.string,
  scrollTrigger: PropTypes.number
};

Title3D.defaultProps = {
  align: 'left'
};

export default Title3D;


