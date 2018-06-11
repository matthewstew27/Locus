'use strict';

cs142App.controller('UserDetailController', ['$scope', '$routeParams', '$resource',
  function ($scope, $routeParams, $resource) {
    /*
     * Since the route is specified as '/users/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
    var userId = $routeParams.userId;
    if (userId.indexOf(":") === 0) {
        console.log("removing first letter");
        userId = userId.substring(1, userId.length);
    }
    console.log(userId);
    $scope.user = $routeParams;
    $scope.user.userId = userId;
    $scope.main.most_recent = '';
    $scope.main.most_commented = '';

    //$scope.main.currUserModel = window.cs142models.userModel(userId);
    console.log("About to get");
    var localResource = $resource("http://localhost:3000/user/" + userId);

    localResource.get({userId:userId}, function (model) {

        $scope.main.currUserModel = model;
        $scope.main.most_commented = model.most_commented;
        $scope.main.most_recent = model.most_recent;
        console.log("MOST COMMENTED: " + model.most_commented.file_name); //$scope.model.most_commented.file_name);
        $scope.main.label = $scope.main.currUserModel.first_name + " " + $scope.main.currUserModel.last_name + " Details";
    });
  }]);
