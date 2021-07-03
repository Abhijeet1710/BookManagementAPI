const Router = require("express").Router();

// Database Models
const BookModel = require("../../database/book");

/*
Route           /
Description     get all books
Access          PUBLIC
Parameters      NONE
Method          GET
*/
Router.get("/", async (req, res) => {
  const getAllBooks = await BookModel.find();
  return res.json(getAllBooks);
});

/*
  Route           /get
  Description     get specific book based on ISBN
  Access          PUBLIC
  Parameters      isbn
  Method          GET
*/
Router.get("/get/:isbn", async (req, res) => {
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
  Route           /get
  Description     get specific books based on a category
  Access          PUBLIC
  Parameters      category
  Method          GET
  */
Router.get("/get/:category", async (req, res) => {
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
  Route           /new
  Description     add new books
  Access          PUBLIC
  Parameters      NONE
  Method          POST
  */
Router.post("/new", async (req, res) => {
  const { newBook } = req.body;

  BookModel.create(newBook);

  return res.json({ message: "book was added!" });
});

/*
  Route           /update
  Description     update title of a book
  Access          PUBLIC
  Parameters      isbn// Router.get("/", async (req, res) => {
  Method          PUT
  */
Router.put("/update/:isbn", async (req, res) => {
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
  Route           /update/author
  Description     add/update books author
  Access          PUBLIC
  Parameters      isbn
  Method          PUT
  */
Router.put("/update/author/:isbn", async (req, res) => {
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
  Route           /delete
  Description     delete a book
  Access          PUBLIC
  Parameters      isbn
  Method          DELETE
  */
Router.delete("/delete/:isbn", async (req, res) => {
  const deletedBook = await BookModel.findOneAndDelete({
    ISBN: req.params.isbn,
  });

  return res.json({ message: deletedBook });
});

/*
  Route           /delete/author
  Description     delete a author from a book
  Access          PUBLIC
  Parameters      isbn, author id
  Method          DELETE
  */
Router.delete("/delete/author/:isbn/:authorId", async (req, res) => {
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

/*
Route           /get
Description     to get a list of books based on author
Access          PUBLIC
Parameters      author Id
Method          DELETE
*/
Router.get("/get/:author", async (req, res) => {
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

module.exports = Router;
