let db_list = [
    {
        db_name: 'image',
        table: [
            {name: 'avatar', key: 'avatar_name'},
            {name: 'background', key: 'background_name'}
        ]
    }
]


function openDB(db_name, store_name, version = 1) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(db_name, version);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            db_list.find(item => item.db_name === db_name).table
                .forEach(table => {
                    if (!db.objectStoreNames.contains(table.name)) {
                        db.createObjectStore(table.name, {keyPath: table.key});
                    }
                });
        };
    });
}

async function withDB(db_name, store_name, mode, operation) {
    // 步骤1: 打开数据库连接
    let db = await openDB(db_name, store_name, 1);

    // 步骤3: 创建事务
    const tx = db.transaction(store_name, mode);

    // 步骤4: 获取对象存储空间并执行用户操作
    const store = tx.objectStore(store_name);
    return operation(store); // 将 store 传递给外部定义的操作函数
}

function caching_avatar(avatar_name, avatar_url) {
    fetch(avatar_url)
        .then(response => response.blob())
        .then(blob => {
            withDB('image', 'avatar', 'readwrite', store => {
                store.put({
                    avatar_name: avatar_name,
                    avatar_blob: blob,
                    expiration_time: new Date().getTime() + 7 * 24 * 60 * 60 * 1000
                });
            }).catch(error => console.error("Error caching avatar:", error));
        }).catch(error => console.error("Error fetching avatar:", error));
}

function get_cache_avatar(avatar_name) {
    return withDB('image', 'avatar', 'readonly', store => {
        return new Promise((resolve, reject) => {
            const request = store.get(avatar_name);
            request.onsuccess = () => {
                const record = request.result;
                let current_time = new Date().getTime();
                let is_expired = current_time > record?.expiration_time;
                if (record && !is_expired) {
                    resolve(URL.createObjectURL(record.avatar_blob));
                } else {
                    resolve(null);
                }
            };
            request.onerror = () => reject(request.error);
        });
    });
}

function caching_background(background_name, background_url) {
    fetch(background_url)
        .then(response => response.blob())
        .then(blob => {
            withDB('image', 'background', 'readwrite', store => {
                store.put({
                    background_name: background_name,
                    background_blob: blob,
                    expiration_time: new Date().getTime() + 7 * 24 * 60 * 60 * 1000
                });
            }).catch(error => console.error("Error caching background:", error));
        }).catch(error => console.error("Error fetching background:", error));
}

function get_cache_background(background_name) {
    return withDB('image', 'background', 'readonly', store => {
        return new Promise((resolve, reject) => {
            const request = store.get(background_name);
            request.onsuccess = () => {
                const record = request.result;
                let current_time = new Date().getTime();
                let is_expired = current_time > record?.expiration_time;
                if (record && !is_expired) {
                    resolve(URL.createObjectURL(record.background_blob));
                } else {
                    resolve(null);
                }
            };
            request.onerror = () => reject(request.error);
        });
    });
}

export {
    caching_avatar,
    get_cache_avatar,
    caching_background,
    get_cache_background
};



