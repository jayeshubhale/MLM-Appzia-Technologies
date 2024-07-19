const GM_Model = require("../model/GM_Model")
const SM_Model = require("../model/SM_Model");
const colors = require('colors');
const CEO_Model = require("../model/CEO_Model");
const DSM_Model = require("../model/SM_DSM_Model");
const SA_Model = require("../model/SM_SA_Model");
const baseURL = require("../constant/baseURL");




const createSM = async (req, res) => {
    try {
        const GM_Id = req.body.GM_Id;

        // console.log("GM_Id:", GM_Id);

        const GM_Admin = await GM_Model.findById(GM_Id);
        if (!GM_Admin) {
            console.log("GM not found");
            return res.json({
                message: "GM not found"
            });
        }


        const CEO_Id = GM_Admin.CEO_Id;

        const { nameSM, GM_Name, email, mobileNumber, password } = req.body;

        // console.log("Received data:", req.body);

        const existingEmail = await SM_Model.findOne({ email });
        if (existingEmail) {
            console.log("Email already exists.");
            return res.json({
                error_code: 400,
                message: "Email already exists."
            });
        }

        const existingMobileNumber = await SM_Model.findOne({ mobileNumber });
        if (existingMobileNumber) {
            console.log("Mobile number already exists.");
            return res.json({
                error_code: 400,
                message: "Mobile number already exists."
            });
        }

        const newSM = new SM_Model({
            nameSM,
            GM_Id,
            GM_Name,
            CEO_Id,
            email,
            mobileNumber,
            password,
        });

        // console.log("New SM data:", newSM);

        const savedSM = await newSM.save();

        // console.log("Saved SM data:", savedSM);

        const updatedGM = await GM_Model.findByIdAndUpdate(
            GM_Id,
            { $push: { SM_Id: savedSM._id } },
            { new: true }
        );

        console.log("Updated GM:", updatedGM);

        return res.status(200).json({
            error_code: 200,
            message: "SM created successfully and associated with GM.",
            SM: savedSM,
            GM: updatedGM
        });
    } catch (error) {
        console.error("Error creating SM:", error);
        return res.status(500).json({
            error_code: 500,
            message: error.message
        });
    }
};

// --------------------------------------------------

// const getAllSM = async (req, res) => {
//     try {
//         const SM_Admin = await SM_Model.find();

//         return res.status(200).json({
//             error_code: 200,
//             message: "Successfully retrieved all Sales Managers.",
//             SMs: SM_Admin
//         });
//     } catch (error) {

//         console.error("Error retrieving Sales Managers:", error);
//         return res.status(500).json({
//             error_code: 500,
//             message: "Internal server error: " + error.message
//         });
//     }
// };

// ------------------------------------------------------

const getAllSM = async (req, res) => {
    try {
        // Find all SM records that have a CEO_Id
        const SMsWithCEOId = await SM_Model.find({ CEO_Id: { $exists: true, $ne: null } });

        if (!SMsWithCEOId || SMsWithCEOId.length === 0) {
            console.log("No SM records with CEO_Id found.");
            return res.json({
                error_code: 404,
                message: "No SM records with CEO_Id found."
            });
        }

        // Get the unique CEO Ids
        const uniqueCEOIds = [...new Set(SMsWithCEOId.map(sm => sm.CEO_Id))];

        // Find all CEOs corresponding to the unique CEO Ids
        const CEOs = await CEO_Model.find({ _id: { $in: uniqueCEOIds } });

        // Map through each SM record, find its corresponding CEO, and include the CEO's name
        const SMsWithCEOName = SMsWithCEOId.map(sm => {
            const correspondingCEO = CEOs.find(ceo => ceo._id.toString() === sm.CEO_Id.toString());
            return {
                ...sm.toObject(),
                CEO_Name: correspondingCEO ? correspondingCEO.name : "Unknown CEO"
            };
        });

        return res.status(200).json({
            error_code: 200,
            message: "Successfully retrieved all Sales Managers with CEO names.",
            SMs: SMsWithCEOName
        });
    } catch (error) {
        console.error("Error retrieving Sales Managers:", error);
        return res.status(500).json({
            error_code: 500,
            message: "Internal server error: " + error.message
        });
    }
};

// --------------------------------------------------

const getSMwithId = async (req, res) => {
    try {
        const { id } = req.params;

        const SM_Admin = await SM_Model.findById(id);

        if (!SM_Admin) {
            return res.status(404).json({
                error_code: 404,
                message: "SM not found."
            });
        }

        return res.status(200).json({
            error_code: 200,
            message: "Successfully retrieved SM.",
            SM: SM_Admin
        });
    } catch (error) {
        console.error("Error retrieving SM:", error);
        return res.status(500).json({
            error_code: 500,
            message: "Internal server error: " + error.message
        });
    }
};

// --------------------------------------------------

const deleteSM = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedSM = await SM_Model.findByIdAndDelete(id);

        if (!deletedSM) {
            return res.status(404).json({
                error_code: 404,
                message: "SM not found."
            });
        }

        return res.status(200).json({
            error_code: 200,
            message: "Successfully deleted SM.",
            // deletedSM: deletedSM
        });
    } catch (error) {
        console.error("Error deleting SM:", error);
        return res.status(500).json({
            error_code: 500,
            message: "Internal server error: " + error.message
        });
    }
};

// --------------------------------------------

const getSelect_SM_List = async function (req, res) {
    try {
        const SMs = await SM_Model.find({}, 'nameSM id');

        return res.status(200).json({
            error_code: 200,
            message: "SMs list fetched successfully.",
            SMs_List: SMs
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error_code: 500,
            message: "Internal Server Error" + error.message
        });
    }
};


// ----------------------------------------------------------------

const updateSM = async (req, res) => {
    try {
        const smId = req.params.id;

        console.log("smId:", smId);

        const { GM_Id, GM_Name, nameSM, email, mobileNumber, password } = req.body;

        if (email) {
            const existingEmail = await SM_Model.findOne({ email });
            if (existingEmail && existingEmail._id.toString() !== smId) {
                return res.json({
                    error_code: 400,
                    message: "Email already exists. Please provide a unique email."
                });
            }
        }

        if (mobileNumber) {
            const existingmobileNumber = await SM_Model.findOne({ mobileNumber });
            if (existingmobileNumber && existingmobileNumber._id.toString() !== smId) {
                return res.json({
                    error_code: 400,
                    message: "MobileNumber already exists. Please provide a unique MobileNumber."
                });
            }
        }

        // -------------------------------------------------------------

        if (!smId) {
            return res.json({
                error_code: 400,
                message: "SM ID is required."
            });
        }

        const existingSM = await SM_Model.findById(smId);
        if (!existingSM) {
            return res.status(404).json({
                error_code: 404,
                message: "SM not found."
            });
        }

        // console.log("Existing SM:".bgRed, existingSM);

        // -------------------------------------------------------------

        if (GM_Id && GM_Id !== existingSM.GM_Id?.toString()) {
            console.log("New GM_Id:", GM_Id);

            const existingGM = await GM_Model.findById(existingSM.GM_Id);
            if (existingGM) {
                console.log("Removing SM ID from existing GM:", existingSM._id);
                existingGM.SM_Id = existingGM.SM_Id.filter(id => id.toString() !== smId);
                await existingGM.save();
            }

            existingSM.GM_Id = GM_Id;

            const updatedGM = await GM_Model.findByIdAndUpdate(
                GM_Id,
                { $addToSet: { SM_Id: smId } },
                { new: true }
            );
            // console.log("Updated GM:".bgCyan, updatedGM);
        }

        // -------------------------------------------------------------

        if (GM_Name && GM_Name !== existingSM.GM_Name) {
            console.log("New GM_Name:", GM_Name);

            const existingGM = await GM_Model.findOne({ GM_Name });
            if (existingGM) {
                // console.log("Adding SM ID to existing GM:", existingSM._id);
                existingGM.SM_Id.push(existingSM._id);
                await existingGM.save();
            }

            existingSM.GM_Name = GM_Name;
        }

        // -------------------------------------------------------------
        // Update the GM details

        existingSM.nameSM = nameSM;
        existingSM.email = email;
        existingSM.password = password;
        existingSM.mobileNumber = mobileNumber;

        console.log("Updated SM details:".bgYellow, existingSM);

        const updatedSM = await existingSM.save();

        return res.status(200).json({
            error_code: 200,
            message: "SM updated successfully.",
            SM: updatedSM
        });




    }
    catch (error) {
        console.error("Error updating SM:", error);
        return res.status(500).json({
            error_code: 500,
            message: error.message
        });
    }
};




// ===============


// ----------------------------------------------
// changeStatusSM/:id

const changeStatusSM = async (req, res) => {
    try {
        const { id } = req.params;
        const SMData = await SM_Model.findById(id);
        if (!SMData) {
            return res.status(404).json({
                error_code: 404,
                message: 'SM not found'
            });
        }

        SMData.status = SMData.status === 'Active' ? 'Inactive' : 'Active';

        await SMData.save();
        res.status(200).json({
            message: `SM status toggled successfully to ${SMData.status}`,
            SMData: {
                id: SMData.id,
                Status: SMData.status
            }
        });
    } catch (err) {
        console.error('Error inside changeStatusSM', err);
        res.status(500).json({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
};


// -------------------------------

const getSMUnderParticularCEO = async function (req, res) {
    try {
        const userId = req.userId;
        console.log("User ID:", userId);

        // Find the CEO
        const CEO = await CEO_Model.findById(userId);
        if (!CEO) {
            console.log("CEO not found.");
            return res.json({
                error_code: 404,
                message: "CEO not found."
            });
        }

        // Find all SMs under the CEO
        const allSMs = await SM_Model.find({ CEO_Id: userId });
        // console.log("All SMs under the CEO:", allSMs);

        if (!allSMs || allSMs.length === 0) {
            console.log("No SMs found for this CEO.");
            return res.json({
                error_code: 404,
                message: "No SMs found for this CEO."
            });
        }

        // Add CEO name to each SM record
        const SMsWithCEOName = allSMs.map(sm => {
            return {
                ...sm.toObject(),
                CEO_Name: CEO.name
            };
        });

        return res.status(200).json({
            error_code: 200,
            message: "All SMs fetched successfully for the CEO.",
            All_SMs: SMsWithCEOName
        });

    } catch (error) {
        console.error("Error fetching SMs:", error);
        return res.status(500).json({
            error_code: 500,
            message: "Internal Server Error " + error.message
        });
    }
};




// ==============================================================================
// Admin GM Login Under APIs 

const createSMfromGM = async function (req, res) {
    try {
        const GM = await GM_Model.findOne({
            _id: req.userId,
            adminType: "GM"
        });
        // console.log("GM found: ", GM);

        if (!GM) {
            console.log("Unauthorized - GM not found.");
            return res.json({ message: "Unauthorized" });
        }

        const { nameSM, email, password, mobileNumber } = req.body;

        const existingEmail = await SM_Model.findOne({ email });
        if (existingEmail) {
            console.log("Email already exists.");
            return res.json({
                error_code: 400,
                message: "Email already exists."
            });
        }

        const existingMobileNumber = await SM_Model.findOne({ mobileNumber });
        if (existingMobileNumber) {
            console.log("Mobile number already exists.");
            return res.json({
                error_code: 400,
                message: "Mobile number already exists."
            });
        }

        const CEO_Id = GM.CEO_Id;

        const newSM = new SM_Model({
            nameSM,
            email,
            password,
            mobileNumber,
            GM_Name: GM.nameGM,
            GM_Id: GM.id,
            CEO_Id: CEO_Id
        });

        console.log("New SM instance created: ", newSM);

        const savedSM = await newSM.save();

        // console.log("SM saved successfully: ", savedSM);

        const updatedGM = await GM_Model.findByIdAndUpdate(
            GM._id,
            { $push: { SM_Id: savedSM._id } },
            { new: true }
        );

        console.log("GM updated: ", updatedGM);

        return res.status(200).json({
            error_code: 200,
            message: "SM created successfully and associated with GM.",
            SM: savedSM,
            GM_In_SM_Id: updatedGM.SM_Id,
        });

    } catch (error) {
        console.error("Error creating GM:", error);
        return res.status(500).json({
            error_code: 500,
            message: "Internal Server Error" + error.message
        });
    }
}

// ===================================================================

const getAllSMfromGM = async (req, res) => {
    try {
        const GM = await GM_Model.findOne({
            _id: req.userId,
            adminType: "GM"
        });

        if (!GM) {
            console.log("Unauthorized - GM not found.");
            return res.status(401).json({ message: "Unauthorized" });
        }

        const SMs = await SM_Model.find({ GM_Id: GM._id });

        return res.status(200).json({
            error_code: 200,
            messege: "All SM from this GM are listed.",
            data: SMs
        });
    } catch (error) {
        console.error("Error retrieving SMs:", error);
        return res.status(500).json({
            error_code: 500,
            message: "Internal Server Error: " + error.message
        });
    }
}

// ---------------------------------------------------

const updateSMfromGM = async (req, res) => {
    try {
        const smId = req.params.id;

        const smToUpdate = await SM_Model.findById(smId);

        if (!smToUpdate) {
            console.log("SM not found.");
            return res.status(404).json({ message: "SM not found" });
        }

        const GM = await GM_Model.findOne({ _id: smToUpdate.GM_Id });
        if (!GM) {
            console.log("Unauthorized - GM not found.");
            return res.status(401).json({ message: "Unauthorized - GM not found" });
        }

        // Update the SM with the provided data
        smToUpdate.nameSM = req.body.nameSM || smToUpdate.nameSM;
        smToUpdate.email = req.body.email || smToUpdate.email;
        smToUpdate.password = req.body.password || smToUpdate.password;
        smToUpdate.mobileNumber = req.body.mobileNumber || smToUpdate.mobileNumber;

        // Save the updated SM
        const updatedSM = await smToUpdate.save();

        return res.status(200).json({
            error_code: 200,
            message: "SM updated successfully.",
            SM: updatedSM
        });

    } catch (error) {
        console.error("Error updating SM:", error);
        return res.status(500).json({
            error_code: 500,
            message: "Internal Server Error" + error.message
        });
    }
}

// ==================================================================

const getAllSMunderGM = async (req, res) => {
    try {
        const GM = await GM_Model.findOne({
            _id: req.userId,
            adminType: "GM"
        });

        if (!GM) {
            console.log("Unauthorized - GM not found.");
            return res.status(401).json({ message: "Unauthorized" });
        }

        const SMs = await SM_Model.find({ GM_Id: GM._id });

        // Map each SM to include its ID and name
        const mappedSMs = SMs.map(sm => ({
            id: sm._id,
            nameSM: sm.nameSM
        }));

        return res.status(200).json({
            error_code: 200,
            message: "All SMs from this GM are listed.",
            data: {
                GM: {
                    id: GM._id,
                    nameGM: GM.nameGM
                },
                SMs: mappedSMs
            }
        });
    } catch (error) {
        console.error("Error retrieving SMs:", error);
        return res.status(500).json({
            error_code: 500,
            message: "Internal Server Error: " + error.message
        });
    }
};


//=================================================================================
//=================================================================================



const getAllDSMUnderSM = async (req, res) => {
    try {
        // Step 1: Find the Sales Manager (SM) document
        const SM = await SM_Model.findOne({
            _id: req.userId,
            adminType: "SM"
        });
        // console.log("SM - ", SM);
        // If SM not found, return Unauthorized
        if (!SM) {
            console.log("Unauthorized - SM not found.");
            return res.status(401).json({
                errorCode: 200,
                message: "Unauthorized"
            });
        }

        // Step 2: Retrieve the DSM IDs associated with the found SM
        const dsmIds = SM.DSM_Id;

        // Step 3: Find all DSM documents using the retrieved DSM IDs
        const allDSMUnderSM = await DSM_Model.find({ _id: { $in: dsmIds } });

        // Step 4: Return the DSMs found
        return res.status(200).json({
            errorCode: 200,
            message: "DSM fetched successfully from SM",
            data: allDSMUnderSM
        });
    } catch (error) {
        console.error("Error fetching DSMs under SM:", error);
        return res.status(500).json({
            errorCode: 500,
            message: "Internal Server Error"
        });
    }
};


const getAllSAUnderSM = async (req, res) => {
    try {
        // Step 1: Find the Sales Manager (SM) document
        const SM = await SM_Model.findOne({
            _id: req.userId,
            adminType: "SM"
        });
        // console.log("SM - ", SM);
        // If SM not found, return Unauthorized
        if (!SM) {
            console.log("Unauthorized - SM not found.");
            return res.status(401).json({
                errorCode: 200,
                message: "Unauthorized"
            });
        }

        // Step 2: Retrieve the SA IDs associated with the found SM
        const saIds = SM.SA_Id;

        // Step 3: Find all SA documents using the retrieved SA IDs
        const allSAUnderSM = await SA_Model.find({ _id: { $in: saIds } });

        // Step 4: Return the SAs found
        return res.status(200).json({
            errorCode: 200,
            message: "SA fetched successfully from SM",
            data: allSAUnderSM
        });
    } catch (error) {
        console.error("Error fetching SAs under SM:", error);
        return res.status(500).json({
            errorCode: 500,
            message: "Internal Server Error"
        });
    }
};

// -----------------------------------------------------------------------

const getDashboardInSM = async (req, res) => {
    try {
        // Step 1: Find the Sales Manager (SM) document
        const SM = await SM_Model.findOne({
            _id: req.userId,
            adminType: "SM"
        });

        // If SM not found, return Unauthorized
        if (!SM) {
            console.log("Unauthorized - SM not found.");
            return res.status(401).json({
                errorCode: 200,
                message: "Unauthorized"
            });
        }

        // Step 2: Get DSM and SA IDs from the SM document
        const dsmIds = SM.DSM_Id;
        const saIds = SM.SA_Id;
        // Step 3: Count DSM records associated with the SM
        const dsmCount = await DSM_Model.countDocuments({ _id: { $in: dsmIds } });
        // Step 4: Count SA records associated with the SM
        const saCount = await SA_Model.countDocuments({ _id: { $in: saIds } });

        



        return res.status(200).json({
            errorCode: 200,
            message: "Records count fetched successfully",
            data: {
                DSMCount: dsmCount,
                SACount: saCount,
                TotalUser: 0,
            }
        });
    } catch (error) {
        console.error("Error fetching records:", error);
        return res.status(500).json({
            errorCode: 500,
            message: "Internal Server Error"
        });
    }
};




//=================================================================================

//---------------------------------------------------------------
// Update SM Login 

// const updateSMAdmin = async function (req, res) {
//     try {
//         let smId = req.userId;
//         let sm = await SM_Model.findById(smId);
//         let obj = {
//             nameSM: req.body.nameSM ? req.body.nameSM : sm.nameSM,
//             email: req.body.email ? req.body.email : sm.email,
//             mobileNumber: req.body.mobileNumber ? req.body.mobileNumber : sm.mobileNumber,
//         };

//         // Update SM information in the database
//         await SM_Model.findOneAndUpdate(
//             { _id: smId },
//             { $set: obj },
//             { new: true }
//         );

//         return res.status(200).json({
//             error_code: 200,
//             message: "SM updated successfully",
//             UpdatedSM: obj,
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ error_code: 500, message: "Internal Server Error" + error.message });
//     }
// };

const updateSMAdmin = async function (req, res) {
    try {
        let smId = req.userId;
        let sm = await SM_Model.findById(smId);
        let obj = {
            nameSM: req.body.nameSM ? req.body.nameSM : sm.nameSM,
            email: req.body.email ? req.body.email : sm.email,
            mobileNumber: req.body.mobileNumber ? req.body.mobileNumber : sm.mobileNumber,
        };

        // Update SM information in the database
        await SM_Model.findOneAndUpdate(
            { _id: smId },
            { $set: obj },
            { new: true }
        );

        // Find and update SM's name in related models
        const modelsToUpdate = [DSM_Model, SA_Model];
        const updatePromises = modelsToUpdate.map(async (Model) => {
            const updateQuery = { SM_Id: smId };
            const updateFields = { SM_Name: obj.nameSM };
            await Model.updateMany(updateQuery, { $set: updateFields });
        });
        await Promise.all(updatePromises);

        return res.status(200).json({
            error_code: 200,
            message: "SM updated successfully",
            UpdatedSM: obj,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error_code: 500, message: "Internal Server Error" + error.message });
    }
};



// --------------------------------------------------------


const update_SMAdmin_image = async function (req, res) {
    try {
        let smId = req.userId;
        let baseUrl = baseURL.generateBaseUrl(req);
        let sm = await SM_Model.findById(smId);
        console.log("sm -: ", sm);
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error_code: 400, message: "No image uploaded" });
        }

        let profileImageUrl = "/uploads/" + req.files[0].filename;

        await SM_Model.findOneAndUpdate(
            { _id: smId },
            { $set: { profileImage: profileImageUrl } },
            { new: true }
        );

        return res.status(200).json({
            error_code: 200,
            message: "SM profile image updated successfully",
            profileImage: profileImageUrl
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error_code: 500, message: "Internal server error" });
    }
};




// ----------------------------------------------------------- 




const updateSMAdminPassword = async function (req, res) {
    try {
        const smId = req.userId;
        const newPassword = req.body.confirmPassword;

        if (!newPassword) {
            return res.json({ error_code: 400, message: 'New password is required' });
        }

        const updatedSM = await SM_Model.findByIdAndUpdate(
            smId,
            { password: newPassword },
            { new: true }
        );

        if (!updatedSM) {
            return res.status(404).json({ error_code: 404, message: 'SM admin not found' });
        }

        return res.status(200).json({ error_code: 200, message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error_code: 500, message: 'Error occurred while changing password' });
    }
};


// ------------------------------------------------------------------


const getSMAdminProfile = async function (req, res) {
    try {
        let smId = req.userId;
        let baseUrl = baseURL.generateBaseUrl(req);

        let smAdmin = await SM_Model.findById(smId);
        let obj = {
            nameSM: smAdmin.nameSM ? smAdmin.nameSM : undefined,
            email: smAdmin.email ? smAdmin.email : undefined,
            mobileNumber: smAdmin.mobileNumber ? smAdmin.mobileNumber : undefined,
            profileImage: smAdmin.profileImage ? `${baseUrl}${smAdmin.profileImage}` : undefined
        }
        return res.status(200).json({ errro_code: 200, obj })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error_code: 500, message: 'error inside getSMProfile in SM controller..!' })
    }
};



//=================================================================================



module.exports = {
    createSM,
    getAllSM,
    getSMwithId,
    deleteSM,
    getSelect_SM_List,
    updateSM,
    changeStatusSM,
    getSMUnderParticularCEO,

    // =========================

    createSMfromGM,
    getAllSMfromGM,
    updateSMfromGM,
    getAllSMunderGM,

    // =========================

    getAllDSMUnderSM,
    getAllSAUnderSM,
    getDashboardInSM,

    // =========================

    updateSMAdmin,
    update_SMAdmin_image,
    updateSMAdminPassword,
    getSMAdminProfile,




};

