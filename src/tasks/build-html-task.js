import gulpJade from 'gulp-jade';
import htmlreplace from 'gulp-html-replace';
import rename from 'gulp-rename';
import plumber from 'gulp-plumber';

import { extname } from 'path';
import isObject from 'lodash/isObject';

import BaseTask from './base-task';

const getConstantsInitializers = (key, constants = {}) => {
  let output = [`window.${key}=window.${key} || {};`];

  for (let constName of Object.keys(constants)) {
    output.push(`window.${key}.${constName}=${JSON.stringify(constants[constName])};`);
  }

  return output.join('\n');
};


const getBuildOptionsPresets = () => {
  const optionsPresetsMap = new Map();

  optionsPresetsMap.set('base', base => ({
    src: base,
    tpl: '<base href="%s">'
  }));

  optionsPresetsMap.set('title', title => ({
    src: title,
    tpl: '<title>%s</title>'
  }));

  optionsPresetsMap.set('css', css => ({
    src: css,
    tpl: '<link href="%s" rel="stylesheet"/>'
  }));

  optionsPresetsMap.set('js', js => ({
    src: js,
    tpl: '<script src="%s" type="text/javascript"></script>'
  }));

  optionsPresetsMap.set('favicon', favicon => ({
    src: favicon,
    tpl: '<link rel="icon" type="image/png" href="%s" />'
  }));

  optionsPresetsMap.set('variables', variables => ({
    src: getConstantsInitializers('__variables__', variables),
    tpl: '<script>%s</script>'
  }));

  return optionsPresetsMap;
};

const normalizeOptions = options => {
  let normalized = {};

  let presets = getBuildOptionsPresets();

  for (let id of Object.keys(options)) {
    let value = options[id];

    if (presets.has(id)) {
      let preset = presets.get(id);

      Object.assign(normalized, {
        [id]: preset(value)
      });
    } else if (isObject(value) && value.hasOwnProperty('tpl') && value.hasOwnProperty('src')) {

      Object.assign(normalized, {
        [id]: value
      });
    } else {
      throw new Error(`Build option "${id}" is incorrect`);
    }
  }

  return normalized;
};


const compilers = new Map();
compilers.set('.jade', options => gulpJade(options));

export default class BuildHtmlTask extends BaseTask {
  description = `
    - build template (html / jade) into html according to provided options (global variables, base url, favicon)
    - find detailed information at https://github.com/tuchk4`;

  constructor(sources, gulp) {
    super(sources, gulp, (config, gulp) => {
      let resource = config.resource;

      let src = resource.getSrc();
      let dest = resource.getTarget();
      let name = resource.getDestName();

      let {js, css, favicon} = config.buildOptions;

      let buildOptions = Object.assign({}, config.buildOptions, {
        js: js.getUrl(),
        css: css.getUrl(),
        favicon: favicon.getUrl()
      });

      return this.buildTemplate({
        src,
        dest,
        name,
        compileOptions: config.compileOptions,
        buildOptions: buildOptions
      });
    });
  }

  buildTemplate(options) {
    let src = options.src;
    let dest = options.dest;
    let name = options.name;

    let gulp = this.gulp;

    let stream = gulp.src(src)
      .pipe(plumber());

    let extension = extname(src);
    if (compilers.has(extension)) {
      let compiler = compilers.get(extension);
      let compileOptions = options.compileOptions;

      stream = stream.pipe(compiler(compileOptions));
    }

    let buildOptions = normalizeOptions(options.buildOptions);
    return stream.pipe(htmlreplace(buildOptions))
      .pipe(rename(name))
      .pipe(gulp.dest(dest));
  }
}
