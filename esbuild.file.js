const chalk = require('chalk');
const build = require('esbuild').build;

build({
  entryPoints: ['index.ts'],
  bundle: true,
  platform: "node",
  outfile: './lib/bundle.js',
  loader: {".ts": "ts"}
})
.catch((e) => console.error(e.message));