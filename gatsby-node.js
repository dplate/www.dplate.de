const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { DefinePlugin } = require('webpack');

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions;

  const reports =  new Promise((resolve, reject) => {
    const reportTemplate = path.resolve(`src/templates/report.js`);
    resolve(
      graphql(
        `
          {
            allReportJson(limit: 1000) {
              edges {
                node {
                  destination,
                  date
                }
              }
            }
          }
        `
      ).then(result => {
        if (result.errors) {
          reject(result.errors)
        }
        result.data.allReportJson.edges.forEach(({ node }) => {
          const { destination, date } = node;
          const path = '/alpine/' + destination + '/' + date.substring(1);
          createPage({
            path,
            component: reportTemplate,
            context: {
              destination,
              date: date
            }
          })
        })
      })
    )
  });

  const reportMovies =  new Promise((resolve, reject) => {
    const reportMovieTemplate = path.resolve(`src/templates/reportmovie.js`);
    resolve(
      graphql(
        `
          {
            allReportJson(limit: 1000) {
              edges {
                node {
                  destination,
                  date
                }
              }
            }
          }
        `
      ).then(result => {
        if (result.errors) {
          reject(result.errors)
        }
        result.data.allReportJson.edges.forEach(({ node }) => {
          const { destination, date } = node;
          const path = '/alpine/' + destination + '/' + date.substring(1) + '/movie';
          createPage({
            path,
            component: reportMovieTemplate,
            context: {
              destination,
              date: date
            }
          })
        })
      })
    )
  });

  const destinations =  new Promise((resolve, reject) => {
    const destinationTemplate = path.resolve(`src/templates/destination.js`);
    resolve(
      graphql(
        `
          {
            allDestinationJson(limit: 1000) {
              edges {
                node {
                  destination
                }
              }
            }
          }
        `
      ).then(result => {
        if (result.errors) {
          reject(result.errors)
        }
        result.data.allDestinationJson.edges.forEach(({ node }) => {
          const { destination } = node;
          const path = '/alpine/' + destination;
          createPage({
            path,
            component: destinationTemplate,
            context: {
              destination
            }
          })
        })
      })
    )
  });
  return Promise.all([reports, reportMovies, destinations]);
};

exports.onCreateWebpackConfig = ({ stage, actions, loaders }) => {
  if (stage.startsWith("develop")) {
    actions.setWebpackConfig({
      resolve: {
        alias: {
          "react-dom": "@hot-loader/react-dom",
        },
      },
    })
  }
  actions.setWebpackConfig({
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          { from: 'node_modules/cesium/Build/Cesium/Workers', to: 'Cesium/Workers' },
          { from: 'node_modules/cesium/Build/Cesium/Assets', to: 'Cesium/Assets' },
          { from: 'node_modules/cesium/Build/Cesium/Widgets', to: 'Cesium/Widgets' },
        ]
      }),

      new DefinePlugin({
        CESIUM_BASE_URL: JSON.stringify('/Cesium/'),
      }),
    ],
    module: {
      rules: [
        {
          test: /\.gl(tf|b)$/,
          use: loaders.url(),
        },
      ],
      unknownContextCritical: false,
    }
  });
}
