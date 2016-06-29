theApp.service('AuthService', function(store) {
	var authVariables = {};

	authVariables.isAuthenticated = function() {
		if(store.get('token') !== null) {
			return true;
		} else {
			return false;
		}
	}

	authVariables.getUsername = function() {
		if(store.get('token') !== null) {
			return store.get('username');
		} else {
			return '';
		}
	}

	authVariables.isAdmin = function() {
		return store.get('admin');
	}

	return authVariables;
})