const Order = require('../../models/bill.model');
const Product = require('../../models/product.model')
const sendMail = require('../../sendEmail');
const axios = require('axios');
const mongoose = require('mongoose');

const getAllProductInBills = async(billDetails) => {
    try {
        const productIds = billDetails.map(item => item.productId);

        const products = await Product.find({ _id: { $in: productIds } })
        return products
    } catch (error) {
        throw "Không tìm thấy sản phẩm"
    }

}

const isValidBillDetail = (billDetails, products) => {
    try {
        if (products.length != billDetails.length) {
            throw "Đơn hàng không hợp lệ"
        }
        for (let i = 0; i < products.length; i++) {
            if (!products[i].isActive || products[i].quantity < billDetails.qty) {
                throw "Đơn hàng không hợp lệ"
            }
        }

        return true
    } catch (error) {
        throw "Đơn hàng không hợp lệ"
    }

}
const updateProductAfterOrder = async(billDetails, products) => {
    try {
        for (let i = 0; i < products.length; i++) {
            products[i].isDelete = false;
            products[i].quantity = products[i].quantity - billDetails[i].qty;
            await products[i].save()
        }
        return true
    } catch (error) {
        throw "Không thể cập nhật sản phẩm"
    }

}


class orderController {


    // [get] /api/orders/mine/:userID
    async getAllOrderByUserId(req, res) {
            const type = req.query.type;
            let statusType = {}
            switch (type) {
                case "1":
                    statusType = { deliveryStatus: { $regex: new RegExp("Đang chờ xử lý", 'i') } }
                    break;
                case "2":
                    statusType = { deliveryStatus: { $regex: new RegExp("Chờ vận chuyển", 'i') } }
                    break;
                case "3":
                    statusType = { deliveryStatus: { $regex: new RegExp("Đã giao", 'i') } }
                    break;
                case "4":
                    statusType = { deliveryStatus: { $regex: new RegExp("Đã hủy", 'i') } }
                    break;
                default:
                    statusType = {}
                    break;
            }
            try {
                const all = await Order.find({ user_id: req.params.userID, ...statusType }).sort([
                    ['createdAt', -1]
                ]);
                if (all) {
                    res.status(200).send(all);
                } else {
                    res.status(500).send({ error: 'Wrong user id' });
                }
            } catch (error) {
                res.status(500).send({ error: error });
            }
        }
        //[POST] api/orders/createOrder
    async createBill(req, res) {
            const bill = new Order();
            bill.user_id = req.body.user_id;
            bill.name = req.body.name;
            bill.total = req.body.total;
            bill.address = req.body.address;
            bill.phone = req.body.phone;
            bill.billDetail = req.body.billDetail;
            bill.payment = req.body.payment;
            bill.deliveredStatus = req.body.diliveryStatus;
            if (bill.payment === "Thanh toán online") {
                const date = new Date();
                bill.paidAt = date;
            }
            try {
                const session = await mongoose.startSession();


                await session.withTransaction(async() => {
                    const products = await getAllProductInBills(req.body.billDetail);

                    const isValidBillDetails = isValidBillDetail(req.body.billDetail, products);

                    if (isValidBillDetails) {
                        await updateProductAfterOrder(req.body.billDetail, products);
                    }

                    const addToCart = await bill.save();
                    if (addToCart) {
                        res.send(addToCart);
                    } else {
                        res.send('Tạo đơn hàng không thành công');
                    }
                });


                session.endSession();
            } catch (error) {
                console.log(error)
                res.status(500).send({ err: error.message })
            }
        }
        // [patch] /api/orders/shipper/:orderID/:status
    async updateStateOrderForShipper(req, res) {
            try {
                const id = req.params.orderID;
                const status = req.params.status;
                const updateState = null;
                if (status == 'NhanDon') {
                    updateState = await Order.updateOne({ _id: id }, {
                        $set: {
                            deliveryStatus: "Đang giao hàng",
                        }
                    });
                } else if (status == 'DaGiao') {
                    updateState = await Order.updateOne({ _id: id }, {
                        $set: {
                            deliveryStatus: "Đã giao thành công",
                            deliveredAt: Date.now(),
                            isPaid: true
                        }
                    });
                } else if (status == 'Huy') {
                    updateState = await Order.updateOne({ _id: id }, {
                        $set: {
                            deliveryStatus: "Giao hàng không thành công",
                            deliveredAt: Date.now()
                        }
                    });
                } else if (status == 'paid') {
                    updateState = await Order.updateOne({ _id: id }, {
                        $set: {
                            deliveryStatus: "Giao hàng không thành công",
                            deliveredAt: Date.now()
                        }
                    });
                } else {
                    console.log('fail');
                    res.json({ error: 'cannot update' });
                }
            } catch (error) {
                res.send({ message: error.message });
            }
        }
        //[post] /api/orders/admin/:orderID
    async updateStateOrderForAdmin(req, res) {
            const orderInfo = await Order.findById({ _id: req.params.orderID });
            if (orderInfo) {
                let items = [];
                orderInfo.billDetail.map((x) => {
                    let item = {};
                    item.name = x.name;
                    item.quantity = parseInt(x.qty);
                    item.price = x.price;
                    items.push(item);
                });
                const orderGHN = {
                    payment_type_id: 2,

                    to_name: orderInfo.name,
                    to_phone: orderInfo.phone,
                    to_address: `${orderInfo.address.province}, ${orderInfo.address.district}, ${orderInfo.address.ward}, ${orderInfo.address.detail}`,
                    to_ward_code: orderInfo.address.to_ward_code,
                    to_district_id: orderInfo.address.to_district_id,

                    weight: 200,
                    length: 1,
                    width: 19,
                    height: 10,

                    service_id: 0,
                    service_type_id: 2,
                    payment_type_id: 2,

                    note: "",
                    required_note: "KHONGCHOXEMHANG",

                    cod_amount: orderInfo.payment === "Thanh toán online" ? 0 : orderInfo.total,
                    items: items,
                }
                try {
                    const createOrderGHN = await axios.post(
                        "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create",
                        orderGHN, {
                            headers: {
                                shop_id: process.env.Shop_ID,
                                Token: process.env.Token_GHN,
                            },
                        }
                    );
                    const updateState = await Order.updateOne({ _id: req.params.orderID }, {
                        $set: {
                            deliveryStatus: "Chờ vận chuyển",
                            orderCode: createOrderGHN.data.data.order_code,
                        }
                    });
                    if (updateState) {
                        res.json(updateState);
                    } else {
                        console.log('fail');
                        res.json({ error: 'cannot update' });
                    }
                } catch (error) {
                    const code = error.response.data.code;
                    res.status(code).send({ message: error.response.data })
                }
            }
        }
        // patch /api/orders/admin/cancelOrder/'+ orderID
    async orderCancel(req, res) {
            try {
                const updateState = await Order.updateOne({ _id: req.params.orderID }, {
                    $set: {
                        deliveryStatus: "Đã hủy",
                    }
                });
                if (updateState) {
                    res.json(updateState);
                }
            } catch (error) {
                res.status(501).json({ message: error.message });
            }
        }
        //lấy tất cả đơn hàng [get] /api/orders
    async getAllOrder(req, res) {
        try {
            const allOrder = await Order.find();
            if (allOrder) {
                res.send(allOrder);
            }
        } catch (error) {
            res.send({ message: error.message });
        }

    }

    // lấy các đơn hàng đã hủy  /api/orders/admin/cancel
    async getOrderIsCancel(req, res) {
        const all = await Order.find({ deliveryStatus: "Đã hủy" });
        if (all) {
            res.json(all);
        } else {
            console.log('Fail');
            res.json({ error: 'Wrong user id' });
        }
    }

    //get order by orderID  [get] /api/orders/admin/orderDetail/:orderID
    async getOrderById(req, res) {
        const order = await Order.findOne({ _id: req.params.orderID }).populate({ path: 'billDetail.product', model: 'product' });
        if (order) {
            res.json(order);
        } else {
            res.json({ error: 'Wrong order id' });
        }
    }

    // [POST] - /api/orders/sendmail
    sendMailOrder(req, res) {
        const { userInfo, cartItems } = req.body;
        const sub = 'Đơn hàng';

        let htmlContent = `<p>Chào ${userInfo.name},</p>
        <p>Cảm ơn bạn đã đặt hàng tại BOOKSTOREUTE. Dưới đây là chi tiết đơn hàng của bạn.</p>
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
        <p>Cảm ơn bạn đã tin tưởng BOOKSTOREUTE. Chúc bạn 1 ngày vui vẻ!</p>
        <p>BOOKSTOREUTE</p>`;

        try {
            sendMail(userInfo.email, sub, htmlContent);
            res.send({ message: 'Send mail successfully!' });
        } catch (error) {
            res.send({ message: error.message });
        }
    }

    //lay list don hang
    // [get] api/orders/shipper/:status
    async getOrder(req, res) {
        try {
            const status = req.params.status;
            if (status !== null) {
                var order = null;
                if (status == "ChoGiao") {
                    order = await Order.find({ deliveryStatus: "Chờ vận chuyển" }).populate({ path: 'user_id', model: 'user' });
                } else if (status == "DangGiao") {
                    order = await Order.find({ deliveryStatus: "Đang giao hàng" }).populate({ path: 'user_id', model: 'user' });
                } else if (status == "DaGiao") {
                    order = await Order.find({ deliveryStatus: "Đã giao thành công" }).populate({ path: 'user_id', model: 'user' });
                } else if (status == "fail") {
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
            } else {
                res.json({ error: 'sai api' });
            }
        } catch (error) {
            res.send({ message: error.message });
        }
    }

    // [POST] - /api/order-by-dilivery-status
    async getOrderByDeliveryStatus(req, res) {
        try {
            const orders = await Order.find({ deliveryStatus: req.body.deliveryStatus }).populate({ path: 'user_id', model: 'user' });
            if (orders) {
                res.send(orders);
            }
        } catch (error) {
            res.status(501).send({ messsage: error.message });
        }
    }

}
module.exports = new orderController;