/* eslint-disable max-len */
const postcss = require('postcss');
const fs = require('fs');
const rimraf = require('rimraf');
const plugin = require('./');
let css = {};
const fixtures = [
    './__fixtures/source.css',
    './__fixtures/result-none.css',
    './__fixtures/result-200px.css',
    './__fixtures/result-600px.css'
];
let results = {};

const readFixture = (file) => {

    return new Promise((resolve, reject) => {
        fs.readFile(file, 'utf-8', (err, data) => {
            if (err) {
                return reject(err);
            }
            css[file] = data;
            return resolve(true);
        });
    });
};


const readResult = (file) => {
    return new Promise((resolve, reject) => {
        fs.readFile(file, 'utf-8', (err, data) => {
            if (err) {
                return reject(err);
            }
            results[file] = data;
            return resolve(true);
        });
    });
};


beforeAll(() => {
    let _promises = [];
    fixtures.forEach((file) => {
        _promises.push(readFixture(file));
    });
    return Promise.all(_promises);
});


afterEach(() => {
    results = {};
    let _promises = [];
    var _promise;
    _promise = new Promise((resolve, reject) => {
        rimraf('./__output/', (err) => {
            if (err) {
                return reject(err);
            }
            return resolve(true);
        });
    });
    _promises.push(_promise);

    _promise = new Promise((resolve, reject) => {
        rimraf('./postcss-mediaquery-writer/', (err) => {
            if (err) {
                return reject(err);
            }
            return resolve(true);
        });
    });
    _promises.push(_promise);
    return Promise.all(_promises);
});


const run = (input, optsPlugin, optsPostCss, tester) => {
    return postcss([plugin(optsPlugin)]).process(input, optsPostCss)
        .then(result => {
            return tester(result);
        });
};

// /* Write tests here
it('does return the original source', () => {
    const tester = (result) => {
        expect(result.css).toEqual(css['./__fixtures/source.css']);
        expect(result.warnings().length).toBe(0);
    };
    return run(css['./__fixtures/source.css'], {
        to: './__output/css/lazy.css'
    }, {
        map: false
    }, tester);
});


it('does extract the mediaqueries to files', () => {
    const tester = () => {
        var _promises = [];
        _promises.push(readResult('./__output/css/lazy.css'));
        _promises.push(readResult('./__output/css/lazy-1.css'));
        _promises.push(readResult('./__output/css/lazy-2.css'));
        return Promise.all(_promises).then(() => {
            expect(css['./__fixtures/result-none.css']).toEqual(results['./__output/css/lazy.css']);
            expect(css['./__fixtures/result-200px.css']).toEqual(results['./__output/css/lazy-2.css']);
            expect(css['./__fixtures/result-600px.css']).toEqual(results['./__output/css/lazy-1.css']);
        });
    };
    return run(css['./__fixtures/source.css'], {
        to: './__output/css/lazy.css'
    }, {
        map: false
    }, tester);
});


it('does extract the mediaqueries to default filenames if there is not "to" option ', () => {
    const tester = () => {
        var _promises = [];
        _promises.push(readResult('./postcss-mediaquery-writer/postcss-mediaquery-writer.css'));
        _promises.push(readResult('./postcss-mediaquery-writer/postcss-mediaquery-writer-1.css'));
        _promises.push(readResult('./postcss-mediaquery-writer/postcss-mediaquery-writer-2.css'));
        return Promise.all(_promises).then(() => {
            expect(css['./__fixtures/result-none.css']).toEqual(results['./postcss-mediaquery-writer/postcss-mediaquery-writer.css']);
            expect(css['./__fixtures/result-200px.css']).toEqual(results['./postcss-mediaquery-writer/postcss-mediaquery-writer-2.css']);
            expect(css['./__fixtures/result-600px.css']).toEqual(results['./postcss-mediaquery-writer/postcss-mediaquery-writer-1.css']);
        });
    };
    return run(css['./__fixtures/source.css'], {}, {
        map: false
    }, tester);
});


it('does write the mediaqueries to descriptive files', () => {
    const tester = () => {
        var _promises = [];
        _promises.push(readResult('./__output/css/lazy-none.css'));
        _promises.push(readResult('./__output/css/lazy-(max-width 200px).css'));
        _promises.push(readResult('./__output/css/lazy-(max-width 600px).css'));
        return Promise.all(_promises).then(() => {
            expect(css['./__fixtures/result-none.css']).toEqual(results['./__output/css/lazy-none.css']);
            expect(css['./__fixtures/result-200px.css']).toEqual(results['./__output/css/lazy-(max-width 200px).css']);
            expect(css['./__fixtures/result-600px.css']).toEqual(results['./__output/css/lazy-(max-width 600px).css']);
        });
    };
    return run(css['./__fixtures/source.css'], {
        to: './__output/css/lazy.css',
        descriptive: true
    }, {
        map: false
    }, tester);
});


it('does extract the mediaqueries to files and add a banner', () => {
    const tester = () => {
        var _promises = [];
        _promises.push(readResult('./__output/css/lazy.css'));
        _promises.push(readResult('./__output/css/lazy-1.css'));
        _promises.push(readResult('./__output/css/lazy-2.css'));
        return Promise.all(_promises).then(() => {
            expect('/*mybanner*/' + css['./__fixtures/result-none.css']).toEqual(results['./__output/css/lazy.css']);
            expect('/*mybanner*/' + css['./__fixtures/result-200px.css']).toEqual(results['./__output/css/lazy-2.css']);
            expect('/*mybanner*/' + css['./__fixtures/result-600px.css']).toEqual(results['./__output/css/lazy-1.css']);
        });
    };
    return run(css['./__fixtures/source.css'], {
        to: './__output/css/lazy.css',
        banner: '/*mybanner*/'
    }, {
        map: false
    }, tester);
});

