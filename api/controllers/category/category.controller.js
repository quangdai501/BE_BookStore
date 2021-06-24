const Category = require('../../models/category.model');

class CategoryController {

    // [GET] - /api/category
    async getAllCategory(req, res) {
        try {
            const categories = await Category.find();
            if (categories) {
                res.send(categories);
            }
        } catch (error) {
            res.status(401).send({ error: error.message });
            // res.send({ msg: error.message });
        }
    }

    // [GET] - /api/category/:id
    async getSpecificCategory(req, res) {
        try {
            const category = await Category.findOne({ _id: req.params.id });
            if (category) {
                res.send(category);
            }
        } catch (error) {
            res.status(401).send({ error: error.message });
            // res.send({ msg: error.message });
        }
    }

    // [POST] - /api/category/add
    async addCategory(req, res) {
        const { name, description } = req.body;
        try {
            const category = new Category({ name, description });
            const saveCategory = await category.save();
            if (saveCategory) {
                res.send({ message: "Add category successfully!", data: category });
            }
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    }

    // [PATCH] - /api/category/:id
    async updateCategory(req, res) {
        const { name, description } = req.body;
        try {
            const updatedCategory = await Category.updateOne({ _id: req.params.id }, {
                $set: { name, description }
            });
            if (updatedCategory) {
                res.send({ message: 'Update category successfully!', data: updatedCategory });
            }
        } catch (error) {
            res.status(500).send({ error: error.message });
            // res.send({ message: error.message });
        }
    }

    // [DELETE] - /api/category/:id
    async deleteCategory(req, res) {
        try {
            const categoryId = req.params.id;
            const deleteCategory = await Category.deleteOne({ _id: categoryId });
            res.send(deleteCategory);
        } catch (error) {
            res.send({ msg: error.message });
        }
    }
}

module.exports = new CategoryController;
