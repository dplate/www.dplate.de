import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useInView } from 'react-intersection-observer';
import { videoWrapperStyle } from '../styles/basestyle.js';

const VideoWrapper = styled.div`
  ${videoWrapperStyle}
`;

const Video = ({ title, video }) => {
  const { ref, inView } = useInView({ triggerOnce: true });

  return (
    <VideoWrapper ref={ref}>
      {inView && (
        <iframe
          loading="lazy"
          src={`https://www.youtube.com/embed/${video}?wmode=transparent`}
          frameBorder="0"
          allowFullScreen
          title={title}
        />
      )}
    </VideoWrapper>
  );
};

Video.propTypes = {
  title: PropTypes.string.isRequired,
  video: PropTypes.string.isRequired
};

export default Video;
