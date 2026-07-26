import React from 'react';
import { cardStyle } from '../styles/basestyle.js';

const Page404 = () => {
  return (
    <div className={cardStyle}>
      <h1>404 - Seite nicht gefunden</h1>
      <p>Die gewünschte Seite konnte leider nicht gefunden werden. :(</p>
    </div>
  );
};

export default Page404;
