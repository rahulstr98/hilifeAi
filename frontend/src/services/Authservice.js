// export const BASE_URL = "http://192.168.85.125:7001";
export const BASE_URL = "http://192.168.1.5:7001";
// export const BASE_URL = "http://10.43.140.87:7001";
// export const BASE_URL = "http://172.20.10.2:7001";
// export const BASE_URL = "http://192.168.125.87:7001";
// export const BASE_URL = 'http://192.168.85.100:8003';
// export const BASE_URL = "http://192.168.0.110:7001";
export const BASE_URL_TTS= "http://192.168.8.14:7000";
// export const BASE_URL = "https://demo.hihrms.com";
// export const BASE_URL = "http://hihrms.hilifeai.in";
// export const BASE_URL = "http://anubhuthi.org";
// export const BASE_URL = "https://hilifeai.in";
// export const BASE_URL = "https://demo.hihrms.com";
// export const BASE_URL = "https://hrms.ttsbs.in";
// export const BASE_URL = "https://hihrms.ttsbusinessservices.com";


export const AUTH = {
  LOGIN: `${BASE_URL}/api/authlog`,
  LOGINCHECK: `${BASE_URL}/api/authlogcheck`,
  FACEDETECTLOGIN: `${BASE_URL}/api/authenticate`,
  FACEDETECTLOGINMODEL: `${BASE_URL}/api/weights`,
  GETUSERINDIVIDUAL: `${BASE_URL}/api/userindividual`,
  GETUSERATTINV: `${BASE_URL}/api/userattindv`,
  USERIDLEHOURS: `${BASE_URL}/api/useridlehours`,
  GETUSER: `${BASE_URL}/api/auth`,
  GETAUTHROLE: `${BASE_URL}/api/authroles`,
  LOGOUT: `${BASE_URL}/api/authout`,
  PROJECTLIMIT: `${BASE_URL}/api/projectslimit`,
  TASKSLIMIT: `${BASE_URL}/api/allfiltertask`,
  ALLTASKS: `${BASE_URL}/api/alltasktime`,
  ALLUSERLIMIT: `${BASE_URL}/api/usersalllimit`,
  VERIFYTWOFA: `${BASE_URL}/api/verifytwofa`,
  VERIFYTWOFACHECK: `${BASE_URL}/api/verifytwofacheck`,
  VERIFYVIEWPASSWORD: `${BASE_URL}/api/verification/viewpassword`,
  GETDOCUMENTS: `${BASE_URL}/api/employeedocumentcommonid`,
};
