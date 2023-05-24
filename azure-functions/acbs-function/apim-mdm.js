require('dotenv').config();
const axios = require('axios');

const headers = {
  [String(process.env.APIM_MDM_KEY)]: process.env.APIM_MDM_VALUE,
};

/**
 * APIM MDM `GET` generic endpoint invocation call
 * @param {String} endpoint Endpoint with provided query parameters
 * @returns Response object
 */
const getAPI = async (endpoint) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${process.env.APIM_MDM_URL}${endpoint}`,
      headers,
    }).catch((err) => ({
      status: err.response
        ? err.response.status
        : err,
      data: {
        error: err.response
          ? err.response.data
          : err,
      },
    }));

    return response;
  } catch (error) {
    console.error('Error calling GET MDM endpoints: ', { error });
    return null;
  }
};

const getCurrency = (currencyCode) => getAPI(`currencies/${currencyCode}`);
const getACBSIndustrySector = async (industryId) => getAPI(`sector-industries?ukefIndustryId=${industryId}`);
const getACBSCountryCode = async (country) => getAPI(`markets?search=${country}`);

module.exports = {
  getCurrency,
  getACBSIndustrySector,
  getACBSCountryCode,
};