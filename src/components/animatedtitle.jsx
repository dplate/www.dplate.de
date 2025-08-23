import Title3D from './Title3d.jsx';
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { animated, useSpring } from 'react-spring';

const Container = styled.div.attrs(({ $movePercent }) => ({
  style: { transform: `translate(0, -${$movePercent}%)` }
}))`
  position: fixed;
  top: 0;
  width: 100vw;
  z-index: 6;

  > h1 {
    text-align: center;
    font-size: 100px;
    margin: 200px 50px 0 50px;
  }
`;

const MovingTitle = ({ movePercent, reportPath, title, title3d }) => {
  return (
    <Container $movePercent={movePercent}>
      {title3d ? (
        <Title3D
          reportPath={reportPath}
          title={title}
          offsetY={title3d.offsetY}
          fontSize={title3d.fontSize}
          width={title3d.width}
          height={title3d.height}
          align={title3d.align}
          scrollTrigger={movePercent}
        />
      ) : (
        <h1>{title}</h1>
      )}
    </Container>
  );
};

const AnimatedTitle = ({ reportPath, title, title3d, visible = true }) => {
  const { movePercent } = useSpring({
    config: { duration: 5000 },
    movePercent: visible ? 0 : 120
  });
  const AnimatedTitleContainer = animated(MovingTitle);
  return <AnimatedTitleContainer movePercent={movePercent} reportPath={reportPath} title={title} title3d={title3d} />;
};

AnimatedTitle.propTypes = {
  reportPath: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  title3d: PropTypes.shape({
    offsetY: PropTypes.number.isRequired,
    fontSize: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    align: PropTypes.string
  }),
  visible: PropTypes.bool.isRequired
};

export default AnimatedTitle;
