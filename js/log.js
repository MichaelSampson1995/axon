// Copyright 2002-2013, University of Colorado Boulder

/*
 * PhET Simulations can be recorded and played back.  This serves a few purposes:
 * 1. During research interviews (with student consent) the session can be recorded for future playback.
 * 2. (possibly) Saving a simulation state for loading later.  Could also be done by exporting state, but that would require extra work.
 * 3. Live broadcasting from one screen to another (sim sharing), for remote learning or projecting a student's sim onto the room's projector
 * 4. Standardize performance testing of a realistic scenario.  For instance, you can record a session and play it back automatically to test scenery performance.
 * 5. Teacher can record sessions for future evaluation.
 * 6. Sim event data collection: when recording logging information for how the user interacts with the UI, also record the model state so it doesn't
 *    have to be recreated in a Finite State Machine afterwards.
 *
 * For recording within a simulation (like Moving Man), another structure would be required.  This is focused on recording the entire session, not
 * just some of the events within a particular model.
 *
 * This implementation just records all state changes, but we could alternatively investigate tracking
 * method calls (like command pattern) or trigger calls, etc.
 *
 * History: Adapted from phetsims/fort/wiretap.js
 * 
 * @author Sam Reid (PhET Interactive Simulations)
 * 
 * TODO: Factor out class into one file, and singleton instance to another file
 * TODO: Remove extra cruft leftover from wiretap.js
 */
define( function( require ) {
  'use strict';

  var axon = require( 'AXON/axon' );
//  var Vector2 = require( 'DOT/Vector2' );

  var cid = 0;

  function Log() {
    var log = this;

    //Enable it if 'log' query parameter specified.  TODO: Switch to has.js?
    //Leave it public so it can be toggled on/off in code
    this.enabled = window && window.phetcommon && window.phetcommon.getQueryParameter && window.phetcommon.getQueryParameter( 'log' );

    //Keep track of all the models, hashed by cid
    //TODO: these could be arrays, we don't need cid on the objects, right?
    this.properties = [];
    this.collections = [];
    this.propertySets = [];

    //Keep track of the changes to all the models
    this.entries = [];

    //Replacer and reviver for the JSON.  Could be moved to the models themselves to decouple/simplify.
    this.replacer = function( key, value ) {

      //Properties must be stored separately, in case of nested properties (such as Forces and Motion: Basics)
      //TODO: A better way of detecting a property?  Perhaps checking the constructor?
      if ( value && value.cid ) {
        return {jsonClass: 'Property', cid: value.cid};
      }

      if ( value && value.constructor.name === 'Vector2' ) {
        return {x: value.x, y: value.y, jsonClass: 'Vector2'};
      }
      return value;
    };

    this.reviver = function( key, value ) {
      if ( value && value.jsonClass && value.jsonClass === 'Property' ) {
        return log.properties[value.cid];
      }
      if ( value && value.jsonClass && value.jsonClass === 'Vector2' ) {
//        return new Vector2( value.x, value.y );
        return {x: value.x, y: value.y };//TODO: pass in a factory that creates Vector2's ?  Log probably shouldn't depend on all of the code that needs reviving
      }
      return value;
    };
  }

  Log.prototype = {

    /**
     * When a property is created, register it for recording and playback.
     * Store its unique cid so that it can be discovered later during playback.
     * @param property
     */
    registerProperty: function( property ) {
      if ( !this.enabled ) {
        return;
      }
      var index = this.properties.length;
      var log = this;
      this.properties.push( property );

      //Don't record initial values for the properties, just the changes.
      property.lazyLink( function( value ) {
        var entry = {time: Date.now(), type: 'property', index: index, action: 'change', value: JSON.stringify( value, log.replacer )};
//        console.log( entry );
        log.entries.push( entry );
      } );
    },
    clear: function() {
      this.properties = [];
      this.collection = [];
      this.propertySets = [];
    },
    stepUntil: function( logArray, playbackTime, logIndex ) {
      var log = this;
      while ( logIndex < logArray.length ) {
        //find any events that passed in this time frame
        //Note, may handle multiple events before calling scene.updateScene()
        var time = logArray[logIndex].time;
        if ( time <= playbackTime ) {
          var entry = logArray[logIndex];
          var cid = entry.cid;

          //if it is a change, then set the value
          if ( entry.action === 'change' ) {
            if ( entry.value ) {
              log.properties[cid].value = JSON.parse( entry.value, log.reviver );
            }
            else {
              console.log( 'missing value for index: ', logIndex, entry );
            }
          }
          else if ( entry.action === 'trigger' ) {
            log.properties[cid].trigger( entry.event );
          }
          else if ( entry.action === 'add' ) {
            log.collections[entry.collectionCid].add( log.properties[entry.cid] );
          }
          else if ( entry.action === 'remove' ) {
            log.collections[entry.collectionCid].remove( log.properties[entry.cid] );
          }
          else if ( entry.action === 'reset' ) {
            log.collections[entry.collectionCid].reset();
          }
          else if ( entry.action === 'sort' ) {
            log.collections[entry.collectionCid].sort();
          }

          logIndex++;
        }
        else {
          break;
        }
      }
      return logIndex;
    }
  };

  axon.log = axon.log || new Log();

  return axon.log;
} );