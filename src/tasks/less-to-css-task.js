import plumber from 'gulp-plumber';
import rename from 'gulp-rename';
import gulpLess from 'gulp-less';
import gulpConcat from 'gulp-concat';
import BaseTask from './base-task';


const DEFAULT_COMPILE_OPTIONS = {
  compress: true
};

const normalizeBuildOptions = (options = {}) => {
  return Object.assign({}, DEFAULT_COMPILE_OPTIONS, options);
};

const build = (config, gulp) => {
  let resource = config.resource;

  let src = resource.getSrc();
  let dest = resource.getTarget();
  let name = resource.getDestName();

  let stream = gulp.src(src)
    .pipe(plumber());

  let options = normalizeBuildOptions(config.options);

  stream = stream
    .pipe(gulpLess(options));

  if (name) {
    stream = stream.pipe(gulpConcat(name));
  }

  stream = stream.pipe(gulp.dest(dest));

  return stream

};

export default class LessToCssTask extends BaseTask {
  description = `
    - compile less into css
    - find detailed information at https://github.com/tuchk4`;

  constructor(sources, gulp) {
    super(sources, gulp, (config, gulp) => {
      return build(config, gulp);
    });
  }
}
