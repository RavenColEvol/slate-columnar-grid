import { Node, Text, Element, Editor } from "slate";

const MARK_TYPES = {
  bold: '"b"',
  italic: '"i"',
  underline: '"u"',
  code: '"c"'
};

const serializer = node => {
  if (Text.isText(node)) {
    let style = [];
    for (let [key, value] of Object.entries(node)) {
      if (key !== "text") {
        style.push(MARK_TYPES[key]);
      }
    }
    let leaf = "";
    if (style.length > 0) {
      leaf = `["${node["text"]}", [${style.join(",")}]],`;
    } else {
      leaf = `["${node["text"]}"],`;
    }
    return leaf;
  }

  let children = "";
  if (node["children"]) {
    children = node["children"].map(n => serializer(n)).join("");
  } else {
    children = node.map(n => serializer(n));
  }

  switch (node.type) {
    case "docs":
      return `{
        "type": "${node.type}",
        "children": [
            ${children}
        ]
      }`;
    case "rich-text":
    case "paragraph":
    case "block-quote":
    case "bulleted-list":
    case "heading-one":
    case "heading-two":
    case "list-item":
    case "numbered-list":
      let data = [];
      data.push(children);
      return `{
        "type": "${node.type}",
        "data": [${data}]
      },`;
    default:
      return children;
  }
};

export default serializer;
