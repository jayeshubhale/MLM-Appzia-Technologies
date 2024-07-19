const AdminModel = require("../model/AdminModel");
const CEO_Model = require("../model/CEO_Model");
const GM_Model = require("../model/GM_Model");
const baseURL = require("../constant/baseURL");
const SM_Model = require("../model/SM_Model");
const DSM_Model = require("../model/SM_DSM_Model");
const SA_Model = require("../model/SM_SA_Model");
const { generateAuthToken } = require("../constant/jwtToken")
const User_Model = require("../model/UserModel");


const createCEO = async (req, res) => {
    try {

        const adminId = await AdminModel.findOne({
            _id: req.userId,
            adminType: "Admin"
        });

        console.log("Admin Id -: ", adminId);
        if (!adminId) {
            return res.json({ message: "Unauthorized" });
        }

        const { name, email, password, mobileNumber } = req.body;

        const existingEmail = await CEO_Model.findOne({ email });
        if (existingEmail) {
            return res.json({
                error_code: 400,
                message: "Email already exists."
            });
        }

        const existingMobileNumber = await CEO_Model.findOne({ mobileNumber });
        if (existingMobileNumber) {
            return res.json({
                error_code: 400,
                message: "Mobile number already exists."
            });
        }

        const newCEO = new CEO_Model({
            name,
            email,
            password,
            mobileNumber
        });

        const savedCEO = await newCEO.save();
        console.log("savedCEO :- ", savedCEO);

        const updatedAdmin = await AdminModel.findByIdAndUpdate(
            adminId,
            { $push: { CEO_Id: savedCEO._id } },
            { new: true }
        );

        return res.status(200).send({
            error_code: 200,
            message: "CEO created successfully and associated with admin.",
            CEO: savedCEO,
            admin: updatedAdmin
        });
    } catch (error) {
        console.error("Error creating CEO:", error);
        return res.status(500).json({
            error_code: 500,
            message: "Internal server error:" + error.message
        });
    }
};


// -------------------------------------------------------------

const loginCEO = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const ceo = await CEO_Model.findOne({ email });
        if (!ceo) {
            return res.status(404).json({ error_code: 404, message: "CEO Not found.." });
        }
        // Verify password
        if (password !== ceo.password) {
            return res.status(400).json({ error_code: 400, message: "Incorrect password" });
        }
        // Generate auth token
        const token = generateAuthToken(ceo._id, email, ceo.adminType);
        console.log("CEO_Token -: ", token);
        // Send success response with token
        return res.status(200).json({
            error_code: 200,
            message: "CEO login successful",
            CEO_Token: token
        });
    } catch (error) {
        return res.status(500).json({
            error_code: 500,
            message: "Internal server error: " + error.message
        });
    }
};



// -------------------------------------------------------------

const updateCEO = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.json({
                error_code: 400,
                message: "CEO ID is required for updating CEO details."
            });
        }

        const { name, email, password, mobileNumber } = req.body;

        if (email) {
            const existingEmail = await CEO_Model.findOne({ email });
            if (existingEmail && existingEmail._id.toString() !== id) {
                return res.json({
                    error_code: 400,
                    message: "Email already exists. Please provide a unique email."
                });
            }
        }

        if (mobileNumber) {
            const existingmobileNumber = await CEO_Model.findOne({ mobileNumber });
            if (existingmobileNumber && existingmobileNumber._id.toString() !== id) {
                return res.json({
                    error_code: 400,
                    message: "MobileNumber already exists. Please provide a unique MobileNumber."
                });
            }
        }

        const updatedCEO = await CEO_Model.findByIdAndUpdate(
            id,
            { $set: { name, email, password, mobileNumber } },
            { new: true }
        );

        if (!updatedCEO) {
            return res.json({
                error_code: 404,
                message: "CEO not found."
            });
        }

        return res.status(200).json({
            error_code: 200,
            message: "CEO details updated successfully.",
            CEO: updatedCEO
        });

    } catch (error) {
        return res.status(500).json({
            error_code: 500,
            message: "Internal server error:" + error.message
        });
    }
};


// -------------------------------------------------------------

const deleteCEO = async function (req, res) {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                error_code: 400,
                message: "CEO ID is required."
            });
        }

        // Deleting the CEO by ID
        const deletedCEO = await CEO_Model.findByIdAndDelete(id);

        // Checking if the CEO was found and deleted
        if (!deletedCEO) {
            return res.status(404).json({
                error_code: 404,
                message: "CEO not found."
            });
        }

        return res.status(200).json({
            error_code: 200,
            message: "CEO deleted successfully.",
            // deletedCEO
        });

    } catch (error) {
        console.error("Error deleting CEO:", error);
        return res.status(500).json({
            error_code: 500,
            message: "Internal server error:" + error.message
        });
    }
};

// -------------------------------------------------------------


const getAllCEO = async function (req, res) {
    try {
        // Fetch all CEOs from the database
        const allCEO = await CEO_Model.find();

        // Check if any CEOs are found
        if (!allCEO || allCEO.length === 0) {
            return res.status(404).json({
                error_code: 404,
                message: "No CEOs found."
            });
        }

        return res.status(200).json({
            error_code: 200,
            message: "All CEOs fetched successfully.",
            All_CEOs: allCEO
        });
    } catch (error) {
        console.error("Error fetching all CEOs:", error);
        return res.status(500).json({
            error_code: 500,
            message: "Internal server error:" + error.message
        });
    }
};

// -------------------------------------------------------------

const getCEOwithId = async function (req, res) {
    try {
        const { id } = req.params;

        // Checking if the provided id is valid
        if (!id) {
            return res.status(400).json({
                error_code: 400,
                message: "CEO ID is required."
            });
        }

        // Fetching the CEO by ID from the database
        const ceo = await CEO_Model.findById(id);

        // Checking if the CEO was found
        if (!ceo) {
            return res.status(404).json({
                error_code: 404,
                message: "CEO not found."
            });
        }

        return res.status(200).json({
            error_code: 200,
            message: "CEO fetched successfully.",
            CEO: ceo
        });
    } catch (error) {
        console.error("Error fetching CEO:", error);
        return res.status(500).json({
            error_code: 500,
            message: "Internal server error:" + error.message
        });
    }
};

// -------------------------------------------------------------

const getSelectCEOList = async function (req, res) {
    try {
        const ceos = await CEO_Model.find({}, 'name id');

        return res.status(200).json({
            error_code: 200,
            message: "CEOs list fetched successfully.",
            CEOs_List: ceos
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error_code: 500,
            message: "Internal server error:" + error.message
        });
    }
};


// -------------------------------------------------------------

const changeStatusCEO = async (req, res) => {
    try {
        const { id } = req.params;
        const CEOData = await CEO_Model.findById(id);
        if (!CEOData) {
            return res.status(404).json({
                error_code: 404,
                message: 'CEO not found'
            });
        }

        CEOData.status = CEOData.status === 'Active' ? 'Inactive' : 'Active';

        await CEOData.save();
        res.status(200).json({
            message: `CEO status toggled successfully to ${CEOData.status}`,
            CEOData: {
                id: CEOData.id,
                Status: CEOData.status,
            }
        });
    } catch (err) {
        console.error('Error inside changeStatusCEO', err);
        res.status(500).json({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
};


// =================================================================
// =================================================================
// CEO Login

// const getDashboardCEO = async (req, res) => {
//     try {
//         // Find the CEO by user ID and adminType
//         const CEO = await CEO_Model.findOne({
//             _id: req.userId,
//             adminType: "CEO"
//         });

//         if (!CEO) {
//             console.log("Unauthorized - CEO not found.");
//             return res.status(401).json({ error_code: 401, message: "Unauthorized" });
//         }

//         // Find counts for associated models
//         const gmCount = await GM_Model.countDocuments({ CEO_Id: CEO._id });
//         const smCount = await SM_Model.countDocuments({ CEO_Id: CEO._id });
//         const dsmCount = await DSM_Model.countDocuments({ CEO_Id: CEO._id });
//         const saCount = await SA_Model.countDocuments({ CEO_Id: CEO._id });

//         // Calculate total number of employees
//         const totalEmployees = gmCount + smCount + dsmCount + saCount;
//         //==================================
//         console.log("CEO:- ", CEO);
//         // -------------------------------------------

//         return res.status(200).json({
//             error_code: 200,
//             message: "Dashboard data fetched successfully for CEO.",
//             GM: gmCount,
//             SM: smCount,
//             DSM: dsmCount,
//             SA: saCount,
//             totalEmployees: totalEmployees
//         });
//     } catch (error) {
//         console.error("Error fetching CEO dashboard data:", error);
//         return res.status(500).json({
//             error_code: 500,
//             message: "Failed to fetch CEO dashboard data."
//         });
//     }
// };

// const getDashboardCEO = async (req, res) => {
//     try {
//         // Find the CEO by user ID and adminType
//         const CEO = await CEO_Model.findOne({
//             _id: req.userId,
//             adminType: "CEO"
//         });

//         if (!CEO) {
//             console.log("Unauthorized - CEO not found.");
//             return res.status(401).json({ error_code: 401, message: "Unauthorized" });
//         }

//         // Find counts for associated models
//         const gmCount = await GM_Model.countDocuments({ CEO_Id: CEO._id });
//         const smCount = await SM_Model.countDocuments({ CEO_Id: CEO._id });
//         const dsmCount = await DSM_Model.countDocuments({ CEO_Id: CEO._id });
//         const saCount = await SA_Model.countDocuments({ CEO_Id: CEO._id });

//         // Calculate total number of employees
//         const totalEmployees = gmCount + smCount + dsmCount + saCount;

//         // Find DSMs directly linked to the CEO
//         const dsmDirectlyLinked = await DSM_Model.find({ CEO_Id: CEO._id });

//         // Log DSMs directly linked to the CEO for debugging
//         console.log("DSMs directly linked to CEO: ", dsmDirectlyLinked);

//         return res.status(200).json({
//             error_code: 200,
//             message: "Dashboard data fetched successfully for CEO.",
//             GM: gmCount,
//             SM: smCount,
//             DSM: dsmCount,
//             SA: saCount,
//             totalEmployees: totalEmployees,
//             DSMDirectlyLinked: dsmDirectlyLinked
//         });
//     } catch (error) {
//         console.error("Error fetching CEO dashboard data:", error);
//         return res.status(500).json({
//             error_code: 500,
//             message: "Failed to fetch CEO dashboard data."
//         });
//     }
// };

// const getDashboardCEO = async (req, res) => {
//     try {
//         // Find the CEO by user ID and adminType
//         const CEO = await CEO_Model.findOne({
//             _id: req.userId,
//             adminType: "CEO"
//         });

//         if (!CEO) {
//             console.log("Unauthorized - CEO not found.");
//             return res.status(401).json({ error_code: 401, message: "Unauthorized" });
//         }

//         // Find counts for associated models
//         const gmCount = await GM_Model.countDocuments({ CEO_Id: CEO._id });
//         const smCount = await SM_Model.countDocuments({ CEO_Id: CEO._id });
//         const dsmCount = await DSM_Model.countDocuments({ CEO_Id: CEO._id });
//         const saCount = await SA_Model.countDocuments({ CEO_Id: CEO._id });

//         // Calculate total number of employees
//         const totalEmployees = gmCount + smCount + dsmCount + saCount;

//         // Find DSMs directly linked to the CEO
//         const dsmDirectlyLinked = await DSM_Model.find({ CEO_Id: CEO._id });

//         // Log DSMs directly linked to the CEO for debugging
//         console.log("DSMs directly linked to CEO: ", dsmDirectlyLinked);

//         // Extract UserListIds from dsmDirectlyLinked
//         let userListIds = [];
//         dsmDirectlyLinked.forEach(dsm => {
//             userListIds = userListIds.concat(dsm.UserListId);
//         });

//         // Find all User_Model documents using userListIds
//         const users = await User_Model.find({ _id: { $in: userListIds } });

//         return res.status(200).json({
//             error_code: 200,
//             message: "Dashboard data fetched successfully for CEO.",
//             GM: gmCount,
//             SM: smCount,
//             DSM: dsmCount,
//             SA: saCount,
//             totalEmployees: totalEmployees,
//             // DSMDirectlyLinked: dsmDirectlyLinked,
//             users: users
//         });
//     } catch (error) {
//         console.error("Error fetching CEO dashboard data:", error);
//         return res.status(500).json({
//             error_code: 500,
//             message: "Failed to fetch CEO dashboard data."
//         });
//     }
// };

const getDashboardCEO = async (req, res) => {
    try {
        // Find the CEO by user ID and adminType
        const CEO = await CEO_Model.findOne({
            _id: req.userId,
            adminType: "CEO"
        });

        if (!CEO) {
            // console.log("Unauthorized - CEO not found.");
            return res.status(401).json({ error_code: 401, message: "Unauthorized" });
        }

        // Find counts for associated models
        const gmCount = await GM_Model.countDocuments({ CEO_Id: CEO._id });
        const smCount = await SM_Model.countDocuments({ CEO_Id: CEO._id });
        const dsmCount = await DSM_Model.countDocuments({ CEO_Id: CEO._id });
        const saCount = await SA_Model.countDocuments({ CEO_Id: CEO._id });

        // Calculate total number of employees
        const totalEmployees = gmCount + smCount + dsmCount + saCount;

        // Find DSMs directly linked to the CEO
        const dsmDirectlyLinked = await DSM_Model.find({ CEO_Id: CEO._id });

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

        return res.status(200).json({
            error_code: 200,
            message: "Dashboard data fetched successfully for CEO.",
            GM: gmCount,
            SM: smCount,
            DSM: dsmCount,
            SA: saCount,
            totalEmployees: totalEmployees,
            // DSMDirectlyLinked: dsmDirectlyLinked,
            // users: users,
            levelCounts: levelCounts,
            totalUsers: users.length
        });
    } catch (error) {
        console.error("Error fetching CEO dashboard data:", error);
        return res.status(500).json({
            error_code: 500,
            message: "Failed to fetch CEO dashboard data."
        });
    }
};




//---------------------------------------------------------------
// Update CEO Login 

// const updateCEOAdmin = async function (req, res) {
//     try {
//         let ceoId = req.userId;
//         let ceo = await CEO_Model.findById(ceoId);
//         let obj = {
//             name: req.body.name ? req.body.name : ceo.name,
//             email: req.body.email ? req.body.email : ceo.email,
//             mobileNumber: req.body.mobileNumber ? req.body.mobileNumber : ceo.mobileNumber,
//         };

//         // Update CEO information in the database
//         await CEO_Model.findOneAndUpdate(
//             { _id: ceoId },
//             { $set: obj },
//             { new: true }
//         );

//         return res.status(200).json({
//             error_code: 200,
//             message: "CEO updated successfully",
//             UpdatedCEO: obj,
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ error_code: 500, message: error.message });
//     }
// };


const updateCEOAdmin = async function (req, res) {
    try {
        let ceoId = req.userId;
        let ceo = await CEO_Model.findById(ceoId);
        let obj = {
            name: req.body.name ? req.body.name : ceo.name,
            email: req.body.email ? req.body.email : ceo.email,
            mobileNumber: req.body.mobileNumber ? req.body.mobileNumber : ceo.mobileNumber,
        };

        // Update CEO information in the database
        await CEO_Model.findOneAndUpdate(
            { _id: ceoId },
            { $set: obj },
            { new: true }
        );

        // Find and update CEO's name in related models
        const modelsToUpdate = [GM_Model, SM_Model, DSM_Model, SA_Model];
        const updatePromises = modelsToUpdate.map(async (Model) => {
            const updateQuery = { CEO_Id: ceoId };
            const updateFields = { CEO_Name: obj.name };
            await Model.updateMany(updateQuery, { $set: updateFields });
        });
        await Promise.all(updatePromises);

        return res.status(200).json({
            error_code: 200,
            message: "CEO updated successfully",
            UpdatedCEO: obj,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error_code: 500, message: error.message });
    }
};

// --------------------------------------------------------

const update_CEOAdmin_image = async function (req, res) {
    try {
        let ceoId = req.userId;
        let baseUrl = baseURL.generateBaseUrl(req);
        let ceo = await CEO_Model.findById(ceoId);
        console.log("ceo -: ", ceo);

        if (!req.files || req.files.length === 0) {
            return res.json({ error_code: 400, message: "No image uploaded" });
        }

        let profileImageUrl = "/uploads/" + req.files[0].filename;

        await CEO_Model.findOneAndUpdate(
            { _id: ceoId },
            { $set: { profileImage: profileImageUrl } },
            { new: true }
        );

        return res.status(200).json({
            error_code: 200,
            message: "CEO profile image updated successfully",
            profileImage: profileImageUrl
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error_code: 500, message: "Internal server error" });
    }
};

// ----------------------------------------------------------- 

const updateCEOAdminPassword = async function (req, res) {
    try {
        const ceoId = req.userId;
        const newPassword = req.body.confirmPassword;

        if (!newPassword) {
            return res.json({ error_code: 400, message: 'New password is required' });
        }

        const obj = {
            password: newPassword
        };

        await CEO_Model.findByIdAndUpdate(
            ceoId,
            { $set: obj },
            { new: true }
        );

        return res.status(200).json({ error_code: 200, message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error_code: 500, message: 'Error occurred while changing password' });
    }
};


// ------------------------------------------------------------------

const getCEOAdminProfile = async function (req, res) {
    try {
        let ceoId = req.userId;
        let baseUrl = baseURL.generateBaseUrl(req);

        let ceoAdmin = await CEO_Model.findById(ceoId);
        let obj = {
            name: ceoAdmin.name ? ceoAdmin.name : undefined,
            email: ceoAdmin.email ? ceoAdmin.email : undefined,
            mobileNumber: ceoAdmin.mobileNumber ? ceoAdmin.mobileNumber : undefined,
            profileImage: ceoAdmin.profileImage ? `${baseUrl}${ceoAdmin.profileImage}` : undefined
        }
        return res.status(200).json({ errro_code: 200, obj })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error_code: 500, message: 'error inside getCEOProfile in CEO controller..!' })
    }
};


const viewCEO = async function (req, res) {
    try {
        const { id } = req.params;

        // Checking if the provided id is valid
        if (!id) {
            return res.status(400).json({
                error_code: 400,
                message: "CEO ID is required."
            });
        }

        // Fetching the CEO by ID from the database
        const ceo = await CEO_Model.findById(id);

        // Checking if the CEO was found
        if (!ceo) {
            return res.status(404).json({
                error_code: 404,
                message: "CEO not found."
            });
        }

        const GMIDs = ceo.GM_Id;

        // Fetching all GM models concurrently using Promise.all
        const gmModels = await Promise.all(GMIDs.map(gmId => GM_Model.findById(gmId)));

        const gmDetails = gmModels
            .filter(gm => gm !== null)
            .map(gm => ({
                _id: gm._id,
                nameGM: gm.nameGM,
                email: gm.email,
                mobileNumber: gm.mobileNumber,
                adminType: gm.adminType,
                status: gm.status
            }));

        return res.status(200).json({
            error_code: 200,
            message: "GM Lists fetched successfully.",
            GMs: gmDetails,
        });

    } catch (error) {
        console.error("Error fetching CEO:", error);
        return res.status(500).json({
            error_code: 500,
            message: "Internal server error: " + error.message
        });
    }
};


const viewGmandGetSmList = async function (req, res) {
    try {
        const { id } = req.params;

        // Checking if the provided GM id is valid
        if (!id) {
            return res.status(400).json({
                error_code: 400,
                message: "GM ID is required."
            });
        }

        // Fetching the GM by ID from the database
        const gm = await GM_Model.findById(id);

        // Checking if the GM was found
        if (!gm) {
            return res.status(404).json({
                error_code: 404,
                message: "GM not found."
            });
        }

        // Fetching the SM IDs associated with the GM
        const SMIDs = gm.SM_Id;

        // Fetching all SM models concurrently using Promise.all
        const smModels = await Promise.all(SMIDs.map(smId => SM_Model.findById(smId)));

        // Extracting desired details from SM models, ensuring sm is not null
        const smDetails = smModels
            .filter(sm => sm !== null)
            .map(sm => ({
                _id: sm._id,
                nameSM: sm.nameSM,
                email: sm.email,
                mobileNumber: sm.mobileNumber,
                adminType: sm.adminType,
                status: sm.status
            }));

        // Returning the details of SMs
        return res.status(200).json({
            error_code: 200,
            message: "SM lists fetched successfully.",
            SMs: smDetails,
        });

    } catch (error) {
        console.error("Error fetching GM and SM list:", error);
        return res.status(500).json({
            error_code: 500,
            message: "Internal server error: " + error.message
        });
    }
};

// -------------------------------------------------------------------

const viewSmandGetDSMListandSAList = async function (req, res) {
    try {
        const { id } = req.params;

        // Checking if the provided SM id is valid
        if (!id) {
            return res.status(400).json({
                error_code: 400,
                message: "SM ID is required."
            });
        }

        // Fetching the SM by ID from the database
        const sm = await SM_Model.findById(id);

        // Checking if the SM was found
        if (!sm) {
            return res.status(404).json({
                error_code: 404,
                message: "SM not found."
            });
        }

        // Fetching the DSM IDs and SA IDs associated with the SM
        const DSMIDs = sm.DSM_Id;
        const SAIDs = sm.SA_Id;

        // Fetching all DSM models concurrently using Promise.all
        const dsmModels = await Promise.all(DSMIDs.map(dsmId => DSM_Model.findById(dsmId)));

        // Fetching all SA models concurrently using Promise.all
        const saModels = await Promise.all(SAIDs.map(saId => SA_Model.findById(saId)));

        // Fetching user counts for each DSM's district
        const dsmDetailsPromises = dsmModels
            .filter(dsm => dsm !== null)
            .map(async dsm => {
                const userCount = await User_Model.countDocuments({ district: dsm.city });
                return {
                    _id: dsm._id,
                    nameDSM: dsm.nameDSM,
                    email: dsm.email,
                    mobileNumber: dsm.mobileNumber,
                    adminType: dsm.adminType,
                    status: dsm.status,
                    district: dsm.city,
                    noOfUsers: userCount,
                };
            });

        // Resolving all DSM details with user counts
        const dsmDetails = await Promise.all(dsmDetailsPromises);

        // Extracting desired details from SA models, ensuring sa is not null
        const saDetails = saModels
            .filter(sa => sa !== null)
            .map(sa => ({
                _id: sa._id,
                nameSA: sa.nameSA,
                email: sa.email,
                mobileNumber: sa.mobileNumber,
                adminType: sa.adminType,
                status: sa.status
            }));

        // Returning the details of SM along with their DSMs and SAs
        return res.status(200).json({
            error_code: 200,
            message: "DSM and SA lists fetched successfully.",
            SM: {
                _id: sm._id,
                nameSM: sm.nameSM,
                adminType: sm.adminType,
            },
            DSMs: dsmDetails,
            SAs: saDetails
        });

    } catch (error) {
        console.error("Error fetching SM, DSM, and SA list:", error);
        return res.status(500).json({
            error_code: 500,
            message: "Internal server error: " + error.message
        });
    }
};

// ------------------------------------------------------


const viewDSMandSA = async function (req, res) {
    try {
        const { id, type } = req.body;

        // Checking if the provided SM id is valid
        if (!id) {
            return res.status(400).json({
                error_code: 400,
                message: "SM ID is required."
            });
        }

        // Checking if the type (DSM or SA) is provided and valid
        if (!type) {
            return res.status(400).json({
                error_code: 400,
                message: "Type (DSM or SA) is required."
            });
        } else if (type !== 'DSM' && type !== 'SA') {
            return res.status(400).json({
                error_code: 400,
                message: "Invalid type. Only 'DSM' or 'SA' are allowed."
            });
        }

        if (type === 'DSM') {

            const dsm = await DSM_Model.findById(id);

            // Checking if the DSM was found
            if (!dsm) {
                return res.status(404).json({
                    error_code: 404,
                    message: "DSM not found."
                });
            }

            const userList = dsm.UserListId;

            const users = await User_Model.find({
                _id: { $in: userList }
            }, '_id referralById myReferralId mobileNumber name email address pincode village taluka district state profileImage adminType currentLevel createdAt updatedAt');

            return res.status(200).json({
                error_code: 200,
                message: "DSM details fetched successfully.",
                users: users,
            });

        } else if (type === 'SA') {
            const sa = await SA_Model.findById(id);

            // Checking if the SA was found
            if (!sa) {
                return res.status(404).json({
                    error_code: 404,
                    message: "SA not found."
                });
            }

            // Preparing the SA details
            const saDetails = {
                _id: sa._id,
                nameSA: sa.nameSA,
                email: sa.email,
                mobileNumber: sa.mobileNumber,
                adminType: sa.adminType,
                status: sa.status
            };

            // Returning the SA details
            return res.status(200).json({
                error_code: 200,
                message: "SA details fetched successfully.",
                SA: saDetails
            });
        }

    } catch (error) {
        console.error("Error fetching DSM or SA details:", error);
        return res.status(500).json({
            error_code: 500,
            message: "Internal server error: " + error.message
        });
    }
};


const getGMList = async (req, res) => {
    try {
        // Find the CEO by user ID and adminType
        const CEO = await CEO_Model.findOne({
            _id: req.userId,
            adminType: "CEO"
        });

        if (!CEO) {
            console.log("Unauthorized - CEO not found.");
            return res.status(401).json({ error_code: 401, message: "Unauthorized" });
        }

        // Assuming CEO has an array of GM_Id
        const GM_Ids = CEO.GM_Id;

        // Find all GM documents where the _id is in the GM_Ids array
        const GMList = await GM_Model.find({
            _id: { $in: GM_Ids }
        });

        return res.status(200).json(GMList);

    } catch (error) {
        console.error("Error fetching GM list:", error);
        return res.status(500).json({ error_code: 500, message: "Internal Server Error" });
    }
};



// ------------------------------------------------------





module.exports = {

    createCEO,
    loginCEO,
    updateCEO,
    deleteCEO,
    getAllCEO,
    getCEOwithId,
    getSelectCEOList,
    changeStatusCEO,


    getDashboardCEO,
    updateCEOAdmin,
    update_CEOAdmin_image,
    updateCEOAdminPassword,
    getCEOAdminProfile,


    viewCEO,
    viewGmandGetSmList,
    viewSmandGetDSMListandSAList,
    viewDSMandSA,
    getGMList,
};
