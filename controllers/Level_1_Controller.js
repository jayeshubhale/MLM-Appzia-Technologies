const User_Model = require("../model/UserModel");
const baseURL = require("../constant/baseURL");
const jwtToken = require("../constant/jwtToken");


// ----------------------------------------------------

// const getDashboardUser = async (req, res) => {
//     try {
//         const USER = await User_Model.findOne({
//             _id: req.userId,
//         });

//         const currentLevel = Number(USER.currentLevel);
//         console.log("currentLevel :-> ", currentLevel);

//         if (!USER) {
//             console.log("Unauthorized - USER not found.");
//             return res.status(401).json({ error_code: 401, message: "Unauthorized" });
//         }
//         // =========================================================================
//         // Extract L1 and L2 user IDs separately
//         const l1UserIds = USER.L1.map(item => item.userId);
//         const l2UserIds = USER.L2.map(item => item.userId);

//         // Count unique L1 and L2 users
//         const uniqueL1UserIds = new Set(l1UserIds);
//         const uniqueL2UserIds = new Set(l2UserIds);

//         // Initialize counts
//         let l1Count = 0;
//         let l2Count = 0;

//         // Check if each L1 user exists in the model
//         for (const userId of uniqueL1UserIds) {
//             const userExists = await User_Model.exists({ _id: userId });
//             if (userExists) {
//                 l1Count++;
//             }
//         }

//         // Check if each L2 user exists in the model
//         for (const userId of uniqueL2UserIds) {
//             const userExists = await User_Model.exists({ _id: userId });
//             if (userExists) {
//                 l2Count++;
//             }
//         }
//         const TotalCount = l1Count + l2Count;

//         // ==================================================================




//         return res.status(200).json({
//             error_code: 200,
//             message: "Dashboard data Fetch Successfully",
//             ID: USER._id,
//             UserName: USER.name,
//             data: {
//                 TotalL1Refferal: l1Count,
//                 TotalL2Refferal: l2Count,
//                 MyTotalTeams: TotalCount,
//                 CurrentLevel: currentLevel,

//             }
//         });
//     } catch (error) {
//         console.error("Error:", error);
//         return res.status(500).json({ error_code: 500, message: "Internal server error" });
//     }
// };

// ----------------------------------------------------


const getDashboardUser = async (req, res) => {
    try {
        const USER = await User_Model.findOne({
            _id: req.userId,
        });

        const currentLevel = Number(USER.currentLevel);
        console.log("currentLevel :-> ", currentLevel);

        if (!USER) {
            console.log("Unauthorized - USER not found.");
            return res.status(401).json({ error_code: 401, message: "Unauthorized" });
        }
        // ________________________________________________________


        // Extract L1 and L2 user IDs separately
        const l1UserIds = USER.L1.map(item => item.userId);
        const l2UserIds = USER.L2.map(item => item.userId);

        // Count unique L1 and L2 users
        const uniqueL1UserIds = new Set(l1UserIds);
        const uniqueL2UserIds = new Set(l2UserIds);

        // Initialize counts
        let l1Count = 0;
        let l2Count = 0;

        // Check if each L1 user exists in the model
        for (const userId of uniqueL1UserIds) {
            const userExists = await User_Model.exists({ _id: userId });
            if (userExists) {
                l1Count++;
            }
        }

        // Check if each L2 user exists in the model
        for (const userId of uniqueL2UserIds) {
            const userExists = await User_Model.exists({ _id: userId });
            if (userExists) {
                l2Count++;
            }
        }
        const TotalCount = l1Count + l2Count;


        // ________________________________________________________

        // Function to extract users by month and year
        const extractUsersByMonthAndYear = (users, month, year) => {
            return users.filter(item => {
                const userDate = new Date(Date.parse(item.date));
                const userMonth = userDate.getMonth() + 1;
                const userYear = userDate.getFullYear();
                return userMonth === month && userYear === year;
            }).map(item => ({ name: item.name, date: item.date, userId: item.userId }));
        };

        // Extract current month and year
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        // Extract L1 and L2 user IDs separately for the current month
        const l1UsersCurrentMonth = extractUsersByMonthAndYear(USER.L1, currentMonth, currentYear);
        const l2UsersCurrentMonth = extractUsersByMonthAndYear(USER.L2, currentMonth, currentYear);

        // Fetch existing L1 users for the current month
        const existingL1UsersCurrentMonth = await User_Model.find({ _id: { $in: Array.from(new Set(l1UsersCurrentMonth.map(item => item.userId))) } });

        // Count existing L1 users for the current month
        const l1CountCurrentMonth = existingL1UsersCurrentMonth.length;

        // Fetch existing L2 users for the current month
        const existingL2UsersCurrentMonth = await User_Model.find({ _id: { $in: Array.from(new Set(l2UsersCurrentMonth.map(item => item.userId))) } });

        // Count existing L2 users for the current month
        const l2CountCurrentMonth = existingL2UsersCurrentMonth.length;

        // Calculate total teams for the current month
        const TotalCountCurrentMonth = l1CountCurrentMonth + l2CountCurrentMonth;

        const totalIncome = USER.wallet;
        console.log("MyTotalIncome :- ", totalIncome);

        const level1totalIncome = USER.level1totalIncome;
        const level2totalIncome = USER.level2totalIncome;
        const downlineTotalIncome = USER.downlineTotalIncome;
        const PendingAmount = USER.pendingAmount;
        console.log("level1totalIncome :- ", level1totalIncome);
        console.log("level2totalIncome :- ", level2totalIncome);
        console.log("downlineTotalIncome :- ", downlineTotalIncome);
        console.log("PendingAmount :- ", PendingAmount);

        // =========================================================================

        return res.status(200).json({
            error_code: 200,
            message: "Dashboard data Fetch Successfully",
            ID: USER._id,
            UserName: USER.name,
            data: {
                TotalL1Referral: l1Count,
                TotalL2Referral: l2Count,
                MyTotalTeams: TotalCount,
                CurrentLevel: currentLevel,
                CurrentMonth: {
                    MonthlyL1Referral: l1CountCurrentMonth,
                    MonthlyL2Referral: l2CountCurrentMonth,
                    MonthlyTotalTeams: TotalCountCurrentMonth,
                    Month: currentMonth,
                    Year: currentYear,
                },
                MyTotalIncome: totalIncome,
                level1totalIncome: level1totalIncome,
                level2totalIncome: level2totalIncome,
                downlineTotalIncome: downlineTotalIncome,
                PendingAmount: PendingAmount,
            }
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error_code: 500, message: "Internal server error" });
    }
};



// -------------------------------------------------------



const MyTotalTeams = async (req, res) => {
    try {
        // Find the main user by ID
        const USER = await User_Model.findOne({
            _id: req.userId,
        });

        // If the user is not found, return an unauthorized response
        if (!USER) {
            console.log("Unauthorized - USER not found.");
            return res.status(401).json({ error_code: 401, message: "Unauthorized" });
        }

        // Function to validate if a user exists
        const isValidUser = async (userId) => {
            const user = await User_Model.findOne({ _id: userId });
            return !!user;
        };

        // Extract and validate L1 and L2 user IDs
        const l1Users = [];
        for (const item of USER.L1) {
            if (await isValidUser(item.userId)) {
                l1Users.push({ id: item.userId, name: item.name, level: "L1", createdAt: item.date });
            }
        }

        const l2Users = [];
        for (const item of USER.L2) {
            if (await isValidUser(item.userId)) {
                l2Users.push({ id: item.userId, name: item.name, level: "L2", createdAt: item.date });
            }
        }

        console.log("l1Users", l1Users);
        console.log("l2Users", l2Users);

        // Interleave the arrays of L1 and L2 teams
        const allUsers = [];
        const maxLength = Math.max(l1Users.length, l2Users.length);
        for (let i = 0; i < maxLength; i++) {
            if (l1Users[i]) allUsers.push(l1Users[i]);
            if (l2Users[i]) allUsers.push(l2Users[i]);
        }

        // Split the allUsers array into arrays of pairs
        const pairs = [];
        for (let i = 0; i < allUsers.length; i += 2) {
            pairs.push(allUsers.slice(i, i + 2));
        }

        // Construct the response with each pair enclosed within its own "Level" array
        const response = pairs.map(pair => ({ level: pair }));

        // Send the response
        return res.status(200).json({
            error_code: 200,
            message: "My Total Teams Successfully Retrieved",
            data: response
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error_code: 500, message: "Internal server error" });
    }
};





// -------------------------------------------------------


const L1TotalRefferral = async (req, res) => {
    try {
        const USER = await User_Model.findOne({
            _id: req.userId,
        });

        if (!USER) {
            console.log("Unauthorized - USER not found.");
            return res.status(401).json({ error_code: 401, message: "Unauthorized" });
        }

        // Extract L1 user IDs separately
        const l1UserIds = USER.L1.map(item => item.userId);

        // Fetch details of L1 users
        const l1Users = await User_Model.find({ _id: { $in: l1UserIds } });


        // Prepare response with L1 and L2 user details
        const response = {
            error_code: 200,
            message: "My Total L1 Refferral Successfully Retrieved",
            data: l1Users.map(user => ({ id: user._id, name: user.name, level: "L1", mobileNumber: user.mobileNumber, dateAndTime: user.createdAt })),
        };

        // Send the response
        return res.status(200).json(response);
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error_code: 500, message: "Internal server error" });
    }
};

// -------------------------------------------------------


const L2TotalRefferral = async (req, res) => {
    try {
        const USER = await User_Model.findOne({
            _id: req.userId,
        });

        if (!USER) {
            console.log("Unauthorized - USER not found.");
            return res.status(401).json({ error_code: 401, message: "Unauthorized" });
        }

        // Extract L2 user IDs separately
        const l2UserIds = USER.L2.map(item => item.userId);


        // Fetch details of L2 users
        const l2Users = await User_Model.find({ _id: { $in: l2UserIds } });

        // Prepare response with L1 and L2 user details
        const response = {
            error_code: 200,
            message: "My Total L2 Refferral Successfully Retrieved",
            data: l2Users.map(user => ({ id: user._id, name: user.name, level: "L2", mobileNumber: user.mobileNumber, dateAndTime: user.createdAt }))
        };

        // Send the response
        return res.status(200).json(response);
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error_code: 500, message: "Internal server error" });
    }
};

// -------------------------------------------------------




// const MonthlyMyTotalTeams = async (req, res) => {
//     try {
//         const { month, year } = req.body;

//         const USER = await User_Model.findOne({
//             _id: req.userId,
//         });
//         console.log(USER, "hiiiiiii")

//         if (!USER) {
//             console.log("Unauthorized - USER not found.");
//             return res.status(401).json({ error_code: 401, message: "Unauthorized" });
//         }

//         const extractUsersByMonthAndYear = (users, month, year) => {
//             return users.filter(item => {
//                 const userDate = new Date(Date.parse(item.date));
//                 const userMonth = userDate.getMonth() + 1; // Adjusting for zero-based index
//                 const userYear = userDate.getFullYear();

//                 console.log(userDate.toISOString(), "User Date:", item.name);
//                 console.log("User Month:", userMonth, "User Year:", userYear);
//                 console.log("Expected Month:", month, "Expected Year:", year);

//                 return userMonth === month && userYear === parseInt(year, 10);
//             }).map(item => ({ name: item.name, date: item.date, userId: item.userId }));
//         };

//         const l1UsersByMonthAndYear = extractUsersByMonthAndYear(USER.L1, parseInt(month, 10), parseInt(year, 10));
//         const l2UsersByMonthAndYear = extractUsersByMonthAndYear(USER.L2, parseInt(month, 10), parseInt(year, 10));

//         console.log(l1UsersByMonthAndYear, "hiiiiiii"),
//             console.log(l2UsersByMonthAndYear, "hiiiiiii")

//         // Send the response
//         return res.status(200).json({
//             error_code: 200,
//             message: `My Total Teams for ${month}/${year} Successfully Retrieved`,
//             data: {
//                 month, year,
//                 L1: l1UsersByMonthAndYear,
//                 L2: l2UsersByMonthAndYear
//             }
//         });
//     } catch (error) {
//         console.error("Error:", error);
//         return res.status(500).json({ error_code: 500, message: "Internal server error" });
//     }
// };


const MonthlyMyTotalTeams = async (req, res) => {
    try {
        const { month, year } = req.body;

        const USER = await User_Model.findOne({
            _id: req.userId,
        });

        if (!USER) {
            console.log("Unauthorized - USER not found.");
            return res.status(401).json({ error_code: 401, message: "Unauthorized" });
        }

        const extractUsersByMonthAndYear = (users, month, year) => {
            return users.filter(item => {
                const userDate = new Date(Date.parse(item.date));
                const userMonth = userDate.getMonth() + 1;
                const userYear = userDate.getFullYear();

                return userMonth === month && userYear === parseInt(year, 10);
            }).map(item => ({ name: item.name, date: item.date, userId: item.userId }));
        };

        const l1UsersByMonthAndYear = extractUsersByMonthAndYear(USER.L1, parseInt(month, 10), parseInt(year, 10));
        const l2UsersByMonthAndYear = extractUsersByMonthAndYear(USER.L2, parseInt(month, 10), parseInt(year, 10));

        // Count the number of teams in L1 and L2
        const l1TeamCount = l1UsersByMonthAndYear.length;
        const l2TeamCount = l2UsersByMonthAndYear.length;

        // Send the response
        return res.status(200).json({
            error_code: 200,
            message: `My Total Teams for ${month}/${year} Successfully Retrieved`,
            data: {
                month, year,
                L1: {
                    teams: l1UsersByMonthAndYear,
                    count: l1TeamCount
                },
                L2: {
                    teams: l2UsersByMonthAndYear,
                    count: l2TeamCount
                }
            }
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error_code: 500, message: "Internal server error" });
    }
};


// =======================================================



// ----------------------------------------------------------------


const currentLevelCount = async (req, res) => {
    try {
        const UserID = req.userId;
        console.log("UserID ", UserID);
        const USER = await User_Model.findById(UserID);

        if (!USER) {
            console.log("Unauthorized - USER not found.");
            return res.status(401).json({ error_code: 401, message: "Unauthorized" });
        }

        let levelCount = 0;
        let userInfos = []; // Array to store user IDs and names

        const findUserAbove = async (userId) => {
            const users = await User_Model.find({ referralById: userId });

            for (const user of users) {
                levelCount++;
                userInfos.push({ id: user._id, name: user.name }); // Store user ID and name
                await findUserAbove(user.myReferralId);
            }
        };
        await findUserAbove(USER.myReferralId);



        const totalCount = levelCount;

        console.log("Total count:", totalCount);

        let currentLevel;

        if (totalCount >= 0 && totalCount <= 250) {
            currentLevel = 1;
        } else if (totalCount <= 1000) {
            currentLevel = 2;
        } else if (totalCount <= 2500) {
            currentLevel = 3;
        } else if (totalCount <= 5000) {
            currentLevel = 4;
        } else if (totalCount <= 10000) {
            currentLevel = 5;
        } else if (totalCount <= 15000) {
            currentLevel = 6;
        } else {
            currentLevel = "Crown";
        }

        USER.currentLevel = currentLevel;
        USER.MyUnderTotalUser = totalCount;

        await USER.save();

        return res.status(200).json({
            error_code: 200,
            message: "User Under All User Count....!",
            ID: USER._id,
            UserName: USER.name,
            data: {
                MyUnderTotalUser: USER.MyUnderTotalUser,
                CurrentLevel: currentLevel,
            },
            // levelCount: levelCount,
            // userInfos: userInfos,

        });

    } catch (error) {
        console.error("Error fetching user data: ", error);
        res.status(500).json({ error_code: 500, message: "Internal Server Error" });
    }
};



// const currentLevelCount = async (req, res) => {
//     try {
//         const UserID = req.userId;
//         const USER = await User_Model.findById(UserID);

//         // If the user is not found, return an unauthorized response
//         if (!USER) {
//             console.log("Unauthorized - USER not found.");
//             return res.status(401).json({ error_code: 401, message: "Unauthorized" });
//         }

//         const mongoose = require('mongoose');

//         const countReferralsRecursive = async (userId, level, visitedUsers = new Set()) => {
//             // Check if the userId is a valid ObjectId
//             if (!mongoose.isValidObjectId(userId)) {
//                 return 0;
//             }

//             // Check if the user has already been visited to avoid counting the same user twice
//             if (visitedUsers.has(userId)) {
//                 return 0;
//             }
//             visitedUsers.add(userId);

//             let count = 1; // Count the current user
//             const user = await User_Model.findById(userId);
//             if (!user) {
//                 return 0; // If user not found, don't count it
//             }

//             // Iterate through the myReferralId field of the user
//             for (const referralId of user.myReferralId) {
//                 const referralUser = await User_Model.findOne({ myReferralId: referralId });
//                 if (!referralUser) {
//                     continue; // Skip if referral user not found
//                 }

//                 // Recursively count referrals for the current referral user
//                 count += await countReferralsRecursive(referralId, level - 1, visitedUsers);
//             }

//             return count;
//         };


//         const totalCount = await countReferralsRecursive(USER._id, 3);
//         console.log("Total count:", totalCount);

//         let currentLevel;

//         // Determine currentLevel based on totalCount range
//         if (totalCount >= 0 && totalCount <= 250) {
//             currentLevel = 1;
//         } else if (totalCount <= 1000) {
//             currentLevel = 2;
//         } else if (totalCount <= 2500) {
//             currentLevel = 3;
//         } else if (totalCount <= 5000) {
//             currentLevel = 4;
//         } else if (totalCount <= 10000) {
//             currentLevel = 5;
//         } else if (totalCount <= 15000) {
//             currentLevel = 6;
//         } else {
//             currentLevel = "Crown";
//         }

//         // Update the currentLevel field in the user document
//         USER.currentLevel = currentLevel;
//         USER.MyUnderTotalUser = totalCount;
//         await USER.save();

//         return res.status(200).json({
//             error_code: 200,
//             message: "User Under All User Count....!",
//             ID: USER._id,
//             UserName: USER.name,
//             data: {
//                 MyUnderTotalUser: USER.MyUnderTotalUser,
//                 CurrentLevel: currentLevel,
//             }
//         });
//     } catch (error) {
//         console.error("Error:", error);
//         return res.status(500).json({ error_code: 500, message: "Internal server error" });
//     }
// };





// =======================================================


// =======================================================

// const downLinerefferal = async (req, res) => {
//     try {
//         const userID = req.userId;
//         console.log("UserID ", userID);

//         // Function to find downline referrals recursively
//         const findDownlineReferrals = async (userIds, allReferrals = new Set()) => {
//             // Base case: No user IDs left to process
//             if (!userIds.length) {
//                 return allReferrals;
//             }

//             // Find users for the current batch of user IDs
//             const users = await User_Model.find({ _id: { $in: userIds } });

//             // Iterate through each user and extract their L1 and L2 referrals
//             for (const user of users) {
//                 // Extract L1 and L2 user IDs
//                 const l1UserIds = user.L1.map(l1 => l1.userId);
//                 const l2UserIds = user.L2.map(l2 => l2.userId);

//                 // Add L1 and L2 user IDs to allReferrals set
//                 l1UserIds.forEach(id => {
//                     allReferrals.add(id);
//                     console.log("Adding L1 user ID:", id);
//                 });
//                 l2UserIds.forEach(id => {
//                     allReferrals.add(id);
//                     console.log("Adding L2 user ID:", id);
//                 });

//                 // Recursively find downline referrals for L1 and L2 user IDs
//                 const nextLevelUserIds = [...l1UserIds, ...l2UserIds];
//                 await findDownlineReferrals(nextLevelUserIds, allReferrals);
//             }

//             return allReferrals;
//         };

//         // Find the initial user's L2 referrals
//         const user = await User_Model.findById(userID);
//         const initialUserIds = user.L2.map(l2 => l2.userId);

//         // Recursively find downline referrals starting from L2 referrals
//         const downlineReferralsSet = await findDownlineReferrals(initialUserIds);

//         // Convert set to array and filter out duplicates
//         const downlineReferrals = Array.from(downlineReferralsSet);
//         console.log("Downline Referrals (before filtering):", downlineReferrals);

//         // Filter out duplicates from the array
//         const uniqueDownlineReferrals = [...new Set(downlineReferrals)];
//         console.log("Downline Referrals (after filtering):", uniqueDownlineReferrals);

//         // Query User_Model to get details of unique downline referrals
//         const downlineReferralDetails = await User_Model.find({ _id: { $in: uniqueDownlineReferrals } })
//             .select('name id mobileNumber email createdAt');

//         return res.status(200).json({
//             error_code: 200,
//             message: "Downline referrals fetched successfully",
//             downlineReferrals: downlineReferralDetails,
//         });
//     } catch (error) {
//         console.error("Error:", error);
//         return res.status(500).json({ error_code: 500, message: "Internal server error" });
//     }
// };

// =======================================================

const downLinerefferal = async (req, res) => {
    try {
        const userID = req.body.id;
        console.log("UserID ", userID);

        // Find the user corresponding to the provided ID
        const user = await User_Model.findById(userID);

        if (!user) {
            return res.status(404).json({ error_code: 404, message: "User not found" });
        }

        // Extract L1 and L2 referrals from the user object
        const L1Referrals = user.L1.map(async l1 => {
            const referredUser = await User_Model.findById(l1.userId);
            return {
                L1: "L1",
                id: referredUser._id,
                name: referredUser.name,
                email: referredUser.email,
                mobile: referredUser.mobile,
                createdAt: referredUser.createdAt
            };
        });

        const L2Referrals = user.L2.map(async l2 => {
            const referredUser = await User_Model.findById(l2.userId);
            return {
                L2: "L2",
                id: referredUser._id,
                name: referredUser.name,
                email: referredUser.email,
                mobile: referredUser.mobile,
                createdAt: referredUser.createdAt
            };
        });

        // Resolve promises to get the actual data
        const resolvedL1Referrals = await Promise.all(L1Referrals);
        const resolvedL2Referrals = await Promise.all(L2Referrals);

        // Pair L1 and L2 referrals
        const referralPairs = [];
        for (let i = 0; i < Math.max(resolvedL1Referrals.length, resolvedL2Referrals.length); i++) {
            const pair = {
                L1: resolvedL1Referrals[i] || null,
                L2: resolvedL2Referrals[i] || null
            };
            referralPairs.push(pair);
        }

        return res.status(200).json({
            error_code: 200,
            message: "L1 and L2 referrals fetched successfully",
            referralPairs,
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error_code: 500, message: "Internal server error" });
    }
};



// =======================================================



// const MonthlydownLinerefferal = async (req, res) => {
//     try {
//         const { id, month, year } = req.body;

//         console.log("UserID ", id);

//         // Find the user corresponding to the provided ID
//         const user = await User_Model.findById(id);

//         if (!user) {
//             return res.status(404).json({ error_code: 404, message: "User not found" });
//         }

//         const extractUsersByMonthAndYear = async (users, month, year) => {
//             const filteredUsers = users.filter(item => {
//                 const userDate = new Date(item.date);
//                 const userMonth = userDate.getMonth() + 1;
//                 const userYear = userDate.getFullYear();

//                 return userMonth === month && userYear === parseInt(year, 10);
//             });

//             // Fetch additional user data for each user
//             const usersWithData = await Promise.all(filteredUsers.map(async item => {
//                 const user = await User_Model.findById(item.userId);
//                 return {
//                     id: user._id,
//                     name: user.name,
//                     email: user.email,
//                     mobileNumber: user.mobileNumber,
//                     dateAndTime: user.createdAt,
//                 };
//             }));

//             return usersWithData;
//         };

//         const l1UsersByMonthAndYear = await extractUsersByMonthAndYear(user.L1, parseInt(month, 10), parseInt(year, 10));
//         const l2UsersByMonthAndYear = await extractUsersByMonthAndYear(user.L2, parseInt(month, 10), parseInt(year, 10));

//         // Count the number of teams in L1 and L2
//         const l1TeamCount = l1UsersByMonthAndYear.length;
//         const l2TeamCount = l2UsersByMonthAndYear.length;

//         // Send the response
//         return res.status(200).json({
//             error_code: 200,
//             message: `My Total Teams for ${month}/${year} Successfully Retrieved`,
//             data: {
//                 month, year,
//                 L1: {
//                     level: l1UsersByMonthAndYear,
//                     L1count: l1TeamCount
//                 },
//                 L2: {
//                     level: l2UsersByMonthAndYear,
//                     L2count: l2TeamCount
//                 }
//             }
//         });
//     } catch (error) {
//         console.error("Error:", error);
//         return res.status(500).json({ error_code: 500, message: "Internal server error" });
//     }
// };


const MonthlydownLinerefferal = async (req, res) => {
    try {
        const { id, month, year } = req.body;

        console.log("UserID ", id);

        // Find the user corresponding to the provided ID
        const user = await User_Model.findById(id);

        if (!user) {
            return res.status(404).json({ error_code: 404, message: "User not found" });
        }

        const extractUsersByMonthAndYear = async (users, month, year) => {
            const filteredUsers = users.filter(item => {
                const userDate = new Date(item.date);
                const userMonth = userDate.getMonth() + 1;
                const userYear = userDate.getFullYear();

                return userMonth === month && userYear === parseInt(year, 10);
            });

            // Fetch additional user data for each user
            const usersWithData = await Promise.all(filteredUsers.map(async item => {
                const user = await User_Model.findById(item.userId);
                return {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    mobileNumber: user.mobileNumber,
                    dateAndTime: user.createdAt,
                };
            }));

            return usersWithData;
        };

        const l1UsersByMonthAndYear = await extractUsersByMonthAndYear(user.L1, parseInt(month, 10), parseInt(year, 10));
        const l2UsersByMonthAndYear = await extractUsersByMonthAndYear(user.L2, parseInt(month, 10), parseInt(year, 10));

        // Combine L1 and L2 data into pairs
        const pairs = l1UsersByMonthAndYear.map((l1, index) => ({
            L1: l1,
            L2: l2UsersByMonthAndYear[index] || null // If no corresponding L2 data exists, use null
        }));

        // Count the number of teams in L1 and L2
        const l1TeamCount = l1UsersByMonthAndYear.length;
        const l2TeamCount = l2UsersByMonthAndYear.length;

        // Send the response
        return res.status(200).json({
            error_code: 200,
            message: `My Total Teams for ${month}/${year} Successfully Retrieved`,
            data: {
                month, year,
                pairs,

                L1_Count: l1TeamCount,
                L2_Count: l2TeamCount,

            }
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error_code: 500, message: "Internal server error" });
    }
};




// =======================================================
// =======================================================


// const getMyTotalIncome = async (req, res) => {
//     try {
//         const USER = await User_Model.findOne({
//             _id: req.userId,
//         });

//         if (!USER) {
//             console.log("Unauthorized - USER not found.");
//             return res.status(401).json({ error_code: 401, message: "Unauthorized" });
//         }

//         const myTotalIncome = USER.wallet;
//         let incomeHistory = USER.incomeHistory;

//         // Sort income history by date in descending order (latest time first)
//         incomeHistory = incomeHistory.sort((a, b) => b.date - a.date);

//         return res.status(200).json({
//             error_code: 200,
//             message: "My Total Income",
//             myTotalIncome: myTotalIncome,
//             incomeHistory: incomeHistory,
//         });
//     } catch (error) {
//         console.error("Error:", error);
//         return res.status(500).json({ error_code: 500, message: "Internal server error" });
//     }
// };

// ----------------------------------------------------------------

const getMyTotalIncome = async (req, res) => {
    try {
        const USER = await User_Model.findOne({
            _id: req.userId,
        });

        if (!USER) {
            console.log("Unauthorized - USER not found.");
            return res.status(401).json({ error_code: 401, message: "Unauthorized" });
        }

        const myTotalIncome = USER.wallet;
        let incomeHistory = USER.incomeHistory;
        let paymentPendingHistory = USER.paymentPendingHistory;

        // Merge both incomeHistory and paymentPendingHistory into one array
        let combinedHistory = [...incomeHistory, ...paymentPendingHistory];

        // Sort the combined history by date in descending order (latest time first)
        combinedHistory = combinedHistory.sort((a, b) => b.date - a.date);

        return res.status(200).json({
            error_code: 200,
            message: "My Total Income",
            myTotalIncome: myTotalIncome,
            combinedHistory: combinedHistory
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error_code: 500, message: "Internal server error" });
    }
};



// ----------------------------------------------------------------



// const getAmountFromLevel = async (req, res) => {
//     try {
//         const USER = await User_Model.findOne({
//             _id: req.userId,
//         });

//         if (!USER) {
//             console.log("Unauthorized - USER not found.");
//             return res.status(401).json({ error_code: 401, message: "Unauthorized" });
//         }

//         const level1totalIncome = USER.level1totalIncome;
//         const level2totalIncome = USER.level2totalIncome;
//         const additionAmountlevel = Number(level1totalIncome) + Number(level2totalIncome)

//         let incomeHistory = USER.incomeHistory;

//         // Sort income history by date in descending order (latest time first)
//         incomeHistory = incomeHistory.sort((a, b) => b.date - a.date);

//         return res.status(200).json({
//             error_code: 200,
//             message: "My Total Income",
//             level1totalIncome: level1totalIncome,
//             level2totalIncome: level2totalIncome,
//             TotalAmountlevel: additionAmountlevel,
//             incomeHistory: incomeHistory,
//         });
//     } catch (error) {
//         console.error("Error:", error);
//         return res.status(500).json({ error_code: 500, message: "Internal server error" });
//     }
// };


const getAmountFromLevel = async (req, res) => {
    try {
        const USER = await User_Model.findOne({
            _id: req.userId,
        });

        if (!USER) {
            console.log("Unauthorized - USER not found.");
            return res.status(401).json({ error_code: 401, message: "Unauthorized" });
        }

        const myTotalIncome = USER.wallet;
        let incomeHistory = USER.incomeHistory;

        incomeHistory = incomeHistory.sort((a, b) => b.date - a.date);

        return res.status(200).json({
            error_code: 200,
            message: "My Total Level Income",
            myTotalIncome: myTotalIncome,
            incomeHistory: incomeHistory,
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error_code: 500, message: "Internal server error" });
    }
};



const getPendingAmount = async (req, res) => {
    try {
        const USER = await User_Model.findOne({
            _id: req.userId,
        });

        if (!USER) {
            console.log("Unauthorized - USER not found.");
            return res.status(401).json({ error_code: 401, message: "Unauthorized" });
        }
        const myTotalIncome = USER.wallet;

        const myTotalPendingIncome = USER.pendingAmount;
        let incomePendingHistory = USER.paymentPendingHistory;

        incomePendingHistory = incomePendingHistory.sort((a, b) => b.date - a.date);

        return res.status(200).json({
            error_code: 200,
            message: "My Total Pending Income",
            myTotalIncome: myTotalIncome,
            myTotalPendingIncome: myTotalPendingIncome,
            incomePendingHistory: incomePendingHistory,
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error_code: 500, message: "Internal server error" });
    }
};


// =======================================================


const getNotifications = async (req, res) => {
    try {
        const USER = await User_Model.findOne({
            _id: req.userId,
        });

        if (!USER) {
            console.log("Unauthorized - USER not found.");
            return res.status(401).json({ error_code: 401, message: "Unauthorized" });
        }

        let notificationInfo = USER.notificationInfo;

        // Sort notifications by date in descending order
        notificationInfo.sort((a, b) => new Date(a.date) - new Date(b.date));

        const notificationCount = notificationInfo.length;

        return res.status(200).json({
            error_code: 200,
            message: "My Notifications...!",
            notificationInfo: notificationInfo,
            count: notificationCount,
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error_code: 500, message: "Internal server error" });
    }
};



// =======================================================




const read_Notifications = async (req, res) => {
    try {
        const { notificationId } = req.body;

        const USER = await User_Model.findOne({
            _id: req.userId,
        });

        if (!USER) {
            console.log("Unauthorized - USER not found.");
            return res.status(401).json({ error_code: 401, message: "Unauthorized" });
        }

        // Find the notification by its ID
        const notification = USER.notificationInfo.find(notification => notification._id.toString() === notificationId);

        if (!notification) {
            return res.status(404).json({ error_code: 404, message: "Notification not found" });
        }

        // Toggle the 'read' field for the specified notification
        notification.read = notification.read === 0 ? 1 : 0;

        // Save the updated notificationInfo back to the user document
        await USER.save();

        return res.status(200).json({
            error_code: 200,
            message: "Notification marked as read / unread successfully",
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error_code: 500, message: "Internal server error" });
    }
};

// ====================================================

const withdrawMoney = async (req, res) => {
    try {
        // Find the user by userId
        const user = await User_Model.findOne({ _id: req.userId });

        // Check if user exists
        if (!user) {
            console.log("Unauthorized - User not found.");
            return res.status(401).json({ error_code: 401, message: "Unauthorized" });
        }

        // Perform withdrawal logic here
        const withdrawalAmount = req.body.amount;
        const tdsDeduction = req.body.tdsDeduction || 0;
        const netWithdrawalAmount = Number(withdrawalAmount) + Number(tdsDeduction);

        if (netWithdrawalAmount > user.wallet) {
            return res.status(400).json({ error_code: 400, message: "Insufficient balance" });
        }

        // Deduct the net withdrawal amount from the wallet
        user.wallet -= netWithdrawalAmount;

        // Create withdrawal transaction
        const withdrawalTransaction = {
            amount: -netWithdrawalAmount,
            userId: user._id,
            name: user.name,
            date: new Date(),
            message: `Withdrawal of ${withdrawalAmount} (TDS: ${tdsDeduction}) successful`,
            status: "Completed",
            WithdrawMoney: withdrawalAmount,
            tdsAmount: tdsDeduction,
            receivedAmount: withdrawalAmount - tdsDeduction,
        };
        user.incomeHistory.push(withdrawalTransaction);

        // Save the withdrawal transaction
        await user.save();

        // Function to send notification
        async function sendNotification(userId, titleMessage, message) {
            const user = await User_Model.findById(userId);
            if (user) {
                const notification = {
                    titleMessage: titleMessage,
                    messege: message,
                    read: 0,
                    date: new Date() // Added date to notification
                };
                user.notificationInfo.push(notification);
                await user.save();
                console.log(`Notification sent to user ${userId}: ${message}`);
            } else {
                console.error(`User with ID ${userId} not found`);
            }
        }

        // Send notification to the user about the withdrawal
        const notificationMessage = `You have successfully withdrawn ${withdrawalAmount} from your wallet. TDS Deduction: ${tdsDeduction}. Remaining Wallet Balance: ${user.wallet}.`;
        await sendNotification(user._id, "Withdrawal Successful", notificationMessage);

        // Add TDS report
        const tdsReport = {
            userId: user._id,
            userName: user.name,
            PancardNo: user.identityDetails.panCardNumber,
            GSTNo: user.identityDetails.gstNumber,
            WithdrawMoney: withdrawalAmount,
            tdsAmount: tdsDeduction,
            receivedAmount: withdrawalAmount - tdsDeduction,
            date: new Date(),
        };

        user.tdsReports.push(tdsReport);

        // Save the user with the updated TDS report
        await user.save();

        return res.status(200).json({
            error_code: 200,
            message: "Withdrawal successful",
            Data: {
                walletBalance: user.wallet,
                receivedMoney: withdrawalAmount - tdsDeduction,
            }
        });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error_code: 500, message: "Internal server error" });
    }
};



// ===================================================================================

const axios = require('axios');
const crypto = require('crypto');

// Environment variables
const phonePeHostUrl = process.env.PHONE_PE_HOST_URL;
const merchantId = process.env.MERCHANT_ID;
const saltIndex = process.env.SALT_INDEX;
const saltKey = process.env.SALT_KEY;

// Helper function to generate SHA-256 hash
function generateHash(body) {
    const hash = crypto.createHash('sha256');
    hash.update(body + "/v3/transaction/initiate" + saltKey);
    return hash.digest('base64');
}

// Payment function in the controller
const pay = async (req, res) => {
    try {
        const { amount, customerId, merchantOrderId, callbackUrl, mobileNumber } = req.body;

        const paymentData = {
            merchantId,
            merchantTransactionId: merchantOrderId,
            merchantUserId: customerId,
            amount: amount * 100, // Convert to paisa
            redirectUrl: callbackUrl,
            redirectMode: 'POST',
            callbackUrl,
            mobileNumber, // Optional
            paymentInstrument: {
                type: 'PAY_PAGE',
            },
        };

        const body = JSON.stringify(paymentData);
        const checksum = generateHash(body);

        const options = {
            method: 'post',
            url: `${phonePeHostUrl}/v3/transaction/initiate`,
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': `${checksum}###${saltIndex}`,
            },
            data: paymentData,
        };

        const response = await axios.request(options);
        if (response.data.success) {
            res.status(200).json({
                success: true,
                data: response.data,
            });
        } else {
            res.status(500).json({
                success: false,
                message: response.data.message,
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};










// ====================================================================================

module.exports = {

    getDashboardUser,
    MyTotalTeams,
    L1TotalRefferral,
    L2TotalRefferral,
    MonthlyMyTotalTeams,
    currentLevelCount,
    downLinerefferal,
    MonthlydownLinerefferal,
    getMyTotalIncome,
    withdrawMoney,
    getAmountFromLevel,
    getPendingAmount,
    getNotifications,
    read_Notifications,
    pay,
}


