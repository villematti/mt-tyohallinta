theApp.controller('projectController', ['$scope', '$http', '$log', '$location', '$routeParams', 'StatusService', 
	function($scope, $http, $log, $location, $routeParams, StatusService) {

	$scope.projects = [];

	$scope.getAllProjects = function() {
		if(confirm('Oletko varma? Tämä kuormittaa tietokantaa erittäin paljon.')) {
			$http.get('/api/projects')
			.success(function(result) {
				$scope.projects = result;
			})
		}
	}

	$scope.getActiveProjects = function() {
		if(confirm('Oletko varma? Tämä kuormittaa tietokantaa jonkin verran.')) {
			$http.get('/api/projects/active')
			.success(function(result) {
				$scope.projects = result
			})
		}
	}

}]);

theApp.controller('showProjectController', ['$scope', '$http', '$log', '$location', '$routeParams', 
	function($scope, $http, $log, $location, $routeParams) {

	$scope.projectStatuses = '';

	$scope.newProjectStatus = '';
	$scope.newProjectName = '';

	function getStatuses() {
		$http.get('/api/statuses')
			.success(function(result) {
				$scope.projectStatuses = result
		});
	}

	getStatuses();

	$scope.project = '';

	function getProject() {
		$http.get('/api/project/' + $routeParams.id)
			.success(function(result) {
				$log.info(result);
				$scope.newProjectStatus = result.statusId._id;
				$scope.newProjectName = result.name;
			})
	}

	getProject();

	$scope.updateProject = function() {
		$http.put('/api/projects/' + $routeParams.id, {
			_id: $routeParams,
			name: $scope.newProjectName,
			statusId: $scope.newProjectStatus
		})
		.success(function(result) {
			$log.info(result);
			$location.path('/projects');
		});
	};

	$scope.cancel = function() {
		$location.path('/projects');
	}

	$scope.deleteProject = function() {
		if(confirm('Are you sure?')) {
			$http.delete('/api/project/' + $routeParams.id)
				.success(function(result) {
					if(result.success) {
						$location.path('/projects');
					} else {
						$scope.projectDeleteErrorMessage = result.message;
					}
					
			})
		}
	}


}]);

theApp.controller('createNewProjectController', ['$scope', '$http', '$log', '$location', '$routeParams', 
	function($scope, $http, $log, $location, $routeParams) {

	$scope.creationErrorMessage = '';
	$scope.projectStatuses = '';
	$scope.customers = '';

	function getCustomers() {
		$http.get('/api/customers')
			.success(function(result) {
				$scope.customers = result;
		});
	}

	function getStatuses() {
		$http.get('/api/statuses')
			.success(function(result) {
				$scope.projectStatuses = result
		});
	}

	getStatuses();
	getCustomers();

	$scope.newProjectStatus = '';
	$scope.newProjectNumber = '';
	$scope.newProjectName = '';
	$scope.newProjectCustomer = '';

	$scope.createNewProject = function() {
		$http.post('/api/projects', {
			name: $scope.newProjectName,
			number: $scope.newProjectNumber,
			statusId: $scope.newProjectStatus,
			customerId: $scope.newProjectCustomer
		})
		.success(function(result) {
			if(result.success === "Failure") {
				$scope.creationErrorMessage = result.message;
			} else {
				$location.path('/projects');
			}
		});
	}

}]);