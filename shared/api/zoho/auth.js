import { clientID, clientSecret, redirectUri, accountID } from '../../consts/zoho.js';
import axios from 'axios';
import db from '../../db/db.js';

export async function refreshToken() {
  const account = await db.user.findUnique({
    where: {
      accountId: accountID,
    },
  });

  const axiosResponse = await axios.post(`https://accounts.zoho.com/oauth/v2/token?refresh_token=${account.refreshToken}&client_id=${clientID}&client_secret=${clientSecret}&redirect_uri=${redirectUri}&grant_type=refresh_token`)

  db.user.update({
    where: {
      accountId: accountID
    },
    data: {
      accessToken: axiosResponse.data.access_token,
    },
  });
  return axiosResponse.data.access_token
}

export async function checkUser(data) {
  const account = await db.user.findUnique({
    where: {
      accountId: accountID,
    },
  });
  if (!account) {
    await db.user.create({
      data: {
        accountId: accountID,
        refreshToken: data.refresh_token,
        accessToken: data.access_token,
      },
    });
  } else {
    await db.user.update({
      where: {
        accountId: accountID
      },
      data: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      },
    });
  }
}