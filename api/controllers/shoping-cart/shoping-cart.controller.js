const Bill = require('../../models/bill.model');

class ShopingCartController {

    //[POST] api/shoping-cart
    async addToCart(req, res, next) {
        const billDetail = {
            product: req.body.product,
            quantity: req.body.quantity
        }
        const bill = new Bill();
        bill.user_id = req.body.user_id;
        bill.total = req.body.total;
        bill.address = req.body.address;
        bill.date = req.body.date;
        bill.state = false;
        bill.billDetail.push(billDetail);
        const addToCart = await bill.save();
        if (addToCart) {
            res.send({ message: 'Add new to cart' });
        }
        else {
            res.send('Error add to cart');
        }
    }
    //[]
    async getAllProductByUserId(req, res, next) {
        const allCard = await cart.find({ user_id: req.params.userID });
        if (allCard) {
            console.log("Ok");
            res.json({ message: 'Get successfully' });
        } else {
            console.log('Fail');
            res.json({ error: 'Wrong user id' });
        }
    }

    async updateCard(req, res, next) {
        const { user_id, product_id, quantity } = req.body;
        const updateQuantity = await cart.updateOne({ product_id: product_id, user_id: user_id }, {
            $set: {
                quantity: quantity
            }
        });
        if (updateQuantity) {
            res.json(updateQuantity);
        } else {
            console.log('fail');
            res.json({ error: 'cannot update' });
        }
    }

    async deleteProductFromCard(req, res, next) {
        try {
            const productDelete = await cart.remove({ user_id: req.params.userID, product_id: req.params.productID });
            res.json(productDelete);
        } catch (error) {
            res.json({ message: error });
        }
    }
}
module.exports = new ShopingCartController;