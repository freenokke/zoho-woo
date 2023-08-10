import {url, applicationPassword, applicationUsername} from '../../consts/woocomerce.js';
import axios from 'axios';

export async function sendIMGtoWPMedia(fd) {
  const response = await axios.post(`${url}wp-json/wp/v2/media`, fd, {
    auth: {
      username: applicationUsername,
      password: applicationPassword
    }
  })
  return response;
}