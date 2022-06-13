const Product = require('../../models/product.model');
const Category = require('../../models/category.model');
const Publisher = require('../../models/publisher.model');
const Author = require('../../models/author.model');
const Review = require('../../models/review.model');
const Order = require('../../models/bill.model');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const getPagination = (page, size) => {
    const limit = size ? size : 12;
    const offset = page ? page : 1;
    return { limit, offset };
}

const getAllUserHadBoughtProduct = async(productId) => {
    const users = await Order.aggregate([
        { $unwind: "$billDetail" },
        {
            $match: {
                "billDetail.productId": ObjectId(productId)
            }
        },
        {
            $group: {
                _id: {
                    productId: "$billDetail.productId",
                    user_id: "$user_id"
                }
            }
        },
        // { $project: { user_id: 1 } }

    ]);
    // convert users to map // improve search with O(1)
    const hash = Object.fromEntries(
        users.map(object => [object._id.user_id, 1])
    )
    return hash;
}

const getAllReview = async(productId) => {
    const reviews = await Review.find({ product: productId })
        //users had bought the product
    const hash = await getAllUserHadBoughtProduct(productId);
    //convert reviews to dto
    const reviewsDto = reviews.map(item => {
        const newItem = {
                user: item.user,
                product: item.product,
                name: item.name,
                rating: item.rating,
                comment: item.comment,
                updatedAt: item.updatedAt,
                isPurchase: false
            }
            //if user in hash isPurchase equal true
        if (item.user in hash) {
            newItem.isPurchase = true
        }

        return newItem;
    })
    return reviewsDto;
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

            const isActive = req.query.active ? {} : { isActive: true }

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
                    { $match: {...category, ...author, ...query, ...isActive } }
                ]
            );
            Product.aggregatePaginate(myAggregate, options, function(err, results) {
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
        // [GET] /api/products/:id/recommend
        // get product same authorId,category publisher
    async getRecommendProducts(req, res) {
        const size = req.query.size ? req.query.size : 6;
        const id = req.params.id;

        try {
            const product = await Product.findById(id);
            if (product) {

                const products = await Product.aggregate(
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
                        {
                            $match: {

                                $or: [
                                    { author: product.author },
                                    { publisherId: product.publisherId },
                                    { category: product.category },
                                ],
                                isActive: true

                            }
                        }, { $limit: size }
                    ]
                );

                res.send(products);

            } else {
                res.status(404).send({ message: "Không tìm thấy sản phẩm!" });
            }
        } catch (ex) {
            res.status(500).send({ message: ex.message });
        }

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
                    { $unwind: "$authors" },
                    { $match: { _id: ObjectId(productId) } }
                ]
            );
            const reviewDto = await getAllReview(productId);

            const productDto = {...product[0] }
            productDto.reviews = reviewDto;
            res.send(productDto);
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

                const author = await Author.findById(req.body.author);
                const category = await Category.findById(req.body.category);
                const publisher = await Publisher.findById(req.body.publisher);

                if (!author || !category || !publisher) {
                    res.status(404).send({ message: "Author or Category or publisher was not found" });
                }


                if (author.isDelete) {
                    author.isDelete = false;
                    await author.save()
                }

                if (category.isDelete) {
                    category.isDelete = false;
                    await category.save()
                }

                if (publisher.isDelete) {
                    publisher.isDelete = false;
                    await publisher.save();
                }


                const saveProduct = await product.save();
                res.send(saveProduct);
            } catch (error) {
                res.status(501).send({ message: error.message });
            }

        }
        //[DELETE] /api/products/deleteProduct/:productID
    async deleteProductByID(req, res) {
            try {
                const productId = req.params.productID

                const product = await Product.findOne({ isDelete: true, _id: productId })

                if (!product) {
                    res.status(500).send({ error: "Product can not delete" });
                    return;
                }

                const productDelete = await Product.remove({ _id: productId });
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
            publisher,
            isActive
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
                    publisherId: publisher,
                    isActive: isActive
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
        //get all review by product id
        //[get] /api/products/:id/reviews

    async getAllReviewById(req, res) {
            const productId = req.params.id;
            try {
                const reviewsDto = await getAllReview(productId);
                res.status(200).send(reviewsDto);
            } catch (error) {
                res.status(501).send({ message: error.message });
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