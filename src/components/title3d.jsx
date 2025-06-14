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
  height: auto;
`;

const Title = styled.h1`
  position: absolute;
  left: 3cqw;
  right: 3cqw;
  line-height: initial;
  text-shadow: 2px 2px 4px #000000;
  opacity: 0.9;
`;

const Foreground = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  max-width: 100%;
  height: auto;
`;

const Title3D = ({ reportPath, title, offsetY, fontSize, width, height, align = "left", scrollTrigger }) => {
  const containerRef = useRef(null);

  const [currentYOffset, setCurrentYOffset] = useState(0);

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
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  let backgroundFile = 'title.jpg';
  if (process.env.NODE_ENV === `production`) {
    backgroundFile = title.split(' ').join('-').toLowerCase() + '_' + backgroundFile;
  }
  const yMovement = currentYOffset > 0 ? 0 : -currentYOffset;
  return (
    <Wrapper id="title3d" ref={containerRef} style={{
      textAlign: align,
      maxWidth: '1920px',
      containerType: 'inline-size'
    }}>
      <Background
        src={'/photos' + reportPath + '/' + backgroundFile}
        style={{ top: yMovement / 2 + 'px' }}
        width={width}
        height={height}
      />
      <Title
        style={{
          top: 'calc(' + offsetY + 'cqw + ' + yMovement / 4 + 'px)',
          fontSize: fontSize + 'cqw'
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

export default Title3D;
