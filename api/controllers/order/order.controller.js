const Order = require('../../models/bill.model');
const sendMail = require('../../sendEmail');
class orderController {


    // [get] /api/orders/mine/:userID
    async getAllOrderByUserId(req, res, next) {
        const all = await Order.find({ user_id: req.params.userID });
        if (all) {
            res.send(all);
        } else {
            res.status(404).send({ error: 'Wrong user id' });
        }
    }
    //[POST] api/orders/createOrders
    async createBill(req, res, next) {
        const bill = new Order();
        bill.user_id = req.body.user_id;
        bill.total = req.body.total;
        bill.address = req.body.address;
        bill.phone = req.body.phone;
        bill.billDetail = req.body.billDetail;
        bill.payment = req.body.payment;
        bill.isPaid = req.body.isPaid;
        const addToCart = await bill.save();
        if (addToCart) {
            res.send(addToCart);
        }
        else {
            res.send('Tạo đơn hàng không thành công');
        }
    }
    // [patch] /api/orders/shipper/:orderID/:status
    async updateStateOrderForShipper(req, res, next) {
        try {
            const id = req.params.orderID;
            const status = req.params.status;
            const updateState = null;
            if (status == 'NhanDon') {
                updateState = await Order.updateOne({ _id: id }, {
                    $set: {
                        deliveryStatus: "Đang giao hàng",
                        // deliveredAt: Date.now()
                    }
                });
            }
            else if (status == 'DaGiao') {
                updateState = await Order.updateOne({ _id: id }, {
                    $set: {
                        deliveryStatus: "Đã giao thành công",
                        deliveredAt: Date.now(),
                        isPaid: true
                    }
                });
            }
            else if (status == 'Huy') {
                updateState = await Order.updateOne({ _id: id }, {
                    $set: {
                        deliveryStatus: "Giao hàng không thành công",
                        deliveredAt: Date.now()
                    }
                });
            }
            else if (status == 'paid') {
                updateState = await Order.updateOne({ _id: id }, {
                    $set: {
                        deliveryStatus: "Giao hàng không thành công",
                        deliveredAt: Date.now()
                    }
                });
            }
            else {
                console.log('fail');
                res.json({ error: 'cannot update' });
            }
        } catch (error) {
            res.send({ message: error.message });
        }
    }
    //[patch] /api/orders/admin/:orderID
    async updateStateOrderForAdmin(req, res, next) {
        const updateState = await Order.updateOne(
            { _id: req.params.orderID },
            {
                $set: {
                    deliveryStatus: "Chờ vận chuyển",
                }
            });
        if (updateState) {
            res.json(updateState);
        } else {
            console.log('fail');
            res.json({ error: 'cannot update' });
        }
    }
    // patch /api/orders/admin/cancelOrder/'+ orderID
    async orderCancel(req, res, next) {
        const updateState = await Order.updateOne(
            { _id: req.params.orderID },
            {
                $set: {
                    deliveryStatus: "Đã hủy",
                }
            });
        if (updateState) {
            res.json(updateState);
        } else {
            console.log('fail');
            res.json({ error: 'cannot update' });
        }
    }
    //lấy tất cả đơn hàng [get] /api/orders/admin/all
    async getAllOrder(req, res, next) {
        try {
            const allOrder = await Order.find().populate({ path: 'user_id', model: 'user' });
            if (allOrder) {
                res.send(allOrder);
            }
        } catch (error) {
            res.send({ message: error.message });
        }

    }

    // lấy các đơn hàng đã hủy  /api/orders/admin/cancel
    async getOrderIsCancel(req, res, next) {
        const all = await Order.find({ deliveryStatus: "Đã hủy" });
        if (all) {
            res.json(all);
        } else {
            console.log('Fail');
            res.json({ error: 'Wrong user id' });
        }
    }

    //get order by orderID  [get] /api/orders/admin/orderDetail/:orderID
    async getOrderById(req, res, next) {
        const order = await Order.findOne({ _id: req.params.orderID }).populate({ path: 'billDetail.product', model: 'product' });
        if (order) {
            res.json(order);
        }
        else {
            res.json({ error: 'Wrong order id' });
        }
    }

    // [POST] - /api/orders/sendmail
    sendMailOrder(req, res, next) {
        const { userInfo, cartItems } = req.body;
        const sub = 'Đơn hàng';

        let htmlContent = `<p>Chào ${userInfo.name},</p>
        <p>Cảm ơn bạn đã đặt hàng tại NS3AE. Dưới đây là chi tiết đơn hàng của bạn.</p>
        <table style="border: 1px solid black; border-collapse: collapse;">
            <thead>
                <tr>
                <th scope="col" style="border: 1px solid black; border-collapse: collapse;">Hình ảnh</th>
                <th scope="col" style="border: 1px solid black; border-collapse: collapse;">Tên sản phẩm</th>
                <th scope="col" style="border: 1px solid black; border-collapse: collapse;">Đơn giá</th>
                <th scope="col" style="border: 1px solid black; border-collapse: collapse;">Số lượng</th>
                <th scope="col" style="border: 1px solid black; border-collapse: collapse;">Thành tiền</th>
                </tr>
            </thead>
            <tbody>`;

        for (let item of cartItems) {
            htmlContent += `
            <tr>
                <td style="border: 1px solid black; border-collapse: collapse;"><img src="${item.image}" height="100"></th>
                <td style="border: 1px solid black; border-collapse: collapse;">${item.name}</td>
                <td style="border: 1px solid black; border-collapse: collapse;">${item.price}</td>
                <td style="border: 1px solid black; border-collapse: collapse;">${item.qty}</td>
                <td style="border: 1px solid black; border-collapse: collapse;">${item.price * item.qty}đ</td>
            </tr >
            `
        }

        htmlContent += `
        </tbody></table>
        <p>Cảm ơn bạn đã tin tưởng NS3AE. Chúc bạn 1 ngày vui vẻ!</p>
        <p>NS3AE</p>`;

        try {
            sendMail(userInfo.email, sub, htmlContent);
            res.send({ message: 'Send mail successfully!' });
        } catch (error) {
            res.send({ message: error.message });
        }
    }

    //lay list don hang
    // [get] api/orders/shipper/:status
    async getOrder(req, res, next) {
        try {
            const status = req.params.status;
            if (status !== null) {
                var order = null;
                if (status == "ChoGiao") {
                    order = await Order.find({ deliveryStatus: "Chờ vận chuyển" }).populate({ path: 'user_id', model: 'user' });
                }
                else if (status == "DangGiao") {
                    order = await Order.find({ deliveryStatus: "Đang giao hàng" }).populate({ path: 'user_id', model: 'user' });
                }
                else if (status == "DaGiao") {
                    order = await Order.find({ deliveryStatus: "Đã giao thành công" }).populate({ path: 'user_id', model: 'user' });
                }
                else if (status == "fail") {
                    order = await Order.find({ deliveryStatus: "Giao hàng không thành công" }).populate({ path: 'user_id', model: 'user' });
                }
                if (order) {
                    console.log(status);

                    const orderResult = [];
                    for (let item of order) {
                        const bill = {
                            _id: item._id,
                            userInfo: { name: item.user_id.name },
                            address: item.address,
                            total: item.total + item.shipPrice,
                            state: item.deliveryStatus,
                            updateAt: item.updatedAt,
                            isPaid: item.isPaid,
                            payment: item.payment
                        }
                        orderResult.push(bill);
                    }
                    res.json(orderResult);
                } else {
                    res.json({ error: 'Không có data' });
                }
            }
            else {
                res.json({ error: 'sai api' });
            }
        } catch (error) {
            res.send({ message: error.message });
        }
    }

    // [POST] - /api/order-by-dilivery-status
    async getOrderByDeliveryStatus(req, res) {
        try {
            const orders = await Order.find({ deliveryStatus: req.body.diliveryStatus }).populate({ path: 'user_id', model: 'user' });
            if (orders) {
                res.send(orders);
            }
        } catch (error) {
            res.send({ error: error.message });
        }
    }

}
module.exports = new orderController;
