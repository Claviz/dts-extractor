import fs from 'fs-extra';
import path from 'path';

export async function getDts({ nodeModulesPath, packages }: { nodeModulesPath: string; packages: string[] }) {
    const typings: { [key: string]: string } = {};
    const parsedPackages: { [key: string]: boolean } = {};

    async function getTypingsForPackages(packages: string[] = []) {
        for (const packageName of packages) {
            if (!parsedPackages[packageName]) {
                parsedPackages[packageName] = true;
                const packageJson = await fs.readJSON(`${nodeModulesPath}/${packageName}/package.json`, { throws: false });
                if (packageJson) {
                    const types = packageJson.typings || packageJson.types;
                    if (types) {
                        typings[`node_modules/${packageName}/package.json`] = JSON.stringify(packageJson);
                        const dirname = path.dirname(types) === '.' ? '' : path.dirname(types);
                        await getTypingsInDir(nodeModulesPath, `${packageName}${dirname ? '/' : ''}${dirname}`);
                    }
                    if (packageJson.dependencies) {
                        await getTypingsForPackages(Object.keys(packageJson.dependencies));
                    }
                }
            }
        }
    }

    async function getTypingsInDir(rootPath: string, path2: string) {
        const dts = (await fs.readdir(`${rootPath}/${path2}`));
        for (const fileName of dts) {
            if (fileName.endsWith('.d.ts')) {
                typings[`node_modules/${path2}/${fileName}`] = await fs.readFile(`${rootPath}/${path2}/${fileName}`, 'utf8');
            } else if ((await fs.lstat(`${rootPath}/${path2}/${fileName}`)).isDirectory()) {
                await getTypingsInDir(rootPath, `${path2}/${fileName}`);
            }
        }
    }

    await getTypingsForPackages(packages);

    return typings;
};