const gulp = require('gulp');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');

gulp.task('tsc', () =>
    tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest('dist'))
);

gulp.task('copy', () =>
    gulp.src(['yarn.lock', 'package.json'])
        .pipe(gulp.dest('./dist'))
);

gulp.task('default', gulp.parallel('tsc', 'copy'));
