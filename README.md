# www.dplate.de - Website

### Used color scheme

https://coolors.co/1f363d-40798c-70a9a1-9ec1a3-cfe0c3

### Build

Install required dependencies:

    npm run install

### Start the development server

This command serves the app at `http://localhost:8000` and provides basic URL
routing for the app:

    node --max-old-space-size=8192 node_modules/gatsby/dist/gatsby-cli.js develop

### Build

Collects the required `fragments` and call `polymer build`:

    node --max-old-space-size=8192 node_modules/gatsby/dist/gatsby-cli.js build
    
