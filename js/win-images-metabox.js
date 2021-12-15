jQuery(document).ready(function ($) {
  var postID = winFromPHP.postID;
  var existingImages = winFromPHP.existingImages;
  console.log(`existingImages ${existingImages}`);
  console.log(`existingVar ${existingImages.length}`);
  console.log(`existingVarType ${$.type(existingImages)}`);

  var addButton = $("#images-upload-button");
  var removeButton = $("#images-delete-button");
  var imagesUL = $("#images-container");
  var hidden = $("#images-hidden-field");
  var l10nOriginal = {}; // STORE ORIGINAL BUTTON VALUES
  l10nOriginal = wp.media.view.l10n; // STORE ORIGINAL BUTTON VALUES

  addButton.click(function (e) {
    e.preventDefault();

    if (existingImages.length > 0) {
      // existingImages = $.parseJSON(existingImages);
      galleryState = "gallery-edit";
    } else {
      galleryState = "gallery-library";
    }

    var winMedia = (wp.media.frames.winMedia = wp.media({
      state: galleryState,
      frame: "post",
      sortable: true,
      library: {
        type: "image",
      },
      // TODO contentUserSetting not working
      contentUserSetting: false,
    }));

    // Specify action for 'open' action
    winMedia.on("open", function () {
      if (existingImages.length > 0) {
        // Hay imagenes por lo que creamos la variable library y
        var library = winMedia.state().get("library");
        var selection = winMedia.state().get("selection");
        // Update selection
        existingImages.forEach(function (id) {
          attachment = wp.media.attachment(id);
          attachment.fetch();
          // selection.add( attachment );
          library.add(attachment);
        });

        // TODO Hide Attachemnt and Gallery Settings left bar
        winMedia.state("gallery-edit").set("library", library);
        winMedia.state("gallery-edit").set("displaySettings", false);
        // winMedia.state("gallery-edit").set("selection", selection);
        winMedia.setState("gallery-edit");

        winMedia.modal.focusManager.focus();
      } else {
        console.log("existing empty, we stay with defaults");
      }
    });

    winMedia.on("close", function () {
      wp.media.view.l10n = l10nOriginal;
    });

    // This doesn't do anything in gallery mode
    winMedia.on("insert", function () {
      console.log("inserted");
    });

    winMedia.on("select", function () {
      console.log("selected");
    });

    winMedia.on("update", function () {
      console.log("update");
      // Clean images wrapper
      imagesUL.html("");
      // Empty images to put the new ones
      existingImages.length = 0;
      // Get selected images from media frame
      var library = winMedia.state().get("library");
      var selection = winMedia.state().get("selection");
      console.log(library);
      // Go through each image of library and do something
      library.each(function (selectedImage, i) {
        // Get all image attributes
        var image = selectedImage.attributes;
        var thumb = image.sizes.thumbnail;
        image.menuOrder = i;
        imagesUL.append(`
          <div class="win_image" id="win_image-${image.id}">
            <img src="${thumb.url}" width="${thumb.width}" height="${thumb.height}">
            <a href="#" class="image-delete">Borrar</a>
            <input type="hidden" name="img_id[]" id="img_id-${image.id}" value="${image.id}">
          </div>
        `);
        console.log(
          `id: ${image.id} name: ${image.filename} order: ${image.menuOrder}`
        );
        existingImages.push(image.id);
      });
      // tried to set the library save the new menuOrder but didn't work
      // console.log(library);
      console.log(selection);
      // winMedia.state().set('library', library);
      console.log("Update done");
    });

    // CUSTOMIZE THE MAIN BUTTON TEXT
    // wp.media.view.l10n.createNewGallery = "Reordenar imágenes";
    // wp.media.view.l10n.updateGallery = "Guardar imágenes";
    // wp.media.view.l10n.insertGallery = "Guardar imágenes";

    // OPEN THE MODAL
    winMedia.open();
  }); // addButton
}); // jQuery
