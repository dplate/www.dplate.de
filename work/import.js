const request = require('request');
const fs = require('fs');
const jsonfile = require('jsonfile');

function extractTitleAndDate(body) {
  const match = body.match(/"first">.*>(.*) - (.*)\.(.*)\.(.*)<\/a>/);
  if (match && match.length == 5) {
    return {
      title: match[1],
      day: match[2].length==1 ? '0' + match[2] : match[2],
      month: match[3].length==1 ? '0' + match[3] : match[3],
      year: match[4]
    };
  } else {
    throw 'Title and/or date could not be extracted from body';
  }
}

function extractParagraphs(body) {
  const match = body.match(/"content">([\s\S]*?)<\/div/);
  if (match && match.length == 2) {
    return match[1].split('<br /><br />');
  } else {
    throw 'Paragraphs could not be extracted from body';
  }
}

function replaceAll(text, find, replace) {
  return text.split(find).join(replace);
}

function cleanParagraph(text) {
  text = replaceAll(text, '<img src="./images/smilies/icon_wink.gif" alt=";)" title="Wink" />', '😉');
  text = replaceAll(text, '<img src="./images/smilies/icon_smile.gif" alt=":)" title="Smile" />', '😃');
  text = replaceAll(text, '<img src="./images/smilies/icon_sad.gif" alt=":(" title="Sad" />', '😞');
  text = replaceAll(text, '<br />', '<br />\n');
  text = replaceAll(text, ' alt="Bild"', '');
  return text;
}

function createPage(destination, title, day, month, year, introduction, paragraphs) {
  const cards = paragraphs.map(function(paragraph) {
    const className = (paragraph.indexOf('<img') === -1) ? 'card' : 'card pictureCard';
    return '<div class="' + className + '">\n' + paragraph + '\n</div>';
  });
  let page = fs.readFileSync('./work/alpine.template.html', 'utf8');
  page = replaceAll(page, '{{destination}}', destination);
  page = replaceAll(page, '{{title}}', title);
  page = replaceAll(page, '{{day}}', day);
  page = replaceAll(page, '{{month}}', month);
  page = replaceAll(page, '{{year}}', year);
  page = replaceAll(page, '{{introduction}}', introduction);
  page = replaceAll(page, '{{cards}}', cards.join('\n'));
  return page;
}

function savePage(overwrite, destination, day, month, year, page) {
  const basePath = './src/pages/alpine';
  const path = basePath + '/' + destination;
  const file = path + '/' + year + month + day + '.html';

  try {
    fs.mkdirSync(path);
  } catch(e) {
    if ( e.code != 'EEXIST' ) throw e;
  }
  fs.writeFileSync(file, page, {flag: overwrite ? "w" : "wx"});
}

function addPageToItems(destination, day, month, year, title) {
  const itemsFile = './src/items.json';
  const items = jsonfile.readFileSync(itemsFile);
  const alpineItem = items.find(function(item) { return item.name === 'alpine'});
  let destinationItem = alpineItem.subs.find(function(item) { return item.name === destination});
  if (!destinationItem) {
    destinationItem = {
      name: destination,
      label: title,
      subs: []
    };
    alpineItem.subs.push(destinationItem);
    alpineItem.subs = alpineItem.subs.sort(function(item1, item2) { return (item1.label < item2.label ? -1 : 1) });
  }
  const pageName = year + month + day;
  let pageItem = destinationItem.subs.find(function(item) { return item.name === pageName});
  if (!pageItem) {
    pageItem = {
      name: pageName,
      label: day + '.' + month + '.' + year,
      subLabel: title
    };
    destinationItem.subs.push(pageItem);
    destinationItem.subs = destinationItem.subs.sort(function(item1, item2) { return (item1.name > item2.name ? -1 : 1) });
  }
  jsonfile.writeFileSync(itemsFile, items, {spaces: 2});
}

function addPageToPages(destination, day, month, year) {
  const date = year + month + day;
  const pagesFile = './src/pages.html';
  let pages = fs.readFileSync(pagesFile, 'utf8');
  const pageTag = '<my-page-alpine-' + destination + '-' + date + ' name="/alpine/' + destination + '/' + date + '">' +
    '</my-page-alpine-' + destination + '-' + date + '>';
  if (pages.indexOf(pageTag) === -1) {
    pages = pages.replace('</iron-pages>', '  ' + pageTag + '\n    </iron-pages>');
    fs.writeFileSync(pagesFile, pages);
  }
}

function addPageToSitemap(destination, day, month, year) {
  const sitemapFile = './sitemap.txt';
  let sitemap = fs.readFileSync(sitemapFile, 'utf8');
  const url = 'http://www.dplate.de/alpine/' + destination + '/' + year + month + day;
  if (sitemap.indexOf(url) === -1) {
    sitemap = sitemap + '\n' + url;
    fs.writeFileSync(sitemapFile, sitemap);
  }
}

function addPageToFragments(destination, day, month, year) {
  const polymerFile = './polymer.json';
  const polymer = jsonfile.readFileSync(polymerFile);
  const fragments = polymer.fragments;
  const fragment = 'src/pages/alpine/' + destination + '/' + year + month + day + '.html';
  if (!fragments.includes(fragment)) {
    fragments.push(fragment);
    jsonfile.writeFileSync(polymerFile, polymer, {spaces: 2});
  }
}

if (process.argv.length < 4) {
  throw 'Missing required parameters. url and destination are required.';
}
const url = process.argv[2];
const destination = process.argv[3];
const overwrite = (process.argv[4] === 'overwrite');

request(url, function(error, response, body) {
  if (error) {
    throw error;
  }
  const { title, day, month, year } = extractTitleAndDate(body);
  const paragraphs = extractParagraphs(body).map(cleanParagraph);
  const introduction = paragraphs.shift();

  const page = createPage(destination, title, day, month, year, introduction, paragraphs);
  savePage(overwrite, destination, day, month, year, page);
  addPageToItems(destination, day, month, year, title);
  addPageToPages(destination, day, month, year);
  addPageToSitemap(destination, day, month, year);
  addPageToFragments(destination, day, month, year);
});