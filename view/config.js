function authInterceptor(API, auth) {
  return {
    // automatically attach Authorization header
    request: function(config) {
      var token = auth.getToken();
      if(config.url.indexOf(API) === 0 && token) {
        config.headers.Authorization = 'Bearer ' + token;
      }

      return config;
    },

    // If a token was sent back, save it
    response: function(res) {
      if(res.config.url.indexOf(API) === 0 && res.data.token) {
        auth.saveToken(res.data.token);
      }

      return res;
    }
  }
}
legalHub
    .constant('API', location.origin +'/api/')
    .factory('authInterceptor', authInterceptor)
    .config(function ($httpProvider, $stateProvider, $urlRouterProvider, $locationProvider){

        $httpProvider.interceptors.push('authInterceptor');

        $urlRouterProvider.otherwise("/home");

        $stateProvider
            //------------------------------
            // HOME
            //------------------------------

            .state ('home', {
                url: '/home',
                templateUrl: 'view/modules/home/template.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                          'view/modules/collection/collection-service.js',
                          'view/modules/home/home-collection-controller.js'
                          ]);
                    }
                }
            })

            .state ('collection', {
              url: '/collection/:code',
              params: {
                collectionId: '',
                title: '',
                icon: '',
              },
              templateUrl: 'view/modules/collection/collection-template.html',
              resolve: {
                loadPlugin: function($ocLazyLoad) {
                  return $ocLazyLoad.load ([
                    'view/modules/document/document-service.js',
                    'view/modules/collection/collection-controller.js']);
                }
              }
            })

            .state ('document', {
              url: '/document/:code',
              params: {
                id: '',
                title: '',
                icon: '',
              },
              templateUrl: 'view/modules/document/document-template.html',
              resolve: {
                loadPlugin: function($ocLazyLoad) {
                  return $ocLazyLoad.load ([
                    'view/modules/document/document-service.js',
                    'view/modules/version/version-service.js',
                    'view/modules/document/document-controller.js']
                  );
                }
              }
            })

            .state ('versions', {
              url: '/versions/:code',
              params: {
                id: ''
              },
              templateUrl: 'view/modules/version/versions-template.html',
              resolve: {
                loadPlugin: function($ocLazyLoad) {
                  return $ocLazyLoad.load ([
                    'view/modules/version/version-service.js',
                    'view/modules/version/version-controller.js']
                  );
                }
              }
            })

            //------------------------------
            // HEADERS
            //------------------------------
            .state ('headers', {
                url: '/headers',
                templateUrl: 'view/views/common-2.html'
            })

            .state('headers.textual-menu', {
                url: '/textual-menu',
                templateUrl: 'view/views/textual-menu.html'
            })

            .state('headers.image-logo', {
                url: '/image-logo',
                templateUrl: 'view/views/image-logo.html'
            })

            .state('headers.mainmenu-on-top', {
                url: '/mainmenu-on-top',
                templateUrl: 'view/views/mainmenu-on-top.html'
            })


            //------------------------------
            // COLLECTION-NEW
            //------------------------------

            .state ('new-collection', {
              url: '/new/collection',
              templateUrl: 'view/views/new-collection.html'
            })

            //------------------------------
            // TYPOGRAPHY
            //------------------------------

            .state ('typography', {
                url: '/typography',
                templateUrl: 'view/views/typography.html'
            })


            //------------------------------
            // WIDGETS
            //------------------------------

            .state ('widgets', {
                url: '/widgets',
                templateUrl: 'view/views/common.html'
            })

            .state ('widgets.widgets', {
                url: '/widgets',
                templateUrl: 'view/views/widgets.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'css',
                                insertBefore: '#app-level',
                                files: [
                                    'vendors/bower_components/mediaelement/build/mediaelementplayer.css',
                                ]
                            },
                            {
                                name: 'vendors',
                                files: [
                                    'vendors/bower_components/mediaelement/build/mediaelement-and-player.js',
                                    'vendors/bower_components/autosize/dist/autosize.min.js'
                                ]
                            }
                        ])
                    }
                }
            })

            .state ('widgets.widget-templates', {
                url: '/widget-templates',
                templateUrl: 'view/views/widget-templates.html',
            })


            //------------------------------
            // TABLES
            //------------------------------

            .state ('tables', {
                url: '/tables',
                templateUrl: 'view/views/common.html'
            })

            .state ('tables.tables', {
                url: '/tables',
                templateUrl: 'view/views/tables.html'
            })

            .state ('tables.data-table', {
                url: '/data-table',
                templateUrl: 'view/views/data-table.html'
            })


            //------------------------------
            // FORMS
            //------------------------------
            .state ('manager', {
                url: '/manager',
                templateUrl: 'view/modules/manager/common.html'
            })

            .state ('manager.collection', {
              url: '/collection',
              templateUrl: 'view/modules/collection/manager-template.html',
              resolve: {
                loadPlugin: function($ocLazyLoad){
                  return $ocLazyLoad.load([
                    'view/modules/collection/collection-service.js',
                    'view/modules/collection/manager-controller.js']);
                }
              }
            })

            .state ('manager.document', {
              url: '/document',
              templateUrl: 'view/modules/document/manager-template.html',
              resolve: {
                loadPlugin: function($ocLazyLoad){
                  return $ocLazyLoad.load('view/modules/document/manager-controller.js');
                }
              }
            })

            .state ('manager.upload', {
              url: '/upload',
              params: {
                collectionId: ''
              },
              templateUrl: 'view/modules/upload/upload-template.html',
              resolve: {
                loadPlugin: function($ocLazyLoad) {
                  return $ocLazyLoad.load ([
                    'view/modules/collection/collection-service.js',
                    'view/modules/upload/manager-controller.js',
                    {
                      name: 'css',
                      insertBefore: '#app-level',
                      files: [
                      'vendors/bower_components/nouislider/jquery.nouislider.css',
                      'vendors/farbtastic/farbtastic.css',
                      'vendors/bower_components/summernote/dist/summernote.css',
                      'vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css',
                      'vendors/bower_components/chosen/chosen.min.css'
                      ]
                    },
                    {
                      name: 'vendors',
                      files: [
                      'vendors/input-mask/input-mask.min.js',
                      'vendors/bower_components/nouislider/jquery.nouislider.min.js',
                      'vendors/bower_components/moment/min/moment.min.js',
                      'vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
                      'vendors/bower_components/summernote/dist/summernote.min.js',
                      'vendors/fileinput/fileinput.min.js',
                      'vendors/bower_components/chosen/chosen.jquery.js',
                      'vendors/bower_components/angular-chosen-localytics/chosen.js',
                      'vendors/bower_components/angular-farbtastic/angular-farbtastic.js'
                      ]
                    }
                    ])
                  }
                }
            })

            .state ('new-document', {
                url: '/new-document',
                templateUrl: 'view/modules/document/new-document-template.html',
				params: {
					collectionId: ''
				},
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load([
						'view/modules/version/version-service.js',
						'view/modules/rendition/rendition-service.js',
						'view/modules/document/new-document-controller.js',
						'view/modules/editor/schema-legis.js',
						'view/modules/editor/legalhub-editor.js',
						'view/modules/editor/start.js',
						'view/modules/editor/css/legislative.css',
						'view/modules/editor/css/common.css',
						'view/modules/editor/css/default.css',
						'view/modules/editor/css/paper.css',
            {
              name: 'css',
              insertBefore: '#app-level',
              files: [
              'view/vendors/bower_components/nouislider/jquery.nouislider.css',
              'view/vendors/farbtastic/farbtastic.css',
              'view/vendors/bower_components/summernote/dist/summernote.css',
              'view/vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css',
              'view/vendors/bower_components/chosen/chosen.min.css'
              ]
            },
            {
              name: 'vendors',
              files: [
              'view/vendors/input-mask/input-mask.min.js',
              'view/vendors/bower_components/nouislider/jquery.nouislider.min.js',
              'view/vendors/bower_components/moment/min/moment.min.js',
              'view/vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
              'view/vendors/bower_components/summernote/dist/summernote.min.js',
              'view/vendors/fileinput/fileinput.min.js',
              'view/vendors/bower_components/chosen/chosen.jquery.js',
              'view/vendors/bower_components/angular-chosen-localytics/chosen.js',
              'view/vendors/bower_components/angular-farbtastic/angular-farbtastic.js'
              ]
            }]);
                    }
                }
            })

            .state ('form.form-components', {
                url: '/form-components',
                templateUrl: 'view/views/form-components.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'css',
                                insertBefore: '#app-level',
                                files: [
                                    'vendors/bower_components/nouislider/jquery.nouislider.css',
                                    'vendors/farbtastic/farbtastic.css',
                                    'vendors/bower_components/summernote/dist/summernote.css',
                                    'vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css',
                                    'vendors/bower_components/chosen/chosen.min.css'
                                ]
                            },
                            {
                                name: 'vendors',
                                files: [
                                    'vendors/input-mask/input-mask.min.js',
                                    'vendors/bower_components/nouislider/jquery.nouislider.min.js',
                                    'vendors/bower_components/moment/min/moment.min.js',
                                    'vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
                                    'vendors/bower_components/summernote/dist/summernote.min.js',
                                    'vendors/fileinput/fileinput.min.js',
                                    'vendors/bower_components/chosen/chosen.jquery.js',
                                    'vendors/bower_components/angular-chosen-localytics/chosen.js',
                                    'vendors/bower_components/angular-farbtastic/angular-farbtastic.js'
                                ]
                            }
                        ])
                    }
                }
            })

            .state ('form.form-examples', {
                url: '/form-examples',
                templateUrl: 'view/views/form-examples.html'
            })

            .state ('form.form-validations', {
                url: '/form-validations',
                templateUrl: 'view/views/form-validations.html'
            })


            //------------------------------
            // USER INTERFACE
            //------------------------------

            .state ('user-interface', {
                url: '/user-interface',
                templateUrl: 'view/views/common.html'
            })

            .state ('user-interface.ui-bootstrap', {
                url: '/ui-bootstrap',
                templateUrl: 'view/views/ui-bootstrap.html'
            })

            .state ('user-interface.colors', {
                url: '/colors',
                templateUrl: 'view/views/colors.html'
            })

            .state ('user-interface.animations', {
                url: '/animations',
                templateUrl: 'view/views/animations.html'
            })

            .state ('user-interface.box-shadow', {
                url: '/box-shadow',
                templateUrl: 'view/views/box-shadow.html'
            })

            .state ('user-interface.buttons', {
                url: '/buttons',
                templateUrl: 'view/views/buttons.html'
            })

            .state ('user-interface.icons', {
                url: '/icons',
                templateUrl: 'view/views/icons.html'
            })

            .state ('user-interface.alerts', {
                url: '/alerts',
                templateUrl: 'view/views/alerts.html'
            })

            .state ('user-interface.preloaders', {
                url: '/preloaders',
                templateUrl: 'view/views/preloaders.html'
            })

            .state ('user-interface.notifications-dialogs', {
                url: '/notifications-dialogs',
                templateUrl: 'view/views/notification-dialog.html'
            })

            .state ('user-interface.media', {
                url: '/media',
                templateUrl: 'view/views/media.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'css',
                                insertBefore: '#app-level',
                                files: [
                                    'vendors/bower_components/mediaelement/build/mediaelementplayer.css',
                                    'vendors/bower_components/lightgallery/light-gallery/css/lightGallery.css'
                                ]
                            },
                            {
                                name: 'vendors',
                                files: [
                                    'vendors/bower_components/mediaelement/build/mediaelement-and-player.js',
                                    'vendors/bower_components/lightgallery/light-gallery/js/lightGallery.min.js'
                                ]
                            }
                        ])
                    }
                }
            })

            .state ('user-interface.other-components', {
                url: '/other-components',
                templateUrl: 'view/views/other-components.html'
            })


            //------------------------------
            // CHARTS
            //------------------------------

            .state ('charts', {
                url: '/charts',
                templateUrl: 'view/views/common.html'
            })

            .state ('charts.flot-charts', {
                url: '/flot-charts',
                templateUrl: 'view/views/flot-charts.html',
            })

            .state ('charts.other-charts', {
                url: '/other-charts',
                templateUrl: 'view/views/other-charts.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'vendors',
                                files: [
                                    'vendors/sparklines/jquery.sparkline.min.js',
                                    'vendors/bower_components/jquery.easy-pie-chart/dist/jquery.easypiechart.min.js',
                                ]
                            }
                        ])
                    }
                }
            })


            //------------------------------
            // CALENDAR
            //------------------------------

            .state ('calendar', {
                url: '/calendar',
                templateUrl: 'view/views/calendar.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'css',
                                insertBefore: '#app-level',
                                files: [
                                    'vendors/bower_components/fullcalendar/dist/fullcalendar.min.css',
                                ]
                            },
                            {
                                name: 'vendors',
                                files: [
                                    'vendors/bower_components/moment/min/moment.min.js',
                                    'vendors/bower_components/fullcalendar/dist/fullcalendar.min.js'
                                ]
                            }
                        ])
                    }
                }
            })


            //------------------------------
            // PHOTO GALLERY
            //------------------------------

             .state ('photo-gallery', {
                url: '/photo-gallery',
                templateUrl: 'view/views/common.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'css',
                                insertBefore: '#app-level',
                                files: [
                                    'vendors/bower_components/lightgallery/light-gallery/css/lightGallery.css'
                                ]
                            },
                            {
                                name: 'vendors',
                                files: [
                                    'vendors/bower_components/lightgallery/light-gallery/js/lightGallery.min.js'
                                ]
                            }
                        ])
                    }
                }
            })

            //Default

            .state ('photo-gallery.photos', {
                url: '/photos',
                templateUrl: 'view/views/photos.html'
            })

            //Timeline

            .state ('photo-gallery.timeline', {
                url: '/timeline',
                templateUrl: 'view/views/photo-timeline.html'
            })


            //------------------------------
            // GENERIC CLASSES
            //------------------------------

            .state ('generic-classes', {
                url: '/generic-classes',
                templateUrl: 'view/views/generic-classes.html'
            })


            //------------------------------
            // PAGES
            //------------------------------

            .state ('pages', {
                url: '/pages',
                templateUrl: 'view/views/common.html'
            })


            //Profile

            .state ('pages.profile', {
                url: '/profile',
                templateUrl: 'view/views/profile.html'
            })

            .state ('pages.profile.profile-about', {
                url: '/profile-about',
                templateUrl: 'view/views/profile-about.html'
            })

            .state ('pages.profile.profile-timeline', {
                url: '/profile-timeline',
                templateUrl: 'view/views/profile-timeline.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'css',
                                insertBefore: '#app-level',
                                files: [
                                    'vendors/bower_components/lightgallery/light-gallery/css/lightGallery.css'
                                ]
                            },
                            {
                                name: 'vendors',
                                files: [
                                    'vendors/bower_components/lightgallery/light-gallery/js/lightGallery.min.js'
                                ]
                            }
                        ])
                    }
                }
            })

            .state ('pages.profile.profile-photos', {
                url: '/profile-photos',
                templateUrl: 'view/views/profile-photos.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'css',
                                insertBefore: '#app-level',
                                files: [
                                    'vendors/bower_components/lightgallery/light-gallery/css/lightGallery.css'
                                ]
                            },
                            {
                                name: 'vendors',
                                files: [
                                    'vendors/bower_components/lightgallery/light-gallery/js/lightGallery.min.js'
                                ]
                            }
                        ])
                    }
                }
            })

            .state ('pages.profile.profile-connections', {
                url: '/profile-connections',
                templateUrl: 'view/views/profile-connections.html'
            })


            //-------------------------------

            .state ('pages.listview', {
                url: '/listview',
                templateUrl: 'view/views/list-view.html'
            })

            .state ('pages.messages', {
                url: '/messages',
                templateUrl: 'view/views/messages.html'
            })

            .state ('pages.pricing-table', {
                url: '/pricing-table',
                templateUrl: 'view/views/pricing-table.html'
            })

            .state ('pages.contacts', {
                url: '/contacts',
                templateUrl: 'view/views/contacts.html'
            })

            .state ('pages.invoice', {
                url: '/invoice',
                templateUrl: 'view/views/invoice.html'
            })

            .state ('pages.wall', {
                url: '/wall',
                templateUrl: 'view/views/wall.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'vendors',
                                insertBefore: '#app-level',
                                files: [
                                    'vendors/bower_components/autosize/dist/autosize.min.js',
                                    'vendors/bower_components/lightgallery/light-gallery/css/lightGallery.css'
                                ]
                            },
                            {
                                name: 'vendors',
                                files: [
                                    'vendors/bower_components/mediaelement/build/mediaelement-and-player.js',
                                    'vendors/bower_components/lightgallery/light-gallery/js/lightGallery.min.js'
                                ]
                            }
                        ])
                    }
                }
            })

            //------------------------------
            // BREADCRUMB DEMO
            //------------------------------
            .state ('breadcrumb-demo', {
                url: '/breadcrumb-demo',
                templateUrl: 'view/views/breadcrumb-demo.html'
            })

        // use the HTML5 History API
        $locationProvider.html5Mode(true);
    });
