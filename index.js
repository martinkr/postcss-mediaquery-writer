const postcss = require('postcss');
const sanitize = require('sanitize-filename');
const fs = require('fs');
const path = require('path');

/**
 * Checks if the givenstring is a directory
 * @param {String} what check if this is an directory
 * @return {Bool} boolean indicating if this is a directory
 */
const _isDir = (what) => {
    try {
        // eslint-disable-next-line no-sync
        return fs.lstatSync(what).isDirectory();
    } catch (err) {
        return false;
    }
};

/**
 * Ensures the given path is an avialable directory structure
 * @param {Array} directories the directory structure as array
 * @param {Number} [depth] the current depth - used for recursion
 * @return {*} a valid directory structure
 */
const _ensureDirectories = (directories, depth) => {
    // eslint-disable-next-line no-magic-numbers
    let _depth = depth || 0;
    // eslint-disable-next-line no-magic-numbers
    let _subDir = directories.slice(0, _depth + 1).join(path.sep);

    // check and enforcethis depth to be a directory
    if ( !_isDir(_subDir) && _subDir) {
        // eslint-disable-next-line no-sync
        fs.mkdirSync(_subDir);
    }

    // recurison if there we're not done yet
    if (directories.length >= ++_depth) {
        return _ensureDirectories(directories, _depth);
    }
    return true;
};

/**
 * Creates the output file name identifer
 * @param {Bool} descriptive use a descriptive filename (default: false)
 * @param {String} mediaquery the current mediaquery
 * @param {Number} index the current _index
 * @return {String} the file name _identifier
 */
const _getFileId = (descriptive, mediaquery, index) => {
    if (descriptive) {
        return `-${sanitize(mediaquery)}`;
    }
    if (!descriptive && mediaquery === 'none') {
        return '';
    }
    return `-${index}`;
};


/**
 * Creates the promsie to write a file
 * @param {Object} item the output object, a collection of the css to write
 * @param {Object} opts options
 * @return {Promise} a promise of the written file
 */
const _createPromise = (item, opts) => {

    return new Promise((resolve, reject) => {
        let _base;
        let _path;
        let _directories;
        let _file;
        let _content;
        let _identifier;
        let _item;


        opts.count++;
        // clone
        _item = Object.assign({}, item);

        // calculate filename and directory
        _base = path.parse(opts.toBase);
        if (_base.ext === '') {
            _base.dir += `/${_base.name}`;
            _base.name = opts.defaultName;
        }
        _path = path.join(__dirname, _base.dir);
        _identifier = _getFileId(opts.descriptive, _item.mq, opts.count);
        _file = `${_base.name}${_identifier}.css`;

        // recursion for creating directories
        _directories = path.normalize(_path).split(path.sep);
        _ensureDirectories(_directories);

        // calculate content
        _content = _item.rules.join('\n');
        if (opts.compress) {
            _content = _content.replace(/\s/g, '');
        }
        _content = `${opts.banner}/*!mq|${_item.mq}*/${_content}`;

        // write file
        return fs.writeFile(path.join(_path, _file), _content, err => {
            if (err) {
                return reject(err);
            }
            return resolve(true);
        });

    });

};


module.exports = postcss.plugin('postcss-mediaquery-writer', opts => {

    opts = opts || {};
    opts.defaultName = 'postcss-mediaquery-writer';
    opts.toBase = opts.to || opts.defaultName;
    opts.compress = opts.compress || true;
    // opts.maps = opts.maps || true;
    opts.banner = opts.banner || '';
    opts.descriptive = opts.descriptive || false;
    opts.count = 0;


    // Work with options here
    return function _plugin(root /* , result */ ) {
        let _output = {};
        let _promises = [];
        let _root = root.clone();

        // extract all mediaqueries and store them at the output object
        _root.walkAtRules('media', mq => {
            if (!_output[mq.params]) {
                _output[mq.params] = {
                    rules: [],
                    mq: mq.params
                };
            }
            mq.walkRules(rule => {
                _output[mq.params].rules.push(rule.toString());
            });
            mq.remove();
        });

        // handle remaining styles
        _output.none = {
            rules: [_root.toString()],
            mq: 'none'
        };

        // write new files
        Object.keys(_output).forEach((key) => {
            _promises.push(_createPromise(_output[key], opts));
        });

        // return Promise.all(_promises).then(() => root);
        return Promise.all(_promises);

    };
});
