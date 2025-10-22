import "./weddingcard2nos.css"
import axios from "axios";
import { SERVICE } from "../services/Baseservice";
import { useEffect, useState } from "react";
import html2canvas from 'html2canvas';
import DownloadIcon from '@mui/icons-material/Download';
import moment from "moment-timezone";

const Weddingcard2nos = () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    // Retrieve the 'wish', 'name', and 'id' parameters from the URL
    const name = urlParams.get('name');
    const id = urlParams.get('id');
    const wish = urlParams.get('wish');
    const footer = urlParams.get('footer');

    const status = urlParams.get('status')
    const [bdayCompanyLogo, setBdayCompanyLogo] = useState("")
    const [bdayfootertext, setBdayfootertext] = useState("")
    const [bdaywishes, setBdaywishes] = useState("")
    const [profileSrc, setProfileSrc] = useState("")
    const [employeeDob, setEmployeeDob] = useState("")
    const [employeeOneName, setEmployeetwoName] = useState("")
    const [employeeOneID, setEmployeeTwoID] = useState("")
    const [employeeTwoName, setEmployeeOneName] = useState("")
    const [employeeTwoID, setEmployeeOneID] = useState("")
    const [EmpIds, setEmpIds] = useState([]);
    const [employeeOneDob, setEmployeeOneDob] = useState("");
    const [employeeTwoDob, setEmployeeTwoDob] = useState("");

    // Get the 'combinedData' parameter from the URL
    const combinedData = urlParams.get('combinedData');


    useEffect(() => {
        if (combinedData) {
            // Split by underscore to separate the two employees
            const employeesData = combinedData.split('_');

            // For each employee, split by hyphen to separate the name and ID
            const employee1 = employeesData[0].split('-');
            const employee2 = employeesData[1] ? employeesData[1].split('-') : null;

            // Access the values and IDs
            const employee1Name = employee1[0];
            const employee1Id = employee1[1];

            setEmployeeOneName(employee1Name);
            setEmployeeOneID(employee1Id);

            // Create a Set to avoid duplicates
            const newEmpIdsSet = new Set();
            newEmpIdsSet.add(employee1Id);

            if (employee2) {
                const employee2Name = employee2[0];
                const employee2Id = employee2[1];

                setEmployeetwoName(employee2Name);
                setEmployeeTwoID(employee2Id);

                newEmpIdsSet.add(employee2Id);
            }

            // Convert Set to Array and update EmpIds state
            setEmpIds(Array.from(newEmpIdsSet));
        }
    }, [combinedData]);




    const fetchBdaySetting = async () => {
        try {
            let res = await axios.get(`${SERVICE.GET_OVERALL_SETTINGS}`);

            setBdayCompanyLogo(
                res?.data?.overallsettings[res?.data?.overallsettings.length - 1]
                    ?.companylogo
            );
            setBdaywishes(
                res?.data?.overallsettings[res?.data?.overallsettings.length - 1]
                    ?.bdaywishes
            );
            setBdayfootertext(
                res?.data?.overallsettings[res?.data?.overallsettings.length - 1]
                    ?.bdayfootertext
            );
        } catch (err) {
            console.log(err, '12')
        }
    };
    const [profileSrcOne, setProfileSrcOne] = useState()
    const [profileSrcTwo, setProfileSrcTwo] = useState()

    const fetchProfileImage = async () => {
        try {
            // Array of IDs to fetch
            const ids = [employeeOneID, employeeTwoID];

            // Loop through each ID
            ids.forEach(async (id, index) => {
                if (id) {
                    try {
                        let resNew = await axios.post(`${SERVICE.GETDOCUMENTS}`, {
                            commonid: id
                        });
                        let availedData = Object.keys(resNew?.data)?.length;

                        if (availedData !== 0) {
                            let profile = resNew?.data?.semployeedocument?.profileimage;
                            if (index === 0) {
                                setProfileSrcOne(profile);
                            } else if (index === 1) {
                                setProfileSrcTwo(profile);
                            }
                        } else {
                            if (index === 0) {
                                setProfileSrcOne('');
                            } else if (index === 1) {
                                setProfileSrcTwo('');
                            }
                        }
                    } catch (err) {
                        console.log(err, 'Error fetching profile image');
                    }
                }
            });
        } catch (err) {
            console.log(err, 'Error in fetchProfileImage');
        }
    };

    let legalName = []
    let userName = []
    let companyName = []
    let team = []
    let unit = []
    let branch = []

    let dob = []
    let paddress = []
    let caddress = []
    let email = []
    let contactpersonal = []
    let doj = []
    let empcode = []
    let firstname = []
    let lastname = []
    let designation = []
    let process = []
    let department = []
    let reasondate = []
    let shifttiming = []
    let accname = []
    let accno = []
    let ifsc = []
    let workstation = []
    let workstationcount = []
    let employeecount = []
    let genderheshe = []
    let genderheshesmall = []
    let genderhimher = []
    let prefix = []


    const fetchEmployeeDob = async (id) => {
        try {
            let res = await axios.get(`${SERVICE.USER_SINGLE}/${id}`);
            const availedData = res?.data?.suser;

            if (availedData?.length !== 0) {

                let accountno = []
                let accountname = []
                let ifsccode = []

                availedData?.bankdetails?.forEach((item) => {
                    accountno.push(item.accountnumber || []);
                    accountname.push(item.accountholdername || []);
                    ifsccode.push(item.ifsccode || []);
                });

                let GenderHeShe = (availedData?.gender !== "" || availedData?.gender !== undefined)
                    ? availedData?.gender === "Male" ? "He" : availedData?.gender === "Female" ? "She" : "He/She" : "He/She";

                let GenderHeShesmall = (availedData?.gender !== "" || availedData?.gender !== undefined)
                    ? availedData?.gender === "Male" ? "he" : availedData?.gender === "Female" ? "she" : "he/she" : "he/she";

                let GenderHimHer = (availedData?.gender !== "" || availedData?.gender !== undefined)
                    ? availedData?.gender === "Male" ? "him" : availedData?.gender === "Female" ? "her" : "him/her" : "him/her";

                let Paddress = `${!availedData?.pdoorno ? "" : availedData?.pdoorno + ","}
                ${!availedData?.pstreet ? "" : availedData?.pstreet + ","}
                ${!availedData?.parea ? "" : availedData?.parea + ","}
                ${!availedData?.plandmark ? "" : availedData?.plandmark + ","}
                ${!availedData?.ptaluk ? "" : availedData?.ptaluk + ","}
                ${!availedData?.ppost ? "" : availedData?.ppost + ","}
                ${!availedData?.pcity ? "" : availedData?.pcity + ","}
                ${!availedData?.pstate ? "" : availedData?.pstate + ","}
                ${!availedData?.pcountry ? "" : availedData?.pcountry + ","}
                ${!availedData?.ppincode ? "" : "-" + availedData?.ppincode}`;

                let Caddress = `${!availedData?.cdoorno ? "" : availedData?.cdoorno + ","}
                ${!availedData?.cstreet ? "" : availedData?.cstreet + ","}
            ${!availedData?.carea ? "" : availedData?.carea + ","}
                ${!availedData?.clandmark ? "" : availedData?.clandmark + ","}
                ${!availedData?.ctaluk ? "" : availedData?.ctaluk + ","}
                ${!availedData?.cpost ? "" : availedData?.cpost + ","}
                ${!availedData?.ccity ? "" : availedData?.ccity + ","}
                ${!availedData?.cstate ? "" : availedData?.cstate + ","}
                ${!availedData?.ccountry ? "" : availedData?.ccountry + ","}
                ${!availedData?.cpincode ? "" : "-" + availedData?.cpincode}`;


                legalName?.push(availedData?.legalname ? availedData?.legalname : "")
                userName?.push(availedData?.username ? availedData?.username : "")
                companyName?.push(availedData?.companyname ? availedData?.companyname : "")
                team?.push(availedData?.team ? availedData?.team : "")
                unit?.push(availedData?.unit ? availedData?.unit : "")
                branch?.push(availedData?.branch ? availedData?.branch : "")

                dob?.push(availedData?.dob ? availedData?.dob : "")
                paddress?.push(Paddress)
                caddress?.push(Caddress)
                email?.push(availedData?.email ? availedData?.email : "")
                contactpersonal?.push(availedData?.contactpersonal ? availedData?.contactpersonal : "")
                doj?.push(availedData?.doj ? availedData?.doj : "")
                empcode?.push(availedData?.empcode ? availedData?.empcode : "")
                firstname?.push(availedData?.firstname ? availedData?.firstname : "")
                lastname?.push(availedData?.lastname ? availedData?.lastname : "")
                designation?.push(availedData?.designation ? availedData?.designation : "")
                process?.push(availedData?.process ? availedData?.process : "")
                department?.push(availedData?.department ? availedData?.department : "")
                reasondate?.push(availedData?.reasondate ? availedData?.reasondate : "")
                shifttiming?.push(availedData?.shifttiming ? availedData?.shifttiming : "")
                accname?.push(availedData?.bankdetails?.length > 0 ? accountname : [])
                accno?.push(availedData?.bankdetails?.length > 0 ? accountno : [])
                ifsc?.push(availedData?.bankdetails?.length > 0 ? ifsccode : [])
                accountno = [];
                accountname = [];
                ifsccode = [];
                workstation?.push(availedData?.workstation ? availedData?.workstation : "")
                workstationcount?.push(availedData?.workstation ? availedData?.workstation?.length : "")
                employeecount?.push(availedData?.employeecount ? availedData?.employeecount : "")
                genderheshe?.push(GenderHeShe)
                genderheshesmall?.push(GenderHeShesmall)
                genderhimher?.push(GenderHimHer)
                prefix?.push(availedData?.prefix ? availedData?.prefix : "Mr/Ms")

                return availedData?.dom === "" || availedData?.dom === undefined ? "" : availedData?.dom;
                // setEmployeeDob(availedData?.dom === "" || availedData?.dom === undefined ? "" : availedData?.dom  )

            } else {
                return '';
            }
        } catch (err) {
            console.log(err, 'Error fetching employee DOB');
            return '';
        }
    };

    const [keyWordWish, setKeyWordWish] = useState()

    const fetchDobs = async () => {
        try {
            const dobPromises = [];

            if (employeeOneID) {
                dobPromises.push(fetchEmployeeDob(employeeOneID));
            }

            if (employeeTwoID) {
                dobPromises.push(fetchEmployeeDob(employeeTwoID));
            }

            const [dobOne, dobTwo] = await Promise.all(dobPromises);

            if (employeeOneID) {
                setEmployeeOneDob(dobOne);
            }

            if (employeeTwoID) {
                setEmployeeTwoDob(dobTwo);
            }

            const Legalname = [...new Set(legalName)]?.toString()
            const Username = [...new Set(userName)]?.toString()
            const Companyname = [...new Set(companyName)]?.toString()
            const Team = [...new Set(team)]?.toString()
            const Unit = [...new Set(unit)]?.toString()
            const Branch = [...new Set(branch)]?.toString()

            const Dob = [...new Set(dob)]?.toString()
            const Paddress = [...new Set(paddress)]?.toString()
            const Caddress = [...new Set(caddress)]?.toString()
            const Email = [...new Set(email)]?.toString()
            const Contactpersonal = [...new Set(contactpersonal)]?.toString()
            const Doj = [...new Set(doj)]?.toString()
            const Empcode = [...new Set(empcode)]?.toString()
            const Firstname = [...new Set(firstname)]?.toString()
            const Lastname = [...new Set(lastname)]?.toString()
            const Designation = [...new Set(designation)]?.toString()
            const Process = [...new Set(process)]?.toString()
            const Department = [...new Set(department)]?.toString()
            const Reasondate = [...new Set(reasondate)]?.toString()
            const Shifttiming = [...new Set(shifttiming)]?.toString()
            const Accname = [...new Set(accname?.flat())]

            const Accno = [...new Set(accno?.flat())]
            const Ifsc = [...new Set(ifsc?.flat())]
            const Workstation = [...new Set(workstation)]?.toString()
            const Workstationcount = [...new Set(workstationcount)]?.toString()
            const Employeecount = [...new Set(employeecount)]?.toString()
            const Genderheshe = [...new Set(genderheshe)]?.toString()
            const Genderheshesmall = [...new Set(genderheshesmall)]?.toString()
            const Genderhimher = [...new Set(genderhimher)]?.toString()
            const Prefix = [...new Set(prefix)]?.toString()


            let replacedWish = wish
                .replaceAll("$LEGALNAME$", Legalname)
                .replaceAll("$LOGIN$", Username)
                .replaceAll("$C:NAME$", Companyname)
                .replaceAll("$TEAM$", Team)
                .replaceAll("$UNIT$", Unit)
                .replaceAll("$BRANCH$", Branch)

                .replaceAll("$DOB$", Dob)
                .replaceAll("$P:ADDRESS$", Paddress)
                .replaceAll("$C:ADDRESS$", Caddress)
                .replaceAll("$EMAIL$", Email)
                .replaceAll("$P:NUMBER$", Contactpersonal)
                .replaceAll("$DOJ$", Doj)
                .replaceAll("$EMPCODE$", Empcode)
                .replaceAll("$F:NAME$", Firstname)
                .replaceAll("$L:NAME$", Lastname)
                .replaceAll("$DESIGNATION$", Designation)
                .replaceAll("$PROCESS$", Process)
                .replaceAll("$DEPARTMENT$", Department)
                .replaceAll("$LWD$", Reasondate)
                .replaceAll("$SHIFT$", Shifttiming)
                .replaceAll("$AC:NAME$", Accname)
                .replaceAll("$AC:NUMBER$", Accno)
                .replaceAll("$IFSC$", Ifsc)
                .replaceAll("$WORKSTATION:NAME$", Workstation)
                .replaceAll("$WORKSTATION:COUNT$", Workstationcount)
                .replaceAll("$SYSTEM:COUNT$", Employeecount)
                .replaceAll("$GENDERHE/SHE$", Genderheshe)
                .replaceAll("$GENDERHE/SHE/SMALL$", Genderheshesmall)
                .replaceAll("$GENDERHIM/HER$", Genderhimher)
                .replaceAll("$SALUTATION$", Prefix)

            setKeyWordWish(replacedWish)

        } catch (err) {
            console.log(err, 'Error fetching DOBs');
        }
    };


    useEffect(() => {
        fetchProfileImage();
        fetchDobs();
    }, [employeeOneID, employeeTwoID]);


    useEffect(() => {
        fetchBdaySetting();

    }, [])



    const downloadImage = () => {
        const element = document.getElementById('weddingtempdivtwo2nos');
        html2canvas(element).then((canvas) => {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `_wedding2noscard.png`;
            link.click();
        });
    };

    return (
        <div>
            {status ? (
                <div className="download-button-wrapper">
                    <button onClick={downloadImage}><DownloadIcon /></button>
                </div>
            ) :
                <></>
            }

            <div id="weddingtempdivtwo2nos">
                <div id="wedding-cardtwo2nos">
                    <div className="weddinglogotwo2nos">
                        <img src={bdayCompanyLogo} alt="logo" height="150" width="165" /><br />
                    </div>
                    <div id="twoempprofile">
                        <div id="emponediv">
                            <div id="weddingImgtwo2nos" >
                                <img src={profileSrcOne || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='} alt="" width="190" height="150" />
                                <span className="usernametwowedding2nos"
                                    style={{
                                        fontSize: employeeOneName?.length > 11 ? '11px' : 'initial',
                                    }}
                                >{employeeOneName}</span>

                                <span className="weddingdobtwo2nos">{employeeOneDob === "" || employeeOneDob === undefined || employeeOneDob === "undefined" ? "" : moment(employeeOneDob)?.format("DD-MM-YYYY")}</span>
                            </div>

                        </div>
                        <div id="emptwodiv">
                            <div id="profileImgweddingtwo2nos" >
                                <img src={profileSrcTwo || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='} alt="" width="190" height="150" />
                                <span id="usernametwotwo2nos" className="usernametwowedding2nos"
                                    style={{
                                        fontSize: employeeOneName?.length > 11 ? '11px' : 'initial',
                                    }}
                                >{employeeTwoName}</span>
                                <span className="weddingdobtwotwo2nos">{employeeTwoDob === "" || employeeTwoDob === undefined || employeeTwoDob === "undefined" ? "" : moment(employeeTwoDob)?.format("DD-MM-YYYY")}</span>
                            </div>

                        </div>
                    </div>
                    <div className="weddingwishestwo2nos">
                        <span
                            style={{
                                fontSize: keyWordWish?.length > 50 ? '11px' : 'initial',
                            }}

                        >{keyWordWish}</span>
                    </div>
                    <div className="weddingfootertexttwo2nos">
                        <span >{footer === "" || footer === undefined || footer === "undefined" ? "" : footer}</span>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default Weddingcard2nos;