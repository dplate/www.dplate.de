import Title3D from './Title3D.jsx';
import React from 'react';
import PropTypes from 'prop-types';
import { animated, useSpring } from 'react-spring';
import styles from './AnimatedTitle.module.css';

const MovingTitle = ({ movePercent, reportPath, title, title3d }) => {
  const transform = movePercent.to((p) => `translate(0, -${p}%)`);
  return (
    <animated.div className={styles.container} style={{ transform }}>
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
    </animated.div>
  );
};

const AnimatedTitle = ({ reportPath, title, title3d, visible = true }) => {
  const [scrollTrigger, setScrollTrigger] = React.useState(0);
  const { movePercent } = useSpring({
    config: { duration: 5000 },
    movePercent: visible ? 0 : 120,
    onChange: ({ value }) => {
      setScrollTrigger(value.movePercent);
    }
  });
  const transform = movePercent.to((p) => `translate(0, -${p}%)`);
  return (
    <animated.div className={styles.container} style={{ transform }}>
      {title3d ? (
        <Title3D
          reportPath={reportPath}
          title={title}
          offsetY={title3d.offsetY}
          fontSize={title3d.fontSize}
          width={title3d.width}
          height={title3d.height}
          align={title3d.align}
          scrollTrigger={scrollTrigger}
        />
      ) : (
        <h1>{title}</h1>
      )}
    </animated.div>
  );
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
