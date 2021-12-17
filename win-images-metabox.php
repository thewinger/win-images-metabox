<?php

/**
 * Plugin Name:       Win Images Metabox
 * Description:       Actions for metaboxes
 * Version:           1.0
 * Author:            Win
 * Author URI:        http://alejandrocamara.info/
 */

if (!defined('ABSPATH')) {
  exit;
}

function win_admin_enqueue_scripts()
{
  global $pagenow, $typenow, $post;


  if (($pagenow == 'post.php' || $pagenow == 'post-edit.php') && $typenow == 'gtre') {
    $args = array(
      'post_parent'    => $post->ID,
      'numberposts'    => -1, // show all
      'fields'         => 'ids',
      'orderby'        => 'menu_order',
      'order'          => 'ASC',
      'post_mime_type' => 'image',
      'post_type'      => 'attachment'
    );

    $existingImages = get_children($args);

    wp_enqueue_media([
      'post' => $post->ID
    ]);
    wp_enqueue_style('win-images-css', plugins_url('css/win-images-metabox.css', __FILE__));
    wp_enqueue_script('win-images-js', plugins_url('js/win-images-metabox.js', __FILE__), array('jquery'), '20211206', true);
    wp_add_inline_script('win-images-js', 'const winFromPHP =' . json_encode(array(
      'postID'          => $post->ID,
      'wpAdminAjaxURL'  => admin_url('admin-ajax.php'),
      'existingImages'  => $existingImages
    )), 'before');
  }
}
add_action('admin_enqueue_scripts', 'win_admin_enqueue_scripts');


function win_add_images_metabox()
{

  add_meta_box(
    'win-images',
    'Galeria',
    'win_show_images_callback',
    'gtre',
    'normal',
    'high',
  );
}

add_action('add_meta_boxes_gtre', 'win_add_images_metabox');


function win_show_images_callback($post)
{

  $args = array(
    'post_parent'     => $post->ID,
    'post_type'       => 'attachment',
    'post_mime_type'  => 'image',
    'post_status'     => null,
    'numberposts'     => -1, // show all
    'order'           => 'asc',
    'orderby'         => 'menu_order',
  );

  $images = get_children($args);
  if ($images) {
    wp_nonce_field('my_images_sort', 'images_sort_nonce');
    echo '<div id="images-container">';
    foreach ($images as $image) {
      $imageID = $image->ID;
      $imageSrc = wp_get_attachment_image_src($image->ID, 'thumbnail');
      echo '
        <div class="win_image" id="win_image-' . $imageID . '">
          <img src="' . $imageSrc[0] . '" width="' . $imageSrc[1] . '" height="' . $imageSrc[2] . '">
          <input type="hidden" name="img_id[]" id="img_id-' . $imageID . '" value="' . $imageID . '" data-order="' . $image->menu_order . '">
        </div>
      ';
    }
    echo '
      </div> <!-- images-container -->
      <input type="button" id="images-upload-button" class="button" value="Editar galería">
    ';
  } else {
    echo '
      </div> <!-- images-container -->
      <input type="button" id="images-upload-button" class="button" value="Añadir imágenes">
    ';
  }
}

add_action('before_delete_post', 'delete_all_attached_media');

function delete_all_attached_media($post_id)
{
  if (get_post_type($post_id) == 'gtre') {
    $attachments = get_attached_media('', $post_id);
    foreach ($attachments as $attachment) {
      wp_delete_attachment($attachment->ID, 'true');
    }
  }
}
