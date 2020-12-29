module.exports = {
  plugins: [
    'gatsby-transformer-json',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/src/reports`,
        name: 'reports',
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/src/destinations`,
        name: 'destinations',
      },
    },
    'gatsby-plugin-styled-components',
    {
      resolve: 'gatsby-plugin-google-analytics',
      options: {
        trackingId: 'UA-678641-3',
        anonymize: true
      }
    },
    'gatsby-plugin-react-helmet'
  ],
  pathPrefix: '/'
};
