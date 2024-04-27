const roles = ['passenger', 'driver', 'admin'];

const roleRights = new Map();
roleRights.set(roles[0], []);
roleRights.set(roles[1], []);
roleRights.set(roles[2], ['getUsers', 'manageUsers']);

export default {
  roles,
  roleRights,
};
