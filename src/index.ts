import { resolve, parse, join } from 'path';
import { readFileSync } from 'fs';
import * as glob from 'glob';

const extGlobs = '{json,txt}';
const fileGlob = '{*.,}{get,post,put,delete}**';

interface Mocks {
  alt: string;
  response: string;
  url: string;
  method: string;
  alias: string;
}

export const installPlugin = (on: Cypress.PluginEvents, config: any) => {
  const mocksCache = new Map<string, Mocks[]>();

  on('task', {
    async getMocks(options) {
      const mocksFolder = options.mocksFolder || 'mocks';
      const cwd = resolve(config.fixturesFolder, mocksFolder);
      const apiPath = options.apiPath || '/api/';
      const cache = 'cache' in options ? options.cache : true;

      if (cache && mocksCache.has(mocksFolder))
        return mocksCache.get(mocksFolder);

      const mockFiles: Mocks[] = [];
      try {
        glob
          .sync(`**/${fileGlob}.${extGlobs}`, { cwd })
          .forEach((path: string) => {
            const unescapedPath = path
              .replace(/\_\_/g, '*')
              .replace(/\-\-/g, '?');
            let { dir, name } = parse(unescapedPath);
            if (name.includes('.')) {
              const s = name.split('.');
              dir += s[0];
              name = s[1];
            }
            // tslint:disable-next-line:prefer-const
            let [method, alt] = name.split('-');
            method = method.toUpperCase();
            const response = `fx:${join(mocksFolder, path)}`;
            const url = join(apiPath, dir);
            const alias = alt ? `${method}:${dir}:${alt}` : `${method}:${dir}`;

            mockFiles.push({
              alt,
              response,
              url,
              method,
              alias,
            });
          });

        glob.sync(`**/options.json`, { cwd }).forEach((path: string) => {
          const raw = readFileSync(join(cwd, path));
          const opts = JSON.parse(String(raw));
          const { dir } = parse(path);
          const dirEscaped = dir.replace(/\_\_/g, '*');
          opts.forEach((opt: Mocks) => {
            opt.method = (opt.method || 'GET').toUpperCase();

            if (typeof opt.response === 'undefined') {
              opt.response = `fx:${join(
                mocksFolder,
                dir,
                opt.method.toLowerCase()
              )}`;
            } else if (
              typeof opt.response === 'string' &&
              !opt.response.startsWith('fx:') &&
              !opt.response.startsWith('fixture:')
            ) {
              opt.response = `fx:${join(mocksFolder, dir, opt.response)}`;
            }

            if (!(opt.url && opt.url.startsWith(apiPath))) {
              opt.url = join(apiPath, dirEscaped + (opt.url || ''));
            }
            opt.alias =
              opt.alias || `${opt.method}:${opt.url.replace(apiPath, '')}`;

            mockFiles.push(opt);
          });
        });
      } catch (err) {
        // nop
      }
      mocksCache.set(mocksFolder, mockFiles);
      return mockFiles;
    },
  });
};
