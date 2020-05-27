let projectFolder = require("path").basename(__dirname);
let sourceFolder = '#src';
let path = {
      build:{
        html: projectFolder + "/",
        css: projectFolder + "/css/",
        js: projectFolder + "/js/",
        img: projectFolder + "/img/",
        fonts: projectFolder + "/fonts/",
      },
      src:{
        html: [sourceFolder + "/*.html", "!" + sourceFolder + "/_*.html"],
        css: sourceFolder + "/sass/style.sass",
        js: sourceFolder + "/js/script.js",
        img: sourceFolder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts: sourceFolder + "/fonts/*.ttf",
      },
      watch:{
        html: sourceFolder + "/**/*.html",
        css: sourceFolder + "/sass/**/*.sass",
        js: sourceFolder + "/js/**/*.js",
        img: sourceFolder + "/img/**/*.{jpg,png,svg,gif,ico,webp}"
      },
      clean: "./" + projectFolder + "/"
    };


    let { src,dest } = require("gulp"),
        gulp = require("gulp"),
        browsersync = require("browser-sync").create(),
        fileinclude = require("gulp-file-include"),
        del = require("del"),
        sass = require("gulp-sass"),
        autoprefixer = require("gulp-autoprefixer"),
        groupMedia = require("gulp-group-css-media-queries"),
        cleanCss = require("gulp-clean-css"),
        rename = require("gulp-rename"),
        uglify = require("gulp-uglify-es").default,
        imagemin = require("gulp-imagemin"),
        webp = require("gulp-webp"),
        webpHtml = require("gulp-webp-html"),
        ttf2woff = require("gulp-ttf2woff"),
        ttf2woff2 = require("gulp-ttf2woff2"),
        webpCss = require("gulp-webpcss");

function browserSync(params) {
  browsersync.init({
    server:{
      baseDir: "./" + projectFolder + "/"
    },
    port: 3000,
    notify: false
  });
}

function html(){
  return src(path.src.html)
    .pipe(fileinclude())
    // .pipe(webpHtml())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream());
}

function css() {
  return src(path.src.css)
    .pipe(
      sass({
        outputStyle: "expanded"
      })
    )
    .pipe(
      groupMedia()
    )
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 5 versions"],
        cascade: true
      })
    )
    // .pipe(webpCss(
    //   {webpClass: '.webp',noWebpClass: '.no-webp'}
    // ))
    .pipe(dest(path.build.css))
    .pipe(cleanCss())
    .pipe(
      rename({
        extname: ".min.css"
      })
    )
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream());
}

function js(){
  return src(path.src.js)
    .pipe(fileinclude())
    .pipe(dest(path.build.js))
    .pipe(
      uglify()
    ) 
    .pipe(
      rename({
        extname: ".min.js"
      })
    )
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream());
}

function images() {
  return src(path.src.img)
  // .pipe(
  //   webp({
  //     quality: 70
  //   })
  // )
  .pipe(dest(path.build.img))
  .pipe(src(path.src.img))
  .pipe(
    imagemin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      interlaced: true,
      optimizationLevel: 3
    })
  )
  .pipe(dest(path.build.img))
  .pipe(browsersync.stream());
}

function fonts(){
  src(path.src.fonts)
  .pipe(dest(path.build.fonts));
  src(path.src.fonts)
  .pipe(ttf2woff())
  .pipe(dest(path.build.fonts));
  return src(path.src.fonts)
    .pipe(ttf2woff2())
    .pipe(dest(path.build.fonts));
}


function watchFiles(params) {
  gulp.watch([path.watch.html],html);
  gulp.watch([path.watch.css],css);
  gulp.watch([path.watch.js],js);
  gulp.watch([path.watch.img],images);
}

function clean(params) {
  return del(path.clean);
}

function norm(params) {
  return src('#src/css/**/*.css')
  .pipe(dest(path.build.css));
}

let build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts, norm));
let watch = gulp.parallel(build,watchFiles,browserSync);


exports.norm = norm;
exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;