legalHub
  .directive('dropzone', function() {
    return {
      restrict: 'C',
      link: function(scope, element, attrs) {

        var config = {
          url: 'http://localhost:8080/upload',
          maxFilesize: 100,
          paramName: "uploadfile",
          maxThumbnailFilesize: 10,
          parallelUploads: 1,
          autoProcessQueue: false
        };

        var eventHandlers = {
          'addedfile': function(file) {
            scope.file = file;
            if (this.files[1]!=null) {
              this.removeFile(this.files[0]);
            }
            scope.$apply(function() {
              scope.fileAdded = true;
            });
          },

          'success': function (file, response) {
          }

        };

        dropzone = new Dropzone(element[0], config);

        angular.forEach(eventHandlers, function(handler, event) {
          dropzone.on(event, handler);
        });

        scope.processDropzone = function() {
          dropzone.processQueue();
        };

        scope.resetDropzone = function() {
          dropzone.removeAllFiles();
        }

        scope.dropzone = dropzone;
      }
    }
  });


  Dropzone.options.addFiles = {
    maxFileSize : 4,
    parallelUploads : 10,
    uploadMultiple: true,
    autoProcessQueue : false,
    addRemoveLinks : true,
    init: function() {
      var submitButton = document.querySelector("#act-on-upload")
      myDropzone = this;
      submitButton.addEventListener("click", function() {
        myDropzone.processQueue();
      });
      myDropzone.on("addedfile", function(file) {
        if (!file.type.match(/image.*/)) {
          if(file.type.match(/application.zip/)){
            myDropzone.emit("thumbnail", file, "path/to/img");
          } else {
            myDropzone.emit("thumbnail", file, "path/to/img");
          }
        }
      });
      myDropzone.on("complete", function(file) {
        myDropzone.removeFile(file);
      });
    },
  };
