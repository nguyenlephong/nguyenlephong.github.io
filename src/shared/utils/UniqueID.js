/**
 * generateID
 * @returns {string}
 */
export const generateID = () => {
  return ((new Date().getTime()).toString(36)) + '_' + (Date.now() + Math.random().toString()).split('.')[1];
}

/**
 * uuid
 * @returns {string}
 */
export const uuid = () => {
  return ((new Date().getTime()).toString(36)) + '_' + (Date.now() + Math.random().toString()).split('.').join("_");
}

/**
 * uuidByte
 * @returns {string}
 */
export const uuidByte = () => {
  // I generate the UID from two parts here
  // to ensure the random number provide enough bits.
  let firstPart = (Math.random() * 46656) | 0;
  let secondPart = (Math.random() * 46656) | 0;
  firstPart = ("000" + firstPart.toString(36)).slice(-3);
  secondPart = ("000" + secondPart.toString(36)).slice(-3);
  return firstPart + secondPart;
}