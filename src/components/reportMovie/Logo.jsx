import React from 'react';
import PropTypes from 'prop-types';
import styles from './Logo.module.css';

const Logo = ({ introActive, outroActive, onClick }) => {
  const top = introActive ? 75 : outroActive ? 45 : 95;
  const left = introActive || outroActive ? 50 : 95;
  const width = introActive ? 400 : outroActive ? 600 : 100;
  return (
    <img
      className={styles.logoContainer}
      style={{
        width: `${width}px`,
        top: `${top}vh`,
        left: `${left}vw`
      }}
      src="/assets/alpinfunk.svg"
      onClick={onClick}
    />
  );
};

Logo.propTypes = {
  introActive: PropTypes.bool.isRequired,
  outroActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func
};

export default Logo;
