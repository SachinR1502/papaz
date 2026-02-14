// Polyfill to fix Node.js 23+ global localStorage conflict with Expo
// This file should have NO imports to ensure it runs immediately and without side effects.

if (typeof global !== 'undefined') {
    // We strictly try to delete it first
    try {
        delete (global as any).localStorage;
    } catch (e) {
        // ignore
    }

    // If undefined, we can leave it. If it behaves like the broken Node 23 getter, we need to overwrite.
    try {
        // If it still exists (delete failed) or we want to be sure:
        // We define a mock OR just undefined.
        // The key is that accessing global.localStorage should NOT throw.
        Object.defineProperty(global, 'localStorage', {
            value: {
                getItem: () => null,
                setItem: () => { },
                removeItem: () => { },
                clear: () => { },
                length: 0,
                key: () => null
            },
            writable: true,
            configurable: true
        });
    } catch (e) {
        // console.error('Polyfill define failed', e);
    }
}
