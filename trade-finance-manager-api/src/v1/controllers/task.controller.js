const api = require('../api');

const updateTfmTask = async (dealId, tfmTaskUpdate) => {
  const deal = await api.findOneDeal(dealId);

  const {
    id: taskId,
    assignedTo,
  } = tfmTaskUpdate;

  const { userId: assignedUserId } = assignedTo;

  let userFullName;

  if (assignedUserId === 'Unassigned') {
    userFullName = 'Unassigned';
  } else {
    const user = await api.findUserById(assignedUserId);
    const { firstName, lastName } = user;
    userFullName = `${firstName} ${lastName}`;
  }

  const cleanTfmTask = {
    ...tfmTaskUpdate,
    assignedTo: {
      userFullName,
      userId: assignedUserId,
    },
  };

  const originalTasks = deal.tfm.tasks;

  const modifiedTasks = originalTasks.map((t) => {
    let task = t;
    if (task.id === taskId) {
      task = {
        ...task,
        ...cleanTfmTask,
      };
    }

    return task;
  });

  const tasksUpdate = {
    tfm: {
      tasks: modifiedTasks,
    },
  };

  // eslint-disable-next-line no-underscore-dangle
  await api.updateDeal(dealId, tasksUpdate);

  // TODO: if going from assigned unassigned, remove from previous users's profile.

  const userAssignedTasks = modifiedTasks.filter((t) =>
    t.assignedTo && t.assignedTo.userId === assignedUserId);

  await api.updateUserTasks(assignedUserId, userAssignedTasks);

  return cleanTfmTask;
};
exports.updateTfmTask = updateTfmTask;