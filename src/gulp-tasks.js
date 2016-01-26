import { use as sequence } from 'run-sequence';
import BaseEvents from 'base-events';
import gutil from 'gulp-util';

import LessToCssTask from './tasks/less-to-css-task';
import BuildHtmlTask from './tasks/build-html-task';
import CopyStaticTask from './tasks/copy-static-task';
import CleanTask from './tasks/clean-task';

export default class GulpTasks extends BaseEvents {
  gulp = null;

  logger = (key) => console.log(key);
  colorize = (message) => gutil.colors.cyan(message);

  tasks = {
    less: (id, config, description) => {
      let gulp = this.gulp;

      let task = new LessToCssTask(config, gulp);

      this.subscribeTask(id, 'less', task);

      this.register(id, () => task.run(), description || task.description);
      this.register(`${id}:watch`, () => task.watch());
    },

    html: (id, config, description) => {
      let gulp = this.gulp;

      let task = new BuildHtmlTask(config, gulp);

      this.subscribeTask(id, 'html', task);

      this.register(id, () => task.run(), description || task.description);
      this.register(`${id}:watch`, () => task.watch());
    },

    copy: (id, config, description) => {
      let gulp = this.gulp;

      let task = new CopyStaticTask(config, gulp);

      this.subscribeTask(id, 'copy', task);

      this.register(id, () => task.run(), description || task.description);
      this.register(`${id}:watch`, () => task.watch());
    },

    clean: (id, config, description) => {
      let gulp = this.gulp;

      let task = new CleanTask(config, gulp);

      this.subscribeTask(id, 'clean', task);
      this.register(id, () => task.run(), description || task.description);
    }
  };

  constructor(key, config, applicationConfig) {
    super();

    this.key = key;
    this.config = config;

    this.applicationSrc = applicationConfig.src;
    this.applicationDest = applicationConfig.dest;
  }

  subscribeTask(id, namespace, task) {
    task.on('start', () => {
      let event = {
        id
      };

      this.emit(`${id}.start`, event);

      if (id != namespace) {
        this.emit(`${namespace}.start`, event);
      }
    });

    task.on('done', (config) => {
      let event = {
        id,
        config
      };

      this.emit(`${id}.done`, event);

      if (id != namespace) {
        this.emit(`${namespace}.done`, event);
      }
    });
  }

  use(gulp, components = {}) {
    if (!gulp) {
      throw new Error('gulp is not passed as argument to "use" function');
    }

    this.gulp = gulp;

    if (components.logger) {
      this.logger = components.logger;
    }

    if (components.colorize) {
      this.colorize = components.colorize;
    }

    let config = this.config;

    //this.logger(`Init ${this.colorize('Sintez-gulp')} tasks`)
    //this.logger('');

    for (let taskConfig of config) {
      let task = taskConfig.task;

      if (!task) {
        throw new Error('"task" options should be defined')
      }

      let id = taskConfig.id || task;

      if (!this.tasks.hasOwnProperty(task)) {
        throw new Error(`task "${task}" is not defined`);
      }

      this.tasks[task](id, taskConfig.arguments, taskConfig.description);
    }
  }

  register(id, task, description = '') {
    this.logger(`task "${this.colorize(id)}" ${description}`);

    if (description) {
      this.logger('');
    }

    this.gulp.task(id, task);
  }

  run(...tasks) {
    let runSequence = sequence(this.gulp);

    return new Promise((resolve, reject) => {
      runSequence(...tasks, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      })
    });
  }
}
