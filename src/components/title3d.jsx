import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Wrapper = styled.div`
  position: relative;
  overflow: hidden;
  line-height: 0;
  margin-bottom: 10px;
`;

const Background = styled.img`
  position: relative;
  max-width: 100%;
  width: auto;
  height: auto;
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
  width: auto;
  height: auto;
`;

const Title3D = ({ reportPath, title, offsetY, fontSize, width, height, align, scrollTrigger }) => {
  const containerRef = useRef(null);

  const [currentYOffset, setCurrentYOffset] = useState(0);
  const [initialYOffset, setInitalYOffset] = useState(null);

  useEffect(() => {
    if (containerRef.current) {
      setCurrentYOffset(containerRef.current.getBoundingClientRect().top);
    }
  }, [scrollTrigger]);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        setCurrentYOffset(containerRef.current.getBoundingClientRect().top);
      }
    };
    if (containerRef.current) {
      setInitalYOffset(containerRef.current.offsetTop);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  let backgroundFile = 'title.jpg';
  if (process.env.NODE_ENV === `production`) {
    backgroundFile = title.split(' ').join('-').toLowerCase() + '_' + backgroundFile;
  }
  const yMovement = initialYOffset - currentYOffset;
  return (
    <Wrapper id="title3d" ref={containerRef} style={{ textAlign: align }}>
      <Background
        src={'/photos' + reportPath + '/' + backgroundFile}
        style={{ top: yMovement / 20 + 'vh' }}
        width={width}
        height={height}
      />
      <Title
        style={{
          top: 'calc(' + offsetY + 'vw + ' + yMovement / 40 + 'vh)',
          fontSize: fontSize + 'vw'
        }}
      >
        {title}
      </Title>
      <Foreground src={'/photos' + reportPath + '/title-foreground.png'} width={width} height={height} />
    </Wrapper>
  );
};

Title3D.propTypes = {
  reportPath: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  offsetY: PropTypes.number.isRequired,
  fontSize: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  align: PropTypes.string,
  scrollTrigger: PropTypes.number
};

Title3D.defaultProps = {
  align: 'left'
};

export default Title3D;
