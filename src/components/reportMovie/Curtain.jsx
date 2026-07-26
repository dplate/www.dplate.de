import React from 'react';
import PropTypes from 'prop-types';
import styles from './Curtain.module.css';

const Curtain = ({ closed }) => {
  return <div className={styles.curtainContainer} style={{ opacity: closed ? 1 : 0 }} />;
};

Curtain.propTypes = {
  closed: PropTypes.bool.isRequired
};

export default Curtain;
