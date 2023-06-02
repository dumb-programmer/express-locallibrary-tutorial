const BookInstance = require("../models/bookInstance");
const Book = require("../models/book");

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");


// Display list of all BookInstances.
exports.bookinstance_list = asyncHandler(async (req, res, next) => {
    const allBookInstances = await BookInstance.find().populate("book").exec();

    res.render("bookInstance_list", {
        title: "Book Instance List",
        bookinstance_list: allBookInstances,
    });

});

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
    const bookInstance = await BookInstance.findById(req.params.id)
        .populate("book")
        .exec();

    if (bookInstance === null) {
        // No results.
        const err = new Error("Book copy not found");
        err.status = 404;
        return next(err);
    }

    res.render("bookInstance_detail", {
        title: "Book:",
        bookinstance: bookInstance,
    });

});

// Display BookInstance create form on GET.
exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
    const allBooks = await Book.find({}, "title").exec();

    res.render("bookInstance_form", {
        title: "Create BookInstance",
        book_list: allBooks,
    });

});

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
    // Validate and sanitize fields.
    body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
    body("imprint", "Imprint must be specified")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("status").escape(),
    body("due_back", "Invalid date")
        .optional({ values: "falsy" })
        .isISO8601()
        .toDate(),

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        const bookInstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
        });

        if (!errors.isEmpty()) {
            // There are errors.
            // Render form again with sanitized values and error messages.
            const allBooks = await Book.find({}, "title").exec();

            res.render("bookInstance_form", {
                title: "Create BookInstance",
                book_list: allBooks,
                selected_book: bookInstance.book._id,
                errors: errors.array(),
                bookinstance: bookInstance,
            });
            // return;
        } else {
            // Data from form is valid
            await bookInstance.save();
            res.redirect(bookInstance.url);
        }
    }),
];


// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
    const bookInstance = await BookInstance.findById(req.params.id);
    if (bookInstance === null) {
        res.redirect("/catalog/bookinstances");
    }
    else {
        res.render("bookInstance_delete", {
            title: "Delete Book Instance",
            bookInstance
        });
    }
});

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
    const bookInstance = await BookInstance.findById(req.params.id);
    if (bookInstance === null) {
        res.redirect("/catalog/bookinstances");
    }
    else {
        await BookInstance.findByIdAndDelete(req.body.bookInstanceId);
        res.redirect("/catalog/bookinstances");
    }
});

// Display BookInstance update form on GET.
exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
    const bookinstance = await BookInstance.findById(req.params.id);
    const book_list = await Book.find();
    if (bookinstance === null) {
        res.redirect("/catalog/bookinstances");
    }
    else {
        res.render("bookInstance_form", {
            title: "Update Book Instance",
            bookinstance,
            book_list
        })
    }
});

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
    // Validate and sanitize fields.
    body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
    body("imprint", "Imprint must be specified")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("status").escape(),
    body("due_back", "Invalid date")
        .optional({ values: "falsy" })
        .isISO8601()
        .toDate(),

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        const bookInstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
            _id: req.params.id,
        });

        if (!errors.isEmpty()) {
            // There are errors.
            // Render form again with sanitized values and error messages.
            const allBooks = await Book.find({}, "title").exec();

            res.render("bookInstance_form", {
                title: "Create BookInstance",
                book_list: allBooks,
                selected_book: bookInstance.book._id,
                errors: errors.array(),
                bookinstance: bookInstance,
            });
        } else {
            // Data from form is valid
            await BookInstance.findByIdAndUpdate(req.params.id, bookInstance, {});
            res.redirect(bookInstance.url);
        }
    }),
];