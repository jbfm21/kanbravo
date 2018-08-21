module.exports = function (gulp, plugins, options)
{
    return function ()
    {
        return plugins.connect.server({
            root: options.root,
            livereload: true,
            fallback: options.fallback
        });
  };
};
