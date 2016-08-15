theApp.controller('dashboardController', ['$scope', '$http', '$log', 'store', '$interval',
	function($scope, $http, $log, store, $interval) {

	// Initialize dashboard
	$scope.allProjects = [];
	$scope.usersTasks = [];

	// Values for new task
	$scope.bigVisit = false;
	$scope.selectedProject = { value: $scope.allProjects[0] };
	$scope.taskValues = {};

	// Value for tasktypes
	$scope.taskTypes = {};
	$scope.selectedTaskType = '';

	function getAllProjects() {
		$http.get('/api/projects')
			.success(function(results) {
				$scope.allProjects = results;
			})
	}

	getAllProjects()

	$interval(getAllProjects, 60000);

	function getUsersTasks() {
		$http.get('/api/tasks/user/' + store.get('userid') + '/limit/5')
			.success(function(tasks) {
				$scope.usersTasks = tasks;
			});
	}

	getUsersTasks();

	$scope.startTask = function() {

		var setup = {};

		setup.userId = store.get('userid');
		setup.projectId = $scope.selectedProject.value._id;
		setup.bigVisit = $scope.bigVisit;
		setup.taskTypeId = $scope.selectedTaskType;

		$http.post('/api/tasks', setup)
			.success(function(result) {
				$scope.selectedTaskType = '';
				$scope.bigVisit = false;
				$scope.machineTime = 0;
				$scope.overtime = 0;
				getUsersTasks();
			})
	}

	// When End Task button is pressed
	$scope.endTask = function(task) {

		var update = {};

		update.projectId = task.projectId._id;
		update.userId = task.userId._id;
		update.bigVisit = task.bigVisit;
		update.taskTypeId = task.taskTypeId;
		update.machineTime = +$scope.taskValues.machineTime;
		update.overtime = +$scope.taskValues.overtime;
		update.dirtyWork = +$scope.taskValues.dirtyWork;
		update.end = true;

		$http.put('/api/task/' + task._id, update)
			.success(function(result) {
				$log.info(result);
				getUsersTasks();
				$scope.taskValues = {};
			})
	}

	$scope.tasksOnRange = [];

	$scope.startDate = new Date();
	$scope.endDate = new Date();

	$scope.notFound = false;

	$scope.totalHours = 0;

	$scope.getUsersTasksAtRange = function() {
		$http.post('/api/tasks/user/' + store.get('userid') + '/range', {
				startDate: Date.parse($scope.startDate),
				endDate: Date.parse($scope.endDate)
			})
			.success(function(results) {
				$scope.tasksOnRange = results;
				if($scope.tasksOnRange.length == 0) {
					$scope.notFound = true
				} else {
					$scope.notFound = false;

					// Calculate total hours
					var totalHours = 0;

					for(var i = 0; i < $scope.tasksOnRange.length; i++) {
						totalHours += $scope.tasksOnRange[i].hours;
					}

					$scope.totalHours = totalHours;
				}
			})
	}

	// Get all tasktypes
	function getAllTaskTypes() {
		$http.get('/api/tasktypes')
			.success(function(results) {
				$scope.taskTypes = results;
			})
	}

	getAllTaskTypes();

}]);