import { INoteFile } from "../types/note";


/**
 * 
 * @param files - Raw File[]: req.files
 * @returns  - Clean File[]
 */
const cleanFiles = (files: INoteFile[]) => {
  return files?.map((file) => ({
    path: `${file.destination}/${file.filename}`,
    filename: file.filename,
    mimetype: file.mimetype,
    size: file.size,
  }));
};

export default cleanFiles;
