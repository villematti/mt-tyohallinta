theApp.controller('projectController', ['$scope', '$http', '$log', '$location', '$routeParams', 'StatusService', 
	function($scope, $http, $log, $location, $routeParams, StatusService) {

	$scope.projects = [];

	function getProjects() {
		$http.get('/api/projects')
			.success(function(result) {
				$log.info(result);
				$scope.projects = result;
			})
	}

	getProjects();
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
					$location.path('/projects');
			})
		}
	}


}]);

theApp.controller('createNewProjectController', ['$scope', '$http', '$log', '$location', '$routeParams', 
	function($scope, $http, $log, $location, $routeParams) {

	$scope.creationErrorMessage = '';
	$scope.projectStatuses = '';

	function getStatuses() {
		$http.get('/api/statuses')
			.success(function(result) {
				$scope.projectStatuses = result
		});
	}

	getStatuses();

	$scope.newProjectStatus = '';
	$scope.newProjectName = '';

	$scope.createNewProject = function() {
		$http.post('/api/projects', {
			name: $scope.newProjectName,
			statusId: $scope.newProjectStatus
		})
		.success(function(result) {
			if(result.success === false) {
				$scope.creationErrorMessage = result.message;
			} else {
				$location.path('/projects');
			}
		});
	}

}]);