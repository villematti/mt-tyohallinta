theApp.controller('dashboardController', ['$scope', '$http', '$log', 'store', '$interval',
	function($scope, $http, $log, store, $interval) {

	// Initialize dashboard
	$scope.allProjects = [];
	$scope.usersTasks = [];

	function getAllProjects() {
		$http.get('/api/projects')
			.success(function(results) {
				$scope.allProjects = results;
			})
	}

	getAllProjects()

	$interval(getAllProjects, 60000);

	function getUsersTasks() {
		$http.get('/api/tasks/user/' + store.get('userid'))
			.success(function(tasks) {
				$scope.usersTasks = tasks;
			})
	}

	getUsersTasks();

	// Values for new task
	$scope.machineTime = '';
	$scope.bigVisit = false;
	$scope.selectedProject = '';
	$scope.dirtyWork = {};

	$scope.startTask = function() {

		var setup = {};

		setup.userId = store.get('userid');
		setup.projectId = $scope.selectedProject;
		setup.bigVisit = $scope.bigVisit;
		setup.dirtyWork = 0;


		if($scope.machineTime !== '') {
			setup.machineTime = $scope.machineTime;
		} else {
			setup.machineTime = 0;
		}

		$http.post('/api/tasks', setup)
			.success(function(result) {
				$log.info(result);
				$scope.selectedProject = '';
				$scope.bigVisit = false;
				$scope.machineTime = '';
				getUsersTasks();
			})
	}

	// When End Task button is pressed
	$scope.endTask = function(task) {

		var update = {};

		update.projectId = task.projectId._id;
		update.userId = task.userId._id;
		update.bigVisit = task.bigVisit;
		update.machineTime = task.machineTime;
		$log.info($scope.dirtyWork.value);
		update.dirtyWork = +$scope.dirtyWork.value;
		update.end = true;

		$http.put('/api/task/' + task._id, update)
			.success(function(result) {
				$log.info(result);
				getUsersTasks();
			})
	}

}]);