const { getTime } = require('date-fns');
const CONSTANTS = require('../../constants');

/**
* Generate timestamps:
* - lastEdited
* - dateStarted
* - dateCompleted
* */
const generateTaskDates = (statusFrom, statusTo) => {
  const dates = {
    lastEdited: getTime(new Date()),
  };

  if (statusFrom === CONSTANTS.TASKS.STATUS.TO_DO) {
    dates.dateStarted = getTime(new Date());
  }

  if (statusTo === CONSTANTS.TASKS.STATUS.COMPLETED) {
    dates.dateCompleted = getTime(new Date());
  }

  return dates;
};

module.exports = generateTaskDates;