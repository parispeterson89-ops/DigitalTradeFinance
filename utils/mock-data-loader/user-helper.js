const api = require('./api');
const tfmApi = require('./tfm/api');

const mockDataLoaderUser = {
  username: 're-insert-mocks',
  password: 'AbC!2345',
  firstname: 'Mock',
  surname: 'DataLoader',
  roles: ['editor', 'maker'],
  email: 're-insert-mocks-data-loader@ukexportfinance.gov.uk',
  bank: { id: '*' },
};

const createAndLogInAsInitialUser = async () => {
  console.info(`try log in as ${mockDataLoaderUser.username}`);
  let token = await api.login(mockDataLoaderUser);

  if (!token) {
    console.info(`Could not login as ${mockDataLoaderUser.username}`);
    console.info(`creating user ${mockDataLoaderUser.username}`);
    await api.createInitialUser(mockDataLoaderUser);
    console.info(`log in as ${mockDataLoaderUser.username}`);
    token = await api.login(mockDataLoaderUser);
  }

  return token;
};

const deleteInitialUser = async (token) => {
  const allUsers = await api.listUsers(token);
  const userToDelete = allUsers.find((user) => user.username === mockDataLoaderUser.username);
  console.info(`deleting user ${userToDelete.username}`);
  await api.deleteUser(userToDelete, token);
};

const deleteInitialTFMUser = async (token) => {
  const allUsers = await tfmApi.listUsers(token);
  const userToDelete = allUsers.filter((user) => user.username === 're-insert-mocks');

  for (const user of userToDelete) {
    console.info(`deleting tfm user ${user.username}`);
    await tfmApi.deleteUser(user);
  }
};

module.exports = {
  mockDataLoaderUser, createAndLogInAsInitialUser, deleteInitialUser, deleteInitialTFMUser
};