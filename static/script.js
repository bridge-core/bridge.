const x = (function(){ //Import

})();
const y = (function(x){ //Import

})(x);

(function(x, y){ //Main
    let engine = server.getScriptingEngine(0, 0);
})(x, y);