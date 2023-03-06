/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  let pathToObj;

  pathToObj = path.split('.');

  return function funcGetter(obj) {
    if (!(Object.keys(obj).length === 0 && obj.constructor === Object)) {
      return pathToObj.reduce((acc, item) => acc[item], obj);
    }
  };
}
