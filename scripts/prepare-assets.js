// Optional macOS-only regeneration: TMPDIR="$PWD/.cache/pdf-review" osascript -l JavaScript scripts/prepare-assets.js
// Native PDFKit/AppKit only. Originals are read, never modified. Output stays in the workspace.
ObjC.import('PDFKit');
ObjC.import('AppKit');
const base = $.NSFileManager.defaultManager.currentDirectoryPath;
function savePreview(image, name, maxWidth) {
  const size = image.size;
  const width = Math.min(Number(size.width), maxWidth);
  const height = Math.round(width * Number(size.height) / Number(size.width));
  const canvas = $.NSImage.alloc.initWithSize($.NSMakeSize(width, height));
  canvas.lockFocus;
  $.NSColor.whiteColor.set;
  $.NSRectFill($.NSMakeRect(0, 0, width, height));
  image.drawInRectFromRectOperationFraction($.NSMakeRect(0, 0, width, height), $.NSZeroRect, 2, 1);
  canvas.unlockFocus;
  const rep = $.NSBitmapImageRep.imageRepWithData(canvas.TIFFRepresentation);
  const data = rep.representationUsingTypeProperties(3, $({NSImageCompressionFactor:0.84}));
  // Non-atomic output avoids Foundation's system temporary directory.
  if (!data.writeToFileAtomically(base.stringByAppendingPathComponent('public/assets/selected/' + name + '.jpg'), false)) throw new Error('Could not write ' + name);
  return name + ': ' + width + '×' + height;
}
const result = [];
['utas-research-assistant.png','cyberquiz-pro.png','threatbrief-presentation.jpg','hackathon-first-prize.jpg','iiuc-speaking.jpg'].forEach(file => {
  const image = $.NSImage.alloc.initWithContentsOfFile(base.stringByAppendingPathComponent('public/assets/' + file));
  result.push(savePreview(image, file.replace(/\.(png|jpg)$/, ''), 1400));
});
[['hospital-analytics',7],['pharma-analytics',1]].forEach(item => {
  const doc = $.PDFDocument.alloc.initWithURL($.NSURL.fileURLWithPath(base.stringByAppendingPathComponent('public/assets/' + item[0] + '.pdf')));
  const image = doc.pageAtIndex(item[1]).thumbnailOfSizeForBox($.NSMakeSize(1400,1000),0);
  result.push(savePreview(image,item[0],1400));
});
JSON.stringify(result);
