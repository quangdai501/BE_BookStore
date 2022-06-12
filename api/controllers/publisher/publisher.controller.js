const Publisher = require('../../models/publisher.model');

class PublisherController {

    // [GET] - /api/Publisher
    async getAllPublisher(req, res) {
        try {
            const publishers = await Publisher.find();
            if (publishers) {
                res.send(publishers);
            }
        } catch (error) {
            res.status(401).send({ error: error.message });
            // res.send({ msg: error.message });
        }
    }

    // [GET] - /api/Publisher/:id
    async getSpecificPublisher(req, res) {
        try {
            const publisher = await Publisher.findOne({ _id: req.params.id });
            if (publisher) {
                res.send(publisher);
            }
        } catch (error) {
            res.status(401).send({ error: error.message });
            // res.send({ msg: error.message });
        }
    }

    // [POST] - /api/Publisher/
    async addPublisher(req, res) {
        const { name } = req.body;
        try {
            const publisher = new Publisher({ name });
            const savePublisher = await publisher.save();
            if (savePublisher) {
                res.send({ message: "Add Publisher successfully!", data: publisher });
            }
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    }

    // [PATCH] - /api/Publisher/:id
    async updatePublisher(req, res) {
        const { name } = req.body;
        try {
            const updatedPublisher = await Publisher.updateOne({ _id: req.params.id }, {
                $set: { name }
            });
            if (updatedPublisher) {
                res.send({ message: 'Update Publisher successfully!', data: updatedPublisher });
            }
        } catch (error) {
            res.status(500).send({ error: error.message });
            // res.send({ message: error.message });
        }
    }

    // [DELETE] - /api/Publisher/:id
    async deletePublisher(req, res) {
        try {
            const publisherId = req.params.id;
            const publisher = await Publisher.findOne({ isDelete: true, _id: publisherId })

            if (!publisher) {
                res.status(500).send({ error: "Publisher can not delete" });
                return;
            }

            const deletePublisher = await Publisher.deleteOne({ _id: publisherId });
            res.send(deletePublisher);
        } catch (error) {
            res.send({ msg: error.message });
        }
    }
}

module.exports = new PublisherController;