const path = require('path');

exports.createPages = ({ boundActionCreators, graphql }) => {
  const { createPage } = boundActionCreators;

  return new Promise((resolve, reject) => {
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
          const path = '/alpine/' + destination + '/' + date;
          createPage({
            path,
            component: reportTemplate,
            context: {
              destination,
              date
            }
          })
        })
      })
    )
  })
};

