/*
 * Gulpfile
 * Author: Mattijs Bliek
 *
 * IMPORTANT:
 * Gulp needs to be installed globally on your system before
 * you're able to run tasks. This can be done by running:
 * `npm install -g gulp`
 *
 * -------------------------------------------------------------
 *
 * COMMANDS:
 *
 * Generate a build for an environment:
 * `gulp`
 *
 * Arguments:
 * --e=environment (development|staging|production)
 * --skipImages (don't build compressed images)
 *
 * Generate images for an environment:
 * `gulp images`
 *
 * Watch files and run a server (use for development only):
 * `gulp watch`
 *
 * -------------------------------------------------------------
 */

var gulp            = require('gulp'),
	gulpLoadPlugins = require('gulp-load-plugins'),
	$               = gulpLoadPlugins(),
	jshintStylish   = require('jshint-stylish'),
	pxtorem         = require('postcss-pxtorem'),
	autoprefixer    = require('autoprefixer-core'),
	browserSync     = require('browser-sync'),
	mainBowerFiles  = require('main-bower-files'),
    browserify      = require('browserify'),
    babelify        = require('babelify'),
    watchify        = require('watchify'),
    source          = require('vinyl-source-stream'),
    buffer          = require('vinyl-buffer'),
	assign          = require('lodash.assign'),
	argv            = require('yargs').argv,
	sh              = require('sync-exec'),
	path            = require('path'),
	eventStream     = require('event-stream');

var semver;
var paths = {};
var ENV = argv.e ? argv.e : 'development';

function handleError(error, emitEnd) {
	if (typeof(emitEnd) === 'undefined') {
		emitEnd = true;
	}
	$.util.beep();
	$.util.log($.util.colors.white.bgRed('Error!'), $.util.colors.red(error.toString()));
	if (emitEnd) {
		this.emit('end');
	}
}

function getShellOutput(command) {
	result = sh(command);
	if (result.stderr) {
		handleError('Error getting shell output: ' + result.stderr);
		$.util.beep();
	}
	// Do a replace because of newline in shell output
	return result.stdout.replace(/\s?$/, '');
}

function getConfigValue(value) {
	if (!value) {
		handleError('Can\'t get undefined config value');
		return;
	}
	var command = 'php ' + __dirname + '/vendor/grrr-amsterdam/garp3/scripts/garp.php config get ' +
		value + ' --e=' + ENV;
	return getShellOutput(command);
}

function constructPaths() {
	paths.public      = 'public';

	paths.js          = paths.public + '/js';
	paths.jsSrc       = paths.js     + '/src';
	paths.jsBuild     = paths.public + getConfigValue('assets.js.root');

	paths.css         = paths.public + '/css';
	paths.cssSrc      = paths.public + getConfigValue('assets.sass.root');
	paths.cssBuild    = paths.public + getConfigValue('assets.css.root');

	paths.imgSrc      = paths.css      + '/img';
	paths.imgBuild    = paths.cssBuild + '/img';
	paths.cdn         = getConfigValue('cdn.domain');
	paths.cdnCss      = getConfigValue('assets.css.root');

	return paths;
}

gulp.task('init', function() {
	semver = getShellOutput('semver');
	domain = getConfigValue('app.domain');
	cdnType  = getConfigValue('cdn.type');
	paths  = constructPaths();

	$.util.log($.util.colors.green('-----------------'));
	$.util.log($.util.colors.green('Semver: ' + semver));
	$.util.log($.util.colors.green('Environment: ' + ENV));
	$.util.log($.util.colors.green('CDN type: ' + cdnType));
	$.util.log($.util.colors.green('-----------------'));
});

gulp.task('browser-sync', function() {
	if (!domain) {
		handleError('Could not get ' + ENV + ' domain from application/configs/app.ini');
	}
	browserSync({
		proxy: domain,
		open: false,
		notify: {
			 styles: [
				"display: none",
				"padding: 15px",
				"font-family: sans-serif",
				"position: fixed",
				"font-size: 0.9em",
				"z-index: 9999",
				"right: 0px",
				"bottom: 0px",
				"border-top-left-radius: 5px",
				"background-color: rgb(27, 32, 50)",
				"margin: 0",
				"color: white",
				"text-align: center"
			]
		}
	});
});

gulp.task('sass', function() {
	var postcssOptions = {
		map: true
	};
	var processors = [
        autoprefixer({
            browsers: ['last 3 versions', 'safari 5', 'ie 9', 'opera 12.1']
        }),
        pxtorem({
			root_value: 10,
			unit_precision: 5,
			prop_white_list: [
				'font',
				'font-size',
			],
			replace: false,
			media_query: false
        })
    ];

	$.util.log($.util.colors.green('Building css to ' + paths.cssBuild));
	return gulp.src([paths.cssSrc + '/base.scss'])
		.pipe($.plumber({ errorHandler: handleError }))
		.pipe($.sass().on('error', $.sass.logError))
		.pipe($.postcss(processors))
		// .pipe($.if(ENV !== 'development' && cdnType !== 'local', $.cssUrlAdjuster({
		// 	// hacky slashes are necessary because one slash is stripped by $.cssUrlAdjuster
		// 	prepend: 'http:///' + paths.cdn + paths.cdnCss + '/',
		// 	append: '?v=' + semver
		// })))
		.pipe($.if(ENV !== 'development', $.minifyCss()))
		.pipe(gulp.dest(paths.cssBuild))
		.pipe(browserSync.reload({stream:true}))
	;
});

gulp.task('sass-cms', function() {
	return gulp.src([paths.cssSrc + '/cms.scss', paths.cssSrc + '/cms-wysiwyg.scss'])
		.pipe($.sass({
			onError: function(err) {
				handleError(err.message + ' => ' + err.file + ':' + err.line, false);
			}
		}))
		.pipe($.if(ENV !== 'development', $.minifyCss()))
		.pipe(gulp.dest(paths.cssBuild))
	;
});

gulp.task('sass-ie', function() {
	return gulp.src(paths.cssSrc + '/ie-old.scss')
		.pipe($.sass({
			onError: function(err) {
				handleError(err.message + ' => ' + err.file + ':' + err.line, false);
			}
		}).on('error', $.sass.logError))
		.pipe($.if(ENV !== 'development', $.minifyCss()))
		.pipe(gulp.dest(paths.cssBuild))
	;
});

gulp.task('scss-lint', function() {
	var scssLintOutput = function(file, stream) {
		if (!file.scsslint.success) {
			$.util.log($.util.colors.gray('-----------------'));
			$.util.log($.util.colors.green(file.scsslint.issues.length) + ' scss-lint issue(s) found:');
			file.scsslint.issues.forEach(function(issue) {
				$.util.colors.underline(file.path);
				$.util.log($.util.colors.green(issue.reason) + ' => ' + $.util.colors.underline(file.path) + ':' + issue.line);
			});
			$.util.log($.util.colors.gray('-----------------'));
		}
	};
	return gulp.src(paths.cssSrc + '/**/*.scss')
		.pipe($.scssLint({
			'config': __dirname + '/.scss-lint.yml',
			'customReport': scssLintOutput
		}).on('error', $.sass.logError))
	;
});


gulp.task('javascript', function () {
	$.util.log($.util.colors.green('Building js to ' + paths.jsBuild));

	// set up the browserify instance on a task basis
	var b = browserify({
		entries: paths.jsSrc + '/main.js'
		// defining transforms here will avoid crashing your stream
	});

	return b
		.transform(babelify, { presets: ["es2015"] } ).on('error', handleError)
		.bundle().on('error', handleError)
        .pipe(source('main.js'))
		.pipe(buffer())
		.pipe($.if(ENV === 'development', $.sourcemaps.init()))
		.pipe($.if(ENV !== 'development', $.uglify())).on('error', handleError)
		.pipe($.if(ENV === 'development', $.sourcemaps.write()))
		.pipe(gulp.dest(paths.jsBuild))
    .pipe(browserSync.stream({once: true}))
});

gulp.task('javascript-cms', function() {
	return gulp.src(require('./public/js/garp/cmsBuildStack.js').stack)
		.pipe($.concat('cms.js'))
		.pipe($.if(ENV !== 'development', $.uglify())).on('error', handleError)
		.pipe(gulp.dest(paths.jsBuild))
	;
});

gulp.task('javascript-models', function() {
	return gulp.src([
		paths.jsSrc + '/../garp/models/*.js',
		paths.jsSrc + '/../models/*.js',
	])
		.pipe($.concat('extended-models.js'))
		.pipe($.uglify()).on('error', handleError)
		.pipe(gulp.dest(paths.jsBuild))
	;
});

gulp.task('jshint', function() {
	return gulp.src(paths.jsSrc + '/**/*.js')
		.pipe($.jshint('.jshintrc'))
		.pipe($.jshint.reporter('jshint-stylish'));
});

gulp.task('modernizr', ['init'], function() {
	return gulp.src(paths.jsSrc + '/modernizr.js')
		.pipe(gulp.dest(paths.jsBuild))
	;
});

gulp.task('images', ['init'], function() {
	if (argv.skipImages) {
		return;
	}
	$.util.log($.util.colors.green('Building images to ' + paths.imgBuild));
	return gulp.src(paths.imgSrc + '/*.{png,gif,jpg,svg}')
		.pipe($.imagemin({
			progressive: true,
			svgoPlugins: [{removeViewBox: false}]
		}))
		.on('error', handleError)
		.pipe(gulp.dest(paths.imgBuild))
	;
});

gulp.task('icons', ['init'], function () {
    return gulp
        .src(paths.css + '/img/icons/*.svg')
		.pipe($.svgmin(function (file) {
            var prefix = path.basename(file.relative, path.extname(file.relative));
            return {
                plugins: [{
                    cleanupIDs: {
                        prefix: prefix + '-',
                        minify: true
                    }
                }]
            }
        }).on('error', handleError))
        .pipe($.svgstore({ inlineSvg: true }).on('error', handleError))
        .pipe(gulp.dest(paths.cssBuild + '/img'));
});

gulp.task('watch', ['default', 'browser-sync'], function(cb) {
	gulp.watch([
		paths.cssSrc + '/**/*.scss',
		'!**/cms-wysiwyg.scss',
		'!**/cms.scss'
	], ['sass', 'sass-ie', 'scss-lint']);
	gulp.watch(paths.cssSrc + '/**/cms.scss', ['sass-cms']);
	gulp.watch(paths.css + '/img/icons/*.svg', ['icons']);
	gulp.watch(paths.jsSrc + '/**/*.js', ['javascript']);
	gulp.watch(paths.js + '/models/*.js', ['javascript-models']);
	gulp.watch(paths.imgSrc + '/**/*.{gif,jpg,svg,png}', ['images']);
	gulp.watch(paths.js +'/garp/*.js', ['javascript-cms']);
	gulp.watch('application/modules/default/**/*.{phtml, php}', browserSync.reload);
});

gulp.task('build', [
	'init',
	'sass-ie',
	'sass-cms',
	'sass',
	'javascript-cms',
	'javascript-models',
	'javascript',
	'images',
	'icons',
	'modernizr',
	'scss-lint',
	'jshint'
]);

gulp.task('default', ['build', 'init']);
