import axios from 'axios';
import { refreshToken } from "./auth.js";
import { accountID, clientID, clientSecret, redirectUri } from '../../consts/zoho.js';

export async function getZohoItemIMG(itemId) {
  try {
    const access_token = await refreshToken()
    const response = await fetch(
      `https://inventory.zoho.com/api/v1/items/${itemId}/image?organization_id=${accountID}`,
      {
      headers: {
        'Authorization': `Zoho-oauthtoken ${access_token}` 
      }
    });
    return response.blob();
  } catch (error) {
    console.log(error)
  }
}

export async function getZohoItemsList() {
  try {
    const access_token = await refreshToken()
    const axiosResponse = await axios.get(`https://www.zohoapis.com/inventory/v1/items?organization_id=${accountID}`, {
    headers: {
      'Authorization': `Zoho-oauthtoken ${access_token}` 
    }
  })
    return axiosResponse.data.items;
  } catch (error) {
    console.log(error)
  }
}

export async function getZohoItemById(id) {
  try {
    const access_token = await refreshToken()
    const axiosResponse = await axios.get(`https://www.zohoapis.com/inventory/v1/items/${id}?organization_id=${accountID}`, {
    headers: {
      'Authorization': `Zoho-oauthtoken ${access_token}` 
    }
  })
    return axiosResponse.data.item;
  } catch (error) {
    console.log(error)
  }
}

export async function updateZohoItemById(id, data) {
  try {
    const access_token = await refreshToken()
    const axiosResponse = await axios.put(`https://www.zohoapis.com/inventory/v1/items/${id}?organization_id=${accountID}`, data, {
    headers: {
      'Authorization': `Zoho-oauthtoken ${access_token}` 
    }
  })
    console.log(axiosResponse.data)
    return axiosResponse.data.item;
  } catch (error) {
    console.log(error)
  }
}