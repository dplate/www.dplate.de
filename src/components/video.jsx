import React from 'react';
import PropTypes from 'prop-types';
import { useInView } from 'react-intersection-observer';
import { videoWrapperStyle } from '../styles/basestyle.js';

const Video = ({ title, video }) => {
  const { ref, inView } = useInView({ triggerOnce: true });

  return (
    <div className={videoWrapperStyle} ref={ref}>
      {inView && (
        <iframe
          loading="lazy"
          src={`https://www.youtube.com/embed/${video}?wmode=transparent`}
          frameBorder="0"
          allowFullScreen
          title={title}
        />
      )}
    </div>
  );
};

Video.propTypes = {
  title: PropTypes.string.isRequired,
  video: PropTypes.string.isRequired
};

export default Video;
