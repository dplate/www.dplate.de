const path = require('path');

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
  return Promise.all([reports, destinations]);
};

