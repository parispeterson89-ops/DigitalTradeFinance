import httpMocks from 'node-mocks-http';
import { Currency, CURRENCY, FEE_RECORD_STATUS, FeeRecordStatus } from '@ukef/dtfs2-common';
import { validatePostAddPaymentRequestBody } from '.';
import { MOCK_TFM_SESSION_USER } from '../../test-mocks/mock-tfm-session-user';
import { PremiumPaymentsTableCheckboxId } from '../../types/premium-payments-table-checkbox-id';
import { ADD_PAYMENT_ERROR_KEY } from '../../constants/premium-payment-tab-error-keys';
import { AddPaymentErrorKey } from '../../types/premium-payments-tab-error-keys';

console.error = jest.fn();

describe('validatePostAddPaymentRequestBody', () => {
  const REPORT_ID = 1;

  const REDIRECT_URL = `/utilisation-reports/${REPORT_ID}`;

  const getHttpMocks = () =>
    httpMocks.createMocks({
      session: {
        user: MOCK_TFM_SESSION_USER,
        userToken: 'user-token',
      },
      params: {
        reportId: REPORT_ID,
      },
    });

  const getCheckboxId = (feeRecordId: number, reportedPaymentsCurrency: Currency, status: FeeRecordStatus): PremiumPaymentsTableCheckboxId =>
    `feeRecordIds-${feeRecordId}-reportedPaymentsCurrency-${reportedPaymentsCurrency}-status-${status}`;

  const getRequestBodyFromCheckboxIds = (checkboxIds: PremiumPaymentsTableCheckboxId[]) =>
    checkboxIds.reduce((obj, checkboxId) => ({ ...obj, [checkboxId]: 'on' }), {});

  const assertRequestSessionHasBeenPopulated = (
    req: ReturnType<typeof getHttpMocks>['req'],
    addPaymentErrorKey: AddPaymentErrorKey,
    checkedCheckboxIdList: PremiumPaymentsTableCheckboxId[],
  ) => {
    expect(req.session.addPaymentErrorKey).toEqual(addPaymentErrorKey);

    const expectedCheckedCheckboxIds = checkedCheckboxIdList.reduce((obj, checkboxId) => ({ ...obj, [checkboxId]: true }), {});
    expect(req.session.checkedCheckboxIds).toEqual(expectedCheckedCheckboxIds);
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("renders the 'problem-with-service.njk' page when the request body is not an object", () => {
    // Arrange
    const { req, res } = getHttpMocks();
    req.body = 'not-an-object';

    const next = jest.fn();

    // Act
    validatePostAddPaymentRequestBody(req, res, next);

    // Assert
    expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
    expect(res._getRenderData()).toEqual({
      user: MOCK_TFM_SESSION_USER,
    });
    expect(next).not.toHaveBeenCalled();
  });

  describe('when the body is an empty object', () => {
    // Arrange
    const { req, res } = getHttpMocks();
    req.body = {};

    const next = jest.fn();

    it(`redirects to '${REDIRECT_URL}'`, () => {
      // Act
      validatePostAddPaymentRequestBody(req, res, next);

      // Assert
      expect(res._getRedirectUrl()).toEqual(REDIRECT_URL);
    });

    it(`populates the session with the '${ADD_PAYMENT_ERROR_KEY.NO_FEE_RECORDS_SELECTED}' error and no checked checkbox ids`, () => {
      // Act
      validatePostAddPaymentRequestBody(req, res, next);

      // Assert
      assertRequestSessionHasBeenPopulated(req, ADD_PAYMENT_ERROR_KEY.NO_FEE_RECORDS_SELECTED, []);
    });

    it("does not call the 'next' function", () => {
      // Act
      validatePostAddPaymentRequestBody(req, res, next);

      // Assert
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('when the body contains checkbox ids with different payment currencies', () => {
    const checkedCheckboxIds = [getCheckboxId(1, CURRENCY.GBP, FEE_RECORD_STATUS.TO_DO), getCheckboxId(2, 'EUR', FEE_RECORD_STATUS.TO_DO)];
    const next = jest.fn();

    it(`redirects to '${REDIRECT_URL}'`, () => {
      // Arrange
      const { req, res } = getHttpMocks();
      req.body = getRequestBodyFromCheckboxIds(checkedCheckboxIds);

      // Act
      validatePostAddPaymentRequestBody(req, res, next);

      // Assert
      expect(res._getRedirectUrl()).toEqual(REDIRECT_URL);
    });

    it(`redirects to '${REDIRECT_URL}' with facility id filter if referer has one`, () => {
      // Arrange
      const { req, res } = getHttpMocks();
      req.body = getRequestBodyFromCheckboxIds(checkedCheckboxIds);
      req.headers.referer = 'some-url?premiumPaymentsFacilityId=1234';

      // Act
      validatePostAddPaymentRequestBody(req, res, next);

      // Assert
      expect(res._getRedirectUrl()).toEqual(`${REDIRECT_URL}?premiumPaymentsFacilityId=1234`);
    });

    it(`populates the session with the '${ADD_PAYMENT_ERROR_KEY.DIFFERENT_PAYMENT_CURRENCIES}' error and the checked checkbox ids`, () => {
      // Arrange
      const { req, res } = getHttpMocks();
      req.body = getRequestBodyFromCheckboxIds(checkedCheckboxIds);

      // Act
      validatePostAddPaymentRequestBody(req, res, next);

      // Assert
      assertRequestSessionHasBeenPopulated(req, ADD_PAYMENT_ERROR_KEY.DIFFERENT_PAYMENT_CURRENCIES, checkedCheckboxIds);
    });

    it("does not call the 'next' function", () => {
      // Arrange
      const { req, res } = getHttpMocks();
      req.body = getRequestBodyFromCheckboxIds(checkedCheckboxIds);

      // Act
      validatePostAddPaymentRequestBody(req, res, next);

      // Assert
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('when the body contains checkbox ids with different statuses', () => {
    const checkedCheckboxIds = [getCheckboxId(1, CURRENCY.GBP, FEE_RECORD_STATUS.TO_DO), getCheckboxId(2, CURRENCY.GBP, FEE_RECORD_STATUS.DOES_NOT_MATCH)];
    const next = jest.fn();

    it(`redirects to '${REDIRECT_URL}'`, () => {
      // Arrange
      const { req, res } = getHttpMocks();
      req.body = getRequestBodyFromCheckboxIds(checkedCheckboxIds);

      // Act
      validatePostAddPaymentRequestBody(req, res, next);

      // Assert
      expect(res._getRedirectUrl()).toEqual(REDIRECT_URL);
    });

    it(`redirects to '${REDIRECT_URL}' with facility id filter if referer has one`, () => {
      // Arrange
      const { req, res } = getHttpMocks();
      req.body = getRequestBodyFromCheckboxIds(checkedCheckboxIds);
      req.headers.referer = 'some-url?premiumPaymentsFacilityId=1234';

      // Act
      validatePostAddPaymentRequestBody(req, res, next);

      // Assert
      expect(res._getRedirectUrl()).toEqual(`${REDIRECT_URL}?premiumPaymentsFacilityId=1234`);
    });

    it(`populates the session with the '${ADD_PAYMENT_ERROR_KEY.DIFFERENT_STATUSES}' error and the checked checkbox ids`, () => {
      // Arrange
      const { req, res } = getHttpMocks();
      req.body = getRequestBodyFromCheckboxIds(checkedCheckboxIds);

      // Act
      validatePostAddPaymentRequestBody(req, res, next);

      // Assert
      assertRequestSessionHasBeenPopulated(req, ADD_PAYMENT_ERROR_KEY.DIFFERENT_STATUSES, checkedCheckboxIds);
    });

    it("does not call the 'next' function", () => {
      // Arrange
      const { req, res } = getHttpMocks();
      req.body = getRequestBodyFromCheckboxIds(checkedCheckboxIds);

      // Act
      validatePostAddPaymentRequestBody(req, res, next);

      // Assert
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe(`when the body contains more than one checkbox id with the ${FEE_RECORD_STATUS.DOES_NOT_MATCH} status`, () => {
    // Arrange
    const { req, res } = getHttpMocks();

    const checkedCheckboxIds = [
      getCheckboxId(1, CURRENCY.GBP, FEE_RECORD_STATUS.DOES_NOT_MATCH),
      getCheckboxId(2, CURRENCY.GBP, FEE_RECORD_STATUS.DOES_NOT_MATCH),
    ];
    req.body = getRequestBodyFromCheckboxIds(checkedCheckboxIds);

    const next = jest.fn();

    it(`redirects to '${REDIRECT_URL}'`, () => {
      // Act
      validatePostAddPaymentRequestBody(req, res, next);

      // Assert
      expect(res._getRedirectUrl()).toEqual(REDIRECT_URL);
    });

    it(`populates the session with the '${ADD_PAYMENT_ERROR_KEY.MULTIPLE_DOES_NOT_MATCH_SELECTED}' error and the checked checkbox ids`, () => {
      // Act
      validatePostAddPaymentRequestBody(req, res, next);

      // Assert
      assertRequestSessionHasBeenPopulated(req, ADD_PAYMENT_ERROR_KEY.MULTIPLE_DOES_NOT_MATCH_SELECTED, checkedCheckboxIds);
    });

    it("does not call the 'next' function", () => {
      // Act
      validatePostAddPaymentRequestBody(req, res, next);

      // Assert
      expect(next).not.toHaveBeenCalled();
    });
  });

  it(`calls the 'next' function when the body contains multiple checkbox ids with the ${FEE_RECORD_STATUS.TO_DO} fee record status`, () => {
    // Arrange
    const { req, res } = getHttpMocks();

    const checkedCheckboxIds = [getCheckboxId(1, CURRENCY.GBP, FEE_RECORD_STATUS.TO_DO), getCheckboxId(2, CURRENCY.GBP, FEE_RECORD_STATUS.TO_DO)];
    req.body = getRequestBodyFromCheckboxIds(checkedCheckboxIds);

    const next = jest.fn();

    // Act
    validatePostAddPaymentRequestBody(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
  });

  it(`calls the 'next' function when the body contains one checkbox id with the ${FEE_RECORD_STATUS.TO_DO} fee record status`, () => {
    // Arrange
    const { req, res } = getHttpMocks();

    const checkedCheckboxIds = [getCheckboxId(1, CURRENCY.GBP, FEE_RECORD_STATUS.TO_DO)];
    req.body = getRequestBodyFromCheckboxIds(checkedCheckboxIds);

    const next = jest.fn();

    // Act
    validatePostAddPaymentRequestBody(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
  });

  it(`calls the 'next' function when the body contains one checkbox id with the ${FEE_RECORD_STATUS.DOES_NOT_MATCH} fee record status`, () => {
    // Arrange
    const { req, res } = getHttpMocks();

    const checkedCheckboxIds = [getCheckboxId(1, CURRENCY.GBP, FEE_RECORD_STATUS.DOES_NOT_MATCH)];
    req.body = getRequestBodyFromCheckboxIds(checkedCheckboxIds);

    const next = jest.fn();

    // Act
    validatePostAddPaymentRequestBody(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
  });
});
