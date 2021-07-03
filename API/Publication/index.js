const Router = require("express").Router();

const PublicationModel = require("../../database/publication");
const BookModel = require("../../database/book");

/*
Route           /get
Description     to get publications based on books
Access          PUBLIC
Parameters      isbn
Method          GET
*/
Router.get("/get/:isbn", async (req, res) => {
  const getSpecificPub = await BookModel.findOne({
    author: req.params.isbn,
  });

  if (!getSpecificPub) {
    return res.json({
      error: `No publications found for the book of id ${req.params.author}`,
    });
  }

  return res.json({ books: getSpecificBooks });
});

/*
Route           /update/book
Description     update/add new book to a publication
Access          PUBLIC
Parameters      isbn
Method          PUT
*/
Router.put("/update/book/:isbn", (req, res) => {
  // update the publication database
  database.publications.forEach((publication) => {
    if (publication.id === req.body.pubId) {
      return publication.books.push(req.params.isbn);
    }
  });

  // update the book database
  database.books.forEach((book) => {
    if (book.ISBN === req.params.isbn) {
      book.publication = req.body.pubId;
      return;
    }
  });

  return res.json({
    books: database.books,
    publications: database.publications,
    message: "Successfully updated publication",
  });
});

/*
Route           /delete/book
Description     delete a book from publication 
Access          PUBLIC
Parameters      isbn, publication id
Method          DELETE
*/
// Router.delete("/delete/book/:isbn/:pubId", (req, res) => {
//   // update publication database
//   database.publications.forEach((publication) => {
//     if (publication.id === parseInt(req.params.pubId)) {
//       const newBooksList = publication.books.filter(
//         (book) => book !== req.params.isbn
//       );

//       publication.books = newBooksList;
//       return;
//     }
//   });

// update book database
//   database.books.forEach((book) => {
//     if (book.ISBN === req.params.isbn) {
//       book.publication = 0; // no publication available
//       return;
//     }
//   });

//   return res.json({
//     books: database.books,
//     publications: database.publications,
//   });
// });

/*
Route           /
Description     get all publications
Access          PUBLIC
Parameters      NONE
Method          GET
*/
Router.get("/", async (req, res) => {
  const getAllPublications = await PublicationModel.find();
  return res.json({ publications: getAllPublications });
});

/*
Route           /new
Description     add new Publication
Access          PUBLIC
Parameters      NONE
Method          POST
*/
Router.post("/new", async (req, res) => {
  const { newPublication } = req.body;

  PublicationModel.create(newPublication);

  return res.json({ message: "Publication was added!" });
});

/*
Route           /get/id
Description     get specific publications based on id
Access          PUBLIC
Parameters      id
Method          GET
*/
Router.get("/get/id/:id", async (req, res) => {
  const pubId = parseInt(req.params.id);
  const publication = await PublicationModel.findOne({ id: pubId });
  return res.json({ publication: publication });
});

/*
Route           /get/book
Description     get list of publications based on a book ISBN
Access          PUBLIC
Parameters      ISBN
Method          GET
*/
Router.get("/get/book/:isbn", async (req, res) => {
  const getPub = await PublicationModel.find({
    books: req.params.isbn,
  });

  if (!getPub) {
    return res.json({
      error: `No publications found for the isbn of  =>  ${req.params.isbn}`,
    });
  }

  return res.json({ books: getPub });
});

module.exports = Router;
