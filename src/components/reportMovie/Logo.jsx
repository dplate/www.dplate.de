import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const LogoContainer = styled.img.attrs(({ $width, $top, $left }) => ({
  style: {
    width: `${$width}px`,
    top: `${$top}vh`,
    left: `${$left}vw`
  }
}))`
  position: fixed;
  transform: translate(-50%, -50%);
  z-index: 6;
  filter: invert(100%) sepia(0%) saturate(7444%) hue-rotate(88deg) brightness(123%) contrast(111%)
    drop-shadow(0 0 4px black);
  transition: width 5s ease-in-out, top 5s ease-in-out, left 5s ease-in-out;
`;

const Logo = ({ introActive, outroActive, onClick }) => {
  const top = introActive ? 75 : outroActive ? 45 : 95;
  const left = introActive || outroActive ? 50 : 95;
  const width = introActive ? 400 : outroActive ? 600 : 100;
  return <LogoContainer $top={top} $left={left} $width={width} src="/assets/alpinfunk.svg" onClick={onClick} />;
};

Logo.propTypes = {
  introActive: PropTypes.bool.isRequired,
  outroActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func
};

export default Logo;
