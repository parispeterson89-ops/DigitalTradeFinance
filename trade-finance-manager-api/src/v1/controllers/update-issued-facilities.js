const api = require('../api');
const CONSTANTS = require('../../constants');

const updatedIssuedFacilities = async (deal) => {
  // Create deep clone
  const modifiedDeal = JSON.parse(JSON.stringify(deal));

  const facilities = [
    ...modifiedDeal.dealSnapshot.bondTransactions.items,
    ...modifiedDeal.dealSnapshot.loanTransactions.items,
  ];

  const bonds = [];
  const loans = [];

  let updatedCount = 0;
  let shouldUpdateCount = 0;

  return new Promise((resolve) => {
    facilities.forEach(async (facility) => {
      const {
        _id: facilityId,
        facilityType,
        facilityStage,
        previousFacilityStage,
      } = facility;

      // bond facility is either Unissued or Issued.
      const bondIsNowIssued = ((previousFacilityStage === CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.UNISSUED)
        && (facilityStage === CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.ISSUED));

      // loan facility is either Conditional or Unconditional
      const loanIsNowIssued = ((previousFacilityStage === CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.CONDITIONAL)
        && (facilityStage === CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.UNCONDITIONAL));

      const shouldChangeStatus = (bondIsNowIssued || loanIsNowIssued);

      if (shouldChangeStatus) {
        shouldUpdateCount += 1;

        const facilityStatusUpdate = CONSTANTS.FACILITIES.FACILITY_STATUS_PORTAL.ACKNOWLEDGED;

        const updatedFacility = await api.updatePortalFacilityStatus(facilityId, facilityStatusUpdate);

        // update deal object to return in response
        if (facilityType === 'bond') {
          bonds.push(updatedFacility);
        } else if (facilityType === 'loan') {
          loans.push(updatedFacility);
        }

        updatedCount += 1;
      } else if (facilityType === 'bond') {
        // update deal object to return in response
        bonds.push(facility);
      } else if (facilityType === 'loan') {
        loans.push(facility);
      }

      if (shouldUpdateCount === updatedCount) {
        modifiedDeal.dealSnapshot.bondTransactions.items = bonds;
        modifiedDeal.dealSnapshot.loanTransactions.items = loans;

        return resolve(modifiedDeal);
      }
      return modifiedDeal;
    });
  });
};


exports.updatedIssuedFacilities = updatedIssuedFacilities;