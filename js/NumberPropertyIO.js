// Copyright 2017, University of Colorado Boulder

/**
 * PhET-iO wrapper type for phet's NumberProperty type.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var axon = require( 'AXON/axon' );
  var PropertyIO = require( 'AXON/PropertyIO' );

  // phet-io modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var NumberIO = require( 'ifphetio!PHET_IO/types/NumberIO' );

  // constants
  var VALUE_TYPE = NumberIO; // It's a NumberProperty.
  var PropertyIOImpl = PropertyIO( VALUE_TYPE );

  /**
   * NumberProperty wrapper type.
   * @constructor
   */
  function NumberPropertyIO( property, phetioID ) {
    assert && assertInstanceOf( property, phet.axon.NumberProperty );
    PropertyIOImpl.call( this, property, phetioID );
  }

  axon.register( 'NumberPropertyIO', NumberPropertyIO );

  phetioInherit( PropertyIOImpl, 'NumberPropertyIO', NumberPropertyIO, {}, {

    // Export the value type from the parent so clients can read it from this type
    elementType: NumberIO,

    getAPI: function() {
      return {
        elementType: phet.phetIo.phetio.getAPIForType( VALUE_TYPE )
      };
    },

    /**
     * Decodes a state into a NumberProperty.
     * @param {Object} stateObject
     * @returns {Object}
     */
    fromStateObject: function( stateObject ) {
      var fromParentStateObject = PropertyIOImpl.fromStateObject( stateObject );
      fromParentStateObject.valueType = stateObject.valueType;
      fromParentStateObject.units = stateObject.units;
      fromParentStateObject.range = stateObject.range;
      return fromParentStateObject;
    },

    /**
     * Encodes a NumberProperty instance to a state.
     * @param {Object} numberProperty
     * @returns {Object} - a state object
     */
    toStateObject: function( numberProperty ) {
      assert && assertInstanceOf( numberProperty, phet.axon.NumberProperty );

      var parentStateObject = PropertyIOImpl.toStateObject( numberProperty );
      parentStateObject.valueType = numberProperty.valueType;
      parentStateObject.units = numberProperty.units;
      parentStateObject.range = numberProperty.range;
      return parentStateObject;
    },

    setValue: function( numberProperty, fromStateObject ) {
      assert && assertInstanceOf( numberProperty, phet.axon.NumberProperty );

      PropertyIOImpl.setValue( numberProperty, fromStateObject );
      numberProperty.units = fromStateObject.units;
      numberProperty.range = fromStateObject.range;
      numberProperty.valueType = fromStateObject.valueType;
    },

    documentation: 'Numeric property model'
  } );

  return NumberPropertyIO;
} );