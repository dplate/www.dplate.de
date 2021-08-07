module.exports = {
  plugins: [
    'gatsby-transformer-json',
    'gatsby-plugin-loadable-components-ssr',
    'gatsby-plugin-styled-components',
    'gatsby-plugin-react-helmet',
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
      resolve: 'gatsby-plugin-google-analytics',
      options: {
        trackingId: 'UA-678641-3',
        anonymize: true
      }
    }
  ],
  pathPrefix: '/'
};
