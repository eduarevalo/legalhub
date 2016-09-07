var replaceAll = function (replaceThis, withThis, inThis) {
    withThis = withThis.replace(/\$/g,"$$$$");
    return inThis.replace(new RegExp(replaceThis.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|<>\-\&])/g,"\\$&"),"g"), withThis);
};

if (typeof (exports) !== "undefined") {
    if (typeof (module) !== "undefined" && module.exports) {
        exports = module.exports = replaceAll;
    }
    exports.replaceAll = replaceAll;
}