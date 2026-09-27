// Optional macOS regeneration: osascript -l JavaScript scripts/prepare-brand.js
// Crop and resize only; original pixels/artwork and source file are not edited.
ObjC.import('AppKit');
const root = $.NSFileManager.defaultManager.currentDirectoryPath;
const source = $.NSImage.alloc.initWithContentsOfFile(root.stringByAppendingPathComponent('public/assets/hosna-brand-mark.png'));
// Source: 1254×1254. Crop x=160, y=384 from top, width=960, height=480.
// AppKit source coordinates start at the bottom; output is a 2× navbar asset.
const output = $.NSImage.alloc.initWithSize($.NSMakeSize(256,128));
output.lockFocus;
source.drawInRectFromRectOperationFraction($.NSMakeRect(0,0,256,128),$.NSMakeRect(160,390,960,480),2,1);
output.unlockFocus;
const bitmap = $.NSBitmapImageRep.imageRepWithData(output.TIFFRepresentation);
const png = bitmap.representationUsingTypeProperties(4,$({}));
if (!png.writeToFileAtomically(root.stringByAppendingPathComponent('public/assets/hosna-brand-mark-cropped.png'),false)) throw new Error('Could not write brand crop');
