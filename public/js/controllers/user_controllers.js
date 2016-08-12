theApp.controller('userController', ['$scope', '$log', '$http', '$routeParams', '$location', 'store',
	function($scope, $log, $http, $routeParams, $location, store) {

	$log.info(localStorage);

	$scope.users = [];

	var allUsers = function() {
		$http.get('/api/users')
			.success(function(result) {
				$log.info(result);
				$scope.users = result;
			})
			.error(function(data, reponse) {
				$log.error(data);
			});
	};

	// Get all users
	allUsers();

	// Info for new user
	$scope.username = '';
	$scope.password = '';
	$scope.repeat = '';
	$scope.admin = false;
	$scope.pm = false;

	// Error message for creating user
	$scope.usercreationerror = '';

	// Create user function what is posting params to the server
	$scope.createNewUser = function() {
		$http.post('/api/users', {
			name: $scope.username,
			password: $scope.password,
			admin: $scope.admin,
			pm: $scope.pm
		})
		.success(function(result) {
			$log.info(result);
			if(result.success === "Failure") {
				$scope.usercreationerror = result.message;
				$location.path('/users/create');
			} else {
				$scope.username = '';
				$scope.password = '';
				$scope.repeat = '';
				$location.path('/users');
			}
		})
		.error(function(data, code) {
			$log.error(data);
		});
	};

	// Show user info
	$scope.showuserinfo = '';

	$scope.showUser = function(user) {
		$location.path('/users/' + user._id);
		
	}
}]);

theApp.controller('showUserController', ['$scope', '$log', '$http', '$routeParams', '$location',
	function($scope, $log, $http, $routeParams, $location) {

	$scope.currentuser = '';

	var userinfo = function() {
		$http.get('/api/users/' + $routeParams.id)
			.success(function(result) {
				$log.info(result.name);
				$scope.currentuser = result;
			})
			.error(function(data, code) {
				$log.error(data);
			});
	}

	userinfo();

	$scope.deleteUser = function(userid) {
		$http.delete('/api/users/' + userid)
			.success(function(result) {
				$log.info(result);
				$location.path('/users');
			})
			.error(function(data, code) {
				$log.error(data);
			})
	}

}]);