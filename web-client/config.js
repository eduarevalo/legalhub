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
                templateUrl: 'web-client/modules/home/template.html',
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                          'web-client/modules/collection/collection-service.js',
                          'web-client/modules/home/home-collection-controller.js'
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
              templateUrl: 'web-client/modules/collection/collection-template.html',
              resolve: {
                loadPlugin: function($ocLazyLoad) {
                  return $ocLazyLoad.load ([
                    'web-client/modules/document/document-service.js',
                    'web-client/modules/collection/collection-service.js',
                    'web-client/modules/collection/collection-controller.js']);
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
              templateUrl: 'web-client/modules/document/document-template.html',
              resolve: {
                loadPlugin: function($ocLazyLoad) {
                  return $ocLazyLoad.load ([
					'web-client/js/pdf.js',
				    'web-client/modules/document/pdf-render.js',
                    'web-client/modules/document/document-service.js',
					'web-client/modules/collection/collection-service.js',
                    'web-client/modules/version/version-service.js',
                    'web-client/modules/document/document-controller.js']
                  );
                }
              }
            })

			.state ('engross', {
              url: '/engross/:code',
              params: {
                id: '',
                title: '',
                icon: '',
              },
              templateUrl: 'web-client/modules/engross/engross-template.html',
              resolve: {
                loadPlugin: function($ocLazyLoad) {
                  return $ocLazyLoad.load ([
					'web-client/modules/engross/engross-service.js',
                    'web-client/modules/document/document-service.js',
					'web-client/modules/collection/collection-service.js',
                    'web-client/modules/version/version-service.js',
                    'web-client/modules/engross/drag-and-drop.js',
                    'web-client/modules/engross/engross-controller.js']
                  );
                }
              }
            })

            .state ('versions', {
              url: '/versions/:code',
              params: {
                id: ''
              },
              templateUrl: 'web-client/modules/version/versions-template.html',
              resolve: {
                loadPlugin: function($ocLazyLoad) {
                  return $ocLazyLoad.load ([
                    'web-client/modules/version/version-service.js',
                    'web-client/modules/version/version-controller.js']
                  );
                }
              }
            })

            //------------------------------
            // HEADERS
            //------------------------------
            .state ('headers', {
                url: '/headers',
                templateUrl: 'web-client/views/common-2.html'
            })

            .state('headers.textual-menu', {
                url: '/textual-menu',
                templateUrl: 'web-client/views/textual-menu.html'
            })

            .state('headers.image-logo', {
                url: '/image-logo',
                templateUrl: 'web-client/views/image-logo.html'
            })

            .state('headers.mainmenu-on-top', {
                url: '/mainmenu-on-top',
                templateUrl: 'web-client/views/mainmenu-on-top.html'
            })


            //------------------------------
            // COLLECTION-NEW
            //------------------------------

            .state ('new-collection', {
              url: '/new/collection',
              templateUrl: 'web-client/views/new-collection.html'
            })

            //------------------------------
            // TYPOGRAPHY
            //------------------------------

            .state ('typography', {
                url: '/typography',
                templateUrl: 'web-client/views/typography.html'
            })


            //------------------------------
            // WIDGETS
            //------------------------------

            .state ('widgets', {
                url: '/widgets',
                templateUrl: 'web-client/views/common.html'
            })

            .state ('widgets.widgets', {
                url: '/widgets',
                templateUrl: 'web-client/views/widgets.html',
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
                templateUrl: 'web-client/views/widget-templates.html',
            })


            //------------------------------
            // TABLES
            //------------------------------

            .state ('tables', {
                url: '/tables',
                templateUrl: 'web-client/views/common.html'
            })

            .state ('tables.tables', {
                url: '/tables',
                templateUrl: 'web-client/views/tables.html'
            })

            .state ('tables.data-table', {
                url: '/data-table',
                templateUrl: 'web-client/views/data-table.html'
            })


            //------------------------------
            // FORMS
            //------------------------------
            .state ('manager', {
                url: '/manager',
                templateUrl: 'web-client/modules/manager/common.html'
            })

            .state ('manager.collection', {
              url: '/collection',
              templateUrl: 'web-client/modules/collection/manager-template.html',
              resolve: {
                loadPlugin: function($ocLazyLoad){
                  return $ocLazyLoad.load([
                    'web-client/modules/collection/collection-service.js',
                    'web-client/modules/collection/manager-controller.js']);
                }
              }
            })

            .state ('manager.document', {
              url: '/document',
              templateUrl: 'web-client/modules/document/manager-template.html',
              resolve: {
                loadPlugin: function($ocLazyLoad){
                  return $ocLazyLoad.load('web-client/modules/document/manager-controller.js');
                }
              }
            })

            .state ('manager.upload', {
              url: '/upload',
              params: {
                collectionId: ''
              },
              templateUrl: 'web-client/modules/upload/upload-template.html',
              resolve: {
                loadPlugin: function($ocLazyLoad) {
                  return $ocLazyLoad.load ([
                    'web-client/modules/collection/collection-service.js',
                    'web-client/modules/upload/manager-controller.js',
                    {
                      name: 'css',
                      insertBefore: '#app-level',
                      files: [
						'web-client/vendors/bower_components/nouislider/jquery.nouislider.css',
						'web-client/vendors/farbtastic/farbtastic.css',
						'web-client/vendors/bower_components/summernote/dist/summernote.css',
						'web-client/vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css',
						'web-client/vendors/bower_components/chosen/chosen.min.css'
                      ]
                    },
                    {
                      name: 'vendors',
                      files: [
						'web-client/vendors/input-mask/input-mask.min.js',
						'web-client/vendors/bower_components/nouislider/jquery.nouislider.min.js',
						'web-client/vendors/bower_components/moment/min/moment.min.js',
						'web-client/vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
						'web-client/vendors/bower_components/summernote/dist/summernote.min.js',
						'web-client/vendors/fileinput/fileinput.min.js',
						'web-client/vendors/bower_components/chosen/chosen.jquery.js',
						'web-client/vendors/bower_components/angular-chosen-localytics/chosen.js',
						'web-client/vendors/bower_components/angular-farbtastic/angular-farbtastic.js'
                      ]
                    }
                    ])
                  }
                }
            })

            .state ('new-document', {
                url: '/edit',
                templateUrl: 'web-client/modules/document/new-document-template.html',
				        params: {
					          collectionId: '',
                    documentId: '',
                    documentTitle: '',
                    template: ''
				        },
                resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load([
						'web-client/modules/version/version-service.js',
						'web-client/modules/rendition/rendition-service.js',
						'web-client/modules/reference/reference-service.js',
						'web-client/modules/document/document-service.js',
						'web-client/modules/document/new-document-controller.js',
						'web-client/modules/editor/schema-bill.js',
						'web-client/modules/editor/schema-amendment.js',
						'web-client/modules/editor/legalhub-editor.js',
						'web-client/modules/editor/start.js',
						'web-client/modules/editor/css/legislative.css',
						'web-client/modules/editor/css/common.css',
						'web-client/modules/editor/css/default.css',
						/*'web-client/modules/editor/css/paper.css',
						'web-client/modules/editor/css/connecticut.css',*/
						'web-client/modules/editor/css/demoa.css',
						'web-client/modules/editor/css/demob.css',
						'web-client/modules/editor/css/democ.css',
            {
              name: 'css',
              insertBefore: '#app-level',
              files: [
              'web-client/vendors/bower_components/nouislider/jquery.nouislider.css',
              'web-client/vendors/farbtastic/farbtastic.css',
              'web-client/vendors/bower_components/summernote/dist/summernote.css',
              'web-client/vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css',
              'web-client/vendors/bower_components/chosen/chosen.min.css'
              ]
            },
            {
              name: 'vendors',
              files: [
              'web-client/vendors/input-mask/input-mask.min.js',
              'web-client/vendors/bower_components/nouislider/jquery.nouislider.min.js',
              'web-client/vendors/bower_components/moment/min/moment.min.js',
              'web-client/vendors/bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
              'web-client/vendors/bower_components/summernote/dist/summernote.min.js',
              'web-client/vendors/fileinput/fileinput.min.js',
              'web-client/vendors/bower_components/chosen/chosen.jquery.js',
              'web-client/vendors/bower_components/angular-chosen-localytics/chosen.js',
              'web-client/vendors/bower_components/angular-farbtastic/angular-farbtastic.js'
              ]
            }]);
                    }
                }
            })

            .state ('form.form-components', {
                url: '/form-components',
                templateUrl: 'web-client/views/form-components.html',
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
                templateUrl: 'web-client/views/form-examples.html'
            })

            .state ('form.form-validations', {
                url: '/form-validations',
                templateUrl: 'web-client/views/form-validations.html'
            })


            //------------------------------
            // USER INTERFACE
            //------------------------------

            .state ('user-interface', {
                url: '/user-interface',
                templateUrl: 'web-client/views/common.html'
            })

            .state ('user-interface.ui-bootstrap', {
                url: '/ui-bootstrap',
                templateUrl: 'web-client/views/ui-bootstrap.html'
            })

            .state ('user-interface.colors', {
                url: '/colors',
                templateUrl: 'web-client/views/colors.html'
            })

            .state ('user-interface.animations', {
                url: '/animations',
                templateUrl: 'web-client/views/animations.html'
            })

            .state ('user-interface.box-shadow', {
                url: '/box-shadow',
                templateUrl: 'web-client/views/box-shadow.html'
            })

            .state ('user-interface.buttons', {
                url: '/buttons',
                templateUrl: 'web-client/views/buttons.html'
            })

            .state ('user-interface.icons', {
                url: '/icons',
                templateUrl: 'web-client/views/icons.html'
            })

            .state ('user-interface.alerts', {
                url: '/alerts',
                templateUrl: 'web-client/views/alerts.html'
            })

            .state ('user-interface.preloaders', {
                url: '/preloaders',
                templateUrl: 'web-client/views/preloaders.html'
            })

            .state ('user-interface.notifications-dialogs', {
                url: '/notifications-dialogs',
                templateUrl: 'web-client/views/notification-dialog.html'
            })

            .state ('user-interface.media', {
                url: '/media',
                templateUrl: 'web-client/views/media.html',
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
                templateUrl: 'web-client/views/other-components.html'
            })


            //------------------------------
            // CHARTS
            //------------------------------

            .state ('charts', {
                url: '/charts',
                templateUrl: 'web-client/views/common.html'
            })

            .state ('charts.flot-charts', {
                url: '/flot-charts',
                templateUrl: 'web-client/views/flot-charts.html',
            })

            .state ('charts.other-charts', {
                url: '/other-charts',
                templateUrl: 'web-client/views/other-charts.html',
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
                templateUrl: 'web-client/views/calendar.html',
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
                templateUrl: 'web-client/views/common.html',
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
                templateUrl: 'web-client/views/photos.html'
            })

            //Timeline

            .state ('photo-gallery.timeline', {
                url: '/timeline',
                templateUrl: 'web-client/views/photo-timeline.html'
            })


            //------------------------------
            // GENERIC CLASSES
            //------------------------------

            .state ('generic-classes', {
                url: '/generic-classes',
                templateUrl: 'web-client/views/generic-classes.html'
            })


            //------------------------------
            // PAGES
            //------------------------------

            .state ('pages', {
                url: '/pages',
                templateUrl: 'web-client/views/common.html'
            })


            //Profile

            .state ('pages.profile', {
                url: '/profile',
                templateUrl: 'web-client/views/profile.html'
            })

            .state ('pages.profile.profile-about', {
                url: '/profile-about',
                templateUrl: 'web-client/views/profile-about.html'
            })

            .state ('pages.profile.profile-timeline', {
                url: '/profile-timeline',
                templateUrl: 'web-client/views/profile-timeline.html',
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
                templateUrl: 'web-client/views/profile-photos.html',
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
                templateUrl: 'web-client/views/profile-connections.html'
            })


            //-------------------------------

            .state ('pages.listview', {
                url: '/listview',
                templateUrl: 'web-client/views/list-view.html'
            })

            .state ('pages.messages', {
                url: '/messages',
                templateUrl: 'web-client/views/messages.html'
            })

            .state ('pages.pricing-table', {
                url: '/pricing-table',
                templateUrl: 'web-client/views/pricing-table.html'
            })

            .state ('pages.contacts', {
                url: '/contacts',
                templateUrl: 'web-client/views/contacts.html'
            })

            .state ('pages.invoice', {
                url: '/invoice',
                templateUrl: 'web-client/views/invoice.html'
            })

            .state ('pages.wall', {
                url: '/wall',
                templateUrl: 'web-client/views/wall.html',
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
                templateUrl: 'web-client/views/breadcrumb-demo.html'
            })

        // use the HTML5 History API
        $locationProvider.html5Mode(true);
    });
