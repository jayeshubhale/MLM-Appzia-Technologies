const GenerateBill = require('../model/GenrateBillModel');
const SA_Model = require("../model/SM_SA_Model");
const User_Model = require("../model/UserModel");
const TDS_Model = require("../model/AddTDSModel");


const createBill = async (req, res) => {
    try {
        const SA = await SA_Model.findOne({
            _id: req.userId,
            adminType: "SA"
        });

        if (!SA) {
            console.log("Unauthorized - SA not found.");
            return res.status(401).json({ error_code: 401, message: "Unauthorized" });
        }

        const { month, addExpense } = req.body;

        // Validate request body for month
        if (!month) {
            return res.json({ error_code: 400, message: 'Month is required' });
        }

        // Validate request body for addExpense
        if (!Array.isArray(addExpense) || addExpense.length === 0) {
            return res.json({ error_code: 400, message: 'At least one expense item is required' });
        }

        const expenses = addExpense.map(item => ({
            expenseType: item.expenseType,
            expenseAmount: item.expenseAmount
        }));

        const newBill = new GenerateBill({ month, addExpense: expenses });

        // Save the bill
        await newBill.save();

        // Store the generated bill ID under the respective SA
        if (!SA.GenerateBillID) {
            SA.GenerateBillID = []; // Initialize the array if not exists
        }
        SA.GenerateBillID.push(newBill._id); // Add the new bill ID to the array
        await SA.save();

        res.status(200).json({ error_code: 200, message: 'Bill created successfully', data: newBill });
    } catch (error) {
        console.error('Error creating bill:', error);
        res.status(500).json({ error_code: 500, message: 'Internal server error' });
    }
}


// -------------------------------------------------------------------


const deleteBill = async (req, res) => {
    try {
        const SA = await SA_Model.findOne({
            _id: req.userId,
            adminType: "SA"
        });

        if (!SA) {
            console.log("Unauthorized - SA not found.");
            return res.status(401).json({ error_code: 401, message: "Unauthorized" });
        }

        const billId = req.params.id;

        // Check if billId is provided
        if (!billId) {
            return res.json({ error_code: 400, message: 'Bill ID is required' });
        }

        // Find bill by ID and delete
        const deletedBill = await GenerateBill.findByIdAndDelete(billId);

        // Check if bill exists
        if (!deletedBill) {
            return res.status(404).json({ error_code: 404, message: 'Bill not found' });
        }

        // Remove the deleted bill ID from the SA's GenerateBillID array if it exists
        if (SA.GenerateBillID && SA.GenerateBillID.includes(billId)) {
            SA.GenerateBillID = SA.GenerateBillID.filter(id => id.toString() !== billId);
            await SA.save();
        }

        res.status(200).json({
            error_code: 200, message: 'Bill deleted successfully',
            // data: deletedBill
        });
    } catch (error) {
        console.error('Error deleting bill:', error);
        res.status(500).json({ error_code: 500, message: 'Internal server error' });
    }
};


// -------------------------------------------------------------------



// const getAllBills = async (req, res) => {
//     try {
//         const SA = await SA_Model.findOne({
//             _id: req.userId,
//             adminType: "SA"
//         });

//         if (!SA) {
//             console.log("Unauthorized - SA not found.");
//             return res.status(401).json({ error_code: 401, message: "Unauthorized" });
//         }

//         // Retrieve all bills associated with the SA
//         const allBills = await GenerateBill.find({ _id: { $in: SA.GenerateBillID } });

//         res.status(200).json({
//             error_code: 200,
//             message: 'All bills retrieved successfully',
//             data: allBills
//         });
//     } catch (error) {
//         console.error('Error retrieving all bills:', error);
//         res.status(500).json({
//             error_code: 500,
//             message: 'Internal server error'
//         });
//     }
// };

const getAllBills = async (req, res) => {
    try {
        const SA = await SA_Model.findOne({
            _id: req.userId,
            adminType: "SA"
        });

        if (!SA) {
            console.log("Unauthorized - SA not found.");
            return res.status(401).json({ error_code: 401, message: "Unauthorized" });
        }

        // Retrieve all bills associated with the SA
        const allBills = await GenerateBill.find({ _id: { $in: SA.GenerateBillID } });

        // Calculate BillAmount for each record
        const billsWithAmount = allBills.map(bill => {
            const totalExpenseAmount = bill.addExpense.reduce((total, expense) => {
                return total + parseFloat(expense.expenseAmount);
            }, 0);
            return {
                ...bill.toObject(),
                BillAmount: totalExpenseAmount
            };
        });

        res.status(200).json({
            error_code: 200,
            message: 'All bills retrieved successfully',
            data: billsWithAmount
        });
    } catch (error) {
        console.error('Error retrieving all bills:', error);
        res.status(500).json({
            error_code: 500,
            message: 'Internal server error'
        });
    }
};



// -------------------------------------------------------------------


const getBillById = async (req, res) => {
    try {
        const billId = req.params.id;

        // Check if billId is provided
        if (!billId) {
            return res.status(400).json({ error_code: 400, message: 'Bill ID is required' });
        }

        // Find bill by ID
        const bill = await GenerateBill.findById(billId);

        // Check if bill exists
        if (!bill) {
            return res.status(404).json({ error_code: 404, message: 'Bill not found' });
        }

        res.status(200).json({ error_code: 200, message: 'Bill retrieved successfully', data: bill });
    } catch (error) {
        console.error('Error retrieving bill by ID:', error);
        res.status(500).json({ error_code: 500, message: 'Internal server error' });
    }
};


// -------------------------------------------------------------------



const addOrUpdateTDS = async (req, res) => {
    try {
        const { tdsAmount } = req.body;

        if (tdsAmount === undefined) {
            return res.status(400).json({ error_code: 400, message: 'TDS amount is required' });
        }

        let tdsRecord = await TDS_Model.findOne();

        if (tdsRecord) {
            // Update existing TDS record
            tdsRecord.tdsAmount = tdsAmount;
            await tdsRecord.save();
            res.status(200).json({ error_code: 200, message: 'TDS updated successfully', data: tdsRecord });
        } else {
            // Create new TDS record
            const newTDS = new TDS_Model({ tdsAmount });
            await newTDS.save();
            res.status(200).json({ error_code: 200, message: 'TDS created successfully', data: newTDS });
        }
    } catch (error) {
        console.error('Error creating or updating TDS:', error);
        res.status(500).json({ error_code: 500, message: 'Internal server error' });
    }
};




const getTDS = async (req, res) => {
    try {
        const tdsRecords = await TDS_Model.find();

        res.status(200).json({ error_code: 200, message: 'TDS Amount', data: tdsRecords });
    } catch (error) {
        console.error('Error retrieving TDS records:', error);
        res.status(500).json({ error_code: 500, message: 'Internal server error' });
    }
};



// ===========================================================
// ===========================================================

const getAll_tdsReports = async (req, res) => {
    try {
        const user = await User_Model.findOne({
            _id: req.userId,
        });

        if (!user) {
            console.log("Unauthorized - user not found.");
            return res.status(401).json({ error_code: 401, message: "Unauthorized" });
        }

        // Get the TDS reports and their count
        const tdsReports = user.tdsReports;
        const reportsCount = tdsReports.length;

        // Return the TDS reports along with the count
        return res.status(200).json({
            error_code: 200,
            message: "TDS reports retrieved successfully",
            reportsCount,
            tdsReports,
        });
    } catch (error) {
        console.error("Error fetching TDS reports:", error);
        return res.status(500).json({ error_code: 500, message: "Internal server error" });
    }
};


// ===========================================================


const FilterBy_Month_tdsReports = async (req, res) => {
    try {
        const { month, year } = req.body;

        if (!month) {
            return res.status(400).json({ error_code: 400, message: "Month is required" });
        }
        if (!year) {
            return res.status(400).json({ error_code: 400, message: "Year is required" });
        }

        const user = await User_Model.findOne({
            _id: req.userId,
        });

        if (!user) {
            console.log("Unauthorized - user not found.");
            return res.status(401).json({ error_code: 401, message: "Unauthorized" });
        }

        const currentLevel = user.currentLevel;
        const TotalRefferral = user.MyUnderTotalUser;

        // Get the TDS reports and filter by month and year
        const tdsReports = user.tdsReports.filter(report => {
            const reportDate = new Date(report.date); // Assuming 'date' is the field containing the date in your report object
            return reportDate.getMonth() + 1 === parseInt(month) && reportDate.getFullYear() === parseInt(year);
        });

        const reportsCount = tdsReports.length;

        // Return the filtered TDS reports along with the count
        return res.status(200).json({
            error_code: 200,
            message: "TDS reports retrieved successfully",
            currentLevel,
            TotalRefferral,
            reportsCount,
            tdsReports,
        });
    } catch (error) {
        console.error("Error fetching TDS reports:", error);
        return res.status(500).json({ error_code: 500, message: "Internal server error" });
    }
};


// ----------------------------------------------------------



// =========================================================================================


// const FilterByWeekfrom_Month_tdsReports = async (req, res) => {
//     try {
//         const { month, year } = req.body;

//         if (!month) {
//             return res.status(400).json({ error_code: 400, message: "Month is required" });
//         }
//         if (!year) {
//             return res.status(400).json({ error_code: 400, message: "Year is required" });
//         }

//         const user = await User_Model.findOne({
//             _id: req.userId,
//         });

//         if (!user) {
//             console.log("Unauthorized - user not found.");
//             return res.status(401).json({ error_code: 401, message: "Unauthorized" });
//         }

//         // Get the TDS reports and filter by month and year
//         const tdsReports = user.tdsReports.filter(report => {
//             const reportDate = new Date(report.date); // Assuming 'date' is the field containing the date in your report object
//             return reportDate.getMonth() + 1 === parseInt(month) && reportDate.getFullYear() === parseInt(year);
//         });

//         // console.log("Filtered TDS Reports:", tdsReports);

//         // Group the TDS reports by week within the month
//         const groupedReports = {};
//         tdsReports.forEach(report => {
//             const reportDate = new Date(report.date);
//             const weekNumber = getWeekNumberInMonth(reportDate);
//             if (!groupedReports[`Week ${weekNumber}`]) {
//                 groupedReports[`Week ${weekNumber}`] = [];
//             }
//             groupedReports[`Week ${weekNumber}`].push(report);
//         });

//         // console.log("Grouped Reports:", groupedReports);

// // ---------------------------------------------





//         return res.status(200).json({
//             error_code: 200,
//             message: "TDS reports retrieved successfully",
//             currentLevel: user.currentLevel,
//             TotalRefferral: user.MyUnderTotalUser,
//             groupedReports,

//         });
//     } catch (error) {
//         console.error("Error fetching TDS reports:", error);
//         return res.status(500).json({ error_code: 500, message: "Internal server error" });
//     }
// };

// // Function to get the week number within the month for a given date
// function getWeekNumberInMonth(date) {
//     const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
//     const endOfWeek = new Date(startOfMonth);
//     endOfWeek.setDate(endOfWeek.getDate() + 6);

//     let weekNumber = 1;
//     while (endOfWeek < date) {
//         weekNumber++;
//         startOfMonth.setDate(startOfMonth.getDate() + 7);
//         endOfWeek.setDate(endOfWeek.getDate() + 7);
//     }

//     return weekNumber;
// }


// =========================================================================================

// const FilterByWeekfrom_Month_tdsReports = async (req, res) => {
//     try {
//         const { month, year } = req.body;

//         if (!month) {
//             return res.status(400).json({ error_code: 400, message: "Month is required" });
//         }
//         if (!year) {
//             return res.status(400).json({ error_code: 400, message: "Year is required" });
//         }

//         const user = await User_Model.findOne({
//             _id: req.userId,
//         });

//         if (!user) {
//             console.log("Unauthorized - user not found.");
//             return res.status(401).json({ error_code: 401, message: "Unauthorized" });
//         }

//         // Get the TDS reports and filter by month and year
//         const tdsReports = user.tdsReports.filter(report => {
//             const reportDate = new Date(report.date); // Assuming 'date' is the field containing the date in your report object
//             return reportDate.getMonth() + 1 === parseInt(month) && reportDate.getFullYear() === parseInt(year);
//         });

//         // Group the TDS reports by week within the month
//         const groupedReports = {};
//         tdsReports.forEach(report => {
//             const reportDate = new Date(report.date);
//             const weekNumber = getWeekNumberInMonth(reportDate);
//             if (!groupedReports[`Week ${weekNumber}`]) {
//                 groupedReports[`Week ${weekNumber}`] = {
//                     reports: [],
//                     totalWithdrawMoney: 0,
//                     totalTdsAmount: 0,
//                     totalReceivedAmount: 0
//                 };
//             }
//             groupedReports[`Week ${weekNumber}`].reports.push(report);
//             groupedReports[`Week ${weekNumber}`].totalWithdrawMoney += report.WithdrawMoney;
//             groupedReports[`Week ${weekNumber}`].totalTdsAmount += report.tdsAmount;
//             groupedReports[`Week ${weekNumber}`].totalReceivedAmount += report.receivedAmount;
//         });

//         // Return the grouped TDS reports along with the count and monthly totals
//         return res.status(200).json({
//             error_code: 200,
//             message: "TDS reports retrieved successfully",
//             currentLevel: user.currentLevel,
//             TotalRefferral: user.MyUnderTotalUser,
//             groupedReports
//         });
//     } catch (error) {
//         console.error("Error fetching TDS reports:", error);
//         return res.status(500).json({ error_code: 500, message: "Internal server error" });
//     }
// };
// Function to get the week number within the month for a given date
// function getWeekNumberInMonth(date) {
//     const day = date.getDate();
//     return Math.ceil(day / 7);
// }

// =========================================================================================

// Function to get the week number within the month for a given date
function getWeekNumberInMonth(date) {
    const day = date.getDate();
    return Math.ceil(day / 7);
}

const FilterByWeekfrom_Month_tdsReports = async (req, res) => {
    try {
        const { month, year } = req.body;

        if (!month) {
            return res.status(400).json({ error_code: 400, message: "Month is required" });
        }
        if (!year) {
            return res.status(400).json({ error_code: 400, message: "Year is required" });
        }

        const user = await User_Model.findOne({
            _id: req.userId,
        });

        if (!user) {
            console.log("Unauthorized - user not found.");
            return res.status(401).json({ error_code: 401, message: "Unauthorized" });
        }

        // Get the TDS reports and filter by month and year
        const tdsReports = user.tdsReports.filter(report => {
            const reportDate = new Date(report.date); // Assuming 'date' is the field containing the date in your report object
            return reportDate.getMonth() + 1 === parseInt(month) && reportDate.getFullYear() === parseInt(year);
        });

        // Group the TDS reports by week within the month and calculate monthly totals
        const groupedReports = {};
        let totalWithdrawMoney = 0;
        let totalTdsAmount = 0;
        let totalReceivedAmount = 0;
        let weeksPresent = new Set();
        let lastReportDate = null;

        tdsReports.forEach(report => {
            const reportDate = new Date(report.date);
            const weekNumber = getWeekNumberInMonth(reportDate);
            weeksPresent.add(`Week ${weekNumber}`);
            if (!groupedReports[`Week ${weekNumber}`]) {
                groupedReports[`Week ${weekNumber}`] = {
                    reports: [],
                    totalWithdrawMoney: 0,
                    totalTdsAmount: 0,
                    totalReceivedAmount: 0
                };
            }
            groupedReports[`Week ${weekNumber}`].reports.push(report);
            groupedReports[`Week ${weekNumber}`].totalWithdrawMoney += report.WithdrawMoney;
            groupedReports[`Week ${weekNumber}`].totalTdsAmount += report.tdsAmount;
            groupedReports[`Week ${weekNumber}`].totalReceivedAmount += report.receivedAmount;

            // Update monthly totals
            totalWithdrawMoney += report.WithdrawMoney;
            totalTdsAmount += report.tdsAmount;
            totalReceivedAmount += report.receivedAmount;

            // Update the last report date
            if (!lastReportDate || reportDate > lastReportDate) {
                lastReportDate = reportDate;
            }
        });

        // Calculate the total number of weeks present
        const totalWeekCount = weeksPresent.size;

        // Return the grouped TDS reports along with the count and monthly totals
        return res.status(200).json({
            error_code: 200,
            message: "TDS reports retrieved successfully",
            totalWeekCount,
            TotalRefferral: user.MyUnderTotalUser,
            monthly: {
                userName: user.name,
                panCardNo: user.identityDetails.panCardNumber,
                gstNo: user.identityDetails.gstNumber,
                currentLevel: user.currentLevel,
                totalWeek: Array.from(weeksPresent).join(", "),
                endDateAndTime: lastReportDate,
                totalWithdrawMoney,
                totalTdsAmount,
                totalReceivedAmount,
            },
            groupedReports,

        });
    } catch (error) {
        console.error("Error fetching TDS reports:", error);
        return res.status(500).json({ error_code: 500, message: "Internal server error" });
    }
};




// -------------------------------------------------------------------------------







module.exports = {
    createBill,
    deleteBill,
    getAllBills,
    getBillById,
    addOrUpdateTDS,
    getTDS,
    getAll_tdsReports,
    FilterBy_Month_tdsReports,
    FilterByWeekfrom_Month_tdsReports,
};








