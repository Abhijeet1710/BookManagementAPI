const Router = require("express").Router();

const AuthorModel = require("../../database/author");

/*
Route           /
Description     get all authors
Access          PUBLIC
Parameters      NONE
Method          GET
*/
Router.get("/", async (req, res) => {
  const getAllAuthors = await AuthorModel.find();
  return res.json({ authors: getAllAuthors });
});

/*
  Route           /new
  Description     add new author
  Access          PUBLIC
  Parameters      NONE
  Method          POST
  */
Router.post("/new", (req, res) => {
  const { newAuthor } = req.body;

  AuthorModel.create(newAuthor);

  return res.json({ message: "author was added!" });
});

/*
Route           /get/
Description     get specific author based on author id
Access          PUBLIC
Parameters      id
Method          GET
*/
Router.get("/get/:id", async (req, res) => {
  const intId = parseInt(req.params.id);
  const getSpecificAuthor = await AuthorModel.findOne({
    id: intId,
  });
  // value -> true

  if (!getSpecificAuthor) {
    return res.json({
      error: `No author found for the id of ${req.params.id}`,
    });
  }

  return res.json({ author: getSpecificAuthor });
});

/*
Route           /get
Description     get a list of authors based on a book's ISBN
Access          PUBLIC
Parameters      isbn
Method          GET
*/
Router.get("/get/:isbn", (req, res) => {
  const getSpecificAuthors = database.authors.filter((author) =>
    author.books.includes(req.params.isbn)
  );

  if (getSpecificAuthors.length === 0) {
    return res.json({
      error: `No author found for the book ${req.params.isbn}`,
    });
  }

  return res.json({ authors: getSpecificAuthors });
});

module.exports = Router;
