const baseURL = require("../constant/baseURL");
const User_Model = require("../model/UserModel");



const updateUserProfileimage = async function (req, res) {
    try {
        let userId = req.userId;
        let baseUrl = baseURL.generateBaseUrl(req);
        let user = await User_Model.findById(userId);
        // console.log("user -: ", user);

        if (!req.files || req.files.length === 0) {
            return res.json({ error_code: 400, message: "No image uploaded" });
        }

        let profileImageUrl = "/uploads/" + req.files[0].filename;

        await User_Model.findOneAndUpdate(
            { _id: userId },
            { $set: { profileImage: profileImageUrl } },
            { new: true }
        );

        return res.status(200).json({
            error_code: 200,
            message: "User profile image updated successfully",
            profileImage: profileImageUrl
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error_code: 500, message: "Internal server error" });
    }
};
// ===================================================================

const getProfileImage = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await User_Model.findById(userId);

        if (!user || !user.profileImage) {
            return res.status(404).json({
                error_code: 404,
                message: 'User profile image not found'
            });
        }

        // Construct the complete image URL with base URL
        let baseUrl = baseURL.generateBaseUrl(req);
        const profileImageUrl = baseUrl + user.profileImage;

        // Respond with the profile image URL
        res.status(200).json({
            error_code: 200,
            message: "User profile image retrieved successfully",
            profileImage: profileImageUrl
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error_code: 500,
            message: 'Internal server error'
        });
    }
};

// ===================================================================

const updateUserProfile = async (req, res) => {
    try {
        let userId = req.userId;
        console.log("UserId :- ", userId);
        const { referralById, name, mobileNumber, email, address, pincode, village, taluka, district, state } = req.body;

        // Find the user by userId
        const existingUser = await User_Model.findById(userId);

        if (!existingUser) {
            return res.status(404).json({
                error_code: 404,
                message: 'User not found'
            });
        }

        // Update the user's information
        existingUser.mobileNumber = mobileNumber;
        existingUser.name = name;
        existingUser.email = email;
        existingUser.address = address;
        existingUser.pincode = pincode;
        existingUser.village = village;
        existingUser.taluka = taluka;
        existingUser.district = district;
        existingUser.state = state;

        // Save the updated user
        const updatedUser = await existingUser.save();

        // Respond with the updated user data
        res.status(200).json({
            error_code: 200,
            message: "User updated successfully",
            data: updatedUser
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error_code: 500,
            message: 'Internal server error'
        });
    }
}



// ======================================================

const getFamilyAndNominee = async (req, res) => {
    try {
        let userId = req.userId;
        // console.log("UserId :- ", userId);
        const user = await User_Model.findById(userId);

        if (!user) {
            return res.status(404).json({
                error_code: 404,
                message: 'User not found'
            });
        }

        const familyAndNomineeDetails = user.familyAndNomineeDetails;
        // console.log('Family and Nominee :- ', familyAndNomineeDetails);

        return res.status(200).json({
            userId: userId,
            familyAndNomineeDetails
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error_code: 500,
            message: 'Internal server error'
        });
    }
};

// -------------------------------------------------------------

const getBanksDetails = async (req, res) => {
    try {
        let userId = req.userId;
        // console.log("UserId :- ", userId);
        const user = await User_Model.findById(userId);

        if (!user) {
            return res.status(404).json({
                error_code: 404,
                message: 'User not found'
            });
        }

        const bankDetails = user.bankDetails;
        // console.log('bankDetails :- ', bankDetails);

        return res.status(200).json({
            userId: userId,
            bankDetails
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error_code: 500,
            message: 'Internal server error'
        });
    }
};

// ======================================================

const getGSTDetails = async (req, res) => {
    try {
        let userId = req.userId;
        // console.log("UserId :- ", userId);
        const user = await User_Model.findById(userId);

        if (!user) {
            return res.status(404).json({
                error_code: 404,
                message: 'User not found'
            });
        }

        const getGSTDetails = user.identityDetails;
        // console.log('getGSTDetails :- ', identityDetails);

        return res.status(200).json({
            userId: userId,
            getGSTDetails: getGSTDetails
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error_code: 500,
            message: 'Internal server error'
        });
    }
};

// ======================================================

const updateBankDetails = async (req, res) => {
    try {
        let userProfileId = req.userId;
        console.log("userProfileId :- ", userProfileId);


        const profileExists = await User_Model.findById(userProfileId);

        if (!profileExists) {
            return res.status(404).json({
                error_code: 404,
                message: 'User Profile not found'
            });
        }

        const {
            accountNumber,
            reEnterAccountNumber,
            beneficiaryName,
            bankName,
            ifscCode,
            accountType,
        } = req.body;

        if (!accountNumber) {
            return res.json({
                error_code: 400, message: `Field accountNumber is missing`
            })
        }

        if (!reEnterAccountNumber) {
            return res.json({
                error_code: 400, message: `Field reEnterAccountNumber is missing`
            })
        }

        if (accountNumber !== reEnterAccountNumber) {
            return res.status(400).json({
                error_code: 400,
                message: 'Entered account numbers do not match'
            });
        }
        if (!beneficiaryName) {
            return res.json({
                error_code: 400, message: `Field beneficiaryName is missing`
            })
        }

        if (!bankName) {
            return res.json({
                error_code: 400, message: `Field bankName is missing`
            })
        }

        if (!ifscCode) {
            return res.json({
                error_code: 400, message: `Field ifscCode is missing`
            })
        }

        if (!accountType) {
            return res.json({
                error_code: 400, message: `Field accountType is missing`
            })
        }

        profileExists.bankDetails = {
            accountNumber,
            reEnterAccountNumber,
            beneficiaryName,
            bankName,
            ifscCode,
            accountType,
        };

        // Save the updated profile

        await profileExists.save();

        return res.status(200).json({
            error_code: 200,
            message: "Bank details saved successfully",
            userProfileId: profileExists._id,
            data: profileExists.bankDetails
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error_code: 500,
            message: 'Internal server error'
        });
    }
}





// ======================================================

const EditeIdentityDetails = async (req, res) => {
    try {
        let userProfileId = req.userId;
        console.log("userProfileId :- ", userProfileId);


        const profileExists = await User_Model.findById(userProfileId);

        if (!profileExists) {
            return res.status(404).json({
                error_code: 404,
                message: 'User Profile not found'
            });
        }


        const { panCardNumber, nameRegisteredAsGST, gstNumber } = req.body;

        let panCardPhoto;
        if (req.files && req.files.length > 0) {
            panCardPhoto = '/uploads/' + req.files[0].filename;
        } else {
            return res.status(400).json({
                error_code: 400,
                message: 'At least one file must be uploaded for panCardPhoto'
            });
        }

        console.log("panCardPhoto :- ", panCardPhoto);

        profileExists.identityDetails = {
            panCardNumber,
            panCardPhoto: panCardPhoto,
            nameRegisteredAsGST,
            gstNumber
        };

        await profileExists.save();

        res.status(200).json({
            error_code: 200,
            message: profileExists.isNew ? 'Identity Details Created Successfully' : 'Identity Details Updated Successfully',
            userProfileId: profileExists._id,
            identityDetails: profileExists.identityDetails,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error_code: 500,
            message: 'Internal server error'
        });
    }
};

// ======================================================

const Refferealcode = async (req, res) => {
    try {
        let userProfileId = req.userId;
        console.log("userProfileId :- ", userProfileId);

        const profileExists = await User_Model.findById(userProfileId);

        if (!profileExists) {
            return res.status(404).json({
                error_code: 404,
                message: 'User Profile not found'
            });
        }

        const myReferralId = profileExists.myReferralId;

        if (!myReferralId) {
            return res.status(404).json({
                error_code: 404,
                message: 'Referral code not found for this user'
            });
        }

        return res.status(200).json({
            error_code: 200,
            message: 'Referral code found',
            data: {
                referralCode: myReferralId,
                userProfileId: userProfileId,
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error_code: 500,
            message: 'Internal server error'
        });
    }
};



// ======================================================





module.exports = {




    updateUserProfileimage,
    updateUserProfile,
    getProfileImage,
    getFamilyAndNominee,
    updateBankDetails,
    EditeIdentityDetails,
    Refferealcode,
    getBanksDetails,
    getGSTDetails,


}