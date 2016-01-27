import gulpJade from 'gulp-jade';
import htmlreplace from 'gulp-html-replace';
import rename from 'gulp-rename';
import plumber from 'gulp-plumber';

import { extname } from 'path';

import BaseTask from './base-task';

const getConstantsInitializers = (key, constants = {}) => {
  let output = [`window.${key}=window.${key} || {};`];

  for (let constName of Object.keys(constants)) {
    output.push(`window.${key}.${constName}=${JSON.stringify(constants[constName])};`);
  }

  return output.join('\n');
};


const normalizeOptions = options => {
  let normalized = {};

  if (options.base) {
    Object.assign(normalized, {
      base: {
        src: options.base,
        tpl: '<base href="%s">'
      }
    });
  }

  if (options.title) {
    Object.assign(normalized, {
      title: {
        src: options.title,
        tpl: '<title>%s</title>'
      }
    });
  }

  if (options.css) {
    Object.assign(normalized, {
      css: {
        src: options.css.getUrl(),
        tpl: '<link href="%s" rel="stylesheet"/>'
      }
    });
  }

  if (options.js) {
    Object.assign(normalized, {
      js: {
        src: options.js.getUrl(),
        tpl: '<script src="%s" type="text/javascript"></script>'
      }
    });
  }

  if (options.favicon) {
    Object.assign(normalized, {
      favicon: {
        src: options.favicon.getUrl(),
        tpl: '<link rel="icon" type="image/png" href="%s" />'
      }
    });
  }

  if (options.variables) {
    Object.assign(normalized, {
      variables: {
        src: getConstantsInitializers('__constants__', options.variables),
        tpl: '<script>%s</script>'
      }
    });
  }


  return normalized;
};


const compilers = new Map();
compilers.set('.jade', options => gulpJade(options));

const build = (config, gulp) => {
  let resource = config.resource;

  let src = resource.getSrc();
  let dest = resource.getTarget();
  let name = resource.getDestName();

  let stream = gulp.src(src)
    .pipe(plumber());

  let extension = extname(src);
  if (compilers.has(extension)) {
    let compiler = compilers.get(extension);
    let compileOptions = config.compileOptions;

    stream = stream.pipe(compiler(compileOptions));
  }

  let buildOptions = normalizeOptions(config.buildOptions);

  return stream.pipe(htmlreplace(buildOptions))
    .pipe(rename(name))
    .pipe(gulp.dest(dest));
};


export default class BuildHtmlTask extends BaseTask {
  description = `
    - build template (html / jade) into html according to provided options (global variables, base url, favicon)
    - find detailed information at https://github.com/tuchk4`;

  constructor(sources, gulp) {

    super(sources, gulp, (config, gulp) => {
      return build(config, gulp);
    });
  }
}
