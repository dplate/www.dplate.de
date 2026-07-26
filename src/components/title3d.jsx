import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './Title3d.module.css';

const Title3D = ({ reportPath, title, offsetY, fontSize, width, height, align = 'left', scrollTrigger }) => {
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
    <div
      id="title3d"
      ref={containerRef}
      className={styles.wrapper}
      style={{
        textAlign: align,
        maxWidth: '1920px',
        containerType: 'inline-size'
      }}
    >
      <img
        className={styles.background}
        src={'/photos' + reportPath + '/' + backgroundFile}
        style={{ top: yMovement / 2 + 'px' }}
        width={width}
        height={height}
      />
      <h1
        className={styles.title}
        style={{
          top: 'calc(' + offsetY + 'cqw + ' + yMovement / 4 + 'px)',
          fontSize: fontSize + 'cqw'
        }}
      >
        {title}
      </h1>
      <img className={styles.foreground} src={'/photos' + reportPath + '/title-foreground.png'} width={width} height={height} />
    </div>
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
  scrollTrigger: PropTypes.object
};

export default Title3D;
