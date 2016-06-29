theApp.controller('usersTasksController', ['$scope', '$http', '$log', 'store', 
	function($scope, $http, $log, store) {

	$scope.tasks = '';

	function getTasks() {
		$http.get('/api/tasks/user' + store.get('userid'))
			.success(function(results) {
				$scope.tasks = results;
		});
	}

	getTasks();

}]);

theApp.controller('allTasksController', ['$scope', '$http', '$log', 'store', 
	function($scope, $http, $log, store) {

	$scope.tasks = [];

	$scope.startDate = new Date();
	$scope.endDate = new Date();

	$scope.selectedUser = 0;

	$scope.notFound = false;

	$scope.totalHours = 0;
	$scope.totalMachineTime = 0;
	$scope.totalBigVisits = 0;
	$scope.totalDirtyWork = 0;

	$scope.getTasksOnTime = function() {
		$scope.exportReady = false;
		$http.post('/api/tasks/all', { 
				userId: $scope.selectedUser,
				startDate: Date.parse($scope.startDate), 
				endDate: Date.parse($scope.endDate) 
			})
			.success(function(results) {
				$scope.tasks = results;
				$log.info(results);
				if($scope.tasks.length === 0) {
					$scope.notFound = true;
				} else {
					$scope.notFound = false;

					// Calculate totals
					var totalHours = 0;
					var totalMachineTime = 0;
					var totalBigVisits = 0;
					var totalDirtyWork = 0;

					for(var i = 0; i < $scope.tasks.length; i++) {

						totalHours += $scope.tasks[i].hours;
						totalMachineTime += $scope.tasks[i].machineTime;
						totalDirtyWork += $scope.tasks[i].dirtyWork;

						if($scope.tasks[i].bigVisit) {
							totalBigVisits++;
						}
					}

					$scope.totalHours = totalHours;
					$scope.totalMachineTime = totalMachineTime;
					$scope.totalBigVisits = totalBigVisits;
					$scope.totalDirtyWork = totalDirtyWork;
				}
		});
	}

	$scope.users = {};

	function getAllUsers() {
		$http.get('/api/users')
			.success(function(result){
				$scope.users = result;
			})
	}

	getAllUsers();

	// Export to CSV
	$scope.exportToCsv = function() {

		$scope.exportReady = false;

		var fields = ['Start Time', 'End Time', 'Hours', 'Project name', 'Username', 'Big Visit', 'Dirty Work', 'Machine Time'];

		var fieldData = [];

		var timeOptions = {hour12: false}

		for(var i=0;i < $scope.tasks.length;i++) {
			if($scope.tasks[i].bigVisit) {
				fieldData[i] = {
					"Start Time": new Date($scope.tasks[i].createdAt).toLocaleString('fi-FI', timeOptions),
					"End Time": new Date($scope.tasks[i].endedAt).toLocaleString('fi-FI', timeOptions),
					"Hours": $scope.tasks[i].hours,
					"Project name": $scope.tasks[i].projectId.name,
					"Username": $scope.tasks[i].userId.name,
					"Big Visit": 1,
					"Dirty Work": $scope.tasks[i].dirtyWork,
					"Machine Time": $scope.tasks[i].machineTime
				}
			} else {
				fieldData[i] = {
					"Start Time": new Date($scope.tasks[i].createdAt).toLocaleString('fi-FI', timeOptions),
					"End Time": new Date($scope.tasks[i].endedAt).toLocaleString('fi-FI', timeOptions),
					"Hours": $scope.tasks[i].hours,
					"Project name": $scope.tasks[i].projectId.name,
					"Username": $scope.tasks[i].userId.name,
					"Big Visit": 0,
					"Dirty Work": $scope.tasks[i].dirtyWork,
					"Machine Time": $scope.tasks[i].machineTime
				}
			}
		}

		$http.post('/api/export/tasks', {data: {data: fieldData, fields: fields, del: ';'}})
			.success(function(result) {
				if(result.success) {
					$scope.exportReady = true;
				}
			})
	}

	$scope.exportReady = false;
}]);