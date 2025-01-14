import axios from 'axios';
import dotenv from 'dotenv';
import { HEADERS, AnyObject } from '@ukef/dtfs2-common';

dotenv.config();

const { EXTERNAL_API_URL, EXTERNAL_API_KEY } = process.env;

/**
 * calls the external API to send an email
 * @param templateId - email template ID
 * @param sendToEmailAddress - email address to send the email to
 * @param emailVariables - variables to be used in the email template
 * @returns response from external API
 */
export const sendEmail = async (templateId: string, sendToEmailAddress: string, emailVariables: AnyObject) => {
  try {
    await axios({
      method: 'post',
      url: `${EXTERNAL_API_URL}/email`,
      headers: {
        [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
        'x-api-key': String(EXTERNAL_API_KEY),
      },
      data: {
        templateId,
        sendToEmailAddress,
        emailVariables,
      },
    });
  } catch (error) {
    console.error('Error sending email to %s %o', sendToEmailAddress, error);

    throw error;
  }
};
