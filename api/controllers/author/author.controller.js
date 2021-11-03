const Author = require('../../models/author.model');

class AuthorController {

    // [GET] - /api/Author
    async getAllAuthor(req, res) {
        try {
            const authors = await Author.find();
            if (authors) {
                res.send(authors);
            }
        } catch (error) {
            res.status(401).send({ error: error.message });
            // res.send({ msg: error.message });
        }
    }

    // [GET] - /api/Author/:id
    async getSpecificAuthor(req, res) {
        try {
            const author = await Author.findOne({ _id: req.params.id });
            if (author) {
                res.send(author);
            }
        } catch (error) {
            res.status(401).send({ error: error.message });
            // res.send({ msg: error.message });
        }
    }

    // [POST] - /api/Author/add
    async addAuthor(req, res) {
        const { name } = req.body;
        try {
            const author = new Author({ name });
            const saveAuthor = await author.save();
            if (saveAuthor) {
                res.send({ message: "Add Author successfully!", data: author });
            }
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    }

    // [PATCH] - /api/Author/:id
    async updateAuthor(req, res) {
        const { name } = req.body;
        try {
            const updatedAuthor = await Author.updateOne({ _id: req.params.id }, {
                $set: { name }
            });
            if (updatedAuthor) {
                res.send({ message: 'Update Author successfully!', data: updatedAuthor });
            }
        } catch (error) {
            res.status(500).send({ error: error.message });
            // res.send({ message: error.message });
        }
    }

    // [DELETE] - /api/Author/:id
    async deleteAuthor(req, res) {
        try {
            const AuthorId = req.params.id;
            const deleteAuthor = await Author.deleteOne({ _id: AuthorId });
            res.send(deleteAuthor);
        } catch (error) {
            res.send({ msg: error.message });
        }
    }
}

module.exports = new AuthorController;