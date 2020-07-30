const gulp = require('gulp');
const rsync = require('gulp-rsync');

const DIST_PATH = 'dist/thermometer-webui';

require('dotenv').config();

const deploymentHost = process.env.DEPLOYMENT_HOST;
const deploymentPath = process.env.DEPLOYMENT_PATH;

gulp.task('deploy', () => 
    gulp.src(`${DIST_PATH}/**`)
        .pipe(rsync({
            hostname: deploymentHost,
            root: `${DIST_PATH}/`,
            destination: deploymentPath,
            archive: true,
            recursive: true,
            silent: false,
            compress: true,
            chmod: "ugo=rwX",
            clean: true,
        }))
);
