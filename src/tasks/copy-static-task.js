import plumber from 'gulp-plumber';
import rename from 'gulp-rename';

import BaseTask from './base-task';

const copy = (config, gulp) => {
  let resource = config.resource;

  let mask = resource.getMask();
  let dest = resource.getTarget();
  let options = config.options;

  let stream = gulp.src(mask, options)
    .pipe(plumber());

  let destName = resource.getDestName();

  if (destName) {
    stream = stream.pipe(rename(destName));
  }

  return stream.pipe(gulp.dest(dest));
};


export default class CopyStaticTask extends BaseTask {
  description = `
    - copy static resources from "src" into "dest" dir
    - find detailed information at https://github.com/tuchk4`;

  constructor(sources, gulp) {

    super(sources, gulp, (config, gulp) => {
      return copy(config, gulp);
    });
  }
};
