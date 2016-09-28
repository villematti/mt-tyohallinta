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

	$scope.startTaskErrorMessage = '';

	// Find working users
	$scope.workingUsers = [];

	function getWorkingUsers() {
		$http.get('/api/get-working-users')
			.success(function(results) {
				$scope.workingUsers = results;
			})
	}

	getWorkingUsers();

	$scope.updateWorkingUsers = function() {
		$scope.workingUsers = [];
		$interval(getWorkingUsers, 1000, 1);
	}

	function getAllProjects() {
		$http.get('/api/projects/active')
			.success(function(results) {
				$scope.allProjects = results;
			})
	}

	getAllProjects();

	// Run defined intervals
	$interval(timedIntervals, 60000);

	// Define intervals required for dashboard
	function timedIntervals() {
		getAllProjects();
		getWorkingUsers();
	}

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
				if(result.success) {
					$scope.selectedTaskType = '';
					$scope.bigVisit = false;
					$scope.machineTime = 0;
					$scope.overtime = 0;
					$scope.startTaskErrorMessage = '';
					getUsersTasks();
				} else {
					$scope.startTaskErrorMessage = result.message;
				}
				
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

	$scope.workingHours = undefined;
	$scope.todaysTasks = [];

	$scope.getWorkingHours = function() {
		$http.get('/api/get-todays-worked-hours')
			.success(function(results) {
				$scope.todaysTasks = results;

				if($scope.todaysTasks.length == 0) {
					$scope.workingHours = 0;
				} else {

					// Calculate total hours
					var totalHours = 0;

					for(var i = 0; i < $scope.todaysTasks.length; i++) {
						totalHours += $scope.todaysTasks[i].hours;
					}

					$scope.workingHours = totalHours;
				}
				
			})
	}

}]);