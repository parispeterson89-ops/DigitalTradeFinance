const CONSTANTS = require('../../constants');

const getPremiumFrequencyId = (facility) => {
  const frequency = facility.facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND
    ? facility.feeFrequency
    : facility.premiumFrequency;

  switch (frequency) {
    case CONSTANTS.FACILITIES.FACILITY_FEE_FREQUENCY_PORTAL.MONTHLY:
      return CONSTANTS.FACILITIES.FACILITY_PREMIUM_FREQUENCY_ID.MONTHLY;

    case CONSTANTS.FACILITIES.FACILITY_FEE_FREQUENCY_PORTAL.QUARTERLY:
      return CONSTANTS.FACILITIES.FACILITY_PREMIUM_FREQUENCY_ID.QUARTERLY;

    case CONSTANTS.FACILITIES.FACILITY_FEE_FREQUENCY_PORTAL.SEMI_ANNUALLY:
      return CONSTANTS.FACILITIES.FACILITY_PREMIUM_FREQUENCY_ID.SEMI_ANNUALLY;

    case CONSTANTS.FACILITIES.FACILITY_FEE_FREQUENCY_PORTAL.ANNUALLY:
      return CONSTANTS.FACILITIES.FACILITY_PREMIUM_FREQUENCY_ID.ANNUALLY;

    default:
      return CONSTANTS.FACILITIES.FACILITY_PREMIUM_FREQUENCY_ID.UNDEFINED;
  }
};


const getPremiumTypeId = (facility) => {
  const frequencyType = facility.facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND
    ? facility.feeType
    : facility.premiumType;

  switch (frequencyType) {
    case CONSTANTS.FACILITIES.FACILITY_FEE_TYPE_PORTAL.IN_ADVANCE:
      return CONSTANTS.FACILITIES.FACILITY_PREMIUM_TYPE_ID.IN_ADVANCE;

    case CONSTANTS.FACILITIES.FACILITY_FEE_TYPE_PORTAL.IN_ARREARS:
      return CONSTANTS.FACILITIES.FACILITY_PREMIUM_TYPE_ID.IN_ARREARS;

    case CONSTANTS.FACILITIES.FACILITY_FEE_TYPE_PORTAL.AT_MATURITY:
      return CONSTANTS.FACILITIES.FACILITY_PREMIUM_TYPE_ID.AT_MATURITY;

    default:
      return 0;
  }
};

module.exports = {
  getPremiumFrequencyId,
  getPremiumTypeId,
};