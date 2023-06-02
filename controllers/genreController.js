const Genre = require("../models/genre");
const Book = require("../models/book");

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all Genre.
exports.genre_list = asyncHandler(async (req, res, next) => {
    const genre_list = await Genre.find({}).sort({ name: 1 }).exec();
    res.render("genre_list", {
        title: "Genre List",
        genre_list
    });
});

// Display detail page for a specific Genre.
exports.genre_detail = asyncHandler(async (req, res, next) => {
    const [genre, booksInGenre] = await Promise.all([
        Genre.findById(req.params.id).exec(),
        Book.find({ genre: req.params.id }, "title summary").exec(),
    ]);
    if (genre === null) {
        // No results.
        const err = new Error("Genre not found");
        err.status = 404;
        return next(err);
    }

    res.render("genre_detail", {
        title: "Genre Detail",
        genre: genre,
        genre_books: booksInGenre,
    });
});

// Display Genre create form on GET.
exports.genre_create_get = (req, res, next) => {
    res.render("genre_form", { title: "Create Genre" });
};

// Handle Genre create on POST.
exports.genre_create_post = [
    body("name", "Genre name must contain at least 3 characters").trim().isLength({ min: 3 }).escape(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        console.log("Posting data");
        console.log(req.body.name);
        const genre = new Genre({ name: req.body.name });
        if (!errors.isEmpty()) {
            console.log("There were errors");
            res.render("genre_form", {
                title: "Create Genre",
                genre: genre,
                errors: errors.array(),
            });
        }
        else {
            const genreExists = await Genre.findOne({ name: req.body.name }).exec();
            if (genreExists) {
                res.redirect(genreExists.url);
            }
            else {
                console.log("Created");
                await genre.save();
                res.redirect(genre.url);
            }
        }
    })
];

// Display Genre delete form on GET.
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
    const [genre, genreBooks] = await Promise.all([
        Genre.findById({ _id: req.params.id }),
        Book.find({ genre: req.params.id }),
    ]);

    if (genre === null) {
        redirect("/catalog/genres");
    }

    res.render("genre_delete", {
        title: "Delete Genre",
        genre,
        genreBooks,
    });
});

// Handle Genre delete on POST.
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
    const [genre, genreBooks] = await Promise.all([
        Genre.find({ name: req.body.genreid }),
        Book.find({ genre: req.body.genreid }),
    ]);

    if (genreBooks.length > 0) {
        res.render("genre_delete", {
            title: "Delete Genre",
            genre,
            genreBooks
        });
    }
    else {
        await Genre.findByIdAndDelete(req.body.genreid);
        res.redirect("/catalog/genres");
    }
});

// Display Genre update form on GET.
exports.genre_update_get = asyncHandler(async (req, res, next) => {
    const genre = await Genre.findById(req.params.id);
    if (genre === null) {
        res.redirect("/catalog/genres");
    }
    else {
        res.render("genre_form", {
            title: "Update Genre",
            genre,
        })
    }
});

// Handle Genre update on POST.
exports.genre_update_post = [
    body("name", "Genre name must contain at least 3 characters").trim().isLength({ min: 3 }).escape(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        const genre = new Genre({ name: req.body.name, _id: req.params.id });
        if (!errors.isEmpty()) {
            res.render("genre_form", {
                title: "Create Genre",
                genre: genre,
                errors: errors.array(),
            });
        }
        else {
            const genreExists = await Genre.findOne({ name: req.body.name }).exec();
            if (genreExists) {
                res.redirect(genreExists.url);
            }
            else {
                await Genre.findByIdAndUpdate(req.params.id, genre, {});
                res.redirect(genre.url);
            }
        }
    })
];
