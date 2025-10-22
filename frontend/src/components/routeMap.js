// routeMap.js
import Branch from '../pages/hr/Branch';
import UserShiftWeekOffPresent from '../pages/hr/shiftroaster/Usershiftweekoffpresent';
import Listemployee from '../pages/hr/employees/List';
// Import other components...

const routeComponentMap = {
  '/branch': Branch,
  '/attendance/usershiftweekoffpresent': UserShiftWeekOffPresent,
  '/list': Listemployee,
  // Add all your other routes here...
};

export default routeComponentMap;
