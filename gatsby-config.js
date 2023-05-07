module.exports = {
  plugins: [
    'gatsby-transformer-json',
    'gatsby-plugin-styled-components',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/src/reports`,
        name: 'reports'
      }
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/src/destinations`,
        name: 'destinations'
      }
    },
    {
      resolve: 'gatsby-plugin-google-gtag',
      options: {
        trackingIds: ['G-Z27P6YLYRT'],
        gtagConfig: {
          anonymize_ip: true
        },
        pluginConfig: {
          head: true,
          respectDNT: true
        }
      }
    }
  ],
  pathPrefix: '/',
  trailingSlash: 'never'
};
