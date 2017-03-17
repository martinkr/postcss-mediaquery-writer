# PostCSS MediaQuery Writer [![Build Status][ci-img]][ci]

[PostCSS] plugin to extract mediaqueries.
This helps to minimize render blocking css. Because the browser downloads only the css files in a blocking manner whose mediaqueries applies.
See: [https://developers.google.com/web/fundamentals/performance/critical-rendering-path/render-blocking-css]

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/martinkr/postcss-mediaquery-extract.svg
[ci]:      https://travis-ci.org/martinkr/postcss-mediaquery-extract

## Example

### Input
```css
.foo {
    background: red;
}
@media (max-width: 200px) {
    .foo {
        background: green;
    }
}

@media (max-width: 600px) {
    .foo {
        background: blue;
    }
}
```


### Result
#### foo.css
```css
/*!mq|none*/.foo{background:red}
```

#### foo-1.css
```css
/*!mq|(max-width: 200px)*/.foo{background:green}
```

#### foo-2.css
```css
/*!mq|(max-width: 600px)*/.foo{background:blue}
```

## Options
- banner: add a custom banner to the generated files
- descriptive: make the mediaquery part of the filename
- to: specify the youtput directory / filename

## Usage

```js
postcss([ require('postcss-mediaquery-writer') ])
```

## Disclaimer
Currently the generated files have no support for sourcemaps :(

See [PostCSS] docs for examples for your environment.
