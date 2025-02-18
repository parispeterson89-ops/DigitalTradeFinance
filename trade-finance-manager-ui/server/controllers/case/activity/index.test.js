import { ACTIVITY_TYPES, DEAL_TYPE, TFM_DEAL_CANCELLATION_STATUS } from '@ukef/dtfs2-common';
import activityController from '.';
import api from '../../../api';
import { mockRes } from '../../../test-mocks';
import CONSTANTS from '../../../constants';
import { generateValidationErrors } from '../../../helpers/validation';
import { mapActivities } from './helpers/map-activities';

const mockGetDealSuccessBannerMessage = jest.fn();

jest.mock('../../helpers/get-success-banner-message.helper', () => ({
  getDealSuccessBannerMessage: (params) => mockGetDealSuccessBannerMessage(params),
}));

const res = mockRes();

const session = {
  user: {
    _id: '12345678',
    username: 'testUser',
    firstName: 'Joe',
    lastName: 'Bloggs',
    teams: ['TEAM1'],
  },
};

describe('activity controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET activity', () => {
    describe('when deal exists', () => {
      const mockDeal = {
        _id: '61f6ac5b02fade01b1e8efef',
        dealSnapshot: {
          _id: '61f6ac5b02fade01b1e8efef',
          dealType: DEAL_TYPE.GEF,
          submissionDetails: {
            supplierName: 'test supplier',
          },
          ukefDealId: 'ukefDealId',
        },
        tfm: {
          activities: [],
        },
      };

      const mockSuccessMessage = 'mockSuccessMessage';

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
        api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
        api.getDealCancellation = () =>
          Promise.resolve({
            effectiveFrom: new Date().valueOf(),
            bankRequestDate: new Date().valueOf(),
            reason: 'a reason',
            status: TFM_DEAL_CANCELLATION_STATUS.COMPLETED,
          });

        mockGetDealSuccessBannerMessage.mockResolvedValue(mockSuccessMessage);
      });

      it('should render template with data', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          session,
          flash: jest.fn(() => []),
        };

        const activities = mapActivities(mockDeal.tfm.activities);

        await activityController.getActivity(req, res);

        expect(res.render).toHaveBeenCalledWith('case/activity/activity.njk', {
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'activity',
          successMessage: mockSuccessMessage,
          deal: mockDeal.dealSnapshot,
          tfm: mockDeal.tfm,
          dealId: mockDeal.dealSnapshot._id,
          user: session.user,
          selectedActivityFilter: CONSTANTS.ACTIVITIES.ACTIVITY_FILTERS.ALL,
          activities,
          amendmentsInProgress: [],
          hasAmendmentInProgress: false,
        });
      });
    });

    describe('when deal does NOT exist', () => {
      beforeEach(() => {
        api.getDeal = () => Promise.resolve();
        api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
      });

      it('should redirect to not-found route', async () => {
        const req = {
          params: {
            _id: '1',
          },
          session,
        };

        await activityController.getActivity(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });

  describe('POST activity (filter)', () => {
    const MOCK_AUTHOR = {
      firstName: 'tester',
      lastName: 'smith',
      _id: 12243343242342,
    };

    const mockDeal = {
      _id: '61f6ac5b02fade01b1e8efef',
      dealSnapshot: {
        _id: '61f6ac5b02fade01b1e8efef',
        dealType: DEAL_TYPE.GEF,

        submissionDetails: {
          supplierName: 'test supplier',
        },
        ukefDealId: 'ukefDealId',
      },
      tfm: {
        activities: [
          {
            type: ACTIVITY_TYPES.COMMENT,
            timestamp: 13345665,
            text: 'test1',
            author: MOCK_AUTHOR,
            label: 'Comment added',
          },
          {
            type: ACTIVITY_TYPES.ACTIVITY,
            timestamp: 13345665,
            text: '',
            author: MOCK_AUTHOR,
            label: 'Other',
          },
          {
            type: ACTIVITY_TYPES.COMMENT,
            timestamp: 13345665,
            text: 'test2',
            author: MOCK_AUTHOR,
            label: 'Comment added',
          },
          {
            type: ACTIVITY_TYPES.ACTIVITY,
            timestamp: 13345665,
            text: 'test1',
            author: MOCK_AUTHOR,
            label: 'Other',
          },
        ],
      },
    };

    describe('when deal exists', () => {
      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
        api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
        api.getDealCancellation = () =>
          Promise.resolve({
            effectiveFrom: new Date().valueOf(),
            bankRequestDate: new Date().valueOf(),
            reason: 'a reason',
            status: TFM_DEAL_CANCELLATION_STATUS.COMPLETED,
          });
      });

      it('should render filtered activities with data', async () => {
        const mockSuccessMessage = 'mockSuccessMessage';

        const req = {
          params: {
            _id: mockDeal._id,
          },
          body: {
            filterType: CONSTANTS.ACTIVITIES.ACTIVITY_FILTERS.COMMENT,
          },
          session,
          flash: jest.fn(() => [mockSuccessMessage]),
        };

        const activities = mapActivities(mockDeal.tfm.activities);

        await activityController.filterActivities(req, res);
        expect(res.render).toHaveBeenCalledWith('case/activity/activity.njk', {
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'activity',
          successMessage: mockSuccessMessage,
          deal: mockDeal.dealSnapshot,
          tfm: mockDeal.tfm,
          dealId: mockDeal.dealSnapshot._id,
          user: session.user,
          selectedActivityFilter: CONSTANTS.ACTIVITIES.ACTIVITY_FILTERS.COMMENT,
          activities,
          amendmentsInProgress: [],
          hasAmendmentInProgress: false,
        });
      });
    });

    describe('when deal does NOT exist', () => {
      beforeEach(() => {
        api.getDeal = () => Promise.resolve();
        api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
      });

      it('should redirect to not-found route', async () => {
        const req = {
          params: {
            _id: '1',
          },
          session,
          body: {
            filterType: CONSTANTS.ACTIVITIES.ACTIVITY_FILTERS.COMMENT,
          },
        };

        await activityController.filterActivities(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });

  describe('GET activity - post-comment', () => {
    const mockDeal = {
      _id: '61f6ac5b02fade01b1e8efef',
      dealSnapshot: {
        _id: '61f6ac5b02fade01b1e8efef',
        submissionDetails: {
          supplierName: 'test supplier',
        },
      },
      tfm: {
        activities: [],
      },
    };

    describe('when deal exists', () => {
      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
        api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
      });

      it('should render the comment box', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          session,
        };

        await activityController.getCommentBox(req, res);
        expect(res.render).toHaveBeenCalledWith('case/activity/activity-comment.njk', {
          dealId: mockDeal.dealSnapshot._id,
          user: session.user,
          maxCommentLength: 1000,
        });
      });
    });

    describe('when deal does NOT exist', () => {
      beforeEach(() => {
        api.getDeal = () => Promise.resolve();
        api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
      });

      it('should redirect to not-found route', async () => {
        const req = {
          params: {
            _id: '1',
          },
          session,
        };

        await activityController.getCommentBox(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });

  describe('POST activity - post-comment', () => {
    const mockDeal = {
      _id: '61f6ac5b02fade01b1e8efef',
      dealSnapshot: {
        _id: '61f6ac5b02fade01b1e8efef',
        submissionDetails: {
          supplierName: 'test supplier',
        },
      },
      tfm: {
        activities: [],
      },
    };

    const longComment = 'aaaaa'.repeat(201);
    const normalComment = 'test';

    describe('when deal exists', () => {
      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
        api.getAmendmentsByDealId = () => Promise.resolve({ data: [] });
      });

      it('should return to comment box with errors if longer than 1000 characters', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          body: {
            comment: longComment,
          },
          session,
        };

        await activityController.postComment(req, res);
        expect(res.render).toHaveBeenCalledWith('case/activity/activity-comment.njk', {
          dealId: mockDeal.dealSnapshot._id,
          user: session.user,
          maxCommentLength: 1000,
          validationErrors: generateValidationErrors('comment', 'Comments must be 1000 characters or fewer', 0, {}),
          comment: longComment,
        });
      });

      it('should return render activities page with all-activity filter after posting comment', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          body: {
            comment: normalComment,
          },
          session,
        };

        await activityController.postComment(req, res);
        expect(res.redirect).toHaveBeenCalledWith(`/case/${mockDeal._id}/activity`);
      });

      it('should return render activities page with all-activity filter after not posting a comment', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          body: {
            comment: '',
          },
          session,
        };

        await activityController.postComment(req, res);
        expect(res.redirect).toHaveBeenCalledWith(`/case/${mockDeal._id}/activity`);
      });
    });
  });
});
