const chalk = require('chalk');
const build = require('esbuild').build;

build({
  entryPoints: ['index.ts'],
  bundle: true,
  platform: "node",
  outfile: './lib/bundle.js',
  loader: {".ts": "ts"}
})
.then(() => console.log(chalk.bold.green("Build finished successfully")))
.catch((e) => console.error(e.message));