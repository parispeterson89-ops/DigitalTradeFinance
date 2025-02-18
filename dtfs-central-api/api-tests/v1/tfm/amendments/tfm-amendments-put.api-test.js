const { MONGO_DB_COLLECTIONS, AUDIT_USER_TYPES } = require('@ukef/dtfs2-common');
const { aTfmUser } = require('@ukef/dtfs2-common/mock-data-backend');
const { generateTfmAuditDetails, generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { generateParsedMockTfmUserAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const { withMongoIdPathParameterValidationTests } = require('@ukef/dtfs2-common/test-cases-backend');
const { withValidateAuditDetailsTests } = require('../../../helpers/with-validate-audit-details.api-tests');
const wipeDB = require('../../../wipeDB');
const { testApi } = require('../../../test-api');
const { DEALS } = require('../../../../src/constants');
const { MOCK_DEAL } = require('../../mocks/mock-data');
const aDeal = require('../../deal-builder');
const { createDeal } = require('../../../helpers/create-deal');
const { createFacility } = require('../../../helpers/create-facility');
const { aPortalUser } = require('../../../../test-helpers');

console.error = jest.fn();

describe('PUT TFM amendments', () => {
  let dealId;

  const newFacility = {
    type: 'Bond',
    dealId: MOCK_DEAL.DEAL_ID,
  };

  const aCreatedByUser = () => ({
    username: 'username',
    name: 'name',
    email: 'username@test.com',
  });

  const newDeal = aDeal({
    dealType: DEALS.DEAL_TYPE.BSS_EWCS,
    additionalRefName: 'mock name',
    bankInternalRefName: 'mock id',
    editedBy: [],
    eligibility: {
      status: 'Not started',
      criteria: [{}],
    },
  });

  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.TFM_FACILITIES, MONGO_DB_COLLECTIONS.TFM_DEALS, MONGO_DB_COLLECTIONS.USERS]);
  });

  beforeEach(async () => {
    const { body: deal } = await createDeal({ deal: newDeal, user: aPortalUser() });
    dealId = deal._id;

    newFacility.dealId = dealId;
  });

  afterEach(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.TFM_FACILITIES, MONGO_DB_COLLECTIONS.TFM_DEALS]);
  });

  describe('PUT /v1/tfm/facilities/:facilityId/amendments/:amendmentId', () => {
    withMongoIdPathParameterValidationTests({
      baseUrl: '/v1/tfm/facilities/:facilityId/amendments/:amendmentId',
      makeRequest: (url) => testApi.put({}).to(url),
    });

    describe('with a valid facility and amendment', () => {
      let facilityId;
      let amendmentId;

      beforeEach(async () => {
        const postResult = await createFacility({ facility: newFacility, user: aPortalUser() });
        facilityId = postResult.body._id;

        await testApi
          .put({
            dealType: DEALS.DEAL_TYPE.BSS_EWCS,
            dealId,
            auditDetails: generatePortalAuditDetails(aPortalUser()._id),
          })
          .to('/v1/tfm/deals/submit');

        const { body } = await testApi.post({ auditDetails: generateTfmAuditDetails(aTfmUser()._id) }).to(`/v1/tfm/facilities/${facilityId}/amendments/`);
        amendmentId = body.amendmentId;
      });

      withValidateAuditDetailsTests({
        makeRequest: (auditDetails) =>
          testApi
            .put({ payload: { updatePayload: { createdBy: aCreatedByUser() } }, auditDetails })
            .to(`/v1/tfm/facilities/${facilityId}/amendments/${amendmentId}`),
        validUserTypes: [AUDIT_USER_TYPES.TFM],
      });

      it('should update an amendment based on facilityId and amendmentId', async () => {
        const updatePayload = { createdBy: aCreatedByUser() };
        const { body: bodyPutResponse } = await testApi
          .put({ payload: { updatePayload }, auditDetails: generateTfmAuditDetails(aTfmUser()._id) })
          .to(`/v1/tfm/facilities/${facilityId}/amendments/${amendmentId}`);

        const expected = {
          dealId: expect.any(String),
          facilityId: expect.any(String),
          status: expect.any(String),
          amendmentId: expect.any(String),
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
          version: 1,
        };
        expect(bodyPutResponse).toEqual(expected);
      });

      it('should update the auditRecord on the facility document', async () => {
        const updatePayload = { createdBy: aCreatedByUser() };
        const tfmUserId = aTfmUser()._id;
        await testApi
          .put({ payload: { updatePayload }, auditDetails: generateTfmAuditDetails(tfmUserId) })
          .to(`/v1/tfm/facilities/${facilityId}/amendments/${amendmentId}`);

        const { body: updatedFacility } = await testApi.get(`/v1/tfm/facilities/${facilityId}`);

        expect(updatedFacility.auditRecord).toEqual(generateParsedMockTfmUserAuditDatabaseRecord(tfmUserId));
      });
    });

    it('should return 404 if facilityId and amendmentId are valid but are NOT associated to a record', async () => {
      const postResult = await createFacility({ facility: newFacility, user: aPortalUser() });
      const newId = postResult.body._id;

      await testApi
        .put({
          dealType: DEALS.DEAL_TYPE.BSS_EWCS,
          dealId,
          auditDetails: generatePortalAuditDetails(aPortalUser()._id),
        })
        .to('/v1/tfm/deals/submit');

      const updatePayload = { createdBy: aCreatedByUser() };
      const { status } = await testApi.post({ auditDetails: generateTfmAuditDetails(aTfmUser()._id) }).to(`/v1/tfm/facilities/${newId}/amendments/`);
      const { status: putStatus } = await testApi
        .put({ payload: updatePayload, auditDetails: generateTfmAuditDetails(aTfmUser()._id) })
        .to(`/v1/tfm/facilities/${newId}/amendments/626aa00e2446022434c52148`);

      expect(status).toEqual(200);
      expect(putStatus).toEqual(404);
    });

    it('should return 400 if invalid dealId', async () => {
      await createFacility({ facility: newFacility, user: aPortalUser() });
      await testApi
        .put({
          dealType: DEALS.DEAL_TYPE.BSS_EWCS,
          dealId,
          auditDetails: generatePortalAuditDetails(aCreatedByUser()._id),
        })
        .to('/v1/tfm/deals/submit');

      const { status } = await testApi
        .put({ payload: { amendmentsUpdate: {} }, auditDetails: generateTfmAuditDetails(aTfmUser()._id) })
        .to('/v1/tfm/facilities/123/amendments/1234');
      expect(status).toEqual(400);
    });
  });
});
