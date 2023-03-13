import deleteFiles from "../utils/deleteFiles";
import { format } from "date-fns";
import cleanFiles from "../utils/cleanFiles";
import { RequestHandler } from "express";
import { INoteFile } from "../types/note";
import { endOfDay, startOfDay } from "date-fns";
import { noteRepository } from "../config/data-source";
import { Note } from "../entities/Note";

//filter regex
//https://attacomsian.com/blog/mongoose-like-regex
//https://stackoverflow.com/questions/43729199/how-i-can-use-like-operator-on-mongoose
//https://dev.to/itz_giddy/how-to-query-documents-in-mongodb-that-fall-within-a-specified-date-range-using-mongoose-and-node-524a
//https://stackoverflow.com/questions/11973304/mongodb-mongoose-querying-at-a-specific-date

/*-----------------------------------------------------------
 * GET NOTES
 ------------------------------------------------------------*/
interface SearchQuery {
  page: string;
  size: string;
  toDate: string;
  fromDate: string;
  search: string;
}

/**
 * @desc - Get all notes
 * @route - GET api/notes
 * @access - Private
 *
 */

const getAllNotes: RequestHandler<
  unknown,
  unknown,
  unknown,
  SearchQuery
> = async (req, res) => {
  // Get all notes from postgres db

  //Option1: Find options with:
  //active record// Note.findOne()
  //entity manager //dataSource.manager.findOne()
  //or repo.findOne()

  //Option2: query builder with repo //can be used with with entity manager, data source or repository too

  const { _id: id } = req.user as { _id: string };

  /**----------------------------------
         * PAGINATION
  ------------------------------------*/

  //query string payload
  const page = parseInt(req.query.page) || 1; //current page no. / sent as string convert to number//page not sent use 1
  const size = parseInt(req.query.size) || 15; //items per page//if not sent from FE/ use default 15
  const searchTerm = req.query.search || "%"; // title colum in entity must be of type 'citext' to match regardless of case
  const skip = (page - 1) * size; //eg page = 5, it has already displayed 4 * 10//so skip prev items
  const { fromDate, toDate } = req.query;

  //date range
  //if from fromDate:true, fetch all records not older than fromDate || no lower limit i.e not older than midnight of January 1, 1970
  const startDate = fromDate
    ? startOfDay(new Date(fromDate))
    : new Date(0);
  const startDateFormatted = startDate.toISOString(); //only iso strings working or format as format("yyyy-MM-dd HH:mm:ss.SSS")//date-fns
  // if toDate:true, fetch all records older than toDate || no upper limit i.e current date + one day//current date now working
  const endDate = toDate
    ? endOfDay(new Date(toDate))
    : new Date();

  const endDateFormatted = endDate.toISOString(); //only iso strings working or format as format("yyyy-MM-dd HH:mm:ss.SSS")//date-fns

  //format with date-fns or use: new Date(new Date(fromDate).setHours(0o0, 0o0, 0o0)), //start searching from the very beginning of our start date eg //=> Tue Sep 02 2014 00:00:00
  //new Date(new Date(toDate).setHours(23, 59, 59)), //up to but not beyond the last minute of our endDate /eg Tue Sep 02 2014 23:59:59.999
  //or use date-fns to add start of day & end of day

  let query = noteRepository
    .createQueryBuilder("note")
    //.innerJoin("note.userInfo", "user")
    //.select(["user.id", "user.name", "photo.url"]) // added selection
    .where("note.userId = :id ", { id }) //you can also write the whole where here//not clean using AND | OR
    //If title is false, use %//below will work since title is not nullable
    .andWhere("note.title LIKE :searchTerm ", {
      searchTerm: `%${searchTerm}%`,
    })
    //if title is nullable i.e it can contain NULL, use below// % won't match NULL
    // .andWhere("coalesce(note.title, '<NULL>') LIKE :searchTerm ", {
    //   searchTerm: `%`,
    // })
    .andWhere("note.updatedAt >= :startDate", {
      startDate: startDateFormatted, //date must be a 'Date object' or iso string//i.e string
    })
    .andWhere("note.updatedAt < :endDate", {
      endDate: endDateFormatted, //date must be a string
    })
    .orderBy("note.updatedAt", "DESC")
    //or ASC
    .maxExecutionTime(8000) // terminate query running for more than 8secs
    .cache(true);
  //no duplicate record with same title/case insensitive
  // .select("DISTINCT ON (LOWER(note.title)) note.title")
  // .orderBy("LOWER(note.updatedAt)", "DESC")

  const total = await query.getCount();
  //if total = 0 //error
  if (!total) {
    return res.status(400).json({ message: "No notes found" });
  }

  const pages = Math.ceil(total / size);

  //in case invalid page is sent//out of range//not from the pages sent by earlier query in res
  if (page > pages) {
    return res.status(400).json({ message: "Page not found" });
  }

  const result = await query.skip(skip).take(size).getMany();

  res.status(200).json({
    pages,
    notes: result,
  });
};

/*-----------------------------------------------------------
 * GET NOTE
 ------------------------------------------------------------*/

/**
 * @desc - Get note
 * @route - GET api/notes/:id
 * @access - Private
 *
 */
const getNoteById: RequestHandler = async (req, res) => {
  // Get single note
  const { noteId } = req.params;

  //Option1: Find options with:
  //active record// Note.findOne()
  //entity manager //dataSource.manager.findOne()
  //or repo.findOne()

  //Option2: query builder with repo //can be used with with entity manager, data source or repository too

  const note = await noteRepository
    .createQueryBuilder("note")
    .where("note.noteId = :id", { id: noteId })
    .getOne();

  // If note not found
  if (!note) {
    return res.status(400).json({ message: "Note not found" });
  }

  res.json({
    files: note.files,
    noteId: note.noteId,
    title: note.title,
    content: note.content,
    deadline: note.deadline,
  });
};

/*-----------------------------------------------------------
 * CREATE NOTE
 ------------------------------------------------------------*/

interface CreateNoteBody {
  title?: string;
  content?: string;
  deadline?: string;
}

/**
 * @desc - Create new note
 * @route - POST api/notes
 * @access - Private
 *
 */

const createNewNote: RequestHandler<
  unknown,
  unknown,
  CreateNoteBody,
  unknown
> = async (req, res) => {
  const { title, content, deadline } = req.body;

  const { files, user } = req;

  //clean files
  const fileArr = cleanFiles(files as INoteFile[]);

  // Confirm data
  if (!title || !content || !deadline) {
    deleteFiles(fileArr); //clear failed req
    return res.status(400).json({ message: "All fields are required" });
  }

  /* 
  //------------>using entity manager-->all repo in one place--> data mapper-->access db within repo
  const note = dataSource.manager.create(User,{
    ...
   })// same as const user = new User(); user.firstName = "Timber"; user.lastName = "Saw";
   await dataSource.manager.save(note);

  //------------>using repository --> data mapper-->access db within repo
  const repository = dataSource.getRepository(Note)
const note = repository.create({
    ...
   })// same as const user = new User(); user.firstName = "Timber"; user.lastName = "Saw";
   await repository.save(note);
 
   //------------>using query builder
   dataSource
    .createQueryBuilder()
    .insert()
    .into(User)
    .values([
        { firstName: "Timber", lastName: "Saw" },
        { firstName: "Phantom", lastName: "Lancer" },
    ]) //or just values({}) for one record
    .execute()

    //------------>using active record ->access db within model
   const note = Note.create({
    ...
   })
   await note.save();

*/
  /**Can use new Note() too */

  // Create and store note
  const note = new Note();

  note.title = title;

  note.content = content;

  note.deadline = deadline;

  note.files = fileArr;

  note.userId = user!._id as string;

  //won't work: "duplicate key value violates unique constraint \
  //since you're adding the same user object multiple times//just rely on userId above to fetch user
  // note.userInfo = req.user as any;

  await noteRepository.save(note);

  if (!note) {
    deleteFiles(fileArr); //clear failed req
    return res.status(400).json({ message: "Invalid note data received" });
  }

  // Created
  return res.status(201).json({ message: "New note created" }); //201 is default
};

/*-----------------------------------------------------------
 * UPDATE NOTE
 ------------------------------------------------------------*/

interface UpdateNoteParams {
  noteId: string;
}

interface UpdateNoteBody {
  title?: string;
  content?: string;
  deadline?: string;
}

/**
 * @desc - Update a note
 * @route - PATCH /notes/:id
 * @access - Private
 *
 */
const updateNote: RequestHandler<
  UpdateNoteParams,
  unknown,
  UpdateNoteBody,
  unknown
> = async (req, res) => {
  //params are part of url, so string//convert to number/int(11) in col
  const noteId = parseInt(req.params.noteId); //NaN or number//NaN is falsy

  const { title, content, deadline } = req.body;

  const { user, files } = req;

  //noteId must be a number
  if (!noteId) {
    return res.status(400).json({ message: "Note not found" });
  }

  //console.log(req.body.removedFiles[0])

  //clean files
  const fileArr = cleanFiles(files as INoteFile[]);

  // Confirm data
  if (!title || !content || !deadline) {
    deleteFiles(fileArr); //clear failed req
    return res.status(400).json({ message: "All fields are required" });
  }

  // Confirm note exists to update
  //you can omit type for note//Ts will infer from type passed to model
  const note = await noteRepository
    .createQueryBuilder("note")
    .where("note.noteId = :id", { id: noteId })
    .getOne();

  if (!note) {
    deleteFiles(fileArr); //clear failed req
    return res.status(400).json({ message: "Note not found" });
  }
  //del prev files//if new files exist
  if (fileArr?.length) {
    deleteFiles(note.files);
  }

  note.title = title;
  note.content = content;
  note.deadline = deadline;
  fileArr?.length && (note.files = fileArr);

  const updatedNote = await note.save();

  res.json({
    files: updatedNote.files,
    noteId: updatedNote.noteId,
    title: updatedNote.title,
    content: updatedNote.content,
    deadline: updatedNote.deadline,
  });
};

/*-----------------------------------------------------------
 * DELETE NOTE
 ------------------------------------------------------------*/

/**
 * @desc - Delete a note
 * @route - DELETE /notes/:id
 * @access - Private
 *
 */
const deleteNote: RequestHandler = async (req, res) => {
  //params are part of url, so string//convert to number/int(11) in col
  const noteId = parseInt(req.params.noteId); //NaN or number//NaN is falsy

  //noteId must be a number
  if (!noteId) {
    return res.status(400).json({ message: "Note not found" });
  }

  // Confirm note exists to delete
  const note = await noteRepository
    .createQueryBuilder("note")
    .where("note.noteId = :id", { id: noteId })
    .getOne();

  if (!note) {
    return res.status(400).json({ message: "Note not found" });
  }

  deleteFiles(note.files); //del files for note

  const result = await noteRepository.remove(note);

  res.json({ message: `Note deleted` });
};

export { getAllNotes, getNoteById, createNewNote, updateNote, deleteNote };
