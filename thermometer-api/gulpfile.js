const fs = require('fs');
const gulp = require('gulp');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');
const rsync = require('gulp-rsync');
const GulpSSH = require('gulp-ssh');

const DIST_PATH = 'dist';

require('dotenv').config();

gulp.task('tsc', () =>
    tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest(DIST_PATH))
);

gulp.task('copy', () =>
    gulp.src(['yarn.lock', 'package.json', '*-firebase-adminsdk-*.json'])
        .pipe(gulp.dest(`./${DIST_PATH}`))
);

gulp.task('default', gulp.parallel('tsc', 'copy'));

// DEPLOYMENT

const deploymentHost = process.env.DEPLOYMENT_HOST;
const deploymentPath = process.env.DEPLOYMENT_PATH;
const deploymentServiceName = process.env.DEPLOYMENT_SERVICE;

const gulpSsh = new GulpSSH({
    ignoreErrors: false,
    sshConfig: {
        host: deploymentHost,
        username: process.env.DEPLOYMENT_SSH_USER,
        privateKey: fs.readFileSync(process.env.DEPLOYMENT_SSH_KEY),
    },
});

gulp.task('deploy:rsync', () => 
    gulp.src(`${DIST_PATH}/**`)
        .pipe(rsync({
            hostname: deploymentHost,
            root: `${DIST_PATH}/`,
            destination: deploymentPath,
            archive: true,
            silent: false,
            compress: true,
            chmod: "ugo=rwX",
        }))
);

gulp.task('deploy:install', () => 
    gulpSsh.shell([
        `cd ${deploymentPath}`,
        `yarn install --prod`,
    ])
);

gulp.task('deploy:restart', () => 
    gulpSsh.shell([
        'source .zshrc',
        `pm2 restart ${deploymentServiceName}`,
    ])
);

gulp.task('deploy', gulp.series([
    'deploy:rsync',
    'deploy:install',
    'deploy:restart',
]));
