if ( window.has ) {
  window.has.add( 'assert.axon', function( global, document, anElement ) {
    'use strict';

    return true;
  } );
}

window.loadedAxonConfig = true;

require.config( {
  deps: [ 'example-main' ],

  paths: {
    underscore: '../../contrib/lodash.min-1.0.0-rc.3',
    AXON: '../js',
    PHET_CORE: '../../phet-core/js',
    ASSERT: '../../../assert/js'
  },

  shim: {
    underscore: { exports: '_' }
  },

  urlArgs: new Date().getTime() // add cache buster query string to make browser refresh actually reload everything
} );