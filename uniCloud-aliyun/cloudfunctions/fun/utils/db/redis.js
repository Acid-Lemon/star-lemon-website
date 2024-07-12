if (!global.hasOwnProperty("fetch")) {
	// for @vercel/kv -> @upstash/redis, it uses global fetch
    import("node-fetch").then(({default : fetch}) => { global.fetch = fetch});
}

let { createClient } = require("@vercel/kv");

const config = require("uni-config-center")({ pluginId: "fun" }).config();

const kv = createClient({
    url: config["VERCEL_STAR_LEMON_REDIS_URL"],
    token: config["VERCEL_STAR_LEMON_REDIS_TOKEN"]
});

const fields = {
    user_info: {key_prefix: "user:info:", ex: 3600 * 24}
};

module.exports = {
    kv,
    fields
}
