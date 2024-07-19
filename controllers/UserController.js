const User_Model = require("../model/UserModel");
const generateRandomMyReferalCode = require("../constant/generateRandomMyReferalCode");
const generateOTP = require("../constant/GenerateOTP");
const OTP_Model = require("../model/OtpModel");
const baseURL = require("../constant/baseURL");
const jwtToken = require("../constant/jwtToken");
const { UserForgenerateAuthToken } = require("../constant/jwtToken");
const PaymentModel = require("../model/CreatePaymentModel");
const colors = require('colors');
const DSM_Model = require("../model/SM_DSM_Model");
const SA_Model = require("../model/SM_SA_Model");
const SM_Model = require("../model/SM_Model");
const GM_Model = require("../model/GM_Model");
const CEO_Model = require("../model/CEO_Model");


// ==========================================================================

// const registerUser = async (req, res) => {
//     try {
//         const { referralById, mobileNumber, name, email, address, pincode, village, taluka, district, state } = req.body;

//         // Generate a random referral code
//         const myReferralId = generateRandomMyReferalCode();
//         console.log("myReferralId :- ", myReferralId);
//         const existingUserMobile = await User_Model.findOne({ mobileNumber });
//         const existingUserEmail = await User_Model.findOne({ email });

//         const checkMobileNumberIsVerified = await OTP_Model.findOne({ mobileNumber });

//         if (!checkMobileNumberIsVerified || checkMobileNumberIsVerified.isVerified !== '1') {
//             return res.status(400).json({
//                 error_code: 400,
//                 message: 'Mobile number is not verified. Please verify your mobile number.'
//             });
//         }

//         if (existingUserMobile) {
//             return res.status(400).json({
//                 error_code: 400,
//                 message: 'Mobile number is already associated with another user'
//             });
//         }

//         if (existingUserEmail) {
//             return res.status(400).json({
//                 error_code: 400,
//                 message: 'Email is already associated with another user'
//             });
//         }

//         let savedUser;

//         // No need to check referralExists if referralById is empty
//         if (referralById !== undefined && referralById !== "") {
//             const existingReferrer = await User_Model.findOne({ myReferralId: referralById });
//             if (!existingReferrer) {
//                 return res.status(400).json({
//                     error_code: 400,
//                     message: 'Invalid referralId'
//                 });
//             }

//             const newUser = new User_Model({
//                 referralById,
//                 myReferralId,
//                 mobileNumber,
//                 name,
//                 email,
//                 address,
//                 pincode,
//                 village,
//                 taluka,
//                 district,
//                 state,
//             });

//             savedUser = await newUser.save();
//         } else {
//             const newUser = new User_Model({
//                 referralById: "",
//                 myReferralId,
//                 mobileNumber,
//                 name,
//                 email,
//                 address,
//                 pincode,
//                 village,
//                 taluka,
//                 district,
//                 state,
//             });

//             savedUser = await newUser.save();
//         }

//         // Respond with the saved user data
//         res.status(200).json({
//             error_code: 200,
//             message: "User Created Successfully",
//             id: savedUser.id,
//             data: savedUser
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             error_code: 500,
//             message: 'Internal server error'
//         });
//     }
// }

// ==========================================================================


const registerUser = async (req, res) => {
    try {
        const { referralById, mobileNumber, name, email, address, pincode, village, taluka, district, state } = req.body;

        // Generate a random referral code
        const myReferralId = generateRandomMyReferalCode();
        console.log("myReferralId :- ", myReferralId);
        const existingUserMobile = await User_Model.findOne({ mobileNumber });
        const existingUserEmail = await User_Model.findOne({ email });

        const checkMobileNumberIsVerified = await OTP_Model.findOne({ mobileNumber });

        if (!checkMobileNumberIsVerified || checkMobileNumberIsVerified.isVerified !== '1') {
            return res.status(400).json({
                error_code: 400,
                message: 'Mobile number is not verified. Please verify your mobile number.'
            });
        }

        if (existingUserMobile) {
            return res.status(400).json({
                error_code: 400,
                message: 'Mobile number is already associated with another user'
            });
        }

        if (existingUserEmail) {
            return res.status(400).json({
                error_code: 400,
                message: 'Email is already associated with another user'
            });
        }



        let savedUser;

        if (referralById !== undefined && referralById !== "") {
            const existingReferrer = await User_Model.findOne({ myReferralId: referralById });
            if (!existingReferrer) {
                return res.status(400).json({
                    error_code: 400,
                    message: 'Invalid referralId'
                });
            }

            const newUser = new User_Model({
                referralById,
                myReferralId,
                mobileNumber,
                name,
                email,
                address,
                pincode,
                village,
                taluka,
                district,
                state,
            });

            //__________________________

            // Check if the district exists in DSM_Model
            const existingDSM = await DSM_Model.findOne({ city: req.body.district });
            console.log("existingDSM : ", existingDSM);

            if (existingDSM) {
                // Add the new user's ID to the UserListId
                existingDSM.UserListId.push(newUser._id);
                await existingDSM.save();
            } else {
                return res.status(400).json({
                    error_code: 400,
                    message: 'This district is not allocated a DSM, so you cannot register.'
                });
            }

            //__________________________

            savedUser = await newUser.save();
            console.log("savedUserName :- ", savedUser.name);

            // --------------------------------------------------

            const payments = await PaymentModel.find();
            console.log("payments :- ", payments);
            let amountTotal = 0;
            payments.forEach(payment => {
                amountTotal += Number(payment.registrationFee) || 0;
            });
            console.log("amountTotal :- ", amountTotal);

            // --------------------------------------------------
            async function sendNotification(userId, titleMessage, message) {
                const user = await User_Model.findById(userId);
                if (user) {
                    const notification = {
                        titleMessage: titleMessage,
                        messege: message,
                        read: 0
                    };
                    user.notificationInfo.push(notification);
                    await user.save();
                    console.log(`Notification sent to user ${userId}: ${message}`);
                } else {
                    console.error(`User with ID ${userId} not found`);
                }
            }
            // --------------------------------------------------
            const referralByIdParent = savedUser.referralById;
            console.log("referralByIdParent :- ", referralByIdParent);

            const findParentModel = await User_Model.findOne({ myReferralId: referralByIdParent });
            // console.log("findParentModel :- ", findParentModel);
            console.log("findParentModel Name :- ", findParentModel.name);


            if (!findParentModel) {
                return res.json({
                    error_code: 404,
                    message: 'Parent User not found'
                });
            }

            const currentLevel = findParentModel.currentLevel;
            console.log("currentLevel", currentLevel);

            switch (currentLevel) {


                case "1":
                    console.log("---------------case 1---------------");

                    try {

                        const L1twentyPercent = Number(amountTotal * 0.2);
                        const L2fivePercent = Number(amountTotal * 0.05);

                        // Update wallet amount for currentParent 
                        const currentParent = await User_Model.findById(findParentModel._id);
                        if (currentParent) {
                            currentParent.pendingAmount = Number(currentParent.pendingAmount || 0) + L1twentyPercent;
                            await currentParent.save();

                            // Save income history for currentParent
                            const incomeTransaction1 = {
                                amount: L1twentyPercent,
                                userId: savedUser._id,
                                name: savedUser.name,
                                date: new Date(),
                                message: "Income from Level L1 Commission",
                                status: "Pending"
                            };
                            currentParent.paymentPendingHistory.push(incomeTransaction1);
                            await currentParent.save();

                            const accountCreationMessage = `Congratulations, ${savedUser.name}! Your account has been created successfully.`;
                            await sendNotification(savedUser._id, "Congratulations! Account Created Successfully", accountCreationMessage);

                            const referralCreationMessage = `${savedUser.name} has been created successfully through your referral.`;
                            await sendNotification(currentParent._id, "Referral Created Successfully!", referralCreationMessage);

                            // Send notification to currentParent for Level L1 commission
                            const notificationMessage1 = `You have a pending commission of ${L1twentyPercent} from ${savedUser.name}.`;
                            await sendNotification(currentParent._id, "Level L1 Commission", notificationMessage1);
                        }

                        // Find and update wallet amount for currentParentofParentModel
                        const currentParentofParentModel = await User_Model.findOne({ myReferralId: currentParent.referralById });
                        if (currentParentofParentModel) {
                            currentParentofParentModel.pendingAmount += L2fivePercent;
                            await currentParentofParentModel.save();

                            // Save income history for currentParentofParentModel
                            const incomeTransaction2 = {
                                amount: L2fivePercent,
                                userId: savedUser._id,
                                name: savedUser.name,
                                date: new Date(),
                                status: "Pending",
                                message: "Income from Level L2 Commission",
                            };
                            currentParentofParentModel.paymentPendingHistory.push(incomeTransaction2);
                            await currentParentofParentModel.save();

                            const l2CreationMessage = `${savedUser.name} has been created successfully through your L2.`;
                            await sendNotification(currentParentofParentModel._id, "L2-Referral Created Successfully!", l2CreationMessage);

                            // Send notification to currentParentofParentModel for Level L2 commission
                            const notificationMessage2 = `You have a pending commission of ${L2fivePercent} from ${savedUser.name}.`;
                            await sendNotification(currentParentofParentModel._id, "Level L2 Commission", notificationMessage2);
                        }
                    } catch (error) {
                        console.error(error);
                    }
                    break;


                //--------------------------------------------------------------------------------------------- 

                case "2":
                    console.log("---------------case 2---------------");

                    try {

                        const case2L1twentyPercent = Number(amountTotal * 0.2);
                        const onePointTwoPercent = Number(amountTotal * 0.05);

                        // Update wallet amount for currentParentLevel2 
                        const currentParentLevel2 = await User_Model.findById(findParentModel._id);
                        currentParentLevel2.pendingAmount = Number(currentParentLevel2.pendingAmount || 0) + case2L1twentyPercent;
                        await currentParentLevel2.save();

                        // Save income history for currentParentLevel2
                        const incomeTransactionLevel2 = {
                            amount: case2L1twentyPercent,
                            userId: savedUser._id,
                            name: savedUser.name,
                            date: new Date(),
                            status: "Pending",
                            message: `Income from Level L1 Commission`,
                        };
                        currentParentLevel2.paymentPendingHistory.push(incomeTransactionLevel2);
                        await currentParentLevel2.save();

                        const accountCreationMessage = `Congratulations, ${savedUser.name}! Your account has been created successfully.`;
                        await sendNotification(savedUser._id, "Congratulations! Account Created Successfully", accountCreationMessage);

                        const referralCreationMessage = `${savedUser.name} has been created successfully through your referral.`;
                        await sendNotification(currentParentLevel2._id, "Referral Created Successfully!", referralCreationMessage);

                        // Send notification to currentParentLevel2 for Level L1 commission
                        const notificationMessageLevel1 = `You have a pending commission of ${case2L1twentyPercent} from ${savedUser.name}.`;
                        await sendNotification(currentParentLevel2._id, "Level L1 Commission", notificationMessageLevel1);

                        // Find and update wallet amount for parent models (grandparents)
                        let referralId = currentParentLevel2.referralById;
                        const modelIds = [];
                        while (referralId) {
                            const grandParentModel = await User_Model.findOne({ myReferralId: referralId });
                            if (grandParentModel) {
                                modelIds.push(grandParentModel._id);
                                if (grandParentModel.referralById) {
                                    referralId = grandParentModel.referralById;
                                } else {
                                    referralId = null;
                                }
                            } else {
                                referralId = null;
                            }
                        }

                        // Calculate average commission amount for each grandparent
                        const countofmodelIds = modelIds.length;
                        const AverageAmount = onePointTwoPercent / countofmodelIds;

                        // Update wallet amount and income history for each grandparent
                        for (const modelId of modelIds) {
                            const model = await User_Model.findById(modelId);
                            model.pendingAmount += AverageAmount;
                            await model.save();

                            // Save income history for each grandparent
                            const incomeTransaction = {
                                amount: AverageAmount,
                                userId: savedUser._id,
                                name: savedUser.name,
                                date: new Date(),
                                status: "Pending",
                                message: `Income from DownLine Level Commission`,
                            };
                            model.paymentPendingHistory.push(incomeTransaction);
                            await model.save();

                            const downLineCreationMessage2 = `${savedUser.name} has been created successfully through your DownLine.`;
                            await sendNotification(model._id, "DownLine-Referral Created Successfully!", downLineCreationMessage2);

                            // Send notification to grandparent for Level L2 commission
                            const notificationMessageLevel2 = `You have a pending commission of ${AverageAmount} from ${savedUser.name}.`;
                            await sendNotification(model._id, "Level DownLine Commission", notificationMessageLevel2);
                        }
                    } catch (error) {
                        console.error("Error:", error);
                    }
                    break;

                // ----------------------------------------------------------------------------------------------

                case "3":
                    console.log("---------------case 3---------------");

                    try {
                        const case3L1twentyPercent = Number(amountTotal * 0.2);
                        const onePointFivePercent = Number(amountTotal * 0.035);

                        // Update wallet amount for currentParent 
                        const currentParentLevel3 = await User_Model.findById(findParentModel._id);
                        currentParentLevel3.pendingAmount = Number(currentParentLevel3.pendingAmount || 0) + case3L1twentyPercent;
                        await currentParentLevel3.save();

                        // Save income history for currentParent
                        const incomeTransactionLevel3 = {
                            amount: case3L1twentyPercent,
                            userId: savedUser._id,
                            name: savedUser.name,
                            date: new Date(),
                            status: "Pending",
                            message: `Income from Level L1 Commission`,
                        };
                        currentParentLevel3.paymentPendingHistory.push(incomeTransactionLevel3);
                        await currentParentLevel3.save();

                        const accountCreationMessage = `Congratulations, ${savedUser.name}! Your account has been created successfully.`;
                        await sendNotification(savedUser._id, "Congratulations! Account Created Successfully", accountCreationMessage);

                        const referralCreationMessage = `${savedUser.name} has been created successfully through your referral.`;
                        await sendNotification(currentParentLevel3._id, "Referral Created Successfully!", referralCreationMessage);

                        // Send notification to currentParentLevel2 for Level L1 commission
                        const notificationMessageLevel1 = `You have a pending commission of ${case3L1twentyPercent} from ${savedUser.name}.`;
                        await sendNotification(currentParentLevel3._id, "Level L1 Commission", notificationMessageLevel1);

                        let referralId = currentParentLevel3.referralById;
                        const modelIds = [];
                        while (referralId) {
                            const grandParentModel = await User_Model.findOne({ myReferralId: referralId });
                            if (grandParentModel) {
                                modelIds.push(grandParentModel._id);
                                if (grandParentModel.referralById) {
                                    referralId = grandParentModel.referralById;
                                } else {
                                    referralId = null;
                                }
                            } else {
                                referralId = null;
                            }
                        }

                        const countofmodelIds = modelIds.length;
                        const AverageAmount = onePointFivePercent / countofmodelIds;

                        // Update wallet amount and income history for each model
                        for (const modelId of modelIds) {
                            const model = await User_Model.findById(modelId);
                            model.pendingAmount += AverageAmount;
                            await model.save();

                            // Save income history for each model
                            const incomeTransaction = {
                                amount: AverageAmount,
                                userId: savedUser._id,
                                name: savedUser.name,
                                date: new Date(),
                                status: "Pending",
                                message: `Income from DownLine Level Commission`,
                            };
                            model.paymentPendingHistory.push(incomeTransaction);
                            await model.save();

                            const downLineCreationMessage3 = `${savedUser.name} has been created successfully through your DownLine.`;
                            await sendNotification(model._id, "DownLine-Referral Created Successfully!", downLineCreationMessage3);

                            // Send notification to grandparent for Level L2 commission
                            const notificationMessageLevel3 = `You have a pending commission of ${AverageAmount} from ${savedUser.name}.`;
                            await sendNotification(model._id, "Level DownLine Commission", notificationMessageLevel3);

                        }

                    } catch (error) {
                        console.error("Error:", error);
                    }
                    break;

                // --------------------------------------------------------------------

                case "4":
                    console.log("---------------case 4---------------");

                    try {
                        const case4L1twentyPercent = Number(amountTotal * 0.2);
                        const case4L2AmountDownline = Number(amountTotal * 0.03);

                        // Update wallet amount for currentParent 
                        const currentParentLevel4 = await User_Model.findById(findParentModel._id);
                        currentParentLevel4.pendingAmount = Number(currentParentLevel4.pendingAmount || 0) + case4L1twentyPercent;
                        await currentParentLevel4.save();

                        const incomeTransactionLevel4 = {
                            amount: case4L1twentyPercent,
                            userId: savedUser._id,
                            name: savedUser.name,
                            date: new Date(),
                            status: "Pending",
                            message: `Income from Level L1 Commission`
                        };
                        currentParentLevel4.paymentPendingHistory.push(incomeTransactionLevel4);
                        await currentParentLevel4.save();

                        const accountCreationMessage4 = `Congratulations, ${savedUser.name}! Your account has been created successfully.`;
                        await sendNotification(savedUser._id, "Congratulations! Account Created Successfully", accountCreationMessage4);

                        const referralCreationMessage4 = `${savedUser.name} has been created successfully through your referral.`;
                        await sendNotification(currentParentLevel4._id, "Referral Created Successfully!", referralCreationMessage4);

                        // Send notification to currentParentLevel2 for Level L1 commission
                        const notificationMessageLevel4 = `You have a pending commission of ${case4L1twentyPercent} from ${savedUser.name}.`;
                        await sendNotification(currentParentLevel4._id, "Level L1 Commission", notificationMessageLevel4);

                        let referralId = currentParentLevel4.referralById;
                        const modelIds = [];
                        while (referralId) {
                            const grandParentModel = await User_Model.findOne({ myReferralId: referralId });
                            if (grandParentModel) {
                                modelIds.push(grandParentModel._id);
                                if (grandParentModel.referralById) {
                                    referralId = grandParentModel.referralById;
                                } else {
                                    referralId = null;
                                }
                            } else {
                                referralId = null;
                            }
                        }

                        const countofmodelIds = modelIds.length;
                        const AverageAmount = case4L2AmountDownline / countofmodelIds;

                        // Update wallet amount and income history for each model
                        for (const modelId of modelIds) {
                            const model = await User_Model.findById(modelId);
                            model.pendingAmount += AverageAmount;
                            await model.save();

                            // Save income history for each model
                            const incomeTransaction = {
                                amount: AverageAmount,
                                userId: savedUser._id,
                                name: savedUser.name,
                                date: new Date(),
                                status: "Pending",
                                message: `Income from DownLine Level Commission`
                            };
                            model.paymentPendingHistory.push(incomeTransaction);
                            await model.save();

                            const downLineCreationMessage4 = `${savedUser.name} has been created successfully through your DownLine.`;
                            await sendNotification(model._id, "DownLine-Referral Created Successfully!", downLineCreationMessage4);

                            // Send notification to grandparent for Level L2 commission
                            const notificationMessageLevel4 = `You have a pending commission of ${AverageAmount} from ${savedUser.name}.`;
                            await sendNotification(model._id, "Level DownLine Commission", notificationMessageLevel4);


                        }

                    } catch (error) {
                        console.error("Error:", error);
                    }

                    break;

                // ---------------------------------------------------------------------------------------------------------

                case "5":
                    console.log("---------------case 5---------------");

                    try {
                        const case5L1twentyPercent = Number(amountTotal * 0.2);
                        const case5L2AmountDownline = Number(amountTotal * 0.025);

                        // Update wallet amount for currentParent 
                        const currentParentLevel5 = await User_Model.findById(findParentModel._id);
                        currentParentLevel5.pendingAmount = Number(currentParentLevel5.pendingAmount || 0) + case5L1twentyPercent;
                        await currentParentLevel5.save();

                        // Save income history for currentParent
                        const incomeTransactionLevel5 = {
                            amount: case5L1twentyPercent,
                            userId: savedUser._id,
                            name: savedUser.name,
                            date: new Date(),
                            status: "Pending",
                            message: `Income from Level L1 Commission`
                        };
                        currentParentLevel5.paymentPendingHistory.push(incomeTransactionLevel5);
                        await currentParentLevel5.save();

                        const accountCreationMessage5 = `Congratulations, ${savedUser.name}! Your account has been created successfully.`;
                        await sendNotification(savedUser._id, "Congratulations! Account Created Successfully", accountCreationMessage5);

                        const referralCreationMessage5 = `${savedUser.name} has been created successfully through your referral.`;
                        await sendNotification(currentParentLevel5._id, "Referral Created Successfully!", referralCreationMessage5);

                        // Send notification to currentParentLevel2 for Level L1 commission
                        const notificationMessageLevel5 = `You have a pending commission of ${case5L1twentyPercent} from ${savedUser.name}.`;
                        await sendNotification(currentParentLevel5._id, "Level L1 Commission", notificationMessageLevel5);

                        let referralId = currentParentLevel5.referralById;
                        const modelIds = [];
                        while (referralId) {
                            const grandParentModel = await User_Model.findOne({ myReferralId: referralId });
                            if (grandParentModel) {
                                modelIds.push(grandParentModel._id);
                                if (grandParentModel.referralById) {
                                    referralId = grandParentModel.referralById;
                                } else {
                                    referralId = null;
                                }
                            } else {
                                referralId = null;
                            }
                        }

                        const countofmodelIds = modelIds.length;
                        const AverageAmount = case5L2AmountDownline / countofmodelIds;

                        // Update wallet amount and income history for each model
                        for (const modelId of modelIds) {
                            const model = await User_Model.findById(modelId);
                            model.pendingAmount += AverageAmount;
                            await model.save();

                            // Save income history for each model
                            const incomeTransaction = {
                                amount: AverageAmount,
                                userId: savedUser._id,
                                name: savedUser.name,
                                date: new Date(),
                                status: "Pending",
                                message: `Income from DownLine Level Commission`
                            };
                            model.paymentPendingHistory.push(incomeTransaction);
                            await model.save();

                            const downLineCreationMessage5 = `${savedUser.name} has been created successfully through your DownLine.`;
                            await sendNotification(model._id, "DownLine-Referral Created Successfully!", downLineCreationMessage5);

                            // Send notification to grandparent for Level L2 commission
                            const notificationMessageLevel5 = `You have a pending commission of ${AverageAmount} from ${savedUser.name}.`;
                            await sendNotification(model._id, "Level DownLine Commission", notificationMessageLevel5);

                        }

                    } catch (error) {
                        console.error("Error:", error);
                    }

                    break;

                // ---------------------------------------------------------------------------------------------------------

                case "6":
                    console.log("---------------case 6---------------");

                    try {
                        const case6L1twentyPercent = Number(amountTotal * 0.2);
                        const case6L2AmountDownline = Number(amountTotal * 0.02);

                        // Update wallet amount for currentParent 
                        const currentParentLevel6 = await User_Model.findById(findParentModel._id);
                        currentParentLevel6.pendingAmount = Number(currentParentLevel6.pendingAmount || 0) + case6L1twentyPercent;
                        await currentParentLevel6.save();

                        const incomeTransactionLevel6 = {
                            amount: case6L1twentyPercent,
                            userId: savedUser._id,
                            name: savedUser.name,
                            date: new Date(),
                            status: "Pending",
                            message: `Income from Level L1 Commission`
                        };
                        currentParentLevel6.paymentPendingHistory.push(incomeTransactionLevel6);
                        await currentParentLevel6.save();

                        const accountCreationMessage6 = `Congratulations, ${savedUser.name}! Your account has been created successfully.`;
                        await sendNotification(savedUser._id, "Congratulations! Account Created Successfully", accountCreationMessage6);

                        const referralCreationMessage6 = `${savedUser.name} has been created successfully through your referral.`;
                        await sendNotification(currentParentLevel6._id, "Referral Created Successfully!", referralCreationMessage6);

                        // Send notification to currentParentLevel2 for Level L1 commission
                        const notificationMessageLevel6 = `You have a pending commission of ${case6L1twentyPercent} from ${savedUser.name}.`;
                        await sendNotification(currentParentLevel6._id, "Level L1 Commission", notificationMessageLevel6);

                        let referralId = currentParentLevel6.referralById;
                        const modelIds = [];
                        while (referralId) {
                            const grandParentModel = await User_Model.findOne({ myReferralId: referralId });
                            if (grandParentModel) {
                                modelIds.push(grandParentModel._id);
                                if (grandParentModel.referralById) {
                                    referralId = grandParentModel.referralById;
                                } else {
                                    referralId = null;
                                }
                            } else {
                                referralId = null;
                            }
                        }

                        const countofmodelIds = modelIds.length;
                        const AverageAmount = case6L2AmountDownline / countofmodelIds;

                        // Update wallet amount and income history for each model
                        for (const modelId of modelIds) {
                            const model = await User_Model.findById(modelId);
                            model.pendingAmount += AverageAmount;
                            await model.save();

                            // Save income history for each model
                            const incomeTransaction = {
                                amount: AverageAmount,
                                userId: savedUser._id,
                                name: savedUser.name,
                                date: new Date(),
                                status: "Pending",
                                message: `Income from DownLine Level Commission`
                            };
                            model.paymentPendingHistory.push(incomeTransaction);
                            await model.save();

                            const downLineCreationMessage6 = `${savedUser.name} has been created successfully through your DownLine.`;
                            await sendNotification(model._id, "DownLine-Referral Created Successfully!", downLineCreationMessage6);

                            // Send notification to grandparent for Level L2 commission
                            const notificationMessageLevel6 = `You have a pending commission of ${AverageAmount} from ${savedUser.name}.`;
                            await sendNotification(model._id, "Level DownLine Commission", notificationMessageLevel6);
                        }
                    } catch (error) {
                        console.error("Error:", error);
                    }
                    break;
                // ---------------------------------------------------------------------------------------------------------


                case "Crown":
                    console.log("---------------case Crown---------------");

                    try {
                        const caseCrownL1twentyPercent = Number(amountTotal * 0.2);
                        const caseCrownL2AmountDownline = Number(amountTotal * 0.03);

                        // Update wallet amount for currentParent 
                        const currentParentLevelCrown = await User_Model.findById(findParentModel._id);
                        currentParentLevelCrown.pendingAmount = Number(currentParentLevelCrown.pendingAmount || 0) + caseCrownL1twentyPercent;
                        await currentParentLevelCrown.save();

                        const incomeTransactionLevelCrown = {
                            amount: caseCrownL1twentyPercent,
                            userId: savedUser._id,
                            name: savedUser.name,
                            date: new Date(),
                            status: "Pending",
                            message: `Income from Level L1 Commission`
                        };
                        currentParentLevelCrown.paymentPendingHistory.push(incomeTransactionLevelCrown);
                        await currentParentLevelCrown.save();

                        const accountCreationMessageCrown = `Congratulations, ${savedUser.name}! Your account has been created successfully.`;
                        await sendNotification(savedUser._id, "Congratulations! Account Created Successfully", accountCreationMessageCrown);

                        const referralCreationMessageCrown = `${savedUser.name} has been created successfully through your referral.`;
                        await sendNotification(currentParentLevelCrown._id, "Referral Created Successfully!", referralCreationMessageCrown);

                        // Send notification to currentParentLevel2 for Level L1 commission
                        const notificationMessageLevelCrown = `You have a pending commission of ${caseCrownL1twentyPercent} from ${savedUser.name}.`;
                        await sendNotification(currentParentLevelCrown._id, "Level L1 Commission", notificationMessageLevelCrown);

                        let referralId = currentParentLevelCrown.referralById;
                        const modelIds = [];
                        while (referralId) {
                            const grandParentModel = await User_Model.findOne({ myReferralId: referralId });
                            if (grandParentModel) {
                                modelIds.push(grandParentModel._id);
                                if (grandParentModel.referralById) {
                                    referralId = grandParentModel.referralById;
                                } else {
                                    referralId = null;
                                }
                            } else {
                                referralId = null;
                            }
                        }

                        const countofmodelIds = modelIds.length;
                        const AverageAmount = caseCrownL2AmountDownline / countofmodelIds;

                        // Update wallet amount and income history for each model
                        for (const modelId of modelIds) {
                            const model = await User_Model.findById(modelId);
                            model.pendingAmount += AverageAmount;
                            await model.save();

                            const incomeTransaction = {
                                amount: AverageAmount,
                                userId: savedUser._id,
                                name: savedUser.name,
                                date: new Date(),
                                status: "Pending",
                                message: `Income from DownLine Level Commission`
                            };
                            model.paymentPendingHistory.push(incomeTransaction);
                            await model.save();

                            const downLineCreationMessageCrown = `${savedUser.name} has been created successfully through your DownLine.`;
                            await sendNotification(model._id, "DownLine-Referral Created Successfully!", downLineCreationMessageCrown);

                            // Send notification to grandparent for Level L2 commission
                            const notificationMessageLevelCrown = `You have a pending commission of ${AverageAmount} from ${savedUser.name}.`;
                            await sendNotification(model._id, "Level DownLine Commission", notificationMessageLevelCrown);
                        }
                    } catch (error) {
                        console.error("Error:", error);
                    }
                    break;

                default:
                    break;
            }
            console.log("-- if log 1 --");

            res.status(200).json({
                error_code: 200,
                message: "User Created Successfully",
                id: savedUser._id,
                data: savedUser
            });
            console.log("-- if log 2 --");


            // --------------------------------------------------

        } else {

            console.log("1111111111111111111");
            // --------------------------------------------------
            async function sendNotification(userId, titleMessage, message) {
                const user = await User_Model.findById(userId);
                if (user) {
                    const notification = {
                        titleMessage: titleMessage,
                        messege: message,
                        read: 0
                    };
                    user.notificationInfo.push(notification);
                    await user.save();
                    console.log(`Notification sent to user ${userId}: ${message}`);
                } else {
                    console.error(`User with ID ${userId} not found`);
                }
            }
            // --------------------------------------------------

            // Check if the district exists in DSM_Model
            const existingDSM = await DSM_Model.findOne({ city: req.body.district });
            console.log("existingDSM : ", existingDSM);

            if (!existingDSM) {
                return res.status(400).json({
                    error_code: 400,
                    message: 'This district is not allocated a DSM, so you cannot register.'
                });
            }

            const newUser = new User_Model({
                referralById: referralById || "",
                myReferralId,
                mobileNumber,
                name,
                email,
                address,
                pincode,
                village,
                taluka,
                district,
                state,
            });

            //__________________________

            // Save the new user first to generate the _id
            const savedUser = await newUser.save();

            //__________________________

            if (existingDSM) {
                existingDSM.UserListId.push(savedUser._id);
                console.log("========================", savedUser._id);
                await existingDSM.save();
            }
            //__________________________

            const newAccountCreationMessage = `Congratulations, ${savedUser.name}! Your account has been created successfully.`;
            await sendNotification(savedUser._id, "Congratulations! Account Created Successfully", newAccountCreationMessage);
            console.log("--------------");


            // Respond with the saved user data
            console.log("-- else log 1 --");

            res.status(200).json({
                error_code: 200,
                message: "User Created Successfully",
                id: savedUser._id,
                data: savedUser
            });
            console.log("-- else log 2 --");

        }

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error_code: 500,
            message: 'Internal server error'
        });
    }
}



// -----------------------------------------------



const otpSentUserMobile = async (req, res) => {
    try {
        const { mobileNumber } = req.body;

        const numberIsExist = await OTP_Model.findOne({ mobileNumber: mobileNumber });

        if (numberIsExist) {
            const user = await OTP_Model.findOne({ mobileNumber: mobileNumber });

            if (user && user.isVerified === '1') {
                return res.status(400).json({
                    error_code: 400,
                    message: 'Mobile number is already verified.',
                    isVerified: 1,
                });
            }
        }

        // Generate OTP
        const otp = generateOTP();
        console.log("OTP -: ", otp);

        // Create a new OTP document
        const newOTP = new OTP_Model({
            mobileNumber: mobileNumber,
            otp: otp,
        });

        // Save the new OTP document to the database
        await newOTP.save();

        // Send success response with OTP
        res.status(200).json({
            error_code: 200,
            message: 'OTP Sent Successfully',
            OTP: otp,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error_code: 500,
            message: 'Internal server error'
        });
    }
}




// -----------------------------------------------

const ReSendOTP = async (req, res) => {
    try {
        const { mobileNumber } = req.body;

        // Check if the mobile number already exists in the database
        const existingOTP = await OTP_Model.findOne({ mobileNumber: mobileNumber });

        if (!existingOTP) {
            return res.status(400).json({
                error_code: 400,
                message: 'This Number is Not Registered. Please Register First.',
            });
        }

        // Generate a new OTP
        const otp = generateOTP();
        console.log("New OTP: ", otp);

        // Update the existing OTP document with the new OTP
        existingOTP.otp = otp;
        await existingOTP.save();

        // Send success response with new OTP
        res.status(200).json({
            error_code: 200,
            message: 'OTP Resent Successfully',
            OTP: otp,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error_code: 500,
            message: 'Internal server error'
        });
    }
}

// -----------------------------------------------


const verifyOTP = async (req, res) => {
    try {
        const mobileNumber = req.body.mobileNumber;
        const enteredOTP = req.body.enteredOTP;

        // Find the user by mobile number
        const existingUser = await OTP_Model.findOne({ mobileNumber });

        if (!existingUser) {
            return res.status(400).json({
                error_code: 400,
                message: 'Please check your mobile number.'
            });
        }

        console.log("Entered OTP: ", enteredOTP);
        console.log("Stored OTP: ", existingUser.otp);

        console.log("Entered type: ", typeof enteredOTP);
        console.log("Stored type: ", typeof existingUser.otp);

        // Ensure that the stored OTP exists and is not null
        if (!existingUser.otp) {
            return res.status(400).json({
                error_code: 400,
                message: 'OTP is missing. Please contact support.'
            });
        }

        // Convert existingUser.otp to number if it's a string
        const storedOTP = existingUser.otp;

        if (storedOTP !== enteredOTP) {
            return res.status(400).json({
                error_code: 400,
                message: 'Invalid OTP. Please enter the correct OTP.'
            });
        }

        // Set isVerified to true
        existingUser.isVerified = 1;

        // Save the changes to the user document
        await existingUser.save();

        res.status(200).json({
            error_code: 200,
            message: 'OTP verified successfully',
            verified: existingUser.isVerified,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error_code: 500,
            message: 'Internal server error'
        });
    }
}



// -----------------------------------------------



const identityDetails = async (req, res) => {
    try {
        const userProfileId = req.body.userProfileId;

        if (!userProfileId) {
            return res.json({
                error_code: 400,
                message: 'userProfileId ID is required'
            });
        }

        const profileExists = await User_Model.findById(userProfileId);
        console.log("profileExists :- ", profileExists);

        if (!profileExists) {
            return res.json({
                error_code: 404,
                message: 'User Profile not found'
            });
        }

        const { panCardNumber, nameRegisteredAsGST, gstNumber } = req.body;

        let panCardPhoto;
        if (req.files && req.files.length > 0) {
            panCardPhoto = '/uploads/' + req.files[0].filename;
        } else {
            return res.json({ error_code: 400, message: 'At least one file must be uploaded for panCardPhoto' });
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
            message: 'Identity Details Saved Successfully',
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
}



// -----------------------------------------------


const familyDetails = async (req, res) => {
    try {
        const userProfileId = req.body.userProfileId;

        if (!userProfileId) {
            return res.json({
                error_code: 400,
                message: 'userProfileId ID is required'
            });
        }

        const profileExists = await User_Model.findById(userProfileId);

        if (!profileExists) {
            return res.json({
                error_code: 404,
                message: 'User Profile not found'
            });
        }

        const familyMembersCount = req.body.familyMembersCount;
        const familyDetails = req.body.familyDetails;

        if (!familyMembersCount) {
            return res.json({
                error_code: 400,
                message: "Add Family Members Count"
            });

        }

        if (!Array.isArray(familyDetails) || familyDetails.length === 0) {
            return res.json({
                error_code: 400,
                message: "At least one member should be added in the family."
            });
        }
        // Mapping familyDetails to a new format
        const addFamilyDetails = familyDetails.map(item => ({
            name: item.name,
            age: item.age,
            relation: item.relation,
        }));
        console.log("addFamilyDetails :- ", addFamilyDetails);

        profileExists.familyAndNomineeDetails = {
            numberOfFamilyMembers: familyMembersCount,
            familyMembers: addFamilyDetails
        };

        await profileExists.save();

        return res.json({
            error_code: 200,
            message: "Family details processed and saved successfully",
            userProfileId: userProfileId,
            data: {
                familyMembersCount: familyMembersCount,
                FamilyDetails: addFamilyDetails
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error_code: 500,
            message: 'Internal server error'
        });
    }
}



// -----------------------------------------------


const NomineeDetails = async (req, res) => {
    try {
        const userProfileId = req.body.userProfileId;

        if (!userProfileId) {
            return res.status(400).json({
                error_code: 400,
                message: 'userProfileId ID is required'
            });
        }

        const profileExists = await User_Model.findById(userProfileId);

        if (!profileExists) {
            return res.status(404).json({
                error_code: 404,
                message: 'User Profile not found'
            });
        }

        const {
            Name,
            MobileNumber,
            PanNumber,
            Age,
            relation,
        } = req.body;

        if (!Name) {
            return res.json({
                error_code: 400, message: `Field Name is missing`
            })
        }

        if (!MobileNumber) {
            return res.json({
                error_code: 400, message: `Field MobileNumber is missing`
            })
        }


        if (!PanNumber) {
            return res.json({
                error_code: 400, message: `Field PanNumber is missing`
            })
        }


        if (!Age) {
            return res.json({
                error_code: 400, message: `Field Age is missing`
            })
        }

        if (!relation) {
            return res.json({
                error_code: 400, message: `Field relation is missing`
            })
        }


        profileExists.familyAndNomineeDetails.addNominee = {
            Name,
            MobileNumber,
            PanNumber,
            Age,
            relation,
        };

        // Save the updated profile

        await profileExists.save();

        return res.status(200).json({
            error_code: 200,
            message: "Nominee details saved successfully",
            userProfileId: profileExists._id,
            data: profileExists.familyAndNomineeDetails.addNominee
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error_code: 500,
            message: 'Internal server error'
        });
    }
}



// -----------------------------------------------


const GetFamilyAndNominee = async (req, res) => {
    try {
        const userProfileId = req.params.id;

        if (!userProfileId) {
            return res.status(400).json({
                error_code: 400,
                message: 'User Profile ID is required'
            });
        }

        const profileDetails = await User_Model.findById(userProfileId);

        if (!profileDetails) {
            return res.status(404).json({
                error_code: 404,
                message: 'User Profile not found'
            });
        }

        const familyAndNomineeDetails = profileDetails.familyAndNomineeDetails;

        if (!familyAndNomineeDetails) {
            return res.status(404).json({
                error_code: 404,
                message: 'Family and Nominee details not found for this user'
            });
        }

        return res.status(200).json({
            error_code: 200,
            message: "Family and Nominee details retrieved successfully",
            userProfileId: profileDetails._id,
            data: familyAndNomineeDetails
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error_code: 500,
            message: 'Internal server error'
        });
    }
}



// -----------------------------------------------


const BankDetails = async (req, res) => {
    try {
        const userProfileId = req.body.userProfileId;

        if (!userProfileId) {
            return res.status(400).json({
                error_code: 400,
                message: 'userProfileId ID is required'
            });
        }

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

// ----------------------------------------------

// const paymentDetails = async (req, res) => {
//     try {
//         const { userProfileId, registrationFee, GST, total } = req.body;

//         if (!userProfileId) {
//             return res.status(400).json({
//                 error_code: 400,
//                 message: 'userProfileId is required'
//             });
//         }

//         const profileExists = await User_Model.findById(userProfileId);

//         if (!profileExists) {
//             return res.status(404).json({
//                 error_code: 404,
//                 message: 'User Profile not found'
//             });
//         }

//         // Validation for each field
//         if (!registrationFee) {
//             return res.status(400).json({
//                 error_code: 400,
//                 message: 'Registration Fee missing..!'
//             });
//         } if (!GST) {
//             return res.status(400).json({
//                 error_code: 400,
//                 message: 'GST missing..!'
//             });
//         } if (!total) {
//             return res.status(400).json({
//                 error_code: 400,
//                 message: 'Total Amount missing..!'
//             });
//         }

//         // Update user's payment details
//         profileExists.paymentDetails = {
//             registrationFee,
//             GST,
//             total,
//         };

//         await profileExists.save();

//         return res.status(200).json({
//             error_code: 200,
//             message: "Payment details processed successfully",
//             userProfileId: profileExists._id,
//             data: profileExists.paymentDetails
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             error_code: 500,
//             message: 'Internal server error'
//         });
//     }
// }


// ===============================================
// -----------------------------------------------
// Login Api Section


const userLogin = async function (req, res) {
    try {
        const mobileNumber = req.body.mobileNumber;

        let user = await User_Model.findOne({ mobileNumber });
        if (!user) {
            return res.status(404).json({
                error_code: 404,
                message: 'User does not exist for this mobile number'
            });
        }

        const otp = generateOTP();
        console.log("OTP -: ", otp);

        // Update or create OTP document
        await OTP_Model.findOneAndUpdate({ mobileNumber }, { otp }, { upsert: true });

        const token = UserForgenerateAuthToken(user._id, user.email);

        res.status(200).json({
            error_code: 200,
            message: 'OTP Sent Successfully',
            OTP: otp,
            Token: token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error_code: 500,
            message: 'Internal server error'
        });
    }
};



// -----------------------------------------------



// const loginWithOtp = async function (req, res) {
//     try {
//         const otpMobile = req.body.otpMobile;

//         const USER = await User_Model.findOne({
//             _id: req.userId,
//         });

//         if (!USER) {
//             console.log("Unauthorized - USER not found.");
//             return res.status(401).json({ error_code: 401, message: "Unauthorized" });
//         }

//         const userMobile = USER.mobileNumber;
//         console.log("userMobile :- ", userMobile);

//         // Check if OTP exists and is valid
//         const otpData = await OTP_Model.findOne({ mobileNumber: userMobile });
//         if (!otpData || otpData.otp !== otpMobile || otpData.expiresAt < Date.now()) {
//             console.log("Invalid OTP");
//             return res.status(400).json({ error_code: 400, message: "Invalid OTP" });
//         }

//         const authToken = UserForgenerateAuthToken(USER._id, USER.email);

//         res.status(200).json({
//             error_code: 200,
//             message: 'Login Successful',
//             Token: authToken,
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             error_code: 500,
//             message: 'Internal server error'
//         });
//     }
// };



const loginWithOtp = async function (req, res) {
    try {
        const otpMobile = req.body.otpMobile;

        const USER = await User_Model.findOne({
            _id: req.userId,
        });

        if (!USER) {
            console.log("Unauthorized - USER not found.");
            return res.status(401).json({ error_code: 401, message: "Unauthorized" });
        }

        const userMobile = USER.mobileNumber;
        console.log("userMobile :- ", userMobile);

        // Check if OTP exists and is valid
        const otpData = await OTP_Model.findOne({ mobileNumber: userMobile });
        if (!otpData || otpData.otp !== otpMobile || otpData.expiresAt < Date.now()) {
            console.log("Invalid OTP");
            return res.status(400).json({ error_code: 400, message: "Invalid OTP" });
        }

        // Check if all required fields in USER are filled
        if (
            USER.name &&
            USER.email &&
            USER.mobileNumber &&

            USER.familyAndNomineeDetails &&
            USER.familyAndNomineeDetails.familyMembers &&
            USER.familyAndNomineeDetails.familyMembers.length > 0 &&
            USER.bankDetails &&
            USER.bankDetails.accountNumber &&
            USER.bankDetails.beneficiaryName &&
            USER.bankDetails.bankName &&
            USER.bankDetails.ifscCode &&
            USER.paymentDetails &&
            USER.paymentDetails.registrationFee &&
            USER.paymentDetails.GST &&
            USER.paymentDetails.total &&
            USER.identityDetails &&
            USER.identityDetails.panCardNumber &&
            USER.identityDetails.nameRegisteredAsGST &&
            USER.identityDetails.gstNumber &&
            USER.TermsAndCondition > 0
        ) {
            const authToken = UserForgenerateAuthToken(USER._id, USER.email);

            return res.status(200).json({
                error_code: 200,
                message: 'Login Successful',
                Token: authToken,
                completed: true,
                id: USER._id,

            });
        } else {
            return res.status(200).json({
                error_code: 200,
                message: 'Login Successful, but user data incomplete',
                completed: false,
                id: USER._id,

            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error_code: 500,
            message: 'Internal server error'
        });
    }
};






// ===============================================
// -----------------------------------------------

const getAllUsers = async (req, res) => {
    try {
        const users = await User_Model.find();

        res.status(200).json({
            error_code: 200,
            message: "Successfully fetched all users",
            data: users
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error_code: 500,
            message: 'Internal server error'
        });
    }
}

// -----------------------------------------------

const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;

        // Fetch the user from the database by ID
        const user = await User_Model.findById(userId);

        if (!user) {
            return res.status(404).json({
                error_code: 404,
                message: 'User not found'
            });
        }

        // Respond with the user data
        res.status(200).json({
            error_code: 200,
            message: "Successfully fetched user",
            data: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error_code: 500,
            message: 'Internal server error'
        });
    }
}

const InAdmingetAllUsers = async (req, res) => {
    try {
        // Fetch users and include only the required fields
        const users = await User_Model.find({}, '_id referralById myReferralId mobileNumber name email adminType currentLevel createdAt');

        res.status(200).json({
            error_code: 200,
            message: "Successfully fetched all users",
            data: users
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error_code: 500,
            message: 'Internal server error'
        });
    }
};


const InAdmingetUserById = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User_Model.findById(userId, '_id referralById myReferralId mobileNumber name email address pincode village taluka district state profileImage adminType currentLevel createdAt updatedAt bankDetails identityDetails familyAndNomineeDetails');

        if (!user) {
            return res.status(404).json({
                error_code: 404,
                message: 'User not found'
            });
        }

        // Assuming baseURL.generateBaseUrl(req) is a valid function to generate the base URL
        let baseUrl = baseURL.generateBaseUrl(req);

        const PanCardImage = `${baseUrl}${user.identityDetails.panCardPhoto}`;
        const ProfileImage = `${baseUrl}${user.profileImage}`;

        res.status(200).json({
            error_code: 200,
            message: "Successfully fetched user",
            data: {
                ...user._doc,
                PanCardImage,
                ProfileImage
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



// -----------------------------------------------

// const checkFieldsFilled = async (req, res) => {
//     try {
//         const userId = req.params.id;

//         const user = await User_Model.findById(userId);

//         if (!user) {
//             // If user not found, return error code 404
//             return res.status(404).json({ error_code: 404, message: "User not found" });
//         }

//         // Check if the specified fields are filled
//         const result = {};

//         // Check if personalDetails fields are filled
//         result.personalDetails = (user.name && user.email && user.mobileNumber) ? 1 : 0;

//         // Check if familyAndNomineeDetails is filled
//         result.familyAndNomineeDetails = (user.familyAndNomineeDetails && user.familyAndNomineeDetails.familyMembers && user.familyAndNomineeDetails.familyMembers.length > 0) ? 1 : 0;

//         // Check if bankDetails is filled
//         result.bankDetails = (user.bankDetails && user.bankDetails.accountNumber && user.bankDetails.beneficiaryName && user.bankDetails.bankName && user.bankDetails.ifscCode) ? 1 : 0;

//         // Check if paymentDetails is filled
//         result.paymentDetails = (user.paymentDetails && user.paymentDetails.registrationFee && user.paymentDetails.GST && user.paymentDetails.total) ? 1 : 0;

//         // Check if identityDetails is filled
//         result.identityDetails = (user.identityDetails && user.identityDetails.panCardNumber && user.identityDetails.nameRegisteredAsGST && user.identityDetails.gstNumber) ? 1 : 0;

//         // Return the result
//         return res.status(200).json({ error_code: 200, message: "Success", data: result });
//     } catch (error) {
//         console.error("Error:", error);
//         // Return error code 500 for internal server error
//         return res.status(500).json({ error_code: 500, message: "Internal server error" });
//     }
// };

const checkFieldsFilled = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User_Model.findById(userId);

        if (!user) {
            // If user not found, return error code 404
            return res.status(404).json({ error_code: 404, message: "User not found" });
        }

        // Check if the specified fields are filled
        const result = {};

        // Check if personalDetails fields are filled
        result.personalDetails = (user.name && user.email && user.mobileNumber) ? 1 : 0;

        // Check if familyAndNomineeDetails is filled
        if (user.familyAndNomineeDetails) {
            // Check if familyMembers is filled
            result.familyDetails = (user.familyAndNomineeDetails.familyMembers && user.familyAndNomineeDetails.familyMembers.length > 0) ? 1 : 0;

            // Check if addNominee is filled
            result.nomineeDetails = (user.familyAndNomineeDetails.addNominee && user.familyAndNomineeDetails.addNominee.Name && user.familyAndNomineeDetails.addNominee.MobileNumber && user.familyAndNomineeDetails.addNominee.PanNumber) ? 1 : 0;
        } else {
            // If familyAndNomineeDetails is not filled, set flags to 0
            result.familyDetails = 0;
            result.nomineeDetails = 0;
        }

        // Check if bankDetails is filled
        result.bankDetails = (user.bankDetails && user.bankDetails.accountNumber && user.bankDetails.beneficiaryName && user.bankDetails.bankName && user.bankDetails.ifscCode) ? 1 : 0;

        // Check if paymentDetails is filled
        result.paymentDetails = (user.paymentDetails && user.paymentDetails.registrationFee && user.paymentDetails.GST && user.paymentDetails.total) ? 1 : 0;

        // Check if identityDetails is filled
        result.identityDetails = (user.identityDetails && user.identityDetails.panCardNumber && user.identityDetails.nameRegisteredAsGST && user.identityDetails.gstNumber) ? 1 : 0;

        // Return the result
        return res.status(200).json({ error_code: 200, message: "Success", data: result });
    } catch (error) {
        console.error("Error:", error);
        // Return error code 500 for internal server error
        return res.status(500).json({ error_code: 500, message: "Internal server error" });
    }
};


// -----------------------------------------------

// const registerCountinue = async (req, res) => {
//     try {
//         const userId = req.params.id;
//         const termsAndCondition = req.body.termsAndCondition;

//         const user = await User_Model.findById(userId);
//         if (!user) {
//             return res.status(404).json({ error_code: 404, message: 'User not found' });
//         }

//         if (typeof user.registrationData !== 'object') {
//             user.registrationData = {};
//         }

//         const obj = {
//             personalDetails: req.body.personalDetails || null,
//             familyAndNomineeDetails: req.body.familyAndNomineeDetails || null,
//             bankDetails: req.body.bankDetails || null,
//             paymentDetails: req.body.paymentDetails || null,
//             identityDetails: req.body.identityDetails || null,
//         };

//         user.TermsAndCondition = termsAndCondition;
//         user.registrationData = obj;
//         await user.save();

//         return res.status(200).json({
//             error_code: 200,
//             message: 'All Registration Process successfully completed',
//             // data: user
//         });
//     } catch (error) {
//         console.error("Error:", error);
//         return res.status(500).json({ error_code: 500, message: "Internal server error" });
//     }
// };


const registerCountinue = async (req, res) => {
    try {
        const userId = req.params.id;
        const termsAndCondition = req.body.termsAndCondition;

        const user = await User_Model.findById(userId);
        if (!user) {
            return res.status(404).json({ error_code: 404, message: 'User not found' });
        }

        if (typeof user.registrationData !== 'object') {
            user.registrationData = {};
        }

        const obj = {
            personalDetails: req.body.personalDetails || null,
            familyDetails: req.body.familyDetails || null,
            nomineeDetails: req.body.nomineeDetails || null,
            bankDetails: req.body.bankDetails || null,
            paymentDetails: req.body.paymentDetails || null,
            identityDetails: req.body.identityDetails || null,
        };

        user.TermsAndCondition = termsAndCondition;
        user.registrationData = obj;
        await user.save();

        // -----------------------------------------------------------------------

        let L1UserFind;
        if (user.referralById) {
            const userReferralId = user.referralById;
            console.log("userReferralId :- ", userReferralId);

            L1UserFind = await User_Model.findOne({ myReferralId: userReferralId });
            console.log("L1UserFind :- ", L1UserFind);

            if (L1UserFind) {
                L1UserFind.L1.push({ name: user.name, date: new Date(), userId: user._id });
                await L1UserFind.save();

            }
            if (L1UserFind.referralById) {
                const L2UserReferralId = L1UserFind.referralById;
                const L2UserFind = await User_Model.findOne({ myReferralId: L2UserReferralId });
                console.log("L2UserFind :- ", L2UserFind);

                if (L2UserFind) {
                    L2UserFind.L2.push({ name: user.name, date: new Date(), userId: user._id });
                    await L2UserFind.save();
                }
            }
        }


        // --------------------------------------------------------------------------

        return res.status(200).json({
            error_code: 200,
            message: 'All Registration Process successfully completed',
            // data: user
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error_code: 500, message: "Internal server error" });
    }
};







const paymentDetailsmain = async (req, res) => {
    try {
        const { userProfileId, registrationFee, GST, total } = req.body;

        if (!userProfileId) {
            return res.status(400).json({
                error_code: 400,
                message: 'userProfileId is required'
            });
        }

        const profileExists = await User_Model.findById(userProfileId);

        if (!profileExists) {
            return res.status(404).json({
                error_code: 404,
                message: 'User Profile not found'
            });
        }

        // Validation for each field
        if (!registrationFee) {
            return res.status(400).json({
                error_code: 400,
                message: 'Registration Fee missing..!'
            });
        } if (!GST) {
            return res.status(400).json({
                error_code: 400,
                message: 'GST missing..!'
            });
        } if (!total) {
            return res.status(400).json({
                error_code: 400,
                message: 'Total Amount missing..!'
            });
        }

        // Update user's payment details
        profileExists.paymentDetails = {
            registrationFee,
            GST,
            total,
        };

        await profileExists.save();

        return res.status(200).json({
            error_code: 200,
            message: "Payment details processed successfully",
            userProfileId: profileExists._id,
            data: profileExists.paymentDetails
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error_code: 500,
            message: 'Internal server error'
        });
    }
}


// -----------------------------------------------


const paymentDetails = async (req, res) => {
    try {
        const { userProfileId, registrationFee, GST, total } = req.body;
        if (!userProfileId) {
            return res.status(400).json({
                error_code: 400,
                message: 'userProfileId is required'
            });
        }
        const profileExists = await User_Model.findById(userProfileId);
        console.log("profileExists.name", profileExists.name);

        if (!profileExists) {
            return res.status(404).json({
                error_code: 404,
                message: 'User Profile not found'
            });
        }

        console.log("profileExists.status", profileExists.status);
        if (profileExists.status === 'Inactive') {
            return res.status(404).json({
                error_code: 404,
                message: 'User does not have access to payment',
                message1: 'Take permission from DSM'
            });
        }

        // ------------------------

        if (!registrationFee) {
            return res.status(400).json({
                error_code: 400,
                message: 'Registration Fee missing..!'
            });
        } if (!GST) {
            return res.status(400).json({
                error_code: 400,
                message: 'GST missing..!'
            });
        } if (!total) {
            return res.status(400).json({
                error_code: 400,
                message: 'Total Amount missing..!'
            });
        }

        profileExists.paymentDetails = {
            registrationFee,
            GST,
            total,
        };

        profileExists.registrationFee = registrationFee;
        await profileExists.save();

        const amountTotal = profileExists.paymentDetails.registrationFee;
        console.log("amountTotal :- ", amountTotal);
        // --------------------------------------------------
        async function sendNotification(userId, titleMessage, message) {
            const user = await User_Model.findById(userId);
            if (user) {
                const notification = {
                    titleMessage: titleMessage,
                    messege: message,
                    read: 0
                };
                user.notificationInfo.push(notification);
                await user.save();
                console.log(`Notification sent to user ${userId}: ${message}`);
            } else {
                console.error(`User with ID ${userId} not found`);
            }
        }
        // --------------------------------------------------
        // Calculate percentages
        let L1twentyPercent, L2fivePercent, onePointTwoPercent, onePointFivePercent, onePointEightPercent, twoPercent, twoPointFivePercent, threePercent;

        const parentreferralById = profileExists.referralById;
        console.log("parentreferralById :- ", parentreferralById);

        const ParentUser = await User_Model.findOne({ myReferralId: parentreferralById });
        console.log("ParentUSer ", ParentUser.name);
        if (!ParentUser) {
            return res.status(404).json({
                error_code: 404,
                message: 'Parent User not found'
            });
        }

        const currentLevel = ParentUser.currentLevel;
        console.log("currentLevel", currentLevel);

        switch (currentLevel) {

            case "1":

                const L1twentyPercent = amountTotal * 0.2;
                const L2fivePercent = amountTotal * 0.05;

                // Update wallet amount for currentParent 
                const currentParent = await User_Model.findById(ParentUser._id);
                if (currentParent) {
                    currentParent.wallet = (currentParent.wallet || 0) + L1twentyPercent;
                    currentParent.level1totalIncome = (currentParent.level1totalIncome || 0) + L1twentyPercent;

                    // Save income history for currentParent
                    const incomeTransaction1 = {
                        amount: L1twentyPercent,
                        userId: profileExists._id,
                        name: profileExists.name,
                        date: new Date(),
                        message: "Income from Level L1 Commission",
                        status: "Received"
                    };
                    currentParent.incomeHistory.push(incomeTransaction1);

                    // Find and remove the pending history entry
                    const pendingIndex = currentParent.paymentPendingHistory.findIndex(
                        entry => entry.userId.toString() === profileExists._id.toString()
                    );

                    // console.log("Before deletion, currentParent paymentPendingHistory:", currentParent.paymentPendingHistory);

                    if (pendingIndex !== -1) {
                        const pendingEntry = currentParent.paymentPendingHistory[pendingIndex];
                        console.log("Before currentParent.pendingAmount : - ", currentParent.pendingAmount);

                        currentParent.pendingAmount = (currentParent.pendingAmount || 0) - (pendingEntry.amount || 0);
                        console.log("currentParent.pendingAmount : - ", currentParent.pendingAmount);
                        currentParent.paymentPendingHistory.splice(pendingIndex, 1); // Remove the entry from the array
                        console.log(`Deleted pending history entry for userId ${profileExists._id}:`, pendingEntry);
                    } else {
                        console.log(`No pending history entry found for userId ${profileExists._id}`);
                    }

                    // console.log("After deletion, currentParent paymentPendingHistory:", currentParent.paymentPendingHistory);

                    await currentParent.save();
                    console.log("currentParent -: ", currentParent.name);

                    const notificationMessage1 = `You have received a pending commission of ${L1twentyPercent} from ${profileExists.name}.`;
                    await sendNotification(currentParent._id, "Level L1 Commission", notificationMessage1);



                } else {
                    console.error('currentParent not found');
                }

                // Find and update wallet amount for currentParentofParentModel
                try {
                    const currentParentofParentModel = await User_Model.findOne({ myReferralId: ParentUser.referralById });
                    if (currentParentofParentModel) {
                        currentParentofParentModel.wallet = (currentParentofParentModel.wallet || 0) + L2fivePercent;
                        currentParentofParentModel.level2totalIncome = (currentParentofParentModel.level2totalIncome || 0) + L2fivePercent;

                        // Save income history for currentParentofParentModel
                        const incomeTransaction2 = {
                            amount: L2fivePercent,
                            userId: profileExists._id,
                            name: profileExists.name,
                            date: new Date(),
                            message: "Income from Level L2 Commission",
                            status: "Received"
                        };
                        currentParentofParentModel.incomeHistory.push(incomeTransaction2);

                        // Find and remove the pending history entry
                        const pendingIndex2 = currentParentofParentModel.paymentPendingHistory.findIndex(
                            entry => entry.userId.toString() === profileExists._id.toString()
                        );

                        // console.log("Before deletion, currentParentofParentModel paymentPendingHistory:", currentParentofParentModel.paymentPendingHistory);

                        if (pendingIndex2 !== -1) {
                            const pendingEntry2 = currentParentofParentModel.paymentPendingHistory[pendingIndex2];
                            console.log("Before currentParentofParentModel.pendingAmount : - ", currentParentofParentModel.pendingAmount);

                            currentParentofParentModel.pendingAmount = (currentParentofParentModel.pendingAmount || 0) - (pendingEntry2.amount || 0);
                            console.log("currentParentofParentModel.pendingAmount : - ", currentParentofParentModel.pendingAmount);
                            currentParentofParentModel.paymentPendingHistory.splice(pendingIndex2, 1); // Remove the entry from the array
                            console.log(`Deleted pending history entry for userId ${profileExists._id}:`, pendingEntry2);
                        } else {
                            console.log(`No pending history entry found for userId ${profileExists._id}`);
                        }

                        // console.log("After deletion, currentParentofParentModel paymentPendingHistory:", currentParentofParentModel.paymentPendingHistory);

                        await currentParentofParentModel.save();
                        console.log("currentParentofParentModel -: ", currentParentofParentModel.name);

                        const notificationMessage2 = `You have received a pending commission of ${L2fivePercent} from ${profileExists.name}.`;
                        await sendNotification(currentParentofParentModel._id, "Level L2 Commission", notificationMessage2);

                    } else {
                        console.error('currentParentofParentModel not found');
                    }
                } catch (error) {
                    console.error('Error updating currentParentofParentModel:', error);
                }

                break;



            // -------------------------------------------------------------------------


            case "2":


                console.log("------------- Case:2 ----------------");

                const case2L1twentyPercent = amountTotal * 0.2;
                const onePointTwoPercent = amountTotal * 0.05;

                // Update wallet amount for currentParent 
                const currentParentLevel2 = await User_Model.findById(ParentUser._id);
                if (currentParentLevel2) {
                    currentParentLevel2.wallet = (currentParentLevel2.wallet || 0) + case2L1twentyPercent;
                    currentParentLevel2.level1totalIncome = (currentParentLevel2.level1totalIncome || 0) + case2L1twentyPercent;

                    // Save income history for currentParent
                    const incomeTransactionLevel2 = {
                        amount: case2L1twentyPercent,
                        userId: profileExists._id,
                        name: profileExists.name,
                        date: new Date(),
                        message: `Income from Level L1 Commission`,
                        status: "Received"
                    };
                    currentParentLevel2.incomeHistory.push(incomeTransactionLevel2);

                    // Find and remove the pending history entry
                    const pendingIndex = currentParentLevel2.paymentPendingHistory.findIndex(
                        entry => entry.userId.toString() === profileExists._id.toString()
                    );

                    if (pendingIndex !== -1) {
                        const pendingEntry = currentParentLevel2.paymentPendingHistory[pendingIndex];
                        console.log("Before currentParentLevel2.pendingAmount : - ", currentParentLevel2.pendingAmount);

                        currentParentLevel2.pendingAmount = (currentParentLevel2.pendingAmount || 0) - (pendingEntry.amount || 0);
                        console.log("currentParentLevel2.pendingAmount : - ", currentParentLevel2.pendingAmount);
                        currentParentLevel2.paymentPendingHistory.splice(pendingIndex, 1); // Remove the entry from the array
                        console.log(`Deleted pending history entry for userId ${profileExists._id}:`, pendingEntry);
                    } else {
                        console.log(`No pending history entry found for userId ${profileExists._id}`);
                    }

                    await currentParentLevel2.save();
                    console.log("currentParentLevel2 -: ", currentParentLevel2.name);
                    console.log("currentParentLevel2 -: ", currentParentLevel2._id);

                    const notificationMessage1 = `You have received a pending commission of ${case2L1twentyPercent} from ${profileExists.name}.`;
                    await sendNotification(currentParentLevel2._id, "Level L1 Commission", notificationMessage1);

                } else {
                    console.error('currentParentLevel2 not found');
                }

                try {
                    let referralId = currentParentLevel2.referralById;
                    const modelIds = [];
                    while (referralId) {
                        const grandParentModel = await User_Model.findOne({ myReferralId: referralId });
                        if (grandParentModel) {
                            modelIds.push(grandParentModel._id);
                            if (grandParentModel.referralById) {
                                referralId = grandParentModel.referralById;
                            } else {
                                referralId = null;
                            }
                        } else {
                            referralId = null;
                        }
                    }
                    console.log("Model IDs:", modelIds);
                    console.log("onePointTwoPercent-: ", onePointTwoPercent);

                    const countofmodelIds = modelIds.length;
                    console.log("countofmodelIds-: ", countofmodelIds);

                    const AverageAmount = onePointTwoPercent / countofmodelIds;
                    console.log("AverageAmount-: ", AverageAmount);

                    // Update wallet amount and income history for each model
                    for (const modelId of modelIds) {
                        const model = await User_Model.findById(modelId);
                        model.wallet = (model.wallet || 0) + AverageAmount;
                        model.downlineTotalIncome = (model.downlineTotalIncome || 0) + AverageAmount;

                        // Save income history for each model
                        const incomeTransaction = {
                            amount: AverageAmount,
                            userId: profileExists._id,
                            name: profileExists.name,
                            date: new Date(),
                            message: `Income from DownLine Level Commission`,
                            status: "Received"
                        };
                        model.incomeHistory.push(incomeTransaction);

                        // Find and remove the pending history entry
                        const pendingIndex2 = model.paymentPendingHistory.findIndex(
                            entry => entry.userId.toString() === profileExists._id.toString()
                        );

                        if (pendingIndex2 !== -1) {
                            const pendingEntry2 = model.paymentPendingHistory[pendingIndex2];
                            console.log("Before model.pendingAmount : - ", model.pendingAmount);

                            model.pendingAmount = (model.pendingAmount || 0) - (pendingEntry2.amount || 0);
                            console.log("model.pendingAmount : - ", model.pendingAmount);
                            model.paymentPendingHistory.splice(pendingIndex2, 1); // Remove the entry from the array
                            console.log(`Deleted pending history entry for userId ${profileExists._id}:`, pendingEntry2);
                        } else {
                            console.log(`No pending history entry found for userId ${profileExists._id}`);
                        }

                        await model.save();
                        //============================================
                        const notificationMessage2 = `You have received a pending commission of ${AverageAmount} from ${profileExists.name}.`;
                        await sendNotification(model._id, "Level DownLine Commission", notificationMessage2);


                    }

                } catch (error) {
                    console.error("Error:", error);
                }

                break;


            // -------------------------------------------------------------------

            case "3":

                console.log("------------- Case:3 ----------------");

                const case3L1twentyPercent = amountTotal * 0.2;
                const onePointFivePercent = amountTotal * 0.035;

                // Update wallet amount for currentParent 
                const currentParentLevel3 = await User_Model.findById(ParentUser._id);
                if (currentParentLevel3) {
                    currentParentLevel3.wallet = (currentParentLevel3.wallet || 0) + case3L1twentyPercent;
                    currentParentLevel3.level1totalIncome = (currentParentLevel3.level1totalIncome || 0) + case3L1twentyPercent;

                    // Save income history for currentParent
                    const incomeTransactionLevel3 = {
                        amount: case3L1twentyPercent,
                        userId: profileExists._id,
                        name: profileExists.name,
                        date: new Date(),
                        message: `Income from Level L1 Commission`,
                        status: "Received"
                    };
                    currentParentLevel3.incomeHistory.push(incomeTransactionLevel3);

                    // Find and remove the pending history entry
                    const pendingIndex = currentParentLevel3.paymentPendingHistory.findIndex(
                        entry => entry.userId.toString() === profileExists._id.toString()
                    );

                    if (pendingIndex !== -1) {
                        const pendingEntry = currentParentLevel3.paymentPendingHistory[pendingIndex];
                        console.log("Before currentParentLevel3.pendingAmount : - ", currentParentLevel3.pendingAmount);

                        currentParentLevel3.pendingAmount = (currentParentLevel3.pendingAmount || 0) - (pendingEntry.amount || 0);
                        console.log("currentParentLevel3.pendingAmount : - ", currentParentLevel3.pendingAmount);
                        currentParentLevel3.paymentPendingHistory.splice(pendingIndex, 1); // Remove the entry from the array
                        console.log(`Deleted pending history entry for userId ${profileExists._id}:`, pendingEntry);
                    } else {
                        console.log(`No pending history entry found for userId ${profileExists._id}`);
                    }

                    await currentParentLevel3.save();
                    console.log("currentParentLevel3 -: ", currentParentLevel3.name);
                    console.log("currentParentLevel3 -: ", currentParentLevel3._id);

                    const notificationMessage1 = `You have received a pending commission of ${case3L1twentyPercent} from ${profileExists.name}.`;
                    await sendNotification(currentParentLevel3._id, "Level L1 Commission", notificationMessage1);


                } else {
                    console.error('currentParentLevel3 not found');
                }

                try {
                    let referralId = currentParentLevel3.referralById;
                    const modelIds = [];
                    while (referralId) {
                        const grandParentModel = await User_Model.findOne({ myReferralId: referralId });
                        if (grandParentModel) {
                            modelIds.push(grandParentModel._id);
                            if (grandParentModel.referralById) {
                                referralId = grandParentModel.referralById;
                            } else {
                                referralId = null;
                            }
                        } else {
                            referralId = null;
                        }
                    }
                    console.log("Model IDs:", modelIds);
                    console.log("onePointFivePercent-: ", onePointFivePercent);

                    const countofmodelIds = modelIds.length;
                    console.log("countofmodelIds-: ", countofmodelIds);

                    const AverageAmount = onePointFivePercent / countofmodelIds;
                    console.log("AverageAmount-: ", AverageAmount);

                    // Update wallet amount and income history for each model
                    for (const modelId of modelIds) {
                        const model = await User_Model.findById(modelId);
                        model.wallet = (model.wallet || 0) + AverageAmount;
                        model.downlineTotalIncome = (model.downlineTotalIncome || 0) + AverageAmount;

                        // Save income history for each model
                        const incomeTransaction = {
                            amount: AverageAmount,
                            userId: profileExists._id,
                            name: profileExists.name,
                            date: new Date(),
                            message: `Income from DownLine Level Commission`,
                            status: "Received"
                        };
                        model.incomeHistory.push(incomeTransaction);

                        // Find and remove the pending history entry
                        const pendingIndex2 = model.paymentPendingHistory.findIndex(
                            entry => entry.userId.toString() === profileExists._id.toString()
                        );

                        if (pendingIndex2 !== -1) {
                            const pendingEntry2 = model.paymentPendingHistory[pendingIndex2];
                            console.log("Before model.pendingAmount : - ", model.pendingAmount);

                            model.pendingAmount = (model.pendingAmount || 0) - (pendingEntry2.amount || 0);
                            console.log("model.pendingAmount : - ", model.pendingAmount);
                            model.paymentPendingHistory.splice(pendingIndex2, 1); // Remove the entry from the array
                            console.log(`Deleted pending history entry for userId ${profileExists._id}:`, pendingEntry2);
                        } else {
                            console.log(`No pending history entry found for userId ${profileExists._id}`);
                        }

                        await model.save();
                        //============================================
                        const notificationMessage2 = `You have received a pending commission of ${AverageAmount} from ${profileExists.name}.`;
                        await sendNotification(model._id, "Level DownLine Commission", notificationMessage2);
                    }

                } catch (error) {
                    console.error("Error:", error);
                }

                break;


            // --------------------------------------------------------------------


            case "4":


                console.log("------------- Case:4 ----------------");

                const case4L1twentyPercent = amountTotal * 0.2;
                const case4L2AmountDownline = amountTotal * 0.03;

                // Update wallet amount for currentParent 
                const currentParentLevel4 = await User_Model.findById(ParentUser._id);
                if (currentParentLevel4) {
                    currentParentLevel4.wallet = (currentParentLevel4.wallet || 0) + case4L1twentyPercent;
                    currentParentLevel4.level1totalIncome = (currentParentLevel4.level1totalIncome || 0) + case4L1twentyPercent;

                    // Save income history for currentParent
                    const incomeTransactionLevel4 = {
                        amount: case4L1twentyPercent,
                        userId: profileExists._id,
                        name: profileExists.name,
                        date: new Date(),
                        message: `Income from Level L1 Commission`,
                        status: "Received"
                    };
                    currentParentLevel4.incomeHistory.push(incomeTransactionLevel4);

                    // Find and remove the pending history entry
                    const pendingIndex = currentParentLevel4.paymentPendingHistory.findIndex(
                        entry => entry.userId.toString() === profileExists._id.toString()
                    );

                    if (pendingIndex !== -1) {
                        const pendingEntry = currentParentLevel4.paymentPendingHistory[pendingIndex];
                        console.log("Before currentParentLevel4.pendingAmount : - ", currentParentLevel4.pendingAmount);

                        currentParentLevel4.pendingAmount = (currentParentLevel4.pendingAmount || 0) - (pendingEntry.amount || 0);
                        console.log("currentParentLevel4.pendingAmount : - ", currentParentLevel4.pendingAmount);
                        currentParentLevel4.paymentPendingHistory.splice(pendingIndex, 1); // Remove the entry from the array
                        console.log(`Deleted pending history entry for userId ${profileExists._id}:`, pendingEntry);
                    } else {
                        console.log(`No pending history entry found for userId ${profileExists._id}`);
                    }

                    await currentParentLevel4.save();
                    console.log("currentParentLevel4 -: ", currentParentLevel4.name);
                    console.log("currentParentLevel4 -: ", currentParentLevel4._id);

                    const notificationMessage1 = `You have received a pending commission of ${case4L1twentyPercent} from ${profileExists.name}.`;
                    await sendNotification(currentParentLevel4._id, "Level L1 Commission", notificationMessage1);


                } else {
                    console.error('currentParentLevel4 not found');
                }

                try {
                    let referralId = currentParentLevel4.referralById;
                    const modelIds = [];
                    while (referralId) {
                        const grandParentModel = await User_Model.findOne({ myReferralId: referralId });
                        if (grandParentModel) {
                            modelIds.push(grandParentModel._id);
                            if (grandParentModel.referralById) {
                                referralId = grandParentModel.referralById;
                            } else {
                                referralId = null;
                            }
                        } else {
                            referralId = null;
                        }
                    }
                    console.log("Model IDs:", modelIds);
                    console.log("case4L2AmountDownline-: ", case4L2AmountDownline);

                    const countofmodelIds = modelIds.length;
                    console.log("countofmodelIds-: ", countofmodelIds);

                    const AverageAmount = case4L2AmountDownline / countofmodelIds;
                    console.log("AverageAmount-: ", AverageAmount);

                    // Update wallet amount and income history for each model
                    for (const modelId of modelIds) {
                        const model = await User_Model.findById(modelId);
                        model.wallet = (model.wallet || 0) + AverageAmount;
                        model.downlineTotalIncome = (model.downlineTotalIncome || 0) + AverageAmount;

                        // Find and remove the pending history entry
                        const pendingIndex2 = model.paymentPendingHistory.findIndex(
                            entry => entry.userId.toString() === profileExists._id.toString()
                        );

                        if (pendingIndex2 !== -1) {
                            const pendingEntry2 = model.paymentPendingHistory[pendingIndex2];
                            console.log("Before model.pendingAmount : - ", model.pendingAmount);

                            model.pendingAmount = (model.pendingAmount || 0) - (pendingEntry2.amount || 0);
                            console.log("model.pendingAmount : - ", model.pendingAmount);
                            model.paymentPendingHistory.splice(pendingIndex2, 1); // Remove the entry from the array
                            console.log(`Deleted pending history entry for userId ${profileExists._id}:`, pendingEntry2);
                        } else {
                            console.log(`No pending history entry found for userId ${profileExists._id}`);
                        }

                        // Save income history for each model
                        const incomeTransaction = {
                            amount: AverageAmount,
                            userId: profileExists._id,
                            name: profileExists.name,
                            date: new Date(),
                            message: `Income from DownLine Level Commission`,
                            status: "Received"
                        };
                        model.incomeHistory.push(incomeTransaction);
                        await model.save();
                        //============================================
                        const notificationMessage2 = `You have received a pending commission of ${AverageAmount} from ${profileExists.name}.`;
                        await sendNotification(model._id, "Level DownLine Commission", notificationMessage2);
                    }
                } catch (error) {
                    console.error("Error:", error);
                }

                break;

            // ----------------------------------------------------------------------

            case "5":

                console.log("------------- Case:5 ----------------");

                const case5L1twentyPercent = amountTotal * 0.2;
                const case5L2AmountDownline = amountTotal * 0.025;

                // Update wallet amount for currentParent 
                const currentParentLevel5 = await User_Model.findById(ParentUser._id);
                if (currentParentLevel5) {
                    currentParentLevel5.wallet = (currentParentLevel5.wallet || 0) + case5L1twentyPercent;
                    currentParentLevel5.level1totalIncome = (currentParentLevel5.level1totalIncome || 0) + case5L1twentyPercent;

                    // Save income history for currentParent
                    const incomeTransactionLevel5 = {
                        amount: case5L1twentyPercent,
                        userId: profileExists._id,
                        name: profileExists.name,
                        date: new Date(),
                        message: `Income from Level L1 Commission`,
                        status: "Received"
                    };
                    currentParentLevel5.incomeHistory.push(incomeTransactionLevel5);

                    // Find and remove the pending history entry
                    const pendingIndex = currentParentLevel5.paymentPendingHistory.findIndex(
                        entry => entry.userId.toString() === profileExists._id.toString()
                    );

                    if (pendingIndex !== -1) {
                        const pendingEntry = currentParentLevel5.paymentPendingHistory[pendingIndex];
                        console.log("Before currentParentLevel5.pendingAmount : - ", currentParentLevel5.pendingAmount);

                        currentParentLevel5.pendingAmount = (currentParentLevel5.pendingAmount || 0) - (pendingEntry.amount || 0);
                        console.log("currentParentLevel5.pendingAmount : - ", currentParentLevel5.pendingAmount);
                        currentParentLevel5.paymentPendingHistory.splice(pendingIndex, 1); // Remove the entry from the array
                        console.log(`Deleted pending history entry for userId ${profileExists._id}:`, pendingEntry);
                    } else {
                        console.log(`No pending history entry found for userId ${profileExists._id}`);
                    }

                    await currentParentLevel5.save();
                    console.log("currentParentLevel5 -: ", currentParentLevel5.name);
                    console.log("currentParentLevel5 -: ", currentParentLevel5._id);

                    const notificationMessage1 = `You have received a pending commission of ${case5L1twentyPercent} from ${profileExists.name}.`;
                    await sendNotification(currentParentLevel5._id, "Level L1 Commission", notificationMessage1);


                } else {
                    console.error('currentParentLevel5 not found');
                }

                try {
                    let referralId = currentParentLevel5.referralById;
                    const modelIds = [];
                    while (referralId) {
                        const grandParentModel = await User_Model.findOne({ myReferralId: referralId });
                        if (grandParentModel) {
                            modelIds.push(grandParentModel._id);
                            if (grandParentModel.referralById) {
                                referralId = grandParentModel.referralById;
                            } else {
                                referralId = null;
                            }
                        } else {
                            referralId = null;
                        }
                    }
                    console.log("Model IDs:", modelIds);
                    console.log("case5L2AmountDownline-: ", case5L2AmountDownline);

                    const countofmodelIds = modelIds.length;
                    console.log("countofmodelIds-: ", countofmodelIds);

                    const AverageAmount = case5L2AmountDownline / countofmodelIds;
                    console.log("AverageAmount-: ", AverageAmount);

                    // Update wallet amount and income history for each model
                    for (const modelId of modelIds) {
                        const model = await User_Model.findById(modelId);
                        model.wallet = (model.wallet || 0) + AverageAmount;
                        model.downlineTotalIncome = (model.downlineTotalIncome || 0) + AverageAmount;

                        // Find and remove the pending history entry
                        const pendingIndex2 = model.paymentPendingHistory.findIndex(
                            entry => entry.userId.toString() === profileExists._id.toString()
                        );

                        if (pendingIndex2 !== -1) {
                            const pendingEntry2 = model.paymentPendingHistory[pendingIndex2];
                            console.log("Before model.pendingAmount : - ", model.pendingAmount);

                            model.pendingAmount = (model.pendingAmount || 0) - (pendingEntry2.amount || 0);
                            console.log("model.pendingAmount : - ", model.pendingAmount);
                            model.paymentPendingHistory.splice(pendingIndex2, 1); // Remove the entry from the array
                            console.log(`Deleted pending history entry for userId ${profileExists._id}:`, pendingEntry2);
                        } else {
                            console.log(`No pending history entry found for userId ${profileExists._id}`);
                        }

                        // Save income history for each model
                        const incomeTransaction = {
                            amount: AverageAmount,
                            userId: profileExists._id,
                            name: profileExists.name,
                            date: new Date(),
                            message: `Income from DownLine Level Commission`,
                            status: "Received"
                        };
                        model.incomeHistory.push(incomeTransaction);

                        await model.save();
                        //============================================
                        const notificationMessage2 = `You have received a pending commission of ${AverageAmount} from ${profileExists.name}.`;
                        await sendNotification(model._id, "Level DownLine Commission", notificationMessage2);

                    }
                } catch (error) {
                    console.error("Error:", error);
                }

                break;

            // ----------------------------------------------------------------------

            case "6":

                console.log("------------- Case:6 ----------------");

                const case6L1twentyPercent = amountTotal * 0.2;
                const case6L2AmountDownline = amountTotal * 0.02;

                // Update wallet amount for currentParent 
                const currentParentLevel6 = await User_Model.findById(ParentUser._id);
                if (currentParentLevel6) {
                    currentParentLevel6.wallet = (currentParentLevel6.wallet || 0) + case6L1twentyPercent;
                    currentParentLevel6.level1totalIncome = (currentParentLevel6.level1totalIncome || 0) + case6L1twentyPercent;

                    // Save income history for currentParent
                    const incomeTransactionLevel6 = {
                        amount: case6L1twentyPercent,
                        userId: profileExists._id,
                        name: profileExists.name,
                        date: new Date(),
                        message: `Income from Level L1 Commission`,
                        status: "Received"
                    };
                    currentParentLevel6.incomeHistory.push(incomeTransactionLevel6);

                    // Find and remove the pending history entry
                    const pendingIndex = currentParentLevel6.paymentPendingHistory.findIndex(
                        entry => entry.userId.toString() === profileExists._id.toString()
                    );

                    if (pendingIndex !== -1) {
                        const pendingEntry = currentParentLevel6.paymentPendingHistory[pendingIndex];
                        console.log("Before currentParentLevel6.pendingAmount : - ", currentParentLevel6.pendingAmount);

                        currentParentLevel6.pendingAmount = (currentParentLevel6.pendingAmount || 0) - (pendingEntry.amount || 0);
                        console.log("currentParentLevel6.pendingAmount : - ", currentParentLevel6.pendingAmount);
                        currentParentLevel6.paymentPendingHistory.splice(pendingIndex, 1); // Remove the entry from the array
                        console.log(`Deleted pending history entry for userId ${profileExists._id}:`, pendingEntry);
                    } else {
                        console.log(`No pending history entry found for userId ${profileExists._id}`);
                    }

                    await currentParentLevel6.save();
                    console.log("currentParentLevel6 -: ", currentParentLevel6.name);
                    console.log("currentParentLevel6 -: ", currentParentLevel6._id);

                    const notificationMessage1 = `You have received a pending commission of ${case6L1twentyPercent} from ${profileExists.name}.`;
                    await sendNotification(currentParentLevel6._id, "Level L1 Commission", notificationMessage1);



                } else {
                    console.error('currentParentLevel6 not found');
                }

                try {
                    let referralId = currentParentLevel6.referralById;
                    const modelIds = [];
                    while (referralId) {
                        const grandParentModel = await User_Model.findOne({ myReferralId: referralId });
                        if (grandParentModel) {
                            modelIds.push(grandParentModel._id);
                            if (grandParentModel.referralById) {
                                referralId = grandParentModel.referralById;
                            } else {
                                referralId = null;
                            }
                        } else {
                            referralId = null;
                        }
                    }
                    console.log("Model IDs:", modelIds);
                    console.log("case6L2AmountDownline-: ", case6L2AmountDownline);

                    const countofmodelIds = modelIds.length;
                    console.log("countofmodelIds-: ", countofmodelIds);

                    const AverageAmount = case6L2AmountDownline / countofmodelIds;
                    console.log("AverageAmount-: ", AverageAmount);

                    // Update wallet amount and income history for each model
                    for (const modelId of modelIds) {
                        const model = await User_Model.findById(modelId);
                        model.wallet = (model.wallet || 0) + AverageAmount;
                        model.downlineTotalIncome = (model.downlineTotalIncome || 0) + AverageAmount;

                        // Find and remove the pending history entry
                        const pendingIndex2 = model.paymentPendingHistory.findIndex(
                            entry => entry.userId.toString() === profileExists._id.toString()
                        );

                        if (pendingIndex2 !== -1) {
                            const pendingEntry2 = model.paymentPendingHistory[pendingIndex2];
                            console.log("Before model.pendingAmount : - ", model.pendingAmount);

                            model.pendingAmount = (model.pendingAmount || 0) - (pendingEntry2.amount || 0);
                            console.log("model.pendingAmount : - ", model.pendingAmount);
                            model.paymentPendingHistory.splice(pendingIndex2, 1); // Remove the entry from the array
                            console.log(`Deleted pending history entry for userId ${profileExists._id}:`, pendingEntry2);
                        } else {
                            console.log(`No pending history entry found for userId ${profileExists._id}`);
                        }

                        // Save income history for each model
                        const incomeTransaction = {
                            amount: AverageAmount,
                            userId: profileExists._id,
                            name: profileExists.name,
                            date: new Date(),
                            message: `Income from DownLine Level Commission`,
                            status: "Received"
                        };
                        model.incomeHistory.push(incomeTransaction);
                        await model.save();
                        //============================================
                        const notificationMessage2 = `You have received a pending commission of ${AverageAmount} from ${profileExists.name}.`;
                        await sendNotification(model._id, "Level DownLine Commission", notificationMessage2);
                    }
                } catch (error) {
                    console.error("Error:", error);
                }

                break;

            case "Crown":

                console.log("------------- Case:Crown ----------------");

                const caseCrownL1twentyPercent = amountTotal * 0.2;
                const caseCrownL2AmountDownline = amountTotal * 0.03;

                // Update wallet amount for currentParent 
                const currentParentLevelCrown = await User_Model.findById(ParentUser._id);
                if (currentParentLevelCrown) {
                    currentParentLevelCrown.wallet = (currentParentLevelCrown.wallet || 0) + caseCrownL1twentyPercent;
                    currentParentLevelCrown.level1totalIncome = (currentParentLevelCrown.level1totalIncome || 0) + caseCrownL1twentyPercent;

                    // Save income history for currentParent
                    const incomeTransactionLevelCrown = {
                        amount: caseCrownL1twentyPercent,
                        userId: profileExists._id,
                        name: profileExists.name,
                        date: new Date(),
                        message: `Income from Level L1 Commission`,
                        status: "Received"
                    };
                    currentParentLevelCrown.incomeHistory.push(incomeTransactionLevelCrown);

                    // Find and remove the pending history entry
                    const pendingIndex = currentParentLevelCrown.paymentPendingHistory.findIndex(
                        entry => entry.userId.toString() === profileExists._id.toString()
                    );

                    if (pendingIndex !== -1) {
                        const pendingEntry = currentParentLevelCrown.paymentPendingHistory[pendingIndex];
                        console.log("Before currentParentLevelCrown.pendingAmount : - ", currentParentLevelCrown.pendingAmount);

                        currentParentLevelCrown.pendingAmount = (currentParentLevelCrown.pendingAmount || 0) - (pendingEntry.amount || 0);
                        console.log("currentParentLevelCrown.pendingAmount : - ", currentParentLevelCrown.pendingAmount);
                        currentParentLevelCrown.paymentPendingHistory.splice(pendingIndex, 1); // Remove the entry from the array
                        console.log(`Deleted pending history entry for userId ${profileExists._id}:`, pendingEntry);
                    } else {
                        console.log(`No pending history entry found for userId ${profileExists._id}`);
                    }

                    await currentParentLevelCrown.save();
                    console.log("currentParentLevelCrown -: ", currentParentLevelCrown.name);
                    console.log("currentParentLevelCrown -: ", currentParentLevelCrown._id);

                    const notificationMessage1 = `You have received a pending commission of ${caseCrownL1twentyPercent} from ${profileExists.name}.`;
                    await sendNotification(currentParentLevelCrown._id, "Level L1 Commission", notificationMessage1);


                } else {
                    console.error('currentParentLevelCrown not found');
                }

                try {
                    let referralId = currentParentLevelCrown.referralById;
                    const modelIds = [];
                    while (referralId) {
                        const grandParentModel = await User_Model.findOne({ myReferralId: referralId });
                        if (grandParentModel) {
                            modelIds.push(grandParentModel._id);
                            if (grandParentModel.referralById) {
                                referralId = grandParentModel.referralById;
                            } else {
                                referralId = null;
                            }
                        } else {
                            referralId = null;
                        }
                    }
                    console.log("Model IDs:", modelIds);
                    console.log("caseCrownL2AmountDownline-: ", caseCrownL2AmountDownline);

                    const countofmodelIds = modelIds.length;
                    console.log("countofmodelIds-: ", countofmodelIds);

                    const AverageAmount = caseCrownL2AmountDownline / countofmodelIds;
                    console.log("AverageAmount-: ", AverageAmount);

                    // Update wallet amount and income history for each model
                    for (const modelId of modelIds) {
                        const model = await User_Model.findById(modelId);
                        model.wallet += AverageAmount;
                        model.downlineTotalIncome += AverageAmount;

                        // Find and remove the pending history entry
                        const pendingIndex2 = model.paymentPendingHistory.findIndex(
                            entry => entry.userId.toString() === profileExists._id.toString()
                        );

                        if (pendingIndex2 !== -1) {
                            const pendingEntry2 = model.paymentPendingHistory[pendingIndex2];
                            console.log("pendingEntry2 : - ", pendingEntry2);
                            console.log("Before model.pendingAmount : - ", model.pendingAmount);

                            model.pendingAmount = (model.pendingAmount || 0) - (pendingEntry2.amount || 0);
                            console.log("model.pendingAmount : - ", model.pendingAmount);
                            console.log("pendingEntry2.amount : - ", pendingEntry2.amount);

                            model.paymentPendingHistory.splice(pendingIndex2, 1); // Remove the entry from the array
                            console.log(`Deleted pending history entry for userId ${profileExists._id}:`, pendingEntry2);
                        } else {
                            console.log(`No pending history entry found for userId ${profileExists._id}`);
                        }

                        // Save income history for each model
                        const incomeTransaction = {
                            amount: AverageAmount,
                            userId: profileExists._id,
                            name: profileExists.name,
                            date: new Date(),
                            message: `Income from DownLine Level Commission`,
                            status: "Received"
                        };
                        model.incomeHistory.push(incomeTransaction);
                        await model.save();
                        //============================================
                        const notificationMessage2 = `You have received a pending commission of ${AverageAmount} from ${profileExists.name}.`;
                        await sendNotification(model._id, "Level DownLine Commission", notificationMessage2);

                    }
                } catch (error) {
                    console.error("Error:", error);
                }

                break;

            default:
                break;
        }

        return res.status(200).json({
            error_code: 200,
            message: "Payment details processed successfully",
            userProfileId: profileExists._id,
            data: profileExists.paymentDetails
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error_code: 500,
            message: 'Internal server error'
        });
    }
}



// -----------------------------------------------

const changeStatusUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userData = await User_Model.findById(id);

        if (!userData) {
            return res.status(404).json({
                error_code: 404,
                message: 'User not found'
            });
        }

        // Toggle the user's status
        userData.status = userData.status === 'Active' ? 'Inactive' : 'Active';

        await userData.save(); // Save the updated user data
        res.status(200).json({ // Respond with a success message and updated user data
            message: `User status toggled successfully to ${userData.status}`,
            userData: {
                id: userData.id,
                status: userData.status,
            }
        });
    } catch (err) {
        console.error('Error inside changeStatusUser', err);
        res.status(500).json({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
};

const UserUnderL1 = async (req, res) => {
    try {
        const userId = req.params.id;

        // Find the L1 user by ID
        const user = await User_Model.findById(userId);

        if (!user) {
            return res.status(404).json({
                error_code: 404,
                message: 'L1 user not found'
            });
        }

        const userIds = user.L1.map(entry => entry.userId);

        // Find users based on userIds array
        const usersUnderL1 = await User_Model.find({ _id: { $in: userIds } });

        // Extract required fields from usersUnderL1
        const userDetails = usersUnderL1.map(user => ({
            id: user._id,
            name: user.name,
            referralById: user.referralById,
            myReferralId: user.myReferralId,
            mobileNumber: user.mobileNumber,
            email: user.email,
            currentLevel: user.currentLevel
        }));

        res.status(200).json({
            error_code: 200,
            message: "Successfully fetched users L1 Referral List",
            userDetails: userDetails
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error_code: 500,
            message: 'Internal server error'
        });
    }
};



const UserUnderL2 = async (req, res) => {
    try {
        const userId = req.params.id;

        // Find the L2 user by ID
        const user = await User_Model.findById(userId);

        if (!user) {
            return res.status(404).json({
                error_code: 404,
                message: 'L2 user not found'
            });
        }

        // Extract userId from the L2 field of the user
        const userIds = user.L2.map(entry => entry.userId);

        const usersUnderL2 = await User_Model.find({ _id: { $in: userIds } });

        // Extract required fields from usersUnderL1
        const userDetails = usersUnderL2.map(user => ({
            id: user._id,
            name: user.name,
            referralById: user.referralById,
            myReferralId: user.myReferralId,
            mobileNumber: user.mobileNumber,
            email: user.email,
            currentLevel: user.currentLevel
        }));
        res.status(200).json({
            error_code: 200,
            message: "Successfully fetched users L2 Referral List",
            userIds: userDetails
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error_code: 500,
            message: 'Internal server error'
        });
    }
};


const downLineReferral = async (req, res) => {
    try {
        const userId = req.params.id;

        // Find the L2 user by ID
        const user = await User_Model.findById(userId);

        if (!user) {
            return res.status(404).json({
                error_code: 404,
                message: 'L2 user not found'
            });
        }

        const userIds = user.L2.map(entry => entry.userId);

        // Find users based on userIds array and retrieve their myReferralId
        const users = await User_Model.find({ _id: { $in: userIds } });

        const myReferralIds = users.map(user => user.myReferralId);

        // Find users whose myReferralId matches any of the myReferralIds
        const downLineReferral = await User_Model.find({ myReferralId: { $in: myReferralIds } });

        const userDetails = downLineReferral.map(user => ({
            id: user._id,
            name: user.name,
            referralById: user.referralById,
            myReferralId: user.myReferralId,
            mobileNumber: user.mobileNumber,
            email: user.email,
            currentLevel: user.currentLevel
        }));

        res.status(200).json({
            error_code: 200,
            message: "Successfully fetched users L2 Referral List",
            myReferralIds: myReferralIds,
            downLineReferral: userDetails,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error_code: 500,
            message: 'Internal server error'
        });
    }
};

const payoutRequest = async (req, res) => {
    try {
        const userId = req.params.id;

        // Find the L2 user by ID
        const user = await User_Model.findById(userId);

        if (!user) {
            return res.status(404).json({
                error_code: 404,
                message: 'L2 user not found'
            });
        }

        // Map the tdsReports array to include only the specified fields
        const payoutRequest = user.tdsReports.map(report => ({
            date: report.date,
            PayableAmount: report.WithdrawMoney,
            TDS: report.tdsAmount,
            Withdraw: report.receivedAmount
        }));

        const userName = user.name;
        const wallet = user.wallet;

        res.status(200).json({
            error_code: 200,
            message: "Successfully fetched users Payout Request",
            userName: userName,
            wallet: wallet,
            payoutRequest: payoutRequest
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error_code: 500,
            message: 'Internal server error'
        });
    }
};




// -----------------------------------------------

const manageApproval = async (req, res) => {
    try {
        const projection = {
            createdAt: 1,
            name: 1,
            email: 1,
            mobileNumber: 1,
            adminType: 1,
            ApprovalStatus: 1
        };

        // Define the filter condition for ApprovalStatus being "Pending"
        const filter = { ApprovalStatus: "Pending" };

        // Find all documents from each model with the specified fields and sort by the latest time
        const ceoData = await CEO_Model.find(filter, projection).sort({ createdAt: -1 });
        const gmData = await GM_Model.find(filter, projection).sort({ createdAt: -1 });
        const smData = await SM_Model.find(filter, projection).sort({ createdAt: -1 });
        const dsmData = await DSM_Model.find(filter, projection).sort({ createdAt: -1 });
        const saData = await SA_Model.find(filter, projection).sort({ createdAt: -1 });

        // Combine the data from all models into one array
        const allData = [
            ...ceoData,
            ...gmData,
            ...smData,
            ...dsmData,
            ...saData
        ];

        // Respond with the combined data
        res.status(200).json({
            error_code: 200,
            message: "Successfully fetched all data",
            data: allData
        });
    } catch (error) {
        console.error("Error fetching data from models:", error);
        res.status(500).json({
            error_code: 500,
            message: "Internal server error"
        });
    }
};


// -----------------------------------------------

const deleteManageApproval = async (req, res) => {
    try {
        const { id, adminType } = req.body;

        // Check if both id and adminType are provided
        if (!id || !adminType) {
            return res.status(400).json({
                error_code: 400,
                message: "id and adminType are required"
            });
        }

        // Define the filter condition with both id and adminType
        const filter = { _id: id, adminType: adminType };

        // Based on adminType, delete the document from the appropriate model
        let deletedData;
        switch (adminType) {
            case 'CEO':
                deletedData = await CEO_Model.findOneAndDelete({ _id: id });
                break;
            case 'GM':
                deletedData = await GM_Model.findOneAndDelete({ _id: id });
                break;
            case 'SM':
                deletedData = await SM_Model.findOneAndDelete({ _id: id });
                break;
            case 'DSM':
                deletedData = await DSM_Model.findOneAndDelete({ _id: id });
                break;
            case 'SA':
                deletedData = await SA_Model.findOneAndDelete({ _id: id });
                break;
            default:
                return res.status(400).json({
                    error_code: 400,
                    message: "Invalid admin type"
                });
        }

        if (!deletedData) {
            return res.status(404).json({
                error_code: 404,
                message: 'Data not found'
            });
        }

        // Respond with a success message
        res.status(200).json({
            error_code: 200,
            message: "Successfully deleted data",
            // data: deletedData
        });
    } catch (error) {
        console.error("Error deleting data:", error);
        res.status(500).json({
            error_code: 500,
            message: "Internal server error"
        });
    }
};


// -----------------------------------------------

const updateApprovalStatus = async (req, res) => {
    try {
        const { id, adminType, approvalStatus } = req.body;

        if (!id) {
            return res.status(400).json({
                error_code: 400,
                message: "id is required"
            });
        }
        if (!adminType) {
            return res.status(400).json({
                error_code: 400,
                message: " adminType is required"
            });
        }
        if (!approvalStatus) {
            return res.status(400).json({
                error_code: 400,
                message: " approvalStatus is required"
            });
        }

        console.log("approvalStatus", approvalStatus);

        const filter = { _id: id };

        let updatedData;

        switch (adminType) {
            case 'CEO':
                updatedData = await CEO_Model.findOneAndUpdate(filter, { ApprovalStatus: approvalStatus }, { new: true });
                break;
            case 'GM':
                updatedData = await GM_Model.findOneAndUpdate(filter, { ApprovalStatus: approvalStatus }, { new: true });
                break;
            case 'SM':
                updatedData = await SM_Model.findOneAndUpdate(filter, { ApprovalStatus: approvalStatus }, { new: true });
                break;
            case 'DSM':
                updatedData = await DSM_Model.findOneAndUpdate(filter, { ApprovalStatus: approvalStatus }, { new: true });
                break;
            case 'SA':
                updatedData = await SA_Model.findOneAndUpdate(filter, { ApprovalStatus: approvalStatus }, { new: true });
                break;
            default:
                return res.status(400).json({
                    error_code: 400,
                    message: "Invalid admin type"
                });
        }

        if (!updatedData) {
            return res.status(404).json({
                error_code: 404,
                message: 'Data not found'
            });
        }

        // Respond with the updated data
        res.status(200).json({
            error_code: 200,
            message: "Successfully updated ApprovalStatus",
            data: updatedData
        });
    } catch (error) {
        console.error("Error updating ApprovalStatus:", error);
        res.status(500).json({
            error_code: 500,
            message: "Internal server error"
        });
    }
};


// -----------------------------------------------


module.exports = {
    registerUser,
    otpSentUserMobile,
    ReSendOTP,
    verifyOTP,
    identityDetails,
    familyDetails,
    NomineeDetails,
    GetFamilyAndNominee,
    BankDetails,
    paymentDetails,

    // -----------------------------------------------

    userLogin,
    loginWithOtp,
    getAllUsers,
    getUserById,
    checkFieldsFilled,
    registerCountinue,
    paymentDetailsmain,
    changeStatusUser,
    // -----------------------------------------------

    InAdmingetAllUsers,
    InAdmingetUserById,
    UserUnderL1,
    UserUnderL2,
    downLineReferral,
    payoutRequest,
    manageApproval,
    deleteManageApproval,
    updateApprovalStatus,


};
