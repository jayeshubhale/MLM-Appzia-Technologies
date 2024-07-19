const express = require("express");
const mongoose = require("mongoose");
const dotenv = require('dotenv');
const morgan = require('morgan');

const colors = require('colors');
const multer = require("multer");
const path = require('path');

const bannerRoute = require('./routes/bannerRoute');
const aboutUsRoute = require('./routes/aboutUsRoute');
const adminRoute = require('./routes/adminRoute');
const CEO_Route = require('./routes/CEO_Route');
const GM_Route = require('./routes/GM_Route')
const SM_Route = require('./routes/SM_Route');
const SM_DSM_Route = require('./routes/SM_DSM_Route');
const SM_SA_Route = require('./routes/SM_SA_Route');
const PrivacyPolicy = require("./routes/privecyPolicyRoute")
const TermsAndCondition = require("./routes/termsConditionRoute")
const UserRoute = require("./routes/UserRoute");
const VoucherRoute = require("./routes/VoucherRoute");
const GenerateBill = require("./routes/GenerateBillRoute");
const Level1 = require("./routes/Level_1_Route");
const MenuBarRoute = require("./routes/MenuBarRoute");

// -------------------------------------------------------------------------------


const Admin = require("./model/AdminModel");
const bcrypt = require("bcryptjs");

dotenv.config();
const cors = require('cors');
const app = express();
app.use(cors());

// +++++++++++++++++++++++

// Define adminRegistration function before connectDb
const adminRegistration = async () => {
  try {
    const saltRounds = 8;
    const encryptedPassword = await bcrypt.hash('Jayesh@1234', saltRounds);
    let obj = {
      name: "Jayesh Ubhale",
      number: "9112603100",
      email: "jayeshubhale45@gmail.com",
      password: encryptedPassword,
      adminType: "Admin"
    };
    await Admin.create(obj);
    console.log("Admin created successfully..!".bgYellow.black.bold);
  } catch (error) {
    console.log("Error inside create admin:", error);
  }
};

// -------------------------------------------

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB is connected..!".bgMagenta.bold);

    const port = process.env.PORT || 4500;
    // 192.168.1.7
    app.listen(port, "192.168.110.90", () => {
      console.log(`Your Express app is running on PORT : ${port}`.bgCyan.bold);
    });

    const admins = await Admin.find({});
    if (admins.length === 0) {
      await adminRegistration();
    }
    else {
      console.log("An Admin is already Existed".bgBlue.bold);
    }
  } catch (err) {
    console.log('Error inside db connection:', err);
    process.exit(1);
  }
}

connectDb();

// -------------------------------------------

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = file.originalname.split(".").pop();
    cb(null, file.fieldname + "-" + uniqueSuffix + "." + extension);
  },
});

app.use(express.json());
app.use(morgan('dev'));

const upload = multer({ storage: storage });
app.use(upload.any());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((error, req, res, next) => {
  const message = `This is the Unexpected field --> ${error.field}`;
  return res.status(500).send(message);
});

// Mount routes
app.use('/', bannerRoute);
app.use('/', aboutUsRoute);
app.use('/', adminRoute);
app.use('/', CEO_Route);
app.use('/', GM_Route);
app.use('/', SM_Route);
app.use('/', SM_DSM_Route);
app.use('/', SM_SA_Route);
app.use('/', PrivacyPolicy);
app.use('/', TermsAndCondition);
app.use('/', UserRoute);
app.use('/', VoucherRoute);
app.use('/', GenerateBill);
app.use('/', Level1);
app.use('/', MenuBarRoute);





