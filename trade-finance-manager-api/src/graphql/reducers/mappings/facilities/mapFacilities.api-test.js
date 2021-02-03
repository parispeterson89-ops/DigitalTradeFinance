const mapFacilities = require('./mapFacilities');
const mapFacility = require('./mapFacility');

describe('mapFacilities', () => {
  const mockCoverEndDate = {
    'coverEndDate-day': '01',
    'coverEndDate-month': '02',
    'coverEndDate-year': '2021',
  };

  const mockUkefExposure = '1,234.00';
  const mockCoveredPercentage = '10';

  const mockCurrency = {
    text: 'GBP - UK Sterling',
    id: 'GBP',
  };

  const mockFacilityValue = '12345.00';

  const MOCK_FACILITIES = [
    {
      _id: '12345678',
      ukefFacilityID: '0040004833',
      facilityType: 'bond',
      ...mockCoverEndDate,
      ukefExposure: mockUkefExposure,
      coveredPercentage: mockCoveredPercentage,
      bondType: 'Performance Bond',
      currency: mockCurrency,
      facilityValue: mockFacilityValue,
      facilityStage: 'Unissued',

      // fields we do not consume
      bondIssuer: 'Issuer',
      ukefGuaranteeInMonths: '10',
      bondBeneficiary: 'test',
      guaranteeFeePayableByBank: '9.0000',
      currencySameAsSupplyContractCurrency: 'true',
      riskMarginFee: '10',
      minimumRiskMarginFee: '30',
      feeType: 'At maturity',
      dayCountBasis: '365',
    },
    {
      _id: '23456789',
      ukefFacilityID: '0040004833',
      facilityType: 'loan',
      ...mockCoverEndDate,
      ukefExposure: mockUkefExposure,
      coveredPercentage: mockCoveredPercentage,
      currency: mockCurrency,
      facilityValue: mockFacilityValue,
      facilityStage: 'Conditional',

      // fields we do not consume
      createdDate: 1610369832226.0,
      ukefGuaranteeInMonths: '12',
      bankReferenceNumber: '5678',
      guaranteeFeePayableByBank: '27.0000',
      lastEdited: 1610369832226.0,
      currencySameAsSupplyContractCurrency: 'true',
      interestMarginFee: '30',
      minimumQuarterlyFee: '10',
      premiumType: 'At maturity',
      dayCountBasis: '365',
      'issuedDate-day': '25',
      'issuedDate-month': '08',
      'issuedDate-year': '2020',
      disbursementAmount: '1,234.00',
      issueFacilityDetailsStarted: true,
      bankReferenceNumberRequiredForIssuance: true,
      requestedCoverStartDate: 1610369832226.0,
      issuedDate: 1610369832226.0,
      issueFacilityDetailsProvided: true,
      status: 'Acknowledged',
    },
  ];

  const mockFacilities = [
    { ...MOCK_FACILITIES[0] },
    { ...MOCK_FACILITIES[1] },
  ];

  it('should map and format correct fields/values', async () => {
    const result = mapFacilities(mockFacilities);

    const expected = [
      { ...mapFacility(MOCK_FACILITIES[0]) },
      { ...mapFacility(MOCK_FACILITIES[1]) },
    ];

    expect(result).toEqual(expected);
  });

  describe('when facility.currency is NOT GBP', () => {
    it('should return facilityValue as empty string', () => {
      const result = mapFacilities([
        {
          ...mockFacilities[0],
          currency: {
            text: 'USD - US Dollars',
            id: 'USD',
          },
        },
      ]);

      expect(result[0].facilityValue).toEqual('');
    });
  });
});