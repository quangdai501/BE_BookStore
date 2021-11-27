const Order = require('../../models/bill.model');
const querystring = require("qs");
const sha256 = require("sha256");
const dateFormat = require("dateformat");
const dotenv = require('dotenv');
dotenv.config();

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
        const order = await bill.save();


        let vnpUrl = url;

        const createDate = dateFormat(date, "yyyymmddHHmmss");
        // const orderId = order._id.toString();
        const orderId = order._id;
        // var orderId = dateFormat(date, 'HHmmss');

        var locale = "vn";
        var currCode = "VND";
        var vnp_Params = {};
        vnp_Params["vnp_Version"] = "2";
        vnp_Params["vnp_Command"] = "pay";
        vnp_Params["vnp_TmnCode"] = tmnCode;

        vnp_Params["vnp_Locale"] = locale;
        vnp_Params["vnp_CurrCode"] = currCode;
        vnp_Params["vnp_TxnRef"] = orderId;
        vnp_Params["vnp_OrderInfo"] = "Thanh toán hóa đơn";
        vnp_Params["vnp_OrderType"] = "billpayment";
        vnp_Params["vnp_Amount"] = req.body.total;
        vnp_Params["vnp_ReturnUrl"] = returnUrl;
        vnp_Params["vnp_IpAddr"] = ipAddr;
        vnp_Params["vnp_CreateDate"] = createDate;
        vnp_Params["vnp_BankCode"] = "NCB";

        vnp_Params = sortObject(vnp_Params);

        var signData =
            secretKey + querystring.stringify(vnp_Params, { encode: false });

        var secureHash = sha256(signData);

        vnp_Params["vnp_SecureHashType"] = "SHA256";
        vnp_Params["vnp_SecureHash"] = secureHash;
        vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: true });

        res.status(200).json({ code: "00", data: vnpUrl });
    };

    returnPayment(req, res) {
        try {
            let vnp_Params = req.query;
            const secureHash = vnp_Params.vnp_SecureHash;

            delete vnp_Params.vnp_SecureHash;
            delete vnp_Params.vnp_SecureHashType;

            vnp_Params = sortObject(vnp_Params);
            const signData =
                secretKey + querystring.stringify(vnp_Params, { encode: false });

            const checkSum = sha256(signData);

            const id = vnp_Params.vnp_TxnRef;

            // res.status(200).json({ code: vnp_Params.vnp_ResponseCode });
            if (secureHash === checkSum) {
                if (vnp_Params.vnp_ResponseCode == "00") {
                    res.status(200).json({ code: vnp_Params.vnp_ResponseCode });
                } else {
                    console.log("orderId", id);
                    // const DeleteOrder = await OrderModel.findById({ _id: id });
                    // await DeleteOrder.remove();
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

        const signData =
            secretKey + querystring.stringify(vnp_Params, { encode: false });

        const checkSum = sha256(signData);

        const id = vnp_Params.vnp_TxnRef;

        if (secureHash === checkSum) {
            var orderId = vnp_Params["vnp_TxnRef"];
            var rspCode = vnp_Params["vnp_ResponseCode"];
            //Kiem tra du lieu co hop le khong, cap nhat trang thai don hang va gui ket qua cho VNPAY theo dinh dang duoi
            res.status(200).json({ RspCode: "00", Message: "success" });
        } else {
            res.status(200).json({ RspCode: "97", Message: "Fail checksum" });
        }
    };

}
function sortObject(o) {
    var sorted = {},
        key,
        a = [];

    for (key in o) {
        if (o.hasOwnProperty(key)) {
            a.push(key);
        }
    }

    a.sort();

    for (key = 0; key < a.length; key++) {
        sorted[a[key]] = o[a[key]];
    }
    return sorted;
}

module.exports = new paymentController;