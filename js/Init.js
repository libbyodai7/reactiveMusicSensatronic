
// Extending modules: http://www.bennadel.com/blog/2320-extending-classes-in-a-modular-javascript-application-architecture-using-requirejs.htm

requirejs.config({

	//By default load any module IDs from js/lib
	baseUrl: './js/',
	paths: {},
	generateSourceMaps: false,
	preserveLicenseComments: false,
	useStrict: true,
	urlArgs: "bust=" + (new Date()).getTime()
});

require(['utils/DomReady', 'app/Main'], function (DomReady, Main) {
	DomReady(
		function() {
			window.app = new Main();
		}
	);
});