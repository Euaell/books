// TODO: accept files and convert to base64

import { Request } from 'express';
import { UploadedFile } from 'express-fileupload';

export const uploadFile = (req: Request) => {
    const files = req.files as UploadedFile;
    const file = files.file;
    const base64 = file.data.toString('base64');
    return base64;
}