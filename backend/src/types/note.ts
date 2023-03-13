

export interface INoteFile {
  path: string;
  filename: string;
  mimetype: string;
  size: number;
  destination?: string;
}

//document interface//extending doc adds active record methods for modifying the document
export interface INote {
  user: string;
  title: string;
  content: string | undefined;
  deadline: Date;
  files: string; //json string with "INoteFile[]"
  noteId: number;
}
