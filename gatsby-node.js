const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { DefinePlugin } = require('webpack');

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions;

  const reports = new Promise((resolve, reject) => {
    const reportTemplate = path.resolve(`src/templates/Report.jsx`);
    resolve(
      graphql(`
        {
          allReportJson(limit: 1000) {
            edges {
              node {
                destination
                date
              }
            }
          }
        }
      `).then((result) => {
        if (result.errors) {
          reject(result.errors);
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
          });
        });
      })
    );
  });

  const reportMovies = new Promise((resolve, reject) => {
    const reportMovieTemplate = path.resolve(`src/templates/ReportMovie.jsx`);
    resolve(
      graphql(`
        {
          allReportJson(filter: { track: { eq: true } }, limit: 1000) {
            edges {
              node {
                destination
                date
              }
            }
          }
        }
      `).then((result) => {
        if (result.errors) {
          reject(result.errors);
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
          });
        });
      })
    );
  });

  const destinations = new Promise((resolve, reject) => {
    const destinationTemplate = path.resolve(`src/templates/Destination.jsx`);
    resolve(
      graphql(`
        {
          allDestinationJson(limit: 1000) {
            edges {
              node {
                destination
              }
            }
          }
        }
      `).then((result) => {
        if (result.errors) {
          reject(result.errors);
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
          });
        });
      })
    );
  });
  return Promise.all([reports, reportMovies, destinations]);
};

exports.onCreateWebpackConfig = ({ getConfig, actions, loaders }) => {
  actions.setWebpackConfig({
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'node_modules/cesium/Build/Cesium/Workers',
            to: 'Cesium/Workers'
          },
          {
            from: 'node_modules/cesium/Build/Cesium/Assets',
            to: 'Cesium/Assets'
          },
          {
            from: 'node_modules/cesium/Build/Cesium/Widgets',
            to: 'Cesium/Widgets'
          }
        ]
      }),

      new DefinePlugin({
        CESIUM_BASE_URL: JSON.stringify('/Cesium/')
      })
    ],
    optimization: {
      usedExports: true
    },
    resolve: {
      fallback: {
        https: require.resolve('https-browserify'),
        http: require.resolve('stream-http'),
        zlib: require.resolve('browserify-zlib'),
        assert: require.resolve('assert'),
        stream: require.resolve('stream-browserify'),
        url: require.resolve('url/'),
        util: require.resolve('util/')
      }
    },
    module: {
      rules: [
        {
          test: /\.gl(tf|b)$/,
          use: loaders.url()
        },
        {
          test: /\.js$/,
          enforce: 'pre',
          use: [
            {
              loader: 'strip-pragma-loader',
              options: {
                pragmas: {
                  debug: false
                }
              }
            }
          ]
        }
      ],
      unknownContextCritical: false
    }
  });
  if (getConfig().mode === 'production') {
    actions.setWebpackConfig({
      devtool: false
    });
  }
};
