import React from 'react';
import Link from './Link.jsx';
import { cardStyle, pictureStyle } from '../styles/basestyle.js';
import styles from './PageShowcase.module.css';

const PageShowcase = () => {
  return (
    <div>
      <div className={`${cardStyle} ${styles.description}`}>
        <h1>Fotolabor</h1>
        <p>
          Meine besten Bilder veröffentliche ich bei 500px:{' '}
          <a href="https://500px.com/dprogerwilco">https://500px.com/dprogerwilco</a>
          <br />
          Wenn du eines meiner Fotos verwenden willst, dann <Link to="/impressum">kontaktiere mich</Link> zuerst.
        </p>
        <p>Hier findest Du eine kleine Auswahl dieser Fotos:</p>
      </div>

      <a href="https://500px.com/photo/236887527/mullerbahn-by-dirk-plate">
        <img
          className={pictureStyle}
          src="https://cdn-resize-prod-com.500px.cloud/photo/236887527/0.jpg?s=1&expiry=1791032400&sig=dc53343b6b945e9a86b887adb8fd2c4e2372bcc65d7473cb0d22f8c864ac8eb2"
          alt="Mullerbahn"
        />
      </a>

      <a href="https://500px.com/photo/96797665/snowy-trees-in-lenzerheide-by-dirk-plate">
        <img
          className={pictureStyle}
          src="https://cdn-resize-prod-com.500px.cloud/photo/96797665/0.jpg?s=1&expiry=1791032400&sig=0514c0158091eb87da37de5f3d89a81ab822d3a174ed137c4f25c17095348f57"
          alt="Snowy trees in Lenzerheide"
        />
      </a>

      <a href="https://500px.com/photo/179194983/silsersee-in-the-autumn-by-dirk-plate">
        <img
          className={pictureStyle}
          src="https://cdn-resize-prod-com.500px.cloud/photo/179194983/0.jpg?s=1&expiry=1791032400&sig=b68213c7decc19b6bc2a8f6f347dfff2ab1600f3d9237ce065b7e02ae27a9f4a"
          alt="Silsersee in the autumn"
        />
      </a>

      <a href="https://500px.com/photo/89417783/skiing-above-fog-by-dirk-plate">
        <img
          className={pictureStyle}
          src="https://cdn-resize-prod-com.500px.cloud/photo/89417783/0.jpg?s=1&expiry=1791032400&sig=61a731aca7f48572859b9deb4950b0c0c28bae1aede27050c9112920041a8214"
          alt="Skiing above fog"
        />
      </a>

      <a href="https://500px.com/photo/99014841/galzigbahn-by-dirk-plate">
        <img
          className={pictureStyle}
          src="https://cdn-resize-prod-com.500px.cloud/photo/99014841/0.jpg?s=1&expiry=1791032400&sig=8629bcf35910e5e2e968915bdb29ebd6eb7523374344f59d45c99a89589e7ad1"
          alt="Galzigbahn"
        />
      </a>

      <a href="https://500px.com/photo/138331197/chair-lift-in-winter-storm-by-dirk-plate">
        <img
          className={pictureStyle}
          src="https://cdn-resize-prod-com.500px.cloud/photo/138331197/0.jpg?s=1&expiry=1791032400&sig=5fa790bc6b8b84e05c9504f98c6682486788cd4705198882c308120e816e9028"
          alt="Chair lift in winter storm"
        />
      </a>

      <a href="https://500px.com/photo/89407329/titlis-skiing-by-dirk-plate">
        <img
          className={pictureStyle}
          src="https://cdn-resize-prod-com.500px.cloud/photo/89407329/0.jpg?s=1&expiry=1791032400&sig=9bfaa961d48d8b3ff24bc507a53abb63bb619e80117299a99a73a8305a6f0ac4"
          alt="Titlis Skiing"
        />
      </a>

      <a href="https://500px.com/photo/89903859/spring-in-scherzingen-by-dirk-plate">
        <img
          className={pictureStyle}
          src="https://cdn-resize-prod-com.500px.cloud/photo/89903859/0.jpg?s=1&expiry=1791032400&sig=fef099ff280a228196cf3b7954e464e071579b64650a63cf96626c7a57622f85"
          alt="Spring in Scherzingen"
        />
      </a>

      <a href="https://500px.com/photo/89420917/stuben-on-christmas-by-dirk-plate">
        <img
          className={pictureStyle}
          src="https://cdn-resize-prod-com.500px.cloud/photo/89420917/0.jpg?s=1&expiry=1791032400&sig=9115229b5dd85ba70317ce14b9c4b1db5ce21734b07a400ec834d350b0ad092c"
          alt="Stuben on Christmas"
        />
      </a>
    </div>
  );
};

export default PageShowcase;
