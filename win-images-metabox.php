<?php
/**
 * Plugin Name:       Win Images Metabox
 * Description:       Actions for metaboxes
 * Version:           1.0
 * Author:            Win
 * Author URI:        http://alejandrocamara.info/
 */

/** TODOs
* [] Delete all media when post delete
*/

if ( ! defined('ABSPATH')) {
  exit;
}

function win_admin_enqueue_scripts() {
  global $pagenow, $typenow, $post;


  if ( ($pagenow == 'post.php' || $pagenow == 'post-edit.php') && $typenow == 'gtre' ) {
    $args = array(
      'post_parent'    => $post->ID,
      'fields'         => 'ids',
      'orderby'        => 'menu_order',
      'order'          => 'ASC',
      'post_mime_type' => 'image',
      'post_type'      => 'attachment'
    );

    $get_children_array = get_children( $args );
    $existingImages = false;
    // Send true if posts has images
    if ( $get_children_array ) {
      $existingImages = json_encode($get_children_array);
    }

    wp_enqueue_media([
      'post'=> $post->ID
    ]);
    wp_enqueue_style('win-images-css', plugins_url('css/win-images-metabox.css', __FILE__));
    wp_enqueue_script('win-images-js', plugins_url('js/win-images-metabox.js', __FILE__), array( 'jquery' ), '20211206', true);
    wp_localize_script('win-images-js', 'winFromPHP', array(
      'postID'          => $post->ID,
      'wpAdminAjaxURL'  => admin_url('admin-ajax.php'),
      'existingImages'  => $existingImages
    ));
  }

}
add_action( 'admin_enqueue_scripts', 'win_admin_enqueue_scripts' );

// https://developer.wordpress.org/reference/functions/add_meta_box/

function win_add_images_metabox() {

  add_meta_box(
    'win-images',
    'Imagenes',
    'win_show_images_callback',
    'gtre',
    'normal',
    'high',
  );

}

add_action( 'add_meta_boxes', 'win_add_images_metabox');


function win_show_images_callback( /* $post  */) {
  wp_nonce_field( basename( __FILE__ ), 'win_images_nonce');

  ?>
  <div id="images-list__wrapper">
<?php
      if ( $images = get_children(array(
        'post_parent' => get_the_ID(),
        'post_type' => 'attachment',
        'order' => 'ASC',
        'orderby' => 'menu_order',
        'post_mime_type' => 'image',)) )
      {
        foreach( $images as $image ) {
          // $attachmenturl=wp_get_attachment_url($image->ID);
          $attachmentimage=wp_get_attachment_image($image->ID, 'thumbnail');
          // $img_title = $image->post_title;
          // $img_desc = $image->post_excerpt;
          // $tmp='http://'.$_SERVER['SERVER_NAME'].$_SERVER['PHP_SELF'] .'?post='.$_GET['post'].'&action=edit&id='.$image->ID;
          echo '
                '.$attachmentimage.'
                <a href="#" class="image-delete">Borrar</a>
                <input type="hidden" id="image-preview__'.$image->ID.'" value="images_date">
          ';
        }
        echo '
    </div>
          <input type="button" id="images-upload-button" class="button" value="Editar imágenes">
          <input type="button" id="images-delete-button" class="button" value="Borrar todas">
        ';
      } else {
        echo '
    </div>
          <input type="button" id="images-upload-button" class="button" value="Añadir imágenes">
        ';
      }
}



?>
