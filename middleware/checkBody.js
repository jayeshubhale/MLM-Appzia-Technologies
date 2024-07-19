const Admin = require("../model/AdminModel");
const CEO_Model = require("../model/CEO_Model");
const GM_Model = require("../model/GM_Model");
const SM_Model = require("../model/SM_Model");
const DSM_Model = require("../model/SM_DSM_Model");
const SA_Model = require("../model/SM_SA_Model");
const bcrypt = require('bcryptjs')
const { emailRegex, phoneRegex, passRegex } = require("../constant/validation");

const check_body = async function (req, res, next) {
  try {
    if (req.body == undefined) {
      return res.status(200).json({ error_code: 400, message: "empty body..!" });
    }
    let { name, email, number, password } = req.body;
    if (!name) {
      return res.status(200).json({ error_code: 400, message: "please provide name..!" });
    }
    if (!email) {
      return res.status(200).json({ error_code: 400, message: "please provide email..!" });
    }
    if (!emailRegex.test(email)) {
      return res.status(200).json({ error_code: 400, message: "please provide valid email Id..!" });
    }
    if (!number) {
      return res.status(200).json({ error_code: 400, message: "please provide number..!" });
    }
    if (!phoneRegex.test(number)) {
      return res.status(200).json({ error_code: 400, message: "please provide valid indian formate number..!" });
    }
    if (!password) {
      return res.status(200).json({ error_code: 400, message: "please provide password..!" });
    }
    if (!passRegex.test(password)) {
      return res.status(200).json({ error_code: 400, message: "please provide strong password.  useing special charectores..!" });
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error_code: 500, message: "error inside check_body middleware..!" });
  }
};

const login = async function (req, res, next) {
  try {
    if (req.body == undefined) {
      return res.status(200).json({ error_code: 400, message: "please provide emailId and passowrd..!" });
    }
    let { email, password } = req.body;
    if (!email) {
      return res.status(200).json({ error_code: 400, message: "please provide emailId..!" });
    }
    if (!password) {
      return res.status(200).json({ error_code: 400, message: "please provide password..!" });
    }
    next()
  } catch (error) {
    console.log(error);
    console.log("error inside login middleware..!")
    return res.status(500).json({ error_code: 500, message: "error inside login middleware..!" });
  }
};

const update = async function (req, res, next) {
  try {
    if (req.body == undefined) {
      return res.status(200).json({ error_code: 400, message: "empty body..!" });
    }
    let { name, email, number } = req.body;
    if (name != undefined) {
      if (!name) {
        return res.status(200).json({ error_code: 400, message: "please provide name..!" });
      }
    }
    if (email != undefined) {
      if (!email) {
        return res.status(200).json({ error_code: 400, message: "please provide email..!" });
      }
      if (!emailRegex.test(email)) {
        return res.status(200).json({ error_code: 400, message: "please provide valid email Id..!" });
      }
    }
    if (number != undefined) {
      if (!number) {
        return res.status(200).json({ error_code: 400, message: "please provide number..!" });
      }
      if (!phoneRegex.test(number)) {
        return res.status(200).json({ error_code: 400, message: "please provide valid indian formate number..!" });
      }
    }
    next()
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error_code: 500, message: 'error inside update middleware..!' })
  }
}

const password = async function (req, res, next) {
  try {
    if (req.body == undefined) {
      return res.status(200).json({ error_code: 400, message: "empty body..!" });
    }
    let adminId = req.userId;
    let admin = await Admin.findById(adminId);
    let { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword) {
      return res.status(200).json({ error_code: 400, message: "please provide currentPassword..!" });
    }

    if (!newPassword) {
      return res.status(200).json({ error_code: 400, message: "please provide newPassword..!" });
    }
    if (!passRegex.test(newPassword)) {
      return res
        .status(200).json({ error_code: 400, message: "please provide strong password. useing Upppercase, numbers and special charectores..!" });
    }
    if (!confirmPassword) {
      return res.status(200).json({ error_code: 400, message: "please provide confirmPassword..!" });
    }
    if (newPassword != confirmPassword) {
      return res.status(200).json({ error_code: 400, message: "new password and confirm password is Incorrect..!" });
    }
    if (!admin) {
      return res.status(200).json({ error_code: 400, message: "admin not exist..!" });
    }
    const decrypPassword = admin.password;
    const pass = await bcrypt.compare(currentPassword, decrypPassword);
    if (!pass) {
      return res.json({ error_code: 400, message: "Incorrect current password..!" });
    }
    next()
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error_code: 500, message: 'error inside password middleware..!' })
  }
}


const checkRequiredFields = (req, res, next) => {
  try {
    const { email, password, loginType } = req.body;

    if (!email) {
      return res.status(400).json({
        error_code: 400,
        message: 'Missing email field.'
      });
    }
    if (!password) {
      return res.status(400).json({
        error_code: 400,
        message: 'Missing password field.'
      });
    }
    if (!loginType) {
      return res.status(400).json({
        error_code: 400,
        message: 'Missing loginType field.'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      error_code: 500,
      message: 'Internal Server Error'
    });
  }
};

// ------------------------------------------

const AdminCEOpassword = async function (req, res, next) {
  try {
    if (req.body === undefined) {
      return res.status(400).json({ error_code: 400, message: "Empty body..!" });
    }

    const ceoId = req.userId;
    const ceo = await CEO_Model.findById(ceoId);

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ error_code: 400, message: "Please provide current password..!" });
    }

    if (!newPassword) {
      return res.status(400).json({ error_code: 400, message: "Please provide new password..!" });
    }

    if (!confirmPassword) {
      return res.status(400).json({ error_code: 400, message: "Please provide confirm password..!" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error_code: 400, message: "New password and confirm password do not match..!" });
    }

    if (!ceo) {
      return res.status(400).json({ error_code: 400, message: "CEO admin not found..!" });
    }

    // Directly compare the current password provided in the request with the stored password
    if (ceo.password !== currentPassword) {
      return res.json({ error_code: 400, message: "Incorrect current password..!" });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error_code: 500, message: 'Error inside password middleware..!' });
  }
};


const AdminGMPassword = async function (req, res, next) {
  try {
    if (req.body === undefined) {
      return res.status(400).json({ error_code: 400, message: "Empty body..!" });
    }

    const gmId = req.userId;
    const gm = await GM_Model.findById(gmId);

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ error_code: 400, message: "Please provide current password..!" });
    }

    if (!newPassword) {
      return res.status(400).json({ error_code: 400, message: "Please provide new password..!" });
    }

    if (!confirmPassword) {
      return res.status(400).json({ error_code: 400, message: "Please provide confirm password..!" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error_code: 400, message: "New password and confirm password do not match..!" });
    }

    if (!gm) {
      return res.status(400).json({ error_code: 400, message: "GM admin not found..!" });
    }

    // Directly compare the current password provided in the request with the stored password
    if (gm.password !== currentPassword) {
      return res.json({ error_code: 400, message: "Incorrect current password..!" });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error_code: 500, message: 'Error inside password middleware..!' });
  }
};



const AdminSMPassword = async function (req, res, next) {
  try {
    if (req.body === undefined) {
      return res.status(400).json({ error_code: 400, message: "Empty body..!" });
    }

    const smId = req.userId;
    const sm = await SM_Model.findById(smId);

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ error_code: 400, message: "Please provide current password..!" });
    }

    if (!newPassword) {
      return res.status(400).json({ error_code: 400, message: "Please provide new password..!" });
    }

    if (!confirmPassword) {
      return res.status(400).json({ error_code: 400, message: "Please provide confirm password..!" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error_code: 400, message: "New password and confirm password do not match..!" });
    }

    if (!sm) {
      return res.status(400).json({ error_code: 400, message: "GM admin not found..!" });
    }

    // Directly compare the current password provided in the request with the stored password
    if (sm.password !== currentPassword) {
      return res.json({ error_code: 400, message: "Incorrect current password..!" });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error_code: 500, message: 'Error inside password middleware..!' });
  }
};


const AdminDSMPassword = async function (req, res, next) {
  try {
    if (req.body === undefined) {
      return res.status(400).json({ error_code: 400, message: "Empty body..!" });
    }

    const dsmId = req.userId;
    const dsm = await DSM_Model.findById(dsmId);

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ error_code: 400, message: "Please provide current password..!" });
    }

    if (!newPassword) {
      return res.status(400).json({ error_code: 400, message: "Please provide new password..!" });
    }

    if (!confirmPassword) {
      return res.status(400).json({ error_code: 400, message: "Please provide confirm password..!" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error_code: 400, message: "New password and confirm password do not match..!" });
    }

    if (!dsm) {
      return res.status(400).json({ error_code: 400, message: "DSM admin not found..!" });
    }

    // Directly compare the current password provided in the request with the stored password
    if (dsm.password !== currentPassword) {
      return res.json({ error_code: 400, message: "Incorrect current password..!" });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error_code: 500, message: 'Error inside password middleware..!' });
  }
};


const AdminSAPassword = async function (req, res, next) {
  try {
    if (req.body === undefined) {
      return res.status(400).json({ error_code: 400, message: "Empty body..!" });
    }

    const saId = req.userId;
    const sa = await SA_Model.findById(saId);

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ error_code: 400, message: "Please provide current password..!" });
    }

    if (!newPassword) {
      return res.status(400).json({ error_code: 400, message: "Please provide new password..!" });
    }

    if (!confirmPassword) {
      return res.status(400).json({ error_code: 400, message: "Please provide confirm password..!" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error_code: 400, message: "New password and confirm password do not match..!" });
    }

    if (!sa) {
      return res.status(400).json({ error_code: 400, message: "SA admin not found..!" });
    }

    // Directly compare the current password provided in the request with the stored password
    if (sa.password !== currentPassword) {
      return res.json({ error_code: 400, message: "Incorrect current password..!" });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error_code: 500, message: 'Error inside password middleware..!' });
  }
};





module.exports = {

  check_body,
  login,
  update,
  password,
  checkRequiredFields,
  AdminCEOpassword,
  AdminGMPassword,
  AdminSMPassword,
  AdminDSMPassword,
  AdminSAPassword,

};
