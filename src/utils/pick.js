/**
 * Create an object composed of the picked object properties
 * @param {Object} object
 * @param {string[]} keys
 * @returns {Object}
 */
const pick = (object, keys) => {
  return keys.reduce((obj, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      // eslint-disable-next-line no-param-reassign
      obj[key] = object[key];
    }
    return obj;
  }, {});
};

export default pick;



/**
//  * Create an object composed of the picked object properties
//  * @param {Object} object
//  * @param {string[]} keys
//  * @returns {Object}
//  */
// const pick = (object: Record<string, any>, keys: string[]): Record<string, any> => {
//   return keys.reduce((obj, key) => {
//     if (object && Object.prototype.hasOwnProperty.call(object, key)) {
//       // eslint-disable-next-line no-param-reassign
//       obj[key] = object[key];
//     }
//     return obj;
//   }, {} as Record<string, any>);
// };

// export default pick;


// const pick = (object: Record<string, any>, keys: string[]): Record<string, any> => {
//   return keys.reduce((obj, key) => {
//     if (object && Object.prototype.hasOwnProperty.call(object, key)) {
//       // eslint-disable-next-line no-param-reassign
//       obj[key] = object[key];
//     }
//     return obj;
//   }, {} as Record<string, any>);
// };

// export default pick;


// /**
//  * Create an object composed of the picked object properties
//  * @param {Object} object
//  * @param {string[]} keys
//  * @returns {Object}
//  */
// const pick = (object: Record<string, any>, keys: string[]): Record<string, any> => {
//   return keys.reduce((obj, key) => {
//     if (object && Object.prototype.hasOwnProperty.call(object, key)) {
//       // eslint-disable-next-line no-param-reassign
//       obj[key] = object[key];
//     }
//     return obj;
//   }, {});
// };

// export default pick;
