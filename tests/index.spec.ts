import { getDts } from '../src';

beforeEach(() => {
});

beforeAll(async () => {
});

afterAll(async () => {
});

beforeEach(async () => {
});

it('extracts type definition files', async () => {
    const result = await getDts({
        nodeModulesPath: './node_modules',
        packages: ['xlstream'],
    });

    expect(result).toMatchSnapshot();
});