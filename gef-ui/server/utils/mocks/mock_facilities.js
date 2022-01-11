const CONSTANTS = require('../../constants');

const MOCK_UNISSUED_FACILITY = {
  status: CONSTANTS.DEAL_STATUS.COMPLETED,
  details: {
    _id: '61a771cc2ae62b0013dae68a',
    dealId: '61a7710b2ae62b0013dae687',
    type: 'CASH',
    hasBeenIssued: false,
    name: 'Facility two',
    shouldCoverStartOnSubmission: true,
    coverStartDate: 1638403200000,
    coverEndDate: '2030-01-01T00:00:00.000Z',
    monthsOfCover: null,
    details: [],
    detailsOther: '',
    currency: 'GBP',
    value: 2000,
    coverPercentage: 80,
    interestPercentage: 1,
    paymentType: 'IN_ADVANCE_MONTHLY',
    createdAt: 1638363596947,
    updatedAt: 1638442632540,
    ukefExposure: 1600,
    guaranteeFee: 0.9,
    submittedAsIssuedDate: '1638363717231',
    ukefFacilityId: '0030113305',
    feeType: 'in advance',
    feeFrequency: 'Monthly',
    dayCountBasis: 365,
    coverDateConfirmed: false,
  },
  validation: { required: [] },
};

const MOCK_ISSUED_FACILITY = {
  status: CONSTANTS.DEAL_STATUS.COMPLETED,
  details: {
    _id: '61a771cc2ae62b0013dae68a',
    dealId: '61a7710b2ae62b0013dae687',
    type: 'CASH',
    hasBeenIssued: true,
    name: 'Facility one',
    shouldCoverStartOnSubmission: true,
    coverStartDate: 1638403200000,
    coverEndDate: '2030-01-01T00:00:00.000Z',
    monthsOfCover: null,
    details: [],
    detailsOther: '',
    currency: 'GBP',
    value: 2000,
    coverPercentage: 80,
    interestPercentage: 1,
    paymentType: 'IN_ADVANCE_MONTHLY',
    createdAt: 1638363596947,
    updatedAt: 1638442632540,
    ukefExposure: 1600,
    guaranteeFee: 0.9,
    submittedAsIssuedDate: '1638363717231',
    ukefFacilityId: '0030113305',
    feeType: 'in advance',
    feeFrequency: 'Monthly',
    dayCountBasis: 365,
    coverDateConfirmed: true,
    canResubmitIssuedFacilities: true,
  },
  validation: { required: [] },
};

const MOCK_ISSUED_FACILITY_UNCHANGED = {
  status: CONSTANTS.DEAL_STATUS.COMPLETED,
  details: {
    _id: '61a771cc2ae62b0013dae68a',
    dealId: '61a7710b2ae62b0013dae687',
    type: 'CASH',
    hasBeenIssued: true,
    name: 'Facility one',
    shouldCoverStartOnSubmission: true,
    coverStartDate: 1638403200000,
    coverEndDate: '2030-01-01T00:00:00.000Z',
    monthsOfCover: null,
    details: [],
    detailsOther: '',
    currency: 'GBP',
    value: 2000,
    coverPercentage: 80,
    interestPercentage: 1,
    paymentType: 'IN_ADVANCE_MONTHLY',
    createdAt: 1638363596947,
    updatedAt: 1638442632540,
    ukefExposure: 1600,
    guaranteeFee: 0.9,
    submittedAsIssuedDate: '1638363717231',
    ukefFacilityId: '0030113305',
    feeType: 'in advance',
    feeFrequency: 'Monthly',
    dayCountBasis: 365,
    coverDateConfirmed: true,
    canResubmitIssuedFacilities: false,
  },
  validation: { required: [] },
};

const MOCK_FACILITY = {
  items: [
    {
      status: CONSTANTS.DEAL_STATUS.COMPLETED,
      details: {
        _id: '61a7714f2ae62b0013dae689',
        dealId: '61a7710b2ae62b0013dae687',
        type: 'CASH',
        hasBeenIssued: true,
        name: 'Facility one',
        shouldCoverStartOnSubmission: false,
        coverStartDate: '2021-12-03T00:00:00.000Z',
        coverEndDate: '2040-01-01T00:00:00.000Z',
        monthsOfCover: null,
        details: [],
        detailsOther: '',
        currency: { id: 'GBP' },
        value: 1000,
        coverPercentage: 80,
        interestPercentage: 1,
        paymentType: 'IN_ADVANCE_MONTHLY',
        createdAt: 1638363471661,
        updatedAt: 1638446928711,
        ukefExposure: 800,
        guaranteeFee: 0.9,
        submittedAsIssuedDate: '1638363717231',
        ukefFacilityId: '0030113306',
        feeType: 'in advance',
        feeFrequency: 'Monthly',
        dayCountBasis: 360,
        coverDateConfirmed: null,
      },
      validation: { required: [] },
    },
    {
      status: CONSTANTS.DEAL_STATUS.COMPLETED,
      details: {
        _id: '61a771cc2ae62b0013dae68a',
        dealId: '61a7710b2ae62b0013dae687',
        type: 'CASH',
        hasBeenIssued: true,
        name: 'Facility two',
        shouldCoverStartOnSubmission: true,
        coverStartDate: 1638403200000,
        coverEndDate: '2030-01-01T00:00:00.000Z',
        monthsOfCover: null,
        details: [],
        detailsOther: '',
        currency: 'GBP',
        value: 2000,
        coverPercentage: 80,
        interestPercentage: 1,
        paymentType: 'IN_ADVANCE_MONTHLY',
        createdAt: 1638363596947,
        updatedAt: 1638442632540,
        ukefExposure: 1600,
        guaranteeFee: 0.9,
        submittedAsIssuedDate: '1638363717231',
        ukefFacilityId: '0030113305',
        feeType: 'in advance',
        feeFrequency: 'Monthly',
        dayCountBasis: 365,
        coverDateConfirmed: true,
      },
      validation: { required: [] },
    },
    {
      status: CONSTANTS.DEAL_STATUS.COMPLETED,
      details: {
        _id: '61a7714f2ae62b0013dae699',
        dealId: '61a7710b2ae62b0013dae687',
        type: 'CASH',
        hasBeenIssued: true,
        name: 'Facility one',
        shouldCoverStartOnSubmission: false,
        coverStartDate: '2021-12-03T00:00:00.000Z',
        coverEndDate: '2040-01-01T00:00:00.000Z',
        monthsOfCover: null,
        details: [],
        detailsOther: '',
        currency: { id: 'GBP' },
        value: 1000,
        coverPercentage: 80,
        interestPercentage: 1,
        paymentType: 'IN_ADVANCE_MONTHLY',
        createdAt: 1638363471661,
        updatedAt: 1638446928711,
        ukefExposure: 800,
        guaranteeFee: 0.9,
        submittedAsIssuedDate: '1638363717231',
        ukefFacilityId: '0030113306',
        feeType: 'in advance',
        feeFrequency: 'Monthly',
        dayCountBasis: 360,
        coverDateConfirmed: true,
        canResubmitIssuedFacilities: true,
      },
      validation: { required: [] },
    },
  ],
};

module.exports = {
  MOCK_UNISSUED_FACILITY,
  MOCK_FACILITY,
  MOCK_ISSUED_FACILITY,
  MOCK_ISSUED_FACILITY_UNCHANGED,
};