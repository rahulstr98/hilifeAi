const express = require("express");
const stockRoute = express.Router();
// connect stock controller..
const { getAllStock, getAllStockAccess, addStock, getSingleStock, getOverallStockTableSort,
    getAllStockPurchaseLimitedUsageCount, getAllStockPurchaseLimitedUsageCountNotification, getAllStockPurchaseLimitedUsageCountNotificationList,
    getAllStockAccessStock, getAllStockPurchaseLimitedHandoverTodo, getAllStockPurchaseLimitedHandoverTodoReturn,
    getAllStockPurchaseLimitedHandoverandReturn, updateStock, getAllStockPurchaseLimitedTransfer, getAllStockPurchaseLimitedTransferLog,
    getAllStockPurchaseLimitedReturn, getAllStockPurchaseLimitedHandover, deleteStock, Stocktrasnferfilter, getAllStockPurchaseLimited,
    getAllStockPurchaseLimitedHandoverTodoNotification, getAllStockPurchaseLimitedHandoverTodoReturnNotification
} = require("../controller/modules/stockpurchase/stock");
stockRoute.route("/stocks").get(getAllStock);
stockRoute.route("/stocksaccess").post(getAllStockAccess);
stockRoute.route("/stocksaccessstock").post(getAllStockAccessStock);
stockRoute.route("/stock/new").post(addStock);
stockRoute.route("/stockpurchasesort").post(getOverallStockTableSort);
stockRoute.route("/stockpurchaselimited").post(getAllStockPurchaseLimited);
stockRoute.route("/stockpurchaselimitedhand").get(getAllStockPurchaseLimitedHandover);
stockRoute.route("/stockpurchaselimitedusagecount").get(getAllStockPurchaseLimitedUsageCount);
stockRoute.route("/stockpurchaselimitedusagecountnotification").post(getAllStockPurchaseLimitedUsageCountNotification);
stockRoute.route("/stockpurchaselimitedusagecountnotificationlist").post(getAllStockPurchaseLimitedUsageCountNotificationList);
stockRoute.route("/stockpurchaselimitedhandreturn").post(getAllStockPurchaseLimitedHandoverandReturn);
stockRoute.route("/stockpurchaselimitedtransfer").get(getAllStockPurchaseLimitedTransfer);
stockRoute.route("/stockpurchaselimitedtransferlog").post(getAllStockPurchaseLimitedTransferLog);
stockRoute.route("/stockpurchaselimitedreturn").get(getAllStockPurchaseLimitedReturn);
stockRoute.route("/stock/:id").get(getSingleStock).put(updateStock).delete(deleteStock);
stockRoute.route("/stockmantransferfilter").post(Stocktrasnferfilter);
stockRoute.route("/stockpurchaselimitedhandtodo").post(getAllStockPurchaseLimitedHandoverTodo);
stockRoute.route("/stockpurchaselimitedhandtodoreturn").post(getAllStockPurchaseLimitedHandoverTodoReturn)

stockRoute.route("/stockpurchaselimitedhandtodonotification").post(getAllStockPurchaseLimitedHandoverTodoNotification);
stockRoute.route("/stockpurchaselimitedhandtodoreturnnotification").post(getAllStockPurchaseLimitedHandoverTodoReturnNotification)

// connect stockmanage controller..
const { getAllStockmanage, addStockmanage, getAllStockmanageAccess, getAllStockmanageFilteredAccess, getAllStockmanageAccessStock, getSingleStockmanage, updateStockmanage, deleteStockmanage, getAllStockmanageFiltered } = require("../controller/modules/stockpurchase/stockmanage");
stockRoute.route("/stockmanages").get(getAllStockmanage);
stockRoute.route("/stockmanagesaccess").post(getAllStockmanageAccess);
stockRoute.route("/stockmanagesaccessstock").post(getAllStockmanageAccessStock);
stockRoute.route("/stockfilteraccess").post(getAllStockmanageFilteredAccess);
stockRoute.route("/stockfilter").get(getAllStockmanageFiltered);
stockRoute.route("/stockmanage/new").post(addStockmanage);
stockRoute.route("/stockmanage/:id").get(getSingleStockmanage).put(updateStockmanage).delete(deleteStockmanage);


const { getAllManualstock, addManualstock, getSingleManualstock, getAllManualstockAccess, getAllManualstockAccessStock,

    updateManualstock, deleteManualstock, Manualstocktrasnferfilter } = require("../controller/modules/stockpurchase/manualstockentry");
stockRoute.route("/manualstocks").get(getAllManualstock);
stockRoute.route("/manualstocksaccess").post(getAllManualstockAccess);
stockRoute.route("/manualstocksaccessstock").post(getAllManualstockAccessStock);
stockRoute.route("/manualstock/new").post(addManualstock);
stockRoute.route("/manualstock/:id").get(getSingleManualstock).put(updateManualstock).delete(deleteManualstock);
stockRoute.route("/manualstockmantransferfilter").post(Manualstocktrasnferfilter);

module.exports = stockRoute;
