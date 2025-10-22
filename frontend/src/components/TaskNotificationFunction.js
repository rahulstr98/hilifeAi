import axios from '../axiosInstance';
import { SERVICE } from '../services/Baseservice';

// This should be passed as a parameter, not accessed using useContext inside utility
const taskNotificationFunction = async ({ userObject,page ,  authToken }) => {
    console.log(userObject,page , "userObject,page")
    try {
        const response = await axios.post(
            SERVICE.TASK_FOR_USER_BASED_ON_PAGE_MODULE,
            {userobject: userObject , pagename: page},

            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );
        return response;
    } catch (error) {
        console.error("Error fetching EB Service Master:", error);
        throw error;
    }
};

export default taskNotificationFunction;
