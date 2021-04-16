import { resolve, parse, join } from 'path';
import { readFileSync } from 'fs';
import * as glob from 'glob';
import slash from 'slash';

const extGlobs = '{json,txt}';
const fileGlob = '{*.,}{get,post,put,delete}**';

interface Mocks {
  alt: string;
  response: string;
  url: string;
  method: string;
  alias: string;
}

export interface Config {
  fixturesFolder: string;
}

export interface Options {
  mocksFolder: string;
  apiPath: string;
  cache: boolean;
}

export const installPlugin = (
  on: Cypress.PluginEvents,
  config: Config
): void => {
  const mocksCache = new Map<string, Mocks[]>();

  on('task', {
    getMocks: async (options: Partial<Options>) => {
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
            const unescapedPath = path.replace(/__/g, '*').replace(/--/g, '?');
            let { dir, name } = parse(unescapedPath);
            if (name.includes('.')) {
              const s = name.split('.');
              dir += s[0];
              name = s[1];
            }
            const sp = name.split('-');
            let method = sp[0];
            const alt = sp[1];
            method = method.toUpperCase();
            const response = `fx:${slash(join(mocksFolder, path))}`;
            const url = slash(join(apiPath, dir));
            const alias = alt ? `${method}:${dir}:${alt}` : `${method}:${dir}`;

            mockFiles.push({
              alt,
              response,
              url,
              method,
              alias,
            });
          });

        glob.sync('**/options.json', { cwd }).forEach((path: string) => {
          const raw = readFileSync(join(cwd, path));
          const opts = JSON.parse(String(raw));
          const { dir } = parse(path);
          const dirEscaped = dir.replace(/__/g, '*');
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
              opt.response = `fx:${slash(join(mocksFolder, dir, opt.response))}`;
            }

            if (!(opt.url && opt.url.startsWith(apiPath))) {
              opt.url = join(apiPath, dirEscaped + (opt.url || ''));
            }
            opt.url = slash(opt.url);
            opt.alias =
              opt.alias || `${opt.method}:${opt.url.replace(slash(apiPath), '')}`;

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
