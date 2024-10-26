const axios = require('axios');
const Token = require('../models/amocrmTokenModel');

const saveTokensToDatabase = async (accessToken, refreshToken, expiresIn) => {
  const expiresAt = new Date(Date.now() + expiresIn * 1000); 

  await Token.findOneAndUpdate(
    {},
    { access_token: accessToken, refresh_token: refreshToken, expires_at: expiresAt },
    { upsert: true, new: true } // Создать новый документ, если его нет
  );
};

// Функция для получения токенов из базы данных
const getTokensFromDatabase = async () => {
  return await Token.findOne();
};

const getAccessToken = async () => {
  const code = "def50200ad6b0bef090a814a2cbf14208de9557bdbd482c6b8f133d6aafcfd6dbd0db64e08e4cd9018f6be5e6b126f47c0a0860bdc2c122c540778e10aad2fe91b6c140d445f776047515bb6ae3eab6cd3d25476cd661f87b7fb16a2fa9d30566a7704203817b0fc3563b30d6c7626b939dd4db5be36d2b271feac4574ca4f0fa7821e4e17daef5ab095314ced14686f2e60e9a498d4942b59ba03b3cf6fad8790cfa67dea96ed60bca6d04ea12f25b801bc734bbe83125b459a4afd3381b902cc497e8a352d823ecaa9f8563341fc0b5593e4b0acd0655f5792d2d5d7716074107e22949c26006aec2a5b0b12b0bf8c80e995726f654ece3705bafad1ae3198202364dc586e5ff5bc7825ab9206ea36da4821536dbeed177822c0d044cebcd56faf57b76781412242f3d01cb68d05510129467d8515f30553e7c9a9220f4232ee6ac2aaf30cd2fae991c1a62f4d62592918524e4c1a90ff7541d0c463bf0f3e79720031bbdbec8105189a6f020005cd1dcc23a4cffe9b2b9afae508b2803ec3cbc2e46b9869392c2d6a0621638831f7e93beb94dcc73012f7f5a8d6152ec76da4f7b1b3315fb07fb50187487d9a7afcc514faa37d525535768d6765268d163ef5de709cb029e25612f49fb213dc9c7f3345cb112b0e713100f261e5ea438dd8160035969f0807489ceaffa09d714e501de213f6f4f026d9583522227d2f92f0c2fde38c2fd44c80cf";
  try {
    const response = await axios.post(`https://${process.env.AMOCRM_SUBDOMAIN}.amocrm.ru/oauth2/access_token`, {
      client_id: process.env.AMOCRM_CLIENT_ID,
      client_secret: process.env.AMOCRM_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.AMOCRM_REDIRECT_URI
    });

    const { access_token, refresh_token, expires_in } = response.data;
    await saveTokensToDatabase(access_token, refresh_token, expires_in);
    console.log('Token data saved:', access_token);
    return access_token;
  } catch (error) {
    console.error('Error getting access token:', error.response ? error.response.data : error.message);
    throw new Error('Failed to get access token');
  }
};

// Функция для обновления access token с помощью refresh token
const refreshAccessToken = async () => {
  const tokens = await getTokensFromDatabase();

  try {
    const response = await axios.post(`https://${process.env.AMOCRM_SUBDOMAIN}.amocrm.ru/oauth2/access_token`, {
      client_id: process.env.AMOCRM_CLIENT_ID,
      client_secret: process.env.AMOCRM_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: tokens.refresh_token,
      redirect_uri: process.env.AMOCRM_REDIRECT_URI
    });

    const { access_token, refresh_token, expires_in } = response.data;
    await saveTokensToDatabase(access_token, refresh_token, expires_in);
    console.log('Token updated:', access_token);
    return access_token;
  } catch (error) {
    console.error('Error refreshing access token:', error.response ? error.response.data : error.message);
    throw new Error('Failed to refresh access token');
  }
};

// Функция для проверки и обеспечения валидности access token
const ensureValidAccessToken = async () => {
  const tokens = await getTokensFromDatabase();
  if (!tokens || tokens.expires_at < new Date()) {
    return await refreshAccessToken();
  }
  return tokens.access_token;
};

// Функции для работы с AmoCRM API
const findDealByPhone = async (phone) => {
  const accessToken = await ensureValidAccessToken();
  try {
    const response = await axios.get(`https://${process.env.AMOCRM_SUBDOMAIN}.amocrm.ru/api/v4/leads`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      params: {
        query: phone
      }
    });

    console.log('Результат поиска сделок:', JSON.stringify(response.data, null, 2));
    return response.data._embedded ? response.data._embedded.leads : [];
  } catch (error) {
    console.error('Error searching for deal:', error.response ? error.response.data : error.message);
    throw new Error('Failed to search for deal by phone');
  }
};

const updateDeal = async (dealId, dealData, accessToken) => {
    try {
      const response = await axios.patch(
        `https://${process.env.AMOCRM_SUBDOMAIN}.amocrm.ru/api/v4/leads/${dealId}`, 
        dealData, 
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      return response.data;
    } catch (error) {
      console.error('Error updating deal:', error.response ? error.response.data : error.message);
      throw new Error('Failed to update deal');
    }
  };  

const createDeal = async (newDealData) => {
  const accessToken = await ensureValidAccessToken();
  try {
    console.log('Создание сделки с данными:', newDealData);

    const response = await axios.post(`https://${process.env.AMOCRM_SUBDOMAIN}.amocrm.ru/api/v4/leads`, newDealData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error creating deal:', error.response ? error.response.data : error.message);
    throw new Error('Failed to create deal');
  }
};

const findContactByPhone = async (phone) => {
  const accessToken = await ensureValidAccessToken();
  try {
    const response = await axios.get(`https://${process.env.AMOCRM_SUBDOMAIN}.amocrm.ru/api/v4/contacts`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      params: {
        query: phone
      }
    });

    return response.data._embedded ? response.data._embedded.contacts : [];
  } catch (error) {
    console.error('Error searching for contact:', error.response ? error.response.data : error.message);
    throw new Error('Failed to search for contact by phone');
  }
};

const updateContact = async (contactId, contactData) => {
  const accessToken = await ensureValidAccessToken();
  try {
    const response = await axios.patch(`https://${process.env.AMOCRM_SUBDOMAIN}.amocrm.ru/api/v4/contacts/${contactId}`, contactData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error updating contact:', error.response ? error.response.data : error.message);
    throw new Error('Failed to update contact');
  }
};

const createContact = async (contactData) => {
  const accessToken = await ensureValidAccessToken();
  try {
    const response = await axios.post(`https://${process.env.AMOCRM_SUBDOMAIN}.amocrm.ru/api/v4/contacts`, contactData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error creating contact:', error.response ? error.response.data : error.message);
    throw new Error('Failed to create contact');
  }
};


module.exports = {
  getAccessToken,
  refreshAccessToken,
  ensureValidAccessToken,
  findDealByPhone,
  findContactByPhone,
  updateContact,
  createContact,
  updateDeal,
  createDeal
};