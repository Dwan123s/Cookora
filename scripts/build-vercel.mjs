import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const require = createRequire(import.meta.url);

// Vercel's Node loader currently rejects CJS require() of Nest 12's ESM packages.
// Bundle Nest itself to CJS; keep native/database packages external for correct file tracing.
await build({
  entryPoints: ['backend/dist/vercel.js'],
  outfile: 'backend/dist/vercel-bundle.cjs',
  bundle: true,
  platform: 'node',
  target: 'node24',
  format: 'cjs',
  banner: { js: "const __cookora_import_meta_url = require('node:url').pathToFileURL(__filename).href;" },
  define: {
    'import.meta.url': '__cookora_import_meta_url',
    'import.meta.dirname': '__dirname',
    'import.meta.filename': '__filename',
  },
  packages: 'external',
  external: ['../generated/postgres'],
  plugins: [
    {
      name: 'bundle-nest-esm',
      setup(builder) {
        builder.onResolve({ filter: /^@nestjs\// }, (args) => {
          try {
            return { path: require.resolve(args.path, { paths: [args.resolveDir || resolve('backend')] }) };
          } catch {
            return { path: args.path, external: true };
          } // Optional Nest integrations remain optional.
        });
      },
    },
  ],
  logLevel: 'info',
});
console.log('Vercel NestJS handler bundled successfully.');
