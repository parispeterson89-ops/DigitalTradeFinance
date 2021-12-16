const { ObjectID } = require('mongodb');
const db = require('../../../drivers/db-client');

const { cloneAzureFiles } = require('../utils/clone-azure-files.utils');
const { validateApplicationReferences } = require('./validation/application');
const { exporterStatus } = require('./validation/exporter');
const CONSTANTS = require('../../../constants');

const cloneExporter = (currentExporter) => {
  const clonedExporter = currentExporter;

  // update the `updatedAt` property and set it to null - default value
  clonedExporter.updatedAt = Date.now();
  clonedExporter.status = exporterStatus(clonedExporter);

  return clonedExporter;
};

const cloneSupportingInformation = async (existingDealId, newDealId) => {
  const applicationCollectionName = 'deals';
  const applicationCollection = await db.getCollection(applicationCollectionName);
  const filesCollectionName = 'files';
  const filesCollection = await db.getCollection(filesCollectionName);

  // get all existing files
  const allFiles = await filesCollection.aggregate([{ $match: { parentId: ObjectID(String(existingDealId)) } }]).toArray();

  // check if there are any files in the db
  if (allFiles.length) {
    Object.entries(allFiles).forEach((key, val) => {
      // delete the existing `_id` property - this will be re-created when a new deal is inserted
      delete allFiles[val]._id;
      // updated the `dealId` property to match the new application ID
      allFiles[val].parentId = new ObjectID(newDealId);
    });

    await filesCollection.insertMany(allFiles);

    // get all existing files
    const existingFiles = await filesCollection.aggregate([{ $match: { parentId: ObjectID(String(newDealId)) } }]).toArray();

    if (existingFiles.length) {
      existingFiles.forEach(async (val) => {
        // convert the ids to string format
        val._id = (new ObjectID(val._id)).toHexString();
        val.parentId = (new ObjectID(val.parentId)).toHexString();
        await applicationCollection.findOneAndUpdate(
          { _id: { $eq: ObjectID(newDealId) } },
          {
            // set the updatedAt property to the current time in EPOCH format
            $set: { updatedAt: Date.now() },
            // insert new documents into the supportingInformation object -> array. i.e. supportingInformation.manualInclusion
            $push: { [`supportingInformation.${val.documentPath}`]: val }
          }
        );
      });
    }
  }
};

const cloneFacilities = async (currentDealId, newDealId) => {
  const facilitiesCollection = 'gef-facilities';
  const collection = await db.getCollection(facilitiesCollection);

  // get all existing facilities
  const allFacilities = await collection.aggregate([{ $match: { dealId: ObjectID(String(currentDealId)) } }]).toArray();

  // check if there are any facilities in the db
  if (allFacilities.length) {
    Object.entries(allFacilities).forEach((key, val) => {
      // delete the existing `_id` property - this will be re-created when a new deal is inserted
      delete allFacilities[val]._id;

      // updated the `dealId` property to match the new application ID
      allFacilities[val].dealId = new ObjectID(newDealId);
      // update the `createdAt` property to match the current time in EPOCH format
      allFacilities[val].createdAt = Date.now();
      // update the `updatedAt` property to match the current time in EPOCH format
      allFacilities[val].updatedAt = Date.now();
      // reset the ukefFacilityId
      allFacilities[val].ukefFacilityId = null;

      const currentTime = new Date();
      currentTime.setHours(0, 0, 0, 0);
      const difference = currentTime - (new Date(allFacilities[val].coverStartDate)).getTime();
      // check if the coverStartDate is in the past
      if (difference > 0) {
        // if it is, then ask the user to update it
        allFacilities[val].coverStartDate = null;
      }
    });
    await collection.insertMany(allFacilities);
  }
};

const cloneDeal = async (dealId, bankInternalRefName, additionalRefName, userId, bankId) => {
  const applicationCollection = 'deals';
  const collection = await db.getCollection(applicationCollection);
  // remove unused properties at the top of the Object (i.e. _id, ukefDecision, etc).
  // any additional fields that are located at the root of the object and that need removing can be added here
  const unusedProperties = ['_id', 'ukefDecision', 'comments', 'previousStatus'];
  // removed unused properties inside the `supportingInformation` property
  const unusedSupportingInfo = ['manualInclusion', 'managementAccounts', 'financialStatements', 'financialForecasts', 'financialCommentary', 'corporateStructure', 'debtorAndCreditorReports', 'exportLicence'];

  // get the current GEF deal
  const existingDeal = await collection.findOne({
    _id: ObjectID(String(dealId)),
  });

  const clonedDeal = existingDeal;

  // delete unused properties
  unusedProperties.forEach((property) => {
    if (clonedDeal[property]) {
      delete clonedDeal[property];
    }
  });
  // unusedSupportingInfo unused properties
  unusedSupportingInfo.forEach((property) => {
    delete clonedDeal.supportingInformation[property];
  });

  clonedDeal.createdAt = Date.now();
  clonedDeal.updatedAt = Date.now();
  clonedDeal.facilitiesUpdated = Date.now();
  clonedDeal.eligibility.updatedAt = Date.now();
  clonedDeal.status = CONSTANTS.DEAL.STATUS.DRAFT;
  clonedDeal.submissionCount = 0;
  clonedDeal.submissionDate = null;
  clonedDeal.bankInternalRefName = bankInternalRefName;
  clonedDeal.additionalRefName = additionalRefName;
  clonedDeal.userId = userId;
  clonedDeal.bankId = bankId;
  clonedDeal.ukefDealId = null;
  clonedDeal.checkerId = null;
  clonedDeal.editedBy = [userId];
  clonedDeal.exporter = cloneExporter(clonedDeal.exporter);
  clonedDeal.portalActivities = [];

  // insert the cloned deal in the database
  const createdApplication = await collection.insertOne(clonedDeal);
  const newDealId = createdApplication.insertedId;

  // return the ID for the newly inserted deal
  return { newDealId: newDealId.toHexString() };
};

exports.clone = async (req, res) => {
  const {
    body: {
      dealId: existingDealId, bankInternalRefName, additionalRefName, userId, bankId,
    },
  } = req;

  const validateErrs = validateApplicationReferences(req.body);

  if (validateErrs) {
    res.status(422).send(validateErrs);
  } else {
    // clone GEF deal
    const { newDealId } = await cloneDeal(existingDealId, bankInternalRefName, additionalRefName, userId, bankId);

    // clone the corresponding facilities
    await cloneFacilities(existingDealId, newDealId);

    // clone the supporting information
    await cloneSupportingInformation(existingDealId, newDealId);

    // clone the azure files from one folder to another
    await cloneAzureFiles(existingDealId, newDealId);

    res.send({ dealId: newDealId });
  }
};