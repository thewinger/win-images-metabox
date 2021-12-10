jQuery(document).ready(function($) {

  var postID = winFromPHP.postID;
  var existingImages = winFromPHP.existingImages;
  var addButton = $('#images-upload-button');
  var removeButton = $('#images-delete-button');
  var imagesUL = $('#images-list__wrapper');
  var hidden = $('#images-hidden-field');
  var l10nOriginal = {}; // STORE ORIGINAL BUTTON VALUES
  l10nOriginal = wp.media.view.l10n; // STORE ORIGINAL BUTTON VALUES
  var galleryState = existingImages ? 'gallery-edit' : 'gallery-library';
  if (existingImages) {
    existingImages = $.parseJSON(existingImages);
  }

  var winMedia = wp.media.frames.winMedia = wp.media({
    state: 'featured-gallery',
    frame: 'post',
    library: {
      type: 'image'
    }
  });

  // Create the custom view
  winMedia.states.add([
    new wp.media.controller.Library({
      id: 'featured-gallery',
      title: 'Imágenes de la propiedad',
      priority: 20,
      toolbar: 'main-gallery',
      filterable: 'uploaded',
      library: wp.media.query(winMedia.options.library),
      multiple: 'add',
      editable: false,
      displaySettings: false,
      displayUserSettings: false
    }),
  ]);

  // Store reference to wrapping html of modal
  var mediaModal = winMedia.el;
  console.log(existingImages);

  // Specify action for 'ready' action
  winMedia.on('ready', function() {
    // this tries to hide detail sidebar but doesn't work
    mediaModal.classList.add('win-media-frame');
    // fix_back_button();

  });

  // Specify action for 'open' action
  winMedia.on('open', function() {

    if ( existingImages != '') {
      var selection = winMedia.state().get('selection');
      var editState = winMedia.state('gallery-edit');
      var attachment;

      // Update selection
      existingImages.forEach(function(imageID){
        attachment = wp.media.attachment(imageID);
        attachment.fetch();
        selection.add(attachment);
      });

      editState.set('library', selection);
      winMedia.setState('gallery-edit');

      winMedia.modal.focusManager.focus();
    }

  });

  winMedia.on('close', function() {

    wp.media.view.l10n = l10nOriginal;

  });

  winMedia.on('update', function() {
    imagesUL.html('');

    winMedia.state().get('library').each(function(selectedImage,i){
      var image = selectedImage.attributes;
      var url = (image.sizes.thumbnail.url);
      selectedImage.attributes.menuorder = i;
      imagesUL.append('<img id="image-item__'+image.id+'" src="'+url+'"><input type="hidden" id="image-input__' + image.id + '" value="' + image.id + '" data-order="' + image.menuorder +'">');
      console.log(`id: ${selectedImage.attributes.id} order: ${selectedImage.attributes.menuorder}`)
    });

  });

  addButton.click(function(e) {
    e.preventDefault();


    // CUSTOMIZE THE MAIN BUTTON TEXT
    wp.media.view.l10n.createNewGallery = 'Reordenar imágenes';
    wp.media.view.l10n.updateGallery = 'Guardar imágenes';
    wp.media.view.l10n.insertGallery = 'Guardar imágenes';

    // OPEN THE MODAL

    winMedia.open();


  });
  // Create the media frame, gallery without sidebars or details


  /* win_media_frame.on( 'select', function() {
// var selectedImages = win_media_frame.state().get('selection').toJSON();
var selectedImages = win_media_frame.state().get('selection');

selectedImages.map( function(image){
image = image.toJSON();
console.log(image.menuOrder);
var url = (image.sizes.thumbnail.url);

imagesUL.append('<img id="image-item__'+image.id+'" src="'+url+'"><input type="hidden" id="image-input__' + image.id + '" value="' + image.id + '">');
});


});

win_media_frame.open(); */

   /* selectedImages.map( function( image ) ) {
      image = image.toJSON();
  }

    }
  }); */
});
