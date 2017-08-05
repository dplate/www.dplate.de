const render = (element) => {
  element.innerHTML = 'Test';
};

window.addEventListener('DOMContentLoaded', () => {
  render(document.getElementsByTagName('body')[0]);
}, false);