const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const connectDb = require("./config/connection");
const nodemailer = require("nodemailer");
const authRoute = require("./route/auth");
const draftRoute = require("./route/draft");
const companyRoute = require("./route/setup");
const projectsRoute = require("./route/project");
const hrmoduleRoute = require("./route/hr");
const hrfacilityRoute = require("./route/hrfacility");
const roleRoute = require("./route/role");
const excelRoute = require("./route/excel");
const attendanceRoute = require("./route/attendance");
const accountRoute = require("./route/account");
const remarkRoute = require("./route/remarks");
const ticketRoute = require("./route/tickets");
const leaveRoute = require("./route/leave");
const stockRoute = require("./route/stock");
const expenseRoute = require("./route/expense");
const interviewRoute = require("./route/interview");
const referenceRoute = require("./route/reference");
const passwordRoute = require("./route/password");
const productionRoute = require("./route/production");
const settingRoute = require("./route/settings");
const taskRoute = require("./route/task");
const permissionRoute = require("./route/permission");
const Accuracy = require('./route/accuracymaster');
const ebRoute = require("./route/eb");
const multer = require("multer");
const cron = require("node-cron");
const moment = require("moment");
const axios = require("axios");
const Interactor = require("./route/interactor");

const errorMiddleware = require("./middleware/errorHandle");
const Department = require("./model/modules/department");
const Departmentmonthset = require("./model/modules/departmentmonthset");
const Attandance = require("./model/modules/attendance/attendance");
const Shift = require("./model/modules/shift");
const Designation = require("./model/modules/designation");
const Designationmonthset = require("./model/modules/DesignationMonthSetModel");
const Paiddatemode = require("./model/modules/production/paiddatemode");

const Process = require("./model/modules/production/ProcessQueueNameModel");
const Processmonthset = require("./model/modules/ProcessMonthSetModel");
const AttendanceControlCriteria = require("./model/modules/settings/Attendancecontrolcriteria");

const NotAddedBills = require("./model/modules/expense/NotaddedBills");
const SchedulePaymentMaster = require("./model/modules/expense/SchedulePaymentMaster");
const pm2 = require("pm2");
const { getDay, getDate, getMonth, format } = require("date-fns");

const Cors = require("cors");

// Setting up config file


dotenv.config();

// Serve static files
// app.use(express.static(path.join(__dirname, 'public')));

process.on("uncaughtException", (err) => {
  console.log(`ERROR: ${err.message}`);
  console.log("Shutting down due to uncaught exception");
  server.close(() => {
    process.exit(1);
  });
});

// Connection to database mongodb
connectDb();

const app = express();
const upload = multer();

app.use(Cors());


app.use(bodyParser.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ limit: "500mb", extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/api", permissionRoute, authRoute, taskRoute, settingRoute, productionRoute, passwordRoute, expenseRoute, referenceRoute, interviewRoute, leaveRoute, stockRoute, ticketRoute, projectsRoute, draftRoute, hrmoduleRoute, roleRoute, companyRoute, hrfacilityRoute, excelRoute, attendanceRoute, remarkRoute, accountRoute, ebRoute,Interactor, Accuracy);

app.use(bodyParser.json());

const mergeChunks = async (fileName, totalChunks) => {
  const chunkDir = __dirname + "/chunks";
  const mergedFilePath = __dirname + "/merged_files";

  if (!fs.existsSync(mergedFilePath)) {
    fs.mkdirSync(mergedFilePath);
  }

  const writeStream = fs.createWriteStream(`${mergedFilePath}/${fileName}`);
  for (let i = 0; i < totalChunks; i++) {
    const chunkFilePath = `${chunkDir}/${fileName}.part_${i}`;
    const chunkBuffer = await fs.promises.readFile(chunkFilePath);
    writeStream.write(chunkBuffer);
    fs.unlinkSync(chunkFilePath); // Delete the individual chunk file after merging
  }

  writeStream.end();
};

app.post("/upload", upload.single("file"), async (req, res) => {
  const chunk = req.file.buffer;
  const chunkNumber = Number(req.body.chunkNumber); // Sent from the client
  const totalChunks = Number(req.body.totalChunks); // Sent from the client
  const fileName =  req.body.originalname;

  const chunkDir = __dirname + "/chunks"; // Directory to save chunks

  if (!fs.existsSync(chunkDir)) {
    fs.mkdirSync(chunkDir);
  }

  const chunkFilePath = `${chunkDir}/${fileName}.part_${chunkNumber}`;

  try {
    await fs.promises.writeFile(chunkFilePath, chunk);

    if (chunkNumber === totalChunks - 1) {
      // If this is the last chunk, merge all chunks into a single file
      await mergeChunks(fileName, totalChunks);
    }

    res.status(200).json({ message: "Chunk uploaded successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error saving chunk" });
  }
});

app.get('/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'merged_files', filename);


    if (fs.existsSync(filePath)) {
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      // res.setHeader('Content-disposition', 'attachment; filename=' + filename);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-type', 'application/octet-stream');
    } else {
      res.status(404).send('File not found');
    }
  } catch (error) {
    // Log any errors that occur during file retrieval
    res.status(500).send('Internal Server Error');
  }
});

//--------------------------- BIRTHDAY WISHES -----------------------------------
app.post("/api/schedule-birthdayemail", (req, res) => {
  const { email,  date, time,name, company  } = req.body;

  // Parse the date and time strings into a Moment object
  const scheduledTime = moment(`${date} ${time}`, "YYYY-MM-DD HH:mm");

  // Set up the Nodemailer transporter
  const transporters = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "cshankari27@gmail.com",
      pass: "vqhzwuklzypwruyu"
    }
  });

  // Define the email message
  const mailOptions = {
    from: "cshankari27@gmail.com",
    to: email,
    subject:`Happy Birthday ${name}`,
    html: `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Birthday Wishes</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
   
        .container {
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
   
        h1 {
          color: #333;
          text-align: center;
        }
   
        p {
          color: #555;
          line-height: 1.6;
        }
   
        .birthday-gift {
          text-align: center;
          margin-top: 20px;
        }
   
        img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
        }
   
        .signature {
          margin-top: 20px;
          text-align: right;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Happy Birthday ${name}! 🎉🎂</h1>
   
        <p>
          Dear ${name},
        </p>
   
        <p>
          Wishing you a fantastic and joyful birthday! 🎈 On this special day, we want to take a moment to celebrate you and express our gratitude for the incredible contributions you make to our team.
        </p>
   
        <p>
          May this year bring you immense joy, new adventures, and continued success both personally and professionally. Your hard work, dedication, and positive attitude inspire us all.
        </p>
   
        <p>
          We hope you take some time today to relax, enjoy the company of your loved ones, and indulge in your favorite treats!
        </p>
   
        <div class="signature">
          Best wishes,<br>
          ${company}
        </div>
      </div>
    </body>
    </html>`
   
  };

  // Schedule the email to be sent at the specified time
  cron.schedule(scheduledTime.format("m H D M d"), () => {
    transporters.sendMail(mailOptions, (error, info) => {
      if (error) {
        res
          .status(500)
          .json({ message: "An error occurred while sending the email." });
      } else {
        res.json({ message: "Email sent successfully!" });
      }
    });
  });

  // Send a response to the client
  res.json({ message: "Email scheduled successfully!" });
});

//--------------------------- WEDDING ANNIVERSARY WISHES -----------------------------------
app.post("/api/schedule-weddingemail", (req, res) => {
  const { email,  date, time,name, company  } = req.body;

  // Parse the date and time strings into a Moment object
  const scheduledTime = moment(`${date} ${time}`, "YYYY-MM-DD HH:mm");

  // Set up the Nodemailer transporter
  const transporters = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "cshankari27@gmail.com",
      pass: "vqhzwuklzypwruyu"
    }
  });

  // Define the email message
  const mailOptions = {
    from: "cshankari27@gmail.com",
    to: email,
    subject:`Happy Wedding Anniversary ${name}`,
    html: `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Anniversary Wishes</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
   
        .container {
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
   
        h1 {
          color: #333;
          text-align: center;
        }
   
        p {
          color: #555;
          line-height: 1.6;
        }
   
        .celebration-image {
          text-align: center;
          margin-top: 20px;
        }
   
        img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
        }
   
        .signature {
          margin-top: 20px;
          text-align: right;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Celebrating Love and Togetherness! 💑</h1>
   
        <p>
          Dear ${name},
        </p>
   
        <p>
          On this special day, we are overjoyed to extend our heartfelt congratulations on your wedding anniversary! 🎉 Today marks another year of love, companionship, and cherished moments together.
        </p>
   
        <p>
          Your commitment to each other is truly inspiring, and we feel privileged to share in the joy of this milestone. May your journey continue to be filled with love, laughter, and countless beautiful memories.
        </p>
   
        <p>
          Wishing you both a wonderful celebration and many more years of happiness ahead!
        </p>
   
        <div class="signature">
          Best wishes,<br>
          ${company}
        </div>
      </div>
    </body>
    </html>
    `
   
  };

  // Schedule the email to be sent at the specified time
  cron.schedule(scheduledTime.format("m H D M d"), () => {
    transporters.sendMail(mailOptions, (error, info) => {
      if (error) {
        res
          .status(500)
          .json({ message: "An error occurred while sending the email." });
      } else {
        res.json({ message: "Email sent successfully!" });
      }
    });
  });

  // Send a response to the client
  res.json({ message: "Email scheduled successfully!" });
});

//--------------------------- WORK ANNIVERSARY WISHES -----------------------------------
app.post("/api/schedule-workanniversaryemail", (req, res) => {
  const { email,  date, time,name, company  } = req.body;

  // Parse the date and time strings into a Moment object
  const scheduledTime = moment(`${date} ${time}`, "YYYY-MM-DD HH:mm");

  // Set up the Nodemailer transporter
  const transporters = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "cshankari27@gmail.com",
      pass: "vqhzwuklzypwruyu"
    }
  });

  // Define the email message
  const mailOptions = {
    from: "cshankari27@gmail.com",
    to: email,
    subject:`Happy Work Anniversary ${name}`,
    html: `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Work Anniversary Wishes</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
   
        .container {
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
   
        h1 {
          color: #333;
          text-align: center;
        }
   
        p {
          color: #555;
          line-height: 1.6;
        }
   
        .congratulations-image {
          text-align: center;
          margin-top: 20px;
        }
   
        img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
        }
   
        .signature {
          margin-top: 20px;
          text-align: right;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Congratulations on Your Work Anniversary! 🎉</h1>
   
        <p>
          Dear ${name},
        </p>
   
        <p>
          Happy work anniversary! 🥳 It's an honor to celebrate this milestone with you as you mark another year of dedication, hard work, and valuable contributions to our team.
        </p>
   
        <p>
          Your commitment and passion are truly appreciated. We are grateful for the positive impact you've made, and we look forward to many more successful years together.
        </p>
   
        <p>
          Thank you for your outstanding efforts and for being an integral part of our team's success.
        </p>
   
        <div class="signature">
          Best wishes,<br>
          ${company}
        </div>
      </div>
    </body>
    </html>
   
    `
   
  };

  // Schedule the email to be sent at the specified time
  cron.schedule(scheduledTime.format("m H D M d"), () => {
    transporters.sendMail(mailOptions, (error, info) => {
      if (error) {
        res
          .status(500)
          .json({ message: "An error occurred while sending the email." });
      } else {
        res.json({ message: "Email sent successfully!" });
      }
    });
  });

  // Send a response to the client
  res.json({ message: "Email scheduled successfully!" });
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "cshankari27@gmail.com",
    pass: "srgvavrpyvkznjyl",
  },
});

app.post("/send-email", (req, res) => {
  const { name, email, message, company } = req.body;

  const mailOptions = {
    from: "cshankari27@gmail.com",
    to: email,
    subject: "Your account details",
    html: `<html>

    <head>
        <style>
            /* Add your CSS styles here */
            body {
                font-family: Arial, sans-serif;
                background-color: #f5f5f5;
            }
   
            .message {
                color: #333;
                border: 1px solid #ccc;
                background-color: #fff;
                width: 550px;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
   
            }
   
            .topbar {
                height: 70px;
                background: #1976d2;
                position: relative;
            }
   
            .companyname {
                position: absolute;
                color: white;
                margin: 0;
                padding-top: 15px;
                text-decoration: none;
                width: 100%;
                text-align: center;
            }
   
            h2 a {
                color: white !important;
                text-decoration: none;
            }
   
            .maincontent {
                padding: 30px;
                /* Add margin to push content below the topbar */
            }
   
            .buttonstyle {
                display: flex;
                justify-content: center;
            }
   
            .btn {
                padding: 8px 20px;
                background: #1976d2;
                box-shadow: 0px 0px 5px #0000004d;
                border: none;
                border-radius: 5px;
                color: white;
            }
        </style>
    </head>
   
    <body>
        <div class="message">
            <div class="topbar">
                <h2 class="companyname">${company}</h2>
            </div>
            <div class="maincontent">
                <p><strong>Your account info:-</strong></p>
                <br />
                <p><strong>Username:</strong> ${name}</p>
                <p><strong>Password:</strong> ${message}</p>
                <br />
                <br />
                <div class="buttonstyle">
                <a href="hihrms.com"><button class="btn">Login</button></a>
                </div>
            </div>
        </div>
    </body>
   
    </html>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.status(500).send("Error sending email");
    } else {
      res.status(200).send("Email sent successfully");
    }
  });
});

//Attendance auto logout generation
const currentTime = new Date().toLocaleTimeString();

 
 

//1 hour'0 0 * * * *'

//1 min '* * * * *'

//5hr '0 */5 * *'

cron.schedule('* * * * *', async () => {
var atttoday = new Date();
  var attdd = String(atttoday.getDate()).padStart(2, "0");
  var attmm = String(atttoday.getMonth() + 1).padStart(2, "0"); // January is 0!
  var attyyyy = atttoday.getFullYear();

  var atttodayDate = attdd  + "-" + attmm + "-" + attyyyy;

  // Get yesterday's date
  var attyesterday = new Date(atttoday);
  attyesterday.setDate(atttoday.getDate() - 1);
  attdd = String(attyesterday.getDate()).padStart(2, "0");
  attmm = String(attyesterday.getMonth() + 1).padStart(2, "0"); // January is 0!
  attyyyy = attyesterday.getFullYear();

  var attyesterdayDate = attdd + "-" + attmm + "-" + attyyyy;
const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  try {
    let attendances = await Attandance.find({ date:attyesterdayDate,buttonstatus: "true" }).exec();
    let shifts = await Shift.find().exec();
    
    let attendancesmixed = attendances.map(attendance => {
      const shiftInfo = shifts.find(shift => shift.name === attendance.shiftname);
      return {
        username: attendance.username,
        clockintime: attendance.clockintime,
        clockouttime: attendance.clockouttime,
        buttonstatus: attendance.buttonstatus,
        date: attendance.date,
        clockinipaddress: attendance.clockinipaddress,
        userid: attendance.userid,
        status: attendance.status,
        shiftname: attendance.shiftname,
        starttime: shiftInfo ? `${shiftInfo.fromhour}:${shiftInfo.frommin}:00 ${shiftInfo.fromtime}` : null,
        endtime: shiftInfo ? `${shiftInfo.tohour}:${shiftInfo.tomin}:00 ${shiftInfo.totime}` : null,
        _id: attendance._id
      };
    });
    
    

    const result = attendancesmixed.filter((data, index)=>{
const currentTimeObj = new Date(`2000-01-01 ${currentTime}`);
  const endTimeObj = new Date(`2000-01-01 ${data.starttime}`);
  const endTimeMinus4Hours = new Date(endTimeObj.getTime() - 5 * 60 * 60 * 1000);

if (currentTimeObj > endTimeMinus4Hours) {

 return data
  }
    })

  await updateUser(result);
  } catch (error) {
    console.error('Error in scheduled job:', error);
  }
});

const updateUser = async (result) => {
  try {
    // Ensure all axios requests are completed before moving on
    await Promise.all(result.map(async (item) => {
      await axios.put(`http://anubhuthi.org/api/attandance/${item._id}`, {
        clockouttime: item.endtime,
        buttonstatus: "false",
        autoclockout: Boolean(true)
      });
    }));

  } catch (error) {
    console.error('Error updating users:', error);
  }
};

//every month last date
//0 0 28-31 * *


//Paid date fix autogeneration
cron.schedule('0 0 28 * *', async () => {
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const cmonth = new Date().getMonth();
  let monthName;
  let year;
  if (cmonth == 11) {
    monthName = monthNames[0];
    year = new Date().getFullYear();
    year = Number(year) + 1
  } else {
    monthName = monthNames[Number(cmonth) + 1];
    year = new Date().getFullYear();
  }
  const month = new Date().getMonth() + 1;

  try {
    let paiddatemode = await Paiddatemode.find().exec();

    const transformedData = paiddatemode.flatMap(item => {
      return item.department.map(department => ({
        department: department,
        date: item.date,
        type: item.type,
        paymode: item.paymode
      }));
    });

    const finalres = transformedData.forEach((data, index) => {
      const resdate = Number(month) + 1;
      const finaldate = month >= 10 && month == 11 ? "01" : month >= 10 ? (Number(month) + 2) : '0' + (Number(month) + 2);
      const samefinaldate = resdate >= 10 ? resdate : '0' + resdate;
      const changeddate = data.type == "Next Month" && month == 12 ? year + "-" + "02" + "-" + data.date
        :
        data.type == "Next Month" && month == 11 ? (Number(year) + 1) + "-" + finaldate + "-" + data.date
          :
          data.type == "Next Month" && month >= 8 ? year + "-" + (Number(month) + 2) + "-" + data.date
            :
            data.type == "Next Month" ? year + "-" + finaldate + "-" + data.date
              :
              month == 12 ? year + "-" + "01" + "-" + data.date
                :
                year + "-" + samefinaldate + "-" + data.date;
      axios.post(`http://anubhuthi.org/api/paiddatefix/new`, {
        department: [data.department],
        month: String(monthName),
        year: String(year),
        date: String(changeddate),
        paymode: String(data.paymode),
      });
    })
  } catch (error) {
    console.error('Error in scheduled job:', error);
  }
});


//Department monthset
//  Datefield
var today = new Date();
var dd = String(today.getDate()).padStart(2, "0");
var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
var yyyy = today.getFullYear();
today = yyyy + "-" + mm + "-" + "01";

if (today === yyyy + "-" + "12" + "-" + "01") {

  cron.schedule('50 50 23 * * *', async () => {
    try {

      function getDaysInMonth(month, year) {
        return new Date(year, month + 1, 0).getDate();
      }

      let year = Number(yyyy) + 1;
      let monthsarray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


      let result = monthsarray.map((month, index) => {
        return {
          month: month,
          days: getDaysInMonth(index, year)
        };
      });

      let deptmonthsets = await Departmentmonthset.find();
      let desigmonthsets = await Designationmonthset.find();
      let desiggrps = await DesignationGrouping.find();
      let deptdecember = deptmonthsets.filter(item => item.monthname === "December" && Number(item.year) == Number(yyyy));
      let desiggrp = desiggrps.filter((d) => deptdecember.map(item => item.department).includes(d.department));
      // Initialize result array
      let resultarrayvalStartdates = [];
      const result1 = [];
      let resultarrayval = [];
      // Loop over start dates
      for (const { todate, department, salary, proftaxstop, penalty, esistop, pfstop } of deptdecember) {
        let currentDate = new Date(todate);
        currentDate.setDate(currentDate.getDate() + 1); // Get the next day of the previous month's todate




        for (let i = 0; i < result.length; i++) {
          let month = result[i].month;
          let days = result[i].days;


          let todate;

          if (i === 0) {
            // For January, use the specified start date
            todate = new Date(currentDate);
            todate.setDate(todate.getDate() + days - 1); // -1 because we want the last day of the month
          } else {
            let beforemonthtodate = new Date(resultarrayval[i - 1].todate); // Get the previous month's todate
            beforemonthtodate.setDate(beforemonthtodate.getDate() + 1); // Get the next day of the previous month's todate
            currentDate = new Date(beforemonthtodate); // Set currentDate to the next day
            todate = new Date(currentDate);
            todate.setDate(todate.getDate() + days - 1); // Calculate the end date
          }

          let totaldays = Math.ceil((todate - currentDate) / (1000 * 60 * 60 * 24)) + 1;

          resultarrayval.push({
            department: department,
            monthname: month,
            month: i + 1,
            year: Number(yyyy) + 1,
            days: days,
            salary: salary,
            proftaxstop: proftaxstop,
            penalty: penalty,
            esistop: esistop,
            pfstop: pfstop,
            fromdate: `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`,
            todate: `${todate.getFullYear()}-${(todate.getMonth() + 1).toString().padStart(2, '0')}-${todate.getDate().toString().padStart(2, '0')}`,
            totaldays: totaldays
          });

          // Move to the next month's start date
          currentDate.setDate(currentDate.getDate() + 1);


        }
      }

      resultarrayval.forEach((arrayItem) => {
        desiggrp.forEach((desgItem) => {
          result1.push({ ...arrayItem, desig: desgItem.designation, });
        });
      });
      console.log(result1.length, "oo")

      const nonDuplicates = resultarrayval.filter(
        (ur) =>
          !deptmonthsets.some((oldItem) => {

            return ur.monthname === oldItem.monthname && ur.year == oldItem.year && ur.department == oldItem.department;
          })
      );

      const nonDuplicatesDesig = result1.filter(
        (ur) =>
          !desigmonthsets.some((oldItem) => {

            return ur.monthname === oldItem.monthname && ur.year == oldItem.year && ur.designation == oldItem.designation;
          })
      );


      await updateUserdept(nonDuplicates, nonDuplicatesDesig);
    } catch (error) {
      console.error('Error in department job:', error);
    }
  });

}

const updateUserdept = async (depts, desigs) => {
  try {

    // const isDuplicate = depts.some((item) => item.department == selectDepartment && item.year == selectedYear);

    if (depts.length > 0) {
      await Promise.all(depts.map(async (item) => {

        await axios.post(`http://anubhuthi.org/api/departmentmonthset/new`, {
          year: item.year,
          month: item.month,
          department: item.department,
          monthname: item.monthname,
          todate: item.todate,
          fromdate: item.fromdate,
          totaldays: item.totaldays,
          salary: item.salary,
          proftaxstop: item.proftaxstop,
          penalty: item.penalty,
          esistop: item.esistop,
          pfstop: item.pfstop,
        });

      }));
    }
    if (desigs.length > 0) {
      await Promise.all(desigs.map(async (item) => {

        await axios.post(`http://anubhuthi.org/api/designationmonthset/new`, {
          year: String(item.year),
          month: String(item.month),
          designation: String(item.desig),
          monthname: String(item.monthname),
          todate: String(item.todate),
          fromdate: String(item.fromdate),
          totaldays: String(item.totaldays),
        });

      }));
    }

    console.log('Department Monthset updated successfully');

  } catch (error) {
    console.error('Error updating Department:', error);
  }
};


//attendance double shift vice auto generation of values
const convertTo24HourFormat = (time) => {
  let [hours, minutes] = time?.slice(0, -2)?.split(":");
  hours = parseInt(hours, 10);
  if (time?.slice(-2) === "PM" && hours !== 12) {
    hours += 12;
  }
  return `${String(hours).padStart(2, "0")}:${minutes}`;
};
function addFutureTimeToCurrentTime(futureTime) {
  // Parse the future time string into hours and minutes
  const [futureHours, futureMinutes] = futureTime?.split(":").map(Number);

  // Get the current time
  const currentTime = new Date();

  // Get the current date
  const currentDate = currentTime.getDate();

  // Get the current hours and minutes
  const currentHours = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();

  // Calculate the time difference
  let timeDifferenceHours = futureHours - currentHours;
  let timeDifferenceMinutes = futureMinutes - currentMinutes;

  // Adjust for negative time difference
  if (timeDifferenceMinutes < 0) {
    timeDifferenceHours--;
    timeDifferenceMinutes += 60;
  }

  // Check if the future time falls on the next day
  if (timeDifferenceHours < 0) {
    // Add 1 day to the current date
    currentTime.setDate(currentDate + 1);
    timeDifferenceHours += 24;
  }

  // Create a new Date object by adding the time difference to the current time
  console.log(timeDifferenceHours, ":", timeDifferenceMinutes);

  const newDate = new Date();
  newDate.setHours(newDate.getHours() + timeDifferenceHours);
  newDate.setMinutes(newDate.getMinutes() + timeDifferenceMinutes);

  console.log(moment(newDate).format("DD-MM-YYYY hh:mm:ss A"));

  return newDate;
}
cron.schedule('*/30 * * * *', async () => {    
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
  var yyyy = today.getFullYear();
  today = yyyy + "-" + mm + "-" + dd;

  let mtoday =  dd + "-" + mm + "-" + yyyy;
    let startMonthDate = new Date(today);
    let endMonthDate = new Date(today);
    const userDates = [];
    let findsecondashift;
    while (startMonthDate <= endMonthDate) {
      const formattedDate = `${String(startMonthDate.getDate()).padStart(2, '0')}/${String(startMonthDate.getMonth() + 1).padStart(2, '0')}/${startMonthDate.getFullYear()}`;
      const dayName = startMonthDate.toLocaleDateString('en-US', { weekday: 'long' });
      const dayCount = startMonthDate.getDate();
      const shiftMode = 'Main Shift';

      userDates.push({ formattedDate, dayName, dayCount, shiftMode });

      // Move to the next day
      startMonthDate.setDate(startMonthDate.getDate() + 1);
  }
  
    try {
      let allusers = await axios.post("http://anubhuthi.org/api/userclockinclockoutstatus",{
        userDates: userDates
      });
      let attconcrieteria = await AttendanceControlCriteria.find();

      let resattcr = attconcrieteria[0]?.clockout;
      console.log(resattcr,'resattcr')

      let findsecondashift = allusers?.data?.finaluser.filter((data,index)=>{
        return data.shiftMode === "Second Shift"
      })
      let findmainashift = allusers?.data?.finaluser.filter((data,index)=>{
        return data.shiftMode === "Main Shift"
      })
      let finalmainusers = [];
      let finadfinalusers = findsecondashift.map((data, index)=>{
        let fdata = data
        findmainashift.forEach((resdata, i)=>{
          if(resdata.empcode === data.empcode){
            
            finalmainusers.push(resdata)
          }

        })

        return fdata
      })
      let checkifdoubleshift =[];
      finadfinalusers.forEach((sdata, sindex)=>{
        let sshift = sdata?.shift?.split('to');
        finalmainusers.forEach((mdata, mindex)=>{
          let mshift = mdata?.shift?.split('to');
          if((mshift[0]?.includes("PM") && mshift[1]?.includes("AM")) && (sdata.userid === mdata.userid && sshift[1] === mshift[0])){
            checkifdoubleshift.push(sdata)
          }else if(sdata.userid === mdata.userid && sshift[0] === mshift[1]){
            checkifdoubleshift.push(sdata)
          }
        })
      })

      let fresmainusers = []

      let fressecondusers = checkifdoubleshift.map((sdata, sindex)=>{
        finalmainusers.forEach((mdata, mindex)=>{
         
          if(sdata.userid === mdata.userid){
            fresmainusers.push(mdata)
          }
        })

        return sdata
      })
      let mainnightusers = [];
      let maindayusers = [];
      fresmainusers.map((data,i)=>{
          let rdata = data?.shift?.split('to');
          if(rdata[0]?.includes("PM") && rdata[1]?.includes("AM")){
            mainnightusers.push(data);
          }else{
            maindayusers.push(data);
          }
      })

      let result = [...fresmainusers,...fressecondusers];

      let updatefornightshift = fressecondusers.forEach((sdata, si)=>{
        let sshift = sdata?.shift?.split("to");
        mainnightusers.forEach((mdata, mindex)=>{
         if (sdata.userid === mdata.userid) {
            const currentTime = new Date();            // sshift[1] has format "07:00PM" or "10:00AM"
            const sshiftEndTime = sshift[1].trim();            // Extract hours, minutes, and period (AM/PM)
            const hours = parseInt(sshiftEndTime.substr(0, 2), 10);
            const minutes = parseInt(sshiftEndTime.substr(3, 2), 10);
            const period = sshiftEndTime.substr(5, 2).toUpperCase();            // Convert shift end time to 24-hour format and create a Date object
            let endHours = hours;
            if (period === 'PM' && hours !== 12) {
                endHours += 12;
            } else if (period === 'AM' && hours === 12) {
                endHours = 0;
            }            const endTimeObj = new Date();
            endTimeObj.setHours(endHours, minutes, 0, 0);            // Subtract 4 hours from the shift end time
            endTimeObj.setHours(endTimeObj.getHours() - 4);            console.log(currentTime, 'currentTime');
            console.log(endTimeObj, 'endTimeMinus4Hours', sshift[1]);            
            if (currentTime >= endTimeObj) {
            let mshift = mdata?.shift?.split("to")
           
     		        axios.post("http://anubhuthi.org/api/doubleattendanceforusers", {
                userid: sdata.userid,
                date: mtoday,
                shiftmode: "Second Shift"
            }).then(res => {		
    if(res?.data?.getdoubleshiftatt?.length > 0){
      const [startTimes, endTimes] = mdata?.shift?.split("to");
      const convertedEndTime =  convertTo24HourFormat(endTimes);
      const end = convertedEndTime;
      let [endHour, endMinute] = end?.slice(0, -2)?.split(":");
      endHour = parseInt(endHour, 10);
      endHour += Number(resattcr);
      
      console.log(endHour,'endHour');
      const newEnd = `${String(endHour).padStart(2, "0")}:${endMinute}${end?.slice(-2)}`;                  
      const calculatedshiftend = addFutureTimeToCurrentTime(newEnd);
     if(calculatedshiftend){
      const couttime = sshift[1]?.slice(0, (sshift[1]?.length - 2)) + ":00" + " " + sshift[1]?.slice(-2);
      axios.put(`http://anubhuthi.org/api/attandance/${res?.data?.getdoubleshiftatt[0]?._id}`,{
        clockouttime: couttime,
        clockoutipaddress:res?.data?.getdoubleshiftatt[0]?.clockinipaddress ,
        buttonstatus: "false",
        autoclockout:Boolean(false),
        attendancemanual: Boolean(false)
      })
      const cltime = mshift[0]?.slice(0, (mshift[0]?.length - 2)) + ":00" + " " + mshift[0]?.slice(-2);
      axios.post('http://anubhuthi.org/api/attandance/new',{
        username: String(res?.data?.getdoubleshiftatt[0]?.username),
        userid: String(res?.data?.getdoubleshiftatt[0]?.userid),
        clockintime: cltime,
        date: res?.data?.getdoubleshiftatt[0]?.date,
        clockinipaddress: res?.data?.getdoubleshiftatt[0]?.clockinipaddress,
        status: true,
        buttonstatus: "true",
        calculatedshiftend: calculatedshiftend,
        shiftname:String(mdata.shift),
        autoclockout:Boolean(false),
        shiftendtime:String(mshift[1]),
        shiftmode:String("Main Shift"),
        clockouttime: "",
        attendancemanual: Boolean(false)
      })
     }
      
}
		})
                
            }
        }
        })
      })
      let updatefordayshift = fressecondusers.forEach((sddata, si)=>{
        
        fresmainusers.forEach((mddata, mindex)=>{
         if (sddata.userid === mddata.userid) {
          let mdshift = mddata?.shift?.split("to");
            const currentTime = new Date();            // sshift[1] has format "07:00PM" or "10:00AM"
            const sshiftEndTime = mdshift[1].trim();            // Extract hours, minutes, and period (AM/PM)
            const hours = parseInt(sshiftEndTime.substr(0, 2), 10);
            const minutes = parseInt(sshiftEndTime.substr(3, 2), 10);
            const period = sshiftEndTime.substr(5, 2).toUpperCase();            // Convert shift end time to 24-hour format and create a Date object
            let endHours = hours;
            if (period === 'PM' && hours !== 12) {
                endHours += 12;
            } else if (period === 'AM' && hours === 12) {
                endHours = 0;
            }            const endTimeObj = new Date();
            endTimeObj.setHours(endHours, minutes, 0, 0);            // Subtract 4 hours from the shift end time
            endTimeObj.setHours(endTimeObj.getHours() - 4);           
             console.log(currentTime, 'currentTime');
            console.log(endTimeObj, 'endTimeMinus4Hours', mdshift[1]);            
            if (currentTime >= endTimeObj) {
            let sdshift = sddata?.shift?.split("to");
           
		        axios.post("http://anubhuthi.org/api/doubleattendanceforusers", {
                userid: sddata.userid,
                date: mtoday,
                shiftmode: "Main Shift"
            }).then(res => {
		
    if(res?.data?.getdoubleshiftatt?.length > 0){
      const [startTimes, endTimes] = sddata?.shift?.split("to");
      const convertedEndTime =  convertTo24HourFormat(endTimes);
      const end = convertedEndTime;
      let [endHour, endMinute] = end?.slice(0, -2)?.split(":");
      endHour = parseInt(endHour, 10);
      endHour += Number(resattcr);
      
      console.log(endHour,'endHour');
      const newEnd = `${String(endHour).padStart(2, "0")}:${endMinute}${end?.slice(-2)}`;                  
      const calculatedshiftend = addFutureTimeToCurrentTime(newEnd);
     if(calculatedshiftend){
      const couttime = mdshift[1]?.slice(0, (mdshift[1]?.length - 2)) + ":00" + " " + mdshift[1]?.slice(-2);
      axios.put(`http://anubhuthi.org/api/attandance/${res?.data?.getdoubleshiftatt[0]?._id}`,{
        clockouttime: couttime,
        clockoutipaddress:res?.data?.getdoubleshiftatt[0]?.clockinipaddress ,
        buttonstatus: "false",
        autoclockout:Boolean(false),
        attendancemanual: Boolean(false)
      })
      const cltime = sdshift[0]?.slice(0, (sdshift[0]?.length - 2)) + ":00" +   " " + sdshift[0]?.slice(-2);
      axios.post('http://anubhuthi.org/api/attandance/new',{
        username: String(res?.data?.getdoubleshiftatt[0]?.username),
        userid: String(res?.data?.getdoubleshiftatt[0]?.userid),
        clockintime: cltime,
        date: res?.data?.getdoubleshiftatt[0]?.date,
        clockinipaddress: res?.data?.getdoubleshiftatt[0]?.clockinipaddress,
        status: true,
        buttonstatus: "true",
        calculatedshiftend: calculatedshiftend,
        shiftname:String(sddata.shift),
        autoclockout:Boolean(false),
        shiftendtime:String(sddata.shift),
        shiftmode:String("Second Shift"),
        clockouttime: "",
        attendancemanual: Boolean(false)
      })
     }
      
}
		})
                
            }
        }
        })
      })
     console.log(result.length,'allusers');
     console.log(mainnightusers.length,'mainnightusers')
     console.log(maindayusers.length,'maindayusers')
      
    } catch (error) {
      console.error('Error in scheduled job:', error);
    }
  });


//scheduledpayment

//Define the cron job to run daily at 12:01 AM
cron.schedule("1 0 * * *", async () => {
  try {
    const currentDay = getDay(new Date());
    const currentDate = String(getDate(new Date())).padStart(2, "0");
    const currentMonth = String(getMonth(new Date()) + 1).padStart(2, "0"); // Adding 1 because getMonth returns 0-indexed months

    const dayOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = dayOfWeek[currentDay];

    const documents = await SchedulePaymentMaster.find({
      $and: [
        {
          $or: [
            { frequency: "Daily" },
            { frequency: "Weekly", daywiseandweeklydays: { $in: dayName } },
            { frequency: "Monthly", datewiseandmonthlydate: currentDate },
            {
              frequency: "Annually",
              annuallymonth: currentMonth,
              annuallyday: currentDate,
            },
          ],
        },
        { status: "Active" },
      ],
    });

    const documentsWithReminderDate = documents?.map((doc) => {
      const { _id, ...rest } = doc.toObject(); // Convert to plain JavaScript object
      return {
        ...rest,
        reminderdate: new Date(),
      };
    });

    await NotAddedBills.insertMany(documentsWithReminderDate);
  } catch (error) {
    console.error("Error:", error);
  }
});






// Handling middleware error
app.use(errorMiddleware);
const port = process.env.PORT || 7001;
const env = process.env.NODE_ENV;
const server = app.listen(port, () => console.log(`Server started at ${env} mode port ${port}`));
	
// Connect to PM2
// pm2.connect((err) => {
//   if (err) {
//     console.error(err);
//     process.exit(1);
//   }

//   // Start the application as a PM2 managed process
//   pm2.start({
//     name: 'YourAppName', // Replace 'YourAppName' with your actual application name
//     script: 'index.js',
//     max_memory_restart: '8G', // Restart the app if it exceeds 8GB of memory usage
//     env: {
//       NODE_ENV: env
//     }
//   }, (err) => {
//     if (err) {
//       console.error(err);
//       process.exit(1);
//     }
//     console.log('App started successfully with PM2');
//   });
// });


// "scripts": {
//     "start": "pm2 start index.js --env production",
//     "dev": "pm2 start index.js --only app-dev",
//     "prod": "pm2 start index.js --only app-prod",
//     "test": "echo \"Error: no test specified\" && exit 1",
//     "stop": "pm2 stop all",
//     "restart": "pm2 restart all",
//     "delete": "pm2 delete all"
//   },