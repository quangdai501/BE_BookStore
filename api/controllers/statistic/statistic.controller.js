const Product = require("../../models/product.model");
const Review = require("../../models/review.model");
const Order = require("../../models/bill.model");
const User = require("../../models/user.model");
const selectBy = (by) => {
    const d = new Date()
    d.setHours(0)
    d.setMinutes(0)
    d.setSeconds(0)
    switch (by) {
        case "day":
            return { createdAt: { $gte: d } }
        case "week":
            d.setDate(d.getDate() - d.getDay());
            return { createdAt: { $gte: d } }
        case "month":
            d.setDate(1);
            return { createdAt: { $gte: d } }
        case "year":
            d.setDate(1);
            d.setMonth(1)
            return { createdAt: { $gte: d } }
        default:
            return {}
    }
}
class StatisticController {
    // [GET] /api/statistic
    // get all
    async getAll(req, res) {
            try {
                const totalUser = await User.find({ role: "user" }).count();
                const totalProduct = await Product.count();
                const totalOrder = await Order.count();
                const revenueOrder = await Order.aggregate([{
                        $group: {
                            _id: null,
                            totalRevenue: { $sum: "$total" },
                        },
                    },
                    { $project: { _id: 0, totalRevenue: 1 } }
                ]);
                res.send({
                    totalUser: totalUser,
                    totalProduct: totalProduct,
                    totalOrder: totalOrder,
                    revenueOrder: revenueOrder[0].totalRevenue
                });
            } catch (error) {
                res.status(500).send({ message: error.message });
            }
        }
        // [GET] /api/statistic/top-sale-product
        // get top-sale-product or by day/week/month/year
    async getTopSaleProduct(req, res) {
            const size = req.query.size ? req.query.size : 5;
            const by = req.query.by
            const query = selectBy(by)


            try {
                const topSale = await Order.aggregate([
                    { $match: {...query } },
                    { $unwind: "$billDetail" },
                    {
                        $group: {
                            _id: { productName: "$billDetail.name", productId: "$billDetail.productId" },
                            sales: { $sum: 1 },
                            amount: { $sum: { $multiply: ["$billDetail.price", "$billDetail.qty"] } },
                        },
                    },
                    {
                        $sort: {
                            sales: -1
                        }
                    },
                    { $limit: size },
                    { $project: { _id: 0, productName: "$_id.productName", sales: 1, amount: 1 } }

                ]);
                res.send(topSale);
            } catch (error) {
                res.status(500).send({ message: error.message });
            }
        }
        // [GET] /api/statistic/get-revenue
        // get get-revenue day-of-week or by day-of-month/month-of-year
    async getRevenue(req, res) {
            const by = req.query.by
                // let label = { $dayOfWeek: "$createdAt" }
            let label = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
            let type = "week"
            switch (by) {
                case "day-of-month":
                    type = "month"
                    break;
                case "month-of-year":
                    label = { $dateToString: { format: "%Y-%m", date: "$createdAt" } }
                    type = "year"
                    break;
            }


            const query = selectBy(type)

            try {
                const Revenue = await Order.aggregate([
                    { $match: {...query } },
                    { $unwind: "$billDetail" },
                    {
                        $group: {
                            _id: { label: {...label } },
                            total: { $sum: { $multiply: ["$billDetail.price", "$billDetail.qty"] } },
                            amount: { $sum: "$billDetail.qty" },

                        },
                    },
                    {
                        $sort: {
                            _id: 1
                        }
                    },
                    { $project: { _id: 0, label: "$_id.label", total: 1, amount: 1 } }

                ]);
                res.send(Revenue);
            } catch (error) {
                res.status(500).send({ message: error.message });
            }
        }
        // [GET] /api/statistic/get-new-review
        // get-new-review 
    async getNewReviews(req, res) {
        const size = req.query.size ? req.query.size : 10;

        try {
            const newReviews = await Review.aggregate([{
                    $lookup: {
                        from: Product.collection.name,
                        localField: 'product',
                        foreignField: '_id',
                        as: 'products',
                    }
                },
                { $unwind: "$products" },
                {
                    $sort: {
                        updatedAt: -1
                    }
                },
                { $limit: size },
                {
                    $project: {
                        _id: 1,
                        product: 1,
                        user: 1,
                        name: 1,
                        comment: 1,
                        rating: 1,
                        updatedAt: 1,
                        productName: "$products.name",
                        productImage: "$products.image"
                    }
                }
            ]);
            res.send(newReviews);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    }
}

module.exports = new StatisticController();