import rimraf from 'gulp-rimraf';

import BaseTask from './base-task';

export default class CleanTask extends BaseTask {
  description = `Clean dest directory`;

  constructor(sources, gulp) {
    super(sources, gulp, (config, gulp) => {
      let dir = config.dir;

      return gulp.src(dir).pipe(rimraf({
        force: true
      }));
    });
  }

  watch() {
    throw new Error('denied');
  }

  info() {
    throw new Error('denied');
  }
}
