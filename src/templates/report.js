import React from 'react'
import styled from 'styled-components'
import { EXIF } from '../external/exif-js/exif'
import Map from '../components/map'

const Content = styled.div`
  display: block;
  margin: 16px;
  color: white;
  
  a {
    color: #CFE0C3;
    &:visited: {
      color: #9EC1A3;
    }
  }
`;

const Chapter = styled.p`
  max-width: 800px;
`;

const Caption = styled.figcaption`
  max-width: 800px;
`;

const Landmark = styled.figure`
  margin: 0 0 25px 0;
`;

const Photo = styled.img`
  display: block;
  max-width: 100%;
  max-height: calc(100vh - 75px);
  margin: 10px 0;
`;

class Report extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      time: undefined
    };
    this.scrollHandler = this.scrollHandler.bind(this)
  }

  componentDidMount() {
    window.addEventListener('scroll', this.scrollHandler);
    this.retrieveImageDates();
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.scrollHandler);
  }

  retrieveImageDate(image) {
    const self = this;
    EXIF.getData(image, function() {
      const exifDate = EXIF.getTag(this, 'DateTimeOriginal');
      if (exifDate) {
        const [date, time] = exifDate.split(' ');
        image.setAttribute('data-time', date.replace(/:/g, '-') + 'T' + time);
        self.images.push(image);
        self.scrollHandler();
      }
    });
  }

  retrieveImageDates() {
    this.images = [];
    const imgElements = document.querySelectorAll('.landmark img');
    for (let i=0, image; image = imgElements[i]; i++) {
      if (image.complete) {
        this.retrieveImageDate(image);
      } else {
        image.onload = this.retrieveImageDate.bind(this, image);
      }
    }
  }

  scrollHandler() {
    let nearestImage;
    let minDistance = Number.MAX_SAFE_INTEGER;
    this.images.forEach((image) => {
      const distance = Math.abs(window.pageYOffset  - image.offsetTop);
      if (distance < minDistance) {
        minDistance = distance;
        nearestImage = image;
      }
    });
    if (nearestImage) {
      this.setState({time: nearestImage.getAttribute('data-time')});
    }
  }

  renderPhoto(photo, index) {
    const fileName = photo.split('_')[1];
    const photoPath = __PATH_PREFIX__ + '/photos' + this.getReportPath() + '/' + fileName + '.jpg';
    return <Photo key={index} src={photoPath} />;
  }

  renderLandmark(landmark, index) {
    return (
      <Landmark key={index} className="landmark">
        {landmark.photos.map(this.renderPhoto.bind(this))}
        <Caption dangerouslySetInnerHTML={{ __html: landmark.text }} />
      </Landmark>
    )
  }

  getReportPath() {
    return '/' + this.props.data.reportJson.destination + '/' + this.props.data.reportJson.date;
  }

  render() {
    const content = this.props.data.reportJson;
    const {destination, date, title, intro, landmarks, outro} = content;
    return (
      <Content>
        <h1>{title}</h1>
        <Chapter dangerouslySetInnerHTML={{__html: intro}}/>
        {landmarks.map(this.renderLandmark.bind(this))}
        <Chapter dangerouslySetInnerHTML={{__html: outro}}/>
        {this.state.time && <Map gpxPath={__PATH_PREFIX__ + '/tracks' + this.getReportPath() + '.gpx'} time={this.state.time}></Map>}
      </Content>
    );
  }
}

export default Report;

export const pageQuery = graphql`
  query ReportByDestinationAndDate($destination: String!, $date: String!) {
    reportJson(destination: {eq: $destination}, date: {eq: $date}) {
      destination, date, title, intro, landmarks {photos, text}, outro
    }
  }
`;
