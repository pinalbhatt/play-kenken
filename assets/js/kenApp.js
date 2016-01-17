(function() {
    'use strict';

    angular
        .module('kenApp', ['ui.bootstrap'])
        .factory('APIService', APIService)
        .controller("kenController", kenController);

    APIService.$inject = ['$http', '$q'];
    function APIService($http, $q){

        var baseUrl = "http://rsvc.pbdesk.io/roken/custom/";

        var service = {
            get: _get
        };

        return service;



        function _makeHttpCall(options){
            /*options = {
             method: "",
             data: "",
             url: ""
             }*/
            var deferred = $q.defer();
            var apiUrl = baseUrl +  options.url;

            var req = {
                method: options.method,
                url: apiUrl,
                headers: {
                    "Content-Type": "application/json"
                }
            }
            if(options.data !== undefined){
                req.data = options.data;
            }

            $http(req)
                .then(function(response){
                        deferred.resolve(response);
                    },
                    function(error){
                        deferred.reject(error);
                    });
            return deferred.promise;
        }

        function _get(partialUrl){

            var options = {
                method: "GET",
                url: partialUrl
            }
            var deferred = $q.defer();
            _makeHttpCall(options)
                .then(function(response){
                        if (response.status === 200) {
                            deferred.resolve(response);
                        }
                        else{
                            deferred.reject(response);
                        }
                    },
                    function(error){
                        deferred.reject(error);
                    });
            return deferred.promise;
        }


    }


    kenController.$inject = ["APIService", "$q"];
    function kenController(APIService){
        var self = this;

        self.sizeOptions = [
            {value: 3, label: "3 x 3"}, {value: 4, label: "4 x 4"}, {value: 5, label: "5 x 5"},
            {value: 6, label: "6 x 6"}, {value: 7, label: "7 x 7"}, {value: 8, label: "8 x 8"},
            {value: 9, label: "9 x 9"}
        ];

        self.operatorsOptions =  [
            {value: 1, label: " + "}, {value: 2, label: " + - "},
            {value: 3, label: " + - x "}, {value: 4, label: " + - x / "}
        ];

        self.levelOptions = [
            {value: 1, label: "Beginners"}, {value: 2, label: "Easy"},
            {value: 3, label: "Medium"}, {value: 4, label: "Hard"},{value: 5, label: "Prodigy"}
        ];

        self.input = {
           size: '4',
            ops: '2',
            level: '2'
        }

        self.viewBoard = {};





        function getCustomKenken(){
            return APIService.get(self.input.size + "/" + self.input.ops + "/" + self.input.level);
        }

        self.checkboxSelection = 2;


        self.check = function(){
            console.log(self.answers);
        }
        self.PlayClicked = function(b){
            //self.input.size = b;
            //alert("size: " + self.input.size + " ops: " + self.input.ops + " level: " + self.input.level);
            getCustomKenken().then(function(success){
                self.viewBoard = success.data;
                self.inputButtons = [];
                self.answers = new Array(self.viewBoard.length);
                for(var i = 1; i<= self.viewBoard.length; i++){
                    self.inputButtons.push(i);
                    self.answers[i] = new Array(self.viewBoard.length);
                }

            }, function(error){
                alert(error);
            });

        }

        self.isNumber = function($event){
            $event = ($event) ? $event : window.event;
            var charCode = ($event.which) ? $event.which : $event.keyCode;
            if (charCode > 31 && (charCode < 49 || charCode > 57 - (9-self.input.size))) {
                $event.preventDefault();
            }
        }

        self.selectCell = function(pos){
            var id = "answerTxt" + pos;
            document.getElementById(id).focus();
        }

        self.selectAnswerBox =function(pos){
            self.currentAnswerBox  = "answerTxt" + pos;
            self.currentPosition = pos;
        }

        self.inputButtonClicked = function(val){
            document.getElementById(self.currentAnswerBox).value = val;
            document.getElementById("btnCheckAnswer").focus();


        }


    }



})();
