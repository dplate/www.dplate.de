import React from 'react'
import { Helmet } from 'react-helmet';
import Link from 'gatsby-link'
import styled from 'styled-components'
import {cardStyle} from '../styles/basestyle.js'
import Script from 'react-load-script'

const Description = styled.div`
  ${cardStyle}
  max-width: 868px;
`;

const Picture = styled.div`
  margin: 16px;
  max-width: 900px;
`;

export default () => {
  return (
    <div>
      <Helmet><title>Photos</title></Helmet>
      <Description>
          <h1>Fotolabor</h1>
          <p>
              Meine besten Bilder veröffentliche ich bei 500px. Dort können auch Lizenzen zur eigenen Verwendung erworben
              werden: <a href="https://500px.com/dprogerwilco">https://500px.com/dprogerwilco</a><br />
              Findest Du dort ein Foto nicht, dann <Link to="/impressum">kontaktiere mich</Link>.
          </p>
          <p>
              Hier findest Du eine kleine Auswahl dieser Fotos:
          </p>
      </Description>

      <Picture>
        <div className='pixels-photo'>
          <p>
            <img src='https://drscdn.500px.org/photo/236887527/m%3D900/v2?user_id=10324387&webp=true&sig=512fe5de233e9883b3c3c25d7b2413b11011b6a55a2dacc2d5e4381450b1a7dd' alt='Mullerbahn by Dirk Plate on 500px.com' />
          </p>
          <a href='https://500px.com/photo/236887527/mullerbahn-by-dirk-plate' alt='Mullerbahn by Dirk Plate on 500px.com'/>
        </div>
      </Picture>

      <Picture>
        <div className='pixels-photo'>
            <p>
                <img src='https://drscdn.500px.org/photo/96797665/m%3D900/af6122f50487c241ad5d47668954c1ab' alt='Snowy trees in Lenzerheide by Dirk Plate on 500px.com' />
            </p>
            <a href='https://500px.com/photo/96797665/snowy-trees-in-lenzerheide-by-dirk-plate' alt='Snowy trees in Lenzerheide by Dirk Plate on 500px.com'/>
        </div>
      </Picture>

      <Picture>
        <div className='pixels-photo'>
            <p>
                <img src='https://drscdn.500px.org/photo/179194983/m%3D900/e58db987031e3a00c89fd9602a6056a0' alt='Silsersee in the autumn by Dirk Plate on 500px.com' />
            </p>
            <a href='https://500px.com/photo/179194983/silsersee-in-the-autumn-by-dirk-plate' alt='Silsersee in the autumn by Dirk Plate on 500px.com'/>
        </div>
      </Picture>

      <Picture>
        <div className='pixels-photo'>
            <p>
                <img src='https://drscdn.500px.org/photo/89417783/m%3D900/83e8d791f027e491c1a36f418e5e24a2' alt='Skiing above fog by Dirk Plate on 500px.com' />
            </p>
            <a href='https://500px.com/photo/89417783/skiing-above-fog-by-dirk-plate' alt='Skiing above fog by Dirk Plate on 500px.com'/>
        </div>
      </Picture>

      <Picture>
        <div className='pixels-photo'>
            <p>
                <img src='https://drscdn.500px.org/photo/99014841/m%3D900/6c1847e6c072fa851f20178d298a9888' alt='Galzigbahn by Dirk Plate on 500px.com' />
            </p>
            <a href='https://500px.com/photo/99014841/galzigbahn-by-dirk-plate' alt='Galzigbahn by Dirk Plate on 500px.com'/>
        </div>
      </Picture>

      <Picture>
        <div className='pixels-photo'>
            <p>
                <img src='https://drscdn.500px.org/photo/138331197/m%3D900/1a2efc1f799d0a51909965c20575aaae' alt='Chair lift in winter storm by Dirk Plate on 500px.com' />
            </p>
            <a href='https://500px.com/photo/138331197/chair-lift-in-winter-storm-by-dirk-plate' alt='Chair lift in winter storm by Dirk Plate on 500px.com'/>
        </div>
      </Picture>

      <Picture>
        <div className='pixels-photo'>
            <p>
                <img src='https://drscdn.500px.org/photo/89407329/m%3D900/4b32b84a7bd5c14649a9ce5bb84dd129' alt='Titlis Skiing by Dirk Plate on 500px.com' />
            </p>
            <a href='https://500px.com/photo/89407329/titlis-skiing-by-dirk-plate' alt='Titlis Skiing by Dirk Plate on 500px.com'/>
        </div>
      </Picture>

      <Picture>
        <div className='pixels-photo'>
            <p>
                <img src='https://drscdn.500px.org/photo/89903859/m%3D900/ab93f8dadbe378873c4c1070483ccc3d' alt='Spring in Scherzingen by Dirk Plate on 500px.com' />
            </p>
            <a href='https://500px.com/photo/89903859/spring-in-scherzingen-by-dirk-plate' alt='Spring in Scherzingen by Dirk Plate on 500px.com'/>
        </div>
      </Picture>

      <Picture>
        <div className='pixels-photo'>
            <p>
                <img src='https://drscdn.500px.org/photo/89420917/m%3D900/9d62c6483705ca6c6d9d066702e00bb3' alt='Stuben on Christmas by Dirk Plate on 500px.com' />
            </p>
            <a href='https://500px.com/photo/89420917/stuben-on-christmas-by-dirk-plate' alt='Stuben on Christmas by Dirk Plate on 500px.com'/>
        </div>
      </Picture>

      <Script url='https://500px.com/embed.js' />
    </div>
  );
};
