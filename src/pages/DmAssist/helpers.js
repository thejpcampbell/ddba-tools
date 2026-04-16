export function parseLayerContent(text) {
  const l1 = text.match(/##\s*Layer 1[^#\n]*([\s\S]*?)(?=##\s*Layer 2|$)/i);
  const l2 = text.match(/##\s*Layer 2[^#\n]*([\s\S]*?)(?=##\s*Layer 3|$)/i);
  const l3 = text.match(/##\s*Layer 3[^#\n]*([\s\S]*?)$/i);
  if (l1 || l2 || l3) {
    return {
      structured: true,
      layer1: l1 ? l1[1].trim() : null,
      layer2: l2 ? l2[1].trim() : null,
      layer3: l3 ? l3[1].trim() : null,
    };
  }
  return { structured: false, raw: text };
}

export function stripMarkdown(text) {
  return text.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1").replace(/#{1,6}\s/g, "").trim();
}
