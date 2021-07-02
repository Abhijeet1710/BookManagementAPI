// Environment Variables
// Injected into the code at run time to acheive security.
//Don't upload .env file on github or any online platform so add .env into .gitignore
// New Comment
require("dotenv").config();

//Mongoose Database
const mongoose = require("mongoose");

// Frame work
const express = require("express");

// Database
const database = require("./database/index");

// Models
const BookModel = require("./database/book");
const AuthorModel = require("./database/author");
const PublicationModel = require("./database/publication");

// Initializing express
const shapeAI = express();

// Configurations
shapeAI.use(express.json());

// Mongoos Connection
mongoose
  .connect(process.env.DATABASE_C0_BOOKY_BOOKS, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => console.log("Connection established"));
// _____________________BOOKS____________________________________
/*
Route           /
Description     get all books
Access          PUBLIC
Parameters      NONE
Method          GET
*/
shapeAI.get("/", async (req, res) => {
  const getAllBooks = await BookModel.find();
  return res.json(getAllBooks);
});

/*
Route           /is
Description     get specific book based on ISBN
Access          PUBLIC
Parameters      isbn
Method          GET
*/
shapeAI.get("/is/:isbn", async (req, res) => {
  const getSpecificBook = await BookModel.findOne({ ISBN: req.params.isbn });
  // value -> true

  if (!getSpecificBook) {
    return res.json({
      error: `No book found for the ISBN of ${req.params.isbn}`,
    });
  }

  return res.json({ book: getSpecificBook });
});

/*
Route           /c
Description     get specific books based on a category
Access          PUBLIC
Parameters      category
Method          GET
*/
shapeAI.get("/c/:category", async (req, res) => {
  const getSpecificBooks = await BookModel.findOne({
    category: req.params.category,
  });

  if (!getSpecificBooks) {
    return res.json({
      error: `No book found for the category of ${req.params.category}`,
    });
  }

  return res.json({ books: getSpecificBooks });
});

/*
Route           /book/new
Description     add new books
Access          PUBLIC
Parameters      NONE
Method          POST
*/
shapeAI.post("/book/new", async (req, res) => {
  const { newBook } = req.body;

  BookModel.create(newBook);

  return res.json({ message: "book was added!" });
});

/*
Route           /book/update
Description     update title of a book
Access          PUBLIC
Parameters      isbn// shapeAI.get("/", async (req, res) => {
Method          PUT
*/
shapeAI.put("/book/update/:isbn", async (req, res) => {
  const updatedBook = await BookModel.findOneAndUpdate(
    {
      ISBN: req.params.isbn,
    },
    {
      title: req.body.bookTitle,
    },
    {
      new: true,
    }
  );
  return res.json({ book: updatedBook });
});

/*
Route           /book/author/update
Description     add/update books author
Access          PUBLIC
Parameters      isbn
Method          PUT
*/
shapeAI.put("/book/author/update/:isbn", async (req, res) => {
  const updatedBook = await BookModel.findOneAndUpdate(
    {
      ISBN: req.params.isbn,
    },
    {
      $addToSet: {
        authors: req.body.newAuthor.id,
      },
    },
    {
      new: true,
    }
  );

  const updatedAuthor = await AuthorModel.findOneAndUpdate(
    {
      id: req.body.newAuthor.id,
    },
    {
      $addToSet: {
        books: req.params.isbn,
      },
    },
    {
      new: true,
    }
  );
  return res.json({ books: updatedBook, authors: updatedAuthor });
});

/*
Route           /book/delete
Description     delete a book
Access          PUBLIC
Parameters      isbn
Method          DELETE
*/
shapeAI.delete("/book/delete/:isbn", async (req, res) => {
  const deletedBook = await BookModel.findOneAndDelete({
    ISBN: req.params.isbn,
  });

  return res.json({ message: deletedBook });
});

/*
Route           /book/delete/author
Description     delete a author from a book
Access          PUBLIC
Parameters      isbn, author id
Method          DELETE
*/
shapeAI.delete("/book/delete/author/:isbn/:authorId", async (req, res) => {
  const updatedBook = await BookModel.findOneAndUpdate(
    {
      ISBN: req.params.isbn,
    },
    {
      $pull: {
        authors: req.params.authorId,
      },
    },
    {
      new: true,
    }
  );

  const updatedAuthor = await AuthorModel.findOneAndUpdate(
    {
      id: req.params.authorId,
    },
    {
      $pull: {
        books: req.params.isbn,
      },
    },
    {
      new: true,
    }
  );

  return res.json({
    message: "Success",
    newBook: updatedBook,
    newAuthor: updatedAuthor,
  });
});

// _____________________PUBLICATIONS____________________________________

/*
Route           /publications
Description     to get publications based on books
Access          PUBLIC
Parameters      isbn
Method          GET
*/
shapeAI.get("/publications/:isbn", async (req, res) => {
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
Route           /publication/update/book
Description     update/add new book to a publication
Access          PUBLIC
Parameters      isbn
Method          PUT
*/
shapeAI.put("/publication/update/book/:isbn", (req, res) => {
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
Route           /publication/delete/book
Description     delete a book from publication 
Access          PUBLIC
Parameters      isbn, publication id
Method          DELETE
*/
shapeAI.delete("/publication/delete/book/:isbn/:pubId", (req, res) => {
  // update publication database
  database.publications.forEach((publication) => {
    if (publication.id === parseInt(req.params.pubId)) {
      const newBooksList = publication.books.filter(
        (book) => book !== req.params.isbn
      );

      publication.books = newBooksList;
      return;
    }
  });

  // update book database
  database.books.forEach((book) => {
    if (book.ISBN === req.params.isbn) {
      book.publication = 0; // no publication available
      return;
    }
  });

  return res.json({
    books: database.books,
    publications: database.publications,
  });
});

// _____________________AUTHORS____________________________________

/*
Route           /author
Description     get all authors
Access          PUBLIC
Parameters      NONE
Method          GET
*/
shapeAI.get("/author", async (req, res) => {
  const getAllAuthors = await AuthorModel.find();
  return res.json({ authors: getAllAuthors });
});

/*
Route           /author/new
Description     add new author
Access          PUBLIC
Parameters      NONE
Method          POST
*/
shapeAI.post("/author/new", (req, res) => {
  const { newAuthor } = req.body;

  AuthorModel.create(newAuthor);

  return res.json({ message: "author was added!" });
});

/*
Route           /book/author/update
Description     update/add new author
Access          PUBLIC
Parameters      isbn
Method          PUT
*/
shapeAI.put("/book/author/update/:isbn", (req, res) => {
  // update the book database
  database.books.forEach((book) => {
    if (book.ISBN === req.params.isbn)
      return book.authors.push(req.body.newAuthor);
  });

  // update the author database
  database.authors.forEach((author) => {
    if (author.id === req.body.newAuthor)
      return author.books.push(req.params.isbn);
  });

  return res.json({
    books: database.books,
    authors: database.authors,
    message: "New author was added 🚀",
  });
});

// TASKS

/*
Route           /a
Description     to get a list of books based on author
Access          PUBLIC
Parameters      author Id
Method          DELETE
*/
shapeAI.get("/a/:author", async (req, res) => {
  const getSpecificBooks = await BookModel.findOne({
    category: req.params.author,
  });

  if (!getSpecificBooks) {
    return res.json({
      error: `No book found for the author of ${req.params.author}`,
    });
  }

  return res.json({ books: getSpecificBooks });
});

/*
Route           /authorId
Description     get specific author based on author id
Access          PUBLIC
Parameters      id
Method          GET
*/
shapeAI.get("/authorId/:id", async (req, res) => {
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
Route           /author
Description     get a list of authors based on a book's ISBN
Access          PUBLIC
Parameters      isbn
Method          GET
*/
shapeAI.get("/author/:isbn", (req, res) => {
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

/*
Route           /publications
Description     get all publications
Access          PUBLIC
Parameters      NONE
Method          GET
*/
shapeAI.get("/publications", async (req, res) => {
  const getAllPublications = await PublicationModel.find();
  return res.json({ publications: getAllPublications });
});

/*
Route           /publication/new
Description     add new Publication
Access          PUBLIC
Parameters      NONE
Method          POST
*/
shapeAI.post("/publication/new", async (req, res) => {
  const { newPublication } = req.body;

  PublicationModel.create(newPublication);

  return res.json({ message: "Publication was added!" });
});

/*
Route           /publication
Description     get specific publications based on id
Access          PUBLIC
Parameters      id
Method          GET
*/
shapeAI.get("/publication/:id", async (req, res) => {
  const pubId = parseInt(req.params.id);
  const publication = await PublicationModel.findOne({ id: pubId });
  return res.json({ publication: publication });
});

/*
Route           /publications
Description     get list of publications based on a book ISBN
Access          PUBLIC
Parameters      ISBN
Method          GET
*/
shapeAI.get("/publicationsBasedOn/:isbn", async (req, res) => {
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

shapeAI.listen(3000, () => console.log("Server running!!"));
