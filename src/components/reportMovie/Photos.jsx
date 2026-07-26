import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import styles from './Photos.module.css';

const renderPhoto = (reportPath, visiblePhotoName, photo, index) => {
  const fileName = photo.name;
  const photoPath = '/photos' + reportPath + '/' + fileName + '.jpg';
  const isShown = visiblePhotoName === fileName;
  const opacity = isShown ? 1 : 0;
  const offsetY = isShown ? 100 : -100;
  return (
    <Fragment key={index}>
      <img
        id={fileName}
        className={styles.photo}
        src={photoPath}
        alt={photo.alt}
        style={{ opacity }}
      />
      <div className={styles.label} style={{ top: `calc(100% - ${offsetY}px)` }}>
        {photo.alt}
      </div>
    </Fragment>
  );
};

const Photos = ({ photos, reportPath, visiblePhotoName }) =>
  photos.map((photo, photoIndex) => renderPhoto(reportPath, visiblePhotoName, photo, photoIndex));

Photos.propTypes = {
  photos: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      alt: PropTypes.string
    })
  ).isRequired,
  reportPath: PropTypes.string.isRequired,
  visiblePhotoName: PropTypes.string
};

export default Photos;
