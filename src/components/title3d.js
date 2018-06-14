import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const Wrapper = styled.div`
  position: relative;
  overflow: hidden;
  line-height: 0px;
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
  top: 0px;
  left: 0px;
  max-width: 100%;
`;

class Title3D extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      pageYOffset: 0
    };
    this.scrollHandler = this.scrollHandler.bind(this);
  }

  scrollHandler() {
    this.setState({ pageYOffset: window.pageYOffset });
  }

  componentDidMount() {
    window.addEventListener('scroll', this.scrollHandler);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.scrollHandler);
  }

  render() {
    const {reportPath, title, offsetY, fontSize, align} = this.props;
    let backgroundFile = 'title.jpg';
    if (process.env.NODE_ENV === `production`) {
      backgroundFile = title.split(' ').join('-').toLowerCase() + '_' + backgroundFile;
    }
    return (
      <Wrapper style={{ textAlign: align }}>
        <Background src={__PATH_PREFIX__ + '/photos' + reportPath + '/' + backgroundFile} style={{ top: this.state.pageYOffset / 20 + 'vh' }} />
        <Title style={{ top: 'calc(' + offsetY + 'vw + ' + this.state.pageYOffset / 40 + 'vh)', fontSize: fontSize + 'vw' }}>{title}</Title>
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
  align: PropTypes.string
};

Title3D.defaultProps = {
  align: 'left'
};

export default Title3D;


