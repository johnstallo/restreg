var app = angular.module('myApp', ['ngRoute']);
app.controller('MainController', function ($scope, $http) {

    //$scope.waitinglist = [];
    $scope.calledlist = [];
    $scope.seatedlist = [];

    $scope.formData = {};

    // $scope.addToWaitingList = function () {
    //     var person = { name: $scope.formData.name, phone: $scope.formData.phoneNumber };
    //     $scope.waitinglist.push(person);
    //     $scope.formData = {};
    // };


    $scope.createPatron = function () {
        var newPatron = { name: $scope.formData.name, phone: $scope.formData.phoneNumber, partySize: $scope.formData.partySize };
        $scope.formData = {};
        console.log("web: creating new patron: %j", newPatron);
        $http.post('/api/patron', newPatron);

        $scope.getPatrons();
    };

    var allPatrons = [];
    $scope.getPatrons = function () {
        // hack!
        // setTimeout(function () {
        $http.get('/api/patrons').then(function (data) {
            allPatrons = data.data;

            $scope.waitinglist = [];
            $scope.calledlist = [];
            $scope.seatedlist = [];

            for (i = 0; i < allPatrons.length; i++) {
                var p = allPatrons[i];
                switch (p.state) {
                    case "waiting":
                        $scope.waitinglist.push(p);
                        break;
                    case "called":
                        $scope.calledlist.push(p);
                        break;
                    case "seated":
                        $scope.seatedlist.push(p);
                        break;
                    default:
                        break;
                }
            }
        });
        // }, 1000);
    };

    updatePatron = function (patronToUpdate) {
        $http.post('/api/updatepatron/', patronToUpdate).then(function (data) {
            $scope.getPatrons();
        });
    }

    // simple polling
    // setInterval(function() {
    //     $scope.getPatrons();
    // }, 5000);

    $scope.moveToCalledList = function (patron) {
        //moveToList($scope.waitinglist, $scope.calledlist, i);
        console.log("move to called list");
        patron.state = "called";
        updatePatron(patron);
    };

    $scope.moveToSeatedList = function (patron) {
        // moveToList($scope.calledlist, $scope.seatedlist, i);
        console.log("move to seated list");
        patron.state = "seated";
        updatePatron(patron);
    }

    $scope.leave = function (patron) {
        //$scope.seatedlist.splice(i, 1);
        $http.post('/api/patronleave', { patronID: patron.phone }).then(function (data) {
            $scope.getPatrons();
        });
    }

    // function moveToList(fromList, toList, i) {
    //     toList.push(fromList[i]);
    //     fromList.splice(i, 1);
    // }

    function initData() {
        $scope.waitinglist.push({ name: "John", phone: "425 234 2299" });
        $scope.waitinglist.push({ name: "Miriam", phone: "567 233 2311" });
        $scope.waitinglist.push({ name: "Jane", phone: "566 222 1896" });
        $scope.waitinglist.push({ name: "Tim", phone: "255 622 2719" });
        $scope.waitinglist.push({ name: "Luke", phone: "234 445 2200" });
        $scope.waitinglist.push({ name: "Phillip", phone: "234 299 8776" });
    };

    // initData();
    $scope.getPatrons();


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
    };
});

// app.factory('Patron', ['$http', function($http) {

//     return {
//         // get: function() {
//         //     return $http.get('/api/articles');
//         // },
//         // getArticle: function(articleID) {
//         //     return $http.get('/api/articles/' + articleID);
//         // },
//         create: function(articleData) {
//             return $http.post('/api/articles', newPatron);
//         }
//         // delete: function(id) {
//         //     // TODO
//         // },
//         // submit: function(newArticle) {
//         //     console.log("posting new article %j", newArticle);
//         //     return $http.post('/api/submit', newArticle);
//         // },
//         // upvote: function(id) {
//         //     var articleData = {
//         //         articleID: id
//         //     };
//         //     return $http.post('/api/upvote/', articleData);
//         // },
//         // createComment: function(commentData) {
//         //     return $http.post('/api/comments', commentData);
//         // },
//         // getComments: function(articleID) {
//         //     //console.log("Refreshing comments for article " + articleID);
//         //     return $http.get('/api/articles/' + articleID + '/comments');
//         // }
//     }
// }]);
