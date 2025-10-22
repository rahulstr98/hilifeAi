const ExpenseReminder = require("../../../model/modules/expense/ExpenseReminderModel");
const Expense = require("../../../model/modules/expense/expenses");
const ErrorHandler = require("../../../utils/errorhandler");
const catchAsyncErrors = require("../../../middleware/catchAsyncError");
const SchedulePayment = require("../../../model/modules/account/otherpayment");
const moment = require("moment");


exports.bulkPayExpense = catchAsyncErrors(async (req, res, next) => {
  const { method, ids, updateData } = req.body; // Extract method, ids, and update data from request body

  if (!Array.isArray(ids) || ids.length === 0) {
    return next(new ErrorHandler("Invalid or missing IDs", 400));
  }

  if (method === "get") {
    // Handle 'get' method to fetch all expenses for the given IDs
    const expenses = await Expense.find({ _id: { $in: ids } }, { files: 0 });
    if (!expenses || expenses.length === 0) {
      return next(new ErrorHandler("Expense not found", 404));
    }
    return res.status(200).json({ expenses });
  } else if (method === "put") {
    // Handle 'put' method to update expenses
    if (!updateData || typeof updateData !== "object") {
      return next(new ErrorHandler("Invalid or missing update data", 400));
    }

    // Update all expenses with the provided update data
    await Expense.updateMany(
      { _id: { $in: ids } },
      { $set: updateData }
    );

    return res.status(200).json({ message: "Expense updated successfully" });
  } else {
    // Invalid method
    return next(new ErrorHandler("Invalid method. Use 'get' or 'put'", 400));
  }
});
exports.bulkPaySchedulePayment = catchAsyncErrors(async (req, res, next) => {
  const { method, ids, updateData } = req.body; // Extract method, ids, and update data from request body

  if (!Array.isArray(ids) || ids.length === 0) {
    return next(new ErrorHandler("Invalid or missing IDs", 400));
  }

  if (method === "get") {
    // Handle 'get' method to fetch all expenses for the given IDs
    const expenses = await SchedulePayment.find({ _id: { $in: ids } }, {
      billsdocument: 0,
      receiptdocument: 0
    });
    if (!expenses || expenses.length === 0) {
      return next(new ErrorHandler("SchedulePayment not found", 404));
    }
    return res.status(200).json({ expenses });
  } else if (method === "put") {
    // Handle 'put' method to update expenses
    if (!updateData || typeof updateData !== "object") {
      return next(new ErrorHandler("Invalid or missing update data", 400));
    }

    // Update all expenses with the provided update data
    await SchedulePayment.updateMany(
      { _id: { $in: ids } },
      { $set: updateData }
    );

    return res.status(200).json({ message: "SchedulePayment updated successfully" });
  } else {
    // Invalid method
    return next(new ErrorHandler("Invalid method. Use 'get' or 'put'", 400));
  }
});

exports.getPaidNotPaidDatas = catchAsyncErrors(async (req, res, next) => {
  try {
    let finaldata;
    const { source, frequency, paidstatus, assignbranch, company, branch, unit } = req.body;
    if (source === "Expense") {
      // Check if arrays are empty and fallback to assignbranch if they are
      const companiesToFilter =
        company.length > 0
          ? company
          : assignbranch.map((branchObj) => branchObj.company);
      const branchesToFilter =
        branch.length > 0
          ? branch
          : assignbranch.map((branchObj) => branchObj.branch);
      const unitsToFilter =
        unit.length > 0 ? unit : assignbranch.map((branchObj) => branchObj.unit);

      // Construct the branch filter based on the filtered values
      const branchFilter = {
        $or: assignbranch
          .map((branchObj) => {
            const isOthersCompany = branchObj.company === "Others";

            return {
              company: companiesToFilter.includes(branchObj.company)
                ? branchObj.company
                : null,
              branch: isOthersCompany
                ? ""
                : branchesToFilter.includes(branchObj.branch)
                  ? branchObj.branch
                  : null,
              unit: isOthersCompany
                ? ""
                : unitsToFilter.includes(branchObj.unit)
                  ? branchObj.unit
                  : null,
            };
          })
          .filter(
            (obj) => obj.company && obj.branch !== null && obj.unit !== null
          ),


      };



      if (req.body.dateFilter) {
        const { fromdate, todate } = req.body.dateFilter;

        // Ensure both dates are provided and valid
        if (fromdate && todate) {
          // Add date filter to the query (for string-based date comparison)

          branchFilter.$and = [
            {
              date: {
                $gte: fromdate, // Compare as strings
                $lte: todate,
              },
            },
            ...(frequency?.length > 0 && [{
              vendorfrequency: { $in: frequency }
            }]),
            {
              paidstatus: { $in: paidstatus }
            }
          ];
        }
      }

      finaldata = await Expense.find(branchFilter, {
        files: 0
      });
    } else {
      // Check if arrays are empty and fallback to assignbranch if they are
      const companiesToFilter =
        company.length > 0
          ? company
          : assignbranch.map((branchObj) => branchObj.company);
      const branchesToFilter =
        branch.length > 0
          ? branch
          : assignbranch.map((branchObj) => branchObj.branch);

      const branchFilter = {
        $or: assignbranch
          .map((branchObj) => {

            return {
              company: companiesToFilter.includes(branchObj.company)
                ? branchObj.company
                : null,
              branchname: branchesToFilter.includes(branchObj.branch)
                ? branchObj.branch
                : null,
            };
          })
          .filter(
            (obj) => obj.company && obj.branchname !== null && obj.unit !== null
          ),
      };

      if (req.body.dateFilter) {
        const { fromdate, todate } = req.body.dateFilter;

        // Ensure both dates are provided and valid
        if (fromdate && todate) {
          // Add date filter to the query (for string-based date comparison)

          branchFilter.$and = [
            {
              billdate: {
                $gte: fromdate, // Compare as strings
                $lte: todate,
              },
            },
            ...(frequency?.length > 0 && [{
              vendorfrequency: { $in: frequency }
            }]),
            {
              paidstatus: { $in: paidstatus }
            }
          ];
        }
      }

      finaldata = await SchedulePayment.find(branchFilter, {
        billsdocument: 0,
        receiptdocument: 0
      });
    }
    return res.status(200).json({
      finaldata,
    });

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
});

exports.getPaymentDueReminder = catchAsyncErrors(async (req, res, next) => {
  try {
    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    const { vendorfrequency, filterdates, filteryear, assignbranch, frequency, fromdate, todate, vendorid, includeothers } = req.body;

    console.log(req.body, "req.body")
    const branchFilterExpenseWithOutOther = assignbranch.map((branchObj) => ({
      branch: branchObj.branch,
      company: branchObj.company,
      unit: branchObj.unit,
    }));
    const branchFilterExpense = [...branchFilterExpenseWithOutOther, ...(includeothers && [{ company: "Others", branch: "", unit: "" }])]

    const branchFilterSchedulePayment = assignbranch.map((branchObj) => ({
      branchname: branchObj.branch,
      company: branchObj.company,
    }));

    // if (vendorfrequency === "Daily") {


    const dateAndBillStatusFilter = {
      $and: [
        { vendorfrequency: { $in: frequency } },
        ...(req.body?.vendorid ? [{ vendorid: { $in: [req.body.vendorid] } }] : []),
        {
          $or: [
            {
              $and: [
                { duedate: { $exists: true, $ne: "" } }, // duedate exists and is not empty
                {
                  duedate: {
                    $gte: moment(fromdate, "YYYY-MM-DD").format("YYYY-MM-DD"), // duedate >= fromdate
                    $lte: moment(todate, "YYYY-MM-DD").format("YYYY-MM-DD"),   // duedate <= todate
                  },
                },
              ],
            },
            {
              $and: [
                {
                  $or: [
                    { duedate: { $exists: false } }, // duedate field doesn't exist
                    { duedate: "" },                 // duedate is empty
                  ],
                },
                {
                  date: {
                    $gte: moment(fromdate, "YYYY-MM-DD").format("YYYY-MM-DD"), // date >= fromdate
                    $lte: moment(todate, "YYYY-MM-DD").format("YYYY-MM-DD"),   // date <= todate
                  },
                },
              ],
            },
          ],
        },
        {
          $or: [
            { billstatus: "InComplete" },
            { billstatus: "Partially Paid" },
          ],
        },
      ],
    };


    const filterQueryExpense = {
      $and: [{ $or: branchFilterExpense }, dateAndBillStatusFilter],
    };

    const shcedulePaymentDailyFilter = {
      $and: [
        { vendorfrequency: { $in: frequency } },
        ...(req.body?.vendorid ? [{ vendorid: { $in: [req.body.vendorid] } }] : []),
        { receiptdate: { $exists: true, $ne: "" } }, // receiptdate exists and is not empty
        {
          receiptdate: {
            $gte: moment(fromdate, "YYYY-MM-DD").format("YYYY-MM-DD"), // receiptdate >= fromdate
            $lte: moment(todate, "YYYY-MM-DD").format("YYYY-MM-DD"),   // receiptdate <= todate
          },
        },
        // { paidstatus: "Not Paid" },
        {
          $or: [
            { paidbillstatus: "InComplete" },
            { paidbillstatus: "Partially Paid" },
          ],
        },
      ],
    };


    const filterQuerySchedulePayment = {
      $and: [
        { $or: branchFilterSchedulePayment },
        shcedulePaymentDailyFilter,
      ],
    };

    const expense = await Expense.find(filterQueryExpense, { files: 0 });

    const schedulePaymentData = await SchedulePayment.find(
      filterQuerySchedulePayment, {
      billsdocument: 0,
      receiptdocument: 0
    }
    );
    const totalData = [...expense, ...schedulePaymentData];

    const finaldata = totalData.map((item, index) => {
      let scheduledamount = item?.paidbillstatus !== "Partially Paid"
        ? item?.dueamount
        : (Number(item?.dueamount) - Number(item?.paidamount || 0))
      return {
        _id: item._id,
        serialNumber: index + 1,
        vendor:
          item?.vendorname == undefined ? item?.vendor : item?.vendorname,
        currdate:
          item?.duedate == undefined
            ? moment(item?.receiptdate, "YYYY-MM-DD").format("DD-MM-YYYY")
            : item?.duedate === ""
              ? moment(item?.date, "YYYY-MM-DD").format("DD-MM-YYYY")
              : moment(item?.duedate, "YYYY-MM-DD").format("DD-MM-YYYY"),

        // currdate:
        //   item?.duedate == undefined
        //     ? moment(item?.receiptdate).format("DD-MM-YYYY")
        //     : moment(item?.duedate).format("DD-MM-YYYY"),
        vendorfrequency:
          item?.vendorfrequency == undefined
            ? item?.frequency
            : item?.vendorfrequency,
        amount:
          item?.source === "Scheduled Payment" ? scheduledamount
            : item?.billstatus == "Partially Paid"
              ? item.balanceamount
              : item?.totalbillamount,
        source: item?.source,
        expensetotal: item?.expensetotal,
        billno: item?.billno == undefined ? item?.referenceno : item?.billno,
        vendorid: item?.vendorid,
        filteredfrom: "Daily",
        assignbranch,
        filterdates: filterdates,
        frequency, fromdate, todate
      };
    });

    return res.status(200).json({
      expensereminder: finaldata,
    });
    // }
    //  else if (vendorfrequency === "Weekly") {
    //   if (filterdates === "") {
    //     const currentWeekStartDate = moment(currentDate, "YYYY-MM-DD")
    //       .startOf("week")
    //       .format("YYYY-MM-DD");
    //     const currentWeekEndDate = moment(currentDate, "YYYY-MM-DD")
    //       .endOf("week")
    //       .format("YYYY-MM-DD");

    //     //

    //     const dateAndBillStatusFilterOne = {
    //       $and: [
    //         // { vendorfrequency: vendorfrequency },
    //         { duedate: { $exists: true, $ne: "" } },
    //         {
    //           $or: [
    //             { billstatus: "InComplete" },
    //             { billstatus: "Partially Paid" },
    //           ],
    //         },
    //       ],
    //     };

    //     const filterQueryExpenseOne = {
    //       $and: [{ $or: branchFilterExpense }, dateAndBillStatusFilterOne],
    //     };

    //     const dateAndBillStatusFilterTwo = {
    //       $and: [
    //         // { vendorfrequency: vendorfrequency },
    //         { duedate: { $exists: true, $eq: "" } },
    //         {
    //           $or: [
    //             { billstatus: "InComplete" },
    //             { billstatus: "Partially Paid" },
    //           ],
    //         },
    //       ],
    //     };

    //     const filterQueryExpenseTwo = {
    //       $and: [{ $or: branchFilterExpense }, dateAndBillStatusFilterTwo],
    //     };

    //     const shcedulePaymentDailyFilter = {
    //       $and: [
    //         // { vendorfrequency: vendorfrequency },
    //         { receiptdate: { $exists: true, $ne: "" } },
    //         { paidstatus: "Not Paid" },
    //       ],
    //     };

    //     const filterQuerySchedulePayment = {
    //       $and: [
    //         { $or: branchFilterSchedulePayment },
    //         shcedulePaymentDailyFilter,
    //       ],
    //     };

    //     //

    //     const expense = await Expense.find(filterQueryExpenseOne);

    //     const expensetwo = await Expense.find(filterQueryExpenseTwo);
    //     const updatedDataOne = expense.filter((tp) => {
    //       return moment(tp.duedate, "YYYY-MM-DD").isBetween(
    //         currentWeekStartDate,
    //         currentWeekEndDate,
    //         undefined,
    //         "[]"
    //       );
    //     });
    //     const updatedDataTwo = expensetwo.filter((tp) => {
    //       return moment(tp.date, "YYYY-MM-DD").isBetween(
    //         currentWeekStartDate,
    //         currentWeekEndDate,
    //         undefined,
    //         "[]"
    //       );
    //     });

    //     const schedulePaymentData = await SchedulePayment.find(
    //       filterQuerySchedulePayment
    //     );

    //     const updatedDataScheduleOne = schedulePaymentData.filter((tp) => {
    //       return moment(tp.receiptdate, "YYYY-MM-DD").isBetween(
    //         currentWeekStartDate,
    //         currentWeekEndDate,
    //         undefined,
    //         "[]"
    //       );
    //     });

    //     const totalData = [
    //       ...updatedDataOne,
    //       ...updatedDataTwo,
    //       ...updatedDataScheduleOne,
    //     ];

    //     const finaldata = totalData.map((item, index) => {
    //       return {
    //         _id: item._id,
    //         serialNumber: index + 1,
    //         vendor:
    //           item?.vendorname == undefined ? item?.vendor : item?.vendorname,
    //         currdate:
    //           item?.duedate == undefined
    //             ? moment(item?.receiptdate, "YYYY-MM-DD").format("DD-MM-YYYY")
    //             : item?.duedate === ""
    //               ? moment(item?.date, "YYYY-MM-DD").format("DD-MM-YYYY")
    //               : moment(item?.duedate, "YYYY-MM-DD").format("DD-MM-YYYY"),
    //         vendorfrequency:
    //           item?.vendorfrequency == undefined
    //             ? item?.frequency
    //             : item?.vendorfrequency,
    //         amount:
    //           item?.billstatus == undefined
    //             ? item?.dueamount
    //             : item?.billstatus == "Partially Paid"
    //               ? item.balanceamount
    //               : item?.totalbillamount,
    //         source: item?.source,
    //         expensetotal: item?.expensetotal,
    //         billno:
    //           item?.billno == undefined ? item?.referenceno : item?.billno,
    //         vendorid: item?.vendorid,
    //         filteredfrom: "Weekly",
    //         filterdates: filterdates,
    //       };
    //     });


    //     return res.status(200).json({
    //       expensereminder: finaldata,
    //     });
    //   } else {
    //     const currentWeekStartDate = filterdates;
    //     const currentWeekEndDate = moment(filterdates, "YYYY-MM-DD")
    //       .add(6, "days")
    //       .format("YYYY-MM-DD");

    //     //

    //     const dateAndBillStatusFilterOne = {
    //       $and: [
    //         // { vendorfrequency: vendorfrequency },
    //         { duedate: { $exists: true, $ne: "" } },
    //         {
    //           $or: [
    //             { billstatus: "InComplete" },
    //             { billstatus: "Partially Paid" },
    //           ],
    //         },
    //       ],
    //     };

    //     const filterQueryExpenseOne = {
    //       $and: [{ $or: branchFilterExpense }, dateAndBillStatusFilterOne],
    //     };

    //     const dateAndBillStatusFilterTwo = {
    //       $and: [
    //         // { vendorfrequency: vendorfrequency },
    //         { duedate: { $exists: true, $eq: "" } },
    //         {
    //           $or: [
    //             { billstatus: "InComplete" },
    //             { billstatus: "Partially Paid" },
    //           ],
    //         },
    //       ],
    //     };

    //     const filterQueryExpenseTwo = {
    //       $and: [{ $or: branchFilterExpense }, dateAndBillStatusFilterTwo],
    //     };

    //     const shcedulePaymentDailyFilter = {
    //       $and: [
    //         // { vendorfrequency: vendorfrequency },
    //         { receiptdate: { $exists: true, $ne: "" } },
    //         { paidstatus: "Not Paid" },
    //       ],
    //     };

    //     const filterQuerySchedulePayment = {
    //       $and: [
    //         { $or: branchFilterSchedulePayment },
    //         shcedulePaymentDailyFilter,
    //       ],
    //     };

    //     //

    //     const expense = await Expense.find(filterQueryExpenseOne);

    //     const expensetwo = await Expense.find(filterQueryExpenseTwo);
    //     const updatedDataOne = expense.filter((tp) => {
    //       return moment(tp.duedate, "YYYY-MM-DD").isBetween(
    //         currentWeekStartDate,
    //         currentWeekEndDate,
    //         undefined,
    //         "[]"
    //       );
    //     });
    //     const updatedDataTwo = expensetwo.filter((tp) => {
    //       return moment(tp.date, "YYYY-MM-DD").isBetween(
    //         currentWeekStartDate,
    //         currentWeekEndDate,
    //         undefined,
    //         "[]"
    //       );
    //     });

    //     const schedulePaymentData = await SchedulePayment.find(
    //       filterQuerySchedulePayment
    //     );

    //     const updatedDataScheduleOne = schedulePaymentData.filter((tp) => {
    //       return moment(tp.receiptdate, "YYYY-MM-DD").isBetween(
    //         currentWeekStartDate,
    //         currentWeekEndDate,
    //         undefined,
    //         "[]"
    //       );
    //     });

    //     const totalData = [
    //       ...updatedDataOne,
    //       ...updatedDataTwo,
    //       ...updatedDataScheduleOne,
    //     ];

    //     const finaldata = totalData.map((item, index) => {
    //       return {
    //         _id: item._id,
    //         serialNumber: index + 1,
    //         vendor:
    //           item?.vendorname == undefined ? item?.vendor : item?.vendorname,
    //         currdate:
    //           item?.duedate == undefined
    //             ? moment(item?.receiptdate, "YYYY-MM-DD").format("DD-MM-YYYY")
    //             : item?.duedate === ""
    //               ? moment(item?.date, "YYYY-MM-DD").format("DD-MM-YYYY")
    //               : moment(item?.duedate, "YYYY-MM-DD").format("DD-MM-YYYY"),
    //         vendorfrequency:
    //           item?.vendorfrequency == undefined
    //             ? item?.frequency
    //             : item?.vendorfrequency,
    //         amount:
    //           item?.billstatus == undefined
    //             ? item?.dueamount
    //             : item?.billstatus == "Partially Paid"
    //               ? item.balanceamount
    //               : item?.totalbillamount,
    //         source: item?.source,
    //         expensetotal: item?.expensetotal,
    //         billno:
    //           item?.billno == undefined ? item?.referenceno : item?.billno,
    //         vendorid: item?.vendorid,
    //         filteredfrom: "Weekly",
    //         filterdates: filterdates,
    //       };
    //     });

    //     return res.status(200).json({
    //       expensereminder: finaldata,
    //     });
    //   }
    // } else if (vendorfrequency === "Monthly") {
    //   const dateAndBillStatusFilterOne = {
    //     $and: [
    //       // { vendorfrequency: vendorfrequency },
    //       { duedate: { $exists: true, $ne: "" } },
    //       // { duedate: { $lte: moment(currentDate).format("YYYY-MM-DD") } },
    //       {
    //         $or: [
    //           { billstatus: "InComplete" },
    //           { billstatus: "Partially Paid" },
    //         ],
    //       },
    //     ],
    //   };

    //   const filterQueryExpenseOne = {
    //     $and: [{ $or: branchFilterExpense }, dateAndBillStatusFilterOne],
    //   };

    //   const dateAndBillStatusFilterTwo = {
    //     $and: [
    //       // { vendorfrequency: vendorfrequency },
    //       { duedate: { $exists: true, $eq: "" } },
    //       {
    //         $or: [
    //           { billstatus: "InComplete" },
    //           { billstatus: "Partially Paid" },
    //         ],
    //       },
    //     ],
    //   };

    //   const filterQueryExpenseTwo = {
    //     $and: [{ $or: branchFilterExpense }, dateAndBillStatusFilterTwo],
    //   };

    //   const shcedulePaymentDailyFilter = {
    //     $and: [
    //       // { vendorfrequency: vendorfrequency },
    //       { receiptdate: { $exists: true, $ne: "" } },
    //       // { receiptdate: { $eq: moment(currentDate).format("YYYY-MM-DD") } },
    //       { paidstatus: "Not Paid" },
    //     ],
    //   };

    //   const filterQuerySchedulePayment = {
    //     $and: [
    //       { $or: branchFilterSchedulePayment },
    //       shcedulePaymentDailyFilter,
    //     ],
    //   };

    //   const expense = await Expense.find(filterQueryExpenseOne);

    //   const expensetwo = await Expense.find(filterQueryExpenseTwo);
    //   const updatedDataOne = expense.filter((tp) => {
    //     const expenseMonth = moment(tp.duedate, "YYYY-MM-DD").format("MM");
    //     const expenseYear = moment(tp.duedate, "YYYY-MM-DD").format("YYYY");
    //     return expenseMonth === filterdates && expenseYear === filteryear;
    //   });

    //   // const updatedDataTwo = expensetwo
    //   //   .map((tp) => {
    //   //     tp.date = moment(tp.date, "YYYY-MM-DD")
    //   //       .add(1, "months")
    //   //       .format("YYYY-MM-DD");
    //   //     return tp;
    //   //   })
    //   //   .filter((tp) => {
    //   //     return moment(currentDate, "YYYY-MM-DD").isSameOrBefore(
    //   //       tp.date,
    //   //       "day"
    //   //     );
    //   //   });

    //   const updatedDataTwo = expensetwo.filter((tp) => {
    //     const expenseMonth = moment(tp.date, "YYYY-MM-DD").format("MM");
    //     const expenseYear = moment(tp.date, "YYYY-MM-DD").format("YYYY");
    //     return expenseMonth === filterdates && expenseYear === filteryear;
    //   });

    //   const schedulePaymentData = await SchedulePayment.find(
    //     filterQuerySchedulePayment
    //   );

    //   const updatedDataScheduleOne = schedulePaymentData.filter((tp) => {
    //     const expenseMonth = moment(tp.receiptdate, "YYYY-MM-DD").format("MM");
    //     const expenseYear = moment(tp.receiptdate, "YYYY-MM-DD").format("YYYY");
    //     return expenseMonth === filterdates && expenseYear === filteryear;
    //   });

    //   const totalData = [
    //     ...updatedDataOne,
    //     ...updatedDataTwo,
    //     ...updatedDataScheduleOne,
    //   ];

    //   const finaldata = totalData.map((item, index) => {
    //     return {
    //       _id: item._id,
    //       serialNumber: index + 1,
    //       vendor:
    //         item?.vendorname == undefined ? item?.vendor : item?.vendorname,
    //       currdate:
    //         item?.duedate == undefined
    //           ? moment(item?.receiptdate, "YYYY-MM-DD").format("DD-MM-YYYY")
    //           : item?.duedate === ""
    //             ? moment(item?.date, "YYYY-MM-DD").format("DD-MM-YYYY")
    //             : moment(item?.duedate, "YYYY-MM-DD").format("DD-MM-YYYY"),
    //       vendorfrequency:
    //         item?.vendorfrequency == undefined
    //           ? item?.frequency
    //           : item?.vendorfrequency,
    //       amount:
    //         item?.billstatus == undefined
    //           ? item?.dueamount
    //           : item?.billstatus == "Partially Paid"
    //             ? item.balanceamount
    //             : item?.totalbillamount,
    //       source: item?.source,
    //       expensetotal: item?.expensetotal,
    //       billno: item?.billno == undefined ? item?.referenceno : item?.billno,
    //       vendorid: item?.vendorid,
    //       filteredfrom: "Monthly",
    //       filterdates: filterdates,
    //       filteryear: filteryear,
    //     };
    //   });

    //   return res.status(200).json({
    //     expensereminder: finaldata,
    //   });
    // } else if (vendorfrequency === "BillWise") {
    //   // const expense = await Expense.find({
    //   //   $and: [
    //   //     // { vendorfrequency: vendorfrequency },
    //   //     { duedate: { $exists: true, $ne: "" } },
    //   //     { duedate: { $eq: moment(currentDate).format("YYYY-MM-DD") } },
    //   //     {
    //   //       $or: [
    //   //         { billstatus: "InComplete" },
    //   //         { billstatus: "Partially Paid" },
    //   //       ],
    //   //     },
    //   //   ],
    //   // });

    //   const expense = await Expense.find({
    //     $and: [
    //       // { vendorfrequency: vendorfrequency },
    //       {
    //         $or: [
    //           {
    //             $and: [
    //               {
    //                 duedate: { $exists: true, $ne: "" }, // duedate exists and is not empty
    //                 duedate: moment(currentDate, "YYYY-MM-DD").format(
    //                   "YYYY-MM-DD"
    //                 ), // duedate equals currentDate
    //               },
    //             ],
    //           },
    //           {
    //             $and: [
    //               {
    //                 $or: [
    //                   { duedate: { $exists: false } }, // duedate field doesn't exist
    //                   { duedate: "" }, // duedate is empty
    //                 ],
    //               },
    //               {
    //                 date: moment(currentDate, "YYYY-MM-DD").format(
    //                   "YYYY-MM-DD"
    //                 ), // date equals currentDate
    //               },
    //             ],
    //           },
    //         ],
    //       },
    //       {
    //         $or: [
    //           { billstatus: "InComplete" },
    //           { billstatus: "Partially Paid" },
    //         ],
    //       },
    //     ],
    //   });

    //   const schedulePaymentData = await SchedulePayment.find({
    //     $and: [
    //       // { vendorfrequency: vendorfrequency },
    //       { receiptdate: { $exists: true, $ne: "" } },
    //       {
    //         receiptdate: {
    //           $eq: moment(currentDate, "YYYY-MM-DD").format("YYYY-MM-DD"),
    //         },
    //       },
    //       { paidstatus: "Not Paid" },
    //     ],
    //   });

    //   const totalData = [...expense, ...schedulePaymentData];

    //   const finaldata = totalData.map((item, index) => {
    //     return {
    //       _id: item._id,
    //       serialNumber: index + 1,
    //       vendor:
    //         item?.vendorname == undefined ? item?.vendor : item?.vendorname,
    //       // currdate:
    //       //   item?.duedate == undefined
    //       //     ? moment(item?.receiptdate).format("DD-MM-YYYY")
    //       //     : moment(item?.duedate).format("DD-MM-YYYY"),
    //       currdate:
    //         item?.duedate == undefined
    //           ? moment(item?.receiptdate, "YYYY-MM-DD").format("DD-MM-YYYY")
    //           : item?.duedate === ""
    //             ? moment(item?.date, "YYYY-MM-DD").format("DD-MM-YYYY")
    //             : moment(item?.duedate, "YYYY-MM-DD").format("DD-MM-YYYY"),

    //       vendorfrequency:
    //         item?.vendorfrequency == undefined
    //           ? item?.frequency
    //           : item?.vendorfrequency,
    //       amount:
    //         item?.billstatus == undefined
    //           ? item?.dueamount
    //           : item?.billstatus == "Partially Paid"
    //             ? item.balanceamount
    //             : item?.totalbillamount,
    //       expensetotal: item?.expensetotal,
    //       source: item?.source,
    //       billno: item?.billno == undefined ? item?.referenceno : item?.billno,
    //       vendorid: item?.vendorid,
    //       filteredfrom: "BillWise",
    //       filterdates: filterdates,
    //     };
    //   });

    //   return res.status(200).json({
    //     expensereminder: finaldata,
    //   });
    // }
  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
});


exports.getAllReminder = catchAsyncErrors(async (req, res, next) => {
  try {
    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    const { filterdates, assignbranch, frequency, fromdate, todate, includeothers } = req.body;

    console.log(req.body, "req.body")
    const branchFilterExpenseWithOutOther = assignbranch.map((branchObj) => ({
      branch: branchObj.branch,
      company: branchObj.company,
      unit: branchObj.unit,
    }));
    const branchFilterExpense = [...branchFilterExpenseWithOutOther, ...(includeothers && [{ company: "Others", branch: "", unit: "" }])]

    const branchFilterSchedulePayment = assignbranch.map((branchObj) => ({
      branchname: branchObj.branch,
      company: branchObj.company,
    }));

    // if (vendorfrequency === "Daily") {


    const dateAndBillStatusFilter = {
      $and: [
        { vendorfrequency: { $in: frequency } },
        ...(req.body?.vendorid ? [{ vendorid: { $in: [req.body.vendorid] } }] : []),
        {
          $or: [
            {
              $and: [
                { duedate: { $exists: true, $ne: "" } }, // duedate exists and is not empty
                {
                  duedate: {
                    $gte: moment(fromdate, "YYYY-MM-DD").format("YYYY-MM-DD"), // duedate >= fromdate
                    $lte: moment(todate, "YYYY-MM-DD").format("YYYY-MM-DD"),   // duedate <= todate
                  },
                },
              ],
            },
            {
              $and: [
                {
                  $or: [
                    { duedate: { $exists: false } }, // duedate field doesn't exist
                    { duedate: "" },                 // duedate is empty
                  ],
                },
                {
                  date: {
                    $gte: moment(fromdate, "YYYY-MM-DD").format("YYYY-MM-DD"), // date >= fromdate
                    $lte: moment(todate, "YYYY-MM-DD").format("YYYY-MM-DD"),   // date <= todate
                  },
                },
              ],
            },
          ],
        },
        // {
        //   $or: [
        //     { billstatus: "InComplete" },
        //     { billstatus: "Partially Paid" },
        //   ],
        // },
      ],
    };


    const filterQueryExpense = {
      $and: [{ $or: branchFilterExpense }, dateAndBillStatusFilter],
    };

    const shcedulePaymentDailyFilter = {
      $and: [
        { vendorfrequency: { $in: frequency } },
        ...(req.body?.vendorid ? [{ vendorid: { $in: [req.body.vendorid] } }] : []),
        { receiptdate: { $exists: true, $ne: "" } }, // receiptdate exists and is not empty
        {
          receiptdate: {
            $gte: moment(fromdate, "YYYY-MM-DD").format("YYYY-MM-DD"), // receiptdate >= fromdate
            $lte: moment(todate, "YYYY-MM-DD").format("YYYY-MM-DD"),   // receiptdate <= todate
          },
        },
        // { paidstatus: "Not Paid" },
        // {
        //   $or: [
        //     { paidbillstatus: "InComplete" },
        //     { paidbillstatus: "Partially Paid" },
        //   ],
        // },
      ],
    };


    const filterQuerySchedulePayment = {
      $and: [
        { $or: branchFilterSchedulePayment },
        shcedulePaymentDailyFilter,
      ],
    };

    const expense = await Expense.find(filterQueryExpense, { files: 0 });

    const schedulePaymentData = await SchedulePayment.find(
      filterQuerySchedulePayment, {
      billsdocument: 0,
      receiptdocument: 0
    }
    );
    const totalData = [...expense, ...schedulePaymentData];

    const finaldata = totalData.map((item, index) => {
      let scheduledamount = item?.paidbillstatus === "Partially Paid"
        ? (Number(item?.dueamount) - Number(item?.paidamount || 0))
        : item?.paidbillstatus === "Completed"
          ? (Number(item?.dueamount) - Number(item?.paidamount || 0))
          : (Number(item?.dueamount) - Number(item?.paidamount || 0))
      return {
        _id: item._id,
        serialNumber: index + 1,
        vendor:
          item?.vendorname == undefined ? item?.vendor : item?.vendorname,
        currdate:
          item?.duedate == undefined
            ? moment(item?.receiptdate, "YYYY-MM-DD").format("DD-MM-YYYY")
            : item?.duedate === ""
              ? moment(item?.date, "YYYY-MM-DD").format("DD-MM-YYYY")
              : moment(item?.duedate, "YYYY-MM-DD").format("DD-MM-YYYY"),

        // currdate:
        //   item?.duedate == undefined
        //     ? moment(item?.receiptdate).format("DD-MM-YYYY")
        //     : moment(item?.duedate).format("DD-MM-YYYY"),
        vendorfrequency:
          item?.vendorfrequency == undefined
            ? item?.frequency
            : item?.vendorfrequency,
        amount:
          item?.source === "Scheduled Payment"
            ? scheduledamount
            : item?.billstatus == "Partially Paid"
              ? item.balanceamount
              : item?.billstatus == "Completed"
                ? Number(item.balanceamount || 0)
                : item?.totalbillamount,
        source: item?.source,
        expensetotal: item?.expensetotal,
        billno: item?.billno == undefined ? item?.referenceno : item?.billno,
        vendorid: item?.vendorid,
        filteredfrom: "Daily",
        assignbranch,
        filterdates: filterdates,
        frequency, fromdate, todate,
        finalbillstatus: item?.billstatus == "Completed" || item?.paidbillstatus == "Completed"
      };
    });

    return res.status(200).json({
      expensereminder: finaldata,
    });

  } catch (err) {
    return next(new ErrorHandler("Records not found!", 404));
  }
});
// exports.getAllReminder = catchAsyncErrors(async (req, res, next) => {
//   try {
//     const currentDate = new Date();
//     const currentDay = currentDate.getDay();
//     const { vendorfrequency, filterdates, filteryear, assignbranch } = req.body;

//     const branchFilterExpense = assignbranch.map((branchObj) => ({
//       branch: branchObj.branch,
//       company: branchObj.company,
//       unit: branchObj.unit,
//     }));

//     const branchFilterSchedulePayment = assignbranch.map((branchObj) => ({
//       branchname: branchObj.branch,
//       company: branchObj.company,
//     }));

//     if (vendorfrequency === "Daily") {
//       const dateAndBillStatusFilter = {
//         $and: [
//           // { vendorfrequency: vendorfrequency },
//           { duedate: { $exists: true, $ne: "" } },
//           { duedate: { $eq: filterdates } },
//           {
//             $or: [
//               { billstatus: "InComplete" },
//               { billstatus: "Partially Paid" },
//             ],
//           },
//         ],
//       };

//       const filterQueryExpense = {
//         $and: [{ $or: branchFilterExpense }, dateAndBillStatusFilter],
//       };

//       const shcedulePaymentDailyFilter = {
//         $and: [
//           // { vendorfrequency: vendorfrequency },
//           {
//             billdate: { $exists: true, $ne: "" },
//           },
//           {
//             billdate: {
//               $eq: moment(filterdates, "YYYY-MM-DD").format("YYYY-MM-DD"),
//             },
//           },
//           { paidstatus: "Not Paid" },
//         ],
//       };

//       const filterQuerySchedulePayment = {
//         $and: [
//           { $or: branchFilterSchedulePayment },
//           shcedulePaymentDailyFilter,
//         ],
//       };

//       const expense = await Expense.find(filterQueryExpense, { files: 0 });

//       const schedulePaymentData = await SchedulePayment.find(
//         filterQuerySchedulePayment, {
//         billsdocument: 0,
//         receiptdocument: 0
//       }
//       );

//       const totalData = [...expense, ...schedulePaymentData];

//       const finaldata = totalData.map((item, index) => {
//         return {
//           _id: item._id,
//           serialNumber: index + 1,
//           vendor:
//             item?.vendorname == undefined ? item?.vendor : item?.vendorname,
//           currdate:
//             item?.date == undefined
//               ? moment(item?.billdate, "YYYY-MM-DD").format("DD-MM-YYYY")
//               : moment(item?.date, "YYYY-MM-DD").format("DD-MM-YYYY"),
//           vendorfrequency:
//             item?.vendorfrequency == undefined
//               ? item?.frequency
//               : item?.vendorfrequency,
//           amount:
//             item?.billstatus == undefined
//               ? item?.dueamount
//               : item?.billstatus == "Partially Paid"
//                 ? item.balanceamount
//                 : item?.totalbillamount,
//           source: item?.source,
//           expensetotal: item?.expensetotal,
//           billno: item?.billno == undefined ? item?.referenceno : item?.billno,
//           vendorid: item?.vendorid,
//           filteredfrom: "Daily",
//           filterdates: filterdates,
//         };
//       });

//       return res.status(200).json({
//         expensereminder: finaldata,
//       });
//     } else if (vendorfrequency === "Weekly") {
//       if (filterdates === "") {
//         const currentWeekStartDate = moment(currentDate, "YYYY-MM-DD")
//           .startOf("week")
//           .format("YYYY-MM-DD");
//         const currentWeekEndDate = moment(currentDate, "YYYY-MM-DD")
//           .endOf("week")
//           .format("YYYY-MM-DD");

//         const dateAndBillStatusFilter = {
//           $and: [
//             // { vendorfrequency: vendorfrequency },
//             { duedate: { $exists: true, $ne: "" } },
//             {
//               $or: [
//                 { billstatus: "InComplete" },
//                 { billstatus: "Partially Paid" },
//               ],
//             },
//           ],
//         };

//         const filterQueryExpense = {
//           $and: [{ $or: branchFilterExpense }, dateAndBillStatusFilter],
//         };

//         const shcedulePaymentDailyFilter = {
//           $and: [
//             // { vendorfrequency: vendorfrequency },
//             { billdate: { $exists: true, $ne: "" } },
//             { paidstatus: "Not Paid" },
//           ],
//         };

//         const filterQuerySchedulePayment = {
//           $and: [
//             { $or: branchFilterSchedulePayment },
//             shcedulePaymentDailyFilter,
//           ],
//         };

//         const expense = await Expense.find(filterQueryExpense, { files: 0 });

//         const updatedDataOne = expense.filter((tp) => {
//           return moment(tp.date, "YYYY-MM-DD").isBetween(
//             currentWeekStartDate,
//             currentWeekEndDate,
//             undefined,
//             "[]"
//           );
//         });

//         const schedulePaymentData = await SchedulePayment.find(
//           filterQuerySchedulePayment, {
//           billsdocument: 0,
//           receiptdocument: 0
//         }
//         );

//         const updatedDataScheduleOne = schedulePaymentData.filter((tp) => {
//           return moment(tp.billdate, "YYYY-MM-DD").isBetween(
//             currentWeekStartDate,
//             currentWeekEndDate,
//             undefined,
//             "[]"
//           );
//         });

//         const totalData = [...updatedDataOne, ...updatedDataScheduleOne];

//         const finaldata = totalData.map((item, index) => {
//           return {
//             _id: item._id,
//             serialNumber: index + 1,
//             vendor:
//               item?.vendorname == undefined ? item?.vendor : item?.vendorname,
//             currdate:
//               item?.date == undefined
//                 ? moment(item?.billdate, "YYYY-MM-DD").format("DD-MM-YYYY")
//                 : moment(item?.date, "YYYY-MM-DD").format("DD-MM-YYYY"),
//             vendorfrequency:
//               item?.vendorfrequency == undefined
//                 ? item?.frequency
//                 : item?.vendorfrequency,
//             amount:
//               item?.billstatus == undefined
//                 ? item?.dueamount
//                 : item?.billstatus == "Partially Paid"
//                   ? item.balanceamount
//                   : item?.totalbillamount,
//             expensetotal: item?.expensetotal,
//             source: item?.source,
//             billno:
//               item?.billno == undefined ? item?.referenceno : item?.billno,
//             vendorid: item?.vendorid,
//             filteredfrom: "Weekly",
//             filterdates: filterdates,
//           };
//         });

//         return res.status(200).json({
//           expensereminder: finaldata,
//         });
//       } else {
//         const currentWeekStartDate = filterdates;
//         const currentWeekEndDate = moment(filterdates, "YYYY-MM-DD")
//           .add(6, "days")
//           .format("YYYY-MM-DD");

//         const dateAndBillStatusFilter = {
//           $and: [
//             // { vendorfrequency: vendorfrequency },
//             { duedate: { $exists: true, $ne: "" } },
//             {
//               $or: [
//                 { billstatus: "InComplete" },
//                 { billstatus: "Partially Paid" },
//               ],
//             },
//           ],
//         };

//         const filterQueryExpense = {
//           $and: [{ $or: branchFilterExpense }, dateAndBillStatusFilter],
//         };

//         const shcedulePaymentDailyFilter = {
//           $and: [
//             // { vendorfrequency: vendorfrequency },
//             { billdate: { $exists: true, $ne: "" } },
//             { paidstatus: "Not Paid" },
//           ],
//         };

//         const filterQuerySchedulePayment = {
//           $and: [
//             { $or: branchFilterSchedulePayment },
//             shcedulePaymentDailyFilter,
//           ],
//         };

//         const expense = await Expense.find(filterQueryExpense, { files: 0 });

//         const updatedDataOne = expense.filter((tp) => {
//           return moment(tp.date, "YYYY-MM-DD").isBetween(
//             currentWeekStartDate,
//             currentWeekEndDate,
//             undefined,
//             "[]"
//           );
//         });

//         const schedulePaymentData = await SchedulePayment.find(
//           filterQuerySchedulePayment, {
//           billsdocument: 0,
//           receiptdocument: 0
//         }
//         );

//         const updatedDataScheduleOne = schedulePaymentData.filter((tp) => {
//           return moment(tp.billdate, "YYYY-MM-DD").isBetween(
//             currentWeekStartDate,
//             currentWeekEndDate,
//             undefined,
//             "[]"
//           );
//         });

//         const totalData = [...updatedDataOne, ...updatedDataScheduleOne];

//         const finaldata = totalData.map((item, index) => {
//           return {
//             _id: item._id,
//             serialNumber: index + 1,
//             vendor:
//               item?.vendorname == undefined ? item?.vendor : item?.vendorname,
//             currdate:
//               item?.date == undefined
//                 ? moment(item?.billdate, "YYYY-MM-DD").format("DD-MM-YYYY")
//                 : moment(item?.date, "YYYY-MM-DD").format("DD-MM-YYYY"),
//             vendorfrequency:
//               item?.vendorfrequency == undefined
//                 ? item?.frequency
//                 : item?.vendorfrequency,
//             amount:
//               item?.billstatus == undefined
//                 ? item?.dueamount
//                 : item?.billstatus == "Partially Paid"
//                   ? item.balanceamount
//                   : item?.totalbillamount,
//             expensetotal: item?.expensetotal,
//             source: item?.source,
//             billno:
//               item?.billno == undefined ? item?.referenceno : item?.billno,
//             vendorid: item?.vendorid,
//             filteredfrom: "Weekly",
//             filterdates: filterdates,
//           };
//         });

//         return res.status(200).json({
//           expensereminder: finaldata,
//         });
//       }
//     } else if (vendorfrequency === "Monthly") {
//       const dateAndBillStatusFilter = {
//         $and: [
//           // { vendorfrequency: vendorfrequency },
//           { duedate: { $exists: true, $ne: "" } },
//           // { duedate: { $lte: moment(currentDate).format("YYYY-MM-DD") } },
//           {
//             $or: [
//               { billstatus: "InComplete" },
//               { billstatus: "Partially Paid" },
//             ],
//           },
//         ],
//       };

//       const filterQueryExpense = {
//         $and: [{ $or: branchFilterExpense }, dateAndBillStatusFilter],
//       };

//       const shcedulePaymentDailyFilter = {
//         $and: [
//           // { vendorfrequency: vendorfrequency },
//           { billdate: { $exists: true, $ne: "" } },
//           // { receiptdate: { $eq: moment(currentDate).format("YYYY-MM-DD") } },
//           { paidstatus: "Not Paid" },
//         ],
//       };

//       const filterQuerySchedulePayment = {
//         $and: [
//           { $or: branchFilterSchedulePayment },
//           shcedulePaymentDailyFilter,
//         ],
//       };

//       const expense = await Expense.find(filterQueryExpense, { files: 0 });

//       const updatedDataOne = expense.filter((tp) => {
//         const expenseMonth = moment(tp.date, "YYYY-MM-DD").format("MM");
//         const expenseYear = moment(tp.date, "YYYY-MM-DD").format("YYYY");
//         return expenseMonth === filterdates && expenseYear === filteryear;
//       });

//       // const updatedDataTwo = expensetwo
//       //   .map((tp) => {
//       //     tp.date = moment(tp.date, "YYYY-MM-DD")
//       //       .add(1, "months")
//       //       .format("YYYY-MM-DD");
//       //     return tp;
//       //   })
//       //   .filter((tp) => {
//       //     return moment(currentDate, "YYYY-MM-DD").isSameOrBefore(
//       //       tp.date,
//       //       "day"
//       //     );
//       //   });

//       const schedulePaymentData = await SchedulePayment.find(
//         filterQuerySchedulePayment, {
//         billsdocument: 0,
//         receiptdocument: 0
//       }
//       );

//       const updatedDataScheduleOne = schedulePaymentData.filter((tp) => {
//         const expenseMonth = moment(tp.billdate, "YYYY-MM-DD").format("MM");
//         const expenseYear = moment(tp.billdate, "YYYY-MM-DD").format("YYYY");
//         return expenseMonth === filterdates && expenseYear === filteryear;
//       });

//       const totalData = [...updatedDataOne, ...updatedDataScheduleOne];

//       const finaldata = totalData.map((item, index) => {
//         return {
//           _id: item._id,
//           serialNumber: index + 1,
//           vendor:
//             item?.vendorname == undefined ? item?.vendor : item?.vendorname,
//           currdate:
//             item?.date == undefined
//               ? moment(item?.billdate, "YYYY-MM-DD").format("DD-MM-YYYY")
//               : moment(item?.date, "YYYY-MM-DD").format("DD-MM-YYYY"),
//           vendorfrequency:
//             item?.vendorfrequency == undefined
//               ? item?.frequency
//               : item?.vendorfrequency,
//           amount:
//             item?.billstatus == undefined
//               ? item?.dueamount
//               : item?.billstatus == "Partially Paid"
//                 ? item.balanceamount
//                 : item?.totalbillamount,
//           source: item?.source,
//           expensetotal: item?.expensetotal,
//           billno: item?.billno == undefined ? item?.referenceno : item?.billno,
//           vendorid: item?.vendorid,
//           filteredfrom: "Monthly",
//           filterdates: filterdates,
//           filteryear: filteryear,
//         };
//       });

//       return res.status(200).json({
//         expensereminder: finaldata,
//       });
//     }
//   } catch (err) {
//     return next(new ErrorHandler("Records not found!", 404));
//   }
// });
