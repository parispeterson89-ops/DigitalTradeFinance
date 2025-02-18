import { TFM_FACILITY_STAGE } from '@ukef/dtfs2-common';
import { mapBssEwcsFacilityStage, mapGefFacilityStage } from './mapFacilityStage';
import CONSTANTS from '../../../../constants';

const { ISSUED, UNCONDITIONAL, UNISSUED, CONDITIONAL } = CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL;

describe('mapGefFacilityStage', () => {
  describe('when a tfm facility stage is passed in', () => {
    it('should return the tfm facility stage', () => {
      const result = mapGefFacilityStage(true, TFM_FACILITY_STAGE.RISK_EXPIRED);
      expect(result).toEqual(TFM_FACILITY_STAGE.RISK_EXPIRED);
    });
  });

  describe('when facilityStage is true boolean', () => {
    it('should return facilityStage as `Issued`', () => {
      const result = mapGefFacilityStage(true);
      expect(result).toEqual(TFM_FACILITY_STAGE.ISSUED);
    });
  });

  describe('when facilityStage is false boolean', () => {
    it(`should return facilityStage as ${TFM_FACILITY_STAGE.COMMITMENT}`, () => {
      const result = mapGefFacilityStage(false);
      expect(result).toEqual(TFM_FACILITY_STAGE.COMMITMENT);
    });
  });
});

describe('mapBssEwcsFacilityStage', () => {
  describe('when a tfm facility stage is passed in', () => {
    it('should return the tfm facility stage', () => {
      const result = mapBssEwcsFacilityStage(ISSUED, TFM_FACILITY_STAGE.RISK_EXPIRED);
      expect(result).toEqual(TFM_FACILITY_STAGE.RISK_EXPIRED);
    });
  });

  describe(`when facilityStage is ${ISSUED}`, () => {
    it(`should return facilityStage as ${TFM_FACILITY_STAGE.ISSUED}`, () => {
      const result = mapBssEwcsFacilityStage(ISSUED);
      expect(result).toEqual(TFM_FACILITY_STAGE.ISSUED);
    });
  });

  describe(`when facilityStage is ${UNCONDITIONAL}`, () => {
    it(`should return facilityStage as ${TFM_FACILITY_STAGE.ISSUED}`, () => {
      const result = mapBssEwcsFacilityStage(UNCONDITIONAL);
      expect(result).toEqual(TFM_FACILITY_STAGE.ISSUED);
    });
  });

  describe(`when facilityStage is ${UNISSUED}`, () => {
    it(`should return facilityStage as ${TFM_FACILITY_STAGE.COMMITMENT}`, () => {
      const result = mapBssEwcsFacilityStage(UNISSUED);
      expect(result).toEqual(TFM_FACILITY_STAGE.COMMITMENT);
    });
  });

  describe(`when facilityStage is ${CONDITIONAL}`, () => {
    it(`should return facilityStage as ${TFM_FACILITY_STAGE.COMMITMENT}`, () => {
      const result = mapBssEwcsFacilityStage(CONDITIONAL);
      expect(result).toEqual(TFM_FACILITY_STAGE.COMMITMENT);
    });
  });

  describe(`when facilityStage is an unrecognised string`, () => {
    it('should return null', () => {
      const invalidFacilityStage = 'invalid stage';

      const result = mapBssEwcsFacilityStage(invalidFacilityStage);
      expect(result).toEqual(null);
    });
  });
});
