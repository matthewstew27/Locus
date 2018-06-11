'use strict';

cs142App.controller('UserPhotosController', ['$scope', '$routeParams','$resource', '$location',
  function($scope, $routeParams, $resource) {
    /*
     * Since the route is specified as '/photos/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */

    var userId = $routeParams.userId;
    $scope.photoLikes = [];
    $scope.login_name = "";
    $scope.photoLikesUsers = [];
    $scope.userFavorites = [];
    var localResource = $resource("http://localhost:3000/photosOfUser/" + userId);
    localResource.query({userId: userId}, function(model) {
      $scope.currUserModel = model;
      $scope.main.label = $scope.main.currUserModel.first_name + " " + $scope.main.currUserModel.last_name + " Photos";
      for (var i = 0; i < model.length; i ++) {
        $scope.photoLikes[i] = model[i].likes.length;
        $scope.photoLikesUsers[model[i].file_name] = model[i].likes;
      }
    });

    var getFavesResource = $resource("http://localhost:3000/favoriteSecond/");
    getFavesResource.query({}, function(model) {
      $scope.userFavorites = model;
      console.log("MODEL: " + JSON.stringify(model));
    });

    var curruserResource = $resource("http://localhost:3000/getCurrUser");
    curruserResource.get({}, function(currUser) {
      $scope.login_name = currUser.login_name;
    });

    $scope.favorite = function (photoId, file_name) {
      var favResource = $resource("http://localhost:3000/favorite/" + photoId);
      favResource.save({_id: photoId}, function(response) {
        $scope.userFavorites = response.favorites;
      });
    };

    $scope.isFavorited = function (photo) {
      if (!photo || photo===undefined) {
        console.log("Error in isFavorited");
        return false;
      }
      if ($scope.userFavorites === undefined) {
        console.log("user Faves is undefined");
        return false;
      }
      for (var i = 0; i < $scope.userFavorites.length; i ++) {
        if ($scope.userFavorites[i].file_name === photo.file_name) {
          return true;
        }
      }
      return false;
    };

    $scope.like = function (photoId, file_name) {
      var likeResource = $resource("http://localhost:3000/like/" + photoId);
      likeResource.save({_id: photoId}, function (response) {
        $scope.login_name = response.login_name;
        var photoResource = $resource("http://localhost:3000/photosOfUser/" + userId);
        photoResource.query({userId: userId}, function(newResponse) {
            for (var i = 0; i < newResponse.length; i ++) {
              $scope.photoLikes[i] = newResponse[i].likes.length;
              $scope.photoLikesUsers[newResponse[i].file_name] = newResponse[i].likes;
            }
        });
      }, function (err) {
        console.log("FAILED IN LIKE");
      });
    };

    $scope.unlike = function(photoId, file_name) {
      console.log("trying to unlike");
      var unlikeResource = $resource("http://localhost:3000/unlike/" + photoId);
      unlikeResource.save({_id: photoId}, function (response) {
        $scope.login_name = response.login_name;
        var photoResource = $resource("http://localhost:3000/photosOfUser/" + userId);
        photoResource.query({userId: userId}, function(newResponse) {
            for (var i = 0; i < newResponse.length; i ++) {
              $scope.photoLikes[i] = newResponse[i].likes.length;
              $scope.photoLikesUsers[newResponse[i].file_name] = newResponse[i].likes;
            }
        });
      }, function (err) {
        console.log("FAILED IN UNLIKE");
      });
    };

    $scope.addComment = function (photoId, comment) {
      var commentResource = $resource("http://localhost:3000/commentsOfPhoto/"+ photoId);
      commentResource.save({comment: comment}, function(response) {
        var photoResource = $resource("http://localhost:3000/photosOfUser/" + userId);
      }, function (err) {
        console.log("ERR posting comment: " + err);
      });
    };



    $scope.isLiked = function(photo, index) {
      if (photo.likes.length === 0) {
        return false;
      }
      for (var i = 0; i < $scope.photoLikesUsers[photo.file_name].length; i ++) {
        if ($scope.photoLikesUsers[photo.file_name][i] === $scope.login_name){
          return true;
        }
      }
      return false;
    };
  }]);
