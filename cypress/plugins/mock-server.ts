import { resolve, parse, join } from 'path';
import { readFileSync } from 'fs';
import * as glob from 'glob';

const extGlobs = '{json,txt}';
const fileGlob = '{get,post,put,delete}**';

interface Mocks {
  name: string;
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

      if (cache && mocksCache.has(mocksFolder)) return mocksCache.get(mocksFolder);

      const mockFiles: Mocks[] = [];
      try {
        glob.sync(`**/${fileGlob}.${extGlobs}`, { cwd }).forEach((path: string) => {
          const { dir, name } = parse(path.replace(/\_\_/g, '*'));
          let [method, alt] = name.split('-');
          method = method.toUpperCase();
          const response = `fx:${join(mocksFolder, path)}`;
          const url = join(apiPath, dir);
          const alias = alt ? `${method}:${dir}:${alt}` : `${method}:${dir}`;

          mockFiles.push({
            name,
            alt,
            response,
            url,
            method,
            alias
          });
        });

        glob.sync(`**/options.json`, { cwd }).forEach((path: string) => {
          const raw = readFileSync(join(cwd, path));
          const opts = JSON.parse(String(raw));
          opts.forEach((opt: Mocks) => {
            mockFiles.push(opt);
          });
        });
      } catch (err) {
        // nop
      }
      mocksCache.set(mocksFolder, mockFiles);
      return mockFiles;
    }
  });
};
