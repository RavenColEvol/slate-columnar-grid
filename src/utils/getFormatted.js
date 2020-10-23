export default editorValue => {
  const children = [];
  for (let block of editorValue) {
    let block_children = block["children"];
    let instance = [];
    for (let child of block_children) {
      let entries = [];
      for (let [key, value] of Object.entries(child)) {
        if (key === "text") {
          entries.push(value);
        } else entries.push([key[0]]);
      }
      instance.push(entries);
    }

    children.push({
      type: block["type"],
      data: instance
    });
  }

  const editor = [
    {
      type: "docs",
      children
    }
  ];

  return editor;
};
