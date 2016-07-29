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
	$scope.noTime = false;

	$scope.selectedUser = 0;
	$scope.selectedProject = 0;
	$scope.activeProjects = false;

	$scope.notFound = false;

	$scope.totalHours = 0;
	$scope.totalMachineTime = 0;
	$scope.totalBigVisits = 0;
	$scope.totalDirtyWork = 0;
	$scope.totalOvertime = 0;

	$scope.getTasksOnTime = function() {
		$scope.exportReady = false;
		$http.post('/api/tasks/all', {
				activeProjects: $scope.activeProjects,
				userId: $scope.selectedUser,
				noTime: $scope.noTime,
				projectId: $scope.selectedProject,
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

	$scope.projects = {};

	function getAllProjects() {
		$http.get('/api/projects')
			.success(function(results) {
				$scope.projects = results;
			})
	}

	getAllProjects();

	// Export to CSV
	$scope.exportToCsv = function() {

		$scope.exportReady = false;

		var fields = ['Start Time', 'End Time', 'Hours', 'Project name', 'Tasktype', 'Username', 'Big Visit', 'Overtime', 'Dirty Work', 'Machine Time'];

		var fieldData = [];

		var timeOptions = {hour12: false}

		for(var i=0;i < $scope.tasks.length;i++) {

			if($scope.tasks[i].bigVisit) {
				fieldData[i] = {
					"Start Time": new Date($scope.tasks[i].createdAt).toLocaleString('fi-FI', timeOptions),
					"End Time": new Date($scope.tasks[i].endedAt).toLocaleString('fi-FI', timeOptions),
					"Hours": $scope.tasks[i].hours,
					"Project name": $scope.tasks[i].projectId.name,
					"Tasktype": $scope.tasks[i].taskTypeId.name,
					"Username": $scope.tasks[i].userId.name,
					"Big Visit": 1,
					"Overtime": $scope.tasks[i].overtime,
					"Dirty Work": $scope.tasks[i].dirtyWork,
					"Machine Time": $scope.tasks[i].machineTime
				}
			} else {
				fieldData[i] = {
					"Start Time": new Date($scope.tasks[i].createdAt).toLocaleString('fi-FI', timeOptions),
					"End Time": new Date($scope.tasks[i].endedAt).toLocaleString('fi-FI', timeOptions),
					"Hours": $scope.tasks[i].hours,
					"Project name": $scope.tasks[i].projectId.name,
					"Tasktype": $scope.tasks[i].taskTypeId.name,
					"Username": $scope.tasks[i].userId.name,
					"Big Visit": 0,
					"Overtime": $scope.tasks[i].overtime,
					"Dirty Work": $scope.tasks[i].dirtyWork,
					"Machine Time": $scope.tasks[i].machineTime
				}
			}
		}

		$http.post('/api/export/tasks', {data: {data: fieldData, fields: fields, del: ';'}, 
			headers: {'Content-Type': 'application/json', 'charset':'utf8'}})
			.success(function(result) {
				if(result.success) {
					$scope.exportReady = true;
				}
			})
	}

	$scope.exportReady = false;
	
}]);

theApp.controller('showTaskController', ['$scope', '$http', '$log', 'store', '$routeParams', '$location', 
	function($scope, $http, $log, store, $routeParams, $location) {

	$scope.task = '';
	$scope.users = '';
	$scope.projects = '';
	$scope.taskTypes = '';

	$scope.selectedProject = '';
	$scope.selectedUser = '';
	$scope.selectedTaskType = '';

	$scope.actionMessage = '';

	function getTask() {
		$http.get('/api/task/' + $routeParams.id + '/nopopulate')
			.success(function(task) {
				$scope.task = task;
				$scope.selectedUser = task.userId;
				$scope.selectedProject = task.projectId;
				$scope.selectedTaskType = task.taskTypeId;
			})
	}

	function getUsers() {
		$http.get('/api/users')
			.success(function(users) {
				$scope.users = users;
		})
	}

	function getProjects() {
		$http.get('/api/projects')
			.success(function(projects) {
				$scope.projects = projects;
		})
	}

	function getTaskTypes() {
		$http.get('/api/tasktypes')
			.success(function(taskTypes) {
				$scope.taskTypes = taskTypes;
		})
	}

	getTask()
	getUsers()
	getProjects()
	getTaskTypes()

	$scope.deleteTask = function(taskId) {
		if(confirm('Oletko varma?')) {
			$http.delete('/api/task/' + taskId)
			.success(function(result) {
				if(result.success === true) {
					$location.path('/tasks');
				}
			});
		}
	}

	$scope.editTask = function(task) {
		if(confirm('Oletko varma?')) {
			var values = {};
			console.log($scope.selectedProject);
			values.projectId = $scope.selectedProject;
			values.userId = $scope.selectedUser;
			values.taskTypeId = $scope.selectedTaskType;
			values.createdAt = task.createdAt;
			values.bigVisit = task.bigVisit;
			values.endedAt = task.endedAt;
			values.dirtyWork = +$scope.task.dirtyWork;
			values.overtime = +$scope.task.overtime;
			values.machineTime = +$scope.task.machineTime;

			console.log(values);

			$http.put('/api/task/' + task._id + '/edit', {values})
				.success(function(result) {
					console.log(result);
					$location.path('/tasks');
				})
		}
	}

	$scope.cancelEdit = function() {
		$location.path('/tasks');
	}
	

}]);