const Product = require('../../models/product.model');

const getPagination = (page, size) => {
    const limit = size ? size : 12;
    const offset = page ? page * limit : 0;
    return { limit, offset };
}
class ProductController {
    // [GET] /api/products
    // get all or by author, category, search
    async getAllProduct(req, res) {
        const page = req.query.page;
        const size = req.query.size;
        const author = req.query.author ? {
            author: req.query.author
        } : {};
        const category = req.query.category ? {
            category: req.query.category
        } : {};
        const search = req.query.search ? {
            $or: [{
                    name: {
                        $regex: req.query.search,
                        $options: 'i',
                    }
                },
                {
                    author: {
                        $regex: req.query.search,
                        $options: 'i',
                    }
                },
                {
                    category: {
                        $regex: req.query.search,
                        $options: 'i',
                    }
                }
            ]
        } : {};
        const { limit, offset } = getPagination(page - 1, size);
        const product = await Product.paginate({...category, ...author, ...search }, { offset, limit })
        if (product) {
            res.send({
                totalItems: product.totalDocs,
                product: product.docs,
                totalPages: product.totalPages,
                currentpage: product.page,
                searchKey: req.query.search
            })
        } else {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving products.",
            });

        };
    }

    // [GET] /api/products/:id
    async getProductById(req, res) {
        try {
            const productId = req.params.id;
            const product = await Product.findOne({ _id: productId });
            res.send(product);
        } catch {
            res.status(404).send({ msg: "Không tìm thấy sản phẩm!" });
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
            product.publisher = req.body.publisher;
            try {
                const saveProduct = await product.save();
                res.send(saveProduct);
            } catch (error) {
                res.status(501).send({ error: error.message });
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
                res.send({ message: error.message });
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
                    publisher: publisher
                }
            });

            res.send(productUpdate);
        } catch (error) {
            res.status(501).send({ error: error.message, message: 'Lỗi khi cập nhật thông tin sản phẩm' });
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
}

module.exports = new ProductController;