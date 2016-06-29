theApp.factory('Authenticate', function($q, AuthService) {
	return {
        authenticate : function(){
            //Authentication logic here
            if(AuthService.isAuthenticated()){
                //If authenticated, return anything you want, probably a user object
                return true;
            } else {
                //Else send a rejection
                return $q.reject('Not Authenticated');
            }
        }
    }
})