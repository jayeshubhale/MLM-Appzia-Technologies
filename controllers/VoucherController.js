const Voucher_Model = require("../model/VoucherModel");
const baseURL = require("../constant/baseURL");




const createVoucher = async (req, res) => {
    try {
        let obj = {
            voucherName: req.body.voucherName ? req.body.voucherName : undefined,
            voucherPrice: req.body.voucherPrice ? req.body.voucherPrice : undefined,
            voucherDescription: req.body.voucherDescription ? req.body.voucherDescription : undefined,
        };

        if (req.files && req.files.length > 0) {
            obj["voucherImage"] = "/uploads/" + req.files[0].filename;
        } else {
            return res.json({ error_code: 400, message: 'At least one file must be uploaded' });
        }

        if (!obj.voucherName) {
            return res.json({ error_code: 400, message: 'Voucher name is required' });
        }

        if (!obj.voucherPrice) {
            return res.json({ error_code: 400, message: 'Voucher price is required' });
        }

        if (!obj.voucherDescription) {
            return result.json({ error_code: 400, message: 'Voucher description is required' });
        }

        const newVoucher = new Voucher_Model(obj);

        const savedVoucher = await newVoucher.save();

        res.status(200).json({ error_code: 200, message: 'Voucher Created Successfully', data: savedVoucher });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error_code: 500, message: 'Internal Server Error' });
    }
}

// -----------------------------------------------------

const getAllVoucher = async (req, res) => {
    try {
        let baseUrl = baseURL.generateBaseUrl(req);
        const vouchers = await Voucher_Model.find({});
        let result = [];
        let sr = 1;
        for (let i = 0; i < vouchers.length; i++) {
            result.push({
                SrNo: sr++,
                VoucherName: vouchers[i].voucherName,
                VoucherImage: baseUrl + vouchers[i].voucherImage,
                voucherDescription: vouchers[i].voucherDescription,
                Status: vouchers[i].status,
                VoucherId: vouchers[i]._id,
                voucherPrice: vouchers[i].voucherPrice,
            });
        }

        res.status(200).json({
            error_code: 200,
            message: 'Vouchers retrieved successfully',
            data: result
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
}

// -----------------------------------------------------

const deleteVoucher = async (req, res) => {
    try {
        const voucherId = req.params.id;

        // Find the voucher by ID and delete it
        const deletedVoucher = await Voucher_Model.findByIdAndDelete(voucherId);

        // If the voucher doesn't exist, return an error
        if (!deletedVoucher) {
            return res.json({ error_code: 404, message: 'Voucher not found' });
        }

        // Respond with a success message
        res.status(200).json({ error_code: 200, message: 'Voucher deleted successfully' });
    } catch (err) {
        console.error(err);
        // Respond with a server error
        res.status(500).json({ error_code: 500, message: 'Internal Server Error' });
    }
}


// ------------------------------------------------------


const changeStatusVoucher = async (req, res) => {
    try {
        const { id } = req.params;
        const VoucherData = await Voucher_Model.findById(id);
        if (!VoucherData) {
            return res.json({
                error_code: 404,
                message: 'Voucher not found'
            });
        }

        VoucherData.status = VoucherData.status === 'Active' ? 'Inactive' : 'Active';

        await VoucherData.save();
        res.status(200).json({
            message: `Voucher Status toggled successfully to ${VoucherData.status}`,
            VoucherData: {
                id: VoucherData.id,
                Status: VoucherData.status,
            }
        });
    } catch (err) {
        console.error('Error inside changeStatusVoucher', err);
        res.status(500).json({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
};


// --------------------------------------------------------

const updateVoucher = async (req, res) => {
    try {
        const voucherId = req.params.id;

        let existingVoucher = await Voucher_Model.findById(voucherId);

        if (!existingVoucher) {
            return res.json({ error_code: 404, message: 'Voucher not found' });
        }

        if (req.body.voucherName) existingVoucher.voucherName = req.body.voucherName;
        if (req.body.voucherPrice) existingVoucher.voucherPrice = req.body.voucherPrice;
        if (req.body.voucherDescription) existingVoucher.voucherDescription = req.body.voucherDescription;

        if (req.files && req.files.length > 0) {
            existingVoucher.voucherImage = "/uploads/" + req.files[0].filename;
        }

        const updatedVoucher = await existingVoucher.save();

        res.status(200).json({ error_code: 200, message: 'Voucher updated successfully', data: updatedVoucher });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error_code: 500, message: 'Internal Server Error' });
    }
};

// --------------------------------------------------------


module.exports = {
    createVoucher,
    getAllVoucher,
    deleteVoucher,
    changeStatusVoucher,
    updateVoucher,
}

