'use strict';

// const del = require('del');
// const path = require('path');
const gulp = require('gulp');
// const concat = require('gulp-concat');
// const wrap = require('gulp-wrap');
// const notify = require('gulp-notify');
// const templateCache = require('gulp-angular-templatecache');
// const combiner = require('stream-combiner2').obj;
// const ngAnnotate = require('gulp-ng-annotate');
// const uglify = require('gulp-uglify');
// const useref = require('gulp-useref');
// const gulpif = require('gulp-if');
// const cssnano = require('gulp-cssnano');
// const minifyHTML = require('gulp-minify-html');
const bs = require('browser-sync').create();
const historyApiFallback = require('connect-history-api-fallback')
// const KarmaServer = require('karma').Server;
//const rename = require('gulp-rename');
//const gulpIgnore = require('gulp-ignore');

// let scripts = require('./app.scripts.json');

// let source = {
// 	html: './app/**/*.html',
// 	js: {
// 		src: [
// 			// application config
// 			'./app.config.js',

// 			// application bootstrap file
// 			'./app/main.js',

// 			// main module
// 			'./app/app.js',

// 			// module files
// 			'./app/**/module.js',

// 			// other js files [controllers, services, etc.]
// 			'./app/**/!(module)*.js',

// 			// exept test files
// 			'!./app/**/*.test.js'
// 		]
// 	},
// 	tmpl: './app/**/*.tpl.html'
// };

// let destination = './dist';

// gulp.task('clean', function(cb) {
// 	return del(destination, {force: true});
// });

// gulp.task('indexHtml:build', function(cb) {
// 	return combiner(
// 		gulp.src('./index.html'),
// 		useref(),
// 		gulpif('*.html', minifyHTML()),
// 		gulpif('*.js', uglify()),
// 		gulp.dest(destination)
// 	).on('error', notify.onError(function(err) {cb();return err;}));
// });

// gulp.task('app:concat', function(cb) {
// 	return combiner(
// 		gulp.src(source.tmpl),
// 		templateCache({root: 'app/', module: 'app'}),
// 		gulp.src(source.js.src, {passthrough: true}),
// 		wrap('(function(){\n<%= contents %>\n})();'),
// 		concat('app.js'),
// 		gulp.dest(destination)
// 	).on('error', notify.onError(function(err) {cb();return err;}));
// });

// gulp.task('vendor:concat', function(cb) {
// 	var paths = [];

// 	scripts.prebuild.forEach(function(script) {
// 		paths.push(scripts.paths[script]);
// 	});

// 	return combiner(
// 		gulp.src(paths),
// 		concat('vendor.js'),
// 		gulp.dest(destination)
// 	).on('error', notify.onError(function(err) {cb();return err;}));
// });

// gulp.task('resource', function(cb) {
// 	return combiner(
// 		gulp.src([
// 			'{plugin,smartadmin-plugin}/**/*',
// 			'sound/**/*',
// 			'styles/{fonts,img}/**/*',
// 			'app.scripts.json'
// 		], {base: '.'}),
// 		gulp.dest(destination)
// 	).on('error', notify.onError(function(err) {cb();return err;}));
// });

// gulp.task('html:minify', function(cb) {
// 	return combiner(
// 		gulp.src(source.html, {base: '.'}),
// 		minifyHTML({
// 			conditionals: true,
// 			spare: true
// 		}),
// 		gulp.dest(destination)
// 	).on('error', notify.onError(function(err) {cb();return err;}));
// });

// gulp.task('vendor:minify', gulp.series('vendor:concat', function(cb) {
// 	return combiner(
// 		gulp.src(path.join(destination, 'vendor.js')),
// 		uglify(),
// 		gulp.dest(destination)
// 	).on('error', notify.onError(function(err) {cb();return err;}));
// }));

// gulp.task('styles:minify', gulp.series('indexHtml:build', function(cb) {
// 	return combiner(
// 		gulp.src(path.join(destination, 'styles/css/vendor.css'), {base: destination}),
// 		cssnano({discardComments: {removeAll: true}}),
// 		gulp.dest(destination)
// 	).on('error', notify.onError(function(err) {cb();return err;}));
// }));

// gulp.task('app:minify', gulp.series('app:concat', function(cb) {
// 	return combiner(
// 		gulp.src(path.join(destination, 'app.js')),
// 		ngAnnotate(),
// 		uglify(),
// 		gulp.dest(destination)
// 	).on('error', notify.onError(function(err) {cb();return err;}));
// }));

// gulp.task('runKarmaServer', function (cb) {
// 	let serverInst = new KarmaServer({
// 		configFile: __dirname + '/karma.conf.js',
// 		singleRun: false
// 	}, cb);

// 	serverInst.start();
// });

gulp.task('serve', function(cb) {
	bs.init({
		browser: "google chrome",
		notify: false,
		server: {
			baseDir: './client',
			middleware: [historyApiFallback()]
		}
	}, cb);

	bs.watch('./client/**/*').on('change', bs.reload);
});

// gulp.task('watch', function(cb) {
// 	gulp.watch('index.html', gulp.series('indexHtml:build'));// index.html file
// 	gulp.watch(source.html, gulp.series('html:minify'));// custom files (html)
// 	gulp.watch([source.js.src, source.tmpl], gulp.series('app:concat'));// custom files (js)
// 	gulp.watch('styles/css/*', gulp.series('indexHtml:build'));// custom files (css)
// 	gulp.watch('app.scripts.json', gulp.parallel('vendor:concat', function moveScriptsFile() {// vendor
// 		return gulp.src('app.scripts.json')
// 			.pipe(gulp.dest(destination));
// 	}));
// 	cb();
// });

// gulp.task('default', gulp.series(
// 	'clean',
// 	gulp.parallel(
// 		'resource',
// 		'indexHtml:build',
// 		'vendor:concat',
// 		'html:minify',
// 		'app:concat'
// 	),
// 	gulp.parallel(
// 		'watch',
// 		'serve'
// 	)
// ));

// gulp.task('prod', gulp.series(
// 	'clean',
// 	gulp.parallel(
// 		'styles:minify',
// 		'app:minify',
// 		'vendor:minify',
// 		'resource',
// 		'html:minify'
// 	)
// ));

// gulp.task('test', gulp.series(
// 	function(cb) {
// 		destination = './distTest';
// 		cb();
// 	},
// 	'clean',
// 	gulp.parallel(
// 		'vendor:concat'
// 		//'app:concat'
// 	),
// 	'runKarmaServer'
// ));