import fs from 'fs-extra';
import path from 'path';

export async function getDts({ nodeModulesPath, packages }: { nodeModulesPath: string; packages: string[] }) {
    const typings: { [key: string]: string } = {};
    const parsedPackages: { [key: string]: boolean } = {};

    async function getTypingsForPackages(packages: string[] = []) {
        for (const packageName of packages) {
            if (!parsedPackages[packageName]) {
                parsedPackages[packageName] = true;
                const packagePath = `${nodeModulesPath}/${packageName}/package.json`;
                const packageExists = await fs.pathExists(packagePath);
                if (packageExists) {
                    const packageJson = await fs.readJSON(packagePath);
                    const types = packageJson.typings || packageJson.types;
                    if (types) {
                        typings[`node_modules/${packageName}/package.json`] = JSON.stringify({ name: packageJson.name, types });
                        const dirname = path.dirname(types) === '.' ? '' : path.dirname(types);
                        await getTypingsInDir(`${packageName}${dirname ? '/' : ''}${dirname}`);
                    }
                    if (packageJson.dependencies) {
                        await getTypingsForPackages(Object.keys(packageJson.dependencies));
                    }
                }
            }
        }
    }

    async function getTypingsInDir(path: string) {
        const dts = (await fs.readdir(`${nodeModulesPath}/${path}`));
        for (const fileName of dts) {
            if (fileName.endsWith('.d.ts')) {
                typings[`node_modules/${path}/${fileName}`] = await fs.readFile(`${nodeModulesPath}/${path}/${fileName}`, 'utf8');
            } else if ((await fs.lstat(`${nodeModulesPath}/${path}/${fileName}`)).isDirectory()) {
                await getTypingsInDir(`${path}/${fileName}`);
            }
        }
    }

    await getTypingsForPackages(packages);

    return typings;
};