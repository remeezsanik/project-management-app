// __mocks__/next/router.cjs
console.log('Mocking next/router');
module.exports = {
    useRouter: jest.fn(() => ({
        query: {},
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn().mockResolvedValue(undefined),
        pathname: '/',
        asPath: '/',
    })),
};