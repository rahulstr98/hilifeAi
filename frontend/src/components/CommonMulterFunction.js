import axios from '../axiosInstance';
import { SERVICE } from '../services/Baseservice';

const uploadEmployeeDocuments = async ({
  empcode,
  commonid,
  companyname,
  type,
  files,
  profileimage,
  addedby,
  updatedby,
  oldFiles,
  isEdit = false,
  updateId = null,
  deletedFileNames=[]
}) => {
      console.log(oldFiles , "oldFiles")

  try {
    const formData = new FormData();
    formData.append('empcode', empcode);
    formData.append('commonid', commonid);
    formData.append('companyname', companyname);
    formData.append('type', type);
    formData.append('addedby', JSON.stringify(addedby));
    formData.append('updatedby', JSON.stringify(updatedby));
    formData.append('oldFiles', JSON.stringify(oldFiles));
    formData.append('deleteFileNames', JSON.stringify(deletedFileNames));

    // Append profile image if exists
    if (profileimage) {
      formData.append('profileimage', profileimage); // Should be a File object
    }
    console.log(files, "files")
    // Loop over files
    files.forEach((fileObj, index) => {
      formData.append('files', fileObj.file);
      formData.append('name', fileObj.name);
      formData.append('remark', fileObj.remark);
    });

    const url = isEdit
      ? `${SERVICE.EMPLOYEEDOCUMENT_SINGLE}/${updateId}` // e.g., /employee-documents/:id
      : SERVICE.EMPLOYEEDOCUMENT_CREATE;

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
    console.error("Error uploading employee documents:", error);
    throw error;
  }
};


export default uploadEmployeeDocuments;

