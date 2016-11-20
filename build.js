var items = require('./src/menuitems.json');
var exec = require('child_process').exec;

var fragments = ['src/pages/404.html'];
items.forEach(function(item) {
  if (item.subs) {
    item.subs.forEach(function(subItem) {
      fragments.push('src/pages/' + item.name + '/' + subItem.name + '.html');
    });
  } else {
    fragments.push('src/pages/' + item.name + '.html');
  }
});
var fragmentsString = '--fragment ' + fragments.join(' --fragment ');

exec(
  'polymer build ' + fragmentsString,
  function(error, stdout, stderr) {
    error && console.log(error);
    stdout && console.log(stdout);
    stderr && console.log(stderr);
  }
);