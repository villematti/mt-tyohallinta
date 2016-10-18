theApp.controller('projectReportsController', ['$scope', 'projectReport', function($scope, projectReport) {
	projectReport.endOfMonth().then(function(d) {
		$scope.response = d;
	});
}])