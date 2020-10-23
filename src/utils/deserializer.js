export default string => {
  // Return a value array of children derived by splitting the string.
  return string.split("\n").map(line => {
    return {
      children: [{ text: line }]
    };
  });
};
