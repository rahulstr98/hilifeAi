import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { Routes, Route } from 'react-router-dom';
// import JobRolesWebsite from '../webpages/career';
// import JobdescriptionWebsite from '../webpages/jobdescription';
// import Candidatewebsite from '../webpages/candidate';
// import Response from '../webpages/response';
// import InterviewEndPageRetest from '../webpages/InterviewEndPageRetest';
// import InterFomrGenerate from '../webpages/interFormGenerate';
// import InterviewFormHr from '../webpages/InterviewFormHr';
// import InterviewEndPage from '../webpages/InterviewEndPage';
// import InterviewTestRound from '../webpages/InterviewTestRound';
// import DocumentPreparationpage from '../webpages/DocumentPreparationpage';
// import CandidateLinkUpload from '../webpages/CandidateLinkUpload';
import UploadThankYou from '../webpages/UploadThankYou';
// import PasswordResetGreetMsg from '../webpages/PasswordResetGreetMsg';
// import UserPasswordCredentials from '../webpages/userPasswordCredentials';
// import CandidateEducationalDocument from '../webpages/CandidateEducationalDocument';

import Checkoutaction from '../webpages/checkoutaction';
import Checkinvisitor from '../webpages/checkinvisitor';
import Visitorsregister from '../webpages/visitorsregistor';
import Visitorsinformationregister from '../webpages/visitorinformationregister';
// import VisitorInformation from '../webpages/visitorinformation';

// import Addcandidates from '../webpages/Addcandidates';
// import BDCard from '../webpages/BDayCard';
// import ExitInterview from '../webpages/ExitInterview';
// import ExitInterviewEndPage from '../webpages/ExitInterviewEnd';
import OnlineUserTestQuestion from '../webpages/OnlineUserTestQuestion';
// import BDayCardTwo from '../webpages/BDayCardTwo';
// import BDayCardTwo2nos from '../webpages/BDayCardTwo2nos';
// import BDayCardTwo3nos from '../webpages/BDayCardTwo3nos';
// import WeddingCard from '../webpages/Weddingcard';
// import Weddingcard2nos from '../webpages/weddingcard2nos';
// import Weddingcard3nos from '../webpages/Weddingcard3nos';
import PaySlipDocumentPreparationPage from '../webpages/PaySlipDocumentPreparationPage';
import EmployeeDocumentsApprovalPage from '../webpages/EmployeeDocumentsApprovalPage';
// import PracticeSession from '../webpages/PracticeSession';
// import PracticeSessionResult from '../webpages/PracticeSessionResult';
// import BDayCardmanualtemplate from '../webpages/BDayCardmanualtemplate';
// import WeddingCardmanualtemplate from '../webpages/weddingcardmanualtemplate';
import SelfCheckInVisitor from '../webpages/Selfcheckinvisitor';
// import InterviewRoundsTestVerification from '../webpages/InterviewRoundsTestVerification';
// import InterviewTestingEndPage from '../webpages/InterviewTestingEndPage';
// import InterviewTestRoundCheck from '../webpages/InterviewTestRoundCheck';
// import RouteWatcher from '../RouteWatcher';
// import UserSurvey from '../webpages/UserSurvey.js';
// import AppraisalInterview from '../webpages/AppraisalInterview.js';
// import PromotionInterview from '../webpages/PromotionInterview.js';
function Webstock() {
  return (
    <>
      <BrowserRouter>
        {/* <RouteWatcher /> */}
        <Routes>
          {/* <Route path="/appraisalinterview/:employeeid/:groupingid/:roundname/:mainid/:logid/:startedby/:responseid/:userid" element={<AppraisalInterview />} /> */}
          {/* <Route path="/promotioninterview/:employeeid/:groupingid/:roundname/:mainid/:logid/:startedby/:responseid/:userid" element={<PromotionInterview />} /> */}
          {/* <Route path="/usersurvey/:employeeid/:groupingid/:roundname" element={<UserSurvey />} /> */}
          {/* <Route path="/candidate/:dbvalue/:filetype/:id" element={<CandidateEducationalDocument />} /> */}
          {/* <Route path="/career" element={<JobRolesWebsite />} /> */}
          {/* <Route path="/career/jobdescriptions/:jobname/:id" element={<JobdescriptionWebsite />} /> */}
          {/* <Route path="/career/candidate/:id" element={<Candidatewebsite />} /> */}
          {/* <Route path="/career/response" element={<Response />} /> */}
          {/* <Route path="/hr/:from/:username/:password/:roundid/:id/:candidateid/:hrid" element={<InterviewFormHr />} /> */}
          {/* <Route path="/interview/interviewformgenerate/:mode/:testcount/:candidateid/:roundid/:autofill/:id" element={<InterFomrGenerate />} /> */}
          {/* <Route path="interview/interviewendpage/:mode/:candidateid/:roundid" element={<InterviewEndPage />} /> */}
          {/* <Route path="interview/interviewendpage/typingtest/:testcount/:candidateid/:roundid/:questionid" element={<InterviewEndPageRetest />} /> */}
          {/* <Route path="/interview/interviewtestround/:candidateid/:roundid/:autofill/:idgen" element={<InterviewTestRound />} /> */}
          {/* <Route path="/usercredentials/reset/:id" element={<UserPasswordCredentials />} /> */}
          {/* <Route path="/passwordresetgreetmsg" element={<PasswordResetGreetMsg />} /> */}
          {/* <Route path="/document/documentpreparation/:name/:id/:issuedperson/:date/:userid" element={<DocumentPreparationpage />} /> */}
          {/* <Route path="/uploaddocument/:count/:filename/:uniqueid" element={<CandidateLinkUpload />} /> */}
          <Route path="/thankyouforupload" element={<UploadThankYou />} />
          {/* <Route path="/addcandidates/:id" element={<Addcandidates />} /> */}
          <Route path="/Visitorsregister/:company/:branch" element={<Visitorsregister />} />
          <Route path="/Visitorsinformationregister/:company/:branch" element={<Visitorsinformationregister />} />
          <Route path="/Checkinvisitor/:company/:branch" element={<Checkinvisitor />} />
          {/* <Route path="/visitorinformation/:company/:branch" element={<VisitorInformation />} /> */}
          <Route path="/checkoutaction/:company/:branch" element={<Checkoutaction />} />
          {/* <Route path="birthdaycard" element={<BDCard />} /> */}
          {/* <Route path="exitinterview/exitinterviewendpage" element={<ExitInterviewEndPage />} /> */}
          {/* <Route path="/interview/exitinterview/:candidateid/:testname/:autofill" element={<ExitInterview />} /> */}
          <Route path="/training/:id" element={<OnlineUserTestQuestion />} />
          {/* <Route path="birthdaycard" element={<BDCard />} /> */}
          {/* <Route path="birthdaycardtwo" element={<BDayCardTwo />} /> */}
          {/* <Route path="birthdaycardtwo2nos" element={<BDayCardTwo2nos />} /> */}
          {/* <Route path="birthdaycardtwo3nos" element={<BDayCardTwo3nos />} /> */}
          {/* <Route path="weddingcard" element={<WeddingCard />} /> */}
          {/* <Route path="weddingcard2nos" element={<Weddingcard2nos />} /> */}
          {/* <Route path="weddingcard3nos" element={<Weddingcard3nos />} /> */}
          {/* <Route path="birthdaycardtwomanualtemplate" element={<BDayCardmanualtemplate />} /> */}
          {/* <Route path="weddingcardmanualtemplate" element={<WeddingCardmanualtemplate />} /> */}
          <Route path="/selfcheckinvisitor" element={<SelfCheckInVisitor />} />
          <Route path="/document/payslippreparation/:name/:code/:month/:year/:genby/:gendate/:tempid" element={<PaySlipDocumentPreparationPage />} />
          <Route path="employeedocumentsapproval/:id" element={<EmployeeDocumentsApprovalPage />} />
          {/* <Route path="/practicesessionresult/:resultid" element={<PracticeSessionResult />} /> */}
          {/* <Route path="/practicesession/:groupingid/:userid" element={<PracticeSession />} /> */}
          {/* <Route path="manualtemplate/:id" element={<BDayCardmanualtemplate />} /> */}
          {/* <Route path="weddingcardmanualtemplate" element={<WeddingCardmanualtemplate />} /> */}
          {/* <Route path="/webpages/interview/interviewroundstestverification/:questiongroupingid/:questionorderid/:roundorderid/:mode/:designation/:roundname/:employeename" element={<InterviewRoundsTestVerification />} /> */}
          {/* <Route path="/webpages/interview/interviewroundstestverification/:mode/:designation/:roundname/:testname/:employeename" element={<InterviewTestRoundCheck />} /> */}
          {/* <Route path="interview/interviewendpage/testing/:mode/:responseid" element={<InterviewTestingEndPage />} /> */}
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default Webstock;
