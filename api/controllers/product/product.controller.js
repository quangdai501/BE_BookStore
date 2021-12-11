const Product = require('../../models/product.model');
const Category = require('../../models/category.model');
const Publisher = require('../../models/publisher.model');
const Author = require('../../models/author.model');
const Review = require('../../models/review.model');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const getPagination = (page, size) => {
    const limit = size ? size : 12;
    const offset = page ? page : 1;
    return { limit, offset };
}

class ProductController {
    // [GET] /api/products
    // get all or by author, category, search
    async getAllProduct(req, res) {
        const page = req.query.page;
        const size = req.query.size;
        const author = req.query.author ? {
            // author: ObjectId(req.query.author)
            "authors.name": { $regex: new RegExp(req.query.author, 'i') }
        } : {};
        const category = req.query.category ? {
            // category: ObjectId(req.query.category)
            "categorys.name": { $regex: new RegExp(req.query.category, 'i') }
        } : {};
        const search = req.query.search
        const query = (search) ? {
            $or: [
                { name: { $regex: new RegExp(search, 'i') } },
                { "categorys.name": { $regex: new RegExp(search, 'i') } },
                { "authors.name": { $regex: new RegExp(search, 'i') } },
            ]
        } : {}

        const sort = req.query.sort ? { sort: req.query.sort } : {}
        const { limit, offset } = getPagination(page, size);
        const options = {
            page: offset,
            limit: limit,
            ...sort
        };

        const myAggregate = Product.aggregate(
            [{
                $lookup: {
                    from: Category.collection.name,
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categorys',
                }
            },
            { $unwind: "$categorys" },
            {
                $lookup: {
                    from: Publisher.collection.name,
                    localField: 'publisherId',
                    foreignField: '_id',
                    as: 'publisher',
                }
            },
            { $unwind: "$publisher" },
            {
                $lookup: {
                    from: Author.collection.name,
                    localField: 'author',
                    foreignField: '_id',
                    as: 'authors',
                }
            },
            { $unwind: "$authors" },
            { $match: { ...category, ...author, ...query } }
            ]
        );
        Product.aggregatePaginate(myAggregate, options, function (err, results) {
            if (err) {
                res.status(500).send({
                    message: err.message || "Some error occurred while retrieving products.",
                });
            } else {

                res.send({
                    totalItems: results.totalDocs,
                    product: results.docs,
                    totalPages: results.totalPages,
                    currentpage: results.page,
                    searchKey: req.query.search,

                })
            }
        })



    }

    // [GET] /api/products/:id
    async getProductById(req, res) {
        try {
            const productId = req.params.id;
            // const product = await Product.findOne({ _id: productId });
            const product = await Product.aggregate(
                [{
                    $lookup: {
                        from: Category.collection.name,
                        localField: 'category',
                        foreignField: '_id',
                        as: 'categorys',
                    }
                },
                { $unwind: "$categorys" },
                {
                    $lookup: {
                        from: Publisher.collection.name,
                        localField: 'publisherId',
                        foreignField: '_id',
                        as: 'publisher',
                    }
                },
                { $unwind: "$publisher" },
                {
                    $lookup: {
                        from: Author.collection.name,
                        localField: 'author',
                        foreignField: '_id',
                        as: 'authors',
                    }
                },
                {
                    $lookup: {
                        from: Review.collection.name,
                        localField: '_id',
                        foreignField: 'product',
                        as: 'reviews',
                    }
                },
                { $unwind: "$authors" },
                { $match: { _id: ObjectId(productId) } }
                ]
            );

            res.send(product[0]);
        } catch {
            res.status(404).send({ message: "Không tìm thấy sản phẩm!" });
        }
    }

    //[Post] /api/products/addProduct
    async addProduct(req, res) {
        const product = new Product();
        product.name = req.body.name;
        product.category = req.body.category;
        product.image = req.body.image;
        product.price = req.body.price;
        product.description = req.body.description;
        product.author = req.body.author;
        product.quantity = req.body.quantity;
        product.publisherId = req.body.publisher;
        try {
            const saveProduct = await product.save();
            res.send(saveProduct);
        } catch (error) {
            res.status(501).send({ message: error.message });
        }

    }
    //[DELETE] /api/products/deleteProduct/:productID
    async deleteProductByID(req, res) {
        try {
            const productDelete = await Product.remove({ _id: req.params.productID });
            if (productDelete) {
                res.send(productDelete);
            } else {
                res.send('Xóa sản phẩm lỗi');
            }
        } catch (error) {
            res.status(501).send({ message: error.message });
        }
    }
    //[PATCH] api/products/updateProduct/:productID
    async updateProductByID(req, res) {
        const {
            name,
            category,
            image,
            price,
            description,
            author,
            quantity,
            publisher
        } = req.body;
        try {
            const productUpdate = await Product.updateOne({ _id: req.params.productID }, {
                $set: {
                    name: name,
                    category: category,
                    image: image,
                    price: price,
                    description: description,
                    author: author,
                    quantity: quantity,
                    publisherId: publisher
                }
            });

            res.status(200).send(productUpdate);
        } catch (error) {
            res.status(501).send({ message: error.message });
        }
    }

    //[PATCH] /api/products/updateProductQuantity/:productID
    async updateProductQuantityByID(req, res) {
        const qty = req.body.qty;
        try {
            const update = await Product.updateOne({ _id: req.params.productID }, {
                $set: {
                    quantity: qty
                }
            });
            res.send(update);
        } catch (error) {
            res.send({ message: error.message });
        }
    }

    //[post] /api/products/createreview/:productID
    async createReview(req, res) {
        const { rating, comment } = req.body
        const productId = req.params.productID;
        try {
            const query = { user: req.user._id, product: productId },
                update = { name: req.user.name, rating: rating, comment: comment },
                options = { upsert: true, new: true, setDefaultsOnInsert: true };

            // Find the document
            const data = await Review.findOneAndUpdate(query, update, options);
            res.status(200).send(data);
        } catch (error) {
            res.status(501).send({ message: error.message });
        }
    }
}

module.exports = new ProductController;