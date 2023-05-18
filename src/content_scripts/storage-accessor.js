const createStorageAccessor = (storage, functions) => {
    const StorageAccessor = {
        storage: storage,
        _msg(f, p) {
            return new Promise((resolve, reject) => {
                chrome.runtime.sendMessage(
                    {
                        event: MIRI_EVENTS.STORAGE_ACCESS,
                        storage: this.storage,
                        func: f,
                        params: p 
                    },
                    (response) => {
                        if (response.success) {
                            resolve(response.ret);
                        }
                        else {
                            const error = response.error.replace('storages[storage][func]', `StorageAccessor.${f}.${this.storage}`);
                            reject(error);
                        }
                    }
                );
            });
        },
    };

    functions.forEach(f => {
        StorageAccessor[f] = (...args)=>{ return StorageAccessor._msg(f, args); }
    });

    return StorageAccessor;
}


const FilterStorage = createStorageAccessor('filter', ['has', 'add', 'delete']);
const SelectorStorage = createStorageAccessor('selector', ['has', 'get', 'add', 'delete']);
const SettingStorage = createStorageAccessor('setting', ['get', 'set']);
const TokenStorage = createStorageAccessor('token', ['has', 'add', 'get', 'clear']);