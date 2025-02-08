import React from 'react';
import { Link } from 'gatsby';
import styled from 'styled-components';
import { cardStyle, pictureStyle } from '../styles/basestyle.js';
import Layout from '../components/Layout.jsx';

const Description = styled.div`
  ${cardStyle};
  max-width: 868px;
`;

const Picture = styled.img`
  ${pictureStyle}
`;

const PageShowcase = (props) => {
  return (
    <Layout location={props.location}>
      <div>
        <Description>
          <h1>Fotolabor</h1>
          <p>
            Meine besten Bilder veröffentliche ich bei 500px:{' '}
            <a href="https://500px.com/dprogerwilco">https://500px.com/dprogerwilco</a>
            <br />
            Wenn du eines meiner Fotos verwenden willst, dann <Link to="/impressum">kontaktiere mich</Link> zuerst.
          </p>
          <p>Hier findest Du eine kleine Auswahl dieser Fotos:</p>
        </Description>

        <a href="https://500px.com/photo/236887527/mullerbahn-by-dirk-plate">
          <Picture
            src="https://drscdn.500px.org/photo/236887527/q%3D80_m%3D600/v2?sig=251eb1b218280794c753edda7af48c6a110a307e676741b864c726de7919b875"
            alt="Mullerbahn"
          />
        </a>

        <a href="https://500px.com/photo/96797665/snowy-trees-in-lenzerheide-by-dirk-plate">
          <Picture
            src="https://drscdn.500px.org/photo/96797665/q%3D80_m%3D600/v2?sig=30c8177c1aea0db10287b9eb08a42c2bc3686c4afe011f9bae3d6dcf1af0e6ad"
            alt="Snowy trees in Lenzerheide"
          />
        </a>

        <a href="https://500px.com/photo/179194983/silsersee-in-the-autumn-by-dirk-plate">
          <Picture
            src="https://drscdn.500px.org/photo/179194983/q%3D80_m%3D600/v2?sig=a3e005c0550eb410d5b9fb51cab06dad81f720a5d021482455cebea16aa759dd"
            alt="Silsersee in the autumn"
          />
        </a>

        <a href="https://500px.com/photo/89417783/skiing-above-fog-by-dirk-plate">
          <Picture
            src="https://drscdn.500px.org/photo/89417783/q%3D80_m%3D600/v2?sig=a650a04bc41d3ff20ac2437854a1373b0663c0ed088396d98222aac8e50d0834"
            alt="Skiing above fog"
          />
        </a>

        <a href="https://500px.com/photo/99014841/galzigbahn-by-dirk-plate">
          <Picture
            src="https://drscdn.500px.org/photo/99014841/q%3D80_m%3D600/v2?sig=66ec0bef0932d3417304922514a006d1eb67d9b32bb399e22630e02144a52e26"
            alt="Galzigbahn"
          />
        </a>

        <a href="https://500px.com/photo/138331197/chair-lift-in-winter-storm-by-dirk-plate">
          <Picture
            src="https://drscdn.500px.org/photo/138331197/q%3D80_m%3D600/v2?sig=fa4bbd196b399913456501e7039b132272faf8b45fd21379ed4628250de29fe0"
            alt="Chair lift in winter storm"
          />
        </a>

        <a href="https://500px.com/photo/89407329/titlis-skiing-by-dirk-plate">
          <Picture
            src="https://drscdn.500px.org/photo/89407329/q%3D80_m%3D600/v2?sig=2635d7cb814c2858ac1c5c5a73159f524881377171ca76278b9e040c8fe1e92f"
            alt="Titlis Skiing"
          />
        </a>

        <a href="https://500px.com/photo/89903859/spring-in-scherzingen-by-dirk-plate">
          <Picture
            src="https://drscdn.500px.org/photo/89903859/q%3D80_m%3D600/v2?sig=48535825276956606ec8864ab8237f8ce0acdcaafc8c38f11f3934dccdc43255"
            alt="Spring in Scherzingen"
          />
        </a>

        <a href="https://500px.com/photo/89420917/stuben-on-christmas-by-dirk-plate">
          <Picture
            src="https://drscdn.500px.org/photo/89420917/q%3D80_m%3D600/v2?sig=8577f9937b3a08b17b20e8e04f05043134e3ed2f7ae3e9c6b4018cd150b6eb15"
            alt="Stuben on Christmas"
          />
        </a>
      </div>
    </Layout>
  );
};

export const Head = () => {
  return (
    <>
      <title>Fotos</title>
    </>
  );
};

export default PageShowcase;
