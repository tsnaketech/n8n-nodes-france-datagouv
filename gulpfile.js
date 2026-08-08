const { dest, parallel, src } = require('gulp');

function copyNodeIcons() {
	return src('nodes/**/*.{png,svg}').pipe(dest('dist/nodes'));
}

function copyNodeCodex() {
	return src('nodes/**/*.node.json').pipe(dest('dist/nodes'));
}

function copyIcons() {
	return src('icons/**/*.{png,svg}', { base: 'icons' }).pipe(dest('dist/icons'));
}

exports['build:icons'] = parallel(copyNodeIcons, copyIcons);
exports['build:assets'] = parallel(copyNodeIcons, copyNodeCodex, copyIcons);
