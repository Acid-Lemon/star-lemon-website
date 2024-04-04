module.exports = () => {
    return async function (ctx, next) {
        await next();
    }
}
