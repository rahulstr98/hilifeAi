import axios from '../axiosInstance';
import { SERVICE } from '../services/Baseservice';

const salaryTableFunction = async ({
  empcode,
  commonid,
  companyname,
  type,
  addedby,
  updatedby,
  isEdit = false,
  updateId = null,
  salarytable,
  salaryoption,
}) => {

  try {
    const formData = new FormData();
    formData.append('empcode', empcode);
    formData.append('commonid', commonid);
    formData.append('companyname', companyname);
    formData.append('salaryoption', salaryoption);
    formData.append('type', type);
    formData.append('addedby', JSON.stringify(addedby));
    formData.append('updatedby', JSON.stringify(updatedby));

   
 
    // Loop over files
    // files.forEach((fileObj, index) => {
    //   formData.append('files', fileObj.file);
    //   formData.append('name', fileObj.name);
    //   formData.append('remark', fileObj.remark);
    // });
 
      if (salarytable.length > 0) {
        const filesArray = salarytable.filter((item) => item.file);
        const nonFilesArray = salarytable.filter((item) => !item.file);

        if (filesArray.length > 0) {
          filesArray.forEach((item, index) => {

            formData.append(`salarytable`, item.file); // Append the file
            formData.append(`salarystatus[${index}]`, item?.salarystatus || 0);
            formData.append(`movetolive[${index}]`, item?.movetolive || false);
            formData.append(`basic[${index}]`, item?.basic || 0);
            formData.append(`hra[${index}]`, item?.hra || 0);
            formData.append(`conveyance[${index}]`, item?.conveyance || 0);
            formData.append(`medicalallowance[${index}]`, item?.medicalallowance || 0);
            formData.append(`productionallowance[${index}]`, item?.productionallowance || 0);
            formData.append(`shiftallowance[${index}]`, item?.shiftallowance || 0);
            formData.append(`grossmonthsalary[${index}]`, item?.grossmonthsalary || 0);
            formData.append(`annualgrossctc[${index}]`, item?.annualgrossctc || 0);
            formData.append(`otherallowance[${index}]`, item?.annualgrossctc || 0);
          
            
          });
        }
        if (nonFilesArray.length > 0) {
          formData.append('educationaldocumentnonfilesarray', JSON.stringify(nonFilesArray));
        }
      }
    
    const url = isEdit
      ? `${SERVICE.SINGLE_SALARY_DATA}/${updateId}` // e.g., /employee-documents/:id
      : SERVICE.ADD_SALARY_DATA;

    const method = isEdit ? 'put' : 'post';

    const response = await axios({
      method,
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.log("Error uploading employee documents:", error);
    throw error;
  }
};


export default salaryTableFunction;

