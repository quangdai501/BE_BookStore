const Brand = require('../../models/brand.model');

class BrandController {

    //[POST] - /api/brand
    async addBrand(req, res) {
        const { name, description } = req.body;
        try {
            const newBrand = new Brand();
            newBrand.name = name;
            newBrand.description = description;
            const brand = await newBrand.save();
            if (brand) {
                res.send({ message: 'Thêm thành công' });
            }
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    }
    //[GET] - /api/brand/getAllBrand
    async getAllBrand(req, res) {
        try {
            const listBrand = await Brand.find();
            if (listBrand) {
                res.send({ listBrand: listBrand });
            }
        } catch (error) {
            res.status(403).send({ error: error.message })
        }
    }
    //[GET] - /api/brand/getBrandByID/:brandID
    async getBrandById(req, res) {
        try {
            const brand = await Brand.findById({ _id: req.params.brandID })
            if (brand) {
                res.send({ brand: brand });
            }
        } catch (error) {
            res.status(404).send({ error: error.message });
        }
    }

    //[PATCH] - /api/brand/updateBrand/:brandID
    async updateBrand(req, res) {
        const { name, description } = req.body;
        try {
            const result = await Brand.updateOne({ _id: req.params.brandID },
                {
                    $set: {
                        name, description
                    }
                });
            if (result) {
                res.send(result);
            }
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    }
    //[DELETE] - /api/brand/deleteBrand/:brandID
    async deleteBrand(req, res) {
        try {
            const result = await Brand.remove({ _id: req.params.brandID });
            res.send(result);
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    }
}
module.exports = new BrandController;