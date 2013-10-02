var serviceUrl = 'http://localhost:9292';

var daggerApp = angular.module('daggerApp', []);

var httpErrorHandler = function($scope) {
    return function() {
	var msg = 'Unable to connect to a dagger middleware at ' + serviceUrl + '.' +
	    ' Please ensure the dagger middleware is running and check that it is' +
	    ' visible from your computer.';
	$scope.error = {message: msg, hasError: true};
    };
};

var goGet = function($http, $scope, path, dataVar, after) {
    $http.jsonp(serviceUrl + path + '?callback=JSON_CALLBACK')
	.error(httpErrorHandler($scope))
	.success(function(data) {
	    $scope.error = {hasError: false};
	    $scope[dataVar] = data;

	    if (after) {
		after(data);
	    }
	});
};

daggerApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
	when('/summary', {templateUrl: 'partials/summary.html', controller: 'summaryCtrl'}).
	when('/breakdown', {templateUrl: 'partials/breakdown.html', controller: 'breakdownCtrl'}).
	when('/status', {templateUrl: 'partials/status.html', controller: 'statusCtrl'}).
	otherwise({redirectTo: '/summary'});
}]);

daggerApp.controller('summaryCtrl', function($scope, $http) {
    goGet($http, $scope, '/tallies', 'tallies', function(data) {

	// KPI History Chart
	nv.addGraph(function() {
	    var chart = nv.models.lineChart();
	    
	    chart.xAxis
		.axisLabel('Date')
		.tickFormat(function(d) {
		    return d3.time.format('%x')(new Date(d))
		});

	    chart.yAxis
		.axisLabel('# of publications')
		.tickFormat(d3.format(',r'));
	    
	    d3.select('#kpi-history-chart svg')
		.datum(data.series)
		.transition().duration(500)
		.call(chart);
	    
	    nv.utils.windowResize(function() { 
		d3.select('#kpi-history-chart svg').call(chart);
	    });	    
	});

    });
});

daggerApp.controller('breakdownCtrl', function($scope, $http) {
});

daggerApp.controller('statusCtrl', function($scope, $http) {
    goGet($http, $scope, '/collections', 'collections');
});

daggerApp.controller('brandingCtrl', function($scope, $http) {
    goGet($http, $scope, '/branding', 'branding');
});
