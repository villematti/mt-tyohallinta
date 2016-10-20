theApp.controller('projectReportsController', ['$http', '$scope', 'projectReport',
	function($http, $scope, projectReport) {
	$scope.response = {};
	$scope.totalHours = 0;
	$scope.totalMachineTime = 0;

	$scope.exportReady = false;

	projectReport.endOfMonth().then(function(d) {
		$scope.response = d;

		var projectKeys = Object.keys(d);

		projectKeys.map(function(key) {
			$scope.totalHours += d[key].hours;
			$scope.totalMachineTime += d[key].machineTime;
		})
	});

	$scope.exportReportsToCsv = function() {
		

		var fields = [
			'Nimi',
			'Tunnit', 
			'Yksinkäynti'
		];

		var fieldData = [];

		var timeOptions = {hour12: false}

		Object.keys($scope.response).map(function(data) {
			fieldData.push({
				"Nimi": $scope.response[data].displayName,
				"Tunnit": $scope.response[data].hours,
				"Yksinkäynti": $scope.response[data].machineTime
			})
		});

		$http.post('/api/export/tasks', {data: {data: fieldData, fields: fields, del: ';'}, 
			headers: {'Content-Type': 'application/json', 'charset':'utf8'}})
			.success(function(result) {
				if(result.success) {
					$scope.exportReady = true;
					$scope.exportMessage = result.message;
				}
			})
	}
}])