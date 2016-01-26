module.exports = (id, resource, options) => {
  var src = resource.getCollected();
  var dest = resource.getDest();

  var iterableSrc = null;
  if (Array.isArray(src)) {
    iterableSrc = src;
  } else {
    iterableSrc = [src];
  }

  var colorize = options.colorize || (message => message);
  for (var partial of iterableSrc) {
    options.log(`"${colorize(id)}" task fired. ${colorize(partial)} -> ${colorize(dest)}`);
  }
};
