/* TODO
 *  [] Change the unselect action in gallery to delete media
 */
jQuery(document).ready(function ($) {
  var postID = winFromPHP.postID;
  var existingImages = winFromPHP.existingImages;
  var addButton = $("#images-upload-button");
  var imagesContainer = $("#images-container");
  var l10nOriginal = {}; // STORE ORIGINAL BUTTON VALUES
  l10nOriginal = wp.media.view.l10n; // STORE ORIGINAL BUTTON VALUES

  addButton.click(function (e) {
    e.preventDefault();

    // Set gallery state depending if there are existing images
    if (existingImages.length > 0) {
      galleryState = "gallery-edit";
    } else {
      galleryState = "gallery-library";
    }

    // Create media frame
    var winMedia = (wp.media.frames.winMedia = wp.media({
      state: galleryState,
      frame: "post",
      router: "upload",
      sortable: true,
      describe: false,
      library: {
        type: "image",
      },
      displaySettings: false,
      contentUserSetting: false,
    }));

    winMedia.on("open", function () {
      if (existingImages.length > 0) {
        // Hay imagenes por lo que creamos la variable library
        var library = winMedia.state().get("library");

        // Metemos las imágenes existentes en esa librería
        existingImages.forEach(function (id) {
          attachment = wp.media.attachment(id);
          attachment.fetch();
          library.add(attachment);
        });

        // Cambiamos el estado a editar gallery porque ya tenemos imágenes
        winMedia.state("gallery-edit").set("library", library);
        winMedia.state("gallery-edit").set("displaySettings", false);
        winMedia.setState("gallery-edit");

        winMedia.modal.focusManager.focus();
      } else {
        console.log("existing empty, we stay with defaults");
      }
    });

    winMedia.on("close", function () {
      wp.media.view.l10n = l10nOriginal;
    });

    winMedia.on("update", function () {
      console.log("update");
      // Clean images wrapper
      imagesContainer.html("");
      // Empty images to put the new ones
      existingImages.length = 0;
      // Get selected images from media frame
      var library = winMedia.state().get("library");
      console.log(library);
      // Go through each image of library and do something
      library.each(function (selectedImage, i) {
        // Get all image attributes
        var image = selectedImage.attributes;
        var thumb = image.sizes.thumbnail;
        imagesContainer.append(`
          <div class="win_image" id="win_image-${image.id}">
            <img src="${thumb.url}" width="${thumb.width}" height="${thumb.height}">
            <input type="hidden" name="img_id[]" id="img_id-${image.id}" value="${image.id}">
          </div>
        `);
        existingImages.push(image.id);
      });

      var attachments = library
        .chain()
        .filter(function (attachment) {
          return !_.isUndefined(attachment.id);
        })
        .map(function (attachment, index) {
          // Indices start at 1.
          index = index + 1;
          attachment.set("menuOrder", index);
          return [attachment.id, index];
        })
        .object()
        .value();

      if (_.isEmpty(attachments)) {
        return;
      }

      return wp.media.post("save-attachment-order", {
        nonce: wp.media.model.settings.post.nonce,
        post_id: wp.media.model.settings.post.id,
        attachments: attachments,
      });
    }); // on.update

    // CUSTOMIZE THE MAIN BUTTON TEXT
    // wp.media.view.l10n.createNewGallery = "Reordenar imágenes";
    // wp.media.view.l10n.updateGallery = "Guardar imágenes";
    // wp.media.view.l10n.insertGallery = "Guardar imágenes";

    // OPEN THE MODAL
    winMedia.open();
  }); // addButton
}); // jQuery
