/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable import/no-extraneous-dependencies */

import { cloneDeep } from 'lodash';
import { ObjectId } from 'mongodb';
import { getCollection } from '../database';
import { Estore, EstoreErrorResponse, SiteExistsResponse } from '../interfaces';
import { ESTORE_SITE_STATUS, ESTORE_CRON_STATUS } from '../constants';
import { eStoreTermStoreAndBuyerFolder } from './eStoreTermStoreAndBuyerFolder.cron';
import { siteExists } from '../v1/controllers/estore/eStoreApi';
import { getNowAsEpoch } from '../helpers/date';

/**
 * Creates a new eStore site based on the provided eStoreData.
 * @param {Estore} eStoreData - An object containing the necessary data for creating the eStore site.
 * @returns {Promise<void>} - None
 */
export const eStoreSiteCreationCron = async (eStoreData: Estore): Promise<void> => {
  const cronJobLogs = await getCollection('cron-job-logs');
  const tfmDeals = await getCollection('tfm-deals');
  const data = cloneDeep(eStoreData);
  const now = new Date().toISOString();

  // Step 1: Site exists check
  const siteExistsResponse: SiteExistsResponse | EstoreErrorResponse = await siteExists(eStoreData.exporterName);

  // Step 2: Site already exists in eStore
  if (siteExistsResponse?.data?.status === ESTORE_SITE_STATUS.CREATED) {
    console.info('⚡ CRON: eStore site %s has been created successfully for deal %s %s', siteExistsResponse.data.siteId, eStoreData.dealIdentifier, now);

    data.siteId = String(siteExistsResponse.data.siteId);

    // Update `cron-job-logs`
    await cronJobLogs.updateOne(
      { 'payload.dealId': { $eq: new ObjectId(eStoreData.dealId) } },
      {
        $set: {
          'cron.site': {
            status: ESTORE_CRON_STATUS.COMPLETED,
            timestamp: getNowAsEpoch(),
            id: siteExistsResponse.data.siteId,
          },
        },
      },
    );

    // Update `tfm-deals`
    await tfmDeals.updateOne(
      { 'payload.dealId': { $eq: new ObjectId(eStoreData.dealId) } },
      { $set: { 'tfm.estore.siteName': siteExistsResponse.data.siteId } },
    );

    // Add facility IDs to term store and create the buyer folder
    eStoreTermStoreAndBuyerFolder(data);
  } else if (siteExistsResponse?.data?.status === ESTORE_SITE_STATUS.PROVISIONING) {
    console.info('⚡ CRON: eStore site creation %s is still in progress for deal %s %s', siteExistsResponse.data.siteId, eStoreData.dealIdentifier, now);

    // Update status
    await cronJobLogs.updateOne(
      { 'payload.dealId': { $eq: new ObjectId(eStoreData.dealId) } },
      {
        $set: {
          'cron.site.create': {
            response: siteExistsResponse.data,
            status: ESTORE_CRON_STATUS.RUNNING,
            timestamp: getNowAsEpoch(),
          },
          'cron.site.status': ESTORE_CRON_STATUS.RUNNING,
          'cron.site.id': siteExistsResponse?.data?.siteId,
        },
      },
    );
  } else {
    console.error(
      '❌ CRON: eStore site existence %s check has failed for deal %s %o %s',
      siteExistsResponse.data.siteId,
      eStoreData.dealIdentifier,
      siteExistsResponse,
      now,
    );

    // CRON job log update
    await cronJobLogs.updateOne(
      { 'payload.dealId': { $eq: new ObjectId(eStoreData.dealId) } },
      {
        $set: {
          'cron.site.create': {
            response: siteExistsResponse.data,
            status: ESTORE_CRON_STATUS.FAILED,
            timestamp: getNowAsEpoch(),
          },
        },
      },
    );
  }
};