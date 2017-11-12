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
  font-size: 5vw;
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
    const {reportPath, title} = this.props;
    return (
      <Wrapper>
        <Background src={__PATH_PREFIX__ + '/photos' + reportPath + '/title-background.jpg'} style={{ top: this.state.pageYOffset / 20 + 'vh' }} />
        <Title style={{ top: 'calc(15vw + ' + this.state.pageYOffset / 40 + 'vh)' }}>{title}</Title>
        <Foreground src={__PATH_PREFIX__ + '/photos' + reportPath + '/title-foreground.png'} />
      </Wrapper>
    )
  }
}

Title3D.propTypes = {
  reportPath: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
};

export default Title3D;


