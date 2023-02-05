import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const CurtainContainer = styled.div.attrs(({ opacity }) => ({
  style: { opacity }
}))`
  position: fixed;
  width: 100%;
  height: 100%;
  background-color: black;
  z-index: 5;
  transition: opacity 5s ease-in-out;
`;

const Curtain = ({ closed }) => {
  return <CurtainContainer opacity={closed ? 1 : 0} />;
};

Curtain.propTypes = {
  closed: PropTypes.bool.isRequired
};

export default Curtain;
