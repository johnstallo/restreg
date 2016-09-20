var app = angular.module('myApp', ['ngRoute']);
app.controller('MainController', function ($scope, $http) {

    $scope.waitinglist = [];
    $scope.calledlist = [];
    $scope.seatedlist = [];

    $scope.formData = {};

    $scope.addToWaitingList = function () {
        var person = { name: $scope.formData.name, phone: $scope.formData.phoneNumber };
        $scope.waitinglist.push(person);
        $scope.formData = {};
    };

    $scope.moveToCalledList = function (i) {
        moveToList($scope.waitinglist, $scope.calledlist, i);
    };

    $scope.moveToSeatedList = function(i) {
        moveToList($scope.calledlist, $scope.seatedlist, i);
    }

    $scope.leave = function(i) {
        $scope.seatedlist.splice(i, 1);
    }

    function moveToList(fromList, toList, i) {
        toList.push(fromList[i]);
        fromList.splice(i, 1);
    }

    function initData() {
        $scope.waitinglist.push({ name: "John", phone: "425 234 2299" });
        $scope.waitinglist.push({ name: "Miriam", phone: "567 233 2311" });
        $scope.waitinglist.push({ name: "Jane", phone: "566 222 1896" });
        $scope.waitinglist.push({ name: "Tim", phone: "255 622 2719" });
        $scope.waitinglist.push({ name: "Luke", phone: "234 445 2200" });
        $scope.waitinglist.push({ name: "Phillip", phone: "234 299 8776" });
    };

    initData();


    $scope.messages = [];
    $scope.sayHelloToServer = function () {
        $http.get("/api?_=" + Date.now()).then(function (response) {
            $scope.messages.push(response.data);

            // Make request to /metrics            
            // $http.get("/metrics?_=" + Date.now()).then(function(response) {
            //     $scope.metrics = response.data;
            // });
        });
    };

    $scope.sayHelloToServer();

    var styles = [];
    var colors = ["black", "green", "red", "blue", "orange", "purple", "gray"];
    var colorIndex = 0;

    $scope.getStyle = function (message) {
        if (!styles[message]) {
            styles[message] = { 'color': colors[colorIndex] };
            colorIndex = colorIndex < colors.length - 1 ? colorIndex + 1 : 0;
        }
        return styles[message];
    }

});
