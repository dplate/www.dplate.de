import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Photo = styled.img.attrs(({ $opacity }) => ({
  style: { opacity: $opacity }
}))`
  position: fixed;
  display: block;
  box-shadow: 0 0 400px 200px black;
  z-index: 5;
  max-width: 100%;
  max-height: 100%;
  top: 50%;
  left: 50%;
  margin-right: -50%;
  transform: translate(-50%, -50%);
  transition: opacity 1s ease-in-out;
`;

const Label = styled.div.attrs(({ $offsetY }) => ({
  style: {
    top: `calc(100% - ${$offsetY}px)`
  }
}))`
  position: fixed;
  display: block;
  z-index: 6;
  max-width: 100%;
  left: 50%;
  margin-right: -50%;
  transform: translate(-50%, 0);
  font-size: 50px;
  text-shadow: 0 0 4px black;
  transition: top 2s ease-in-out;
`;

const renderPhoto = (reportPath, visiblePhotoName, photo, index) => {
  const fileName = photo.name;
  const photoPath = '/photos' + reportPath + '/' + fileName + '.jpg';
  const isShown = visiblePhotoName === fileName;
  const opacity = isShown ? 1 : 0;
  const offsetY = isShown ? 100 : -100;
  return (
    <Fragment key={index}>
      <Photo id={fileName} src={photoPath} alt={photo.alt} $opacity={opacity} />
      <Label $offsetY={offsetY}>{photo.alt}</Label>
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
