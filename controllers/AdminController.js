const Admin = require("../model/AdminModel");
const baseURL = require("../constant/baseURL");
const bcrypt = require("bcryptjs");
const jwtToken = require("../constant/jwtToken");
const { generateAuthToken } = require("../constant/jwtToken")
const Admin_Model = require("../model/AdminModel");
const CEO_Model = require("../model/CEO_Model");
const GM_Model = require("../model/GM_Model");
const SM_Model = require("../model/SM_Model");
const DSM_Model = require("../model/SM_DSM_Model");
const SA_Model = require("../model/SM_SA_Model");
const User_Model = require("../model/UserModel");



// const createAdmin = async function (req, res) {
//   try {
//     let baseUrl = baseURL.generateBaseUrl(req);
//     const saltRounds = 8;
//     const encryptedPassword = await bcrypt.hash(req.body.password, saltRounds);
//     let obj = {
//       name: req.body.name ? req.body.name : undefined,
//       number: req.body.number ? req.body.number : undefined,
//       email: req.body.email ? req.body.email : undefined,
//       password: encryptedPassword ? encryptedPassword : undefined,
//       adminType: "Admin"
//     };
//     if (req.files.length > 0) {
//       obj["profileImage"] = baseUrl + "/uploads/" + req.files[0].filename;
//     }
//     await Admin.create(obj);
//     return res
//       .status(200)
//       .json({ error_code: 200, message: "admin created successfully..!" });
//   } catch (error) {
//     console.log(error);
//     return res
//       .status(500)
//       .json({ error_code: 500, message: "error inside create admin..!" });
//   }
// };
// ----------------------------------------------------------------------------------------------------------------------

const admin_login = async function (req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ error_code: 400, message: "Invalid admin" })
    }
    const decrypPassword = admin.password;

    const pass = await bcrypt.compare(password, decrypPassword);
    if (!pass) {
      return res.status(400).json({ error_code: 400, message: "Password Incorrect" });
    }
    const token = generateAuthToken(admin._id, email, admin.adminType);
    // const token = generateAuthToken(ceo._id, email, ceo.adminType)
    res.setHeader("x-api-key", token);
    {
      return res.status(201).json({
        error_code: 200,
        message: "admin login successfully",
        token: token,
      });
    }
  } catch (error) {
    return res.status(500).json({ error_code: 500, message: error.message });
  }
};

// ----------------------------------------------------------------------------------------------------------------------

const update_admin = async function (req, res) {
  try {
    let adminId = req.userId;
    let admin = await Admin.findById(adminId);
    let obj = {
      name: req.body.name ? req.body.name : admin.name,
      email: req.body.email ? req.body.email : admin.email,
      number: req.body.number ? req.body.number : admin.number,
    };

    await Admin.findOneAndUpdate(
      { _id: adminId },
      { $set: obj },
      { new: true }
    );

    return res.status(200).json({
      error_code: 200,
      message: "Admin updated successfully",
      UpdatedAdmin: obj,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error_code: 500, message: error.message });
  }
};

// ----------------------------------------------------------------------------------------------------------------------

const update_admin_image = async function (req, res) {
  try {
    let adminId = req.userId;
    let baseUrl = baseURL.generateBaseUrl(req);
    let admin = await Admin.findById(adminId);

    if (!req.files || req.files.length === 0) {
      return res.json({ error_code: 400, message: "No image uploaded" });
    }

    let profileImageUrl = "/uploads/" + req.files[0].filename;

    await Admin.findOneAndUpdate(
      { _id: adminId },
      { $set: { profileImage: profileImageUrl } },
      { new: true }
    );

    return res.status(200).json({
      error_code: 200,
      message: "Admin profile image updated successfully",
      profileImage: profileImageUrl
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error_code: 500, message: "Internal server error" });
  }
};

// ----------------------------------------------------------------------------------------------------------------------


// const update_admin = async function (req, res) {
//   try {
//     let adminId = req.userId;
//     let baseUrl = baseURL.generateBaseUrl(req);
//     let admin = await Admin.findById(adminId);
//     let obj = {
//       name: req.body.name ? req.body.name : admin.name,
//       email: req.body.email ? req.body.email : admin.email,
//       number: req.body.number ? req.body.number : admin.number,
//     };
//     if (req.files.length > 0) {
//       obj["profileImage"] = baseUrl + "/uploads/" + req.files[0].filename;
//     }
//     await Admin.findOneAndUpdate(
//       { _id: adminId },
//       { $set: obj },
//       { new: true }
//     );

//     return res.status(200).json({
//       error_code: 200,
//       message: "admin update successfully...",
//       obj,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ error_code: 500, message: error });
//   }
// };

// ----------------------------------------------------------------------------------------------------------------------

const change_password = async function (req, res) {
  try {
    let adminId = req.userId;
    const encryptedPassword = await bcrypt.hash(req.body.confirmPassword, 8);
    let obj = {
      password: encryptedPassword ? encryptedPassword : undefined
    }
    await Admin.findByIdAndUpdate(
      { _id: adminId },
      { $set: obj },
      { new: true }
    );
    return res.status(200).json({ error_code: 200, message: 'password update successfully..!' })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error_code: 500, message: 'error inside change password' })
  }
};

//------------------------------------------------------------------------  

const getAdminProfile = async function (req, res) {
  try {
    let adminId = req.userId;
    let baseUrl = baseURL.generateBaseUrl(req);

    let admin = await Admin.findById(adminId);
    let obj = {
      name: admin.name ? admin.name : undefined,
      email: admin.email ? admin.email : undefined,
      number: admin.number ? admin.number : undefined,
      profileImage: admin.profileImage ? `${baseUrl}${admin.profileImage}` : undefined
    };

    return res.status(200).json({ error_code: 200, obj });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error_code: 500, message: 'error inside getAdminProfile in Admin controller..!' });
  }
};

// -----------------------------------------------------------------

const allAdminLogins = async (req, res) => {
  const { email, password, loginType } = req.body;

  console.log("email: ", email);
  console.log("password", password);
  console.log("loginType", loginType);


  try {
    let user = null;
    let userType = null;

    switch (loginType) {
      case 'Admin':
        user = await Admin_Model.findOne({ email });
        userType = 'Admin';
        break;

      case 'CEO':
        user = await CEO_Model.findOne({ email });
        userType = 'CEO';
        break;

      case 'GM':
        user = await GM_Model.findOne({ email });
        userType = 'GM';
        break;

      case 'SM':
        user = await SM_Model.findOne({ email });
        userType = 'SM';
        break;

      case 'DSM':
        user = await DSM_Model.findOne({ email });
        userType = 'DSM';
        break;

      case 'SA':
        user = await SA_Model.findOne({ email });
        userType = 'SA';
        break;

      default:
        return res.json({ error_code: 400, message: 'Invalid loginType' });
    }

    if (!user) {
      return res.json({ error_code: 401, message: 'User not found for ' + loginType });
    }

    let isPasswordValid = false;

    // Check if the stored password is hashed
    if (user.password.startsWith('$2') || user.password.startsWith('$3')) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // Check plain text password
      isPasswordValid = password === user.password;
    }
    if (!isPasswordValid) {
      return res.json({ error_code: 401, message: 'Invalid credentials for ' + loginType });
    }

    // Generate JWT token
    const token = generateAuthToken(user._id, email, userType);

    return res.status(200).json({
      error_code: 200,
      message: `Login Successful for ${loginType}`,
      loginType: userType,
      Token: token,
      id: user._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error_code: 500,
      message: 'Internal Server Error'
    });
  }
};







// -----------------------------------------------------------------
// =================================================================
// =================================================================

// All SM With GM name, SM name, CEO Name

const getAllSMInAdminMain = async (req, res) => {
  try {
    const allGMs = await GM_Model.find({});
    // console.log("All GMs : ", allGMs);

    const GMsWithAllSMs = await Promise.all(allGMs.map(async (gm) => {
      const SMs = await SM_Model.find({ _id: { $in: gm.SM_Id } });

      const SMsWithCEOName = SMs.map(sm => ({
        nameCEO: gm.CEO_Name,
        ...sm._doc
      }));

      return SMsWithCEOName;
    }));

    return res.status(200).json({
      error_code: 200,
      Messege: "All SM Fetched Successfully",
      data: GMsWithAllSMs.flat(),
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error_code: 500,
      message: 'Internal Server Error',
    });
  }
};

// -----------------------------------------------------------------

// const getAllDSMInAdminMain = async (req, res) => {
//   try {

//     const allDSMs = await DSM_Model.find({});
//     // console.log("All DSMs: ", allDSMs);

//     const DSMsWithCEOName = await Promise.all(allDSMs.map(async (dsm) => {

//       const CEO = await CEO_Model.findById(dsm.CEO_Id);
//       return {
//         CEO_Name: CEO ? CEO.name : "",
//         ...dsm._doc
//       };
//     }));

//     return res.status(200).json({
//       error_code: 200,
//       message: "All DSMs Fetched Successfully",
//       data: DSMsWithCEOName,
//     });

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       error_code: 500,
//       message: 'Internal Server Error',
//     });
//   }
// };
const getAllDSMInAdminMain = async (req, res) => {
  try {
    const allDSMs = await DSM_Model.find({});

    const DSMsWithDetails = await Promise.all(allDSMs.map(async (dsm) => {
      const CEO = await CEO_Model.findById(dsm.CEO_Id);

      // Counting users associated with the DSM's district
      const userCount = await User_Model.countDocuments({ district: dsm.city });

      return {
        CEO_Name: CEO ? CEO.name : "",
        noOfUsers: userCount,
        ...dsm._doc
      };
    }));

    return res.status(200).json({
      error_code: 200,
      message: "All DSMs Fetched Successfully",
      data: DSMsWithDetails,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error_code: 500,
      message: 'Internal Server Error',
    });
  }
};


// -----------------------------------------------------------------

const getAllSAInAdminMain = async (req, res) => {
  try {
    const allSAs = await SA_Model.find({});
    // console.log("All SAs: ", allSAs);

    const SAsWithCEOName = await Promise.all(allSAs.map(async (sa) => {
      const CEO = await CEO_Model.findById(sa.CEO_Id);
      return {
        CEO_Name: CEO ? CEO.name : "",
        ...sa._doc
      };
    }));

    return res.status(200).json({
      error_code: 200,
      message: "All SA Fetched Successfully",
      data: SAsWithCEOName,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error_code: 500,
      message: 'Internal Server Error',
    });
  }
};




// =================================================================
// -----------------------------------------------------------------


const deleteCEOandDeleteCEOName = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("id -:  ", id);
    if (!id) {
      return res.status(400).json({
        error_code: 400,
        message: "CEO ID is required."
      });
    }

    const ceo = await CEO_Model.findById(id);
    if (!ceo) {
      return res.status(404).json({
        error_code: 404,
        message: "CEO not found."
      });
    }

    const gmIdsAssociatedWithCEO = ceo.GM_Id;
    // console.log("gmIdsAssociatedWithCEO -: ", gmIdsAssociatedWithCEO);

    const deletedCEO = await CEO_Model.findByIdAndDelete(id);
    if (!deletedCEO) {
      return res.status(404).json({
        error_code: 404,
        message: "CEO not found."
      });
    }

    const GMsToUpdate = await GM_Model.find({ CEO_Name: deletedCEO.name });

    await Promise.all(GMsToUpdate.map(async (gm) => {
      gm.CEO_Name = null;
      gm.CEO_Id = null;
      await gm.save();
    }));

    await GM_Model.updateMany(
      { _id: { $in: gmIdsAssociatedWithCEO } },
      { $unset: { CEO_Name: "", CEO_Id: "" } }
    );

    return res.status(200).json({
      error_code: 200,
      message: "CEO deleted successfully and associated GMs updated."
    });

  } catch (error) {
    console.error("Error deleting CEO:", error);
    return res.status(500).json({
      error_code: 500,
      message: "Internal server error:" + error.message
    });
  }
};

// -----------------------------------------------------------------


const deleteGMandDeleteGMName = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("id :- ", id);
    if (!id) {
      return res.status(400).json({
        error_code: 400,
        message: "GM ID is required."
      });
    }

    const gmToDelete = await GM_Model.findById(id);

    if (!gmToDelete) {
      return res.status(404).json({
        error_code: 404,
        message: "GM not found."
      });
    }

    const smIdsAssociatedWithGM = gmToDelete.SM_Id;
    console.log("smIdsAssociatedWithGM -: ", smIdsAssociatedWithGM);

    const SMsToUpdate = await SM_Model.find({ GM_Id: id });

    const deletedGM = await GM_Model.findByIdAndDelete(id);

    if (!deletedGM) {
      return res.status(404).json({
        error_code: 404,
        message: "Failed to delete GM."
      });
    }

    // Remove GM's name and ID from associated SMs
    await Promise.all(SMsToUpdate.map(async (sm) => {
      sm.GM_Name = null;
      sm.GM_Id = null;
      await sm.save();
    }));

    // Unset GM_Name and GM_Id fields in SM documents associated with the deleted GM
    await SM_Model.updateMany(
      { _id: { $in: smIdsAssociatedWithGM } },
      { $unset: { GM_Name: "", GM_Id: "" } }
    );

    return res.status(200).json({
      error_code: 200,
      message: "GM deleted successfully and associated SMs updated."
    });

  } catch (error) {
    console.error("Error deleting GM:", error);
    return res.status(500).json({
      error_code: 500,
      message: "Internal server error:" + error.message
    });
  }
};




// ----------------------------------------------------------------------



const deleteSMandDeleteSMName = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Deleting SM with ID:", id);

    if (!id) {
      console.log("SM ID is required.");
      return res.status(400).json({
        error_code: 400,
        message: "SM ID is required."
      });
    }

    const smToDelete = await SM_Model.findById(id);

    if (!smToDelete) {
      console.log("SM not found.");
      return res.status(404).json({
        error_code: 404,
        message: "SM not found."
      });
    }

    console.log("Deleting associated DSMs and SAs...");

    const DSMsToUpdate = await DSM_Model.find({ SM_Id: id });

    await Promise.all(DSMsToUpdate.map(async (dsm) => {
      if (dsm.hasOwnProperty('SM_Name')) {
        dsm.SM_Name = null;
      }
      if (dsm.hasOwnProperty('SM_Id')) {
        dsm.SM_Id = null;
      }
      await dsm.save();
    }));

    const SAsToUpdate = await SA_Model.find({ SM_Id: id });

    await Promise.all(SAsToUpdate.map(async (sa) => {
      if (sa.hasOwnProperty('SM_Name')) {
        sa.SM_Name = null;
      }
      if (sa.hasOwnProperty('SM_Id')) {
        sa.SM_Id = null;
      }
      await sa.save();
    }));

    console.log("Updating associated DSMs and SAs...");

    await DSM_Model.updateMany(
      { _id: { $in: DSMsToUpdate.map(dsm => dsm._id) } },
      { $unset: { SM_Name: "", SM_Id: "" } }
    );

    await SA_Model.updateMany(
      { _id: { $in: SAsToUpdate.map(sa => sa._id) } },
      { $unset: { SM_Name: "", SM_Id: "" } }
    );

    console.log("Deleting SM from database...");

    const deletedSM = await SM_Model.findByIdAndDelete(id);

    if (!deletedSM) {
      console.log("Failed to delete SM.");
      return res.status(404).json({
        error_code: 404,
        message: "Failed to delete SM."
      });
    }

    console.log("SM deleted successfully and associated records updated.");

    return res.status(200).json({
      error_code: 200,
      message: "SM deleted successfully and associated records updated."
    });

  } catch (error) {
    console.error("Error deleting SM:", error);
    return res.status(500).json({
      error_code: 500,
      message: "Internal server error: " + error.message
    });
  }
};




//----------------------------------------------------------------------
//----------------------------------------------------------------------
// Admin Dashboard 

const getAdminDashboard = async (req, res) => {
  try {
    // Find count of CEO_Model records
    const ceoCount = await CEO_Model.countDocuments();

    // Find count of GM_Model records
    const gmCount = await GM_Model.countDocuments();

    // Find count of SM_Model records
    const smCount = await SM_Model.countDocuments();

    // Find count of DSM_Model records
    const dsmCount = await DSM_Model.countDocuments();

    // Find count of SA_Model records
    const saCount = await SA_Model.countDocuments();

    // Calculate total number of employees
    const totalEmployees = ceoCount + gmCount + smCount + dsmCount + saCount;

    // Find user counts by levels
    const level_1 = await User_Model.countDocuments({ currentLevel: "1" });
    const level_2 = await User_Model.countDocuments({ currentLevel: "2" });
    const level_3 = await User_Model.countDocuments({ currentLevel: "3" });
    const level_4 = await User_Model.countDocuments({ currentLevel: "4" });
    const level_5 = await User_Model.countDocuments({ currentLevel: "5" });
    const level_6 = await User_Model.countDocuments({ currentLevel: "6" });
    const level_Crown = await User_Model.countDocuments({ currentLevel: "Crown" });

    // Find total number of users
    const totalUsers = await User_Model.countDocuments();

    return res.status(200).json({
      error_code: 200,
      message: "Dashboard data fetched successfully.",
      CEO: ceoCount,
      GM: gmCount,
      SM: smCount,
      DSM: dsmCount,
      SA: saCount,
      totalEmployees: totalEmployees,
      level_1_Users: level_1,
      level_2_Users: level_2,
      level_3_Users: level_3,
      level_4_Users: level_4,
      level_5_Users: level_5,
      level_6_Users: level_6,
      level_Crown_Users: level_Crown,
      totalUsers: totalUsers
    });
  } catch (error) {
    console.error("Error fetching counts:", error);
    return res.status(500).json({
      error_code: 500,
      message: "Failed to fetch dashboard data."
    });
  }
};


//----------------------------------------------------------------------




module.exports = {
  // createAdmin,
  admin_login,
  update_admin,
  change_password,
  getAdminProfile,
  update_admin_image,
  allAdminLogins,

  getAllSMInAdminMain,
  getAllDSMInAdminMain,
  getAllSAInAdminMain,

  deleteCEOandDeleteCEOName,
  deleteGMandDeleteGMName,
  deleteSMandDeleteSMName,

  getAdminDashboard,

};

