const GM_Model = require("../model/GM_Model")
const SM_Model = require("../model/SM_Model");
const DSM_Model = require("../model/SM_DSM_Model");
const CEO_Model = require("../model/CEO_Model");
const colors = require('colors');
const baseURL = require("../constant/baseURL");




// -----------------------------------------------------


const createDSM = async (req, res) => {
    try {
        const GM_Id = req.body.GM_Id;
        const GM_Admin = await GM_Model.findById(GM_Id);
        if (!GM_Admin) {
            console.log("GM not found");
            return res.json({ message: "GM is not found" });
        }

        const SM_Id = req.body.SM_Id;
        const SM_Admin = await SM_Model.findById(SM_Id);
        if (!SM_Admin) {
            console.log("SM not found");
            return res.json({ message: "SM is not found" });
        }

        const CEO_Id = SM_Admin.CEO_Id;
        console.log("CEO_Id -: ", CEO_Id);

        const { nameDSM, GM_Name, SM_Name, email, mobileNumber, password, state, city, stateId, cityId } = req.body;

        const existingEmail = await DSM_Model.findOne({ email });
        if (existingEmail) {
            console.log("Email already exists.");
            return res.json({
                error_code: 400,
                message: "Email already exists."
            });
        }

        const existingMobileNumber = await DSM_Model.findOne({ mobileNumber });
        if (existingMobileNumber) {
            console.log("Mobile number already exists.");
            return res.json({
                error_code: 400,
                message: "Mobile number already exists."
            });
        }

        const newDSM = new DSM_Model({
            nameDSM,
            GM_Id,
            GM_Name,
            SM_Id,
            SM_Name,
            CEO_Id,
            email,
            mobileNumber,
            password,
            state,
            city,
            stateId,
            cityId
        });

        const savedDSM = await newDSM.save();

        console.log("DSM created successfully:", savedDSM);

        const updatedSM = await SM_Model.findByIdAndUpdate(
            SM_Id,
            { $push: { DSM_Id: savedDSM._id } },
            { new: true }
        );

        console.log("Updated SM:", updatedSM);

        res.status(201).json({
            error_code: 200,
            message: 'DSM created successfully',
            dsm: savedDSM,
            SM: {
                id: updatedSM.id,
                nameSM: updatedSM.nameSM,
                DSM_Id: updatedSM.DSM_Id
            }
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            error_code: 500,
            message: "Internal Server Error: " + error.message
        });
    }
}

// --------------------------------------------------

const get_SM_List_from_GM = async (req, res) => {
    const GM_Id = req.params.id;
    try {
        const GM_Admin = await GM_Model.findById(GM_Id);

        if (!GM_Admin) {
            return res.json({ error_code: 404, message: 'GM not found' });
        }

        const SMsUnderGM = await SM_Model.find({ _id: { $in: GM_Admin.SM_Id } })
            .select('_id nameSM');

        if (SMsUnderGM.length === 0) {
            return res.json({ error_code: 404, message: 'No SMs found under this GM' });
        }

        res.status(200).json({
            error_code: 200,
            message: "GM Under SM List fetched Successfully.",
            GM_Name: GM_Admin.nameGM,
            GM_Id: GM_Admin._id,
            data: { SMsUnderGM }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error_code: 500,
            message: 'Internal Server Error' + error.message
        });
    }
};



// -----------------------------------------------------



const getAllDSM = async (req, res) => {
    try {
        const allDSM = await DSM_Model.find();

        res.status(200).json({
            error_code: 200,
            message: 'DSM documents fetched successfully',
            data: allDSM
        })

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error_code: 500,
            message: 'Internal Server Error' + error.message
        });
    }
};


// -----------------------------------------------------


const getDSMwithId = async (req, res) => {
    try {
        const dsmId = req.params.id;

        if (!dsmId) {
            return res.status(400).json({
                error_code: 400,
                message: "DSM ID is required."
            });
        }

        const dsm = await DSM_Model.findById(dsmId);

        if (!dsm) {
            return res.status(404).json({
                error_code: 404,
                message: "DSM not found."
            });
        }

        res.status(200).json({
            error_code: 200,
            message: 'DSM document fetched successfully',
            DSMdata: dsm
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error_code: 500,
            message: 'Internal Server Error' + error.message
        });
    }
};



// -----------------------------------------------------



const deleteDSMById = async (req, res) => {

    const DSM_Id = req.params.id;
    try {
        const deletedDSM = await DSM_Model.findByIdAndDelete(DSM_Id);

        if (!deletedDSM) {
            return res.status(404).json({
                error_code: 404,
                message: 'DSM not found'
            });
        }

        res.status(200).json({
            error_code: 200,
            message: 'DSM deleted successfully',
            deleted_dsm: deletedDSM
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
};


// -----------------------------------------------------
// changeStatusDSM/:id

const changeStatusDSM = async (req, res) => {
    try {
        const { id } = req.params;
        const DSMData = await DSM_Model.findById(id);
        if (!DSMData) {
            return res.status(404).json({
                error_code: 404,
                message: 'DSM not found'
            });
        }

        DSMData.status = DSMData.status === 'Active' ? 'Inactive' : 'Active';

        await DSMData.save();
        res.status(200).json({
            message: `DSM status toggled successfully to ${DSMData.status}`,
            DSMData: {
                id: DSMData.id,
                Status: DSMData.status
            }
        });
    } catch (err) {
        console.error('Error inside changeStatusDSM', err);
        res.status(500).json({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
};

// -----------------------------------------------------

const getDSMUnderParticularCEO = async function (req, res) {
    try {

        const CEO = await CEO_Model.findOne({
            _id: req.userId,
            adminType: "CEO"
        });
        console.log("CEO -: ", CEO);
        if (!CEO) {
            console.log("Unauthorized - CEO not found.");
            return res.json({ error_code: 401, message: "Unauthorized" });
        }



        const ceoId = CEO._id;
        console.log("CEO ID:", ceoId);

        // Step 2: Find all DSMs associated with this CEO's ID
        const allDSMs = await DSM_Model.find({ CEO_Id: ceoId });
        console.log("All DSMs under the CEO:", allDSMs);

        if (!allDSMs || allDSMs.length === 0) {
            console.log("No DSMs found for this CEO.");
            return res.json({
                error_code: 404,
                message: "No DSMs found for this CEO."
            });
        }

        return res.status(200).json({
            error_code: 200,
            message: "All DSMs fetched successfully for the CEO.",
            All_DSMs: allDSMs
        });

    } catch (error) {
        console.error("Error fetching DSMs:", error);
        return res.status(500).json({
            error_code: 500,
            message: "Internal Server Error " + error.message
        });
    }
};



// -----------------------------------------------------

const updateDSM = async (req, res) => {
    try {
        const dsmId = req.params.id;
        console.log("dsmId :- ", dsmId);

        if (!dsmId) {
            console.log("DSM ID is required.");
            return res.json({
                error_code: 400,
                message: "DSM ID is required."
            });
        }

        const { nameDSM, GM_Name, GM_Id, SM_Id, SM_Name, email, mobileNumber, password, state, city, stateId, cityId } = req.body;
        console.log("Request Body:", req.body);

        let updatedSM = null;

        // Check if SM ID or SM Name is updated
        if (SM_Id || SM_Name) {
            // Find the last SM associated with the DSM ID
            const lastSM = await SM_Model.findOne({ DSM_Id: dsmId });
            if (lastSM) {
                // Remove DSM ID from the last SM
                lastSM.DSM_Id = null;
                await lastSM.save();
                console.log("Removed DSM ID from the last SM:", lastSM);
            }

            // Update the new SM with the latest DSM ID
            updatedSM = await SM_Model.findByIdAndUpdate(SM_Id, { $set: { DSM_Id: dsmId, nameSM: SM_Name } }, { new: true });
            console.log("Updated new SM with the latest DSM ID:", updatedSM);
        }

        const existingDSM = await DSM_Model.findById(dsmId);
        if (!existingDSM) {
            console.log("DSM not found");
            return res.json({ message: "DSM is not found" });
        }

        if (email) {
            const existingEmail = await DSM_Model.findOne({ email });
            if (existingEmail && existingEmail._id.toString() !== dsmId) {
                console.log("Email already exists. Please provide a unique email.");
                return res.json({
                    error_code: 400,
                    message: "Email already exists. Please provide a unique email."
                });
            }
        }

        if (mobileNumber) {
            const existingMobileNumber = await DSM_Model.findOne({ mobileNumber });
            if (existingMobileNumber && existingMobileNumber._id.toString() !== dsmId) {
                console.log("MobileNumber already exists. Please provide a unique MobileNumber.");
                return res.json({
                    error_code: 400,
                    message: "MobileNumber already exists. Please provide a unique MobileNumber."
                });
            }
        }

        // Update DSM fields
        existingDSM.nameDSM = nameDSM;
        existingDSM.GM_Name = GM_Name;
        existingDSM.GM_Id = GM_Id;
        existingDSM.SM_Id = SM_Id;
        existingDSM.SM_Name = SM_Name;
        existingDSM.email = email;
        existingDSM.mobileNumber = mobileNumber;
        existingDSM.password = password;
        existingDSM.state = state;
        existingDSM.city = city;
        existingDSM.stateId = stateId;
        existingDSM.cityId = cityId;

        const updatedDSM = await existingDSM.save();
        console.log("Updated DSM:", updatedDSM);

        res.status(200).json({
            error_code: 200,
            message: 'DSM updated successfully',
            dsm: updatedDSM,
            SMs: updatedSM ? {
                id: updatedSM._id,
                name: updatedSM.nameSM,
                DSM_ID: updatedSM.DSM_Id,
            } : null,
        });

    } catch (err) {
        console.error('Error inside updateDSM', err);
        res.status(500).json({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
};




// -----------------------------------------------------


const createDSMfromGM = async (req, res) => {
    try {
        const GM = await GM_Model.findOne({
            _id: req.userId,
            adminType: "GM"
        });

        if (!GM) {
            console.log("Unauthorized - GM not found.");
            return res.status(401).json({ error_code: 401, message: "Unauthorized" });
        }

        const SM_Id = req.body.SM_Id;
        const SM_Admin = await SM_Model.findById(SM_Id);
        if (!SM_Admin) {
            console.log("SM not found");
            return res.status(404).json({ error_code: 404, message: "SM not found" });
        }

        const { nameDSM, SM_Name, email, mobileNumber, password, state, city, stateId, cityId } = req.body;

        const existingEmail = await DSM_Model.findOne({ email });
        if (existingEmail) {
            console.log("Email already exists.");
            return res.status(400).json({ error_code: 400, message: "Email already exists." });
        }

        const existingMobileNumber = await DSM_Model.findOne({ mobileNumber });
        if (existingMobileNumber) {
            console.log("Mobile number already exists.");
            return res.status(400).json({ error_code: 400, message: "Mobile number already exists." });
        }

        const newDSM = new DSM_Model({
            nameDSM,
            GM_Name: GM.nameGM,
            GM_Id: GM.id,
            SM_Id,
            SM_Name,
            email,
            mobileNumber,
            password,
            state,
            city,
            stateId,
            cityId,
            CEO_Id: SM_Admin.CEO_Id
        });

        const savedDSM = await newDSM.save();

        console.log("DSM created successfully:", savedDSM);

        const updatedSM = await SM_Model.findByIdAndUpdate(
            SM_Id,
            { $push: { DSM_Id: savedDSM._id } },
            { new: true }
        );

        console.log("Updated SM:", updatedSM);

        return res.status(201).json({
            error_code: 200,
            message: 'DSM created successfully',
            dsm: savedDSM,
            SM: {
                id: updatedSM.id,
                nameSM: updatedSM.nameSM,
                DSM_Id: updatedSM.DSM_Id
            }
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error_code: 500, message: "Internal Server Error: " + error.message });
    }
};


// =======================================================================


const getALLDSMRecordsFromGM = async (req, res) => {
    try {

        const GM = await GM_Model.findOne({
            _id: req.userId,
            adminType: "GM"
        });

        // If GM not found, return Unauthorized error
        if (!GM) {
            console.log("Unauthorized - GM not found.");
            return res.status(401).json({ error_code: 401, message: "Unauthorized" });
        }

        // Find DSM records associated with the GM's ID
        const dsmRecords = await DSM_Model.find({ GM_Id: GM._id });

        return res.status(200).json({
            error_code: 200,
            message: 'DSM records retrieved successfully for the GM',
            dsmRecords
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error_code: 500, message: "Internal Server Error: " + error.message });
    }
};


// =========================================================================

const updateDSMfromGM = async (req, res) => {
    try {
        const dsmId = req.params.id;
        const { SM_Id: newSM_Id, SM_Name: newSM_Name, email, mobileNumber } = req.body;

        const dsmToUpdate = await DSM_Model.findById(dsmId);

        if (!dsmToUpdate) {
            console.log("DSM not found.");
            return res.status(404).json({ message: "DSM not found" });
        }

        // Check if the provided email already exists for another DSM
        const existingEmail = await DSM_Model.findOne({ email, _id: { $ne: dsmId } });
        if (existingEmail) {
            console.log("Email already exists.");
            return res.status(400).json({
                error_code: 400,
                message: "Email already exists."
            });
        }

        // Check if the provided mobile number already exists for another DSM
        const existingMobileNumber = await DSM_Model.findOne({ mobileNumber, _id: { $ne: dsmId } });
        if (existingMobileNumber) {
            console.log("Mobile number already exists.");
            return res.status(400).json({
                error_code: 400,
                message: "Mobile number already exists."
            });
        }

        // If SM_Id or SM_Name has changed
        if (newSM_Id !== dsmToUpdate.SM_Id || newSM_Name !== dsmToUpdate.SM_Name) {
            // Find the previous SM and remove DSM_Id from its DSM_Id array
            const previousSM = await SM_Model.findById(dsmToUpdate.SM_Id);
            if (previousSM) {
                await SM_Model.findByIdAndUpdate(
                    dsmToUpdate.SM_Id,
                    { $pull: { DSM_Id: dsmId } },
                    { new: true }
                );
            }

            // Update DSM data with new SM information
            dsmToUpdate.nameDSM = req.body.nameDSM || dsmToUpdate.nameDSM;
            dsmToUpdate.email = email || dsmToUpdate.email;
            dsmToUpdate.mobileNumber = mobileNumber || dsmToUpdate.mobileNumber;
            dsmToUpdate.password = req.body.password || dsmToUpdate.password;
            dsmToUpdate.state = req.body.state || dsmToUpdate.state;
            dsmToUpdate.city = req.body.city || dsmToUpdate.city;
            dsmToUpdate.stateId = req.body.stateId || dsmToUpdate.stateId;
            dsmToUpdate.cityId = req.body.cityId || dsmToUpdate.cityId;
            dsmToUpdate.SM_Id = newSM_Id;
            dsmToUpdate.SM_Name = newSM_Name;

            // Save the updated DSM
            const updatedDSM = await dsmToUpdate.save();

            // Add DSM_Id to the new SM's DSM_Id array
            await SM_Model.findByIdAndUpdate(
                newSM_Id,
                { $addToSet: { DSM_Id: dsmId } },
                { new: true }
            );

            console.log("DSM updated successfully:", updatedDSM);

            return res.status(200).json({
                error_code: 200,
                message: "DSM updated successfully.",
                DSM: updatedDSM
            });
        }

        // If SM_Id and SM_Name are not changed, update DSM without affecting SM
        dsmToUpdate.nameDSM = req.body.nameDSM || dsmToUpdate.nameDSM;
        dsmToUpdate.email = email || dsmToUpdate.email;
        dsmToUpdate.mobileNumber = mobileNumber || dsmToUpdate.mobileNumber;
        dsmToUpdate.password = req.body.password || dsmToUpdate.password;
        dsmToUpdate.state = req.body.state || dsmToUpdate.state;
        dsmToUpdate.city = req.body.city || dsmToUpdate.city;
        dsmToUpdate.stateId = req.body.stateId || dsmToUpdate.stateId;
        dsmToUpdate.cityId = req.body.cityId || dsmToUpdate.cityId;

        // Save the updated DSM
        const updatedDSM = await dsmToUpdate.save();

        console.log("DSM updated successfully:", updatedDSM);

        return res.status(200).json({
            error_code: 200,
            message: "DSM updated successfully.",
            DSM: updatedDSM
        });
    } catch (error) {
        console.error("Error updating DSM:", error);
        return res.status(500).json({
            error_code: 500,
            message: "Internal Server Error: " + error.message
        });
    }
}



const getDSMRecordsFromGM = async (req, res) => {
    try {
        // Find the GM using the provided user ID
        const GM = await GM_Model.findOne({
            _id: req.userId,
            adminType: "GM"
        });

        // If GM not found, return Unauthorized error
        if (!GM) {
            console.log("Unauthorized - GM not found.");
            return res.status(401).json({ error_code: 401, message: "Unauthorized" });
        }

        // Extract the DSM record ID from the request parameters
        const dsmId = req.params.id;

        // Find the DSM record associated with the provided ID and the GM's ID
        const dsmRecord = await DSM_Model.findOne({ _id: dsmId, GM_Id: GM._id });

        // If DSM record not found, return Not Found error
        if (!dsmRecord) {
            console.log("DSM record not found.");
            return res.status(404).json({ error_code: 404, message: "DSM record not found" });
        }

        // Return the specific DSM record
        return res.status(200).json({
            error_code: 200,
            message: 'DSM record retrieved successfully',
            dsmRecord
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error_code: 500, message: "Internal Server Error: " + error.message });
    }
};


// =====================================================================================================

//---------------------------------------------------------------
// Update DSM Login 

const updateDSMAdmin = async function (req, res) {
    try {
        let dsmId = req.userId;
        let dsm = await DSM_Model.findById(dsmId);
        let obj = {
            nameDSM: req.body.nameDSM ? req.body.nameDSM : dsm.nameDSM,
            email: req.body.email ? req.body.email : dsm.email,
            mobileNumber: req.body.mobileNumber ? req.body.mobileNumber : dsm.mobileNumber,
        };

        // Update DSM information in the database
        await DSM_Model.findOneAndUpdate(
            { _id: dsmId },
            { $set: obj },
            { new: true }
        );

        return res.status(200).json({
            error_code: 200,
            message: "DSM updated successfully",
            UpdatedDSM: obj,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error_code: 500, message: "Internal Server Error" + error.message });
    }
};



// // --------------------------------------------------------

const update_DSMAdmin_image = async function (req, res) {
    try {
        let dsmId = req.userId;
        let baseUrl = baseURL.generateBaseUrl(req);
        let dsm = await DSM_Model.findById(dsmId);
        console.log("dsm -: ", dsm);
        if (!req.files || req.files.length === 0) {
            return res.json({ error_code: 400, message: "No image uploaded" });
        }

        let profileImageUrl = "/uploads/" + req.files[0].filename;

        await DSM_Model.findOneAndUpdate(
            { _id: dsmId },
            { $set: { profileImage: profileImageUrl } },
            { new: true }
        );

        return res.status(200).json({
            error_code: 200,
            message: "DSM profile image updated successfully",
            profileImage: profileImageUrl
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error_code: 500, message: "Internal server error" });
    }
};



// ----------------------------------------------------------- 



const updateDSMAdminPassword = async function (req, res) {
    try {
        const dsmId = req.userId;
        const newPassword = req.body.confirmPassword;

        if (!newPassword) {
            return res.status(400).json({ error_code: 400, message: 'New password is required' });
        }

        const updatedDSM = await DSM_Model.findByIdAndUpdate(
            dsmId,
            { password: newPassword },
            { new: true }
        );

        if (!updatedDSM) {
            return res.status(404).json({ error_code: 404, message: 'DSM admin not found' });
        }

        return res.status(200).json({ error_code: 200, message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error_code: 500, message: 'Error occurred while changing password' });
    }
};

// ------------------------------------------------------------------

const getDSMAdminProfile = async function (req, res) {
    try {
        let dsmId = req.userId;
        let baseUrl = baseURL.generateBaseUrl(req);

        let dsmAdmin = await DSM_Model.findById(dsmId);
        let obj = {
            nameDSM: dsmAdmin.nameDSM ? dsmAdmin.nameDSM : undefined,
            email: dsmAdmin.email ? dsmAdmin.email : undefined,
            mobileNumber: dsmAdmin.mobileNumber ? dsmAdmin.mobileNumber : undefined,
            profileImage: dsmAdmin.profileImage ? `${baseUrl}${dsmAdmin.profileImage}` : undefined
        }
        return res.status(200).json({ error_code: 200, obj })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error_code: 500, message: 'Error inside getDSMAdminProfile in DSM controller..!' })
    }
};
















module.exports = {

    createDSM,
    get_SM_List_from_GM,
    getAllDSM,
    deleteDSMById,
    updateDSM,
    changeStatusDSM,
    getDSMUnderParticularCEO,
    getDSMwithId,

    //================

    createDSMfromGM,
    getALLDSMRecordsFromGM,
    updateDSMfromGM,
    getDSMRecordsFromGM,


    updateDSMAdmin,
    update_DSMAdmin_image,
    updateDSMAdminPassword,
    getDSMAdminProfile,



};