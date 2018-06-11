'use strict';

cs142App.controller('RestaurantsController', ['$scope', '$resource',
    function ($scope, $resource) {
        var localResource = $resource('http://localhost:3000/user/list');
        localResource.query( function(model) {
            $scope.main.users = model;
        });

        $.ajaxSetup({
			async: false
		});
		$.getJSON('http://127.0.0.1:5000/states',
	    function(data, textStatus, jqXHR) {
			$scope.cities = data;
			console.log(data);
	  	});
}]);
