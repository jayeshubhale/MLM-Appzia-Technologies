const GM_Model = require("../model/GM_Model")
const SM_Model = require("../model/SM_Model");
const DSM_Model = require("../model/SM_DSM_Model");
const SA_Model = require("../model/SM_SA_Model");
const colors = require('colors');
const CEO_Model = require("../model/CEO_Model");
const baseURL = require("../constant/baseURL");


// -------------------------------------------------------------


const createSA = async (req, res) => {
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

        const { nameSA, GM_Name, SM_Name, email, mobileNumber, password } = req.body;

        const existingEmail = await SA_Model.findOne({ email });
        if (existingEmail) {
            console.log("Email already exists.");
            return res.json({
                error_code: 400,
                message: "Email already exists."
            });
        }

        const existingMobileNumber = await SA_Model.findOne({ mobileNumber });
        if (existingMobileNumber) {
            console.log("Mobile number already exists.");
            return res.json({
                error_code: 400,
                message: "Mobile number already exists."
            });
        }

        const newSA = new SA_Model({
            nameSA,
            CEO_Id,
            GM_Id,
            GM_Name,
            SM_Id,
            SM_Name,
            email,
            mobileNumber,
            password,

        });

        const savedSA = await newSA.save();

        console.log("SA created successfully:", savedSA);

        const updatedSM = await SM_Model.findByIdAndUpdate(
            SM_Id,
            { $push: { SA_Id: savedSA._id } },
            { new: true }
        );

        console.log("Updated SM:", updatedSM);

        res.status(201).json({
            error_code: 200,
            message: 'SA created successfully',
            SA: savedSA,
            SM: {
                id: updatedSM.id,
                nameSM: updatedSM.nameSM,
                SA_Id: updatedSM.SA_Id
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


// -------------------------------------------------------------

const getSAwithId = async (req, res) => {
    try {
        const saId = req.params.id;

        if (!saId) {
            return res.json({
                error_code: 400,
                message: "SA ID is required."
            });
        }

        const sa = await SA_Model.findById(saId);

        if (!sa) {
            return res.json({
                error_code: 404,
                message: "SA not found."
            });
        }

        res.status(200).json({
            error_code: 200,
            message: 'SA document fetched successfully',
            SAdata: sa
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



const getAllSA = async (req, res) => {
    try {
        const allSA = await SA_Model.find();

        res.status(200).json({
            error_code: 200,
            message: 'SA documents fetched successfully',
            data: allSA
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



const deleteSAById = async (req, res) => {

    const SA_Id = req.params.id;
    try {
        const deletedSA = await SA_Model.findByIdAndDelete(SA_Id);

        if (!deletedSA) {
            return res.status(404).json({
                error_code: 404,
                message: 'SA not found'
            });
        }

        res.status(200).json({
            error_code: 200,
            message: 'SA deleted successfully',
            // deleted_sa: deletedSA
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


// ----------------------------------------------------
// changeStatusSA/:id

const changeStatusSA = async (req, res) => {
    try {
        const { id } = req.params;
        const SAData = await SA_Model.findById(id);
        if (!SAData) {
            return res.status(404).json({
                error_code: 404,
                message: 'SA not found'
            });
        }

        SAData.status = SAData.status === 'Active' ? 'Inactive' : 'Active';

        await SAData.save();
        res.status(200).json({
            message: `SA status toggled successfully to ${SAData.status}`,
            SAData: {
                id: SAData.id,
                Status: SAData.status
            }
        });
    } catch (err) {
        console.error('Error inside changeStatusSA', err);
        res.status(500).json({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
};
// ------------------------------------------------------


const getSAUnderParticularCEO = async function (req, res) {
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

        // Step 2: Find all SAs associated with this CEO's ID
        const allSAs = await SA_Model.find({ CEO_Id: ceoId });
        console.log("All SAs under the CEO:", allSAs);

        if (!allSAs || allSAs.length === 0) {
            console.log("No SAs found for this CEO.");
            return res.json({
                error_code: 404,
                message: "No SAs found for this CEO."
            });
        }

        return res.status(200).json({
            error_code: 200,
            message: "All SAs fetched successfully for the CEO.",
            All_SAs: allSAs
        });

    } catch (error) {
        console.error("Error fetching SAs:", error);
        return res.status(500).json({
            error_code: 500,
            message: "Internal Server Error " + error.message
        });
    }
};

//-------------------------------------------------------------
const mongoose = require('mongoose');

const updateSA = async (req, res) => {
    try {
        const saId = req.params.id;
        console.log("saId :- ", saId);

        // Check if the provided SA ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(saId)) {
            console.log("Invalid SA ID.");
            return res.status(400).json({
                error_code: 400,
                message: "Invalid SA ID."
            });
        }

        const { nameSA, GM_Name, GM_Id, SM_Id, SM_Name, email, mobileNumber, password } = req.body;
        console.log("Request Body:", req.body);

        const existingSA = await SA_Model.findById(saId);
        if (!existingSA) {
            console.log("SA not found");
            return res.status(404).json({ message: "SA is not found" });
        }

        // Check if email already exists for another SA
        if (email) {
            const existingEmail = await SA_Model.findOne({ email, _id: { $ne: saId } });
            if (existingEmail) {
                console.log("Email already exists. Please provide a unique email.");
                return res.status(400).json({
                    error_code: 400,
                    message: "Email already exists. Please provide a unique email."
                });
            }
        }

        // Check if mobile number already exists for another SA
        if (mobileNumber) {
            const existingMobileNumber = await SA_Model.findOne({ mobileNumber, _id: { $ne: saId } });
            if (existingMobileNumber) {
                console.log("MobileNumber already exists. Please provide a unique MobileNumber.");
                return res.status(400).json({
                    error_code: 400,
                    message: "MobileNumber already exists. Please provide a unique MobileNumber."
                });
            }
        }


        let updatedSM = null;

        if (SM_Id || SM_Name) {
            const lastSM = await SM_Model.findOne({ SA_Id: saId });
            if (lastSM) {
                lastSM.SA_Id = null;
                await lastSM.save();
                console.log("Removed SA ID from the last SM:", lastSM);
            }

            // Update the new SM with the latest DSM ID
            updatedSM = await SM_Model.findByIdAndUpdate(SM_Id, { $set: { SA_Id: saId, nameSM: SM_Name } }, { new: true });
            console.log("Updated new SM with the latest SA ID:", updatedSM);
        }

        // Update SA fields
        existingSA.nameSA = nameSA;
        existingSA.GM_Name = GM_Name;
        existingSA.GM_Id = GM_Id;
        existingSA.SM_Id = SM_Id;
        existingSA.SM_Name = SM_Name;
        existingSA.email = email;
        existingSA.mobileNumber = mobileNumber;
        existingSA.password = password;

        const updatedSA = await existingSA.save();
        console.log("Updated SA:", updatedSA);

        res.status(200).json({
            error_code: 200,
            message: 'SA updated successfully',
            sa: updatedSA,
            sm: updatedSM ? {
                id: updatedSM._id,
                name: updatedSM.nameSM,
                SA_ID: updatedSM.SA_Id,
            } : null,
        });

    } catch (err) {
        console.error('Error inside updateSA', err);
        return res.status(500).json({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
};


// =========================================================================
// =========================================================================

const createSAfromGM = async (req, res) => {
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

        const { nameSA, SM_Name, email, mobileNumber, password } = req.body;

        // Validate required fields
        if (!nameSA || !SM_Name || !email || !mobileNumber || !password) {
            console.log("Missing required fields.");
            return res.status(400).json({ error_code: 400, message: "Missing required fields." });
        }

        const existingEmail = await SA_Model.findOne({ email });
        if (existingEmail) {
            console.log("Email already exists.");
            return res.status(400).json({ error_code: 400, message: "Email already exists." });
        }

        const existingMobileNumber = await SA_Model.findOne({ mobileNumber });
        if (existingMobileNumber) {
            console.log("Mobile number already exists.");
            return res.status(400).json({ error_code: 400, message: "Mobile number already exists." });
        }

        const newSA = new SA_Model({
            nameSA,
            GM_Name: GM.nameGM,
            GM_Id: GM.id,
            SM_Id,
            SM_Name,
            email,
            mobileNumber,
            password,
            CEO_Id: SM_Admin.CEO_Id

        });

        const savedSA = await newSA.save();

        console.log("SA created successfully:", savedSA);

        const updatedSM = await SM_Model.findByIdAndUpdate(
            SM_Id,
            { $push: { SA_Id: savedSA._id } },
            { new: true }
        );

        console.log("Updated SM:", updatedSM);

        return res.status(201).json({
            error_code: 200,
            message: 'SA created successfully',
            sa: savedSA,
            SM: {
                id: updatedSM.id,
                nameSM: updatedSM.nameSM,
                SA_Id: updatedSM.SA_Id
            }
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error_code: 500, message: "Internal Server Error: " + error.message });
    }
};

// =====================================================================

const getALLSARecordsFromGM = async (req, res) => {
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

        // Find SA records associated with the GM's ID
        const saRecords = await SA_Model.find({ GM_Id: GM._id });

        return res.status(200).json({
            error_code: 200,
            message: 'SA records retrieved successfully for the GM',
            saRecords
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error_code: 500, message: "Internal Server Error: " + error.message });
    }
};

// =====================================================================

const updateSAfromGM = async (req, res) => {
    try {
        const saId = req.params.id;
        const { SM_Id: newSM_Id, SM_Name: newSM_Name, email, mobileNumber } = req.body;

        const saToUpdate = await SA_Model.findById(saId);

        if (!saToUpdate) {
            console.log("SA not found.");
            return res.status(404).json({ message: "SA not found" });
        }

        // Check if the provided email already exists for another SA
        const existingEmail = await SA_Model.findOne({ email, _id: { $ne: saId } });
        if (existingEmail) {
            console.log("Email already exists.");
            return res.status(400).json({
                error_code: 400,
                message: "Email already exists."
            });
        }

        // Check if the provided mobile number already exists for another SA
        const existingMobileNumber = await SA_Model.findOne({ mobileNumber, _id: { $ne: saId } });
        if (existingMobileNumber) {
            console.log("Mobile number already exists.");
            return res.status(400).json({
                error_code: 400,
                message: "Mobile number already exists."
            });
        }

        // If SM_Id or SM_Name has changed
        if (newSM_Id !== saToUpdate.SM_Id || newSM_Name !== saToUpdate.SM_Name) {
            // Find the previous SM and remove SA_Id from its SA_Id array
            const previousSM = await SM_Model.findById(saToUpdate.SM_Id);
            if (previousSM) {
                await SM_Model.findByIdAndUpdate(
                    saToUpdate.SM_Id,
                    { $pull: { SA_Id: saId } },
                    { new: true }
                );
            }

            // Update SA data with new SM information
            saToUpdate.nameSA = req.body.nameSA || saToUpdate.nameSA;
            saToUpdate.email = email || saToUpdate.email;
            saToUpdate.mobileNumber = mobileNumber || saToUpdate.mobileNumber;
            saToUpdate.password = req.body.password || saToUpdate.password;
            saToUpdate.SM_Id = newSM_Id;
            saToUpdate.SM_Name = newSM_Name;

            // Save the updated SA
            const updatedSA = await saToUpdate.save();

            // Add SA_Id to the new SM's SA_Id array
            await SM_Model.findByIdAndUpdate(
                newSM_Id,
                { $addToSet: { SA_Id: saId } },
                { new: true }
            );

            console.log("SA updated successfully:", updatedSA);

            return res.status(200).json({
                error_code: 200,
                message: "SA updated successfully.",
                SA: updatedSA
            });
        }

        // If SM_Id and SM_Name are not changed, update SA without affecting SM
        saToUpdate.nameSA = req.body.nameSA || saToUpdate.nameSA;
        saToUpdate.email = email || saToUpdate.email;
        saToUpdate.mobileNumber = mobileNumber || saToUpdate.mobileNumber;
        saToUpdate.password = req.body.password || saToUpdate.password;

        // Save the updated SA
        const updatedSA = await saToUpdate.save();

        console.log("SA updated successfully:", updatedSA);

        return res.status(200).json({
            error_code: 200,
            message: "SA updated successfully.",
            SA: updatedSA
        });
    } catch (error) {
        console.error("Error updating SA:", error);
        return res.status(500).json({
            error_code: 500,
            message: "Internal Server Error: " + error.message
        });
    }
};


// ------------------------------------------------------------

const getSARecordsFromGM = async (req, res) => {
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

        // Extract the SA record ID from the request parameters
        const saId = req.params.id;

        // Find the SA record associated with the provided ID and the GM's ID
        const saRecord = await SA_Model.findOne({ _id: saId, GM_Id: GM._id });

        // If SA record not found, return Not Found error
        if (!saRecord) {
            console.log("SA record not found.");
            return res.status(404).json({ error_code: 404, message: "SA record not found" });
        }

        // Return the specific SA record
        return res.status(200).json({
            error_code: 200,
            message: 'SA record retrieved successfully',
            saRecord
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error_code: 500, message: "Internal Server Error: " + error.message });
    }
};

// ------------------------------------------------------------

//---------------------------------------------------------------
// Update SA Login 

const updateSAAdmin = async function (req, res) {
    try {
        let saId = req.userId;
        let sa = await SA_Model.findById(saId);
        let obj = {
            nameSA: req.body.nameSA ? req.body.nameSA : sa.nameSA,
            email: req.body.email ? req.body.email : sa.email,
            mobileNumber: req.body.mobileNumber ? req.body.mobileNumber : sa.mobileNumber,
        };

        // Update SA information in the database
        await SA_Model.findOneAndUpdate(
            { _id: saId },
            { $set: obj },
            { new: true }
        );

        return res.status(200).json({
            error_code: 200,
            message: "SA updated successfully",
            UpdatedSA: obj,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error_code: 500, message: "Internal Server Error" + error.message });
    }
};




// --------------------------------------------------------

const update_SAAdmin_image = async function (req, res) {
    try {
        let saId = req.userId;
        let baseUrl = baseURL.generateBaseUrl(req);
        let sa = await SA_Model.findById(saId);
        console.log("sa -: ", sa);
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error_code: 400, message: "No image uploaded" });
        }

        let profileImageUrl = "/uploads/" + req.files[0].filename;

        await SA_Model.findOneAndUpdate(
            { _id: saId },
            { $set: { profileImage: profileImageUrl } },
            { new: true }
        );

        return res.status(200).json({
            error_code: 200,
            message: "SA profile image updated successfully",
            profileImage: profileImageUrl
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error_code: 500, message: "Internal server error" });
    }
};




// // ----------------------------------------------------------- 



const update_SAAdminPassword = async function (req, res) {
    try {
        const saId = req.userId;
        const newPassword = req.body.confirmPassword;

        if (!newPassword) {
            return res.status(400).json({ error_code: 400, message: 'New password is required' });
        }

        const updatedSA = await SA_Model.findByIdAndUpdate(
            saId,
            { password: newPassword },
            { new: true }
        );

        if (!updatedSA) {
            return res.status(404).json({ error_code: 404, message: 'SA admin not found' });
        }

        return res.status(200).json({ error_code: 200, message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error_code: 500, message: 'Error occurred while changing password' });
    }
};


// ------------------------------------------------------------------

const get_SAAdminProfile = async function (req, res) {
    try {
        let saId = req.userId;
        let baseUrl = baseURL.generateBaseUrl(req);
        let saAdmin = await SA_Model.findById(saId);
        let obj = {
            nameSA: saAdmin.nameSA ? saAdmin.nameSA : undefined,
            email: saAdmin.email ? saAdmin.email : undefined,
            mobileNumber: saAdmin.mobileNumber ? saAdmin.mobileNumber : undefined,
            profileImage: saAdmin.profileImage ? `${baseUrl}${saAdmin.profileImage}` : undefined
        }
        return res.status(200).json({ error_code: 200, obj })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error_code: 500, message: 'Error inside get_SAAdminProfile in SA controller..!' })
    }
};





module.exports = {

    createSA,
    getAllSA,
    deleteSAById,
    updateSA,
    changeStatusSA,
    getSAUnderParticularCEO,
    getSAwithId,

    // =======================================

    createSAfromGM,
    getALLSARecordsFromGM,
    updateSAfromGM,
    getSARecordsFromGM,

    updateSAAdmin,
    update_SAAdmin_image,
    update_SAAdminPassword,
    get_SAAdminProfile,



}


