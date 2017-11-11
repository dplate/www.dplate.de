export default (date) => {
  return date.substring(7, 9) + '.' + date.substring(5, 7) + '.' + date.substring(1, 5);
}