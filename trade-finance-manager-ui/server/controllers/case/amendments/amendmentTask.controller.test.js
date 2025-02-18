import { cloneDeep } from 'lodash';
import MOCKS from '../../../test-mocks/amendment-test-mocks';
import CONSTANTS from '../../../constants';
import { postAmendmentTask } from './amendmentTasks.controller';
import { mockRes } from '../../../test-mocks';
import api from '../../../api';

api.updateAmendment = jest.fn(() => {
  Promise.resolve(true);
});
console.error = jest.fn();

describe('postAmendmentTask', () => {
  const mockRequest = {
    params: {
      _id: MOCKS.MOCK_DEAL._id,
      facilityId: MOCKS.MOCK_AMENDMENT.facilityId,
      amendmentId: MOCKS.MOCK_AMENDMENT.amendmentId,
      groupId: '1',
      taskId: '1',
    },
    session: {
      user: MOCKS.MOCK_USER_PIM,
      userToken: '',
    },
    headers: {
      origin: '',
    },
    body: {
      assignedTo: '67448306ae1aa19ba14ee654',
      status: CONSTANTS.TASKS.UNASSIGNED,
    },
  };
  const mockResponse = mockRes();

  const mockAmendmentTaskUpdate = {
    taskUpdate: {
      id: mockRequest.params.taskId,
      groupId: Number(mockRequest.params.groupId),
      status: mockRequest.body.status,
      assignedTo: { userId: mockRequest.body.assignedTo },
      updatedBy: mockRequest.session.user._id,
      urlOrigin: mockRequest.headers.origin,
      updateTask: true,
    },
  };

  describe('when a mandatory argument is invalid', () => {
    it('should throw an error and redirect to problem with service page with an invalid deal id', async () => {
      const modifiedRequest = cloneDeep(mockRequest);
      delete modifiedRequest.params._id;

      await postAmendmentTask(modifiedRequest, mockResponse);

      expect(console.error).toHaveBeenLastCalledWith(
        'Unable to update amendment task %s for group %s %o',
        modifiedRequest.params.taskId,
        modifiedRequest.params.groupId,
        new Error('Invalid mandatory parameter'),
      );

      expect(mockResponse.redirect).toHaveBeenCalledWith('_partials/problem-with-service.njk');
    });

    it('should throw an error and redirect to problem with service page with an invalid deal id', async () => {
      const modifiedRequest = cloneDeep(mockRequest);
      delete modifiedRequest.params.facilityId;

      await postAmendmentTask(modifiedRequest, mockResponse);

      expect(console.error).toHaveBeenLastCalledWith(
        'Unable to update amendment task %s for group %s %o',
        modifiedRequest.params.taskId,
        modifiedRequest.params.groupId,
        new Error('Invalid mandatory parameter'),
      );

      expect(mockResponse.redirect).toHaveBeenCalledWith('_partials/problem-with-service.njk');
    });

    it('should throw an error and redirect to problem with service page with an invalid amendment id', async () => {
      const modifiedRequest = cloneDeep(mockRequest);
      delete modifiedRequest.params.amendmentId;

      await postAmendmentTask(modifiedRequest, mockResponse);

      expect(console.error).toHaveBeenLastCalledWith(
        'Unable to update amendment task %s for group %s %o',
        modifiedRequest.params.taskId,
        modifiedRequest.params.groupId,
        new Error('Invalid mandatory parameter'),
      );

      expect(mockResponse.redirect).toHaveBeenCalledWith('_partials/problem-with-service.njk');
    });

    it('should throw an error and redirect to problem with service page with an invalid group id', async () => {
      const modifiedRequest = cloneDeep(mockRequest);
      delete modifiedRequest.params.groupId;

      await postAmendmentTask(modifiedRequest, mockResponse);

      expect(console.error).toHaveBeenLastCalledWith(
        'Unable to update amendment task %s for group %s %o',
        modifiedRequest.params.taskId,
        modifiedRequest.params.groupId,
        new Error('Invalid mandatory parameter'),
      );

      expect(mockResponse.redirect).toHaveBeenCalledWith('_partials/problem-with-service.njk');
    });

    it('should throw an error and redirect to problem with service page with an invalid task id', async () => {
      const modifiedRequest = cloneDeep(mockRequest);
      delete modifiedRequest.params.taskId;

      await postAmendmentTask(modifiedRequest, mockResponse);

      expect(console.error).toHaveBeenLastCalledWith(
        'Unable to update amendment task %s for group %s %o',
        modifiedRequest.params.taskId,
        modifiedRequest.params.groupId,
        new Error('Invalid mandatory parameter'),
      );

      expect(mockResponse.redirect).toHaveBeenCalledWith('_partials/problem-with-service.njk');
    });

    it('should throw an error and redirect to problem with service page with an invalid ids', async () => {
      const modifiedRequest = cloneDeep(mockRequest);

      modifiedRequest.params._id = null;
      modifiedRequest.params.facilityId = '';
      modifiedRequest.params.groupId = undefined;
      modifiedRequest.params.amendmentId = '';

      await postAmendmentTask(modifiedRequest, mockResponse);

      expect(console.error).toHaveBeenLastCalledWith(
        'Unable to update amendment task %s for group %s %o',
        modifiedRequest.params.taskId,
        modifiedRequest.params.groupId,
        new Error('Invalid mandatory parameter'),
      );

      expect(mockResponse.redirect).toHaveBeenCalledWith('_partials/problem-with-service.njk');
    });
  });

  describe('when all mandatory arguments are valid', () => {
    it('should update the amendment and render the task page', async () => {
      await postAmendmentTask(mockRequest, mockResponse);

      expect(api.updateAmendment).toHaveBeenLastCalledWith(
        mockRequest.params.facilityId,
        mockRequest.params.amendmentId,
        mockAmendmentTaskUpdate,
        mockRequest.session.userToken,
      );

      expect(mockResponse.redirect).toHaveBeenCalledWith(`/case/${mockRequest.params._id}/tasks`);
    });
  });
});
