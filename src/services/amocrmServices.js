// const axios = require('axios');
// const Token = require('../models/amocrmTokenModel');

// const saveTokensToDatabase = async (accessToken, refreshToken, expiresIn) => {
//   const expiresAt = new Date(Date.now() + expiresIn * 1000);
//   await Token.findOneAndUpdate(
//     {},
//     { access_token: accessToken, refresh_token: refreshToken, expires_at: expiresAt },
//     { upsert: true, new: true }
//   );
// };

// // Retrieve tokens from database
// const getTokensFromDatabase = async () => {
//   return await Token.findOne();
// };

// const getAccessToken = async () => {
//   const code = "def50200aa6642d16d87f7899b65bfb3f56556f917269da03c3e6f176b3cefcb4823adf5b65c47353e9c5035743e04cd92adb6c86f563bd38b7de6d6ca4888dd16183396a93952e35d079fb6193f7c6575f68b247428980aa55f6c996f3c6d26d17fe59c4350bd730ac2c3d4dbeba313e606f0cee7cc04bb0894639cdfeaa776b00c82b174d5803089a228645accdbb26606a146f0fdf97016b20c7f2dc16e877c1ddb30e8394dc7c25e25bd9f05fc75349ddf48ad683ce0b7fd8646a42b0956e910ef5027a3f9e7411b3d1abcdae372f4f2ed33654efa172b37e55387d8a39713b1b4bf7672ba6f39b4248bc39e91f1ec75050f8c9f879485ba31c0f2df404c87c057cbaa4367ce14b386c102e8af5096418691490492c758cbbc3573b4614c7175d5f9a77556868b79806b7f61f329095ccee6c04507e16f27a2c2c15431cf5ff822d0baead45730e78c4f75ba8df51b3ee30fe258519b6c3c5968240abafc88f149024055ce31f0a8e89f83dc17f8263d41f8534ae464d61d22d7ea13abf3e969993ffb1db15083e8ccbb906b8e73dd522328eac88e6165f91b152b56222a9caeab7e8f7fad5f10d5666fa88a82730d43ab577bdf830bd8eee318dc64ef1ee88304f0c034fe78b75638d490a9c1afa0ba4f419a2d7258fd0cc36f370b79ef755d1717479cc49024a45a3431804ef947eb990614eb81d3e35d99"; // Replace with your authorization code
//   try {
//     const response = await axios.post(`https://${process.env.AMOCRM_SUBDOMAIN}.amocrm.ru/oauth2/access_token`, {
//       "client_id": process.env.AMOCRM_CLIENT_ID,
//       "client_secret": process.env.AMOCRM_CLIENT_SECRET,
//       "grant_type": 'authorization_code',
//       "code": code,
//       "redirect_uri": process.env.AMOCRM_REDIRECT_URI
//     });

//     const { access_token, refresh_token, expires_in } = response.data;
//     await saveTokensToDatabase(access_token, refresh_token, expires_in);
//     console.log('Token data saved:', access_token);
//     return access_token;
//   } catch (error) {
//     console.error('Error getting access token:', error.response?.data || error.message);
//     throw new Error('Authorization required. Please provide a valid authorization code.');
//   }
// };


// // Функция для обновления access token с помощью refresh token
// const refreshAccessToken = async () => {
//   const tokens = await getTokensFromDatabase();
//   if (!tokens || !tokens.refresh_token) {
//     throw new Error('Refresh token missing. Please reauthorize to get new tokens.');
//   }

//   try {
//     const response = await axios.post(`https://${process.env.AMOCRM_SUBDOMAIN}.amocrm.ru/oauth2/access_token`, {
//       "client_id": process.env.AMOCRM_CLIENT_ID,
//       "client_secret": process.env.AMOCRM_CLIENT_SECRET,
//       "grant_type": 'refresh_token',
//       "refresh_token": tokens.refresh_token,
//       "redirect_uri": process.env.AMOCRM_REDIRECT_URI
//     });

//     const { access_token, refresh_token, expires_in } = response.data;
//     await saveTokensToDatabase(access_token, refresh_token, expires_in);
//     console.log('Token refreshed:', access_token);
//     return access_token;
//   } catch (error) {
//     console.error('Error refreshing access token:', error.response?.data || error.message);
//     throw new Error('Failed to refresh token. Reauthorization required.');
//   }
// };


// const ensureValidAccessToken = async () => {
//   const tokens = await getTokensFromDatabase();

//   if (!tokens) {
//     console.log('No tokens found. Initiating new authorization.');
//     return await getAccessToken();
//   }

//   if (new Date() >= tokens.expires_at) {
//     console.log('Access token expired, attempting to refresh.');
//     return await refreshAccessToken();
//   }

//   return tokens.access_token;
// };

// // Функции для работы с AmoCRM API
// const findDealByPhone = async (phone) => {
//   const accessToken = await ensureValidAccessToken();
//   try {
//     const response = await axios.get(`https://${process.env.AMOCRM_SUBDOMAIN}.amocrm.ru/api/v4/leads`, {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         'Content-Type': 'application/json'
//       },
//       params: {
//         query: phone
//       }
//     });

//     // console.log('Результат поиска сделок:', JSON.stringify(response.data, null, 2));
//     return response.data._embedded ? response.data._embedded.leads : [];
//   } catch (error) {
//     console.error('Error searching for deal:', error.response ? error.response.data : error.message);
//     throw new Error('Failed to search for deal by phone');
//   }
// };

// const updateDeal = async (dealId, dealData, accessToken) => {
//     try {
//       const response = await axios.patch(
//         `https://${process.env.AMOCRM_SUBDOMAIN}.amocrm.ru/api/v4/leads/${dealId}`, 
//         dealData, 
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );
  
//       return response.data;
//     } catch (error) {
//       console.error('Error updating deal:', error.response ? error.response.data : error.message);
//       throw new Error('Failed to update deal');
//     }
//   };  

// const createDeal = async (newDealData) => {
//   const accessToken = await ensureValidAccessToken();
//   try {
//     console.log('Создание сделки с данными:', newDealData);

//     const response = await axios.post(`https://${process.env.AMOCRM_SUBDOMAIN}.amocrm.ru/api/v4/leads`, newDealData, {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         'Content-Type': 'application/json'
//       }
//     });
//     console.log(response.data)

//     return response.data;
//   } catch (error) {
//     console.error('Error creating deal:', error.response ? error.response.data : error.message);
//     throw new Error('Failed to create deal');
//   }
// };

// const findContactByPhone = async (phone) => {
//   const accessToken = await ensureValidAccessToken();
//   try {
//     const response = await axios.get(`https://${process.env.AMOCRM_SUBDOMAIN}.amocrm.ru/api/v4/contacts`, {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         'Content-Type': 'application/json'
//       },
//       params: {
//         query: phone
//       }
//     });

//     return response.data._embedded ? response.data._embedded.contacts : [];
//   } catch (error) {
//     console.error('Error searching for contact:', error.response ? error.response.data : error.message);
//     throw new Error('Failed to search for contact by phone');
//   }
// };

// const updateContact = async (contactId, contactData) => {
//   const accessToken = await ensureValidAccessToken();
//   try {
//     const response = await axios.patch(`https://${process.env.AMOCRM_SUBDOMAIN}.amocrm.ru/api/v4/contacts/${contactId}`, contactData, {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         'Content-Type': 'application/json'
//       }
//     });

//     return response.data;
//   } catch (error) {
//     console.error('Error updating contact:', error.response ? error.response.data : error.message);
//     throw new Error('Failed to update contact');
//   }
// };

// const createContact = async (contactData) => {
//   const accessToken = await ensureValidAccessToken();
//   try {
//     const response = await axios.post(`https://${process.env.AMOCRM_SUBDOMAIN}.amocrm.ru/api/v4/contacts`, contactData, {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         'Content-Type': 'application/json'
//       }
//     });

//     return response.data;
//   } catch (error) {
//     console.error('Error creating contact:', error.response ? error.response.data : error.message);
//     throw new Error('Failed to create contact');
//   }
// };


// module.exports = {
//   getAccessToken,
//   refreshAccessToken,
//   ensureValidAccessToken,
//   findDealByPhone,
//   findContactByPhone,
//   updateContact,
//   createContact,
//   updateDeal,
//   createDeal
// };