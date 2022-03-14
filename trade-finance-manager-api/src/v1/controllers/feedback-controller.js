const { format, getUnixTime, fromUnixTime } = require('date-fns');

const db = require('../../drivers/db-client');
const validateFeedback = require('../validation/feedback');
const sendTfmEmail = require('./send-tfm-email');

const CONSTANTS = require('../../constants');

require('dotenv').config();

exports.create = async (req, res) => {
  const validationErrors = validateFeedback(req.body);

  if (validationErrors.count !== 0) {
    return res.status(400).send({
      feedback: req.body,
      validationErrors,
    });
  }

  const modifiedFeedback = {
    ...req.body.formData,
    created: getUnixTime(new Date()),
  };

  const collection = await db.getCollection('tfm-feedback');
  const createdFeedback = await collection.insertOne(modifiedFeedback);

  // get formatted date from created timestamp, to display in email
  const formattedCreated = format(fromUnixTime(modifiedFeedback.created), 'dd/MM/yyyy HH:mm');

  const {
    role,
    team,
    whyUsingService,
    easyToUse,
    satisfied,
    howCanWeImprove,
    emailAddress,
    submittedBy,
  } = modifiedFeedback;

  const emailVariables = {
    role,
    team,
    whyUsingService,
    easyToUse,
    satisfied,
    howCanWeImprove,
    emailAddress,
    created: formattedCreated,
    submittedBy,
  };

  const EMAIL_TEMPLATE_ID = CONSTANTS.EMAIL_TEMPLATE_IDS.TFM_FEEDBACK_RECEIVED;
  const EMAIL_RECIPIENT = process.env.GOV_NOTIFY_EMAIL_RECIPIENT;

  await sendTfmEmail(
    EMAIL_TEMPLATE_ID,
    EMAIL_RECIPIENT,
    emailVariables,
  );

  return res.status(200).send({ _id: createdFeedback.insertedId });
};