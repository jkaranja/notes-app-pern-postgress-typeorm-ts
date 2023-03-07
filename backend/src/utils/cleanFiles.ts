import { INoteFile } from "../models/noteModel";

const cleanFiles = (files: INoteFile[]) => {
  return files?.map((file) => ({
    path: `${file.destination}/${file.filename}`,
    filename: file.filename,
    mimetype: file.mimetype,
    size: file.size,
  }));
};

export default cleanFiles;
