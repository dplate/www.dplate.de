import {css} from 'styled-components'

const shadowStyle = css`
  box-shadow: 0 4px 4px 0 rgba(0,0,0,1), 0 1px 5px 0 rgba(0,0,0,1), 0 3px 1px -2px rgba(0,0,0,1);
`;

export const cardStyle = css`
  ${shadowStyle};
  display:block;
  background-color: white;
  margin: 16px;
  padding: 16px;
  max-width: 800px;
  border-radius: 5px;
    
  h1 {
    font-size: 22px;
  }

  h2 {
    font-size: 18px;
    line-height: 2;
  }

  h3 {
    font-size: 16px;
    line-height: 3;
  }
  
  ul {
    padding-left: 20px;
  }
  
  p {
    margin-bottom: 8px;
  }
`;

export const pictureStyle = css`
  ${shadowStyle};
  display: block;
  margin: 16px;
  max-width: calc(100% - 32px);
  max-height: calc(100vh - 75px);
`;

export const videoContainerStyle = css`
  display: block;
  margin: 16px;
  max-width: 1280px;
`;

export const videoWrapperStyle = css`
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
  padding-top: 25px;
  height: 0;
  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
`;