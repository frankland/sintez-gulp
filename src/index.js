import GulpTasks from './gulp-tasks';

module.exports = (key, config, applicationConfig) => {
  return new GulpTasks(key, config, applicationConfig);
};
