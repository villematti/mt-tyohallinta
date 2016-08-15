theApp.controller('authController', ['$scope', 'store', '$location', '$http', '$log',
		function($scope, store, $location, $http, $log) {

	$scope.usernames = '';

	function getAllUsernames() {
		$http.get('/api/usernames')
			.success(function(result) {
				$scope.usernames = result;
			})
	}

	getAllUsernames();

	$scope.username = { value: $scope.usernames[0] };
	$scope.password = '';

	$scope.errorMessage = '';
	
	$scope.login = function() {
		var username = $scope.username.value;
		$http.post('/api/auth', {
			name: username,
			password: $scope.password
		})
		.success(function(result) {
			if(result.success === false) {
				$log.info(result.message);
				$scope.errorMessage = result.message;
			} else {
				store.set('token', result.token);
				store.set('userid', result.userid);
				store.set('admin', result.admin);
				store.set('username', result.username)
				store.set('pm', result.pm)
				$log.info(store.get('token'));
				$location.path('/');
			}
		});
	}

	$scope.onKeyUp = function(value) {
		if(value.keyCode == 13) {
			$scope.login();
		}
	}

	$scope.$watch(function(newValue, oldValue) {
		if($location.path() === '/auth/logout') {
		store.remove('token');
		store.remove('userid');
		store.remove('username');
		store.remove('admin');
		$location.path('/auth/login');
	}
	})
}]);