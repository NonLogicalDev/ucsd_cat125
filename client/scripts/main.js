var app = angular.module("PixelsOfAwesome", [
  'ui.router',
  // 'angular-loading-bar',
  'ngSanitize',
  'ngAnimate',
  'angulartics', 'angulartics.google.analytics'
]);

app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
  function page(name) {
    return '/s/views/pages/'+name+'.html';
  }

  $urlRouterProvider.otherwise('/');
  $stateProvider

  // The landing page
  .state('home', {
    url: '/',
    templateUrl: page('home')
  })

  // The About page
  .state('about', {
    url: '/about',
    templateUrl: page('about')
  })

  // The links page
  .state('links', {
    url: '/links',
    templateUrl: page('links')
  })

  // The pagelisting page
  .state('pagelisting', {
    url: '/pages',
    templateUrl: page('pagelisting'),
    controller: 'PageListingController'
  })

  // The links page
  .state('generic', {
    url: '/page/:pagename',
    templateUrl: page('generic'),
    controller: 'GenericPageController',
    onEnter: function($state, $stateParams, $rootScope) {
      $rootScope.$broadcast('$$stateParamsChanged', $stateParams)
    }
  })

  .state('404', {
    url: '/404',
    templateUrl: page('404')
  })

  ;

  $locationProvider.html5Mode(true)
});

app.controller('SocialController', function($scope) {
  $scope.socialItems = [
    {url: "https://www.facebook.com/nonlogicaldev", icon: "facebook"},
    {url: "https://twitter.com/nonlogicalme", icon: "twitter"},
    {url: "https://github.com/NonLogicalDev", icon: "github"},
    {url: "https://soundcloud.com/nonlogical", icon: "soundcloud"}
  ]
  
  $scope.track = function(item) {
      ga('send', 'event', 'social', 'hover', item.icon);
  }
});

app.controller("SidebarController", function($scope, $http, $rootScope) {
  $rootScope.$on("$stateChangeSuccess", function(e, toState, fromState, fromParams) {
    $scope.curState = toState.name
    if (toState.name != 'generic') {
      $scope.curParams = null;
    }
    $('#page').scrollTo(0, 500);
  });
  $rootScope.$on("$$stateParamsChanged", function(e, params) {
    $scope.curParams = params;
  });
  $rootScope.$on('$$needsImageRecompile', function(e, params) {
    console.log("recompiling");
    $('img').attr("rel", "zoom");
    console.log($('img'));
    $('img').smoothZoom({});
  });


  $scope.items = []

  $scope.items.push({
    name: "Home", icon: "home", state: "home"
  });
  $scope.items.push({
    name: "About", icon: "asterisk", state: "about"
  });

  $scope.posts = [];
  $scope.items.push({
    name: "Posts", icon: "archive", state: "pagelisting",
    subitems: $scope.posts
  });

  $scope.items.push({
    name: "Links", icon: "sitemap", state: "links"
  });

  $http.get('/api/pages')
  .success(function(pages){
    pages.forEach(function(page) {
      $scope.posts.push({ 
        name:   toTitleCase(page.replace(/_|-/g, " ")),
        state:  "generic",
        name_s: page,
        params: genericPage(page)
      });
    });
  })
  .error(function(msg, code) {
     alert(code + " Error: Can not retrieve the sidebar.");
  });

});

app.controller('GenericPageController', function($scope, $state, $stateParams, $http, $sce, $timeout) {
  function asset(name) {
    return "/s/assets/"+name;
  }

  $scope.background = asset("heroUnit.jpg");
  $scope.title      = "...Loading...";
  $scope.fulltitle  = "...Loading...";

  $http.get('/api/page/'+$stateParams.pagename)
  .success(function(page){
    console.log(page.params);
    $scope.title = page.params.title;
    $scope.fulltitle = page.params.fulltitle;
    if (page.params.background) {
      $scope.background = asset(page.params.background);
    }
    $scope.text = $sce.trustAsHtml(page.text);
    $timeout(function(){ $scope.$emit('$$needsImageRecompile'); });
  })
  .error(function(msg, code) {
     alert(code + " Error: Page not found.");
     $state.transitionTo("404");
  });

});

app.controller('PageListingController', function($scope, $state, $http, $stateParams) {
  $http.get('/api/pages?description=1')
  .success(function(pages){
    $scope.posts = [];
    console.log(pages);
    pages.forEach(function(page) {
      $scope.posts.push({ 
        name:        toTitleCase(page.name.replace(/_|-/g, " ")),
        state:       "generic",
        params:      genericPage(page.name),
        description: page.description,
        thumbnail:   page.background
      });
    });
  })
  .error(function(msg, code) {
     alert(code + " Error: Can not retrieve pages.");
  });
});

app.controller('LinksController', function($scope, $http) {
  $http.get('/s/misc/links.json')
  .success(function(data) {
    console.log(data.links);
    $scope.links = data.links;
  })
  .error(function(msg, code) {
    alert(code + " Error: Can not retrieve links." + msg);
  });
});

// Extra Stuff /////////////////////////////////////////////////////////////////
function genericPage(name) {
  return "({pagename: '"+name+"'})";
}

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

var killNavbarClasses = function() {
  $("#dm-navbar").removeClass("dm-out");
  $("#dm-overlay").removeClass("dm-overlay-on");
}

var killNavbar = function() {
  killNavbarClasses();
  var mobile = $('#dm-menu-rollout-toggle').css("display") === 'block';
  if(mobile) {
    $('#dm-menu-rollout-toggle a')[0].click();
  }
}

var oldWidth = 0;
$(window).on('resize', function () {
  if($(window).width() != oldWidth) {
    killNavbarClasses()
    oldWidth = $(window).width();
  }
});

app.controller("RootViewController", function($rootScope, $scope) {
  $scope.hideNavbar = function() {
    $("#dm-navbar").toggleClass("dm-out");
    $("#dm-overlay").toggleClass("dm-overlay-on");
  }
  $scope.killNavbar = killNavbar;
});

app.directive("linkItem", function() {
  return {
    template: ""
      + "<div class='well dm-link clearfix'>"
      + "  <div class='col-sm-3 col-xs-5'><img src='/s/assets/{{link.thumbnail}}' class='dm-thumbnail img-responsive'></div>"
      + "  <a href='{{link.link}}' class='dm-link-target'>{{link.name}}</a>"
      + "  <div class='dm-description'>"
      + "    <p>{{link.description}}</p>"
      + "  </div>"
      + "</div>"
  }
});

app.directive("dmSidebarItem", function() {
  return {
    template: ""
      + "<li ui-sref='{{item.state}}' ng-class='{active: item.state == curState}' ng-click='killNavbar();'>"
      +     "<i class='fa fa-{{item.icon}}'></i>&nbsp; {{item.name}}"
      + "</li>"
      + "<ul ng-if='item.subitems' >"
      +   "<li ng-repeat='subitem in item.subitems'"
      +      " ng-class='{active: subitem.name_s == curParams.pagename}'"
      +      " ui-sref='{{subitem.state}}{{subitem.params}}'"
      +      " ng-click='killNavbar();'>"
      +     "{{subitem.name}}" 
      +   "</li>"
      + "</ul>"
  } 
});

app.directive('includeMd', function() {
 return {
   controller: function($scope, $http, $element) {
     $scope.include = $element.context.getAttribute("include-md");
     $http.get('/api/misc/'+$scope.include)
     .success(function(page){
       $scope.title = page.params.title;
       $scope.fulltitle = page.params.fulltitle;
       $scope.text = page.text;
       $element.context.innerHTML = page.text;
       $scope.$emit('$$needsImageRecompile');
     })
     .error(function(msg, code) {
       alert(code + " Error: Page not found.");
       $state.transitionTo("404");
     });
   },
   template: ""
 };
});

app.provider('$router', function runtimeStates($stateProvider) {
  // runtime dependencies for the service can be injected here, at the provider.$get() function.
  this.$get = function($state) { // for example
    return { 
      addState: function(name, state) {
        $stateProvider.removeState(name);
        $stateProvider.state(name, state);
      }
    }
  }
});
