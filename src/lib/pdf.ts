export async function extractPDFText(file: File) {
  // dynamic require prevents bundling issues
  const pdf = require("pdf-parse");

  const buffer = Buffer.from(await file.arrayBuffer());

  const data = await pdf(buffer);

  return data.text;
}