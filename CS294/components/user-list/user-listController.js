'use strict';

cs142App.controller('UserListController', ['$scope', '$resource',
    function ($scope, $resource) {
        var localResource = $resource('http://localhost:3000/user/list');
        localResource.query( function(model) {
            $scope.main.users = model;
            $scope.view = $scope.main.currView;
            console.log("VIEW: " + $scope.view);
        });
    }]);

