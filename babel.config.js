// Used by Jest only — not shipped in the npm package (see the `files` whitelist in
// package.json). `src/` is compiled for publishing by `tsc` (see `npm run build`), not Babel.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
