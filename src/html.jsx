import React from 'react';

const inlinedStyles =
  '* { ' +
  'margin: 0;' +
  'padding: 0;' +
  '}' +
  'body {' +
  'margin: 0; ' +
  'font-family: "Trebuchet MS", Helvetica, sans-serif; ' +
  'line-height: 1.5; ' +
  'background-color: #1F363D; ' +
  '}';

export default (props) => {
  return (
    <html lang="de-de">
      <head>
        <meta charSet="utf-8" />
        <meta name="language" content="de" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="viewport" content="width=device-width, minimum-scale=1, initial-scale=1, user-scalable=yes" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#9EC1A3" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="www.dplate.de" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="www.dplate.de" />
        <link rel="apple-touch-icon" href="/icon-48x48.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="96x96" href="/icon-96x96.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192x192.png" />
        <meta name="msapplication-TileImage" content="/icon-144x144.png" />
        <meta name="msapplication-TileColor" content="#9EC1A3" />
        <meta name="msapplication-tap-highlight" content="no" />
        <style id="gatsby-inlined-css" dangerouslySetInnerHTML={{ __html: inlinedStyles }} />
        {props.headComponents}
      </head>
      <body>
        <div id="___gatsby" dangerouslySetInnerHTML={{ __html: props.body }} />
        {props.postBodyComponents}
      </body>
    </html>
  );
};
