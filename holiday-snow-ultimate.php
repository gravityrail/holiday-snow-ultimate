<?php

/**
 * The plugin bootstrap file
 *
 * @link              http://goldsounds.com
 * @since             1.0.0
 * @package           holiday-snow-ultimate
 *
 * @wordpress-plugin
 * Plugin Name:       &#x2744; Holiday Snow Ultimate
 * Plugin URI:        http://goldsounds.com/plugins/holiday-snow-ultimate
 * Description:       Experience holiday snow on your blog LIKE NEVER BEFORE
 * Version:           1.0
 * Author:            Daniel Walmsley
 * Author URI:        http://goldsounds.com
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       holiday-snow-ultimate
 * Domain Path:       /languages
 */

/**
 * Note this plugin relies on the WebXR plugin being activate
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

function hsu_add_vr_snow( $wp_query ) {
	if ( is_home() && class_exists( 'AFrame_Scene_Builder' ) ) {
		// render a scene with all the posts in it
		$vr_query = new WP_Query( $wp_query->query );
		$background_url = htmlspecialchars( plugin_dir_url( __FILE__ ) . 'images/bg.jpg' );
		$snowflake_url = htmlspecialchars( plugin_dir_url( __FILE__ ) . 'images/snowflake2.png' );
		$scene = new AFrame_Scene_Builder(
			'hsu-posts-snow',
			array(
				// 'background' => 'color: black; transparent: false',
				'fog' => "type: exponential; color: #FFF; near: 1; far: 100",
				// 'material-snow' => true//'color: white; background-image: url(' . $background_url . ')',
				'particles-snow' => 'sprite: url(' . $snowflake_url . ')',
			),
			true // embedded
		);
		// $scene->add_child( 'a-mountain',
		// 	array(
		// 		'color' => 'red',
		// 		'position' => "0 0 0"
		// 	)
		// );

		// skybox with snowy mountains
		$snowy_mountains_url = htmlspecialchars( plugin_dir_url( __FILE__ ) . 'images/snowy-mountains.jpg' );
		$scene->add_asset( new AFrame_Img( array( 'id' => 'mountains', 'src' => $snowy_mountains_url ) ) );
		$scene->add_child( new AFrame_Element( 'a-sky', array( 'src' => '#mountains' ) ) );

		// road into the distance
		$road_url = htmlspecialchars( plugin_dir_url( __FILE__ ) . 'images/road.jpg' );
		$scene->add_asset( new AFrame_Img( array( 'id' => 'road', 'src' => $road_url ) ) );
		$scene->add_entity(
			array(
				'geometry' => array( 'primitive' => 'plane', 'width' => 500, 'height' => 4 ),
				'material' => array( 'src' => 'url(' . $road_url . ')', 'repeat' => "100 1" ),
				'rotation' => "-90 90 0"
			)
		);

		// ground plane
		$scene->add_entity(
			array(
				'geometry' => array( 'primitive' => 'plane', 'width' => 400, 'height' => 400 ),
				'material' => 'color: #AAC;', // snow
				'rotation' => "-90 0 0",
				'position' => "-50 -0.1 -50"
			)
		);

		$lamp_url = htmlspecialchars( plugin_dir_url( __FILE__ ) . 'models/light.dae' );
		$scene->add_asset( new AFrame_Asset_Item( array( 'id' => 'lamp', 'src' => $lamp_url ) ) );

		// render the posts as billboards
		$z = -1;
		$side = 'left'; // alternate between left and right side of the road
		foreach ( $vr_query->get_posts() as $post ) {
			$z -= 1;

			// add a plane
			// $scene->add_entity(
			// 	array(
			// 		'geometry' => array( 'primitive' => 'plane', 'width' => 20, 'height' => 10 )
			// 	)
			// );

			$scene->add_entity(
				array(
					// gets converted to CSS attribute in a-frame
					'geometry' => array( 'primitive' => 'plane', 'width' => 2, 'height' => 0.5 ),
					'material' => array( 'color' => '#841' ),
					'text' => array(
						'color' => 'yellow',
						'align' => 'center',
						'value' => "'".addslashes($post->post_title)."'", // I know this is weird, but it's a neat trick for CSS strings
						'width' => 2
					),
					'position' => 'left' === $side ? "-2 2 $z" : "2 2 $z",
					'rotation' => 'left' === $side ? "0 15 0" : "0 -15 0"
				)
			);

			// add a lamp for the post - LAMP POST, GEDDIT???
			$scene->add_entity(
				array(
					'collada-model' => '#lamp',
					'position' => 'left' === $side ? "-3 0 $z" : "3 0 $z",
					'rotation' => 'left' === $side ? "0 0 0" : "0 180 0",
					'scale' => '0.5 0.5 0.5'
				)
			);

			// alternate which side of the screen it's on
			$side = 'left' === $side ? 'right' : 'left';
		}

		echo $scene->build();
	}
	return $wp_query;
}

// display holiday snow icon on blog home page
add_filter( 'loop_start', 'hsu_add_vr_snow' );

function hsu_enqueue_vr_snow_script() {
	if ( is_home() ) {
		wp_enqueue_script( 'hsu-scene', plugin_dir_url( __FILE__ ) . 'js/scene.min.js', array( 'webxr-public-aframe' ), '1.0', false );
	}
}

// enqueue the aframe script on the blog page
add_filter( 'wp_enqueue_scripts', 'hsu_enqueue_vr_snow_script' );

// show blog posts in a deafening blizzard
