const Order = require('../../models/bill.model');
const Product = require('../../models/product.model')
const User = require('../../models/user.model');

const querystring = require("qs");
const sha256 = require("sha256");
const dateFormat = require("dateformat");
const crypto = require("crypto");
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();

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
            products[i].sold = products[i].sold + billDetails[i].qty;
            await products[i].save()
        }
        return true
    } catch (error) {
        throw "Không thể cập nhật sản phẩm"
    }

}

class paymentController {
    async createPayment(req, res) {
        const tmnCode = process.env.VNP_TMN_CODE;
        const secretKey = process.env.VNP_HASH_SECRET;
        const url = process.env.VNP_URL;
        const returnUrl = process.env.VNP_RETURN_URL;
        let ipAddr =
            req.headers["x-forwarded-for"] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

        const bill = new Order();
        bill.user_id = req.body.user_id;
        bill.name = req.body.name;
        bill.total = req.body.total;
        bill.address = req.body.address;
        bill.phone = req.body.phone;
        bill.billDetail = req.body.billDetail;
        bill.payment = req.body.payment;
        bill.deliveredStatus = req.body.diliveryStatus;
        const date = new Date();
        bill.paidAt = date;
        if (req.body.coupon) {
            bill.coupon = req.body.coupon;
        }

        try {

            const session = await mongoose.startSession();


            await session.withTransaction(async() => {
                const products = await getAllProductInBills(req.body.billDetail);

                const isValidBillDetails = isValidBillDetail(req.body.billDetail, products);

                if (isValidBillDetails) {
                    await updateProductAfterOrder(req.body.billDetail, products);
                }
                console.log(products);
                const user = await User.findById(req.user._id);
                user.point = user.point + req.body.total / 1000;
                await user.save();

                const order = await bill.save();
                let vnpUrl = url;

                const createDate = dateFormat(date, "yyyymmddHHmmss");
                const orderId = order._id.toString();

                var locale = "vn";
                var currCode = "VND";
                var vnp_Params = {};
                vnp_Params["vnp_Version"] = "2.1.0";
                vnp_Params["vnp_Command"] = "pay";
                vnp_Params["vnp_TmnCode"] = tmnCode;

                vnp_Params["vnp_Locale"] = locale;
                vnp_Params["vnp_CurrCode"] = currCode;
                vnp_Params["vnp_TxnRef"] = orderId;
                vnp_Params["vnp_OrderInfo"] = "thanh toan hoa don";
                vnp_Params["vnp_OrderType"] = "billpayment";
                vnp_Params["vnp_Amount"] = Number(req.body.total * 100);
                vnp_Params["vnp_ReturnUrl"] = returnUrl;
                vnp_Params["vnp_IpAddr"] = ipAddr;
                vnp_Params["vnp_CreateDate"] = createDate;
                vnp_Params["vnp_BankCode"] = "NCB";

                vnp_Params = sortObject(vnp_Params);

                const signData = querystring.stringify(vnp_Params, { encode: false });
                const hmac = crypto.createHmac("sha512", secretKey);
                const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
                vnp_Params['vnp_SecureHash'] = signed;
                vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

                res.status(200).json({ code: "00", data: vnpUrl });
            });
            session.endSession();

        } catch (error) {
            console.log(error)
            res.status(500).send({ err: error.message })
        }


    };

    async returnPayment(req, res) {
        try {
            console.log(req.query);
            let vnp_Params = req.query;
            const secureHash = vnp_Params.vnp_SecureHash;
            const tmnCode = process.env.VNP_TMN_CODE;
            const secretKey = process.env.VNP_HASH_SECRET;
            delete vnp_Params.vnp_SecureHash;
            delete vnp_Params.vnp_SecureHashType;

            vnp_Params = sortObject(vnp_Params);


            // const signData =
            //     secretKey + querystring.stringify(vnp_Params, { encode: false });

            // const checkSum = sha256(signData);

            const signData = querystring.stringify(vnp_Params, { encode: false });
            const hmac = crypto.createHmac("sha512", secretKey);
            const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");


            const id = vnp_Params.vnp_TxnRef;

            // res.status(200).json({ code: vnp_Params.vnp_ResponseCode });
            if (secureHash === signed) {
                if (vnp_Params.vnp_ResponseCode == "00") {
                    res.status(200).json({ code: vnp_Params.vnp_ResponseCode });
                } else {
                    console.log("orderId", id);
                    const DeleteOrder = await Order.findById({ _id: id });
                    await DeleteOrder.remove();
                    res.status(200).json({ code: vnp_Params.vnp_ResponseCode });
                }
            } else {
                res.status(200).json({ code: "97" });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };

    inpPayment(req, res) {
        let vnp_Params = req.query;
        const secureHash = vnp_Params.vnp_SecureHash;

        delete vnp_Params.vnp_SecureHash;
        delete vnp_Params.vnp_SecureHashType;

        vnp_Params = sortObject(vnp_Params);

        // const signData =
        //     secretKey + querystring.stringify(vnp_Params, { encode: false });

        // const checkSum = sha256(signData);

        const signData = querystring.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        const id = vnp_Params.vnp_TxnRef;

        if (secureHash === signed) {
            var orderId = vnp_Params["vnp_TxnRef"];
            var rspCode = vnp_Params["vnp_ResponseCode"];
            //Kiem tra du lieu co hop le khong, cap nhat trang thai don hang va gui ket qua cho VNPAY theo dinh dang duoi
            res.status(200).json({ RspCode: "00", Message: "success" });
        } else {
            res.status(200).json({ RspCode: "97", Message: "Fail checksum" });
        }
    };

}

function sortObject(obj) {
    var sorted = {};
    var str = [];
    var key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}
// function sortObject(o) {
//     var sorted = {},
//         key,
//         a = [];

//     for (key in o) {
//         if (o.hasOwnProperty(key)) {
//             a.push(key);
//         }
//     }

//     a.sort();

//     for (key = 0; key < a.length; key++) {
//         sorted[a[key]] = o[a[key]];
//     }
//     return sorted;
// }

module.exports = new paymentController;