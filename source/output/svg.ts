const getVectorDefinitions = (document: Document): Map<string, Element> => {
  const map = new Map<string, Element>();

  for (const definition of Array.from(document.querySelectorAll(`svg > defs > *[id!='']`))) {
    const identifier = definition.getAttribute('id');
    if (identifier) {
      map.set(identifier, definition.children.item(0));
    }
  }

  return map;
};

export const inlineVectorGraphics = (document: Document): void => {
  const definitions = getVectorDefinitions(document);

  const links = Array.from(document.querySelectorAll('svg > use'));

  for (const link of links) {
    const identifier = link.getAttribute('xlink:href');

    const matchingDefinition = definitions.get(identifier.split(/[#\/]/g).pop());
    if (matchingDefinition == null) {
      console.warn(`Cannot find matching SVG definition for ${identifier}`);
      continue;
    }

    link.parentElement.replaceChild(matchingDefinition.cloneNode(true), link);
  }
};
