import styles from "./bdcssmanualtemplate.module.css"
import axios from "axios";
import { SERVICE } from "../services/Baseservice";
import { useEffect, useState } from "react";
import html2canvas from 'html2canvas';
import DownloadIcon from '@mui/icons-material/Download';
import moment from "moment-timezone";

const BDayCardmanualtemplate = () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    // const name = "PRIYANKA.CHINNATHAMBIPRIYA"
    const status = urlParams.get('status')


    // Retrieve the 'wish', 'name', and 'id' parameters from the URL
    const name = urlParams.get('name');
    const date = urlParams.get('date');
    const wish = urlParams.get('wish');
    const footer = urlParams.get('footer');


    const [profileImage, setProfileImage] = useState(null);
    console.log(profileImage, "img")

    // Retrieve the image from localStorage when the component mounts
    useEffect(() => {
        const storedImage = localStorage.getItem('profileImage');
        if (storedImage) {
            setProfileImage(storedImage);
        }
    }, []);

    // Now you have the values from the URL
    const [bdayCompanyLogo, setBdayCompanyLogo] = useState("")
    const [bdayfootertext, setBdayfootertext] = useState("")
    const [bdaywishes, setBdaywishes] = useState("")
    const [profileSrc, setProfileSrc] = useState("")
    const [employeeDob, setEmployeeDob] = useState("")

    const fetchBdaySetting = async () => {
        try {
            let res = await axios.get(`${SERVICE.GET_OVERALL_SETTINGS}`);

            setBdayCompanyLogo(
                res?.data?.overallsettings[res?.data?.overallsettings.length - 1]
                    ?.companylogo
            );

        } catch (err) {
            console.log(err, '12')
        }
    };

    useEffect(() => {
        fetchBdaySetting();
    }, [wish])


    const downloadImage = () => {
        const element = document.getElementById('imagedownload');
        html2canvas(element).then((canvas) => {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `_birthdaycard.png`;
            link.click();
        });
    };


    return (
        <div>
            {status ? (
                <div className={styles.downloadbuttonwrapper}>
                    <button onClick={downloadImage}><DownloadIcon /></button>
                </div>
            ) :
                <></>
            }

            <div className={styles.birthdaydivtwo} id="imagedownload">
                <div id={styles.birthdaycardtwo}>
                    <div className={styles.companylogotwo}>
                        <img src={bdayCompanyLogo} alt="logo" height="150" width="165" /><br />
                    </div>
                    <div id={styles.profileImgtwo}>
                        <img src={profileImage || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='} alt="" width="190" height="150" />
                        <span className={styles.usernametwo}
                            style={{
                                fontSize: name?.length > 11 ? '14px' : 'initial',
                            }}
                        >{name}</span>
                    </div>
                    <div className={styles.bdaydobtwo}>
                        <span>{date === "" || date === undefined ? "" : moment(date)?.format("DD-MM-YYYY")}</span>
                    </div>
                    <div className={styles.bdaywishestwo}>
                        <span
                            style={{
                                fontSize: wish?.length > 50 ? '11px' : 'initial',
                            }}

                        >{wish}</span>
                    </div>
                    <div className={styles.bdayfootertexttwo}>
                        <span >{footer === "" || footer === undefined || footer === "undefined" ? "" : footer}</span>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default BDayCardmanualtemplate;