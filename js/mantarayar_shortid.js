//////////////////////////////////////////////////////////////////////////
//                                                                      //
// This is a generated file. You can view the original                  //
// source in your browser if your browser supports source maps.         //
// Source maps are supported by all recent versions of Chrome, Safari,  //
// and Firefox, and by Internet Explorer 11.                            //
//                                                                      //
//////////////////////////////////////////////////////////////////////////


(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var Random = Package.random.Random;

/* Package-scope variables */
var ShortId;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mantarayar_shortid/mantarayar_shortid.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
// Write your package code here!                                                                                       // 1
                                                                                                                       // 2
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mantarayar_shortid/lib/_/bootstrap.js                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
ShortId = {};                                                                                                          // 1
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mantarayar_shortid/lib/random/random-byte.js                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
'use strict';                                                                                                          // 1
                                                                                                                       // 2
function randomByte() {                                                                                                // 3
    return parseInt( Random.hexString(2), 16 ) & 0x30;                                                                 // 4
}                                                                                                                      // 5
                                                                                                                       // 6
ShortId.randomByte = randomByte;                                                                                       // 7
                                                                                                                       // 8
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mantarayar_shortid/lib/random/random-from-seed.js                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
'use strict';                                                                                                          // 1
                                                                                                                       // 2
// Found this seed-based random generator somewhere                                                                    // 3
// Based on The Central Randomizer 1.3 (C) 1997 by Paul Houle (houle@msc.cornell.edu)                                  // 4
                                                                                                                       // 5
var seed = 1;                                                                                                          // 6
                                                                                                                       // 7
/**                                                                                                                    // 8
 * return a random number based on a seed                                                                              // 9
 * @param seed                                                                                                         // 10
 * @returns {number}                                                                                                   // 11
 */                                                                                                                    // 12
function getNextValue() {                                                                                              // 13
    seed = (seed * 9301 + 49297) % 233280;                                                                             // 14
    return seed/(233280.0);                                                                                            // 15
}                                                                                                                      // 16
                                                                                                                       // 17
function setSeed(_seed_) {                                                                                             // 18
    seed = _seed_;                                                                                                     // 19
}                                                                                                                      // 20
                                                                                                                       // 21
ShortId.randomFromSeed = {                                                                                             // 22
    nextValue: getNextValue,                                                                                           // 23
    seed: setSeed                                                                                                      // 24
};                                                                                                                     // 25
                                                                                                                       // 26
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mantarayar_shortid/lib/is-valid.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
'use strict';                                                                                                          // 1
                                                                                                                       // 2
function isShortId(id) {                                                                                               // 3
    if (!id || typeof id !== 'string' || id.length < 6 ) {                                                             // 4
        return false;                                                                                                  // 5
    }                                                                                                                  // 6
                                                                                                                       // 7
    var characters = ShortId.alphabet.characters();                                                                    // 8
    var invalidCharacters = id.split('').map(function(char){                                                           // 9
        if (characters.indexOf(char) === -1) {                                                                         // 10
            return char;                                                                                               // 11
        }                                                                                                              // 12
    }).join('').split('').join('');                                                                                    // 13
                                                                                                                       // 14
    return invalidCharacters.length === 0;                                                                             // 15
}                                                                                                                      // 16
                                                                                                                       // 17
ShortId.isShortId = isShortId;                                                                                         // 18
ShortId.isValid = isShortId;                                                                                           // 19
                                                                                                                       // 20
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mantarayar_shortid/lib/alphabet.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
'use strict';                                                                                                          // 1
                                                                                                                       // 2
var ORIGINAL = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';                                     // 3
var alphabet;                                                                                                          // 4
var previousSeed;                                                                                                      // 5
                                                                                                                       // 6
var shuffled;                                                                                                          // 7
                                                                                                                       // 8
function reset() {                                                                                                     // 9
    shuffled = false;                                                                                                  // 10
}                                                                                                                      // 11
                                                                                                                       // 12
function setCharacters(_alphabet_) {                                                                                   // 13
    if (!_alphabet_) {                                                                                                 // 14
        if (alphabet !== ORIGINAL) {                                                                                   // 15
            alphabet = ORIGINAL;                                                                                       // 16
            reset();                                                                                                   // 17
        }                                                                                                              // 18
        return;                                                                                                        // 19
    }                                                                                                                  // 20
                                                                                                                       // 21
    if (_alphabet_ === alphabet) {                                                                                     // 22
        return;                                                                                                        // 23
    }                                                                                                                  // 24
                                                                                                                       // 25
    if (_alphabet_.length !== ORIGINAL.length) {                                                                       // 26
        throw new Error('Custom alphabet for shortid must be ' + ORIGINAL.length + ' unique characters. You submitted ' + _alphabet_.length + ' characters: ' + _alphabet_);
    }                                                                                                                  // 28
                                                                                                                       // 29
    var unique = _alphabet_.split('').filter(function(item, ind, arr){                                                 // 30
       return ind !== arr.lastIndexOf(item);                                                                           // 31
    });                                                                                                                // 32
                                                                                                                       // 33
    if (unique.length) {                                                                                               // 34
        throw new Error('Custom alphabet for shortid must be ' + ORIGINAL.length + ' unique characters. These characters were not unique: ' + unique.join(', '));
    }                                                                                                                  // 36
                                                                                                                       // 37
    alphabet = _alphabet_;                                                                                             // 38
    reset();                                                                                                           // 39
}                                                                                                                      // 40
                                                                                                                       // 41
function characters(_alphabet_) {                                                                                      // 42
    setCharacters(_alphabet_);                                                                                         // 43
    return alphabet;                                                                                                   // 44
}                                                                                                                      // 45
                                                                                                                       // 46
function setSeed(seed) {                                                                                               // 47
    ShortId.randomFromSeed.seed(seed);                                                                                 // 48
    if (previousSeed !== seed) {                                                                                       // 49
        reset();                                                                                                       // 50
        previousSeed = seed;                                                                                           // 51
    }                                                                                                                  // 52
}                                                                                                                      // 53
                                                                                                                       // 54
function shuffle() {                                                                                                   // 55
    if (!alphabet) {                                                                                                   // 56
        setCharacters(ORIGINAL);                                                                                       // 57
    }                                                                                                                  // 58
                                                                                                                       // 59
    var sourceArray = alphabet.split('');                                                                              // 60
    var targetArray = [];                                                                                              // 61
    var r = ShortId.randomFromSeed.nextValue();                                                                        // 62
    var characterIndex;                                                                                                // 63
                                                                                                                       // 64
    while (sourceArray.length > 0) {                                                                                   // 65
        r = ShortId.randomFromSeed.nextValue();                                                                        // 66
        characterIndex = Math.floor(r * sourceArray.length);                                                           // 67
        targetArray.push(sourceArray.splice(characterIndex, 1)[0]);                                                    // 68
    }                                                                                                                  // 69
    return targetArray.join('');                                                                                       // 70
}                                                                                                                      // 71
                                                                                                                       // 72
function getShuffled() {                                                                                               // 73
    if (shuffled) {                                                                                                    // 74
        return shuffled;                                                                                               // 75
    }                                                                                                                  // 76
    shuffled = shuffle();                                                                                              // 77
    return shuffled;                                                                                                   // 78
}                                                                                                                      // 79
                                                                                                                       // 80
/**                                                                                                                    // 81
 * lookup shuffled letter                                                                                              // 82
 * @param index                                                                                                        // 83
 * @returns {string}                                                                                                   // 84
 */                                                                                                                    // 85
function lookup(index) {                                                                                               // 86
    var alphabetShuffled = getShuffled();                                                                              // 87
    return alphabetShuffled[index];                                                                                    // 88
}                                                                                                                      // 89
                                                                                                                       // 90
ShortId.alphabet = {                                                                                                   // 91
    characters: characters,                                                                                            // 92
    seed: setSeed,                                                                                                     // 93
    lookup: lookup,                                                                                                    // 94
    shuffled: getShuffled                                                                                              // 95
};                                                                                                                     // 96
                                                                                                                       // 97
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mantarayar_shortid/lib/decode.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
'use strict';                                                                                                          // 1
                                                                                                                       // 2
/**                                                                                                                    // 3
 * Decode the id to get the version and worker                                                                         // 4
 * Mainly for debugging and testing.                                                                                   // 5
 * @param id - the shortid-generated id.                                                                               // 6
 */                                                                                                                    // 7
function decode(id) {                                                                                                  // 8
    var characters = ShortId.alphabet.shuffled();                                                                      // 9
    return {                                                                                                           // 10
        version: characters.indexOf(id.substr(0, 1)) & 0x0f,                                                           // 11
        worker: characters.indexOf(id.substr(1, 1)) & 0x0f                                                             // 12
    };                                                                                                                 // 13
}                                                                                                                      // 14
                                                                                                                       // 15
ShortId.decode = decode;                                                                                               // 16
                                                                                                                       // 17
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mantarayar_shortid/lib/encode.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
'use strict';                                                                                                          // 1
                                                                                                                       // 2
var that = this;                                                                                                       // 3
                                                                                                                       // 4
function encode(lookup, number) {                                                                                      // 5
    var loopCounter = 0;                                                                                               // 6
    var done;                                                                                                          // 7
                                                                                                                       // 8
    var str = '';                                                                                                      // 9
                                                                                                                       // 10
    while (!done) {                                                                                                    // 11
        str = str + lookup( ( (number >> (4 * loopCounter)) & 0x0f ) | that.ShortId.randomByte() );                    // 12
        done = number < (Math.pow(16, loopCounter + 1 ) );                                                             // 13
        loopCounter++;                                                                                                 // 14
    }                                                                                                                  // 15
    return str;                                                                                                        // 16
}                                                                                                                      // 17
                                                                                                                       // 18
ShortId.encode = encode;                                                                                               // 19
                                                                                                                       // 20
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mantarayar_shortid/lib/index.js                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
'use strict';                                                                                                          // 1
                                                                                                                       // 2
// Ignore all milliseconds before a certain time to reduce the size of the date entropy without sacrificing uniqueness.
// This number should be updated every year or so to keep the generated id short.                                      // 4
// To regenerate `new Date() - 0` and bump the version. Always bump the version!                                       // 5
var REDUCE_TIME = 1426452414093;                                                                                       // 6
                                                                                                                       // 7
// don't change unless we change the algos or REDUCE_TIME                                                              // 8
// must be an integer and less than 16                                                                                 // 9
var version = 5;                                                                                                       // 10
                                                                                                                       // 11
// if you are using cluster or multiple servers use this to make each instance                                         // 12
// has a unique value for worker                                                                                       // 13
// Note: I don't know if this is automatically set when using third                                                    // 14
// party cluster solutions such as pm2.                                                                                // 15
var clusterWorkerId = 0;                                                                                               // 16
                                                                                                                       // 17
// Counter is used when shortid is called multiple times in one second.                                                // 18
var counter;                                                                                                           // 19
                                                                                                                       // 20
// Remember the last time shortid was called in case counter is needed.                                                // 21
var previousSeconds;                                                                                                   // 22
                                                                                                                       // 23
/**                                                                                                                    // 24
 * Generate unique id                                                                                                  // 25
 * Returns string id                                                                                                   // 26
 */                                                                                                                    // 27
function generate() {                                                                                                  // 28
                                                                                                                       // 29
    var str = '';                                                                                                      // 30
                                                                                                                       // 31
    var seconds = Math.floor((Date.now() - REDUCE_TIME) * 0.001);                                                      // 32
                                                                                                                       // 33
    if (seconds === previousSeconds) {                                                                                 // 34
        counter++;                                                                                                     // 35
    } else {                                                                                                           // 36
        counter = 0;                                                                                                   // 37
        previousSeconds = seconds;                                                                                     // 38
    }                                                                                                                  // 39
                                                                                                                       // 40
    str = str + ShortId.encode(ShortId.alphabet.lookup, version);                                                      // 41
    str = str + ShortId.encode(ShortId.alphabet.lookup, clusterWorkerId);                                              // 42
    if (counter > 0) {                                                                                                 // 43
        str = str + ShortId.encode(ShortId.alphabet.lookup, counter);                                                  // 44
    }                                                                                                                  // 45
    str = str + ShortId.encode(ShortId.alphabet.lookup, seconds);                                                      // 46
                                                                                                                       // 47
    return str;                                                                                                        // 48
}                                                                                                                      // 49
                                                                                                                       // 50
                                                                                                                       // 51
/**                                                                                                                    // 52
 * Set the seed.                                                                                                       // 53
 * Highly recommended if you don't want people to try to figure out your id schema.                                    // 54
 * exposed as shortid.seed(int)                                                                                        // 55
 * @param seed Integer value to seed the random ShortId.alphabet.  ALWAYS USE THE SAME SEED or you might get overlaps.
 */                                                                                                                    // 57
function seed(seedValue) {                                                                                             // 58
    ShortId.alphabet.seed(seedValue);                                                                                  // 59
    return ShortId;                                                                                                    // 60
}                                                                                                                      // 61
                                                                                                                       // 62
/**                                                                                                                    // 63
 * Set the cluster worker or machine id                                                                                // 64
 * exposed as shortid.worker(int)                                                                                      // 65
 * @param workerId worker must be positive integer.  Number less than 16 is recommended.                               // 66
 * returns shortid module so it can be chained.                                                                        // 67
 */                                                                                                                    // 68
function worker(workerId) {                                                                                            // 69
    clusterWorkerId = workerId;                                                                                        // 70
    return ShortId;                                                                                                    // 71
}                                                                                                                      // 72
                                                                                                                       // 73
/**                                                                                                                    // 74
 *                                                                                                                     // 75
 * sets new characters to use in the ShortId.alphabet                                                                  // 76
 * returns the shuffled ShortId.alphabet                                                                               // 77
 */                                                                                                                    // 78
function characters(newCharacters) {                                                                                   // 79
    if (newCharacters !== undefined) {                                                                                 // 80
        ShortId.alphabet.characters(newCharacters);                                                                    // 81
    }                                                                                                                  // 82
                                                                                                                       // 83
    return ShortId.alphabet.shuffled();                                                                                // 84
}                                                                                                                      // 85
                                                                                                                       // 86
                                                                                                                       // 87
// Export all other functions as properties of the generate function                                                   // 88
ShortId.generate = generate;                                                                                           // 89
ShortId.seed = seed;                                                                                                   // 90
ShortId.worker = worker;                                                                                               // 91
ShortId.characters = characters;                                                                                       // 92
                                                                                                                       // 93
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['mantarayar:shortid'] = {
  ShortId: ShortId
};

})();
