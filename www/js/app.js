var app = angular.module('PetPlace', ['ionic','firebase', 'ngCordova']);

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

app.config(function($stateProvider, $urlRouterProvider){
  // tela "Login"
  $stateProvider.state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  });
  $stateProvider.state('cadastro',{
    url: '/cadastro',
    templateUrl: 'templates/cadastro.html',
    controller: 'CadastroCtrl'
  });
  $stateProvider.state('inicial',{
    url: '/inicial',
    templateUrl: 'templates/inicial.html',
    controller: 'InicialCtrl'
  });
  $stateProvider.state('perfil',{
    url: '/perfil',
    templateUrl: 'templates/perfil.html',
    controller: 'PerfilCtrl'
  });
  $stateProvider.state('pets',{
    url: '/pets',
    templateUrl: 'templates/pets.html',
    controller: 'PetsCtrl'
  });
  $stateProvider.state('loja',{
    url: '/loja',
    templateUrl: 'templates/loja.html',
    controller: 'LojaCtrl'
  });
  $stateProvider.state('saude',{
    url: '/saude',
    templateUrl: 'templates/saude.html',
    controller: 'SaudeCtrl'
  });
  $stateProvider.state('mapa',{
    url: '/mapa',
    templateUrl: 'templates/mapa.html',
    controller: 'MapaCtrl'
  });
  $stateProvider.state('cadastroPet',{
    url: '/cadastroPet',
    templateUrl: 'templates/cadastroPet.html',
    controller: 'CadastroPetCtrl'
  });
  $urlRouterProvider.otherwise('/login');
  });

  app.controller('LoginCtrl',function($scope, $state, $firebaseAuth){
    $firebaseAuth().$onAuthStateChanged(function(firebaseUser){
        if(firebaseUser){
          $state.go('inicial');
          var idUsuario = firebaseUser.uid;
        }
    })

    $scope.user = {};

    $scope.entrar=function(user){
      $firebaseAuth().$signInWithEmailAndPassword(user.email, user.password)
      .then(function(firebaseUser){
        $state.go('inicial');
      })
      .catch(function (error) {
        //ocorreu um erro no login
        $ionicPopup.alert({
          title: "Falha no Login",
          template: error.message
        });
        alert(error.message);
      })
    };
  });
  app.controller('CadastroCtrl', function($scope, $state, $firebaseObject, $firebaseAuth, $ionicPopup){
    $scope.user={};
    $scope.registrar = function(user){
      $firebaseAuth().$createUserWithEmailAndPassword(user.email, user.password)
      .then(function (firebaseUser) {
        //efetuou o login com sucesso.
        // firebaseUser = usuário cadastrado no Authentication com email, senha e uid!

        firebaseUser.updateProfile({
          // atualiza o nome do usuário já cadastrado.
          displayName: user.nome
        }).then(function () {
          // Update successful.

          // Adicionar o usuário registrado no Database.
          var ref = firebase.database().ref("usuario").child(firebaseUser.uid);
          var usuario = $firebaseObject(ref);

          usuario.displayName = firebaseUser.displayName;
          usuario.email = firebaseUser.email;
          usuario.dataCadastro = new Date().getTime();

          usuario.$save().then(function () {
            $state.go('inicial');
          })


        }).catch(function (error1) {
          // An error happened.

          $ionicPopup.alert({
            title: "Falha na Atualização do Nome",
            template: error1.message
          });

        });

      })
      .catch(function (error) {
        //ocorreu um erro no login
        $ionicPopup.alert({
          title: "Falha no Cadastro",
          template: error.message
        });
      })
  }
});

  app.controller('InicialCtrl', function($scope,$state){


    $scope.telaPets = function(){
      $state.go('pets');
    }
    $scope.telaMapa = function(){
      $state.go('mapa');
    }
    $scope.telaLoja = function(){
      $state.go('loja');
    }
    $scope.telaSaude = function(){
      $state.go('saude');
    }
    $scope.signOut= function(){
      firebase.auth().signOut();
      location.reload();
      $state.go("login");
    }
    });
  app.controller('PetsCtrl', function($scope, $firebaseArray, $state){
  

        var user = firebase.auth().currentUser;
        var ref = firebase.database().ref().child('usuario').child(user.uid).child('pets');
          //$scope.pets = $firebaseArray(ref);
          $scope.pets = {};
          $scope.pets = $firebaseArray(ref);
          $scope.pets.currentPage = 0;
    
          var setupSlider = function() {
            //some options to pass to our slider
            $scope.pets.sliderOptions = {
              initialSlide: 0,
              direction: 'horizontal', //or vertical
              speed: 300 //0.3s transition
            };
        
            //create delegate reference to link with slider
            $scope.pets.sliderDelegate = null;
        
            //watch our sliderDelegate reference, and use it when it becomes available
            $scope.$watch('pets.sliderDelegate', function(newVal, oldVal) {
              if (newVal != null) {
                $scope.pets.sliderDelegate.on('slideChangeEnd', function() {
                  $scope.pets.currentPage = $scope.pets.sliderDelegate.activeIndex;
                  //use $scope.$apply() to refresh any content external to the slider
                  $scope.$apply();
                });
              }
            });
          };
        
          setupSlider();
    

          

          $scope.telaPerfil = function(){
            $state.go('perfil');
          }
          $scope.apagar = function(id){
            var obj =$scope.pets.$getRecord(id);
            $scope.pets.$remove(obj);
          }
          $scope.add = function(){
            $state.go('cadastroPet');
          }
          $scope.editar = function(){
            $state.go('editarPet');
          }
          
        });

  app.controller('PerfilCtrl', function(){
    
    
  });
  app.controller('LojaCtrl', function($scope,$state,$firebaseArray){
    var ref = firebase.database().ref().child('petshop');
    $scope.petshop = $firebaseArray(ref); 
  });

  app.controller('CadastroPetCtrl',function($scope, $firebaseArray, $state){
    var user = firebase.auth().currentUser;
    
    $scope.pets={};
    $scope.salvar = function(pets){
      var ref = firebase.database().ref().child('usuario').child(user.uid).child('pets');
      $firebaseArray(ref).$add(pets);

      $state.go('pets');
    };
  });

  app.controller('SaudeCtrl', function($scope,$state,$firebaseArray){
    var ref = firebase.database().ref().child('veterinarios');
    $scope.veterinarios = $firebaseArray(ref);    
  });


  app.controller('MapaCtrl', function($scope, $state, $cordovaGeolocation) {
    var options = {timeout: 10000, enableHighAccuracy: true};
   
    $cordovaGeolocation.getCurrentPosition(options).then(function(position){
   
      var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
   
      var mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
   
      $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

      var marcador = new google.maps.Marker({
        map: $scope.map,
        animation: google.maps.Animation.DROP,
        position: latLng
      });

    }, function(error){
      console.log("Could not get location");
    });
  

      
});  