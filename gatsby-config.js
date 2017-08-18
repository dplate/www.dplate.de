module.exports = {
  plugins: [
    `gatsby-transformer-json`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/reports`,
        name: `reports`,
      },
    },
    `gatsby-plugin-styled-components`
  ],
  pathPrefix: '/'
};
