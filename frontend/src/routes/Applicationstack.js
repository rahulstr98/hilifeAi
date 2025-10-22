import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Loading from "../Loading";

const Home = React.lazy(() => import("../pages/Home"));
const Footer = React.lazy(() => import("../components/footer/footer"));
const Branch = React.lazy(() => import("../pages/hr/Branch"));
const Unit = React.lazy(() => import("../pages/hr/Unit"));
const Area = React.lazy(() => import("../pages/hr/Area"));
const Location = React.lazy(() => import("../pages/hr/Location"));
const Floor = React.lazy(() => import("../pages/hr/Floor"));
const Department = React.lazy(() => import("../pages/hr/Department"));
const Designation = React.lazy(() => import("../pages/hr/Designation"));
const Advance = React.lazy(() => import("../pages/production/Advance"));
const Designationgroup = React.lazy(() => import("../pages/hr/Designationgroup"));
const Assigninterviewer = React.lazy(() => import("../pages/interview/Assigninterviewer"));
const InactiveCandidates = React.lazy(() => import("../pages/hr/recruitment/InactiveCandidates"));
const InterviewStatusCountReportPage = React.lazy(() => import("../pages/hr/recruitment/Interviewstatuscountreport"));
const AddLead = React.lazy(() => import("../pages/lead/AddLead"));
const LeadList = React.lazy(() => import("../pages/lead/Leadlist"));
const Layout = React.lazy(() => import("../components/Layout"));
const Qualification = React.lazy(() => import("../pages/hr/Qualification"));
const TemplateList = React.lazy(() => import("../pages/settings/TemplateList"));
const VerifiedList = React.lazy(() => import("../pages/settings/VerifiedList"));
const Shift = React.lazy(() => import("../pages/hr/shift"));
const Shiftroaster = React.lazy(() => import("../pages/hr/shiftroaster/Shiftroaster"));
const AttendanceMonthStatusList = React.lazy(() => import("../pages/company/attendance/Attendancemonthstatus"));
const AttendanceCheckList = React.lazy(() => import("../pages/company/attendance/attendancechecklist"));
const Attendancestatusmode = React.lazy(() => import("../pages/company/attendance/attendancemodemaster"));
const AttendanceIndividualStatusList = React.lazy(() => import("../pages/company/attendance/attendanceindividualstatus"));
const AttendanceReview = React.lazy(() => import("../pages/company/attendance/attendancereview"));
const AttendanceIndividualMyStatus = React.lazy(() => import("../pages/company/attendance/attendanceindividualmystatus"));
const ShiftAdjustmentList = React.lazy(() => import("../pages/hr/shiftroaster/Shiftadjustment"));
const Setlist = React.lazy(() => import("../pages/hr/shiftroaster/Setlist"));
const UserShiftList = React.lazy(() => import("../pages/hr/shiftroaster/Usershiftlist"));
const UserShiftRoasterList = React.lazy(() => import("../pages/hr/shiftroaster/Usershiftroaster"));
const ShiftRoasterFilter = React.lazy(() => import("../pages/hr/shiftroaster/Shiftroasterfilter"));
// const MyShiftAdjustmentList = React.lazy(() => import('../pages/hr/shiftroaster/MyShiftAdjustmentList'));
const MyShiftAdjustmentListFilter = React.lazy(() => import("../pages/hr/shiftroaster/MyShiftAdjustmentFilter"));
const ShiftGrouping = React.lazy(() => import("../pages/hr/Shiftgrouping"));
const Teams = React.lazy(() => import("../pages/hr/Teams"));
const WorkstationUnassigned = React.lazy(() => import("../pages/hr/employees/updatepages/Unassignedworkstation"));
const Designationrequirement = React.lazy(() => import("../pages/hr/recruitment/Designationrequirement"));
const Departmentgrouping = React.lazy(() => import("../pages/hr/recruitment/Departmentgrouping"));
const CandidateView = React.lazy(() => import("../pages/hr/recruitment/CandidateView"));
const Education = React.lazy(() => import("../pages/hr/Education"));
const Educationcategory = React.lazy(() => import("../pages/hr/education/Educationcategory"));
const Educationspecilization = React.lazy(() => import("../pages/hr/education/Educationspecilization"));
const Nonproductionunitallot = React.lazy(() => import("../pages/production//penalty/Nonproductionunitallot"));
const Nonproductionallot = React.lazy(() => import("../pages/production/penalty/Nonproductionallot"));
const Certification = React.lazy(() => import("../pages/hr/Certification"));
const Skillset = React.lazy(() => import("../pages/hr/Skillset"));
const Manpower = React.lazy(() => import("../pages/hr/manpower"));
const ControlName = React.lazy(() => import("../pages/company/ControlName"));
const Areagrouping = React.lazy(() => import("../pages/hr/Areagrouping"));
const Locationgrouping = React.lazy(() => import("../pages/hr/Locationgrouping"));
const Employeesystemallot = React.lazy(() => import("../pages/hr/Employeesystemallot"));
const ProductionReviewe = React.lazy(() => import("../pages/production/reports/Productionreviewe"));
const WaiverPercentage = React.lazy(() => import("../pages/production/penalty/Wavierpercentage"));
const Penaltyerrortype = React.lazy(() => import("../pages/production/penalty/Errortype"));
const ProductionProcessQueue = React.lazy(() => import("../pages/production/penalty/Productionprocessqueue"));
const ProductionUnAllot = React.lazy(() => import("../pages/production/original/ProductionUnitRateUnAllot"));
const Addemployee = React.lazy(() => import("../pages/hr/employees/Create"));
const Editemployee = React.lazy(() => import("../pages/hr/employees/Edit"));
const Listemployee = React.lazy(() => import("../pages/hr/employees/List"));
const Viewemployee = React.lazy(() => import("../pages/hr/employees/View"));



const HierarchyDisabledUsersList = React.lazy(() => import('../pages/LDAP/HierarchyDisabledUsersList.js'));
const HierarchyDomainUsersList = React.lazy(() => import('../pages/LDAP/HierarchyDomainUsersList.js'));
const HierarchyLockedUsersList = React.lazy(() => import('../pages/LDAP/HierarchyLockedUsersList.js'));
const Teamworkfromhome = React.lazy(() => import('../pages/hr/TeamWFHVerfication.js'));
const TeamAutoClockoutRestrictionList = React.lazy(() => import('../pages/hr/employees/updatepages/TeamAutoClockoutRestrictionList.js'));




const AssignedWorkStationReport = React.lazy(() => import("../pages/hr/employees/updatepages/Assignedworkstationreport"));
const Personalupdate = React.lazy(() => import("../pages/hr/employees/updatepages/Personalupdate"));
const Contactupdate = React.lazy(() => import("../pages/hr/employees/updatepages/Contactupdate"));
const Loginupdate = React.lazy(() => import("../pages/hr/employees/updatepages/Loginupdate"));
const Boardingupdate = React.lazy(() => import("../pages/hr/employees/updatepages/Boardingupdate"));
const Documentupdate = React.lazy(() => import("../pages/hr/employees/updatepages/Documentupdate"));
const ShiftLogChange = React.lazy(() => import("../pages/hr/employees/updatepages/ShiftLogChange"));
const ShiftLogListChange = React.lazy(() => import("../pages/hr/employees/updatepages/ShiftLogListChange"));
const Joiningupdate = React.lazy(() => import("../pages/hr/employees/updatepages/Joiningupdate"));
const Educationalupdate = React.lazy(() => import("../pages/hr/employees/updatepages/Educationupdate"));
const Addlqualificationupdate = React.lazy(() => import("../pages/hr/employees/updatepages/Addqualificationupdate"));
const Workhistoryupdate = React.lazy(() => import("../pages/hr/employees/updatepages/Workhistoryupdate"));
const Assignedrole = React.lazy(() => import("../pages/hr/employees/updatepages/Assignedrole"));
const Profile = React.lazy(() => import("../pages/hr/employees/Profilepage"));
const DepartmentMonthSet = React.lazy(() => import("../pages/hr/employees/updatepages/depmonthset"));
const Assignbankdetail = React.lazy(() => import("../pages/hr/employees/updatepages/Assignbankdetails"));
const AssignWorkStation = React.lazy(() => import("../pages/hr/employees/updatepages/Assignworkstation"));
const LiveEmployeeList = React.lazy(() => import("../pages/hr/employees/LiveEmployeeList"));
const TwoFactorReset = React.lazy(() => import("../pages/hr/employees/updatepages/Twofactorreset"));
const AccuracyMaster = React.lazy(() => import("../pages/quality/Accuracymaster"));
const ExpectedAccuracy = React.lazy(() => import("../pages/quality/Expectedaccuracy"));
const AcheivedAccuracy = React.lazy(() => import("../pages/quality/Acheivedaccuracy"));
const UsersTaskAllocation = React.lazy(() => import("../pages/task/usertaskallocations"));
const Attendanceindividualhierarchy = React.lazy(() => import("../pages/company/attendance/attendanceindividualhierarchylist"));
const TaskForUserCompleted = React.lazy(() => import("../pages/task/taskuserpanelcompleted"));
const TaskForUsersReport = React.lazy(() => import("../pages/task/TaskForUsersReport"));
const AssetMaterialIP = React.lazy(() => import("../pages/asset/AssetMaterialIP"));
const AssetWorkstationGrouping = React.lazy(() => import("../pages/asset/AssetWworkstationGrouping"));
const LabelName = React.lazy(() => import("../pages/asset/LabelName"));
const Intern = React.lazy(() => import("../pages/hr/intern/intern"));
const Interncertificate = React.lazy(() => import("../pages/hr/intern/interncertificate"));
const Interncourse = React.lazy(() => import("../pages/hr/intern/Interncourse"));
const Attedancestatusmaster = React.lazy(() => import("../pages/company/attendance/attendancestatusmaster"));
const EditMovietolive = React.lazy(() => import("../pages/hr/intern/Editmovetolive"));
const MyVerification = React.lazy(() => import("../pages/settings/MyVerification"));
const Project = React.lazy(() => import("../pages/project/Project"));
const Subproject = React.lazy(() => import("../pages/project/Subproject"));
const Module = React.lazy(() => import("../pages/project/Module"));
const Submodule = React.lazy(() => import("../pages/project/Submodule"));
const Submodulelistview = React.lazy(() => import("../pages/project/submodulelistview"));
const Requirements = React.lazy(() => import("../pages/project/requirements"));
const Pagetype = React.lazy(() => import("../pages/project/pagetype"));
const Priority = React.lazy(() => import("../pages/project/Priority"));
const Taskcreate = React.lazy(() => import("../pages/project/task/Task"));
const Taskreportpage = React.lazy(() => import("../pages/project/task/taskreport"));
const Taskdevmanagerpage = React.lazy(() => import("../pages/project/task/taskdevmanagerpage"));
const Paidlist = React.lazy(() => import("../pages/expenses/Paidlist"));
const Notpaidlist = React.lazy(() => import("../pages/expenses/Notpaidlist"));
const CategoryDateChange = React.lazy(() => import("../pages/production/master/Categorydatechange"));
const Taskassigned = React.lazy(() => import("../pages/project/task/Taskassignboard"));
const Taskassignedlist = React.lazy(() => import("../pages/project/task/allotedtask"));
const Tasklist = React.lazy(() => import("../pages/project/task/taskuser/Tasklist"));
const Taskuipage = React.lazy(() => import("../pages/project/task/taskuser/taskuipage"));
const Taskdevpage = React.lazy(() => import("../pages/project/task/taskuser/taskdevpage"));
const Tasktesterpage = React.lazy(() => import("../pages/project/task/taskuser/tasktesterpage"));
const LeaveReportList = React.lazy(() => import("../pages/leave/Leavereport"));
const Taskuipageadmin = React.lazy(() => import("../pages/project/task/taskadmin/taskuipageadmin"));
const Taskdevpageadmin = React.lazy(() => import("../pages/project/task/taskadmin/taskdevpageadmin"));
const Tasktestpageadmin = React.lazy(() => import("../pages/project/task/taskadmin/tasktesterpageadmin"));
const TaskNonScheduleGrouping = React.lazy(() => import("../pages/task/TaskNonScheduleGrouping"));
const TaskUserNonScheduleLog = React.lazy(() => import("../pages/task/TaskUserNonScheduleLog"));
const Loan = React.lazy(() => import("../pages/production/Loan"));
const ApprovedLoan = React.lazy(() => import("../pages/production/ApprovedLoan"));
const LoanRequest = React.lazy(() => import("../pages/production/LoanRequest"));
const Pagemodel = React.lazy(() => import("../pages/project/pagemodel"));
const Pagemodelfetch = React.lazy(() => import("../pages/project/pagemodulefetch"));
const PagemodelfetchEdit = React.lazy(() => import("../pages/project/pageModelFetchEdit"));
const Recruitment = React.lazy(() => import("../pages/hr/recruitment/Recruitment"));
const Addcandidate = React.lazy(() => import("../pages/hr/recruitment/Addcandidate"));
const EditEnquiryemployee = React.lazy(() => import("../pages/hr/employees/enquiry/Enquiryedit"));
const EnquiryPurposeUsersList = React.lazy(() => import("../pages/hr/employees/enquiry/Enquirypurposeuserslist"));
const Enquiryview = React.lazy(() => import("../pages/hr/employees/enquiry/Enquiryview"));
const Purpose = React.lazy(() => import("../pages/expenses/Purpose"));
const ScheduleMeetingLog = React.lazy(() => import("../pages/company/events/ScheduleMeetingLog"));
const Manageshortagemaster = React.lazy(() => import("../pages/production/master/shortagemaster"));
const InterviewTestMaster = React.lazy(() => import("../pages/interview/InterviewTestMaster"));
const Assignexplog = React.lazy(() => import("../pages/hr/employees/updatepages/Assignexplog"));
const Company = React.lazy(() => import("../pages/company/company"));
const AttendanceList = React.lazy(() => import("../pages/company/attendance/list"));
const AttendanceReport = React.lazy(() => import("../pages/company/attendance/attendancereport"));
const ImageCropper = React.lazy(() => import("../pages/company/excel/ImageCropper"));
const TodoList = React.lazy(() => import("../pages/company/excel/Todo"));
const Hierarchy = React.lazy(() => import("../pages/company/hierarchy/create"));
const NotAssignHierarchy = React.lazy(() => import("../pages/company/hierarchy/notassignhierarchy"));
const HierarchyEdit = React.lazy(() => import("../pages/company/hierarchy/edit"));
const RemarkList = React.lazy(() => import("../pages/company/remark"));
const Projectexcel = React.lazy(() => import("../pages/company/excel/project"));
const Vendorexcel = React.lazy(() => import("../pages/company/excel/vendor"));
const Interncreate = React.lazy(() => import("../pages/hr/intern/Interncreate"));
const Categoryexcel = React.lazy(() => import("../pages/company/excel/categoryexcel"));
const Subategoryexcel = React.lazy(() => import("../pages/company/excel/subcategoryexcel"));
const Queueexcel = React.lazy(() => import("../pages/company/excel/queue"));
const Timeandpointsexcel = React.lazy(() => import("../pages/company/excel/timeandpoints"));
const Importcategoryexcel = React.lazy(() => import("../pages/company/excel/importcategory"));
const Importsubcategoryexcel = React.lazy(() => import("../pages/company/excel/importsubcategory"));
const Importtimeandpoints = React.lazy(() => import("../pages/company/excel/importtimeandpoints"));
const Queuegrouping = React.lazy(() => import("../pages/company/excel/queuegrouping"));
const Masterfieldname = React.lazy(() => import("../pages/production/penalty/Masterfieldname"));
const Nonproductionunitrate = React.lazy(() => import("../pages/production/penalty/Nonproductionunitrate"));
const Managecategorypercentage = React.lazy(() => import("../pages/production/penalty/Categorypercentage"));
const NonproductionCategoryAndSubcategory = React.lazy(() => import("../pages/production/penalty/Nonproductioncategoryandsubcategory"));
const Otherpenaltycontrol = React.lazy(() => import("../pages/production/penalty/Otherpenaltycontrol"));
const Experiencebasewaviermaster = React.lazy(() => import("../pages/production/penalty/Experiencebasewavier"));
const Paiddatefix = React.lazy(() => import("../pages/production/master/Paiddatefix"));
const Paiddatemode = React.lazy(() => import("../pages/production/master/Paiddatemode"));
const Paidstatusfix = React.lazy(() => import("../pages/production/master/Paidstatusfix"));
const Categoryprocessmap = React.lazy(() => import("../pages/production/master/Categoryprocessmap"));
const Productionunitrate = React.lazy(() => import("../pages/production/master/productionunitrate"));
const ProductionCategory = React.lazy(() => import("../pages/production/master/Categoryprod"));
const ProductionSubCategory = React.lazy(() => import("../pages/production/master/subcategoryprod"));
const Payrunmaster = React.lazy(() => import("../pages/production/salary/Payrunmaster"));
const FinalSalaryList = React.lazy(() => import("../pages/production/salary/Payrunfinalsalary"));
const FixedSalaryList = React.lazy(() => import("../pages/production/salary/Payrunfixedsalary"));
const ProductionSalaryList = React.lazy(() => import("../pages/production/salary/Payrunproductionsalarylist"));
const Consolidatedsalarylist = React.lazy(() => import("../pages/production/salary/Payrunconsolidatedsalary"));
const PenaltyErrorUpload = React.lazy(() => import("../pages/production/penalty/Penaltyerrorupload"));
const ProducuionDayPointsUpload = React.lazy(() => import("../pages/production/original/Productiondaypoints"));
const InterviewRounds = React.lazy(() => import("../pages/hr/recruitment/InterviewRounds"));
const OnlineQuestionTest = React.lazy(() => import("../pages/interview/OnlineTestQuestion"));
const OnlineTestMaster = React.lazy(() => import("../pages/interview/OnlineTestMaster"));
const OnlineQuestionTestQuestion = React.lazy(() => import("../pages/interview/OnlineUserTestQuestion"));
const Manualstockentry = React.lazy(() => import("../pages/stockpurchase/Manualstockentry"));
const TooltipDescription = React.lazy(() => import("../pages/company/roles/TooltipDescription"));
const Componentlist = React.lazy(() => import("../pages/project/components/component"));
const SubComponentlist = React.lazy(() => import("../pages/project/components/subcomponent"));
const Componentgroup = React.lazy(() => import("../pages/project/components/componentsgroup"));
const TaskDesignationGrouping = React.lazy(() => import("../pages/task/taskDesignationGrouping"));
const AcPointCalculation = React.lazy(() => import("../pages/production/master/Acpointscalculation"));
const Branchwise = React.lazy(() => import("../pages/company/excel/reports/branchreport"));
const Queuewise = React.lazy(() => import("../pages/company/excel/reports/queuereport"));
const Teamwise = React.lazy(() => import("../pages/company/excel/reports/teamwise"));
const ResponsiblePerson = React.lazy(() => import("../pages/company/excel/reports/responsibleperson"));
const Customerwise = React.lazy(() => import("../pages/company/excel/reports/customerreport"));
const Categorywise = React.lazy(() => import("../pages/company/excel/reports/categoryreport"));
const Assignexperiencefilter = React.lazy(() => import("../pages/hr/employees/updatepages/Assignexpfilter"));
const Achievedaccuracyclientstatus = React.lazy(() => import("../pages/quality/Achievedaccuracyclientstatus"));
const Achievedaccuracyinternalstatus = React.lazy(() => import("../pages/quality/Achievedaccuracyinternalstatus"));
const ClientStatusList = React.lazy(() => import("../pages/quality/Clientstatuslist"));
const InternalStatusList = React.lazy(() => import("../pages/quality/internalstatus"));
const Penaltydayupload = React.lazy(() => import("../pages/production/penalty/Penaltydayupload"));
const Penaltydayuploadlist = React.lazy(() => import("../pages/production/penalty/Penaltydayuploadlist"));
const ManagepenaltyMonth = React.lazy(() => import("../pages/production/penalty/Penaltymonth"));
const Managepenaltymonthview = React.lazy(() => import("../pages/production/penalty/Penaltymonthview"));
const DeactivateInternlist = React.lazy(() => import("../pages/hr/intern/Deactiveinternlist"));
const ActiveinternList = React.lazy(() => import("../pages/hr/intern/Activeinterlist"));
const CategoryMaster = React.lazy(() => import("../pages/support/Categorymaster"));
const DeactivateInternlistView = React.lazy(() => import("../pages/hr/intern/Deactivateinternlistview"));
const AssignedPfesiloglist = React.lazy(() => import("../pages/hr/employees/updatepages/AssignedPfesiloglist"));
const Allotqueuelist = React.lazy(() => import("../pages/company/excel/allotlist/allottedqueuelist"));
const Unallotqueuelist = React.lazy(() => import("../pages/company/excel/allotlist/unallottedqueuelist"));
const Allottedresponsiblelist = React.lazy(() => import("../pages/company/excel/allotlist/responsiblepersonallottedlist"));
const Unallottedresponsiblelist = React.lazy(() => import("../pages/company/excel/allotlist/responsiblepersonunallottedlist"));
const Tertiaryworkorder = React.lazy(() => import("../pages/company/excel/workorder/Tertiary"));
const Seondaryworkorder = React.lazy(() => import("../pages/company/excel/workorder/Secondary"));
const Primarworkorder = React.lazy(() => import("../pages/company/excel/workorder/Primary"));
const Othersworkorder = React.lazy(() => import("../pages/company/excel/workorder/Others"));
const Consolidatedwprimaryorkorder = React.lazy(() => import("../pages/company/excel/workorder/Consolidatedprimatysecondarytertiary"));
const Consolidatedallworkorder = React.lazy(() => import("../pages/company/excel/workorder/Consolidatedall"));
const PrimaryIndividualworkorder = React.lazy(() => import("../pages/company/excel/allotlist/workorderindividual/primaryindividual"));
const SecondaryIndividualworkorder = React.lazy(() => import("../pages/company/excel/allotlist/workorderindividual/secondaryindividual"));
const OtherIndividualworkorder = React.lazy(() => import("../pages/company/excel/allotlist/workorderindividual/otherindividual"));
const TertiaryIndividualworkorder = React.lazy(() => import("../pages/company/excel/allotlist/workorderindividual/tertiaryindividual"));
const IndividualconsolidatedAll = React.lazy(() => import("../pages/company/excel/allotlist/workorderindividual/individualconsolidatedall"));
const IndividualPrimarySeondaryTertiaryAll = React.lazy(() => import("../pages/company/excel/allotlist/workorderindividual/individualconsolidatedprimarysecondarytertiary"));
const Workorderlive = React.lazy(() => import("../pages/company/excel/workorderlive/workorderlive"));
const Productionclientrate = React.lazy(() => import("../pages/production/penalty/Productionclientrate"));
const Raiseproblem = React.lazy(() => import("../pages/support/Raiseproblem"));
const RaiseProblemlist = React.lazy(() => import("../pages/support/Raiseproblemlist"));
const RaiseProblemView = React.lazy(() => import("../pages/support/RaiseProblemView"));
const RaiseProblemEdit = React.lazy(() => import("../pages/support/RaiseProblemEdit"));
const RaiseProblemOpen = React.lazy(() => import("../pages/support/RaiseProblemOpen"));
const RaiseProblemOnProgress = React.lazy(() => import("../pages/support/RaiseProblemOnProgress"));
const RaiseProblemClosed = React.lazy(() => import("../pages/support/RaiseProblemClosed"));
const TempProductionReviewe = React.lazy(() => import("../pages/production/reports/Tempproductionreview"));
const AddDocument = React.lazy(() => import("../pages/hr/documents/create"));
const DocumentsList = React.lazy(() => import("../pages/hr/documents/list"));
const EditDocument = React.lazy(() => import("../pages/hr/documents/edit"));
const ViewDocument = React.lazy(() => import("../pages/hr/documents/view"));
const OverallDocumentsList = React.lazy(() => import("../pages/hr/documents/OverallListDocument"));
const CreateRole = React.lazy(() => import("../pages/company/roles/Create"));
const Controlsgrouping = React.lazy(() => import("../pages/company/roles/Controlegrouping"));
const DocumentCategory = React.lazy(() => import("../pages/hr/documents/documentcategory"));
const Noticeperiodactionemployeelist = React.lazy(() => import("../pages/hr/employees/updatepages/Actionemployeelist"));
const Listofdocument = React.lazy(() => import("../pages/hr/documents/Listdocument"));
const Documentgrouping = React.lazy(() => import("../pages/hr/documents/Documentsgrouping"));
const PenaltyAmountConsolidate = React.lazy(() => import("../pages/production/penalty/PenaltyAmountConsolidtae"));
const PenaltyAmountConsolidateView = React.lazy(() => import("../pages/production/penalty/PenaltyAmountConsolidateView"));
const InternList = React.lazy(() => import("../pages/hr/intern/InternList"));
const InternEdit = React.lazy(() => import("../pages/hr/intern/InternEdit"));
const Departmentanddesignationgrouping = React.lazy(() => import("../pages/hr/Departmentanddesignationgrouping"));
const OverallReport = React.lazy(() => import("../pages/production/reports/OverallReport"));
const ProductionReport = React.lazy(() => import("../pages/production/reports/IndividualProductionReport"));
const ProductionTempReport = React.lazy(() => import("../pages/production/reports/TempIndividualreport"));
const AutoLogout = React.lazy(() => import("../pages/settings/AutoLogout"));
const Remotesystemname = React.lazy(() => import("../pages/hr/UnAllotedRemoteSystemName"));
const TempPointsUploadEdit = React.lazy(() => import("../pages/production/temp/TempPointsUploadEdit"));
const ProductionIndividual = React.lazy(() => import("../pages/production/manual/productionindividual"));
const ProductionIndividualFilter = React.lazy(() => import("../pages/production/manual/productionindividualfilter"));
const TempOverallReport = React.lazy(() => import("../pages/production/reports/Tempoverallreport"));
const Zerounitrteunallottemp = React.lazy(() => import("../pages/production/temp/ProductionUnAllotTemp"));
const ProductionDayTemp = React.lazy(() => import("../pages/production/temp/productiondaytemp"));
const Jobopenings = React.lazy(() => import("../pages/hr/recruitment/Jobopenings/create"));
const JobopeningList = React.lazy(() => import("../pages/hr/recruitment/Jobopenings/jobopeninglist"));
const JobClosingList = React.lazy(() => import("../pages/hr/recruitment/Jobopenings/jobclosedlist"));
const JobopeningEdit = React.lazy(() => import("../pages/hr/recruitment/Jobopenings/edit"));
const JobopeningView = React.lazy(() => import("../pages/hr/recruitment/Jobopenings/view"));
const Vacancypostion = React.lazy(() => import("../pages/hr/recruitment/vacancyposition"));
const Recruitmentplanning = React.lazy(() => import("../pages/hr/recruitment/Recruitmentplanning"));
const Rolesandresponse = React.lazy(() => import("../pages/hr/recruitment/rolesandresponse"));
const Roleandresponse = React.lazy(() => import("../pages/hr/recruitment/rolesresponsibility/Rolesofresponsibility"));
const ApprovedList = React.lazy(() => import("../pages/production/manual/ApproveList"));
const RejectList = React.lazy(() => import("../pages/production/manual/RejectList"));
const DraftList = React.lazy(() => import("../pages/hr/employees/DraftList"));
const DraftEdit = React.lazy(() => import("../pages/hr/employees/DraftEdit"));
const DraftView = React.lazy(() => import("../pages/hr/employees/DraftView"));
const Templatecontrolpanel = React.lazy(() => import("../pages/hr/hrdocuments/Templatecontrolpanel"));
const InternDraftList = React.lazy(() => import("../pages/hr/intern/InternDraftList"));
const InternDraftEdit = React.lazy(() => import("../pages/hr/intern/InternDraftListEdit"));
const InternDraftView = React.lazy(() => import("../pages/hr/intern/InternDraftView"));
const RolesandResponseCategory = React.lazy(() => import("../pages/hr/recruitment/rolesresponsibility/Rolesandresponsibilitycategory"));
const Noticeperiodlist = React.lazy(() => import("../pages/hr/noticeperiod/Noticeperiodstatus"));
const Addexists = React.lazy(() => import("../pages/hr/exit details/addexists"));
const ExitdetailList = React.lazy(() => import("../pages/hr/exit details/exitdetaillist"));
const Noticeperiodapply = React.lazy(() => import("../pages/hr/noticeperiod/Noticeperiodapply"));
const Refercandidate = React.lazy(() => import("../pages/hr/referandearn/Refercandidatepage"));
const RejoinEmployeeList = React.lazy(() => import("../pages/hr/employees/updatepages/RejoinEmployeeList"));
const Productionday = React.lazy(() => import("../pages/production/original/Productionday"));
const Noticeperiodliststatus = React.lazy(() => import("../pages/hr/noticeperiod/Noticeperiodliststatus"));
const Noticeperiodstatuslist = React.lazy(() => import("../pages/hr/noticeperiod/Noticeperiodapprovelist"));
const Deactivateemployeeslist = React.lazy(() => import("../pages/hr/exit details/Deactivateemployeeslist"));
const FollowUpVisitor = React.lazy(() => import("../pages/interactors/visitors/Followupvisitor"));
const Resumemanagement = React.lazy(() => import("../pages/hr/recruitment/resume/resumemanagement"));
const ResumeEdit = React.lazy(() => import("../pages/hr/recruitment/resume/edit"));
const ResumeView = React.lazy(() => import("../pages/hr/recruitment/resume/view"));
const ResumemailAttachments = React.lazy(() => import("../pages/hr/recruitment/Resumemailattachments"));
const Addresume = React.lazy(() => import("../pages/hr/recruitment/Addresume"));
const UnassignedCandidates = React.lazy(() => import("../pages/hr/recruitment/Unassignedcandidates"));
const Viewresume = React.lazy(() => import("../pages/hr/recruitment/Viewresume"));
const AssignedCandidates = React.lazy(() => import("../pages/hr/recruitment/Assignedcandidates"));
const ProductionDayShift = React.lazy(() => import("../pages/production/reports/ProductionDayShift"));
const AchievedAccuracyIndividualReviewList = React.lazy(() => import("../pages/quality/Achievedaccuracyindividualreviewlist"));
const AchievedAccuracyIndividualReviewClientstatusList = React.lazy(() => import("../pages/quality/Achievedaccuracyindividualreviewclientstatuslist"));
const AchievedAccuracyIndividualReviewInternalstatusList = React.lazy(() => import("../pages/quality/AchievedaccuracyindividualreviewInternalstatuslist"));
const TargetSalary = React.lazy(() => import("../pages/production/MyTargetSalary"));
const Weekoffpresent = React.lazy(() => import("../pages/hr/shiftroaster/Weekoffcontrolpanel"));
const MaintenanceUserLog = React.lazy(() => import("../pages/settings/Maintenancelog"));
const Jobroles = React.lazy(() => import("../pages/career/jobroles"));
const Jobdescription = React.lazy(() => import("../pages/career/jobdescription"));
const Candidate = React.lazy(() => import("../pages/career/candidate"));
const UseForm = React.lazy(() => import("../pages/hr/recruitment/interviewcustomizefrom/UseForm"));
const FormGenerate = React.lazy(() => import("../pages/hr/recruitment/interviewcustomizefrom/FormGenerate"));
const AccountGroup = React.lazy(() => import("../pages/account/accountgroup"));
const Group = React.lazy(() => import("../pages/account/Group"));
const Accounthead = React.lazy(() => import("../pages/account/accounthead"));
const Assetmaterial = React.lazy(() => import("../pages/account/assetmaterial"));
const Penaltyclienterrorupload = React.lazy(() => import("../pages/production/penalty/Clienterrorupload"));
const Clienterrorlist = React.lazy(() => import("../pages/production/penalty/Clienterrorlist"));
const RemoteEmployeeDetailsList = React.lazy(() => import("../pages/hr/employees/updatepages/RemoteEmployeeDetailsList"));
const RemoteEmployeeList = React.lazy(() => import("../pages/hr/employees/updatepages/RemoteemployeeList"));
const RemoteEmployeeLog = React.lazy(() => import("../pages/hr/employees/updatepages/RemoteEmployeeLog"));
const OthertaskList = React.lazy(() => import("../pages/othertask/Othertasklist"));
const Designationandcontrolgrouping = React.lazy(() => import("../pages/company/Designationandcontrolgrouping"));
const AssetDetailsList = React.lazy(() => import("../pages/asset/assetlist"));
const Assetdetails = React.lazy(() => import("../pages/asset/assetdetails"));
const Assetcategorygrouping = React.lazy(() => import("../pages/tickets/Assetcategorygrouping"));
const RepairAsset = React.lazy(() => import("../pages/asset/RepairAsset"));
const ManageAsset = React.lazy(() => import("../pages/asset/ManageAsset"));
const DamageAsset = React.lazy(() => import("../pages/asset/DamageAsset"));
const VomMaster = React.lazy(() => import("../pages/asset/VomMaster"));
const EmployeeAssetdistribution = React.lazy(() => import("../pages/asset/EmployeeAssetdistribution"));
const VendorDetails = React.lazy(() => import("../pages/asset/VendorDetails"));
const FrequencyMaster = React.lazy(() => import("../pages/asset/FrequencyMaster"));
const AssetWorkstation = React.lazy(() => import("../pages/asset/assetspecifications"));
const AssetSpecificationGrouping = React.lazy(() => import("../pages/asset/Assetspecifocationgrouping"));
const Accuracyqueuegrouping = React.lazy(() => import("../pages/quality/Accuracyqueuegrouping"));
const ResponseLog = React.lazy(() => import("../pages/hr/recruitment/ResponseLog"));
const MaintenanceHierarchyReport = React.lazy(() => import("../pages/asset/MaintenanceHierarchyReport"));
const EmployeePoints = React.lazy(() => import("../pages/production/reports/Employeepoints"));
const EmployeeTempPoints = React.lazy(() => import("../pages/production/reports/Employeepointstemp"));
const Addcategoryticket = React.lazy(() => import("../pages/tickets/Addcategoryticket"));
const Subsubcomponent = React.lazy(() => import("../pages/tickets/Subsubcategory"));
const Typegroupmaster = React.lazy(() => import("../pages/tickets/Typegroupmaster"));
const Typemaster = React.lazy(() => import("../pages/tickets/Typemaster"));
const Reasonmaster = React.lazy(() => import("../pages/tickets/Reasonmaster"));
const ResolverReasonmaster = React.lazy(() => import("../pages/tickets/Resolverreasonmaster"));
const Meetingmaster = React.lazy(() => import("../pages/company/events/Meetingmaster"));
const Chekpointticketmaster = React.lazy(() => import("../pages/tickets/Checkpointticketmaster"));
const Teamgrouping = React.lazy(() => import("../pages/tickets/Teamgrouping"));
const Otherpayment = React.lazy(() => import("../pages/account/otherpayment"));
const Maintenance = React.lazy(() => import("../pages/asset/maintenance"));
const MaintenanceService = React.lazy(() => import("../pages/asset/MaintenanceService"));
const MaintenanceRemarkList = React.lazy(() => import("../pages/asset/MaintenanceRemarkList"));
const TaskMaintenanceNonScheduleGrouping = React.lazy(() => import("../pages/asset/TaskMaintenanceNonScheduleGrouping"));
const TaskMaintenanceUserPanelView = React.lazy(() => import("../pages/asset/taskMaintenanceUserPanelView"));
const TaskMaintenaceForUser = React.lazy(() => import("../pages/asset/taskMaintenanceForUser"));
const TaskMaintenanceNonScheduleLog = React.lazy(() => import("../pages/asset/TaskMaintenanceNonScheduleLog"));
const Applyleave = React.lazy(() => import("../pages/leave/Applyleave"));
const Leavecriteria = React.lazy(() => import("../pages/leave/Leavecriteria"));
const ApprovedLeave = React.lazy(() => import("../pages/leave/LeaveApproved"));
const Leavetype = React.lazy(() => import("../pages/leave/LeaveType"));
const LeaveVerification = React.lazy(() => import("../pages/leave/Leaveverification"));
const TeamLeaveVerification = React.lazy(() => import("../pages/leave/Teamleaveverification"));
const ScheduleMeeting = React.lazy(() => import("../pages/company/events/ScheduleMeeting"));
const ScheduleMeetingFilter = React.lazy(() => import("../pages/company/events/ScheduleMeetingFilter"));
const MeetingCalendar = React.lazy(() => import("../pages/company/events/MeetingCalendar"));
const Holiday = React.lazy(() => import("../pages/company/events/Holiday"));
const EventsCalendar = React.lazy(() => import("../pages/company/events/EventsCalendar"));
const HolidayCalendar = React.lazy(() => import("../pages/company/events/HolidayCalendar"));
const HolidayFilter = React.lazy(() => import("../pages/company/events/Holidayfilter"));
const ManageStockTransfer = React.lazy(() => import("../pages/stockpurchase/managestocktransfer"));
const StockManagement = React.lazy(() => import("../pages/stockpurchase/stockmanagement"));
const Myteampassword = React.lazy(() => import("../pages/settings/Myteampassword"));
const ProductionUnmatchUnitList = React.lazy(() => import("../pages/production/original/ProductionUnmatchUnitList"));
const TempProductionUnmatchUnit = React.lazy(() => import("../pages/production/temp/TempProductionUnmatchUnit"));
const Stockmaster = React.lazy(() => import("../pages/stockpurchase/stock"));
const Stockmanagerequest = React.lazy(() => import("../pages/stockpurchase/stockrequest"));
const Stockpurchaserequest = React.lazy(() => import("../pages/stockpurchase/stockrequestpurchase"));
const PrimaryHierarchyList = React.lazy(() => import("../pages/company/excel/workorder/PrimaryHierarchy"));
const SeondaryworkorderHierarchy = React.lazy(() => import("../pages/company/excel/workorder/SecondaryHierarchy"));
const TertiaryworkorderHierarchy = React.lazy(() => import("../pages/company/excel/workorder/TertiaryHierarchy"));
const OtherHierarchy = React.lazy(() => import("../pages/company/excel/workorder/OtherHierarchy"));
const ConsolidatedHierarchyPriSecTer = React.lazy(() => import("../pages/company/excel/workorder/ConsolidatedHierarchyPriSecTer"));
const ConsolidatedHierarchyAll = React.lazy(() => import("../pages/company/excel/workorder/ConsolidatedHierarchyAll"));
const Salaryprocessreport = React.lazy(() => import("../pages/company/Salaryprocessreport"));
const ReportCompanyOthertaskList = React.lazy(() => import("../pages/othertask/ReportCompanyOtherTask"));
const ReportEmployeeOthertaskList = React.lazy(() => import("../pages/othertask/ReportEmployeeOthertaskList"));
const Attendancehierarchy = React.lazy(() => import("../pages/company/attendance/attendancelisthierarchy"));
const OverAssetDetails = React.lazy(() => import("../pages/stockpurchase/overAllAssetDetails"));
const StockList = React.lazy(() => import("../pages/stockpurchase/stocklist"));
const Companydomain = React.lazy(() => import("../pages/company/Companydomain"));
const Raiseticketsmaster = React.lazy(() => import("../pages/tickets/Raiseticketmaster"));
const Raiseticketslist = React.lazy(() => import("../pages/tickets/Raiseticketlist"));
const RaiseticketsEdit = React.lazy(() => import("../pages/tickets/Raiseticketedit"));
const CandidateMissingField = React.lazy(() => import("../pages/hr/recruitment/CandidateMissingField"));
const RejectedCandidates = React.lazy(() => import("../pages/hr/recruitment/RejectedCandidates"));
const HiredCandidates = React.lazy(() => import("../pages/hr/recruitment/HiredCandidates"));
const GroupList = React.lazy(() => import("../pages/company/hierarchy/grouplist"));
const GroupIndividual = React.lazy(() => import("../pages/company/hierarchy/grouplistindividual"));
const AcheivedAccurayIndividual = React.lazy(() => import("../pages/quality/Achievedaccuracyindividual"));
const AchievedAccuracyIndividualEdit = React.lazy(() => import("../pages/quality/Achievedaccuracyindividualedit"));
const Addexpanse = React.lazy(() => import("../pages/expenses/addexpanse"));
const ExpenseList = React.lazy(() => import("../pages/expenses/list"));
const EditExpense = React.lazy(() => import("../pages/expenses/EditExpense"));
const Expensecategory = React.lazy(() => import("../pages/expenses/expensecategory"));
const ExpenseReminder = React.lazy(() => import("../pages/expenses/ExpenseReminder"));
const AllReminder = React.lazy(() => import("../pages/expenses/AllReminder"));
const Events = React.lazy(() => import("../pages/company/events/Events"));
const EventsFilter = React.lazy(() => import("../pages/company/events/eventsfilter"));
const SchedulePaymentMaster = React.lazy(() => import("../pages/expenses/SchedulePaymentMaster"));
const SchedulePaymentMasterLog = React.lazy(() => import("../pages/expenses/SchedulePaymentMasterLog"));
const NotAddedBills = React.lazy(() => import("../pages/expenses/NotAddedBills"));
const NoticeperiodApplyHierarchy = React.lazy(() => import("../pages/hr/noticeperiod/NoticePeriodApplyHierarchy"));
const Addcategoryinterview = React.lazy(() => import("../pages/interview/Addcategoryinterview"));
const Roundmaster = React.lazy(() => import("../pages/interview/Roundmaster"));
const Interviewtypemaster = React.lazy(() => import("../pages/interview/Interviewtypemaster"));
const Assignexperience = React.lazy(() => import("../pages/hr/employees/updatepages/Assignexperience"));
const MinimumPointsCalc = React.lazy(() => import("../pages/production/reports/MinPoinsCalc"));
const EditRole = React.lazy(() => import("../pages/company/roles/Edit"));
const ReferenceCategoryDoc = React.lazy(() => import("../pages/reference/ReferenceCategoryDoc"));
const AddReferenceCategoryDoc = React.lazy(() => import("../pages/reference/AddReferenceCategoryDoc"));
const EditReferenceCategoryDoc = React.lazy(() => import("../pages/reference/EditReferenceCategoryDoc"));
const ListReferenceCategoryDoc = React.lazy(() => import("../pages/reference/ListReferenceCategoryDoc"));
const Designationlog = React.lazy(() => import("../pages/hr/employees/updatepages/Designationlog"));
const Designationloglist = React.lazy(() => import("../pages/hr/employees/updatepages/Designationloglist"));
const Duedatemaster = React.lazy(() => import("../pages/tickets/Duedatemaster"));
const Prioritymaster = React.lazy(() => import("../pages/tickets/Prioritymaster"));
const Assignedby = React.lazy(() => import("../pages/othertask/Assignedby"));
const Manageassignedmode = React.lazy(() => import("../pages/othertask/Manageassignedmode"));
const Manageothertask = React.lazy(() => import("../pages/othertask/Othertask"));
const StockCategory = React.lazy(() => import("../pages/stockpurchase/Stockcategory"));
const Interviewquestion = React.lazy(() => import("../pages/interview/Interviewquestion"));
const Interviewgroupingquestion = React.lazy(() => import("../pages/interview/interviewquestiongrouping"));
const InterviewFormGenerate = React.lazy(() => import("../pages/interview/InterviewFormAdd"));
const InterviewQuestionsOrder = React.lazy(() => import("../pages/interview/InterviewQuestionsOrder"));
const Interviewroundorder = React.lazy(() => import("../pages/interview/Interviewroundorder"));
const InterviewQuestionAnswerAllot = React.lazy(() => import("../pages/interview/InterviewQuestionAnswerAllot"));
const InterviewTypingQuestions = React.lazy(() => import("../pages/interview/InterviewTypingQuestions"));
const IndividualQuestionStatus = React.lazy(() => import("../pages/interview/IndividualQuestionStatus"));
const Assignedpfesi = React.lazy(() => import("../pages/hr/employees/updatepages/Assignedpfesi"));
const Assignpfesi = React.lazy(() => import("../pages/hr/employees/updatepages/Assignpfesi"));
const Penaltyclienterror = React.lazy(() => import("../pages/production/penalty/Penaltyclienterror"));
const PasswordCategory = React.lazy(() => import("../pages/password/PasswordCategory"));
const AddPassword = React.lazy(() => import("../pages/password/AddPassword"));
const EditPassword = React.lazy(() => import("../pages/password/EditPassword"));
const AddresumemailAttachments = React.lazy(() => import("../pages/hr/recruitment/Addresume"));
const AssetType = React.lazy(() => import("../pages/asset/AssetType"));
const WorkStation = React.lazy(() => import("../pages/hr/Workstation"));
const Workstationsystemname = React.lazy(() => import("../pages/hr/workstatiionsystemname"));
const AssetTypeGrouping = React.lazy(() => import("../pages/asset/AssetTypeGrouping"));
const SettingKeyWordInstructions = React.lazy(() => import("../pages/settings/Settingkeywordinstructions"));
const AttendanceControlCriteria = React.lazy(() => import("../pages/settings/AttendanceControlCriteria"));
const UserShiftWeekOffPresent = React.lazy(() => import("../pages/hr/shiftroaster/Usershiftweekoffpresent"));
const Assignmanualsalarydetails = React.lazy(() => import("../pages/hr/employees/updatepages/Assignmanualsalarydetails"));
const Assignedmanualsalarydetails = React.lazy(() => import("../pages/hr/employees/updatepages/Assignedmanualsalarydetails"));
const VendorGrouping = React.lazy(() => import("../pages/asset/vendorgrouping"));
const Raiseissue = React.lazy(() => import("../pages/project/raiseissue/Raiseissue"));
const Raiseissueedit = React.lazy(() => import("../pages/project/raiseissue/Raiseissueedit"));
const Empmissfield = React.lazy(() => import("../pages/hr/employees/MissingfieldsList"));
const BrandMaster = React.lazy(() => import("../pages/asset/assetspecification/BrandMaster"));
const TemplateCreation = React.lazy(() => import("../pages/hr/hrdocuments/TemplateCreation"));
const CandidateDocuments = React.lazy(() => import("../pages/hr/hrdocuments/CandidateDocuments"));
const EmployeeDocumentsKeywords = React.lazy(() => import("../pages/hr/hrdocuments/EmployeeDocumentsKeywords"));
const ManualKeyWordsPreparation = React.lazy(() => import("../pages/hr/hrdocuments/ManualKeyWordsPreparation"));
const CompanyDocumentsKeywords = React.lazy(() => import("../pages/hr/hrdocuments/CompanyDocumentsKeywords.js"));
const CandidateDocumentsKeywords = React.lazy(() => import("../pages/hr/hrdocuments/CandidateDocumentsKeywords"));
const Recuritment = React.lazy(() => import("../pages/hr/recruitment/Recruitment"));
const DepartmentMonthSetAuto = React.lazy(() => import("../pages/hr/Departmentmonthsetauto"));
const DesignationLogGrouping = React.lazy(() => import("../pages/hr/Boadinggrouping"));
const Certificaion = React.lazy(() => import("../pages/hr/Certification"));
const AssetPrintlabel = React.lazy(() => import("../pages/asset/assetprintlabel"));
const AddtoPrintQueue = React.lazy(() => import("../pages/asset/addtoprintqueue"));
const AddtoPrintQueuePrint = React.lazy(() => import("../pages/asset/addtoprintqueueprint"));
const Exitlist = React.lazy(() => import("../pages/hr/noticeperiod/Exitlist"));
const AssetModel = React.lazy(() => import("../pages/asset/assetspecification/AssetModel"));
const AssetVariant = React.lazy(() => import("../pages/asset/assetspecification/AssetVariant"));
const AssetSize = React.lazy(() => import("../pages/asset/assetspecification/AssetSize"));
const AssetSpecificationType = React.lazy(() => import("../pages/asset/assetspecification/AssetSpecificationType"));
const PanelType = React.lazy(() => import("../pages/asset/assetspecification/PanelType"));
const ScreenResolution = React.lazy(() => import("../pages/asset/assetspecification/ScreenResolution"));
const Connectivity = React.lazy(() => import("../pages/asset/assetspecification/Connectivity"));
const RaiseproblemDetailsUpload = React.lazy(() => import("../pages/support/RaiseproblemDetailsUpload"));
const CompanyDocumentPreparationPrinted = React.lazy(() => import("../pages/hr/hrdocuments/CompanyDocuments"));
const EmployeeDocumentStatus = React.lazy(() => import("../pages/hr/hrdocuments/EmployeeDocumentStatus"));
const DataRange = React.lazy(() => import("../pages/asset/assetspecification/DataRange"));
const CompatibleDevices = React.lazy(() => import("../pages/asset/assetspecification/CompatibleDevices"));
const OutputPower = React.lazy(() => import("../pages/asset/assetspecification/OutputPower"));
const CoolingFanCount = React.lazy(() => import("../pages/asset/assetspecification/CoolingFanCount"));
const ClockSpeed = React.lazy(() => import("../pages/asset/assetspecification/ClockSpeed"));
const Core = React.lazy(() => import("../pages/asset/assetspecification/Core"));
const Speed = React.lazy(() => import("../pages/asset/assetspecification/Speed"));
const Frequency = React.lazy(() => import("../pages/asset/assetspecification/Frequency"));
const Output = React.lazy(() => import("../pages/asset/assetspecification/Output"));
const EthernetPorts = React.lazy(() => import("../pages/asset/assetspecification/EthernetPorts"));
const Distance = React.lazy(() => import("../pages/asset/assetspecification/Distance"));
const Length = React.lazy(() => import("../pages/asset/assetspecification/Length"));
const Slot = React.lazy(() => import("../pages/asset/assetspecification/Slot"));
const NoOfChannels = React.lazy(() => import("../pages/asset/assetspecification/NoOfChannels"));
const Colours = React.lazy(() => import("../pages/asset/assetspecification/Colours"));
const ClientUserid = React.lazy(() => import("../pages/production/master/ClientUserid"));
const ProcessQueueName = React.lazy(() => import("../pages/production/master/ProcessQueueName"));
const Targetpoints = React.lazy(() => import("../pages/production/master/TargetPoints"));
const TempPointsUpload = React.lazy(() => import("../pages/production/temp/TempPointsUpload"));
const ListTempProductionPoints = React.lazy(() => import("../pages/production/temp/ListTempProductionPoints"));
const ClientUseridTemp = React.lazy(() => import("../pages/production/ReportTempConsolidated"));
const Productiontempupload = React.lazy(() => import("../pages/production/temp/Productiontempupload"));
const ProductionTempUploadAll = React.lazy(() => import("../pages/production/temp/Productiontempuploadall"));
const ProductionTempUploadEdit = React.lazy(() => import("../pages/production/temp/Editsingleviewlisttemp"));
const ProductionUpload = React.lazy(() => import("../pages/production/original/productionupload"));
const ProductionUploadEdit = React.lazy(() => import("../pages/production/original/Editsingleview"));
const Bankdetailinfo = React.lazy(() => import("../pages/hr/employees/updatepages/Bankdetailinfo"));
const ProfessionalTaxMaster = React.lazy(() => import("../pages/company/ProfessionalTaxMaster"));
const DayPointsUploadEdit = React.lazy(() => import("../pages/production/original/DayPointsUploadEdit"));
const MyInterviewCheckList = React.lazy(() => import("../pages/checklist/Mychecklist"));
const AssignDocumentCreate = React.lazy(() => import("../pages/hr/documents/Assigndocumentcreate"));
const AssignDocumentEdit = React.lazy(() => import("../pages/hr/documents/Assigndocumentedit"));
const ControlPanel = React.lazy(() => import("../pages/settings/ControlPanel"));
const ClockinIP = React.lazy(() => import("../pages/settings/ClockinIP"));
const PasswordList = React.lazy(() => import("../pages/settings/PasswordList"));
const IndividualSettings = React.lazy(() => import("../pages/settings/IndividualSettings"));
const DocumentPreparation = React.lazy(() => import("../pages/hr/hrdocuments/documentpreparation"));
const AttendanceModeReportList = React.lazy(() => import("../pages/company/attendance/Attendancemodereport"));

const DocumentsPrintedStatusList = React.lazy(() => import("../pages/hr/hrdocuments/documentsPrintedStatusList"));
const OrganizationDocumentCategory = React.lazy(() => import("../pages/settings/organizationdocuments/OrganizationDocumentCategory"));
const AddOrganizationDocument = React.lazy(() => import("../pages/settings/organizationdocuments/AddOrganizationDocument"));
const EditOrganizationDocument = React.lazy(() => import("../pages/settings/organizationdocuments/EditOrganizationDocument"));
const NonproductionList = React.lazy(() => import("../pages/production/nonproduction/Listnonproduction"));
const Nonproduction = React.lazy(() => import("../pages/production/nonproduction/Nonproduction"));
const Nonproductionfilterlist = React.lazy(() => import("../pages/production/nonproduction/Nonproductionfilterlist"));
const IndividualEmployeeLoginStatus = React.lazy(() => import("../pages/hr/employees/individualEmployeeLoginStatus"));
const HierarchyBasedEmployeeLoginStatus = React.lazy(() => import("../pages/hr/employees/HierarchyBasedemployeeStatus"));
const IndividualLoginAllotList = React.lazy(() => import("../pages/production/IndividualLoginAllotList"));
const HierarchyAllotList = React.lazy(() => import("../pages/production/HierarchyLoginAllotList"));
const Individualaiseticketist = React.lazy(() => import("../pages/tickets/Individualraiseticketlist"));
const IndividualRaiseTicketReport = React.lazy(() => import("../pages/tickets/Individualraiseticketreport"));
const Taskcategory = React.lazy(() => import("../pages/task/Taskcategory"));
const TaskSubcategory = React.lazy(() => import("../pages/task/Tasksubcategory"));
const Trainingcategory = React.lazy(() => import("../pages/task/training/Trainingcategory"));
const Trainingsubcategory = React.lazy(() => import("../pages/task/training/Trainingsubcategory"));
const TrainingDetails = React.lazy(() => import("../pages/task/training/Trainingdetails"));
const TrainingUserPanel = React.lazy(() => import("../pages/task/training/Traininguserpanel"));
const TrainingUserAllocation = React.lazy(() => import("../pages/task/training/TrainingUserallocation"));
const TrainingPostponedList = React.lazy(() => import("../pages/task/training/trainingPostpondlist"));
const TrainingUserCompletedStatus = React.lazy(() => import("../pages/task/training/trainingUserCompletedStatus"));
const TrainingUserResponseLog = React.lazy(() => import("../pages/task/training/trainingUserResponselog"));
const TrainingForUserReport = React.lazy(() => import("../pages/task/training/TrainingUserReport"));
const TrainingUserLog = React.lazy(() => import("../pages/task/training/TrainingUserLog"));
const TaskUserScheduleLog = React.lazy(() => import("../pages/task/TaskUserScheduleLog"));
const Source = React.lazy(() => import("../pages/expenses/Source"));
const Income = React.lazy(() => import("../pages/expenses/Income"));
const AddIncome = React.lazy(() => import("../pages/expenses/AddIncome"));
const Remainder = React.lazy(() => import("../pages/expenses/Remainder"));
const Candidatedocument = React.lazy(() => import("../pages/hr/recruitment/candidatedocument"));
const TrainingUserPanelView = React.lazy(() => import("../pages/task/training/traininguserpanelview"));
const DepartmentLog = React.lazy(() => import("../pages/hr/employees/updatepages/Departmentlog"));
const DepartmentLogList = React.lazy(() => import("../pages/hr/employees/updatepages/Departmentloglist"));
const Addresumeinteractor = React.lazy(() => import("../pages/hr/recruitment/Addresumeinteractor"));
const Checklistverificationmaster = React.lazy(() => import("../pages/checklist/checklistverificationmaster"));
const LoginAllot = React.lazy(() => import("../pages/production/master/LoginAllot"));
const LoginNotAllotList = React.lazy(() => import("../pages/production/LoginNotAllotList"));
const Assignbranch = React.lazy(() => import("../pages/hr/Assignbranch"));
const AllListVisitors = React.lazy(() => import("../pages/interactors/visitors/Allvisitorlist"));
const AssetCapacity = React.lazy(() => import("../pages/asset/assetspecification/AssetCapacity"));
const SalarySlabAdd = React.lazy(() => import("../pages/company/Salaryslabadd"));
const SalarySlabList = React.lazy(() => import("../pages/company/Salaryslablist"));
const Salaryslabfilter = React.lazy(() => import("../pages/company/SalarySlabFilter"));
const ProcessTeam = React.lazy(() => import("../pages/production/master/ProcessTeam"));
const EraAmount = React.lazy(() => import("../pages/production/master/ERAamount"));
const RevenueAmount = React.lazy(() => import("../pages/production/master/Revenueamount"));
const ProcessAllotList = React.lazy(() => import("../pages/hr/employees/updatepages/ProcessAllotlist"));
const ProcessAllot = React.lazy(() => import("../pages/hr/employees/updatepages/ProcessAllot"));
const AllReminderLog = React.lazy(() => import("../pages/expenses/AllRemainderLog"));
const PaymentDueReminder = React.lazy(() => import("../pages/expenses/PaymentDueRemainder"));
const PaymentDueReminderLog = React.lazy(() => import("../pages/expenses/PaymentDueRemainderLog"));
const Longabsentrestrictionlist = React.lazy(() => import("../pages/hr/employees/updatepages/longabsentrestrictionlist"));
const ManageIP = React.lazy(() => import("../pages/asset/ip"));
const IpCategory = React.lazy(() => import("../pages/asset/ipcategory"));
const ManageIpList = React.lazy(() => import("../pages/asset/unassignedip"));
const AssignedIPList = React.lazy(() => import("../pages/asset/assignedip"));
const Errorreason = React.lazy(() => import("../pages/production/penalty/Errorreason"));
const Errorcontrol = React.lazy(() => import("../pages/production/penalty/Errorcontrol"));
const Manageidlework = React.lazy(() => import("../pages/production/penalty/Manageidelwork"));
const TemplateControlLog = React.lazy(() => import("../pages/hr/hrdocuments/TemplateControlLog"));
const LeaveBlockDayList = React.lazy(() => import("../pages/leave/Leaveblockdaylist"));
const OverallAssetReport = React.lazy(() => import("../pages/stockpurchase/OverallAssetReport"));
const AllAssignedCheckList = React.lazy(() => import("../pages/checklist/AllAssignedChecklist"));
const DayPointsUpload = React.lazy(() => import("../pages/production/original/DayPointsUpload"));
const ListProductionPoints = React.lazy(() => import("../pages/production/original/ListProductionPoints"));
const ReportsConsolidated = React.lazy(() => import("../pages/production/original/ReportsConsolidated"));
const ReportsConsolidatedView = React.lazy(() => import("../pages/production/original/ReportsConsolidatedView"));
const ListProductionPointsView = React.lazy(() => import("../pages/production/ReportTempConsolidatedTempView"));
const Productionoriginalupload = React.lazy(() => import("../pages/production/original/Productionoriginalupload"));
const Penaltyamountcreation = React.lazy(() => import("../pages/production/Penaltyamountcreation"));
const MinimumPoints = React.lazy(() => import("../pages/production/master/MinimumPoints"));
const Managecategory = React.lazy(() => import("../pages/production/master/Managecategory"));
const Paycontrol = React.lazy(() => import("../pages/production/master/Payruncontrol"));
const MyShiftRoasterList = React.lazy(() => import("../pages/hr/shiftroaster/Myshiftroaster"));
const UnAssignedBranch = React.lazy(() => import("../pages/hr/Unassignedbranchreport"));
const MyPassword = React.lazy(() => import("../pages/settings/Mypassword"));
const Createidcard = React.lazy(() => import("../pages/hr/hrdocuments/Idcardtemplate"));
const AddemployeeNew = React.lazy(() => import("../pages/hr/employees/Create"));
const InterncreateNew = React.lazy(() => import("../pages/hr/intern/Interncreate"));
const EmployeeDetailStatus = React.lazy(() => import("../pages/hr/employees/Employeedetailsstatus"));
const ChecklistInterview = React.lazy(() => import("../pages/checklist/ChecklistInterview"));
const FileAccess = React.lazy(() => import("../pages/company/file/FileAccess"));
const AnnouncementCategory = React.lazy(() => import("../pages/company/announcement/AnnouncementCategory"));
const Managetypepurposegrouping = React.lazy(() => import("../pages/interactors/Managetypepurposegrouping"));
const AllIncomeandExpenses = React.lazy(() => import("../pages/expenses/AllIncomeandExpenses"));
const Checklisttype = React.lazy(() => import("../pages/checklist/Checklisttype"));
const Checklistcategory = React.lazy(() => import("../pages/checklist/Checklistcategory"));
const Boardinglog = React.lazy(() => import("../pages/hr/employees/updatepages/Boardinglog"));
const Boardingloglist = React.lazy(() => import("../pages/hr/employees/updatepages/Boardingloglist"));
const DesignationMonthSet = React.lazy(() => import("../pages/hr/employees/updatepages/Designationmonthset"));
const Ebreadinganalysisreview = React.lazy(() => import("../pages/eb/Ebreadinganalysisreview"));
const ProcessMonthSet = React.lazy(() => import("../pages/hr/employees/updatepages/Processmonthset"));
const Managestockitems = React.lazy(() => import("../pages/stockpurchase/Managestockitems"));
const HardwareSpecification = React.lazy(() => import("../pages/asset/assetspecification/HardwareSpecification.js"));
const TaskForUser = React.lazy(() => import("../pages/task/taskforUser"));
const TaskUserPanelView = React.lazy(() => import("../pages/task/taskUserPanelView"));
const TaskHierarchyReport = React.lazy(() => import("../pages/task/TaskHierarchyReport"));
const TaskHierarchySummaryReport = React.lazy(() => import("../pages/task/TaskHierarchySummaryReport.js"));
const TrainingHierarchySummaryReport = React.lazy(() => import("../pages/task/training/TrainingHierarchySummaryReport.js"));
const TrainingHierarchyReport = React.lazy(() => import("../pages/task/training/TrainingHierarchyReport"));
const OverallAchievedAccuracyIndividualList = React.lazy(() => import("../pages/quality/Overallachievedaccuracyindividuallist"));
const UnAllotedRemoteSystemName = React.lazy(() => import("../pages/hr/UnAllotedRemoteSystemName"));
const AllotedRemoteSystemName = React.lazy(() => import("../pages/hr/AllotedRemoteSystemName"));
const Announcement = React.lazy(() => import("../pages/company/announcement/Announcement"));
const FileShare = React.lazy(() => import("../pages/company/file/FileShare"));
const SelfCheckPointTicketMaster = React.lazy(() => import("../pages/tickets/SelfCkeckPointTicketMaster"));
const AssetProblemMaster = React.lazy(() => import("../pages/asset/Assetproblemmatser"));
const AssetWorkStationUnassigned = React.lazy(() => import("../pages/asset/AssetWorkstationunassigned"));
const UnAllottedChecklist = React.lazy(() => import("../pages/checklist/UnAllottedChecklist"));
const AllPendingCheckList = React.lazy(() => import("../pages/checklist/AllPendingChecklist"));
const AllInterviewPendingCheckList = React.lazy(() => import("../pages/hr/recruitment/AllInterviewPendingChecklist"));
const ApplyPermission = React.lazy(() => import("../pages/permission/ApplyPermission"));
const ApproveList = React.lazy(() => import("../pages/permission/ApprovedList"));
const TeamPermissionVerification = React.lazy(() => import("../pages/permission/TeamPermissionVerfication"));
const Overallnotresponsereport = React.lazy(() => import("../pages/hr/recruitment/Overallnotresponsereport"));

const UserDocumentUpload = React.lazy(() => import('../pages/hr/Userdocumentupload.js'));
const UserDocumentUploadFilter = React.lazy(() => import('../pages/hr/Userdocumentuploadfilter.js'));



const RequiredMaster = React.lazy(() => import("../pages/tickets/Requiredmaster"));
const CalendarView = React.lazy(() => import("../pages/calendarview"));
const TaskScheduleGrouping = React.lazy(() => import("../pages/task/TaskScheduleGrouping"));
const RaiseTicketTeamGrouping = React.lazy(() => import("../pages/tickets/RaiseTicketTeamGroup"));
const RaiseTicketFilterView = React.lazy(() => import("../pages/tickets/RaiseTicketFilterView"));
const RaiseTicketReport = React.lazy(() => import("../pages/tickets/RaiseTicketReportPage"));
const Employeeinternlivelist = React.lazy(() => import("../pages/hr/employees/Employeeinternlivelist"));
const Internlivelist = React.lazy(() => import("../pages/hr/intern/Internlivelist"));
const InterviewCandidatesReportPage = React.lazy(() => import("../pages/hr/recruitment/InterviewCandidateReport"));
const Ebservicemaster = React.lazy(() => import("../pages/eb/Ebservicemaster"));
const Ebreadingreport = React.lazy(() => import("../pages/eb/Ebreadingreport"));
const Managematerial = React.lazy(() => import("../pages/eb/Managematerial"));
const Ebuseinstrument = React.lazy(() => import("../pages/eb/Ebuseinstrument"));
const Managepowershutdowntype = React.lazy(() => import("../pages/eb/Powershutdowntype"));
const Ebrates = React.lazy(() => import("../pages/eb/Ebrates"));
const Ebreadingdetails = React.lazy(() => import("../pages/eb/Ebreadingdetails"));
const Ebmaterialusagedetails = React.lazy(() => import("../pages/eb/Ebmaterialdetails"));
const VendorMasterForEB = React.lazy(() => import("../pages/eb/Vendormaster"));
const PowerStation = React.lazy(() => import("../pages/eb/Powerstation"));
const PowerStationCalendar = React.lazy(() => import("../pages/eb/Powerstationcalendar"));
const PowerStationFilter = React.lazy(() => import("../pages/eb/Powershutdownfilter"));
const EbreadingdetailsList = React.lazy(() => import("../pages/eb/EbreadingdetailsList"));
const BankDetailsVerification = React.lazy(() => import("../pages/settings/Bankdetailsverification"));
const UnassignedResumeEdit = React.lazy(() => import("../pages/hr/recruitment/Editunassignedresume"));
const Interactortype = React.lazy(() => import("../pages/interactors/Interactortype"));
const InteractorMode = React.lazy(() => import("../pages/interactors/Interactormode"));
const InteractorPurpose = React.lazy(() => import("../pages/interactors/Interactorpurpose"));
const AddVisitors = React.lazy(() => import("../pages/interactors/visitors/Create"));
const ListVisitors = React.lazy(() => import("../pages/interactors/visitors/List"));
const EditVisitors = React.lazy(() => import("../pages/interactors/visitors/Edit"));
const ViewVisitors = React.lazy(() => import("../pages/interactors/visitors/View"));
const VisitorDateFilter = React.lazy(() => import("../pages/interactors/visitors/Visitordatefilter"));
const VisitorFollowupFilter = React.lazy(() => import("../pages/interactors/visitors/Visitorfollowupfilter"));
const Sourceofpayments = React.lazy(() => import("../pages/expenses/Sourceofpayment"));
const DeactivateemployeeslistView = React.lazy(() => import("../pages/hr/exit details/DeactivateEmployeeListView"));
const TaskManualCreation = React.lazy(() => import("../pages/task/TaskManualCreation"));
const MyInterviewList = React.lazy(() => import("../pages/hr/recruitment/Myinterviewlist"));
const Employeeprevalueslist = React.lazy(() => import("../pages/hr/employees/Employeesprevalueslist"));
const EmployeeLoginStatus = React.lazy(() => import("../pages/hr/employees/Employeeloginstatus"));
const ManageClientDetails = React.lazy(() => import("../pages/clientSupport/ManageClientDetails"));
const ClientSupportList = React.lazy(() => import("../pages/clientSupport/ClientSupportList"));
const ManageTicketGrouping = React.lazy(() => import("../pages/clientSupport/ManageTicketGrouping"));
const ClientSupportView = React.lazy(() => import("../pages/clientSupport/ClientSupportView"));
const Visitorlogin = React.lazy(() => import("../pages/settings/Visitorsloginqr"));
const CreateTeam = React.lazy(() => import("../pages/hiconnect/CreateTeam"));
const CreateChannel = React.lazy(() => import("../pages/hiconnect/CreateChannel"));
const AssignmanualsalarydetailsLog = React.lazy(() => import("../pages/hr/employees/updatepages/AssignmanualsalarydetailsLog"));
const Payrunmasterfinal = React.lazy(() => import("../pages/production/salary/Payrunmasterfinal"));
const Losspayrun = React.lazy(() => import("../pages/production/salary/Losspayrun"));
const Fixsalarydate = React.lazy(() => import("../pages/production/salary/FIxsalarydate"));
const Fixholdsalarydate = React.lazy(() => import("../pages/production/salary/FIxholdsalarydate"));
const Holdsalaryconfirm = React.lazy(() => import("../pages/production/salary/Holdsalaryconfirm"));
const Consolidatedsalaryrelease = React.lazy(() => import("../pages/production/salary/Consolidatedsalaryrelease"));
const Bankrelease = React.lazy(() => import("../pages/production/salary/Bankrelease"));
const BankreleaseBreakup = React.lazy(() => import("../pages/production/salary/BankreleaseBreakup"));
const BankreleaseAll = React.lazy(() => import("../pages/production/salary/Bankreleaseall"));
const TemporaryLoginStatus = React.lazy(() => import("../pages/hr/employees/TemporaryLoginStatus"));
const ProductionDayShiftAttendance = React.lazy(() => import("../pages/company/attendance/attendancedayshift"));
const AttendanceShortTime = React.lazy(() => import("../pages/company/attendance/attendanceshorttime"));
const ExitinterviewQuestionMaster = React.lazy(() => import("../pages/hr/noticeperiod/ExitInterviewQuestionMaster"));
const ExitTestMaster = React.lazy(() => import("../pages/hr/noticeperiod/ExitTestMaster"));
const ExitConfirmationList = React.lazy(() => import("../pages/hr/noticeperiod/ExitConfirmationList"));
const AssetStatusRecovery = React.lazy(() => import("../pages/hr/noticeperiod/AssetStatusRecovery"));
const CheckListModuleSelection = React.lazy(() => import("../pages/checklist/ChecklistmoduleSelection"));
const ThemeLayoutList = React.lazy(() => import("../pages/greetinglayout/ThemeLayoutList"));
const Paidstatusfixlist = React.lazy(() => import("../pages/production/master/Paidstatusfixlist"));
const Categorymaster = React.lazy(() => import("../pages/greetinglayout/Categorymaster"));
const Subcategorymaster = React.lazy(() => import("../pages/greetinglayout/Subcategorymaster"));
const CategoryThemeGrouping = React.lazy(() => import("../pages/greetinglayout/CategoryThemeGrouping"));
const PosterGenerate = React.lazy(() => import("../pages/greetinglayout/PosterGenerate"));
const ManualOverallReport = React.lazy(() => import("../pages/production/reports/ManualOverallReport"));
const FlagCountOthertaskList = React.lazy(() => import("../pages/othertask/flagcountwiseothertask"));
const ListPageAccessMode = React.lazy(() => import("../pages/company/roles/ListPageAccessMode"));
const Reportingheadercreate = React.lazy(() => import("../pages/company/roles/Reportingheadercreate"));
const Reportingheaderedit = React.lazy(() => import("../pages/company/roles/Reportingheaderedit"));
const PayslipTemplateTwo = React.lazy(() => import("../pages/hr/hrdocuments/paysliplayouttwo"));
const Payslipthree = React.lazy(() => import("../pages/hr/hrdocuments/paysliplayoutthree"));
const Payslip = React.lazy(() => import("../pages/hr/hrdocuments/paysliplayoutone"));
const LongAbsentRestrictionHierarchyList = React.lazy(() => import("../pages/hr/employees/updatepages/LongAbsentRestrictionHierarchyList"));
const PosterMessageSetting = React.lazy(() => import("../pages/greetinglayout/PostermessageSetting"));
const PayRunControlReportPage = React.lazy(() => import("../pages/production/PayRunControlReportPage"));
const PosterKeyWordInstructions = React.lazy(() => import("../pages/greetinglayout/Posterkeywordswishes"));
const IndividualWorkstation = React.lazy(() => import("../pages/hr/employees/updatepages/IndividualworkStation"));
const HierarchyBasedEmployeeWorkstationStatus = React.lazy(() => import("../pages/hr/employees/updatepages/HierarchyEmployeeworkstation"));
const ApproveLeaveList = React.lazy(() => import("../pages/leave/TodayLeaveApproved"));
const HomeNoticestatuslist = React.lazy(() => import("../pages/hr/noticeperiod/HomeNoticePeriodApproveList"));
const Notcheckinemplist = React.lazy(() => import("../pages/Notcheckinemplist"));
const Watermark = React.lazy(() => import("../Watermark"));
const PaySlipDocumentPreparation = React.lazy(() => import("../pages/hr/hrdocuments/PaySlipDocumentPreparation"));
const ProductionIndividualList = React.lazy(() => import("../pages/production/manual/productionindividuallist"));
const PendingManualentrylist = React.lazy(() => import("../pages/production/manual/pendingmanualentrylist"));
const MikrotikMaster = React.lazy(() => import("../pages/mikrotik/MikrotikMaster"));
const Interfaces = React.lazy(() => import("../pages/mikrotik/Interfaces"));
const PppInterface = React.lazy(() => import("../pages/mikrotik/ppp/PppInterface"));
const PppProfiles = React.lazy(() => import("../pages/mikrotik/ppp/PppProfiles"));
const PppSecrets = React.lazy(() => import("../pages/mikrotik/ppp/PppSecrets"));
const Logs = React.lazy(() => import("../pages/mikrotik/Logs"));
const PppL2tpServer = React.lazy(() => import("../pages/mikrotik/ppp/PppL2tpServer"));
const PppPPTPServer = React.lazy(() => import("../pages/mikrotik/ppp/PppPPTPServer"));
const PppActiveConnections = React.lazy(() => import("../pages/mikrotik/ppp/PppActiveConnections"));
const IdleTimeList = React.lazy(() => import("../pages/hr/shiftroaster/Idletime"));
const AssignUserName = React.lazy(() => import("../pages/hr/employees/updatepages/AssignUserNameForPc"));
const DesktopLoginReport = React.lazy(() => import("../pages/hr/employees/updatepages/DesktopLoginReport"));
const MaintenanceList = React.lazy(() => import("../pages/Maintenancefilterlist"));
const UserActivity = React.lazy(() => import("../pages/hr/employees/updatepages/UserActivity"));
const UserActivityScreenshot = React.lazy(() => import("../pages/hr/employees/updatepages/UserActivityScreenshot"));
const CompanyEmailsList = React.lazy(() => import("../pages/hr/employees/updatepages/CompanyEmailsList"));
const UserActivityLiveScreen = React.lazy(() => import("../pages/hr/UserActivityLiveScreen"));
const ProductionMismatchStatusTemp = React.lazy(() => import("../pages/production/temp/Mismatchstatustemp"));
const ProductionMismatchStatus = React.lazy(() => import("../pages/production/original/Mismatchstatus"));
const BulkErrorUpload = React.lazy(() => import("../pages/production/penalty/Bulkerrorupload"));
const Penaltytotalfieldupload = React.lazy(() => import("../pages/production/penalty/Penaltytotalfieldupload"));
const NotificationSound = React.lazy(() => import("../pages/settings/NotificationSound"));
const ShiftAdjustmentListFilter = React.lazy(() => import("../pages/hr/shiftroaster/ShiftAdjustmentFilter"));
const ShiftAdjustmentListWeekoffFilter = React.lazy(() => import("../pages/hr/shiftroaster/ShiftAdjustmentWeekoffFilter"));
const LongabsentrestrictionCompleted = React.lazy(() => import("../pages/hr/employees/updatepages/longabsentrestrictioncompletedlist"));
const PenaltyErrorMode = React.lazy(() => import("../pages/production/penalty/ErrorMode"));
const Validationerrorentry = React.lazy(() => import("../pages/production/penalty/Validationerrorentry"));
const Errorinvalidapproval = React.lazy(() => import("../pages/production/penalty/Errorinvalidapproval"));
const Errorvalidapproval = React.lazy(() => import("../pages/production/penalty/Errorvalidapproval"));
const Clienterrorstatus = React.lazy(() => import("../pages/production/penalty/Clienterrorstatus"));
const Erroruploadconfirm = React.lazy(() => import("../pages/production/penalty/Erroruploadconfirm"));
const Penaltywaivermaster = React.lazy(() => import("../pages/production/penalty/Penaltywaivermaster"));
const Clienterrormonthamount = React.lazy(() => import("../pages/production/penalty/Clienterrormonthamount"));
const Clienterrorchecklist = React.lazy(() => import("../pages/production/penalty/Clienterrorchecklist"));
const Manualerrorupdate = React.lazy(() => import("../pages/production/penalty/Manualerrorupdate"));
const Waiveremployeeforward = React.lazy(() => import("../pages/production/penalty/Waiveremployeeforward"));
const Clienterrorwaiver = React.lazy(() => import("../pages/production/penalty/Clienterrorwaiver"));
const Clienterrorforward = React.lazy(() => import("../pages/production/penalty/Clienterrorforward"));
const Clienterrorwaiverapproval = React.lazy(() => import("../pages/production/penalty/Clienterrorwaiverapproval"));
const Approvalemployeeforward = React.lazy(() => import("../pages/production/penalty/Approvalemployeeforward"));
const RocketchatTeam = React.lazy(() => import("../pages/rocketchat/RocketchatTeam"));
const RocketchatChannel = React.lazy(() => import("../pages/rocketchat/RocketchatChannel"));
const RocketchatTeamChannelGrouping = React.lazy(() => import("../pages/rocketchat/RocketchatTeamChannelGrouping"));
const IpPools = React.lazy(() => import("../pages/mikrotik/ip/IpPools"));
const IpPoolUsedAddresses = React.lazy(() => import("../pages/mikrotik/ip/IpPoolUsedAddresses"));
const ChatConfigurationsettings = React.lazy(() => import("../pages/settings/Chatconfigurationsetting"));
const RocketchatMembersList = React.lazy(() => import("../pages/rocketchat/RocketchatMembersList"));
const ProductionIndividualBulk = React.lazy(() => import("../pages/production/manual/productionindividualbulk"));
const Typemasterdocument = React.lazy(() => import("../pages/hr/documents/Typemasterdocument"));
const Userpayslip = React.lazy(() => import("../pages/production/salary/Payslip"));
const Teamaccessible = React.lazy(() => import("../pages/hr/Teamaccessible"));
const ScreenSaver = React.lazy(() => import("../pages/ScreenSaver"));
const MyProductionIndividual = React.lazy(() => import("../pages/production/manual/MyProductionIndividual"));
const PppSecretsList = React.lazy(() => import("../pages/mikrotik/ppp/PppSecretsList"));
const MaunalUnitrateAprrovals = React.lazy(() => import("../pages/production/original/Manualunitrateapproval"));
const ProductionUnAllottedList = React.lazy(() => import("../pages/production/original/UnitRateUnAllotData"));
const ManualEntryTimeStudy = React.lazy(() => import("../pages/production/manual/ManualEntryClientInfo"));
const ManualEntryTimeStudyOverallReport = React.lazy(() => import("../pages/production/reports/ManualentryClientInfoList"));
const ManualEntryTimeStudySelfReport = React.lazy(() => import("../pages/production/reports/Manualtimestudyselfreport"));
const Reportingtoheadermodulelist = React.lazy(() => import("../pages/company/roles/Reportingtoheadermodulelist"));
const RocketChatUsersList = React.lazy(() => import("../pages/rocketchat/RocketChatUsersList"));
const ManualEntryTimeStudyList = React.lazy(() => import("../pages/production/reports/Manualentrytimestudylist"));
const PendingManualEntryTimeStudyList = React.lazy(() => import("../pages/production/reports/PendingTimeStudyList"));
const Accessiblebranchfilter = React.lazy(() => import("../pages/hr/Accessiblebranchfilter.js"));


const BiometricUsersPendingReport = React.lazy(() => import("../pages/hr/employees/updatepages/BiometricUsersPendingReport.js"));
const BiometricUserImportFromDevice = React.lazy(() => import("../pages/hr/employees/updatepages/BiometricUserImportFromDevice.js"));
const BiometricUnregisteredUsers = React.lazy(() => import("../pages/hr/employees/updatepages/BiometricUnregisteredUsers.js"));
const BiometricUsersGrouping = React.lazy(() => import("../pages/hr/employees/updatepages/BiometricUsersGrouping.js"));
const BiometricPairedDevicesGrouping = React.lazy(() => import("../pages/hr/employees/updatepages/BiometricPairedDevicesGrouping.js"));
const BiometricUsersAttendanceReport = React.lazy(() => import("../pages/hr/employees/updatepages/BiometricAttendanceReport.js"));
const BiometricTeamAttendanceReport = React.lazy(() => import("../pages/hr/employees/updatepages/BiometricTeamAttendanceReport.js"));
const BiometricUnmatchedUserAttendanceReport = React.lazy(() => import("../pages/hr/employees/updatepages/BiometricUnmatchedUserAttendanceReport.js"));
const BiometricUsersAttendanceTotalHoursReport = React.lazy(() => import("../pages/hr/employees/updatepages/BiometricAttendanceTotalHoursReport.js"));
const BiometricExitReport = React.lazy(() => import("../pages/hr/employees/updatepages/BiometricExitReport.js"));
const BiometricBranchWiseExitReport = React.lazy(() => import("../pages/hr/employees/updatepages/BiometricBranchWiseExitReport.js"));
const BiometricNonEntryBranchWiseList = React.lazy(() => import("../pages/hr/employees/updatepages/BiometricNonEntryBranchWiseList.js"));
const IndividualRemoteEmployeeList = React.lazy(() => import("../pages/hr/employees/updatepages/IndividualRemoteEmployeeList"));
const HierarchyRemoteEmployeeList = React.lazy(() => import("../pages/hr/employees/updatepages/HierarchyRemoteEmployeeList"));
const Assignbranchmodulelist = React.lazy(() => import("../pages/hr/Assignbranchmodulelist"));
const SheetName = React.lazy(() => import("../pages/production/master/SheetName"));
const TypeMaster = React.lazy(() => import("../pages/production/TypeMaster.js"));
const QueueTypeMaster = React.lazy(() => import("../pages/production/QueueTypeMaster.js"));
const Assignbiometricdevicelist = React.lazy(() => import("../pages/hr/Assignbiometricdevicelist.js"));
const Assignedbiometricdevicelist = React.lazy(() => import("../pages/hr/Assignedbiometricdevicelist.js"));
const HolidayWeekoffLoginList = React.lazy(() => import("../pages/hr/shiftroaster/Weekoffholiday"));
const OtherTaskConsolidatedReport = React.lazy(() => import("../pages/othertask/OtherTaskConsolidatedReport.js"));
const OtherTaskIndividualReport = React.lazy(() => import("../pages/othertask/OtherTaskIndividualReport.js"));
const RocketChatUnAssignedUsersList = React.lazy(() => import("../pages/rocketchat/RocketChatUnAssignedUsersList.js"));
// const QueueTypeReport = React.lazy(() => import("../pages/production/QueueTypereport.js"));
const Mailconfiguration = React.lazy(() => import("../pages/settings/Mailconfiguration"));
const Meetingconfiguration = React.lazy(() => import("../pages/settings/Meetingconfiguration"));
const Assignworkfromhome = React.lazy(() => import("../pages/hr/Assignworkfromhome.js"));
const Applyworkfromhome = React.lazy(() => import("../pages/hr/Applyworkfromhome.js"));
const TargetpointsFilter = React.lazy(() => import("../pages/production/Targetpointsfilter"));
const Targetpointslist = React.lazy(() => import("../pages/production/master/Targetpointslist.js"));
const EraAmountlist = React.lazy(() => import("../pages/production/master/ERAamountlist"));
const RevenueAmountlist = React.lazy(() => import("../pages/production/master/Revenueamountlist"));
const ProductionindividualEdit = React.lazy(() => import("../pages/production/manual/Productionindividualedit.js"));
const QueueTypeReportSummary = React.lazy(() => import("../pages/production/QueueTypeReportSummary.js"));
const OtherTaskUpload = React.lazy(() => import("../pages/production/original/OtherTaskUpload.js"));
const OtherTaskUploadList = React.lazy(() => import("../pages/production/original/OtherTaskUploadList.js"));
const OtherTaskUploadEdit = React.lazy(() => import("../pages/production/original/OtherTaskEditSingleView.js"));
const UnAssignedReportList = React.lazy(() => import("../pages/production/master/UnAssignedReportList.js"));
// const Powerpoint = React.lazy(() => import("../pages/greetinglayout/Powerpoint.js"));
const AttendanceBulkUpdate = React.lazy(() => import("../pages/company/attendance/AttendanceBulkUpdate"));
const PPTCategoryAndSubCategory = React.lazy(() => import("../pages/greetinglayout/PPTCategoryAndSubcategory"));
// const PowerpointList = React.lazy(() => import("../pages/greetinglayout/PowerpointList"));
// const EditPowerpoint = React.lazy(() => import("../pages/greetinglayout/EditPowerpoint"));
const MaintenanceDetailsMaster = React.lazy(() => import("../pages/asset/MaintanceDetailsMaster"));
const IndividualEmployeeAssetDistribution = React.lazy(() => import("../pages/asset/IndividualEmployeeAssetDistribution"));
const EmployeeAssetReturnRegister = React.lazy(() => import("../pages/asset/EmployeeAssetReturnRegister"));
const EmployeeAssetDistributionLog = React.lazy(() => import("../pages/asset/EmployeeAssetDistributionLog.js"));
const TeamAssetAcceptanceList = React.lazy(() => import("../pages/asset/TeamAssetAcceptanceList.js"));
const EmployeeAssetTransferOrReturn = React.lazy(() => import("../pages/asset/EmployeeAssetTransferOrReturn.js"));
const ProductionOriginalSummary = React.lazy(() => import("../pages/production/ProductionOriginalSummary"));
const AllStockList = React.lazy(() => import("../pages/stockpurchase/AllStockList"));
const AttendanceBulkUpdateReport = React.lazy(() => import("../pages/company/attendance/AttendanceBulkUpdateReport"));
const OverallTrainingForUserReport = React.lazy(() => import("../pages/task/training/OverallTrainingUsersReport.js"));
const OverallTaskForUsersReport = React.lazy(() => import("../pages/task/OverallTaskForUsersReport.js"));
const ProductionTempSummary = React.lazy(() => import("../pages/production/ProductionTempSummary"));
const ShiftBreakHours = React.lazy(() => import("../pages/hr/ShiftBreakHours"));
const Newrateupdate = React.lazy(() => import('../pages/production/reports/Newrateupdate.js'));
const ViewOverallHistoryVisitor = React.lazy(() => import("../pages/interactors/visitors/ViewOverallHistoryVisitor"));
const ViewOverallHistoryVisitorLog = React.lazy(() => import("../pages/interactors/visitors/ViewOverallHistoryVisitorLog"));
const VisitorDetailsLog = React.lazy(() => import("../pages/interactors/visitors/VisitorDetailsLog"));
const VisitorDetailsLogList = React.lazy(() => import("../pages/interactors/visitors/VisitorDetailsLogList"));
const ApprovedAdvance = React.lazy(() => import("../pages/production/ApprovedAdvance"));
const AdvanceRequest = React.lazy(() => import("../pages/production/AdvanceRequest"));
const RejoinEmployeeCreate = React.lazy(() => import("../pages/hr/employees/RejoinEmployeeCreate"));
const RejoinInternCreate = React.lazy(() => import("../pages/hr/intern/RejoinInternCreate"));
const ApplicationName = React.lazy(() => import("../pages/asset/assetspecification/ApplicationName"));
const Operatingsystem = React.lazy(() => import("../pages/asset/assetspecification/Operatingsystem"));
const BiometricDeviceManagement = React.lazy(() => import("../pages/biometric/BiometricDeviceManagement.js"));
const BiometricDevicesPairing = React.lazy(() => import("../pages/biometric/BiometricDevicesPairing.js"));
const Biometricremotecontrol = React.lazy(() => import('../pages/biometric/Biometricremotecontrol.js'));
const Biometricbrandmodel = React.lazy(() => import('../pages/biometric/Biometricbrandmodel'));



const BiometricstatusList = React.lazy(() => import("../pages/biometric/BiometricStatusList"));
const ApprovalDocumentsForUser = React.lazy(() => import("../pages/hr/hrdocuments/ApprovalDocumentsForUser"));
const CandidateDocumentsApproval = React.lazy(() => import("../pages/hr/hrdocuments/CandidateDocumentsApproval.js"));
const CandidateDocumentsPrintedStatusList = React.lazy(() => import("../pages/hr/hrdocuments/CandidateDocumentPrintedStatusList.js"));
const HierarchyApprovalEmployeeDocuments = React.lazy(() => import("../pages/hr/hrdocuments/HierarchyApprovalEmployeeDocuments"));
const InterviewVerification = React.lazy(() => import("../pages/interview/InterviewVerification.js"));
const VisitorOutEntry = React.lazy(() => import("../pages/interactors/visitors/VisitorOutEntry"));
const HiTrackerNotInstalledUsers = React.lazy(() => import("../pages/hr/employees/updatepages/HiTrackerNotInstalledUsers"));
const SoftwareSpecification = React.lazy(() => import("../pages/asset/assetspecification/SoftwareSpecification.js"));
const AssetSoftwareGrouping = React.lazy(() => import("../pages/asset/assetspecification/AssetSoftwareGrouping"));
const TermsandCondition = React.lazy(() => import("../pages/hr/hrdocuments/TermsandCondition"));
const NewrateOverallReport = React.lazy(() => import('../pages/production/original/NewrateOverallReport.js'));
const TypingPracticeQuestions = React.lazy(() => import("../pages/interview/TypingPracticeQuestions"));
const TypingPracticeQuestionsGrouping = React.lazy(() => import("../pages/interview/TypingPracticeQuestionsGrouping"));
const TypingPracticeSession = React.lazy(() => import("../pages/interview/TypingPracticeSession.js"));
const IndividualPracticeSessionResponse = React.lazy(() => import("../pages/interview/IndividualPracticeSessionResponse.js"));
const GroupingPracticeSessionResponse = React.lazy(() => import("../pages/interview/GroupingPracticeSessionResponse.js"));
const AssetSoftwaredetails = React.lazy(() => import("../pages/asset/assetsoftwaredetails.js"));
const AssetSoftwareDetailsList = React.lazy(() => import("../pages/asset/assetsoftwaredetailslist.js"));
const Clienterroroverallreport = React.lazy(() => import("../pages/production/penalty/Clienterroroverallreport"));
const OverallTypingPracticeResponse = React.lazy(() => import("../pages/interview/OverallTypingPracticeResponse.js"));
const AttendanceWithProdOverallReview = React.lazy(() => import("../pages/company/attendance/Attendancewithprodoverallreview"));
const IndividualEmployeeInternalstatusList = React.lazy(() => import("../pages/quality/IndividualInternalstatuslist.js"));
const StockNotificatonList = React.lazy(() => import("../pages/stockpurchase/stockmanagementnotificationlist.js"));
const StockManagementReport = React.lazy(() => import("../pages/stockpurchase/stockmanagementreport.js"));
const PaidstatusfixMonthSet = React.lazy(() => import("../pages/production/master/Paidstatusfixmonthset.js"));
const Penaltywaivermonthset = React.lazy(() => import("../pages/production/penalty/Penaltywaivermonthset.js"));
const QueueTypeUnassignedReport = React.lazy(() => import("../pages/production/QueueTypeUnassignedReport.js"));
const ProductionMonthoriginalupload = React.lazy(() => import('../pages/production/original/ProductionOriginalMonthUpload.js'));
const ProductionMonthUpload = React.lazy(() => import('../pages/production/original/ProdutcionOriginalMonthUploadList.js'));
const AddEmployeeSignature = React.lazy(() => import("../pages/hr/employees/updatepages/Addemployeesignature"));
const AchievedAccuracyIndividualReviewInternalstatusSummaryList = React.lazy(() => import("../pages/quality/Achievedaccuracyindividualreviewinternalstatussummarylist.js"));
const TicketMaintenanceReport = React.lazy(() => import("../pages/asset/TicketMaintenanceReport.js"));
const AttendanceWithProdOverallReviewIndv = React.lazy(() => import("../pages/company/attendance/Attendancewithprodoverallreviewindv"));
const OverallMaintenanceTaskReport = React.lazy(() => import("../pages/asset/OverallMaintenanceTaskReport.js"));
const Addotherpayment = React.lazy(() => import("../pages/account/AddOtherpayment"));
const Ebservicemasterloglist = React.lazy(() => import("../pages/eb/ebservicemasterloglist"))
const App = () => {
  return (
    <>
      <Suspense fallback={<Loading />}>
        <Watermark />
        <Routes>
          {/* career */}
          <Route path="appcareer/jobroles" element={<Jobroles />} />
          <Route path="appcareer/jobdescriptions/:jobname/:id" element={<Jobdescription />} />
          <Route path="appcareer/candidates/:id" element={<Candidate />} />

          {/* <Route index element={<Login />} /> */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="dashboard" element={<Home />} />
            <Route path="branch" element={<Branch />} />
            <Route path="unit" element={<Unit />} />
            <Route path="area" element={<Area />} />
            <Route path="location" element={<Location />} />
            <Route path="floor" element={<Floor />} />
            <Route path="department" element={<Department />} />
            <Route path="designation" element={<Designation />} />
            <Route path="designationgroup" element={<Designationgroup />} />
            <Route path="advance" element={<Advance />} />
            <Route path="/loan" element={<Loan />} />
            <Route path="/approvedloan" element={<ApprovedLoan />} />
            <Route path="/loanrequest" element={<LoanRequest />} />
            <Route path="interview/assigninterviewer" element={<Assigninterviewer />} />
            <Route path="inactivecandidates/:id" element={<InactiveCandidates />} />
            <Route path="addlead" element={<AddLead />} />
            <Route path="leadlist" element={<LeadList />} />
            <Route path="qualification" element={<Qualification />} />
            <Route path="teams" element={<Teams />} />
            <Route path="shift" element={<Shift />} />
            <Route path="shiftroaster" element={<Shiftroaster />} />
            <Route path="shiftadjustment" element={<ShiftAdjustmentList />} />
            <Route path="shiftroaster/:id" element={<Setlist />} />
            <Route path="attendance/monthstatuslist" element={<AttendanceMonthStatusList />} />
            <Route path="attendance/checklist" element={<AttendanceCheckList />} />
            <Route path="attendance/modemaster" element={<Attendancestatusmode />} />
            <Route path="attendance/individualstatuslist" element={<AttendanceIndividualStatusList />} />
            <Route path="attendance/myindividualstatuslist" element={<AttendanceIndividualMyStatus />} />
            <Route path="attendance/review" element={<AttendanceReview />} />
            <Route path="usershiftlist" element={<UserShiftList />} />
            <Route path="usershiftroaster" element={<UserShiftRoasterList />} />
            <Route path="shiftfilterview" element={<ShiftRoasterFilter />} />
            {/* <Route path="myshiftadjustment" element={<MyShiftAdjustmentList />} /> */}
            <Route path="myshiftadjustment" element={<MyShiftAdjustmentListFilter />} />
            <Route path="shiftgrouping" element={<ShiftGrouping />} />
            <Route path="education" element={<Education />} />
            <Route path="educationcategory" element={<Educationcategory />} />
            <Route path="educationspecilization" element={<Educationspecilization />} />
            <Route path="updatepages/assignexperience" element={<Assignexperience />} />
            <Route path="certification" element={<Certificaion />} />
            <Route path="skillset" element={<Skillset />} />
            <Route path="interncourse" element={<Interncourse />} />
            <Route path="attendancestatusmaster" element={<Attedancestatusmaster />} />
            <Route path="manpower" element={<Manpower />} />
            <Route path="controlname" element={<ControlName />} />
            <Route path="areagrouping" element={<Areagrouping />} />
            <Route path="locationgrouping" element={<Locationgrouping />} />
            <Route path="employeesystemallot" element={<Employeesystemallot />} />
            <Route path="workstation" element={<WorkStation />} />
            <Route path="updatepages/workstationsystemname" element={<Workstationsystemname />} />
            <Route path="departmentanddesignationgrouping" element={<Departmentanddesignationgrouping />} />
            <Route path="asset/assetmaterialip" element={<AssetMaterialIP />} />
            <Route path="asset/assetworkstationgrouping" element={<AssetWorkstationGrouping />} />
            <Route path="reportcompanyothertasklist" element={<ReportCompanyOthertaskList />} />
            <Route path="reportemployeeothertasklist" element={<ReportEmployeeOthertaskList />} />
            {/* //projectdetails */}
            <Route path="addemployee" element={<Addemployee />} />
            <Route path="edit/:id" element={<Editemployee />} />
            <Route path="list" element={<Listemployee />} />
            <Route path="view/:id/:from" element={<Viewemployee />} />
            <Route path="updatepages/personalupdate" element={<Personalupdate />} />
            <Route path="updatepages/contactupdate" element={<Contactupdate />} />
            <Route path="updatepages/loginupdate" element={<Loginupdate />} />
            <Route path="updatepages/boardingupdate" element={<Boardingupdate />} />
            <Route path="updatepages/documentupdate" element={<Documentupdate />} />
            <Route path="updatepages/Joiningupdate" element={<Joiningupdate />} />
            <Route path="updatepages/educationalupdate" element={<Educationalupdate />} />
            <Route path="updatepages/addlqualificationupdate" element={<Addlqualificationupdate />} />
            <Route path="updatepages/workhistoryupdate" element={<Workhistoryupdate />} />
            <Route path="updatepages/assignedrole" element={<Assignedrole />} />
            <Route path="updatepages/departmentmonthset" element={<DepartmentMonthSet />} />
            <Route path="updatepages/assignbankdetail" element={<Assignbankdetail />} />
            <Route path="updatepages/assignworkstation" element={<AssignWorkStation />} />
            <Route path="profile/:id/:form" element={<Profile />} />
            <Route path="profile/:id" element={<Profile />} />
            <Route path="todo" element={<TodoList />} />
            <Route path="cropper" element={<ImageCropper />} />
            <Route path="liveemployeelist" element={<LiveEmployeeList />} />
            <Route path="attendancedayshift" element={<ProductionDayShiftAttendance />} />
            <Route path="attendanceshorttime" element={<AttendanceShortTime />} />
            <Route path="/updatepages/noticeperiodactionemployeelist" element={<Noticeperiodactionemployeelist />} />
            {/* intern */}
            <Route path="intern" element={<Intern />} />
            <Route path="interncertificate/:id" element={<Interncertificate />} />
            <Route path="/movetolive/:id" element={<EditMovietolive />} />
            {/* Project */}
            <Route path="project/project" element={<Project />} />
            <Route path="project/subproject" element={<Subproject />} />
            <Route path="project/module" element={<Module />} />
            <Route path="project/submodule" element={<Submodule />} />
            <Route path="project/submodulelistview" element={<Submodulelistview />} />
            <Route path="project/requirements" element={<Requirements />} />
            <Route path="project/pagetype" element={<Pagetype />} />
            <Route path="project/priority" element={<Priority />} />
            <Route path="project/pagemodel" element={<Pagemodel />} />
            <Route path="project/pagemodelfetch/:id" element={<Pagemodelfetch />} />
            <Route path="project/pagemodelfetchEdit/:id" element={<PagemodelfetchEdit />} />
            <Route path="project/taskassignboardlistcreate/:id" element={<Taskcreate />} />
            <Route path="project/taskreport" element={<Taskreportpage />} />
            <Route path="project/taskpagedevmanager/:id" element={<Taskdevmanagerpage />} />
            <Route path="project/nottaskassignboard" element={<Taskassigned />} />
            <Route path="project/taskassignboard" element={<Taskassignedlist />} />
            <Route path="project/tasklist" element={<Tasklist />} />
            <Route path="project/taskuipage/:id" element={<Taskuipage />} />
            <Route path="project/taskdevpage/:id" element={<Taskdevpage />} />
            <Route path="project/tasktesterpage/:id" element={<Tasktesterpage />} />
            <Route path="project/Taskuipageadmin/:id" element={<Taskuipageadmin />} />
            <Route path="project/Taskdevpageadmin/:id" element={<Taskdevpageadmin />} />
            <Route path="project/tasktesterpageadmin/:id" element={<Tasktestpageadmin />} />
            <Route path="interviewrounds/:id" element={<InterviewRounds />} />

            <Route path="assetproblemmaster" element={<AssetProblemMaster />} />
            <Route path="asset/assetworkstationgroupingreport" element={<AssetWorkStationUnassigned />} />
            {/* stockcategory */}
            <Route path="stockcategory" element={<StockCategory />} />
            {/* company */}
            <Route path="company" element={<Company />} />
            <Route path="attendancelist" element={<AttendanceList />} />
            <Route path="attendancereport" element={<AttendanceReport />} />
            <Route path="remark" element={<RemarkList />} />
            <Route path="setup/hierarchy" element={<Hierarchy />} />
            <Route path="setup/notassignhierarchylist" element={<NotAssignHierarchy />} />
            <Route path="setup/hierarchy/edit/:id" element={<HierarchyEdit />} />
            {/* EXCEL */}
            <Route path="excel/projectexcel" element={<Projectexcel />} />
            <Route path="excel/vendorexcel" element={<Vendorexcel />} />
            <Route path="excel/categoryexcel" element={<Categoryexcel />} />
            <Route path="excel/subcategoryexcel" element={<Subategoryexcel />} />
            <Route path="excel/queuemasterexcel" element={<Queueexcel />} />
            <Route path="excel/timeandpoints" element={<Timeandpointsexcel />} />
            <Route path="excel/importcategoryexcel" element={<Importcategoryexcel />} />
            <Route path="excel/importsubcategoryexcel" element={<Importsubcategoryexcel />} />
            <Route path="excel/importtimeandpoints" element={<Importtimeandpoints />} />
            <Route path="excel/components/componentlist" element={<Componentlist />} />
            <Route path="excel/components/subcomponentlist" element={<SubComponentlist />} />
            <Route path="excel/components/componentgroup" element={<Componentgroup />} />
            <Route path="excel/queuegrouping" element={<Queuegrouping />} />
            <Route path="company/recuritment/:id" element={<Recuritment />} />
            <Route path="addcandidate/:id" element={<Addcandidate />} />
            <Route path="assignmanualsalarydetails" element={<Assignmanualsalarydetails />} />
            <Route path="assignednmanualsalarydetails" element={<Assignedmanualsalarydetails />} />
            <Route path="/quality/accuracy/acheivedaccuracyindividual" element={<AcheivedAccurayIndividual />} />
            <Route path="/quality/accuracy/acheivedaccuracyindividualedit/:subid/:mainid" element={<AchievedAccuracyIndividualEdit />} />
            <Route path="updatepages/designationloggrouping" element={<DesignationLogGrouping />} />
            {/* WORK ORDER */}
            <Route path="excel/tertiaryworkorderlist" element={<Tertiaryworkorder />} />
            <Route path="excel/secondaryworkorderlist" element={<Seondaryworkorder />} />
            <Route path="excel/primaryworkorderlist" element={<Primarworkorder />} />
            <Route path="excel/othersworkorderlist" element={<Othersworkorder />} />
            <Route path="excel/consolidatedprimaryworkorderlist" element={<Consolidatedwprimaryorkorder />} />
            <Route path="excel/consolidatedallworkorderlist" element={<Consolidatedallworkorder />} />
            <Route path="excel/primaryindividualworkorder" element={<PrimaryIndividualworkorder />} />
            <Route path="excel/secondaryindividualworkorder" element={<SecondaryIndividualworkorder />} />
            <Route path="excel/otherindividualworkorder" element={<OtherIndividualworkorder />} />
            <Route path="excel/tertiaryindividualworkorder" element={<TertiaryIndividualworkorder />} />
            <Route path="excel/consolidatedindividualall" element={<IndividualconsolidatedAll />} />
            <Route path="excel/consolidatedindividualprimarysecondarytertiary" element={<IndividualPrimarySeondaryTertiaryAll />} />
            <Route path="addcategorydoc" element={<DocumentCategory />} />
            <Route path="expense/sourceofpayments" element={<Sourceofpayments />} />
            <Route path="documents" element={<AddDocument />} />
            <Route path="hr/noticeperiodhierarchy" element={<NoticeperiodApplyHierarchy />} />
            <Route path="listdocument" element={<DocumentsList />} />
            <Route path="documentlist/edit/:id/:origin" element={<EditDocument />} />
            <Route path="documentlist/view/:id/:origin" element={<ViewDocument />} />
            <Route path="overalllistdocument" element={<OverallDocumentsList />} />
            <Route path="listofdocument" element={<Listofdocument />} />
            <Route path="documentgrouping" element={<Documentgrouping />} />
            <Route path="penalty/penaltyamountconsolidate" element={<PenaltyAmountConsolidate />} />
            <Route path="penalty/penaltyamountconsolidateview/:id" element={<PenaltyAmountConsolidateView />} />
            <Route path="createrole" element={<CreateRole />} />
            <Route path="myshiftroasterlist" element={<MyShiftRoasterList />} />
            <Route path="settings/mypasswordcredentials" element={<MyPassword />} />
            <Route path="Controlsgrouping" element={<Controlsgrouping />} />
            <Route path="excel/workorderlive" element={<Workorderlive />} />
            <Route path="updatepages/unallottedremotesystemname" element={<UnAllotedRemoteSystemName />} />
            <Route path="updatepages/allottedremotesystemname" element={<AllotedRemoteSystemName />} />
            <Route path="hrdocuments/companydocuments" element={<CompanyDocumentPreparationPrinted />} />
            <Route path="hrdocuments/employeedocumentstatus" element={<EmployeeDocumentStatus />} />
            {/* //EXCELREPORTS */}
            <Route path="excel/reports/branchwise" element={<Branchwise />} />
            <Route path="excel/reports/queuewise" element={<Queuewise />} />
            <Route path="excel/reports/teamwise" element={<Teamwise />} />
            <Route path="excel/reports/responsibleperson" element={<ResponsiblePerson />} />
            <Route path="excel/reports/customerwise" element={<Customerwise />} />
            <Route path="excel/reports/categorywise" element={<Categorywise />} />
            {/* //EXCEL allotlist */}

            <Route path="excel/allotlist/allotqueuelist" element={<Allotqueuelist />} />
            <Route path="excel/allotlist/unallotqueuelist" element={<Unallotqueuelist />} />
            <Route path="excel/allotlist/allottedresponsiblelist" element={<Allottedresponsiblelist />} />
            <Route path="excel/allotlist/unallottedresponsiblelist" element={<Unallottedresponsiblelist />} />
            <Route path="updatepages/assignexperiencefilter" element={<Assignexperiencefilter />} />
            <Route path="internlist" element={<InternList />} />
            <Route path="intern/create" element={<Interncreate />} />
            <Route path="internedit/:id" element={<InternEdit />} />
            <Route path="hr/hierarchyloginsttaus" element={<HierarchyBasedEmployeeLoginStatus />} />
            <Route path="hr/individualloginsttaus" element={<IndividualEmployeeLoginStatus />} />
            {/* recruitment */}
            <Route path="recruitment/jobopenings/:id" element={<Jobopenings />} />
            <Route path="recruitment/jobopenlist" element={<JobopeningList />} />
            <Route path="recruitment/jobcloselist" element={<JobClosingList />} />
            <Route path="recruitment/jobedit/:id" element={<JobopeningEdit />} />
            <Route path="recruitment/jobview/:id" element={<JobopeningView />} />
            <Route path="recruitment/vacancyposting" element={<Vacancypostion />} />
            <Route path="recruitment/recruitmentplanning" element={<Recruitmentplanning />} />
            <Route path="recruitment/rolesandresponse" element={<Rolesandresponse />} />
            <Route path="recruitment/rolesandres" element={<Roleandresponse />} />
            <Route path="recruitment/rolesandresponsecategory" element={<RolesandResponseCategory />} />
            <Route path="hrdocuments/empmissfield" element={<Empmissfield />} />
            <Route path="asset/assetprintlabel" element={<AssetPrintlabel />} />
            <Route path="asset/addtoprintqueue" element={<AddtoPrintQueue />} />
            <Route path="asset/addtoprintqueueprint" element={<AddtoPrintQueuePrint />} />
            <Route path="employee/loginstatus" element={<EmployeeLoginStatus />} />
            {/* Resume management000 */}
            <Route path="/:from/edit/:id" element={<ResumeEdit />} />
            <Route path="resumemanagement/view/:id" element={<ResumeView />} />
            <Route path="resumemanagement" element={<Resumemanagement />} />
            <Route path="resumemailattachments" element={<ResumemailAttachments />} />
            <Route path="/recruitment/addresume" element={<Addresume />} />
            <Route path="/recruitment/viewresume/:id/:name" element={<Viewresume />} />
            {/*unassigned candidates */}
            <Route path="/recruitment/assignedcandidates" element={<AssignedCandidates />} />
            <Route path="/recruitment/unassignedcandidates" element={<UnassignedCandidates />} />
            <Route path="updatepages/addexists" element={<Addexists />} />
            <Route path="updatepages/exitdetaillist" element={<ExitdetailList />} />
            <Route path="updatepages/noticeperiodapply" element={<Noticeperiodapply />} />
            <Route path="updatepages/noticeperiodlist" element={<Noticeperiodlist />} />
            <Route path="updatepages/refercandidatepage" element={<Refercandidate />} />
            <Route path="production/penaltyclienterrorupload" element={<Penaltyclienterrorupload />} />
            <Route path="production/penaltyclienterrorlist" element={<Clienterrorlist />} />
            <Route path="production/productionday" element={<Productionday />} />
            <Route path="hr/unassignbranchreport" element={<UnAssignedBranch />} />
            {/* another code  */}
            <Route path="updatepages/noticeperiodliststatus" element={<Noticeperiodliststatus />} />
            <Route path="updatepages/noticeperiodstatuslist" element={<Noticeperiodstatuslist />} />
            <Route path="updatepages/noticeperiodactionemployeelist" element={<Noticeperiodactionemployeelist />} />
            <Route path="updatepages/deactivateemployeeslist" element={<Deactivateemployeeslist />} />
            <Route path="updatepages/assignedpfesi/:id" element={<AssignedPfesiloglist />} />
            <Route path="updatepages/twofactorreset" element={<TwoFactorReset />} />
            <Route path="production/penaltyclienterror" element={<Penaltyclienterror />} />
            <Route path="production/paycontrol" element={<Paycontrol />} />
            <Route path="production/penalty/errorreason" element={<Errorreason />} />
            <Route path="production/penalty/errorcontrol" element={<Errorcontrol />} />
            <Route path="production/manageidlework" element={<Manageidlework />} />
            <Route path="production/nonproductionlist" element={<NonproductionList />} />
            <Route path="production/nonproduction" element={<Nonproduction />} />
            <Route path="production/nonproductionfilterlist" element={<Nonproductionfilterlist />} />
            <Route path="reponselog/:candidateid/:roundid" element={<ResponseLog />} />
            <Route path="eb/ebreadingdetailslist" element={<EbreadingdetailsList />} />
            <Route path="hr/recruitment/useform" element={<UseForm />} />
            <Route path="hr/recruitment/formgenerate/:id" element={<FormGenerate />} />
            <Route path="task/taskmanualcreation" element={<TaskManualCreation />} />
            <Route path="updatepages/companydomain" element={<Companydomain />} />
            {/* Account group details */}
            <Route path="account/accountgroup" element={<AccountGroup />} />
            <Route path="account/group" element={<Group />} />
            <Route path="account/accounthead" element={<Accounthead />} />
            <Route path="account/assetmaterial" element={<Assetmaterial />} />
            <Route path="purpose" element={<Purpose />} />
            <Route path="maintanencelog" element={<MaintenanceUserLog />} />
            <Route path="myverification" element={<MyVerification />} />
            {/* Asset */}
            <Route path="asset/assetdetails" element={<Assetdetails />} />
            <Route path="asset/maintenancedetailsmaster" element={<MaintenanceDetailsMaster />} />
            <Route path="asset/assetlist" element={<AssetDetailsList />} />
            <Route path="asset/repairasset" element={<RepairAsset />} />
            <Route path="asset/manageasset" element={<ManageAsset />} />
            <Route path="asset/damageasset" element={<DamageAsset />} />
            <Route path="uommaster" element={<VomMaster />} />
            <Route path="asset/employeeassetdistribution" element={<EmployeeAssetdistribution />} />
            <Route path="vendordetails" element={<VendorDetails />} />
            <Route path="frequencymaster" element={<FrequencyMaster />} />
            <Route path="asset/assetworkstation" element={<AssetWorkstation />} />
            <Route path="asset/assetspecificationgrouping" element={<AssetSpecificationGrouping />} />
            {/*unassigned candidates page */}
            <Route path="unassignedcandidates/editresume/:id" element={<UnassignedResumeEdit />} />
            <Route path="/recruitment/addresume" element={<AddresumemailAttachments />} />
            <Route path="interview/interviewanswerallot" element={<InterviewQuestionAnswerAllot />} />
            <Route path="/expense/schedulepaymentmaster" element={<SchedulePaymentMaster />} />
            <Route path="/expense/schedulepaymentmasterlog/:id" element={<SchedulePaymentMasterLog />} />
            <Route path="/expense/schedulepaymentnotaddedbills" element={<NotAddedBills />} />
            <Route path="updatepages/individualloginallotlist" element={<IndividualLoginAllotList />} />
            <Route path="updatepages/hierarchyallotlist" element={<HierarchyAllotList />} />
            {/* TICKETS */}
            <Route path="setup/schedulemeetinglog/:id" element={<ScheduleMeetingLog />} />
            <Route path="tickets/addcategoryticket" element={<Addcategoryticket />} />
            <Route path="tickets/subsubcomponent" element={<Subsubcomponent />} />
            <Route path="tickets/typemaster" element={<Typemaster />} />
            <Route path="tickets/typegroupmaster" element={<Typegroupmaster />} />
            <Route path="tickets/reasonmaster" element={<Reasonmaster />} />
            <Route path="/tickets/resolverreasonmaster" element={<ResolverReasonmaster />} />
            <Route path="tickets/meetingmaster" element={<Meetingmaster />} />
            <Route path="tickets/chekpointticketmaster" element={<Chekpointticketmaster />} />
            <Route path="tickets/teamgrouping" element={<Teamgrouping />} />
            <Route path="tickets/raiseticketteam" element={<RaiseTicketTeamGrouping />} />
            <Route path="tickets/individuallist" element={<Individualaiseticketist />} />
            <Route path="tickets/individualreport" element={<IndividualRaiseTicketReport />} />
            <Route path="/interview/allassignedchecklist" element={<AllAssignedCheckList />} />
            <Route path="production/productionunitrateunallot" element={<ProductionUnAllot />} />
            {/* OTHERPAYMENTS */}
            <Route path="account/listotherpayments" element={<Otherpayment />} />
            <Route path="asset/maintenance" element={<Maintenance />} />
            <Route path="asset/maintenanceservice" element={<MaintenanceService />} />
            <Route path="asset/maintenanceremark/:id" element={<MaintenanceRemarkList />} />
            <Route path="asset/taskmaintenancenonschedulegrouping" element={<TaskMaintenanceNonScheduleGrouping />} />
            <Route path="asset/taskmaintenaceforuser" element={<TaskMaintenaceForUser />} />
            <Route path="asset/taskmaintenanceuserview/:id" element={<TaskMaintenanceUserPanelView />} />
            <Route path="/interview/unallottedchecklist" element={<UnAllottedChecklist />} />
            <Route path="/interview/allpendingchecklist" element={<AllPendingCheckList />} />
            <Route path="/interview/allinterviewpendingchecklist" element={<AllInterviewPendingCheckList />} />
            <Route path="asset/taskmaintenancenonschedulelog/:id" element={<TaskMaintenanceNonScheduleLog />} />
            <Route path="recruitment/designationrequirements" element={<Designationrequirement />} />
            <Route path="departmentgrouping" element={<Departmentgrouping />} />
            <Route path="/recruitment/viewresume/:id/:name/:jobid" element={<CandidateView />} />
            <Route path="/recruitment/interviewstatuscountreportpage" element={<InterviewStatusCountReportPage />} />
            <Route path="updatepages/remotesystemname" element={<Remotesystemname />} />
            <Route path="/tooltipdescription" element={<TooltipDescription />} />
            {/* stock purchase */}
            <Route path="stockpurchase/stock" element={<Stockmaster />} />
            <Route path="stockpurchase/stockmanagerequest" element={<Stockmanagerequest />} />
            <Route path="stockpurchase/stockpurchaserequest" element={<Stockpurchaserequest />} />
            <Route path="stockpurchase/managestocktransfer" element={<ManageStockTransfer />} />
            <Route path="stockpurchase/Stockmanagement" element={<StockManagement />} />
            <Route path="excel/secondaryworkorderhierarchylist" element={<SeondaryworkorderHierarchy />} />
            <Route path="excel/tertiaryworkorderhierarchylist" element={<TertiaryworkorderHierarchy />} />
            <Route path="excel/otherworkorderhierarchylist" element={<OtherHierarchy />} />
            <Route path="excel/consolidatedworkorderhierarchylist" element={<ConsolidatedHierarchyPriSecTer />} />
            <Route path="excel/consolidatedallhierarchylist" element={<ConsolidatedHierarchyAll />} />
            <Route path="excel/primaryworkorderhierarchylist" element={<PrimaryHierarchyList />} />
            <Route path="manageassignedmode" element={<Manageassignedmode />} />
            <Route path="manageothertask" element={<Manageothertask />} />
            <Route path="assignedby" element={<Assignedby />} />
            <Route path="leave/leavereport" element={<LeaveReportList />} />
            {/* LEAVE */}
            <Route path="leave/applyleave" element={<Applyleave />} />
            <Route path="leave/approveleave" element={<ApprovedLeave />} />
            <Route path="leave/leavecriteria" element={<Leavecriteria />} />
            <Route path="leave/leavetype" element={<Leavetype />} />
            <Route path="leave/leaveandpermissionverification" element={<LeaveVerification />} />
            <Route path="leave/teamleaveverification" element={<TeamLeaveVerification />} />
            <Route path="attendancehierarchy" element={<Attendancehierarchy />} />
            <Route path="setup/holiday" element={<Holiday />} />
            <Route path="setup/schedulemeeting" element={<ScheduleMeeting />} />
            <Route path="setup/schedulemeetingfilter" element={<ScheduleMeetingFilter />} />
            <Route path="asset/overassetdetails" element={<OverAssetDetails />} />
            <Route path="asset/stocklist/:id" element={<StockList />} />
            <Route path="stockpurchase/manualstock" element={<Manualstockentry />} />
            <Route path="tickets/raiseticketmaster" element={<Raiseticketsmaster />} />
            <Route path="tickets/listtickets" element={<Raiseticketslist />} />
            <Route path="tickets/raiseticketmaster/:id" element={<RaiseticketsEdit />} />
            <Route path="setup/grouplist" element={<GroupList />} />
            <Route path="setup/groupindividual" element={<GroupIndividual />} />
            <Route path="eb/ebreadinganalysisreview" element={<Ebreadinganalysisreview />} />
            <Route path="/settings/verifiedlist" element={<VerifiedList />} />
            <Route path="settings/templatelist" element={<TemplateList />} />
            {/* EXPENSES */}
            <Route path="expense/addexpanse" element={<Addexpanse />} />
            <Route path="expense/expenselist" element={<ExpenseList />} />
            <Route path="expense/editexpenselist/:id" element={<EditExpense />} />
            <Route path="expense/expensecategory" element={<Expensecategory />} />
            <Route path="expense/reminder" element={<ExpenseReminder />} />
            <Route path="expense/allreminder" element={<AllReminder />} />
            <Route path="/expense/allreminderlog" element={<AllReminderLog />} />
            <Route path="expense/paymentduereminder" element={<PaymentDueReminder />} />
            <Route path="/expense/paymentduereminderlog/:frequency/:vendorid/:filterdate/:filteryear" element={<PaymentDueReminderLog />} />
            <Route path="expense/source" element={<Source />} />
            <Route path="expense/listincome" element={<Income />} />
            <Route path="expense/addincome" element={<AddIncome />} />
            <Route path="expense/remainder" element={<Remainder />} />
            <Route path="expense/allincomeandexpenses" element={<AllIncomeandExpenses />} />
            <Route path="account/addotherpayments" element={<Addotherpayment />} />
            <Route path="/remoteemployeelist" element={<RemoteEmployeeList />} />
            <Route path="/remoteemployeedetailslist" element={<RemoteEmployeeDetailsList />} />
            <Route path="/remoteemployeedetailslog/:id" element={<RemoteEmployeeLog />} />
            <Route path="/leave/blockdayslist" element={<LeaveBlockDayList />} />
            <Route path="production/payroll/payrun" element={<Payrunmasterfinal />} />
            <Route path="production/payroll/losspayrun" element={<Losspayrun />} />
            <Route path="production/payroll/fixsalarydate" element={<Fixsalarydate />} />
            <Route path="production/payroll/fixholdsalarydate" element={<Fixholdsalarydate />} />
            <Route path="production/payroll/holdsalaryconfirm" element={<Holdsalaryconfirm />} />
            <Route path="production/payroll/consolidatedsalaryrelease" element={<Consolidatedsalaryrelease />} />
            <Route path="production/payroll/bankrelease" element={<Bankrelease />} />
            <Route path="production/payroll/bankreleasebreakup/:month/:year/:date" element={<BankreleaseBreakup />} />
            <Route path="production/payroll/bankreleaseall/:month/:year/:date" element={<BankreleaseAll />} />
            <Route path="updatepages/assignexperience/log/:id" element={<Assignexplog />} />
            <Route path="/quality/accuracy/acheivedaccuracy/clientstatus" element={<Achievedaccuracyclientstatus />} />
            <Route path="/quality/accuracy/acheivedaccuracy/internalstatus" element={<Achievedaccuracyinternalstatus />} />
            <Route path="/quality/accuracy/acheivedaccuracy/clientstatuslist" element={<ClientStatusList />} />
            <Route path="/quality/accuracy/acheivedaccuracy/internalstatuslist" element={<InternalStatusList />} />
            <Route path="production/penalty/penaltydayupload" element={<Penaltydayupload />} />
            <Route path="production/penalty/penaltydayuploadlist" element={<Penaltydayuploadlist />} />
            <Route path="production/penalty/managepenaltyMonth" element={<ManagepenaltyMonth />} />
            <Route path="production/penalty/managepenaltymonthview/:id" element={<Managepenaltymonthview />} />
            <Route path="othertasklist" element={<OthertaskList />} />
            <Route path="settings/templatecontrolpanel" element={<Templatecontrolpanel />} />
            <Route path="deactivateinternlist" element={<DeactivateInternlist />} />
            <Route path="activeinternlist" element={<ActiveinternList />} />
            <Route path="updatedpages/temploginstatus" element={<TemporaryLoginStatus />} />
            <Route path="asset/maintenancehierarchyreport" element={<MaintenanceHierarchyReport />} />
            <Route path="employee/longabsentrestrictionlist" element={<Longabsentrestrictionlist />} />
            {/* //EVENTS */}
            <Route path="setup/events" element={<Events />} />
            <Route path="setup/eventsfilter" element={<EventsFilter />} />
            <Route path="setup/meetingcalendar" element={<MeetingCalendar />} />
            <Route path="setup/eventscalendar" element={<EventsCalendar />} />
            <Route path="setup/holidaycalendar" element={<HolidayCalendar />} />
            <Route path="setup/holidayfilter" element={<HolidayFilter />} />

            <Route path="setup/attendanceindividualhierarchy" element={<Attendanceindividualhierarchy />} />
            <Route path="attendancemodereport" element={<AttendanceModeReportList />} />

            <Route path="production/listproductionpointsfilter" element={<ProductionReviewe />} />
            <Route path="/quality/accuracy/overallacheivedaccuracyindividuallist" element={<OverallAchievedAccuracyIndividualList />} />
            {/* Interview */}
            <Route path="interview/addcategoryinterview" element={<Addcategoryinterview />} />
            <Route path="interview/roundmaster" element={<Roundmaster />} />
            <Route path="interview/interviewtypemaster" element={<Interviewtypemaster />} />
            <Route path="editrole/:id" element={<EditRole />} />
            <Route path="production/productiondayshift" element={<ProductionDayShift />} />
            {/* Reference*/}
            <Route path="addcategoryref" element={<ReferenceCategoryDoc />} />
            <Route path="addrefcategoryref" element={<AddReferenceCategoryDoc />} />
            {/* <Route path="listrefcategoryref" element={<ListReferenceCategoryDoc />} /> */}
            <Route path="editrefcategoryref/edit/:id" element={<EditReferenceCategoryDoc />} />
            <Route path="updatepages/designationlog" element={<Designationlog />} />
            <Route path="weekoffpresent" element={<Weekoffpresent />} />
            <Route path="listrefcategoryref" element={<ListReferenceCategoryDoc />} />
            <Route path="/ldap/hierarchydisableduserslist" element={<HierarchyDisabledUsersList />} />
            <Route path="/ldap/hierarchydomainuserslist" element={<HierarchyDomainUsersList />} />
            <Route path="/ldap/hierarchylockeduserslist" element={<HierarchyLockedUsersList />} />
            <Route path="/workfromhome/teamworkfromhomeverification" element={<Teamworkfromhome />} />
            <Route path="employee/teamautoclockoutrestrictionlist" element={<TeamAutoClockoutRestrictionList />} />



            <Route path="task/taskdesignationgrouping" element={<TaskDesignationGrouping />} />
            <Route path="/interview/interviewcandidatesreportpage" element={<InterviewCandidatesReportPage />} />
            <Route path="updatepages/designationloglist/:id" element={<Designationloglist />} />
            <Route path="/updatepages/deactivateemployeeslistview" element={<DeactivateemployeeslistView />} />
            <Route path="tickets/duedate" element={<Duedatemaster />} />
            <Route path="tickets/prioritymaster" element={<Prioritymaster />} />
            <Route path="interview/interviewquestions" element={<Interviewquestion />} />
            <Route path="interview/interviewtypingquestions" element={<InterviewTypingQuestions />} />
            <Route path="interview/interviewformgenerate" element={<InterviewFormGenerate />} />
            <Route path="interview/interviewroundorder" element={<Interviewroundorder />} />
            <Route path="interview/interviewquestionsorder" element={<InterviewQuestionsOrder />} />
            <Route path="interview/interviewquestionsgrouping" element={<Interviewgroupingquestion />} />
            <Route path="interview/individualquestionstatus/:id" element={<IndividualQuestionStatus />} />
            <Route path="quality/accuracy/accuracyqueuegrouping" element={<Accuracyqueuegrouping />} />
            <Route path="/interview/interviewtestmaster" element={<InterviewTestMaster />} />
            <Route path="/deactivateinternlistview" element={<DeactivateInternlistView />} />
            <Route path="passwordcategory" element={<PasswordCategory />} />
            <Route path="updatepages/assignedpfesi" element={<Assignedpfesi />} />
            <Route path="updatepages/assignpfesi" element={<Assignpfesi />} />
            <Route path="addpassword" element={<AddPassword />} />
            <Route path="interactor/allvisitorlist" element={<AllListVisitors />} />
            {/* <Route path="listpassword" element={<ListPassword />} /> */}
            <Route path="editpassword/:id" element={<EditPassword />} />
            <Route path="asset/assettype" element={<AssetType />} />
            <Route path="interview/checklistverificationmaster" element={<Checklistverificationmaster />} />
            <Route path="assettypegrouping" element={<AssetTypeGrouping />} />
            <Route path="project/raiseissue" element={<Raiseissue />} />
            <Route path="raiseissuedit/:id" element={<Raiseissueedit />} />
            <Route path="assetspecification/brandmaster" element={<BrandMaster />} />
            <Route path="hrdocuments/templatecreation" element={<TemplateCreation />} />
            <Route path="hrdocuments/candidatedocuments" element={<CandidateDocuments />} />
            <Route path="hrdocuments/employeedocumentskeywords" element={<EmployeeDocumentsKeywords />} />
            <Route path="hrdocuments/manualkeywordspreparation" element={<ManualKeyWordsPreparation />} />
            <Route path="hrdocuments/companydocumentskeywords" element={<CompanyDocumentsKeywords />} />
            <Route path="hrdocuments/candidatedocumentskeywords" element={<CandidateDocumentsKeywords />} />
            <Route path="assetspecification/assetmodel" element={<AssetModel />} />
            <Route path="assetspecification/assetvariant" element={<AssetVariant />} />
            <Route path="assetspecification/assetsize" element={<AssetSize />} />
            <Route path="assetspecification/assetspecificationtype" element={<AssetSpecificationType />} />
            <Route path="assetspecification/paneltype" element={<PanelType />} />
            <Route path="assetspecification/screenresolution" element={<ScreenResolution />} />
            <Route path="assetspecification/connectivity" element={<Connectivity />} />
            <Route path="assetspecification/assetcapacity" element={<AssetCapacity />} />
            <Route path="hrdocuments/Createidcard" element={<Createidcard />} />
            {/* ASSET SPECIFICATION */}
            <Route path="/production/nonproductionunitallot" element={<Nonproductionunitallot />} />
            <Route path="/production/tempproductionreviewew" element={<TempProductionReviewe />} />
            <Route path="/production/nonproductionallot/:id" element={<Nonproductionallot />} />
            <Route path="production/nonproductionunitrate" element={<Nonproductionunitrate />} />
            <Route path="assetspecification/datarange" element={<DataRange />} />
            <Route path="assetspecification/compatibledevices" element={<CompatibleDevices />} />
            <Route path="assetspecification/outputpower" element={<OutputPower />} />
            <Route path="assetspecification/coolingfancount" element={<CoolingFanCount />} />
            <Route path="assetspecification/clockspeed" element={<ClockSpeed />} />
            <Route path="assetspecification/core" element={<Core />} />
            <Route path="assetspecification/speed" element={<Speed />} />
            <Route path="assetspecification/frequency" element={<Frequency />} />
            <Route path="assetspecification/output" element={<Output />} />
            <Route path="assetspecification/ethernetports" element={<EthernetPorts />} />
            <Route path="assetspecification/distance" element={<Distance />} />
            <Route path="assetspecification/length" element={<Length />} />
            <Route path="assetspecification/slot" element={<Slot />} />
            <Route path="assetspecification/numberofchannels" element={<NoOfChannels />} />
            <Route path="assetspecification/colours" element={<Colours />} />
            <Route path="/addemployeenew/:from" element={<AddemployeeNew />} />
            <Route path="/addinternnew/:from" element={<InterncreateNew />} />
            <Route path="/quality/accuracy/acheivedaccuracyindividualreviewlist" element={<AchievedAccuracyIndividualReviewList />} />
            <Route path="/quality/accuracy/achievedaccuracyindividualreviewclientstatuslist" element={<AchievedAccuracyIndividualReviewClientstatusList />} />
            <Route path="/quality/accuracy/achievedaccuracyindividualreviewinternalstatuslist" element={<AchievedAccuracyIndividualReviewInternalstatusList />} />
            <Route path="assigndocument" element={<AssignDocumentCreate />} />
            <Route path="assigndocument/edit/:id" element={<AssignDocumentEdit />} />
            <Route path="task/taskschedulelog/:id" element={<TaskUserScheduleLog />} />
            <Route path="acpointcalculation" element={<AcPointCalculation />} />
            <Route path="production/zerounitrateunallottemp" element={<Zerounitrteunallottemp />} />
            <Route path="production/raiseprobledetailsneeded/:id" element={<RaiseproblemDetailsUpload />} />
            <Route path="production/productiondaytemp" element={<ProductionDayTemp />} />
            <Route path="production/tempoverallreport" element={<TempOverallReport />} />
            <Route path="production/productionreport" element={<ProductionReport />} />
            <Route path="production/productiontempupload" element={<Productiontempupload />} />
            <Route path="production/productiontempuploadedit/:id" element={<ProductionTempUploadEdit />} />
            <Route path="production/temppointsuploadedit/:subid/:mainid" element={<TempPointsUploadEdit />} />
            <Route path="productiontemp/reportsconsolidated" element={<ClientUseridTemp />} />
            <Route path="production/temppointsupload" element={<TempPointsUpload />} />
            <Route path="production/clientuserid" element={<ClientUserid />} />
            <Route path="production/processqueuename" element={<ProcessQueueName />} />
            <Route path="updatepages/bankdetailinfo" element={<Bankdetailinfo />} />
            <Route path="production/targetpoints" element={<Targetpoints />} />
            <Route path="professionaltaxmaster" element={<ProfessionalTaxMaster />} />
            <Route path="production/daypointsuploadedit/:subid/:mainid" element={<DayPointsUploadEdit />} />
            <Route path="productiontemp/reportsconsolidated" element={<ClientUseridTemp />} />
            <Route path="production/listtempproductionpoints" element={<ListTempProductionPoints />} />
            <Route path="production/reportsconsolidated/:id" element={<ReportsConsolidatedView />} />
            <Route path="productiontemp/reportsconsolidated/:id" element={<ListProductionPointsView />} />
            <Route path="production/productiontempupload" element={<Productiontempupload />} />
            <Route path="production/productiontempuploadall" element={<ProductionTempUploadAll />} />
            <Route path="production/productiontempuploadedit/:id" element={<ProductionTempUploadEdit />} />
            <Route path="production/productionupload" element={<ProductionUpload />} />
            <Route path="production/productionuploadedit/:id" element={<ProductionUploadEdit />} />
            <Route path="production/paiddatefix" element={<Paiddatefix />} />
            <Route path="production/paidstatusfix" element={<Paidstatusfix />} />
            <Route path="production/paiddatemode" element={<Paiddatemode />} />
            <Route path="tickets/assetcategorygrouping" element={<Assetcategorygrouping />} />
            <Route path="managecategory" element={<Managecategory />} />
            <Route path="expense/managestockitems" element={<Managestockitems />} />
            <Route path="expense/paidlist" element={<Paidlist />} />
            <Route path="expense/notpaidlist" element={<Notpaidlist />} />
            <Route path="interactor/master/managetype&purposegrouping" element={<Managetypepurposegrouping />} />
            <Route path="settings/controlpanel" element={<ControlPanel />} />
            <Route path="settings/settingkeywordinstructions" element={<SettingKeyWordInstructions />} />
            <Route path="settings/attendancecontrolcriteria" element={<AttendanceControlCriteria />} />
            <Route path="settings/clockinip" element={<ClockinIP />} />
            <Route path="settings/passwordlist" element={<PasswordList />} />
            <Route path="settings/individualsettings" element={<IndividualSettings />} />
            <Route path="hrdocuments/documentpreparation" element={<DocumentPreparation />} />
            <Route path="hrdocuments/documentprintedfilterlist" element={<DocumentsPrintedStatusList />} />
            <Route path="production/overallreport" element={<OverallReport />} />
            <Route path="production/productionreport" element={<ProductionReport />} />
            <Route path="production/productiontempreport" element={<ProductionTempReport />} />
            <Route path="/updatepages/rejoinemployeelist" element={<RejoinEmployeeList />} />
            <Route path="/draftlist" element={<DraftList />} />
            <Route path="/interndraftlist" element={<InternDraftList />} />
            <Route path="/draft/edit/:id" element={<DraftEdit />} />
            <Route path="/interndraft/edit/:id" element={<InternDraftEdit />} />
            <Route path="/draft/view/:id/:from" element={<DraftView />} />
            <Route path="/interndraft/view/:id/:from" element={<InternDraftView />} />
            <Route path="attendance/usershiftweekoffpresent" element={<UserShiftWeekOffPresent />} />
            {/* organization documents */}
            <Route path="settings/organizationdocumentcategory" element={<OrganizationDocumentCategory />} />
            <Route path="settings/addorganizationdocument" element={<AddOrganizationDocument />} />
            <Route path="settings/editorganizationdocument/edit/:id" element={<EditOrganizationDocument />} />
            <Route path="/interview/myinterviewchecklist" element={<MyInterviewCheckList />} />
            {/* task categroy pages */}
            <Route path="task/master/taskcategory" element={<Taskcategory />} />
            <Route path="task/master/tasksubcategory" element={<TaskSubcategory />} />
            <Route path="task/training/master/trainingcategory" element={<Trainingcategory />} />
            <Route path="task/training/master/trainingsubcategory" element={<Trainingsubcategory />} />
            <Route path="task/training/master/trainingdetails" element={<TrainingDetails />} />
            <Route path="task/training/master/traininguserpanel" element={<TrainingUserPanel />} />
            <Route path="task/training/master/traininguserreport" element={<TrainingForUserReport />} />
            <Route path="task/training/master/traininguserallocation" element={<TrainingUserAllocation />} />
            <Route path="task/training/master/trainingpostponedlist" element={<TrainingPostponedList />} />
            <Route path="task/training/master/traininguserresponse/:id" element={<TrainingUserResponseLog />} />
            <Route path="task/training/trainingusercompletedstatus" element={<TrainingUserCompletedStatus />} />
            <Route path="updatepages/departmentmonthsetauto" element={<DepartmentMonthSetAuto />} />

            <Route path="/updatepages/exitlist" element={<Exitlist />} />
            <Route path="updatepages/departmentlog" element={<DepartmentLog />} />
            <Route path="updatepages/departmentloglist/:id" element={<DepartmentLogList />} />
            <Route path="updatepages/loginallot" element={<LoginAllot />} />
            <Route path="updatepages/:from/:id" element={<LoginNotAllotList />} />
            <Route path="assignbranch" element={<Assignbranch />} />
            <Route path="enquiryedit/:id" element={<EditEnquiryemployee />} />
            <Route path="enquirypurposelist" element={<EnquiryPurposeUsersList />} />
            <Route path="enquiryview/:id" element={<Enquiryview />} />
            <Route path="production/payroll/manageshortagemaster" element={<Manageshortagemaster />} />
            <Route path="production/minimumpointscalculation" element={<MinimumPointsCalc />} />
            <Route path="production/eraamount" element={<EraAmount />} />
            <Route path="production/revenueamount" element={<RevenueAmount />} />
            <Route path="setup/salaryslab/salaryslabadd" element={<SalarySlabAdd />} />
            <Route path="setup/salaryslab/salaryslablist" element={<SalarySlabList />} />
            <Route path="payroll/salaryslabfilter" element={<Salaryslabfilter />} />
            <Route path="production/daypoints" element={<ProducuionDayPointsUpload />} />
            <Route path="production/processteam" element={<ProcessTeam />} />
            <Route path="production/productionindividual" element={<ProductionIndividual />} />
            <Route path="production/productionindividualfilter" element={<ProductionIndividualFilter />} />
            <Route path="production/approvelist" element={<ApprovedList />} />
            <Route path="production/rejectlist" element={<RejectList />} />
            <Route path="production/checklist/originalmismatch" element={<ProductionUnmatchUnitList />} />
            <Route path="production/checklist/tempmismatch" element={<TempProductionUnmatchUnit />} />

            <Route path="updatepages/processallot" element={<ProcessAllot />} />
            <Route path="updatepages/processallotlist/:id" element={<ProcessAllotList />} />
            <Route path="/recruitment/overallnotresponsereport" element={<Overallnotresponsereport />} />
            <Route path="manageip" element={<ManageIP />} />
            <Route path="manageipcategory" element={<IpCategory />} />
            <Route path="manageiplist" element={<ManageIpList />} />
            <Route path="assignediplist" element={<AssignedIPList />} />
            <Route path="asset/overallassetreport" element={<OverallAssetReport />} />
            <Route path="production/daypointsupload" element={<DayPointsUpload />} />
            <Route path="production/listproductionpoints" element={<ListProductionPoints />} />
            <Route path="production/reportsconsolidated" element={<ReportsConsolidated />} />
            <Route path="production/reportsconsolidated/:id" element={<ReportsConsolidatedView />} />
            <Route path="userdocumentupload" element={<UserDocumentUpload />} />
            <Route path="userdocumentuploadfilter" element={<UserDocumentUploadFilter />} />
            <Route path="production/productionoriginalupload" element={<Productionoriginalupload />} />
            <Route path="production/penaltyamountcreation" element={<Penaltyamountcreation />} />
            <Route path="production/minimumpoints" element={<MinimumPoints />} />
            <Route path="production/categoryprocessmap" element={<Categoryprocessmap />} />
            <Route path="interview/employeestatus" element={<EmployeeDetailStatus />} />
            <Route path="production/productionunitrate" element={<Productionunitrate />} />
            <Route path="production/productioncategory" element={<ProductionCategory />} />
            <Route path="production/productionsubcategory" element={<ProductionSubCategory />} />
            <Route path="production/penalty/penaltyerrortype" element={<Penaltyerrortype />} />
            <Route path="production/penalty/productionprocessqueue" element={<ProductionProcessQueue />} />
            <Route path="production/penalty/masterfieldname" element={<Masterfieldname />} />
            <Route path="production/penalty/otherpenaltycontrol" element={<Otherpenaltycontrol />} />
            <Route path="production/penalty/experiencebasewaviermaster" element={<Experiencebasewaviermaster />} />
            <Route path="production/nonproductioncategorysubcategory" element={<NonproductionCategoryAndSubcategory />} />
            <Route path="production/nonproductionunitrate" element={<Nonproductionunitrate />} />
            <Route path="production/penalty/categorypercentage" element={<Managecategorypercentage />} />
            <Route path="/recruitment/addresume/:id" element={<Addresumeinteractor />} />
            <Route path="interview/checklistinterview" element={<ChecklistInterview />} />
            <Route path="announcement/fileaccess" element={<FileAccess />} />
            <Route path="announcement/announcementcategory" element={<AnnouncementCategory />} />
            <Route path="designationandcontrolgrouping" element={<Designationandcontrolgrouping />} />
            <Route path="payroll/salaryprocessreport" element={<Salaryprocessreport />} />
            <Route path="production/raiseproblem" element={<Raiseproblem />} />
            <Route path="production/raiseproblemlist" element={<RaiseProblemlist />} />
            <Route path="templatecontrolpanellog/:id" element={<TemplateControlLog />} />
            <Route path="production/raiseproblemedit/:id" element={<RaiseProblemEdit />} />
            <Route path="/support/raiseproblem/open" element={<RaiseProblemOpen />} />
            <Route path="/support/raiseproblem/closed" element={<RaiseProblemClosed />} />
            <Route path="/support/raiseproblem/onprogress" element={<RaiseProblemOnProgress />} />
            <Route path="/support/master/categorymaster" element={<CategoryMaster />} />
            <Route path="production/raiseproblemview/:id/:from/:forwardto" element={<RaiseProblemView />} />
            <Route path="production/penaltyerrorupload" element={<PenaltyErrorUpload />} />
            <Route path="assignmanualsalarydetails/:id" element={<AssignmanualsalarydetailsLog />} />
            <Route path="categorydatechange" element={<CategoryDateChange />} />
            <Route path="production/penalty/productionclientrate" element={<Productionclientrate />} />
            <Route path="/vendorgrouping" element={<VendorGrouping />} />
            <Route path="production/payroll/payrunmaster" element={<Payrunmaster />} />
            <Route path="production/payroll/finalsalary" element={<FinalSalaryList />} />
            <Route path="production/payroll/fixedsalary" element={<FixedSalaryList />} />
            <Route path="production/payroll/productionsalary" element={<ProductionSalaryList />} />
            <Route path="production/consolidatedsalarylist" element={<Consolidatedsalarylist />} />
            <Route path="production/waiverpercentage" element={<WaiverPercentage />} />

            <Route path="interview/checklisttype" element={<Checklisttype />} />
            <Route path="interview/checklistcategory" element={<Checklistcategory />} />

            <Route path="updatepages/boardinglog" element={<Boardinglog />} />
            <Route path="updatepages/boardingloglist/:id" element={<Boardingloglist />} />
            <Route path="updatepages/shiftlog" element={<ShiftLogChange />} />
            <Route path="updatepages/shiftloglist/:id" element={<ShiftLogListChange />} />
            <Route path="updatepages/designationmonthset" element={<DesignationMonthSet />} />
            <Route path="updatepages/processmonthset" element={<ProcessMonthSet />} />
            <Route path="updatepages/workstationassignedreport" element={<AssignedWorkStationReport />} />
            <Route path="updatepages/workstationunassignedreport" element={<WorkstationUnassigned />} />
            <Route path="candidatedocument" element={<Candidatedocument />} />
            <Route path="announcement" element={<Announcement />} />
            <Route path="fileshare" element={<FileShare />} />
            <Route path="tickets/selfcheckpointticketmaster" element={<SelfCheckPointTicketMaster />} />

            <Route path="task/tasknonschedulegrouping" element={<TaskNonScheduleGrouping />} />
            <Route path="task/tasknonschedulelog/:id" element={<TaskUserNonScheduleLog />} />
            {/* permission*/}
            <Route path="/permission/applypermission" element={<ApplyPermission />} />
            <Route path="/permission/approvedlist" element={<ApproveList />} />
            <Route path="/permission/teampermissionverification" element={<TeamPermissionVerification />} />
            <Route path="Employeeinternlivelist" element={<Employeeinternlivelist />} />

            <Route path="Internlivelist" element={<Internlivelist />} />
            <Route path="tickets/requiredmaster" element={<RequiredMaster />} />
            <Route path="/calendarview" element={<CalendarView />} />
            <Route path="task/taskforuser" element={<TaskForUser />} />
            <Route path="task/taskuserpanelview/:id" element={<TaskUserPanelView />} />
            <Route path="task/training/master/traininguserpanelview/:id" element={<TrainingUserPanelView />} />
            <Route path="task/taskhierarchyreport" element={<TaskHierarchyReport />} />
            <Route path="task/taskhierarchysummaryreport" element={<TaskHierarchySummaryReport />} />
            <Route path="training/traininghierarchysummaryreport" element={<TrainingHierarchySummaryReport />} />
            <Route path="training/master/traininghierarchyreport" element={<TrainingHierarchyReport />} />
            <Route path="task/taskschedulegrouping" element={<TaskScheduleGrouping />} />
            <Route path="tickets/raiseticketteam" element={<RaiseTicketTeamGrouping />} />
            <Route path="training/traininguserlog/:id" element={<TrainingUserLog />} />
            <Route path="tickets/raiseticketfilterview/:id" element={<RaiseTicketFilterView />} />
            <Route path="tickets/raiseticketreport" element={<RaiseTicketReport />} />

            {/* EB master pages */}
            <Route path="eb/ebservicemaster" element={<Ebservicemaster />} />
            <Route path="eb/ebreadingreport" element={<Ebreadingreport />} />
            <Route path="eb/managematerial" element={<Managematerial />} />
            <Route path="eb/ebuseinstrument" element={<Ebuseinstrument />} />
            <Route path="setup/managepowershutdowntype" element={<Managepowershutdowntype />} />
            <Route path="eb/ebrates" element={<Ebrates />} />
            <Route path="eb/ebreadingdetails" element={<Ebreadingdetails />} />
            <Route path="eb/ebmaterialusagedetails" element={<Ebmaterialusagedetails />} />
            <Route path="eb/vendormastereb" element={<VendorMasterForEB />} />
            <Route path="/asset/labelname" element={<LabelName />} />
            <Route path="task/userstaskallocation" element={<UsersTaskAllocation />} />
            <Route path="task/completedtasks" element={<TaskForUserCompleted />} />
            <Route path="task/taskforuserreport" element={<TaskForUsersReport />} />

            <Route path="production/employeepoints" element={<EmployeePoints />} />
            <Route path="production/employeetemppoints" element={<EmployeeTempPoints />} />

            {/*Bank Details Verification */}
            <Route path="settings/updatepersonaldetails" element={<BankDetailsVerification />} />
            <Route path="settings/myteampassword" element={<Myteampassword />} />
            <Route path="setup/powerstationcalendar" element={<PowerStationCalendar />} />
            <Route path="setup/powerstation" element={<PowerStation />} />
            <Route path="setup/powerstationfilter" element={<PowerStationFilter />} />
            <Route path="settings/autologout" element={<AutoLogout />} />

            <Route path="task/training/onlinetest/onlinetestquestion" element={<OnlineQuestionTest />} />
            <Route path="task/training/onlinetest/onlinetestmaster" element={<OnlineTestMaster />} />
            <Route path="task/training/master/onlinetest/:id" element={<OnlineQuestionTestQuestion />} />

            {/*for accuracy master pages */}
            <Route path="quality/accuracy/accuracymaster" element={<AccuracyMaster />} />
            <Route path="quality/accuracy/expectedaccuracy" element={<ExpectedAccuracy />} />
            <Route path="quality/accuracy/acheivedaccuracy" element={<AcheivedAccuracy />} />
            <Route path="payroll/targetsalary" element={<TargetSalary />} />
            <Route path="interview/myinterview" element={<MyInterviewList />} />
            <Route path="settings/visitorqr" element={<Visitorlogin />} />
            <Route path="employeeprevalueslist" element={<Employeeprevalueslist />} />
            {/* interactors page */}
            <Route path="interactor/master/interactortype" element={<Interactortype />} />
            <Route path="interactor/master/interactormode" element={<InteractorMode />} />
            <Route path="interactor/master/interactorpurpose" element={<InteractorPurpose />} />
            <Route path="interactor/master/addvisitors" element={<AddVisitors />} />
            <Route path="interactor/master/listvisitors" element={<ListVisitors />} />
            <Route path="interactor/master/editvisitors/:id/:form" element={<EditVisitors />} />
            <Route path="interactor/master/viewvisitors/:id/:form" element={<ViewVisitors />} />
            <Route path="interactor/master/visitorsdatefilter" element={<VisitorDateFilter />} />
            <Route path="interactor/master/visitorsfollowupfilter" element={<VisitorFollowupFilter />} />
            <Route path="interactor/master/followupvisitor/:id/:form" element={<FollowUpVisitor />} />
            <Route path="clientsupport/manageticketgrouping" element={<ManageTicketGrouping />} />
            <Route path="clientsupport/manageclientdetails" element={<ManageClientDetails />} />
            <Route path="clientsupport/clientsupportlist" element={<ClientSupportList />} />
            <Route path="clientsupport/clientsupportview" element={<ClientSupportView />} />
            <Route path="/candidatemissingfields" element={<CandidateMissingField />} />
            <Route path="rejectedcandidates/:id" element={<RejectedCandidates />} />
            <Route path="hiredcandidates/:id" element={<HiredCandidates />} />


            
            {/* HI-Connect */}
            <Route path="hiconnect/createteam" element={<CreateTeam />} />
            <Route path="hiconnect/createchannel" element={<CreateChannel />} />
            <Route path="settings/themelayoutlist" element={<ThemeLayoutList />} />
            <Route path="poster/master/categorymaster" element={<Categorymaster />} />
            <Route path="poster/master/subcategorymaster" element={<Subcategorymaster />} />
            <Route path="poster/master/categorythemegrouping" element={<CategoryThemeGrouping />} />
            <Route path="production/paidstatusfixlist" element={<Paidstatusfixlist />} />
            <Route path="poster/postergenerate" element={<PosterGenerate />} />
            {/* newly added for exit interview */}
            <Route path="/production/productionindividuallist" element={<ProductionIndividualList />} />
            <Route path="/production/pendingmanualentrylist" element={<PendingManualentrylist />} />
            <Route path="/exitlist/exitinterviewquestionmaster" element={<ExitinterviewQuestionMaster />} />
            <Route path="/exitlist/exitinterviewtestmaster" element={<ExitTestMaster />} />
            <Route path="/recruitment/exitconfirmationlist" element={<ExitConfirmationList />} />
            <Route path="/assets/assetstatusrecoverylist" element={<AssetStatusRecovery />} />
            <Route path="/interview/checklistmoduleselection" element={<CheckListModuleSelection />} />
            <Route path="/manualovrallreport" element={<ManualOverallReport />} />
            <Route path="flagcountothertasklist" element={<FlagCountOthertaskList />} />
            <Route path="/listpageaccessmode" element={<ListPageAccessMode />} />
            <Route path="reportingheadercreate" element={<Reportingheadercreate />} />
            <Route path="reportingheaderedit/:id" element={<Reportingheaderedit />} />
            <Route path="reportingtoheadermodulelist" element={<Reportingtoheadermodulelist />} />
            <Route path="employee/longabsentrestrictionhierarchylist" element={<LongAbsentRestrictionHierarchyList />} />
            <Route path="/poster/master/postermessagesetting" element={<PosterMessageSetting />} />
            <Route path="production/payrunreport" element={<PayRunControlReportPage />} />
            <Route path="/posterkeywordinstructions" element={<PosterKeyWordInstructions />} />
            <Route path="updatepages/individualworkstation" element={<IndividualWorkstation />} />
            <Route path="/updatepages/hierarchyworkstationstatus" element={<HierarchyBasedEmployeeWorkstationStatus />} />
            <Route path="/todayleave" element={<ApproveLeaveList />} />
            <Route path="/noticeperiodapprovelist" element={<HomeNoticestatuslist />} />
            <Route path="/notcheckinemplist" element={<Notcheckinemplist />} />
            <Route path="hrdocuments/payslippreparation" element={<PaySlipDocumentPreparation />} />
            <Route path="hrdocuments/payslipone/:month/:year/:id/:sealid/:signatureid/:backgroundid/:genby/:gendate/:qrcode" element={<Payslip />} />
            <Route path="hrdocuments/paysliptwo/:month/:year/:id/:sealid/:signatureid/:backgroundid/:genby/:gendate/:qrcode" element={<PayslipTemplateTwo />} />
            <Route path="hrdocuments/payslipthree/:month/:year/:id/:sealid/:signatureid/:backgroundid/:genby/:gendate/:qrcode" element={<Payslipthree />} />
            <Route path="mikrotik/master" element={<MikrotikMaster />} />
            <Route path="mikrotik/interfaces" element={<Interfaces />} />
            <Route path="mikrotik/ppp/interface" element={<PppInterface />} />
            <Route path="mikrotik/ppp/profiles" element={<PppProfiles />} />
            <Route path="mikrotik/ppp/secrets" element={<PppSecrets />} />
            <Route path="mikrotik/logs" element={<Logs />} />
            <Route path="mikrotik/ppp/l2tpserver" element={<PppL2tpServer />} />
            <Route path="mikrotik/ppp/pptpserver" element={<PppPPTPServer />} />
            <Route path="mikrotik/ppp/activeconnections" element={<PppActiveConnections />} />
            <Route path="hrmsidletimereport" element={<IdleTimeList />} />
            <Route path="updatepages/assignusername" element={<AssignUserName />} />
            <Route path="/employeestatus/desktoploginreport" element={<DesktopLoginReport />} />
            <Route path="/maintenancefilterlist" element={<MaintenanceList />} />
            <Route path="employeemonitorlog" element={<UserActivity />} />
            <Route path="employeemonitorlogscreenshot" element={<UserActivityScreenshot />} />
            <Route path="/employeestatus/companyemailuserslist" element={<CompanyEmailsList />} />
            <Route path="employeemonitorlivescreen" element={<UserActivityLiveScreen />} />
            <Route path="assetspecification/hardwarespecification" element={<HardwareSpecification />} />
            <Route path="production/mismatchstatustemp" element={<ProductionMismatchStatusTemp />} />
            <Route path="production/mismatchstatus" element={<ProductionMismatchStatus />} />
            <Route path="/production/penalty/bulkerrorupload" element={<BulkErrorUpload />} />
            <Route path="production/penaltytotalfieldupload" element={<Penaltytotalfieldupload />} />
            <Route path="shiftadjustmentfilter" element={<ShiftAdjustmentListFilter />} />
            <Route path="settings/notificationsound" element={<NotificationSound />} />
            <Route path="updatedpages/employeestatuscompleted" element={<LongabsentrestrictionCompleted />} />
            <Route path="production/penalty/errormode" element={<PenaltyErrorMode />} />
            <Route path="production/validationerrorentry" element={<Validationerrorentry />} />
            <Route path="production/invaliderrorentry" element={<Errorinvalidapproval />} />
            <Route path="production/validateerrorentry" element={<Errorvalidapproval />} />
            <Route path="production/clienterrorstatus" element={<Clienterrorstatus />} />
            <Route path="production/erroruploadconfirm" element={<Erroruploadconfirm />} />
            <Route path="production/penaltywaivermaster" element={<Penaltywaivermaster />} />
            <Route path="production/clienterrormonthamount" element={<Clienterrormonthamount />} />
            <Route path="production/clienterrorchecklist" element={<Clienterrorchecklist />} />
            <Route path="production/manualerrorupdate" element={<Manualerrorupdate />} />
            <Route path="production/waiveremployeeforward" element={<Waiveremployeeforward />} />
            <Route path="production/clienterrorwaiver" element={<Clienterrorwaiver />} />
            <Route path="production/clienterrorforward" element={<Clienterrorforward />} />
            <Route path="production/clienterrorwaiverapproval" element={<Clienterrorwaiverapproval />} />
            <Route path="production/approvalemployeeforward" element={<Approvalemployeeforward />} />
            {/* Rocket Chat */}
            <Route path="connections/createteam" element={<RocketchatTeam />} />
            <Route path="connections/createchannel" element={<RocketchatChannel />} />
            <Route path="connections/teamchannelgrouping" element={<RocketchatTeamChannelGrouping />} />
            <Route path="mikrotik/ip/pool/pools" element={<IpPools />} />
            <Route path="mikrotik/ip/pool/usedaddresses" element={<IpPoolUsedAddresses />} />
            <Route path="/settings/chatconfiguration" element={<ChatConfigurationsettings />} />
            <Route path="production/productionindividualbulk" element={<ProductionIndividualBulk />} />
            <Route path="connections/memberslist" element={<RocketchatMembersList />} />
            <Route path="typemasterdocument" element={<Typemasterdocument />} />
            <Route path="/production/payroll/userpayslip" element={<Userpayslip />} />
            <Route path="teamaccessible" element={<Teamaccessible />} />
            <Route path="shiftadjustmentweekofffilter" element={<ShiftAdjustmentListWeekoffFilter />} />
            <Route path="/screensaver" element={<ScreenSaver />} />
            <Route path="mikrotik/ppp/secretslist" element={<PppSecretsList />} />
            <Route path="production/manualunitrateapproval" element={<MaunalUnitrateAprrovals />} />
            <Route path="production/productionunitrateunallottedlist" element={<ProductionUnAllottedList />} />
            <Route path="production/manualentrytimestudy" element={<ManualEntryTimeStudy />} />
            <Route path="production/manualentrytimestudyoverallreport" element={<ManualEntryTimeStudyOverallReport />} />
            <Route path="production/manualentrytimestudyselfreport" element={<ManualEntryTimeStudySelfReport />} />
            <Route path="/myproductionindividual" element={<MyProductionIndividual />} />
            <Route path="production/manualentrytimestudylist" element={<ManualEntryTimeStudyList />} />
            <Route path="/production/pendingmanualentrytimestudylist" element={<PendingManualEntryTimeStudyList />} />
            <Route path="connections/userslist" element={<RocketChatUsersList />} />
            <Route path="accessiblebranchfilter" element={<Accessiblebranchfilter />} />
            <Route path="/biometricuserspendingreport" element={<BiometricUsersPendingReport />} />
            <Route path="/biometricuserimportfromdevice" element={<BiometricUserImportFromDevice />} />
            <Route path="/biometricunregisteredusers" element={<BiometricUnregisteredUsers />} />
            <Route path="/biometricusersgrouping" element={<BiometricUsersGrouping />} />
            <Route path="/biometricpaireddevicesgrouping" element={<BiometricPairedDevicesGrouping />} />
            <Route path="/biometricusersattendancereport" element={<BiometricUsersAttendanceReport />} />
            <Route path="/biometricteamattendancereport" element={<BiometricTeamAttendanceReport />} />
            <Route path="/biometricunmatchedusersattendancereport" element={<BiometricUnmatchedUserAttendanceReport />} />
            <Route path="/biometricattendancetotalhoursreport" element={<BiometricUsersAttendanceTotalHoursReport />} />
            <Route path="/biometricexitreport" element={<BiometricExitReport />} />
            <Route path="/biometricbranchwiseexitreport" element={<BiometricBranchWiseExitReport />} />
            <Route path="/biometricnonentrybranchwiselist" element={<BiometricNonEntryBranchWiseList />} />
            <Route path="/production/sheetname" element={<SheetName />} />
            <Route path="/remoteemployeelist" element={<RemoteEmployeeList />} />
            <Route path="/individualremoteemployeelist" element={<IndividualRemoteEmployeeList />} />
            <Route path="/hierarchyremoteemployeelist" element={<HierarchyRemoteEmployeeList />} />
            <Route path="assignbranchmodulelist" element={<Assignbranchmodulelist />} />
            <Route path="production/typemaster" element={<TypeMaster />} />
            <Route path="production/queuetypemaster" element={<QueueTypeMaster />} />
            <Route path="assignbiometricdevicelist" element={<Assignbiometricdevicelist />} />
            <Route path="assignedbiometricdevicelist" element={<Assignedbiometricdevicelist />} />
            <Route path="holidayweekofflogin" element={<HolidayWeekoffLoginList />} />
            <Route path="production/othertaskconsolidatedreport" element={<OtherTaskConsolidatedReport />} />
            <Route path="production/otherindividualreport" element={<OtherTaskIndividualReport />} />
            <Route path="connections/unassigneduserslist" element={<RocketChatUnAssignedUsersList />} />
            {/* <Route path="production/queuetypereport" element={<QueueTypeReport />} /> */}
            <Route path="/settings/mailconfiguration" element={<Mailconfiguration />} />
            <Route path="/settings/meetingconfiguration" element={<Meetingconfiguration />} />
            <Route path="assignworkfromhome" element={<Assignworkfromhome />} />
            <Route path="applyworkfromhome" element={<Applyworkfromhome />} />
            <Route path="production/targetpointsfilter" element={<TargetpointsFilter />} />
            <Route path="production/targetpointslist" element={<Targetpointslist />} />
            <Route path="production/eraamountlist" element={<EraAmountlist />} />
            <Route path="production/revenueamountlist" element={<RevenueAmountlist />} />
            <Route path="productionedit/:id" element={<ProductionindividualEdit />} />
            <Route path="production/queuetypereportsummary" element={<QueueTypeReportSummary />} />
            <Route path="production/othertaskupload" element={<OtherTaskUpload />} />
            <Route path="production/othertaskuploadlist" element={<OtherTaskUploadList />} />
            <Route path="production/othertaskuploadedit/:id" element={<OtherTaskUploadEdit />} />
            <Route path="production/unassignedreportlist" element={<UnAssignedReportList />} />
            {/* <Route path="/powerpoint" element={<Powerpoint />} /> */}
            <Route path="attendancebulkupdate" element={<AttendanceBulkUpdate />} />

            <Route path="/pptcategory&subcategory" element={<PPTCategoryAndSubCategory />} />
            {/* <Route path="/powerpointlist" element={<PowerpointList />} /> */}
            {/* <Route path="/powerpointlist/:id" element={<EditPowerpoint />} /> */}
            <Route path="asset/inidividualemployeeassetdistribution" element={<IndividualEmployeeAssetDistribution />} />
            <Route path="asset/employeeassetreturnregister" element={<EmployeeAssetReturnRegister />} />
            <Route path="asset/employeeassetdistributionlog/:id" element={<EmployeeAssetDistributionLog />} />
            <Route path="asset/teamemployeeassetacceptancelist" element={<TeamAssetAcceptanceList />} />
            <Route path="asset/employeeassettransferorreturn" element={<EmployeeAssetTransferOrReturn />} />
            <Route path="production/productionoriginalsummary" element={<ProductionOriginalSummary />} />
            <Route path="asset/allstocklist/:id" element={<AllStockList />} />
            <Route path="attendancebulkupdatereport" element={< AttendanceBulkUpdateReport />} />
            <Route path="task/training/master/overalltraininguserreport" element={<OverallTrainingForUserReport />} />
            <Route path="task/overalltaskforuserreport" element={<OverallTaskForUsersReport />} />
            <Route path="production/productiontempsummary" element={<ProductionTempSummary />} />
            <Route path="production/zerounitrateassignedunassigned" element={<Newrateupdate />} />
            <Route path="interactor/viewoverallhistoryvisitor" element={<ViewOverallHistoryVisitor />} />
            <Route path="interactor/viewoverallhistoryvisitorlog/:id" element={<ViewOverallHistoryVisitorLog />} />
            <Route path="interactor/visitorsdetailslog" element={<VisitorDetailsLog />} />
            <Route path="interactor/visitorsdetailslogindividuallist/:visterid" element={<VisitorDetailsLogList />} />
            <Route path="shiftbreakhours" element={<ShiftBreakHours />} />
            <Route path="/advancerequest" element={<AdvanceRequest />} />
            <Route path="/approvedadvance" element={<ApprovedAdvance />} />
            <Route path="/rejoininterncreate/:oldempid" element={<RejoinInternCreate />} />
            <Route path="rejoinemployeecreate/:oldempid" element={<RejoinEmployeeCreate />} />
            <Route path="/assetspecification/software/operatingsystem" element={<Operatingsystem />} />
            <Route path="/assetspecification/software/applicationname" element={<ApplicationName />} />
            <Route path="/biometricdevicemanagement" element={<BiometricDeviceManagement />} />
            <Route path="/biometricdevicespairing" element={<BiometricDevicesPairing />} />
            <Route path="/biometricremotecontrol" element={<Biometricremotecontrol />} />
            <Route path="/biometric/brandmodel" element={<Biometricbrandmodel />} />


            <Route path="/biometricstatuslist" element={<BiometricstatusList />} />
            <Route path="hrdocuments/approvaluserdocuments" element={<ApprovalDocumentsForUser />} />
            <Route path="hrdocuments/approvalcandidatedocuments" element={<CandidateDocumentsApproval />} />
            <Route path="hrdocuments/candidatedocumentprintedlist" element={<CandidateDocumentsPrintedStatusList />} />

            <Route path="hrdocuments/hierarchyapprovalemployeedocuments" element={<HierarchyApprovalEmployeeDocuments />} />
            <Route path="interview/interviewverificationmaster" element={<InterviewVerification />} />
            <Route path="/interactor/addvisitorin" element={<AddVisitors />} />

            <Route path="/interactor/visitoryoutentry" element={<VisitorOutEntry />} />
            <Route path="/pendinghitrackerinstallationsreport" element={<HiTrackerNotInstalledUsers />} />
            <Route path="/assetspecification/software/softwarespecification" element={<SoftwareSpecification />} />
            <Route path="/assetspecification/software/assetsoftwaregrouping" element={<AssetSoftwareGrouping />} />
            <Route path="/hrdocuments/termsandcondition" element={<TermsandCondition />} />
            <Route path="production/newrateoverallreport" element={<NewrateOverallReport />} />
            <Route path="interview/typingtestpracticequestions" element={<TypingPracticeQuestions />} />
            <Route path="interview/typingtestpracticequestionsgrouping" element={<TypingPracticeQuestionsGrouping />} />
            <Route path="interview/typingtestpracticesession" element={<TypingPracticeSession />} />
            <Route path="individualtypingresponse/:groupingid" element={<IndividualPracticeSessionResponse />} />
            <Route path="grouptypingresponse/:groupingid" element={<GroupingPracticeSessionResponse />} />
            <Route path="asset/assetsoftwaredetails" element={<AssetSoftwaredetails />} />
            <Route path="asset/assetsoftwarelist" element={<AssetSoftwareDetailsList />} />
            <Route path="production/clienterroroverallreport" element={<Clienterroroverallreport />} />
            <Route path="interview/overalltypingpracticeresponse" element={<OverallTypingPracticeResponse />} />
            <Route path="attendancewithproductionoverallreview" element={<AttendanceWithProdOverallReview />} />
            <Route path="/quality/accuracy/individualemployeeinternalstatuslist" element={<IndividualEmployeeInternalstatusList />} />
            <Route path="stocknotficationlist" element={<StockNotificatonList />} />
            <Route path="stockpurchase/stockmanagementreport" element={<StockManagementReport />} />
            <Route path="/production/paidstatusfixmonthset" element={<PaidstatusfixMonthSet />} />
            <Route path="/production/penaltywaivermonthset" element={<Penaltywaivermonthset />} />
            <Route path="production/queuetypeunassignedreport" element={<QueueTypeUnassignedReport />} />
            <Route path="production/productionmonthoriginalupload" element={<ProductionMonthoriginalupload />} />
            <Route path="production/productionmonthupload" element={<ProductionMonthUpload />} />
            <Route path="updatepages/addemployeesignature" element={<AddEmployeeSignature />} />
            <Route path="/quality/accuracy/achievedaccuracyindividualreviewinternalstatussummarylist" element={<AchievedAccuracyIndividualReviewInternalstatusSummaryList />} />
            <Route path="asset/ticketmaintenancereport" element={<TicketMaintenanceReport />} />
            <Route path="attendancewithproductionoverallreviewindv" element={<AttendanceWithProdOverallReviewIndv />} />
            <Route path="asset/overalltaskmaintenancereport" element={<OverallMaintenanceTaskReport />} />
            <Route path="eb/ebervicemasterchange/:id" element={<Ebservicemasterloglist />} />
            {/* page not found */}
            {/* <Route path="*" element={<p>Not found!</p>} /> */}
          </Route>
        </Routes>
        <br />
        <Footer />
      </Suspense>
      <br />
    </>
  );
};

export default App;
