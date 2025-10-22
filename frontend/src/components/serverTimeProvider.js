import axios from 'axios';
import moment from 'moment';
import { SERVICE } from '../services/Baseservice';

let serverStartTimestamp = Date.now();
let clientStartTimestamp = Date.now();
let initialized = false;

export const initServerTime = async () => {
    try {
        const response = await axios.get(SERVICE.GET_CURRENT_SERVER_TIME);
        serverStartTimestamp = new Date(response.data.currentNewDate).getTime();
        clientStartTimestamp = Date.now();
        initialized = true;
        console.log('✅ Server time initialized');
    } catch (err) {
        console.warn('⚠️ Failed to fetch server time. Falling back to system time.');
        serverStartTimestamp = Date.now();
        clientStartTimestamp = Date.now();
        initialized = true;
    }
};

export const getCurrentServerTimeFormatted = () => {
    if (!initialized) {
        console.warn('⚠️ Server time not initialized. Using system time.');
        return moment().format('DD-MM-YYYY HH:mm:ss');
    }

    const elapsed = Date.now() - clientStartTimestamp;
    const currentServerTime = new Date(serverStartTimestamp + elapsed);
    return currentServerTime;
    // return moment(currentServerTime).format('DD-MM-YYYY HH:mm:ss');
};
