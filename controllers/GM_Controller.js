const GM_Model = require("../model/GM_Model")
const CEO_Model = require("../model/CEO_Model");
const colors = require('colors');
const baseURL = require("../constant/baseURL");

const SM_Model = require("../model/SM_Model");
const DSM_Model = require("../model/SM_DSM_Model");
const SA_Model = require("../model/SM_SA_Model");
const User_Model = require("../model/UserModel");

// --------------------------------------------------------------------

const createGM = async (req, res) => {
    try {
        const CEO_Id = req.body.CEO_Id;

        const CEO_Admin = await CEO_Model.findById(CEO_Id);
        if (!CEO_Admin) {
            return res.json({ message: "CEO not found" });
        }

        const { CEO_Name, nameGM, email, password, mobileNumber } = req.body;

        const existingEmail = await GM_Model.findOne({ email });
        if (existingEmail) {
            return res.json({
                error_code: 400,
                message: "Email already exists."
            });
        }

        const existingMobileNumber = await GM_Model.findOne({ mobileNumber });
        if (existingMobileNumber) {
            return res.json({
                error_code: 400,
                message: "Mobile number already exists."
            });
        }

        const newGM = new GM_Model({
            nameGM,
            CEO_Id,
            CEO_Name,
            email,
            password,
            mobileNumber
        });

        const savedGM = await newGM.save();

        const updatedCEO = await CEO_Model.findByIdAndUpdate(
            CEO_Id,
            { $push: { GM_Id: savedGM._id } },
            { new: true }
        );

        return res.status(200).json({
            error_code: 200,
            message: "GM created successfully and associated with CEO.",
            GM: savedGM,
            CEO: updatedCEO
        });
    } catch (error) {
        console.error("Error creating GM:", error);
        return res.status(500).json({
            error_code: 500,
            message: "Internal Server Error" + error.message
        });
    }
};

// --------------------------------------------------------------------

const getAllGM = async function (req, res) {
    try {

        const allGMs = await GM_Model.find();

        if (!allGMs || allGMs.length === 0) {
            return res.status(404).json({
                error_code: 404,
                message: "No GMs found."
            });
        }

        return res.status(200).json({
            error_code: 200,
            message: "All GMs fetched successfully.",
            All_GMs: allGMs
        });

    } catch (error) {
        console.error("Error fetching all GMs:", error);
        return res.status(500).json({
            error_code: 500,
            message: "Internal Server Error" + error.message
        });
    }
};

// -------------------------------------------------------------

const getGMwithId = async function (req, res) {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                error_code: 400,
                message: "GM ID is required."
            });
        }

        const gm = await GM_Model.findById(id);

        if (!gm) {
            return res.status(404).json({
                error_code: 404,
                message: "GM not found."
            });
        }

        return res.status(200).json({
            error_code: 200,
            message: "GM fetched successfully.",
            GM: gm
        });
    } catch (error) {
        console.error("Error fetching GM:", error);
        return res.status(500).json({
            error_code: 500,
            message: "Internal Server Error" + error.message
        });
    }
};


// --------------------------------------------------------------------


const getSelect_GM_List = async function (req, res) {
    try {
        const GMs = await GM_Model.find({}, 'nameGM id');

        return res.status(200).json({
            error_code: 200,
            message: "GMs list fetched successfully.",
            GMs_List: GMs
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error_code: 500,
            message: "Internal Server Error" + error.message
        });
    }
};

// --------------------------------------------------------------------

const updateGM = async (req, res) => {
    try {
        const gmId = req.params.id;
        const { CEO_Id, CEO_Name, nameGM, email, password, mobileNumber } = req.body;
        console.log("Updating GM with ID:", gmId);

        // -------------------------------------------------------

        if (email) {
            const existingEmail = await GM_Model.findOne({ email });
            if (existingEmail && existingEmail._id.toString() !== gmId) {
                return res.json({
                    error_code: 400,
                    message: "Email already exists. Please provide a unique email."
                });
            }
        }

        if (mobileNumber) {
            const existingmobileNumber = await GM_Model.findOne({ mobileNumber });
            if (existingmobileNumber && existingmobileNumber._id.toString() !== gmId) {
                return res.json({
                    error_code: 400,
                    message: "MobileNumber already exists. Please provide a unique MobileNumber."
                });
            }
        }

        // -------------------------------------------------------------

        if (!gmId) {
            return res.json({
                error_code: 400,
                message: "GM ID is required."
            });
        }

        const existingGM = await GM_Model.findById(gmId);
        if (!existingGM) {
            return res.status(404).json({
                error_code: 404,
                message: "GM not found."
            });
        }

        console.log("Existing GM:".bgRed, existingGM);

        // Check if CEO_Id is provided and if it's different from the current CEO
        if (CEO_Id && CEO_Id !== existingGM.CEO_Id?.toString()) { // Using optional chaining
            console.log("New CEO ID:", CEO_Id);

            // Find the existing CEO and update the GM_Id field
            const existingCEO = await CEO_Model.findById(existingGM.CEO_Id);
            if (existingCEO) {
                console.log("Removing GM ID from existing CEO:", existingGM._id);
                existingCEO.GM_Id = existingCEO.GM_Id.filter(id => id.toString() !== gmId);
                await existingCEO.save();
            }

            // Update the GM with the new CEO_Id
            existingGM.CEO_Id = CEO_Id;

            // Find the new CEO and update the GM_Id field
            const updatedCEO = await CEO_Model.findByIdAndUpdate(
                CEO_Id,
                { $addToSet: { GM_Id: gmId } },
                { new: true }
            );
            console.log("Updated CEO:".bgCyan, updatedCEO);
        }

        // Check if CEO_Name is provided and if it's different from the current CEO name
        if (CEO_Name && CEO_Name !== existingGM.CEO_Name) {
            console.log("New CEO Name:", CEO_Name);

            // Find the existing CEO and update the GM_Id field
            const existingCEO = await CEO_Model.findOne({ CEO_Name });
            if (existingCEO) {
                console.log("Adding GM ID to existing CEO:", existingGM._id);
                existingCEO.GM_Id.push(existingGM._id);
                await existingCEO.save();
            }

            // Update the GM with the new CEO_Name
            existingGM.CEO_Name = CEO_Name;
        }

        // Update the GM details
        existingGM.nameGM = nameGM;
        existingGM.email = email;
        existingGM.password = password;
        existingGM.mobileNumber = mobileNumber;

        console.log("Updated GM details:".bgYellow, existingGM);

        const updatedGM = await existingGM.save();

        return res.status(200).json({
            error_code: 200,
            message: "GM updated successfully.",
            GM: updatedGM
        });
    } catch (error) {
        console.error("Error updating GM:", error);
        return res.status(500).json({
            error_code: 500,
            message: "Internal Server Error" + error.message
        });
    }
};


// --------------------------------------------------------------------

const deleteGM = async function (req, res) {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                error_code: 400,
                message: "GM ID is required."
            });
        }

        const deletedGM = await GM_Model.findByIdAndDelete(id);

        if (!deletedGM) {
            return res.status(404).json({
                error_code: 404,
                message: "GM not found."
            });
        }

        return res.status(200).json({
            error_code: 200,
            message: "GM deleted successfully.",
            // deletedGM   
        });

    } catch (error) {
        console.error("Error deleting GM:", error);
        return res.status(500).json({
            error_code: 500,
            message: "Internal Server Error" + error.message
        });
    }
};

// ----------------------------------------------
// changeStatusGM/:id

const changeStatusGM = async (req, res) => {
    try {
        const { id } = req.params;
        const GMData = await GM_Model.findById(id);
        if (!GMData) {
            return res.status(404).json({
                error_code: 404,
                message: 'GM not found'
            });
        }

        GMData.status = GMData.status === 'Active' ? 'Inactive' : 'Active';

        await GMData.save();
        res.status(200).json({
            message: `GM status toggled successfully to ${GMData.status}`,
            GMData: {
                id: GMData.id,
                Status: GMData.status,
            }
        });
    } catch (err) {
        console.error('Error inside changeStatusGM', err);
        res.status(500).json({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
};



// =================================================================================
// =================================================================================
// CEO Login Under 

const create_Ceo_GM = async function (req, res) {
    try {

        const ceo = await CEO_Model.findOne({
            _id: req.userId,
            adminType: "CEO"
        });

        console.log("CEO found: ", ceo);
        if (!ceo) {
            console.log("Unauthorized - CEO not found.");
            return res.json({ message: "Unauthorized" });
        }

        const { nameGM, email, password, mobileNumber } = req.body;

        const existingEmail = await GM_Model.findOne({ email });
        if (existingEmail) {
            console.log("Email already exists.");
            return res.json({
                error_code: 400,
                message: "Email already exists."
            });
        }

        const existingMobileNumber = await GM_Model.findOne({ mobileNumber });
        if (existingMobileNumber) {
            console.log("Mobile number already exists.");
            return res.json({
                error_code: 400,
                message: "Mobile number already exists."
            });
        }

        const newGM = new GM_Model({
            nameGM,
            email,
            password,
            mobileNumber,
            CEO_Name: ceo.name,
            CEO_Id: ceo.id
        });

        console.log("New GM instance created: ", newGM);


        const savedGM = await newGM.save();

        console.log("GM saved successfully: ", savedGM);

        // Associate the new GM with the CEO
        const updatedCEO = await CEO_Model.findByIdAndUpdate(
            ceo._id,
            { $push: { GM_Id: savedGM._id } },
            { new: true }
        );

        console.log("CEO updated: ", updatedCEO);

        return res.status(200).json({
            error_code: 200,
            message: "GM created successfully and associated with CEO.",
            GM: savedGM,
            CEO_In_GM_Id: updatedCEO.GM_Id,
        });
    } catch (error) {
        console.error("Error creating GM:", error);
        return res.status(500).json({
            error_code: 500,
            message: "Internal Server Error" + error.message
        });
    }
};

// ========================================================================
const update_Ceo_GM = async (req, res) => {
    try {
        const gmId = req.params.id;

        const { nameGM, email, password, mobileNumber } = req.body;

        const existingGM = await GM_Model.findById(gmId);
        if (!existingGM) {
            return res.json({ error_code: 404, message: "GM not found" });
        }

        // Check if the new email already exists
        if (email !== existingGM.email) {
            const existingEmail = await GM_Model.findOne({ email });
            if (existingEmail) {
                return res.json({
                    error_code: 400,
                    message: "Email already exists"
                });
            }
        }

        // Check if the new mobile number already exists
        if (mobileNumber !== existingGM.mobileNumber) {
            const existingMobileNumber = await GM_Model.findOne({ mobileNumber });
            if (existingMobileNumber) {
                return res.json({
                    error_code: 400,
                    message: "Mobile number already exists"
                });
            }
        }

        // Update the GM fields
        existingGM.nameGM = nameGM;
        existingGM.email = email;
        existingGM.password = password;
        existingGM.mobileNumber = mobileNumber;

        // Save the updated GM
        const updatedGM = await existingGM.save();

        return res.status(200).json({
            error_code: 200,
            message: "GM updated successfully",
            GM: updatedGM
        });
    } catch (error) {
        console.error("Error updating GM:", error);
        return res.status(500).json({
            error_code: 500,
            message: "Internal Server Error" + error.message
        });
    }
};


// ================================================================

const getAll_Ceo_GM = async function (req, res) {
    try {
        const ceoId = req.userId;
        console.log("ceoidddd : ", ceoId);

        const ceo = await CEO_Model.findById(ceoId);

        if (!ceo) {
            return res.json({
                error_code: 404,
                message: "CEO not found."
            });
        }

        const allGMs = await GM_Model.find({ CEO_Id: ceoId });

        if (!allGMs || allGMs.length === 0) {
            return res.json({
                error_code: 404,
                message: "No GMs found for this CEO."
            });
        }

        return res.status(200).json({
            error_code: 200,
            message: "All GMs fetched successfully for the CEO.",
            All_GMs: allGMs
        });

    } catch (error) {
        console.error("Error fetching all GMs:", error);
        return res.status(500).json({
            error_code: 500,
            message: "Internal Server Error" + error.message
        });
    }
};

// ================================================================

const getSelect_CEO_GM_List = async function (req, res) {
    try {
        const ceoId = req.userId;

        const ceo = await CEO_Model.findById(ceoId);

        if (!ceo) {
            return res.json({
                error_code: 404,
                message: "CEO not found."
            });
        }

        const allGMs = await GM_Model.find({ CEO_Id: ceoId }, '_id nameGM CEO_Id CEO_Name');

        if (!allGMs || allGMs.length === 0) {
            return res.json({
                error_code: 404,
                message: "No GMs found for this CEO."
            });
        }

        return res.status(200).json({
            error_code: 200,
            message: "All GMs fetched successfully for the CEO.",
            All_GMs: allGMs
        });

    } catch (error) {
        console.error("Error fetching all GMs:", error);
        return res.status(500).json({
            error_code: 500,
            message: "Internal Server Error" + error.message
        });
    }
};

// -----------------------------------------------------------------------
// -----------------------------------------------------------------------
// GM login


const getDashboardGM = async (req, res) => {
    try {
        // Find the GM by user ID and adminType
        const GM = await GM_Model.findOne({
            _id: req.userId,
            adminType: "GM"
        });

        if (!GM) {
            console.log("Unauthorized - GM not found.");
            return res.status(401).json({ error_code: 401, message: "Unauthorized" });
        }

        // Find counts for associated models
        const smCount = await SM_Model.countDocuments({ GM_Id: GM._id });
        const dsmCount = await DSM_Model.countDocuments({ GM_Id: GM._id });
        const saCount = await SA_Model.countDocuments({ GM_Id: GM._id });

        // Calculate total number of employees
        const totalEmployees = smCount + dsmCount + saCount;

        // -------------------------------------------------

        const dsmDirectlyLinked = await DSM_Model.find({ GM_Id: GM._id });

        // Extract UserListIds from dsmDirectlyLinked
        let userListIds = [];
        dsmDirectlyLinked.forEach(dsm => {
            userListIds = userListIds.concat(dsm.UserListId);
        });

        // Find all User_Model documents using userListIds
        const users = await User_Model.find({ _id: { $in: userListIds } });

        // Initialize counters for each currentLevel
        const levelCounts = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
            Crown: 0
        };

        // Count users based on their currentLevel
        users.forEach(user => {
            if (user.currentLevel in levelCounts) {
                levelCounts[user.currentLevel]++;
            }
        });

        // --------------------------------------------------

        return res.status(200).json({
            error_code: 200,
            message: "Dashboard data fetched successfully for GM.",
            SM: smCount,
            DSM: dsmCount,
            SA: saCount,
            totalEmployees: totalEmployees,
            levelCounts: levelCounts,
            totalUsers: users.length
        });
    } catch (error) {
        console.error("Error fetching GM dashboard data:", error);
        return res.status(500).json({
            error_code: 500,
            message: "Failed to fetch GM dashboard data."
        });
    }
};

//---------------------------------------------------------------
// Update GM Login 


// const updateGMAdmin = async function (req, res) {
//     try {
//         let gmId = req.userId;
//         let gm = await GM_Model.findById(gmId);
//         let obj = {

//             nameGM: req.body.nameGM ? req.body.nameGM : gm.nameGM,
//             email: req.body.email ? req.body.email : gm.email,
//             mobileNumber: req.body.mobileNumber ? req.body.mobileNumber : gm.mobileNumber,
//         };

//         // Update GM information in the database
//         await GM_Model.findOneAndUpdate(
//             { _id: gmId },
//             { $set: obj },
//             { new: true }
//         );

//         return res.status(200).json({
//             error_code: 200,
//             message: "GM updated successfully",
//             UpdatedGM: obj,
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ error_code: 500, message: error.message });
//     }
// };


const updateGMAdmin = async function (req, res) {
    try {
        let gmId = req.userId;
        let gm = await GM_Model.findById(gmId);
        let obj = {
            nameGM: req.body.nameGM ? req.body.nameGM : gm.nameGM,
            email: req.body.email ? req.body.email : gm.email,
            mobileNumber: req.body.mobileNumber ? req.body.mobileNumber : gm.mobileNumber,
        };

        // Update GM information in the database
        await GM_Model.findOneAndUpdate(
            { _id: gmId },
            { $set: obj },
            { new: true }
        );

        // Find and update GM's name in related models
        const modelsToUpdate = [SM_Model, DSM_Model, SA_Model];
        const updatePromises = modelsToUpdate.map(async (Model) => {
            const updateQuery = { GM_Id: gmId };
            const updateFields = { GM_Name: obj.nameGM };
            await Model.updateMany(updateQuery, { $set: updateFields });
        });
        await Promise.all(updatePromises);

        return res.status(200).json({
            error_code: 200,
            message: "GM updated successfully",
            UpdatedGM: obj,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error_code: 500, message: error.message });
    }
};


// --------------------------------------------------------


const update_GMAdmin_image = async function (req, res) {
    try {
        let gmId = req.userId;
        let baseUrl = baseURL.generateBaseUrl(req);
        let gm = await GM_Model.findById(gmId);
        console.log("gm -: ", gm);

        if (!req.files || req.files.length === 0) {
            return res.json({ error_code: 400, message: "No image uploaded" });
        }

        let profileImageUrl = "/uploads/" + req.files[0].filename;

        await GM_Model.findOneAndUpdate(
            { _id: gmId },
            { $set: { profileImage: profileImageUrl } },
            { new: true }
        );

        return res.status(200).json({
            error_code: 200,
            message: "GM profile image updated successfully",
            profileImage: profileImageUrl
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error_code: 500, message: "Internal server error" });
    }
};


// ----------------------------------------------------------- 

const updateGMAdminPassword = async function (req, res) {
    try {
        const gmId = req.userId;
        const newPassword = req.body.confirmPassword;

        if (!newPassword) {
            return res.status(400).json({ error_code: 400, message: 'New password is required' });
        }

        const updatedGM = await GM_Model.findByIdAndUpdate(
            gmId,
            { password: newPassword },
            { new: true }
        );

        if (!updatedGM) {
            return res.status(404).json({ error_code: 404, message: 'GM admin not found' });
        }

        return res.status(200).json({ error_code: 200, message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error_code: 500, message: 'Error occurred while changing password' });
    }
};



// ------------------------------------------------------------------

const getGMAdminProfile = async function (req, res) {
    try {
        let gmId = req.userId;
        let baseUrl = baseURL.generateBaseUrl(req);

        let gmAdmin = await GM_Model.findById(gmId);
        let obj = {
            nameGM: gmAdmin.nameGM ? gmAdmin.nameGM : undefined,
            email: gmAdmin.email ? gmAdmin.email : undefined,
            mobileNumber: gmAdmin.mobileNumber ? gmAdmin.mobileNumber : undefined,
            profileImage: gmAdmin.profileImage ? `${baseUrl}${gmAdmin.profileImage}` : undefined
        }
        return res.status(200).json({ errro_code: 200, obj })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error_code: 500, message: 'error inside getGMProfile in GM controller..!' })
    }
};




module.exports = {
    createGM,
    getAllGM,
    getGMwithId,
    getSelect_GM_List,
    updateGM,
    deleteGM,
    changeStatusGM,
    // ==================

    create_Ceo_GM,
    update_Ceo_GM,
    getAll_Ceo_GM,
    getSelect_CEO_GM_List,

    getDashboardGM,

    updateGMAdmin,
    update_GMAdmin_image,
    updateGMAdminPassword,
    getGMAdminProfile,


}