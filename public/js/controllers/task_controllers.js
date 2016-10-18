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
	$scope.projects = [];

	$scope.startDate = new Date();
	$scope.endDate = new Date();
	$scope.noTime = false;

	$scope.selectedUser = 0;
	$scope.selectedProject = 0;
	$scope.selectedTasktype = 0;
	$scope.activeProjects = false;
	$scope.filteredProjects = { value: $scope.projects[0] };
	$scope.selectedCustomer = 0;

	$scope.notFound = false;

	$scope.totalHours = 0;
	$scope.totalMachineTime = 0;
	$scope.totalBigVisits = 0;
	$scope.totalDirtyWork = 0;
	$scope.totalOvertime = 0;

	$scope.fillWithAllProjects = function() {
		$http.get('/api/projects')
			.success(function(results) {
				$scope.projects = results;
		})
	}

	$scope.getTasksOnTime = function() {
		$scope.exportReady = false;
		$http.post('/api/tasks/all', {
				filteredProjects: [ $scope.filteredProjects.value ],
				activeProjects: $scope.activeProjects,
				userId: $scope.selectedUser,
				customerId: $scope.selectedCustomer,
				taskTypeId: $scope.selectedTasktype,
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
					var totalOvertime = 0;

					for(var i = 0; i < $scope.tasks.length; i++) {

						totalHours += $scope.tasks[i].hours;
						totalMachineTime += $scope.tasks[i].machineTime;
						totalDirtyWork += $scope.tasks[i].dirtyWork;
						totalOvertime += $scope.tasks[i].overtime;

						if($scope.tasks[i].bigVisit) {
							totalBigVisits++;
						}
					}

					$scope.totalHours = totalHours;
					$scope.totalMachineTime = totalMachineTime;
					$scope.totalBigVisits = totalBigVisits;
					$scope.totalDirtyWork = totalDirtyWork;
					$scope.totalOvertime = totalOvertime;
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

	$scope.customers = {};

	function getAllCustomers() {
		$http.get('/api/customers')
			.success(function(results) {
				$scope.customers = results;
			})
	}

	getAllCustomers();

	function getAllProjects() {
		$http.get('/api/find-projects-from-last-12-months')
			.success(function(results) {
				$scope.projects = results;
			})
	}

	getAllProjects();

	$scope.tasktypes = {};

	function getAllTasktypes() {
		$http.get('/api/tasktypes')
			.success(function(results) {
				$scope.tasktypes = results;
			})
	}

	getAllTasktypes();

	// Export to CSV
	$scope.exportToCsv = function() {

		$scope.exportReady = false;

		var fields = [
			'Aloitusaika',
			'Lopetusaika', 
			'Tunnit', 
			'Tyyppi',
			'Numero',
			'Vuosi',
			'Versio',
			'Asiakas',
			'Nimi',
			'Työvaihe', 
			'Käyttäjä', 
			'Isokäynti', 
			'Ylityöt', 
			'Likainen työ', 
			'Yksinkäynti'
		];

		var fieldData = [];

		var timeOptions = {hour12: false}

		for(var i=0;i < $scope.tasks.length;i++) {
			
			var endDate = '';
			if($scope.tasks[i].endedAt !== null) {
				endDate = new Date($scope.tasks[i].endedAt).toLocaleString('fi-FI', timeOptions);
			} else {
				endDate = null;
			}

			if($scope.tasks[i].bigVisit) {
				

				fieldData[i] = {
					"Aloitusaika": new Date($scope.tasks[i].createdAt).toLocaleString('fi-FI', timeOptions),
					"Lopetusaika": endDate,
					"Tunnit": $scope.tasks[i].hours,
					"Tyyppi": $scope.tasks[i].projectId.typeId.name,
					"Numero": $scope.tasks[i].projectId.number,
					"Vuosi": $scope.tasks[i].projectId.year,
					"Versio": $scope.tasks[i].projectId.version,
					"Asiakas": $scope.tasks[i].projectId.customerId.name,
					"Nimi": $scope.tasks[i].projectId.name,
					"Työvaihe": $scope.tasks[i].taskTypeId.name,
					"Käyttäjä": $scope.tasks[i].userId.name,
					"Isokäynti": 1,
					"Ylityöt": $scope.tasks[i].overtime,
					"Likainen työ": $scope.tasks[i].dirtyWork,
					"Yksinkäynti": $scope.tasks[i].machineTime
				}
			} else {
				fieldData[i] = {
					"Aloitusaika": new Date($scope.tasks[i].createdAt).toLocaleString('fi-FI', timeOptions),
					"Lopetusaika": new Date($scope.tasks[i].endedAt).toLocaleString('fi-FI', timeOptions),
					"Tunnit": $scope.tasks[i].hours,
					"Tyyppi": $scope.tasks[i].projectId.typeId.name,
					"Numero": $scope.tasks[i].projectId.number,
					"Vuosi": $scope.tasks[i].projectId.year,
					"Versio": $scope.tasks[i].projectId.version,
					"Asiakas": $scope.tasks[i].projectId.customerId.name,
					"Nimi": $scope.tasks[i].projectId.name,
					"Työvaihe": $scope.tasks[i].taskTypeId.name,
					"Käyttäjä": $scope.tasks[i].userId.name,
					"Isokäynti": 0,
					"Ylityöt": $scope.tasks[i].overtime,
					"Likainen työ": $scope.tasks[i].dirtyWork,
					"Yksinkäynti": $scope.tasks[i].machineTime
				}
			}
		}

		$http.post('/api/export/tasks', {data: {data: fieldData, fields: fields, del: ';'}, 
			headers: {'Content-Type': 'application/json', 'charset':'utf8'}})
			.success(function(result) {
				if(result.success) {
					$scope.exportReady = true;
					$scope.exportMessage = result.message;
				}
			})
	}

	$scope.exportReady = false;
	$scope.exportMessage = "";
	
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
					$scope.editTaskErrorMessage = '';
					$location.path('/tasks');
				} else {
					$scope.editTaskErrorMessage = result.message;
				}
			});
		}
	}

	$scope.editTaskErrorMessage = '';

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

			$http.put('/api/task/' + task._id + '/edit', {values})
				.success(function(result) {
					if(result.success) {
						$scope.editTaskErrorMessage = '';
						$location.path('/tasks');
					} else {
						$scope.editTaskErrorMessage = result.message;
					}
				})
		}
	}

	$scope.cancelEdit = function() {
		$location.path('/tasks');
	}
	

}]);