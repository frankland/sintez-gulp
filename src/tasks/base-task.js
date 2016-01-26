import mergeStreams from 'merge-stream';
import BaseEvents from 'base-events';

const _build = Symbol('build');

export default class BaseTask extends BaseEvents {
  constructor(sources, gulp, task) {
    super();

    this.gulp = gulp;

    if (Array.isArray(sources)) {
      this.sources = sources;
    } else {
      this.sources = [sources];
    }

    this[_build] = (config) => {
      this.emit('start', {config});

      return task(config, this.gulp)
        .on('end', () => {
          this.emit('done', config);
        });
    };
  }

  run() {
    let streams = mergeStreams();

    for (let config of this.sources) {
      let stream = this[_build](config);
      streams.add(stream);
    }

    return streams;
  }

  watch() {
    for (let config of this.sources) {
      let resource = config.resource;
      let mask = resource.getMask();
      let gulp = this.gulp;

      gulp.watch(mask, () => {
        return this[_build](config);
      });
    }
  }

  info() {
    for (let config of this.sources) {
      let resource = config.resource;

      console.log({
        src: resource.getSrc()
      });
    }
  }
}
