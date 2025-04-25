
import { extname, basename } from 'path';

export function generateFilename(file) {
    const ext = extname(file.originalname);
    const base = basename(file.originalname, ext);
    return `${base}-${Date.now()}${ext}`;
}