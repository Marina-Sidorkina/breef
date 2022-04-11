const { src, dest, parallel, series, watch } = require("gulp");
const browsersync = require("browser-sync").create();
const concat = require("gulp-concat");
const sourcemaps = require("gulp-sourcemaps");
const sass = require("gulp-sass")(require('sass'));
const autoprefixer = require("gulp-autoprefixer");
const cleancss = require("gulp-clean-css");
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");
const del = require("del");

// Server

function server() {
    browsersync.init({
        server: { baseDir: "source/" },
        notify: false,
        online: true
    })
}

// Styles

function styles() {
    return src("source/sass/index.scss")
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(concat("index.min.css"))
        .pipe(autoprefixer({
            overrideBrowserslist: ["last 3 versions"],
            grid: true
        }))
        .pipe(cleancss({
            level: {
                1: {
                    specialComments: 0
                }
            }
        }))
        .pipe(sourcemaps.write("."))
        .pipe(dest("source/css/"))
        .pipe(browsersync.stream())
}

// Images

function images() {
    return src("source/media/src/**/*")
        .pipe(newer("source/media/dest/"))
        .pipe(imagemin([
            imagemin.mozjpeg({ progressive: true }),
            imagemin.optipng({ optimizationLevel: 3 })
        ]))
        .pipe(dest("source/media/dest/"))
}

function deleteImages() {
    return del("source/media/dest/**/*", { force: true })
}

// Build

function build() {
    return src([
        "source/css/**/*.min.css",
        "source/media/dest/**/*",
        "source/**/*.html",
    ], { base: "source" })
        .pipe(dest("build"))
}

function deleteBuild() {
    return del("build/**/*", { force: true })
}

// Watcher

function watcher() {
    watch("source/**/sass/**/*", styles);
    watch("source/**/*.html").on("change", browsersync.reload);
    watch("source/media/src/**/*", images);
}

// Tasks

exports.build = series(deleteBuild, styles, deleteImages, images, build);
exports.default = series(parallel(styles, images), parallel(server, watcher));
