import { EntityManager } from 'typeorm';
import {
  DbRequestSource,
  FacilityUtilisationDataEntity,
  FacilityUtilisationDataEntityMockBuilder,
  ReportPeriod,
  REQUEST_PLATFORM_TYPE,
} from '@ukef/dtfs2-common';
import { updateFacilityUtilisationData } from './update-facility-utilisation-data';

describe('updateFacilityUtilisationData', () => {
  const mockSave = jest.fn();

  const mockEntityManager = {
    save: mockSave,
  } as unknown as EntityManager;

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should update the facility utilisation data entity with the supplied report period, ukef share of utilisation and request source and saves the entity', async () => {
    // Arrange
    const facilityUtilisationDataEntity = FacilityUtilisationDataEntityMockBuilder.forId('12345678')
      .withUtilisation(1234567.89)
      .withReportPeriod({
        start: { month: 1, year: 2021 },
        end: { month: 2, year: 2022 },
      })
      .build();

    const reportPeriod: ReportPeriod = {
      start: { month: 6, year: 2026 },
      end: { month: 7, year: 2027 },
    };
    const ukefShareOfUtilisation = 1234567.77;
    const requestSource: DbRequestSource = {
      platform: REQUEST_PLATFORM_TYPE.TFM,
      userId: 'abc123',
    };
    const fixedFee = 12345;

    // Act
    await updateFacilityUtilisationData(facilityUtilisationDataEntity, {
      fixedFee,
      reportPeriod,
      requestSource,
      ukefShareOfUtilisation,
      entityManager: mockEntityManager,
    });

    // Assert
    expect(mockSave).toHaveBeenCalledWith(FacilityUtilisationDataEntity, facilityUtilisationDataEntity);
    expect(facilityUtilisationDataEntity.utilisation).toEqual(ukefShareOfUtilisation);
    expect(facilityUtilisationDataEntity.reportPeriod).toEqual(reportPeriod);
    expect(facilityUtilisationDataEntity.lastUpdatedByTfmUserId).toEqual('abc123');
    expect(facilityUtilisationDataEntity.lastUpdatedByPortalUserId).toBeNull();
    expect(facilityUtilisationDataEntity.lastUpdatedByIsSystemUser).toEqual(false);
    expect(facilityUtilisationDataEntity.fixedFee).toEqual(12345);
  });
});
