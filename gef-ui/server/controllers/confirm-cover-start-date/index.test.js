import { processCoverStartDate } from './index';
import api from '../../services/api';
import CONSTANTS from '../../constants';

const Chance = require('chance');

const chance = new Chance();

jest.mock('../../services/api');

const MockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

const MockRequest = () => {
  const req = {};
  req.params = {};
  req.body = {
    ukefCoverStartDate: true,
    day: 1,
    month: 12,
    year: 2021,
  };
  req.query = {};
  req.params.dealId = '1234';
  req.params.facilityId = '4321';
  req.success = {
    message: 'Cover start date for 4321 confirmed',
  };
  req.url = '/gef/application-details/1234/cover-start-date';
  req.session = {
    user: {
      bank: { id: 'BANKID' },
      roles: ['MAKER'],
    },
    userToken: 'TEST',
  };
  return req;
};

const MockApplicationResponse = () => {
  const res = {};
  res._id = '1234';
  res.exporter = {};
  res.bankId = 'BANKID';
  res.bankInternalRefName = 'Internal refernce';
  res.additionalRefName = 'Additional reference';
  res.status = CONSTANTS.DEAL_STATUS.DRAFT;
  res.userId = 'mock-user';
  res.supportingInformation = {
    status: CONSTANTS.DEAL_STATUS.NOT_STARTED,
  };
  res.eligibility = {
    criteria: [
      { id: 12, answer: null, text: 'Test' },
    ],
    status: CONSTANTS.DEAL_STATUS.IN_PROGRESS,
  };
  res.editedBy = ['MAKER_CHECKER'];
  res.submissionType = 'Automatic Inclusion Application';
  res.submissionCount = 0;
  res.comments = [];
  res.ukefDealId = null;
  res.createdAt = chance.timestamp();
  res.submissionDate = chance.timestamp();
  return res;
};

const MockUserResponse = () => ({
  username: 'maker',
  bank: { id: 'BANKID' },
  firstname: 'Joe',
  surname: 'Bloggs',
  timezone: 'Europe/London',
});

const MockEligibilityCriteriaResponse = () => ({
  terms: [
    {
      id: 12,
      text: 'Some eligibility criteria',
      errMsg: '12. Select some eligibility',
    },
  ],
});

const MockFacilityResponse = () => {
  const res = {};
  res.status = CONSTANTS.DEAL_STATUS.IN_PROGRESS;
  res.data = [];
  res.items = [{
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
      currency: 'GBP',
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
    createdAt: 20,
  }];
  return res;
};

describe('controller/ukef-cover-start-date', () => {
  let mockResponse;
  let mockRequest;
  let mockApplicationResponse;
  let mockFacilityResponse;
  let mockUserResponse;
  let mockEligibilityCriteriaResponse;

  beforeEach(() => {
    mockResponse = MockResponse();
    mockRequest = MockRequest();
    mockApplicationResponse = MockApplicationResponse();
    mockFacilityResponse = MockFacilityResponse();
    mockUserResponse = MockUserResponse();
    mockEligibilityCriteriaResponse = MockEligibilityCriteriaResponse();

    api.getApplication.mockResolvedValue(mockApplicationResponse);
    api.getFacilities.mockResolvedValue(mockFacilityResponse);
    api.getEligibilityCriteria.mockResolvedValue(mockEligibilityCriteriaResponse);
    api.getUserDetails.mockResolvedValue(mockUserResponse);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Process cover start date for the facility', () => {
    it('Render the expected behaviour', async () => {
      expect(await processCoverStartDate(mockRequest, mockResponse));

      expect(mockResponse.render)
        .toHaveBeenCalledWith('partials/cover-start-date.njk', expect.objectContaining({
          applicationStatus: mockApplicationResponse.status,
        }));
    });
  });
});