// __mocks__/next/router.cjs
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