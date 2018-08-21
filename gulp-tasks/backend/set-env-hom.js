module.exports = function (gulp, plugins) {
    return function (callback) {
        ENV = 'test'; MONGODB_CONFIG = 'D:\\kb\\mongodb\\mongod.conf'; MONGODB_PATH_DB = 'D:\\kb\\mongodb\\db'; callback();        
    };
};
