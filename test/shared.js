var path = require('path'),
    fs = require('fs'),
    shared = {};

shared.pkgFilePath = path.join(__dirname, 'packageFiles');

shared.pkgFiles = {
    NPM: path.join(shared.pkgFilePath, 'npmBower.json'),
    Bower: path.join(shared.pkgFilePath, 'npmBower.json'),
    Atmosphere: path.join(shared.pkgFilePath, 'atmosphere')
};

shared.getAtmosphereDeps = (path) => {
    return fs.readFileSync(path).toString().split('\n');
};

shared.atmospherePkg = shared.getAtmosphereDeps(shared.pkgFiles.Atmosphere)[0];

shared.getNPMBowerDeps = (opt) => {
    var deps = [],
        pkgJSON = require(opt.path),
        getAllDeps = !opt.dependencies && !opt.devDependencies;

    if (getAllDeps || opt.dependencies) {
        Array.prototype.push.apply(deps, Object.keys(pkgJSON.dependencies));
    }

    if (getAllDeps || opt.devDependencies) {
        Array.prototype.push.apply(deps, Object.keys(pkgJSON.devDependencies));
    }

    return deps;
};

shared.npmBowerPkg = shared.getNPMBowerDeps({path: shared.pkgFiles.NPM})[0];

module.exports = shared;