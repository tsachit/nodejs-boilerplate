const { series, parallel, src, dest } = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const clean = require('gulp-clean');
const cleanCSS = require(`gulp-clean-css`);

const srcPath = 'public';
const jsPath = `${srcPath}/javascripts`;
const cssPath = `${srcPath}/stylesheets`;
const imagePath = `${srcPath}/images`;

const distPath = 'build';
const distTempPath = `${distPath}/temp`;
const jsOutputPath = `${distPath}/javascripts`;
const cssOutputPath = `${distPath}/stylesheets`;
const imageOutputPath = `${distPath}/images`;

const transpileJS = () => src(`${jsPath}/*.js`)
  .pipe(babel())
  .pipe(dest(distTempPath));

const minifyJS = () => src(`${distTempPath}/*.js`)
  .pipe(uglify())
  .pipe(rename({ extname: '.js' }))
  .pipe(dest(jsOutputPath));

const cleanTranspiledJS = () =>src(distTempPath, {read: false})
  .pipe(clean());

const minifyCSS = () => src(`${cssPath}/*.css`)
  .pipe(cleanCSS())
  .pipe(rename({ extname: '.css' }))
  .pipe(dest(cssOutputPath));

// Images (since some css like font awesome requires images)
const copyImages = () => src([`${imagePath}/*`])
  .pipe(dest(imageOutputPath));

exports.default = parallel(series(transpileJS, minifyJS, cleanTranspiledJS), minifyCSS, copyImages);