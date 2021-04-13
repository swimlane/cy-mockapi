import { resolve, parse, join } from 'path';
import { readFileSync } from 'fs';
import * as glob from 'glob';
import { GenericStaticResponse, RouteMatcherOptionsGeneric } from 'cypress/types/net-stubbing';

const extGlobs = '{json,txt}';
const fileGlob = '{*.,}{get,post,put,delete}**';
interface Mocks {
  alt: string;
  alias: string;

  matcher: RouteMatcherOptionsGeneric<string>,
  handler: GenericStaticResponse<string, string>
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
          const fixture = `${join(mocksFolder, path)}`;
          const url = join(apiPath, dir);
          const alias = alt ? `${method}:${dir}:${alt}` : `${method}:${dir}`;

          mockFiles.push({
            alt,
            alias,
            matcher: {
              method,
              url
            },
            handler: {
              fixture
            }
          });
        });

      glob.sync('**/options.json', { cwd }).forEach((path: string) => {
        const raw = readFileSync(join(cwd, path));
        const opts = JSON.parse(String(raw));
        const { dir } = parse(path);
        const dirEscaped = dir.replace(/__/g, '*');

        opts.forEach((opt: Mocks) => {
          opt.matcher ||= {};
          opt.handler ||= {};

          const { matcher, handler } = opt;

          matcher.method ||= 'GET';
          matcher.method = matcher.method.toUpperCase();

          if (!(matcher.url && matcher.url.startsWith(apiPath))) {
            matcher.url = join(apiPath, dirEscaped + (matcher.url || ''));
          }

          if (!handler.body && !handler.fixture) {
            handler.fixture = matcher.method.toLowerCase()
          }
          if (handler.fixture) {
            handler.fixture = join(
              mocksFolder,
              dir,
              handler.fixture
            );
          }

          opt.alias ||= `${matcher.method}:${matcher.url.replace(apiPath, '')}`;

          console.log(opt.alias, opt.matcher, opt.handler);

          mockFiles.push(opt);
        });
      });

      mocksCache.set(mocksFolder, mockFiles);
      return mockFiles;
    },
  });
};
