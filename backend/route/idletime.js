const express = require('express');
const idleTimeRoute = express.Router();

// connect customer group controller
const { getAllIdleTime, addIdleTime, getSingleIdleTime, updateIdleTime, deleteIdleTime, getIdleTimeFilter, updateIdleEndTime, viewIdleEndTime, getIdleTimeForLoginPage } = require('../controller/login/idletime');

idleTimeRoute.route('/idletimes').get(getAllIdleTime);
idleTimeRoute.route('/idletime/new').post(addIdleTime);
idleTimeRoute.route('/idletime/:id').get(getSingleIdleTime).put(updateIdleTime).delete(deleteIdleTime);
idleTimeRoute.route('/idletimefilter').post(getIdleTimeFilter);
idleTimeRoute.route('/idleendtimeupdate').post(updateIdleEndTime);
idleTimeRoute.route('/idletimeview').post(viewIdleEndTime);
idleTimeRoute.route('/idletimeforloginpage').post(getIdleTimeForLoginPage);
module.exports = idleTimeRoute;