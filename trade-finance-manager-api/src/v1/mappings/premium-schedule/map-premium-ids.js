const CONSTANTS = require('../../../constants');

const mapPremiumFrequencyId = (facility) => {
  switch (facility.feeFrequency) {
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

const mapPremiumTypeId = (facility) => {
  switch (facility.feeType) {
    case CONSTANTS.FACILITIES.FACILITY_FEE_TYPE_PORTAL.IN_ADVANCE:
      return CONSTANTS.FACILITIES.FACILITY_PREMIUM_TYPE_ID.IN_ADVANCE;

    case CONSTANTS.FACILITIES.FACILITY_FEE_TYPE_PORTAL.IN_ARREARS:
      return CONSTANTS.FACILITIES.FACILITY_PREMIUM_TYPE_ID.IN_ARREARS;

    case CONSTANTS.FACILITIES.FACILITY_FEE_TYPE_PORTAL.AT_MATURITY:
      return CONSTANTS.FACILITIES.FACILITY_PREMIUM_TYPE_ID.AT_MATURITY;

    default:
      return CONSTANTS.FACILITIES.FACILITY_PREMIUM_TYPE_ID.UNDEFINED;
  }
};

module.exports = {
  mapPremiumFrequencyId,
  mapPremiumTypeId,
};