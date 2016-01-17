(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// client/shims/peer.js                                                //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
/*! peerjs build:0.3.13, development. Copyright(c) 2013 Michelle Bu <michelle@michellebu.com> */(function () {
  function e(t, n, r) {                                                // 1
    function s(o, u) {                                                 // 1
      if (!n[o]) {                                                     // 1
        if (!t[o]) {                                                   // 1
          var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw (f.code = "MODULE_NOT_FOUND", f);
        }var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
          var n = t[o][1][e];return s(n ? n : e);                      // 1
        }, l, l.exports, e, t, n, r);                                  //
      }return n[o].exports;                                            //
    }var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) s(r[o]);return s;
  }                                                                    //
                                                                       //
  return e;                                                            //
})()({ 1: [function (require, module, exports) {                       //
    module.exports.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
    module.exports.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    module.exports.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;
  }, {}], 2: [function (require, module, exports) {                    //
    var util = require('./util');                                      // 10
    var EventEmitter = require('eventemitter3');                       // 11
    var Negotiator = require('./negotiator');                          // 12
    var Reliable = require('reliable');                                // 13
                                                                       //
    /**                                                                //
     * Wraps a DataChannel between two Peers.                          //
     */                                                                //
    function DataConnection(peer, provider, options) {                 // 18
      if (!(this instanceof DataConnection)) return new DataConnection(peer, provider, options);
      EventEmitter.call(this);                                         // 20
                                                                       //
      this.options = util.extend({                                     // 22
        serialization: 'binary',                                       // 23
        reliable: false                                                // 24
      }, options);                                                     //
                                                                       //
      // Connection is not open yet.                                   //
      this.open = false;                                               // 28
      this.type = 'data';                                              // 29
      this.peer = peer;                                                // 30
      this.provider = provider;                                        // 31
                                                                       //
      this.id = this.options.connectionId || DataConnection._idPrefix + util.randomToken();
                                                                       //
      this.label = this.options.label || this.id;                      // 35
      this.metadata = this.options.metadata;                           // 36
      this.serialization = this.options.serialization;                 // 37
      this.reliable = this.options.reliable;                           // 38
                                                                       //
      // Data channel buffering.                                       //
      this._buffer = [];                                               // 41
      this._buffering = false;                                         // 42
      this.bufferSize = 0;                                             // 43
                                                                       //
      // For storing large data.                                       //
      this._chunkedData = {};                                          // 46
                                                                       //
      if (this.options._payload) {                                     // 48
        this._peerBrowser = this.options._payload.browser;             // 49
      }                                                                //
                                                                       //
      Negotiator.startConnection(this, this.options._payload || {      // 52
        originator: true                                               // 55
      });                                                              //
    }                                                                  //
                                                                       //
    util.inherits(DataConnection, EventEmitter);                       // 60
                                                                       //
    DataConnection._idPrefix = 'dc_';                                  // 62
                                                                       //
    /** Called by the Negotiator when the DataChannel is ready. */     //
    DataConnection.prototype.initialize = function (dc) {              // 65
      this._dc = this.dataChannel = dc;                                // 66
      this._configureDataChannel();                                    // 67
    };                                                                 //
                                                                       //
    DataConnection.prototype._configureDataChannel = function () {     // 70
      var self = this;                                                 // 71
      if (util.supports.sctp) {                                        // 72
        this._dc.binaryType = 'arraybuffer';                           // 73
      }                                                                //
      this._dc.onopen = function () {                                  // 75
        util.log('Data channel connection success');                   // 76
        self.open = true;                                              // 77
        self.emit('open');                                             // 78
      };                                                               //
                                                                       //
      // Use the Reliable shim for non Firefox browsers                //
      if (!util.supports.sctp && this.reliable) {                      // 82
        this._reliable = new Reliable(this._dc, util.debug);           // 83
      }                                                                //
                                                                       //
      if (this._reliable) {                                            // 86
        this._reliable.onmessage = function (msg) {                    // 87
          self.emit('data', msg);                                      // 88
        };                                                             //
      } else {                                                         //
        this._dc.onmessage = function (e) {                            // 91
          self._handleDataMessage(e);                                  // 92
        };                                                             //
      }                                                                //
      this._dc.onclose = function (e) {                                // 95
        util.log('DataChannel closed for:', self.peer);                // 96
        self.close();                                                  // 97
      };                                                               //
    };                                                                 //
                                                                       //
    // Handles a DataChannel message.                                  //
    DataConnection.prototype._handleDataMessage = function (e) {       // 102
      var self = this;                                                 // 103
      var data = e.data;                                               // 104
      var datatype = data.constructor;                                 // 105
      if (this.serialization === 'binary' || this.serialization === 'binary-utf8') {
        if (datatype === Blob) {                                       // 107
          // Datatype should never be blob                             //
          util.blobToArrayBuffer(data, function (ab) {                 // 109
            data = util.unpack(ab);                                    // 110
            self.emit('data', data);                                   // 111
          });                                                          //
          return;                                                      // 113
        } else if (datatype === ArrayBuffer) {                         //
          data = util.unpack(data);                                    // 115
        } else if (datatype === String) {                              //
          // String fallback for binary data for browsers that don't support binary yet
          var ab = util.binaryStringToArrayBuffer(data);               // 118
          data = util.unpack(ab);                                      // 119
        }                                                              //
      } else if (this.serialization === 'json') {                      //
        data = JSON.parse(data);                                       // 122
      }                                                                //
                                                                       //
      // Check if we've chunked--if so, piece things back together.    //
      // We're guaranteed that this isn't 0.                           //
      if (data.__peerData) {                                           // 127
        var id = data.__peerData;                                      // 128
        var chunkInfo = this._chunkedData[id] || { data: [], count: 0, total: data.total };
                                                                       //
        chunkInfo.data[data.n] = data.data;                            // 131
        chunkInfo.count += 1;                                          // 132
                                                                       //
        if (chunkInfo.total === chunkInfo.count) {                     // 134
          // Clean up before making the recursive call to `_handleDataMessage`.
          delete this._chunkedData[id];                                // 136
                                                                       //
          // We've received all the chunks--time to construct the complete data.
          data = new Blob(chunkInfo.data);                             // 139
          this._handleDataMessage({ data: data });                     // 140
        }                                                              //
                                                                       //
        this._chunkedData[id] = chunkInfo;                             // 143
        return;                                                        // 144
      }                                                                //
                                                                       //
      this.emit('data', data);                                         // 147
    };                                                                 //
                                                                       //
    /**                                                                //
     * Exposed functionality for users.                                //
     */                                                                //
                                                                       //
    /** Allows user to close connection. */                            //
    DataConnection.prototype.close = function () {                     // 155
      if (!this.open) {                                                // 156
        return;                                                        // 157
      }                                                                //
      this.open = false;                                               // 159
      Negotiator.cleanup(this);                                        // 160
      this.emit('close');                                              // 161
    };                                                                 //
                                                                       //
    /** Allows user to send data. */                                   //
    DataConnection.prototype.send = function (data, chunked) {         // 165
      if (!this.open) {                                                // 166
        this.emit('error', new Error('Connection is not open. You should listen for the `open` event before sending messages.'));
        return;                                                        // 168
      }                                                                //
      if (this._reliable) {                                            // 170
        // Note: reliable shim sending will make it so that you cannot customize
        // serialization.                                              //
        this._reliable.send(data);                                     // 173
        return;                                                        // 174
      }                                                                //
      var self = this;                                                 // 176
      if (this.serialization === 'json') {                             // 177
        this._bufferedSend(JSON.stringify(data));                      // 178
      } else if (this.serialization === 'binary' || this.serialization === 'binary-utf8') {
        var blob = util.pack(data);                                    // 180
                                                                       //
        // For Chrome-Firefox interoperability, we need to make Firefox "chunk"
        // the data it sends out.                                      //
        var needsChunking = util.chunkedBrowsers[this._peerBrowser] || util.chunkedBrowsers[util.browser];
        if (needsChunking && !chunked && blob.size > util.chunkedMTU) {
          this._sendChunks(blob);                                      // 186
          return;                                                      // 187
        }                                                              //
                                                                       //
        // DataChannel currently only supports strings.                //
        if (!util.supports.sctp) {                                     // 191
          util.blobToBinaryString(blob, function (str) {               // 192
            self._bufferedSend(str);                                   // 193
          });                                                          //
        } else if (!util.supports.binaryBlob) {                        //
          // We only do this if we really need to (e.g. blobs are not supported),
          // because this conversion is costly.                        //
          util.blobToArrayBuffer(blob, function (ab) {                 // 198
            self._bufferedSend(ab);                                    // 199
          });                                                          //
        } else {                                                       //
          this._bufferedSend(blob);                                    // 202
        }                                                              //
      } else {                                                         //
        this._bufferedSend(data);                                      // 205
      }                                                                //
    };                                                                 //
                                                                       //
    DataConnection.prototype._bufferedSend = function (msg) {          // 209
      if (this._buffering || !this._trySend(msg)) {                    // 210
        this._buffer.push(msg);                                        // 211
        this.bufferSize = this._buffer.length;                         // 212
      }                                                                //
    };                                                                 //
                                                                       //
    // Returns true if the send succeeds.                              //
    DataConnection.prototype._trySend = function (msg) {               // 217
      try {                                                            // 218
        this._dc.send(msg);                                            // 219
      } catch (e) {                                                    //
        this._buffering = true;                                        // 221
                                                                       //
        var self = this;                                               // 223
        setTimeout(function () {                                       // 224
          // Try again.                                                //
          self._buffering = false;                                     // 226
          self._tryBuffer();                                           // 227
        }, 100);                                                       //
        return false;                                                  // 229
      }                                                                //
      return true;                                                     // 231
    };                                                                 //
                                                                       //
    // Try to send the first message in the buffer.                    //
    DataConnection.prototype._tryBuffer = function () {                // 235
      if (this._buffer.length === 0) {                                 // 236
        return;                                                        // 237
      }                                                                //
                                                                       //
      var msg = this._buffer[0];                                       // 240
                                                                       //
      if (this._trySend(msg)) {                                        // 242
        this._buffer.shift();                                          // 243
        this.bufferSize = this._buffer.length;                         // 244
        this._tryBuffer();                                             // 245
      }                                                                //
    };                                                                 //
                                                                       //
    DataConnection.prototype._sendChunks = function (blob) {           // 249
      var blobs = util.chunk(blob);                                    // 250
      for (var i = 0, ii = blobs.length; i < ii; i += 1) {             // 251
        var blob = blobs[i];                                           // 252
        this.send(blob, true);                                         // 253
      }                                                                //
    };                                                                 //
                                                                       //
    DataConnection.prototype.handleMessage = function (message) {      // 257
      var payload = message.payload;                                   // 258
                                                                       //
      switch (message.type) {                                          // 260
        case 'ANSWER':                                                 // 261
          this._peerBrowser = payload.browser;                         // 262
                                                                       //
          // Forward to negotiator                                     //
          Negotiator.handleSDP(message.type, this, payload.sdp);       // 265
          break;                                                       // 266
        case 'CANDIDATE':                                              // 267
          Negotiator.handleCandidate(this, payload.candidate);         // 268
          break;                                                       // 269
        default:                                                       // 270
          util.warn('Unrecognized message type:', message.type, 'from peer:', this.peer);
          break;                                                       // 272
      }                                                                // 272
    };                                                                 //
                                                                       //
    module.exports = DataConnection;                                   // 276
  }, { "./negotiator": 5, "./util": 8, "eventemitter3": 9, "reliable": 12 }], 3: [function (require, module, exports) {
    window.Socket = require('./socket');                               // 279
    window.MediaConnection = require('./mediaconnection');             // 280
    window.DataConnection = require('./dataconnection');               // 281
    window.Peer = require('./peer');                                   // 282
    window.RTCPeerConnection = require('./adapter').RTCPeerConnection;
    window.RTCSessionDescription = require('./adapter').RTCSessionDescription;
    window.RTCIceCandidate = require('./adapter').RTCIceCandidate;     // 285
    window.Negotiator = require('./negotiator');                       // 286
    window.util = require('./util');                                   // 287
    window.BinaryPack = require('js-binarypack');                      // 288
  }, { "./adapter": 1, "./dataconnection": 2, "./mediaconnection": 4, "./negotiator": 5, "./peer": 6, "./socket": 7, "./util": 8, "js-binarypack": 10 }], 4: [function (require, module, exports) {
    var util = require('./util');                                      // 291
    var EventEmitter = require('eventemitter3');                       // 292
    var Negotiator = require('./negotiator');                          // 293
                                                                       //
    /**                                                                //
     * Wraps the streaming interface between two Peers.                //
     */                                                                //
    function MediaConnection(peer, provider, options) {                // 298
      if (!(this instanceof MediaConnection)) return new MediaConnection(peer, provider, options);
      EventEmitter.call(this);                                         // 300
                                                                       //
      this.options = util.extend({}, options);                         // 302
                                                                       //
      this.open = false;                                               // 304
      this.type = 'media';                                             // 305
      this.peer = peer;                                                // 306
      this.provider = provider;                                        // 307
      this.metadata = this.options.metadata;                           // 308
      this.localStream = this.options._stream;                         // 309
                                                                       //
      this.id = this.options.connectionId || MediaConnection._idPrefix + util.randomToken();
      if (this.localStream) {                                          // 312
        Negotiator.startConnection(this, { _stream: this.localStream, originator: true });
      }                                                                //
    };                                                                 //
                                                                       //
    util.inherits(MediaConnection, EventEmitter);                      // 320
                                                                       //
    MediaConnection._idPrefix = 'mc_';                                 // 322
                                                                       //
    MediaConnection.prototype.addStream = function (remoteStream) {    // 324
      util.log('Receiving stream', remoteStream);                      // 325
                                                                       //
      this.remoteStream = remoteStream;                                // 327
      this.emit('stream', remoteStream); // Should we call this `open`?
    };                                                                 //
                                                                       //
    MediaConnection.prototype.handleMessage = function (message) {     // 332
      var payload = message.payload;                                   // 333
                                                                       //
      switch (message.type) {                                          // 335
        case 'ANSWER':                                                 // 336
          // Forward to negotiator                                     //
          Negotiator.handleSDP(message.type, this, payload.sdp);       // 338
          this.open = true;                                            // 339
          break;                                                       // 340
        case 'CANDIDATE':                                              // 340
          Negotiator.handleCandidate(this, payload.candidate);         // 342
          break;                                                       // 343
        default:                                                       // 343
          util.warn('Unrecognized message type:', message.type, 'from peer:', this.peer);
          break;                                                       // 346
      }                                                                // 346
    };                                                                 //
                                                                       //
    MediaConnection.prototype.answer = function (stream) {             // 350
      if (this.localStream) {                                          // 351
        util.warn('Local stream already exists on this MediaConnection. Are you answering a call twice?');
        return;                                                        // 353
      }                                                                //
                                                                       //
      this.options._payload._stream = stream;                          // 356
                                                                       //
      this.localStream = stream;                                       // 358
      Negotiator.startConnection(this, this.options._payload);         // 359
      // Retrieve lost messages stored because PeerConnection not set up.
      var messages = this.provider._getMessages(this.id);              // 364
      for (var i = 0, ii = messages.length; i < ii; i += 1) {          // 365
        this.handleMessage(messages[i]);                               // 366
      }                                                                //
      this.open = true;                                                // 368
    };                                                                 //
                                                                       //
    /**                                                                //
     * Exposed functionality for users.                                //
     */                                                                //
                                                                       //
    /** Allows user to close connection. */                            //
    MediaConnection.prototype.close = function () {                    // 376
      if (!this.open) {                                                // 377
        return;                                                        // 378
      }                                                                //
      this.open = false;                                               // 380
      Negotiator.cleanup(this);                                        // 381
      this.emit('close');                                              // 382
    };                                                                 //
                                                                       //
    module.exports = MediaConnection;                                  // 385
  }, { "./negotiator": 5, "./util": 8, "eventemitter3": 9 }], 5: [function (require, module, exports) {
    var util = require('./util');                                      // 388
    var RTCPeerConnection = require('./adapter').RTCPeerConnection;    // 389
    var RTCSessionDescription = require('./adapter').RTCSessionDescription;
    var RTCIceCandidate = require('./adapter').RTCIceCandidate;        // 391
                                                                       //
    /**                                                                //
     * Manages all negotiations between Peers.                         //
     */                                                                //
    var Negotiator = {                                                 // 396
      pcs: {                                                           // 397
        data: {},                                                      // 398
        media: {}                                                      // 399
      }, // type => {peerId: {pc_id: pc}}.                             //
      //providers: {}, // provider's id => providers (there may be multiple providers/client.
      queue: [] // connections that are delayed due to a PC being in use.
    };                                                                 //
                                                                       //
    Negotiator._idPrefix = 'pc_';                                      // 405
                                                                       //
    /** Returns a PeerConnection object set up correctly (for data, media). */
    Negotiator.startConnection = function (connection, options) {      // 408
      var pc = Negotiator._getPeerConnection(connection, options);     // 409
                                                                       //
      if (connection.type === 'media' && options._stream) {            // 411
        // Add the stream.                                             //
        pc.addStream(options._stream);                                 // 413
      }                                                                //
                                                                       //
      // Set the connection's PC.                                      //
      connection.pc = connection.peerConnection = pc;                  // 417
      // What do we need to do now?                                    //
      if (options.originator) {                                        // 419
        if (connection.type === 'data') {                              // 420
          // Create the datachannel.                                   //
          var config = {};                                             // 422
          // Dropping reliable:false support, since it seems to be crashing
          // Chrome.                                                   //
          /*if (util.supports.sctp && !options.reliable) {             //
            // If we have canonical reliable support...                //
            config = {maxRetransmits: 0};                              //
          }*/                                                          //
          // Fallback to ensure older browsers don't crash.            //
          if (!util.supports.sctp) {                                   // 430
            config = { reliable: options.reliable };                   // 431
          }                                                            //
          var dc = pc.createDataChannel(connection.label, config);     // 433
          connection.initialize(dc);                                   // 434
        }                                                              //
                                                                       //
        if (!util.supports.onnegotiationneeded) {                      // 437
          Negotiator._makeOffer(connection);                           // 438
        }                                                              //
      } else {                                                         //
        Negotiator.handleSDP('OFFER', connection, options.sdp);        // 441
      }                                                                //
    };                                                                 //
                                                                       //
    Negotiator._getPeerConnection = function (connection, options) {   // 445
      if (!Negotiator.pcs[connection.type]) {                          // 446
        util.error(connection.type + ' is not a valid connection type. Maybe you overrode the `type` property somewhere.');
      }                                                                //
                                                                       //
      if (!Negotiator.pcs[connection.type][connection.peer]) {         // 450
        Negotiator.pcs[connection.type][connection.peer] = {};         // 451
      }                                                                //
      var peerConnections = Negotiator.pcs[connection.type][connection.peer];
                                                                       //
      var pc;                                                          // 455
      // Not multiplexing while FF and Chrome have not-great support for it.
      /*if (options.multiplex) {                                       //
        ids = Object.keys(peerConnections);                            //
        for (var i = 0, ii = ids.length; i < ii; i += 1) {             //
          pc = peerConnections[ids[i]];                                //
          if (pc.signalingState === 'stable') {                        //
            break; // We can go ahead and use this PC.                 //
          }                                                            //
        }                                                              //
      } else */                                                        //
      if (options.pc) {                                                // 466
        // Simplest case: PC id already provided for us.               //
        pc = Negotiator.pcs[connection.type][connection.peer][options.pc];
      }                                                                //
                                                                       //
      if (!pc || pc.signalingState !== 'stable') {                     // 470
        pc = Negotiator._startPeerConnection(connection);              // 471
      }                                                                //
      return pc;                                                       // 473
    };                                                                 //
                                                                       //
    /*                                                                 //
    Negotiator._addProvider = function(provider) {                     //
      if ((!provider.id && !provider.disconnected) || !provider.socket.open) {
        // Wait for provider to obtain an ID.                          //
        provider.on('open', function(id) {                             //
          Negotiator._addProvider(provider);                           //
        });                                                            //
      } else {                                                         //
        Negotiator.providers[provider.id] = provider;                  //
      }                                                                //
    }*/                                                                //
                                                                       //
    /** Start a PC. */                                                 //
    Negotiator._startPeerConnection = function (connection) {          // 490
      util.log('Creating RTCPeerConnection.');                         // 491
                                                                       //
      var id = Negotiator._idPrefix + util.randomToken();              // 493
      var optional = {};                                               // 494
                                                                       //
      if (connection.type === 'data' && !util.supports.sctp) {         // 496
        optional = { optional: [{ RtpDataChannels: true }] };          // 497
      } else if (connection.type === 'media') {                        //
        // Interop req for chrome.                                     //
        optional = { optional: [{ DtlsSrtpKeyAgreement: true }] };     // 500
      }                                                                //
                                                                       //
      var pc = new RTCPeerConnection(connection.provider.options.config, optional);
      Negotiator.pcs[connection.type][connection.peer][id] = pc;       // 504
                                                                       //
      Negotiator._setupListeners(connection, pc, id);                  // 506
                                                                       //
      return pc;                                                       // 508
    };                                                                 //
                                                                       //
    /** Set up various WebRTC listeners. */                            //
    Negotiator._setupListeners = function (connection, pc, pc_id) {    // 512
      var peerId = connection.peer;                                    // 513
      var connectionId = connection.id;                                // 514
      var provider = connection.provider;                              // 515
                                                                       //
      // ICE CANDIDATES.                                               //
      util.log('Listening for ICE candidates.');                       // 518
      pc.onicecandidate = function (evt) {                             // 519
        if (evt.candidate) {                                           // 520
          util.log('Received ICE candidates for:', connection.peer);   // 521
          provider.socket.send({                                       // 522
            type: 'CANDIDATE',                                         // 523
            payload: {                                                 // 524
              candidate: evt.candidate,                                // 525
              type: connection.type,                                   // 526
              connectionId: connection.id                              // 527
            },                                                         //
            dst: peerId                                                // 529
          });                                                          //
        }                                                              //
      };                                                               //
                                                                       //
      pc.oniceconnectionstatechange = function () {                    // 534
        switch (pc.iceConnectionState) {                               // 535
          case 'disconnected':                                         // 536
          case 'failed':                                               // 537
            util.log('iceConnectionState is disconnected, closing connections to ' + peerId);
            connection.close();                                        // 539
            break;                                                     // 540
          case 'completed':                                            // 541
            pc.onicecandidate = util.noop;                             // 542
            break;                                                     // 543
        }                                                              // 543
      };                                                               //
                                                                       //
      // Fallback for older Chrome impls.                              //
      pc.onicechange = pc.oniceconnectionstatechange;                  // 548
                                                                       //
      // ONNEGOTIATIONNEEDED (Chrome)                                  //
      util.log('Listening for `negotiationneeded`');                   // 551
      pc.onnegotiationneeded = function () {                           // 552
        util.log('`negotiationneeded` triggered');                     // 553
        if (pc.signalingState == 'stable') {                           // 554
          Negotiator._makeOffer(connection);                           // 555
        } else {                                                       //
          util.log('onnegotiationneeded triggered when not stable. Is another connection being established?');
        }                                                              //
      };                                                               //
                                                                       //
      // DATACONNECTION.                                               //
      util.log('Listening for data channel');                          // 562
      // Fired between offer and answer, so options should already be saved
      // in the options hash.                                          //
      pc.ondatachannel = function (evt) {                              // 565
        util.log('Received data channel');                             // 566
        var dc = evt.channel;                                          // 567
        var connection = provider.getConnection(peerId, connectionId);
        connection.initialize(dc);                                     // 569
      };                                                               //
                                                                       //
      // MEDIACONNECTION.                                              //
      util.log('Listening for remote stream');                         // 573
      pc.onaddstream = function (evt) {                                // 574
        util.log('Received remote stream');                            // 575
        var stream = evt.stream;                                       // 576
        var connection = provider.getConnection(peerId, connectionId);
        // 10/10/2014: looks like in Chrome 38, onaddstream is triggered after
        // setting the remote description. Our connection object in these cases
        // is actually a DATA connection, so addStream fails.          //
        // TODO: This is hopefully just a temporary fix. We should try to
        // understand why this is happening.                           //
        if (connection.type === 'media') {                             // 583
          connection.addStream(stream);                                // 584
        }                                                              //
      };                                                               //
    };                                                                 //
                                                                       //
    Negotiator.cleanup = function (connection) {                       // 589
      util.log('Cleaning up PeerConnection to ' + connection.peer);    // 590
                                                                       //
      var pc = connection.pc;                                          // 592
                                                                       //
      if (!!pc && (pc.readyState !== 'closed' || pc.signalingState !== 'closed')) {
        pc.close();                                                    // 595
        connection.pc = null;                                          // 596
      }                                                                //
    };                                                                 //
                                                                       //
    Negotiator._makeOffer = function (connection) {                    // 600
      var pc = connection.pc;                                          // 601
      pc.createOffer(function (offer) {                                // 602
        util.log('Created offer.');                                    // 603
                                                                       //
        if (!util.supports.sctp && connection.type === 'data' && connection.reliable) {
          offer.sdp = Reliable.higherBandwidthSDP(offer.sdp);          // 606
        }                                                              //
                                                                       //
        pc.setLocalDescription(offer, function () {                    // 609
          util.log('Set localDescription: offer', 'for:', connection.peer);
          connection.provider.socket.send({                            // 611
            type: 'OFFER',                                             // 612
            payload: {                                                 // 613
              sdp: offer,                                              // 614
              type: connection.type,                                   // 615
              label: connection.label,                                 // 616
              connectionId: connection.id,                             // 617
              reliable: connection.reliable,                           // 618
              serialization: connection.serialization,                 // 619
              metadata: connection.metadata,                           // 620
              browser: util.browser                                    // 621
            },                                                         //
            dst: connection.peer                                       // 623
          });                                                          //
        }, function (err) {                                            //
          connection.provider.emitError('webrtc', err);                // 626
          util.log('Failed to setLocalDescription, ', err);            // 627
        });                                                            //
      }, function (err) {                                              //
        connection.provider.emitError('webrtc', err);                  // 630
        util.log('Failed to createOffer, ', err);                      // 631
      }, connection.options.constraints);                              //
    };                                                                 //
                                                                       //
    Negotiator._makeAnswer = function (connection) {                   // 635
      var pc = connection.pc;                                          // 636
                                                                       //
      pc.createAnswer(function (answer) {                              // 638
        util.log('Created answer.');                                   // 639
                                                                       //
        if (!util.supports.sctp && connection.type === 'data' && connection.reliable) {
          answer.sdp = Reliable.higherBandwidthSDP(answer.sdp);        // 642
        }                                                              //
                                                                       //
        pc.setLocalDescription(answer, function () {                   // 645
          util.log('Set localDescription: answer', 'for:', connection.peer);
          connection.provider.socket.send({                            // 647
            type: 'ANSWER',                                            // 648
            payload: {                                                 // 649
              sdp: answer,                                             // 650
              type: connection.type,                                   // 651
              connectionId: connection.id,                             // 652
              browser: util.browser                                    // 653
            },                                                         //
            dst: connection.peer                                       // 655
          });                                                          //
        }, function (err) {                                            //
          connection.provider.emitError('webrtc', err);                // 658
          util.log('Failed to setLocalDescription, ', err);            // 659
        });                                                            //
      }, function (err) {                                              //
        connection.provider.emitError('webrtc', err);                  // 662
        util.log('Failed to create answer, ', err);                    // 663
      });                                                              //
    };                                                                 //
                                                                       //
    /** Handle an SDP. */                                              //
    Negotiator.handleSDP = function (type, connection, sdp) {          // 668
      sdp = new RTCSessionDescription(sdp);                            // 669
      var pc = connection.pc;                                          // 670
                                                                       //
      util.log('Setting remote description', sdp);                     // 672
      pc.setRemoteDescription(sdp, function () {                       // 673
        util.log('Set remoteDescription:', type, 'for:', connection.peer);
                                                                       //
        if (type === 'OFFER') {                                        // 676
          Negotiator._makeAnswer(connection);                          // 677
        }                                                              //
      }, function (err) {                                              //
        connection.provider.emitError('webrtc', err);                  // 680
        util.log('Failed to setRemoteDescription, ', err);             // 681
      });                                                              //
    };                                                                 //
                                                                       //
    /** Handle a candidate. */                                         //
    Negotiator.handleCandidate = function (connection, ice) {          // 686
      var candidate = ice.candidate;                                   // 687
      var sdpMLineIndex = ice.sdpMLineIndex;                           // 688
      connection.pc.addIceCandidate(new RTCIceCandidate({              // 689
        sdpMLineIndex: sdpMLineIndex,                                  // 690
        candidate: candidate                                           // 691
      }));                                                             //
      util.log('Added ICE candidate for:', connection.peer);           // 693
    };                                                                 //
                                                                       //
    module.exports = Negotiator;                                       // 696
  }, { "./adapter": 1, "./util": 8 }], 6: [function (require, module, exports) {
    var util = require('./util');                                      // 699
    var EventEmitter = require('eventemitter3');                       // 700
    var Socket = require('./socket');                                  // 701
    var MediaConnection = require('./mediaconnection');                // 702
    var DataConnection = require('./dataconnection');                  // 703
                                                                       //
    /**                                                                //
     * A peer who can initiate connections with other peers.           //
     */                                                                //
    function Peer(id, options) {                                       // 708
      if (!(this instanceof Peer)) return new Peer(id, options);       // 709
      EventEmitter.call(this);                                         // 710
                                                                       //
      // Deal with overloading                                         //
      if (id && id.constructor == Object) {                            // 713
        options = id;                                                  // 714
        id = undefined;                                                // 715
      } else if (id) {                                                 //
        // Ensure id is a string                                       //
        id = id.toString();                                            // 718
      }                                                                //
      //                                                               //
                                                                       //
      // Configurize options                                           //
      options = util.extend({                                          // 723
        debug: 0, // 1: Errors, 2: Warnings, 3: All logs               // 724
        host: util.CLOUD_HOST,                                         // 725
        port: util.CLOUD_PORT,                                         // 726
        key: 'peerjs',                                                 // 727
        path: '/',                                                     // 728
        token: util.randomToken(),                                     // 729
        config: util.defaultConfig                                     // 730
      }, options);                                                     //
      this.options = options;                                          // 732
      // Detect relative URL host.                                     //
      if (options.host === '/') {                                      // 734
        options.host = window.location.hostname;                       // 735
      }                                                                //
      // Set path correctly.                                           //
      if (options.path[0] !== '/') {                                   // 738
        options.path = '/' + options.path;                             // 739
      }                                                                //
      if (options.path[options.path.length - 1] !== '/') {             // 741
        options.path += '/';                                           // 742
      }                                                                //
                                                                       //
      // Set whether we use SSL to same as current host                //
      if (options.secure === undefined && options.host !== util.CLOUD_HOST) {
        options.secure = util.isSecure();                              // 747
      }                                                                //
      // Set a custom log function if present                          //
      if (options.logFunction) {                                       // 750
        util.setLogFunction(options.logFunction);                      // 751
      }                                                                //
      util.setLogLevel(options.debug);                                 // 753
      //                                                               //
                                                                       //
      // Sanity checks                                                 //
      // Ensure WebRTC supported                                       //
      if (!util.supports.audioVideo && !util.supports.data) {          // 758
        this._delayedAbort('browser-incompatible', 'The current browser does not support WebRTC');
        return;                                                        // 760
      }                                                                //
      // Ensure alphanumeric id                                        //
      if (!util.validateId(id)) {                                      // 763
        this._delayedAbort('invalid-id', 'ID "' + id + '" is invalid');
        return;                                                        // 765
      }                                                                //
      // Ensure valid key                                              //
      if (!util.validateKey(options.key)) {                            // 768
        this._delayedAbort('invalid-key', 'API KEY "' + options.key + '" is invalid');
        return;                                                        // 770
      }                                                                //
      // Ensure not using unsecure cloud server on SSL page            //
      if (options.secure && options.host === '0.peerjs.com') {         // 773
        this._delayedAbort('ssl-unavailable', 'The cloud server currently does not support HTTPS. Please run your own PeerServer to use HTTPS.');
        return;                                                        // 776
      }                                                                //
      //                                                               //
                                                                       //
      // States.                                                       //
      this.destroyed = false; // Connections have been killed          // 781
      this.disconnected = false; // Connection to PeerServer killed but P2P connections still active
      this.open = false; // Sockets and such are not yet open.         // 783
      //                                                               //
                                                                       //
      // References                                                    //
      this.connections = {}; // DataConnections for this peer.         // 787
      this._lostMessages = {}; // src => [list of messages]            // 788
      //                                                               //
                                                                       //
      // Start the server connection                                   //
      this._initializeServerConnection();                              // 792
      if (id) {                                                        // 793
        this._initialize(id);                                          // 794
      } else {                                                         //
        this._retrieveId();                                            // 796
      }                                                                //
      //                                                               //
    }                                                                  //
                                                                       //
    util.inherits(Peer, EventEmitter);                                 // 801
                                                                       //
    // Initialize the 'socket' (which is actually a mix of XHR streaming and
    // websockets.)                                                    //
    Peer.prototype._initializeServerConnection = function () {         // 805
      var self = this;                                                 // 806
      this.socket = new Socket(this.options.secure, this.options.host, this.options.port, this.options.path, this.options.key);
      this.socket.on('message', function (data) {                      // 808
        self._handleMessage(data);                                     // 809
      });                                                              //
      this.socket.on('error', function (error) {                       // 811
        self._abort('socket-error', error);                            // 812
      });                                                              //
      this.socket.on('disconnected', function () {                     // 814
        // If we haven't explicitly disconnected, emit error and disconnect.
        if (!self.disconnected) {                                      // 816
          self.emitError('network', 'Lost connection to server.');     // 817
          self.disconnect();                                           // 818
        }                                                              //
      });                                                              //
      this.socket.on('close', function () {                            // 821
        // If we haven't explicitly disconnected, emit error.          //
        if (!self.disconnected) {                                      // 823
          self._abort('socket-closed', 'Underlying socket is already closed.');
        }                                                              //
      });                                                              //
    };                                                                 //
                                                                       //
    /** Get a unique ID from the server via XHR. */                    //
    Peer.prototype._retrieveId = function (cb) {                       // 830
      var self = this;                                                 // 831
      var http = new XMLHttpRequest();                                 // 832
      var protocol = this.options.secure ? 'https://' : 'http://';     // 833
      var url = protocol + this.options.host + ':' + this.options.port + this.options.path + this.options.key + '/id';
      var queryString = '?ts=' + new Date().getTime() + '' + Math.random();
      url += queryString;                                              // 837
                                                                       //
      // If there's no ID we need to wait for one before trying to init socket.
      http.open('get', url, true);                                     // 840
      http.onerror = function (e) {                                    // 841
        util.error('Error retrieving ID', e);                          // 842
        var pathError = '';                                            // 843
        if (self.options.path === '/' && self.options.host !== util.CLOUD_HOST) {
          pathError = ' If you passed in a `path` to your self-hosted PeerServer, ' + 'you\'ll also need to pass in that same path when creating a new ' + 'Peer.';
        }                                                              //
        self._abort('server-error', 'Could not get an ID from the server.' + pathError);
      };                                                               //
      http.onreadystatechange = function () {                          // 851
        if (http.readyState !== 4) {                                   // 852
          return;                                                      // 853
        }                                                              //
        if (http.status !== 200) {                                     // 855
          http.onerror();                                              // 856
          return;                                                      // 857
        }                                                              //
        self._initialize(http.responseText);                           // 859
      };                                                               //
      http.send(null);                                                 // 861
    };                                                                 //
                                                                       //
    /** Initialize a connection with the server. */                    //
    Peer.prototype._initialize = function (id) {                       // 865
      this.id = id;                                                    // 866
      this.socket.start(this.id, this.options.token);                  // 867
    };                                                                 //
                                                                       //
    /** Handles messages from the server. */                           //
    Peer.prototype._handleMessage = function (message) {               // 871
      var type = message.type;                                         // 872
      var payload = message.payload;                                   // 873
      var peer = message.src;                                          // 874
      var connection;                                                  // 875
                                                                       //
      switch (type) {                                                  // 877
        case 'OPEN':                                                   // 878
          // The connection to the server is open.                     //
          this.emit('open', this.id);                                  // 879
          this.open = true;                                            // 880
          break;                                                       // 881
        case 'ERROR':                                                  // 882
          // Server error.                                             //
          this._abort('server-error', payload.msg);                    // 883
          break;                                                       // 884
        case 'ID-TAKEN':                                               // 885
          // The selected ID is taken.                                 //
          this._abort('unavailable-id', 'ID `' + this.id + '` is taken');
          break;                                                       // 887
        case 'INVALID-KEY':                                            // 888
          // The given API key cannot be found.                        //
          this._abort('invalid-key', 'API KEY "' + this.options.key + '" is invalid');
          break;                                                       // 890
                                                                       //
        //                                                             // 890
        case 'LEAVE':                                                  // 893
          // Another peer has closed its connection to this peer.      //
          util.log('Received leave message from', peer);               // 894
          this._cleanupPeer(peer);                                     // 895
          break;                                                       // 896
                                                                       //
        case 'EXPIRE':                                                 // 896
          // The offer sent to a peer has expired without response.    //
          this.emitError('peer-unavailable', 'Could not connect to peer ' + peer);
          break;                                                       // 900
        case 'OFFER':                                                  // 900
          // we should consider switching this to CALL/CONNECT, but this is the least breaking option.
          var connectionId = payload.connectionId;                     // 902
          connection = this.getConnection(peer, connectionId);         // 903
                                                                       //
          if (connection) {                                            // 905
            util.warn('Offer received for existing Connection ID:', connectionId);
            //connection.handleMessage(message);                       //
          } else {                                                     //
              // Create a new connection.                              //
              if (payload.type === 'media') {                          // 910
                connection = new MediaConnection(peer, this, {         // 911
                  connectionId: connectionId,                          // 912
                  _payload: payload,                                   // 913
                  metadata: payload.metadata                           // 914
                });                                                    //
                this._addConnection(peer, connection);                 // 916
                this.emit('call', connection);                         // 917
              } else if (payload.type === 'data') {                    //
                connection = new DataConnection(peer, this, {          // 919
                  connectionId: connectionId,                          // 920
                  _payload: payload,                                   // 921
                  metadata: payload.metadata,                          // 922
                  label: payload.label,                                // 923
                  serialization: payload.serialization,                // 924
                  reliable: payload.reliable                           // 925
                });                                                    //
                this._addConnection(peer, connection);                 // 927
                this.emit('connection', connection);                   // 928
              } else {                                                 //
                util.warn('Received malformed connection type:', payload.type);
                return;                                                // 931
              }                                                        //
              // Find messages.                                        //
              var messages = this._getMessages(connectionId);          // 934
              for (var i = 0, ii = messages.length; i < ii; i += 1) {  // 935
                connection.handleMessage(messages[i]);                 // 936
              }                                                        //
            }                                                          //
          break;                                                       // 939
        default:                                                       // 939
          if (!payload) {                                              // 941
            util.warn('You received a malformed message from ' + peer + ' of type ' + type);
            return;                                                    // 943
          }                                                            //
                                                                       //
          var id = payload.connectionId;                               // 946
          connection = this.getConnection(peer, id);                   // 947
                                                                       //
          if (connection && connection.pc) {                           // 949
            // Pass it on.                                             //
            connection.handleMessage(message);                         // 951
          } else if (id) {                                             //
            // Store for possible later use                            //
            this._storeMessage(id, message);                           // 954
          } else {                                                     //
            util.warn('You received an unrecognized message:', message);
          }                                                            //
          break;                                                       // 958
      }                                                                // 958
    };                                                                 //
                                                                       //
    /** Stores messages without a set up connection, to be claimed later. */
    Peer.prototype._storeMessage = function (connectionId, message) {  // 963
      if (!this._lostMessages[connectionId]) {                         // 964
        this._lostMessages[connectionId] = [];                         // 965
      }                                                                //
      this._lostMessages[connectionId].push(message);                  // 967
    };                                                                 //
                                                                       //
    /** Retrieve messages from lost message store */                   //
    Peer.prototype._getMessages = function (connectionId) {            // 971
      var messages = this._lostMessages[connectionId];                 // 972
      if (messages) {                                                  // 973
        delete this._lostMessages[connectionId];                       // 974
        return messages;                                               // 975
      } else {                                                         //
        return [];                                                     // 977
      }                                                                //
    };                                                                 //
                                                                       //
    /**                                                                //
     * Returns a DataConnection to the specified peer. See documentation for a
     * complete list of options.                                       //
     */                                                                //
    Peer.prototype.connect = function (peer, options) {                // 985
      if (this.disconnected) {                                         // 986
        util.warn('You cannot connect to a new Peer because you called ' + '.disconnect() on this Peer and ended your connection with the ' + 'server. You can create a new Peer to reconnect, or call reconnect ' + 'on this peer if you believe its ID to still be available.');
        this.emitError('disconnected', 'Cannot connect to new Peer after disconnecting from server.');
        return;                                                        // 992
      }                                                                //
      var connection = new DataConnection(peer, this, options);        // 994
      this._addConnection(peer, connection);                           // 995
      return connection;                                               // 996
    };                                                                 //
                                                                       //
    /**                                                                //
     * Returns a MediaConnection to the specified peer. See documentation for a
     * complete list of options.                                       //
     */                                                                //
    Peer.prototype.call = function (peer, stream, options) {           // 1003
      if (this.disconnected) {                                         // 1004
        util.warn('You cannot connect to a new Peer because you called ' + '.disconnect() on this Peer and ended your connection with the ' + 'server. You can create a new Peer to reconnect.');
        this.emitError('disconnected', 'Cannot connect to new Peer after disconnecting from server.');
        return;                                                        // 1009
      }                                                                //
      if (!stream) {                                                   // 1011
        util.error('To call a peer, you must provide a stream from your browser\'s `getUserMedia`.');
        return;                                                        // 1013
      }                                                                //
      options = options || {};                                         // 1015
      options._stream = stream;                                        // 1016
      var call = new MediaConnection(peer, this, options);             // 1017
      this._addConnection(peer, call);                                 // 1018
      return call;                                                     // 1019
    };                                                                 //
                                                                       //
    /** Add a data/media connection to this peer. */                   //
    Peer.prototype._addConnection = function (peer, connection) {      // 1023
      if (!this.connections[peer]) {                                   // 1024
        this.connections[peer] = [];                                   // 1025
      }                                                                //
      this.connections[peer].push(connection);                         // 1027
    };                                                                 //
                                                                       //
    /** Retrieve a data/media connection for this peer. */             //
    Peer.prototype.getConnection = function (peer, id) {               // 1031
      var connections = this.connections[peer];                        // 1032
      if (!connections) {                                              // 1033
        return null;                                                   // 1034
      }                                                                //
      for (var i = 0, ii = connections.length; i < ii; i++) {          // 1036
        if (connections[i].id === id) {                                // 1037
          return connections[i];                                       // 1038
        }                                                              //
      }                                                                //
      return null;                                                     // 1041
    };                                                                 //
                                                                       //
    Peer.prototype._delayedAbort = function (type, message) {          // 1044
      var self = this;                                                 // 1045
      util.setZeroTimeout(function () {                                // 1046
        self._abort(type, message);                                    // 1047
      });                                                              //
    };                                                                 //
                                                                       //
    /**                                                                //
     * Destroys the Peer and emits an error message.                   //
     * The Peer is not destroyed if it's in a disconnected state, in which case
     * it retains its disconnected state and its existing connections.
     */                                                                //
    Peer.prototype._abort = function (type, message) {                 // 1056
      util.error('Aborting!');                                         // 1057
      if (!this._lastServerId) {                                       // 1058
        this.destroy();                                                // 1059
      } else {                                                         //
        this.disconnect();                                             // 1061
      }                                                                //
      this.emitError(type, message);                                   // 1063
    };                                                                 //
                                                                       //
    /** Emits a typed error message. */                                //
    Peer.prototype.emitError = function (type, err) {                  // 1067
      util.error('Error:', err);                                       // 1068
      if (typeof err === 'string') {                                   // 1069
        err = new Error(err);                                          // 1070
      }                                                                //
      err.type = type;                                                 // 1072
      this.emit('error', err);                                         // 1073
    };                                                                 //
                                                                       //
    /**                                                                //
     * Destroys the Peer: closes all active connections as well as the connection
     *  to the server.                                                 //
     * Warning: The peer can no longer create or accept connections after being
     *  destroyed.                                                     //
     */                                                                //
    Peer.prototype.destroy = function () {                             // 1082
      if (!this.destroyed) {                                           // 1083
        this._cleanup();                                               // 1084
        this.disconnect();                                             // 1085
        this.destroyed = true;                                         // 1086
      }                                                                //
    };                                                                 //
                                                                       //
    /** Disconnects every connection on this peer. */                  //
    Peer.prototype._cleanup = function () {                            // 1092
      if (this.connections) {                                          // 1093
        var peers = Object.keys(this.connections);                     // 1094
        for (var i = 0, ii = peers.length; i < ii; i++) {              // 1095
          this._cleanupPeer(peers[i]);                                 // 1096
        }                                                              //
      }                                                                //
      this.emit('close');                                              // 1099
    };                                                                 //
                                                                       //
    /** Closes all connections to this peer. */                        //
    Peer.prototype._cleanupPeer = function (peer) {                    // 1103
      var connections = this.connections[peer];                        // 1104
      for (var j = 0, jj = connections.length; j < jj; j += 1) {       // 1105
        connections[j].close();                                        // 1106
      }                                                                //
    };                                                                 //
                                                                       //
    /**                                                                //
     * Disconnects the Peer's connection to the PeerServer. Does not close any
     *  active connections.                                            //
     * Warning: The peer can no longer create or accept connections after being
     *  disconnected. It also cannot reconnect to the server.          //
     */                                                                //
    Peer.prototype.disconnect = function () {                          // 1116
      var self = this;                                                 // 1117
      util.setZeroTimeout(function () {                                // 1118
        if (!self.disconnected) {                                      // 1119
          self.disconnected = true;                                    // 1120
          self.open = false;                                           // 1121
          if (self.socket) {                                           // 1122
            self.socket.close();                                       // 1123
          }                                                            //
          self.emit('disconnected', self.id);                          // 1125
          self._lastServerId = self.id;                                // 1126
          self.id = null;                                              // 1127
        }                                                              //
      });                                                              //
    };                                                                 //
                                                                       //
    /** Attempts to reconnect with the same ID. */                     //
    Peer.prototype.reconnect = function () {                           // 1133
      if (this.disconnected && !this.destroyed) {                      // 1134
        util.log('Attempting reconnection to server with ID ' + this._lastServerId);
        this.disconnected = false;                                     // 1136
        this._initializeServerConnection();                            // 1137
        this._initialize(this._lastServerId);                          // 1138
      } else if (this.destroyed) {                                     //
        throw new Error('This peer cannot reconnect to the server. It has already been destroyed.');
      } else if (!this.disconnected && !this.open) {                   //
        // Do nothing. We're still connecting the first time.          //
        util.error('In a hurry? We\'re still trying to make the initial connection!');
      } else {                                                         //
        throw new Error('Peer ' + this.id + ' cannot reconnect because it is not disconnected from the server!');
      }                                                                //
    };                                                                 //
                                                                       //
    /**                                                                //
     * Get a list of available peer IDs. If you're running your own server, you'll
     * want to set allow_discovery: true in the PeerServer options. If you're using
     * the cloud server, email team@peerjs.com to get the functionality enabled for
     * your key.                                                       //
     */                                                                //
    Peer.prototype.listAllPeers = function (cb) {                      // 1155
      cb = cb || function () {};                                       // 1156
      var self = this;                                                 // 1157
      var http = new XMLHttpRequest();                                 // 1158
      var protocol = this.options.secure ? 'https://' : 'http://';     // 1159
      var url = protocol + this.options.host + ':' + this.options.port + this.options.path + this.options.key + '/peers';
      var queryString = '?ts=' + new Date().getTime() + '' + Math.random();
      url += queryString;                                              // 1163
                                                                       //
      // If there's no ID we need to wait for one before trying to init socket.
      http.open('get', url, true);                                     // 1166
      http.onerror = function (e) {                                    // 1167
        self._abort('server-error', 'Could not get peers from the server.');
        cb([]);                                                        // 1169
      };                                                               //
      http.onreadystatechange = function () {                          // 1171
        if (http.readyState !== 4) {                                   // 1172
          return;                                                      // 1173
        }                                                              //
        if (http.status === 401) {                                     // 1175
          var helpfulError = '';                                       // 1176
          if (self.options.host !== util.CLOUD_HOST) {                 // 1177
            helpfulError = 'It looks like you\'re using the cloud server. You can email ' + 'team@peerjs.com to enable peer listing for your API key.';
          } else {                                                     //
            helpfulError = 'You need to enable `allow_discovery` on your self-hosted ' + 'PeerServer to use this feature.';
          }                                                            //
          cb([]);                                                      // 1184
          throw new Error('It doesn\'t look like you have permission to list peers IDs. ' + helpfulError);
        } else if (http.status !== 200) {                              //
          cb([]);                                                      // 1187
        } else {                                                       //
          cb(JSON.parse(http.responseText));                           // 1189
        }                                                              //
      };                                                               //
      http.send(null);                                                 // 1192
    };                                                                 //
                                                                       //
    module.exports = Peer;                                             // 1195
  }, { "./dataconnection": 2, "./mediaconnection": 4, "./socket": 7, "./util": 8, "eventemitter3": 9 }], 7: [function (require, module, exports) {
    var util = require('./util');                                      // 1198
    var EventEmitter = require('eventemitter3');                       // 1199
                                                                       //
    /**                                                                //
     * An abstraction on top of WebSockets and XHR streaming to provide fastest
     * possible connection for peers.                                  //
     */                                                                //
    function Socket(secure, host, port, path, key) {                   // 1205
      if (!(this instanceof Socket)) return new Socket(secure, host, port, path, key);
                                                                       //
      EventEmitter.call(this);                                         // 1208
                                                                       //
      // Disconnected manually.                                        //
      this.disconnected = false;                                       // 1211
      this._queue = [];                                                // 1212
                                                                       //
      var httpProtocol = secure ? 'https://' : 'http://';              // 1214
      var wsProtocol = secure ? 'wss://' : 'ws://';                    // 1215
      this._httpUrl = httpProtocol + host + ':' + port + path + key;   // 1216
      this._wsUrl = wsProtocol + host + ':' + port + path + 'peerjs?key=' + key;
    }                                                                  //
                                                                       //
    util.inherits(Socket, EventEmitter);                               // 1220
                                                                       //
    /** Check in with ID or get one from server. */                    //
    Socket.prototype.start = function (id, token) {                    // 1224
      this.id = id;                                                    // 1225
                                                                       //
      this._httpUrl += '/' + id + '/' + token;                         // 1227
      this._wsUrl += '&id=' + id + '&token=' + token;                  // 1228
                                                                       //
      this._startXhrStream();                                          // 1230
      this._startWebSocket();                                          // 1231
    };                                                                 //
                                                                       //
    /** Start up websocket communications. */                          //
    Socket.prototype._startWebSocket = function (id) {                 // 1236
      var self = this;                                                 // 1237
                                                                       //
      if (this._socket) {                                              // 1239
        return;                                                        // 1240
      }                                                                //
                                                                       //
      this._socket = new WebSocket(this._wsUrl);                       // 1243
                                                                       //
      this._socket.onmessage = function (event) {                      // 1245
        try {                                                          // 1246
          var data = JSON.parse(event.data);                           // 1247
        } catch (e) {                                                  //
          util.log('Invalid server message', event.data);              // 1249
          return;                                                      // 1250
        }                                                              //
        self.emit('message', data);                                    // 1252
      };                                                               //
                                                                       //
      this._socket.onclose = function (event) {                        // 1255
        util.log('Socket closed.');                                    // 1256
        self.disconnected = true;                                      // 1257
        self.emit('disconnected');                                     // 1258
      };                                                               //
                                                                       //
      // Take care of the queue of connections if necessary and make sure Peer knows
      // socket is open.                                               //
      this._socket.onopen = function () {                              // 1263
        if (self._timeout) {                                           // 1264
          clearTimeout(self._timeout);                                 // 1265
          setTimeout(function () {                                     // 1266
            self._http.abort();                                        // 1267
            self._http = null;                                         // 1268
          }, 5000);                                                    //
        }                                                              //
        self._sendQueuedMessages();                                    // 1271
        util.log('Socket open');                                       // 1272
      };                                                               //
    };                                                                 //
                                                                       //
    /** Start XHR streaming. */                                        //
    Socket.prototype._startXhrStream = function (n) {                  // 1277
      try {                                                            // 1278
        var self = this;                                               // 1279
        this._http = new XMLHttpRequest();                             // 1280
        this._http._index = 1;                                         // 1281
        this._http._streamIndex = n || 0;                              // 1282
        this._http.open('post', this._httpUrl + '/id?i=' + this._http._streamIndex, true);
        this._http.onerror = function () {                             // 1284
          // If we get an error, likely something went wrong.          //
          // Stop streaming.                                           //
          clearTimeout(self._timeout);                                 // 1287
          self.emit('disconnected');                                   // 1288
        };                                                             //
        this._http.onreadystatechange = function () {                  // 1290
          if (this.readyState == 2 && this.old) {                      // 1291
            this.old.abort();                                          // 1292
            delete this.old;                                           // 1293
          } else if (this.readyState > 2 && this.status === 200 && this.responseText) {
            self._handleStream(this);                                  // 1295
          }                                                            //
        };                                                             //
        this._http.send(null);                                         // 1298
        this._setHTTPTimeout();                                        // 1299
      } catch (e) {                                                    //
        util.log('XMLHttpRequest not available; defaulting to WebSockets');
      }                                                                //
    };                                                                 //
                                                                       //
    /** Handles onreadystatechange response as a stream. */            //
    Socket.prototype._handleStream = function (http) {                 // 1307
      // 3 and 4 are loading/done state. All others are not relevant.  //
      var messages = http.responseText.split('\n');                    // 1309
                                                                       //
      // Check to see if anything needs to be processed on buffer.     //
      if (http._buffer) {                                              // 1312
        while (http._buffer.length > 0) {                              // 1313
          var index = http._buffer.shift();                            // 1314
          var bufferedMessage = messages[index];                       // 1315
          try {                                                        // 1316
            bufferedMessage = JSON.parse(bufferedMessage);             // 1317
          } catch (e) {                                                //
            http._buffer.shift(index);                                 // 1319
            break;                                                     // 1320
          }                                                            //
          this.emit('message', bufferedMessage);                       // 1322
        }                                                              //
      }                                                                //
                                                                       //
      var message = messages[http._index];                             // 1326
      if (message) {                                                   // 1327
        http._index += 1;                                              // 1328
        // Buffering--this message is incomplete and we'll get to it next time.
        // This checks if the httpResponse ended in a `\n`, in which case the last
        // element of messages should be the empty string.             //
        if (http._index === messages.length) {                         // 1332
          if (!http._buffer) {                                         // 1333
            http._buffer = [];                                         // 1334
          }                                                            //
          http._buffer.push(http._index - 1);                          // 1336
        } else {                                                       //
          try {                                                        // 1338
            message = JSON.parse(message);                             // 1339
          } catch (e) {                                                //
            util.log('Invalid server message', message);               // 1341
            return;                                                    // 1342
          }                                                            //
          this.emit('message', message);                               // 1344
        }                                                              //
      }                                                                //
    };                                                                 //
                                                                       //
    Socket.prototype._setHTTPTimeout = function () {                   // 1349
      var self = this;                                                 // 1350
      this._timeout = setTimeout(function () {                         // 1351
        var old = self._http;                                          // 1352
        if (!self._wsOpen()) {                                         // 1353
          self._startXhrStream(old._streamIndex + 1);                  // 1354
          self._http.old = old;                                        // 1355
        } else {                                                       //
          old.abort();                                                 // 1357
        }                                                              //
      }, 25000);                                                       //
    };                                                                 //
                                                                       //
    /** Is the websocket currently open? */                            //
    Socket.prototype._wsOpen = function () {                           // 1363
      return this._socket && this._socket.readyState == 1;             // 1364
    };                                                                 //
                                                                       //
    /** Send queued messages. */                                       //
    Socket.prototype._sendQueuedMessages = function () {               // 1368
      for (var i = 0, ii = this._queue.length; i < ii; i += 1) {       // 1369
        this.send(this._queue[i]);                                     // 1370
      }                                                                //
    };                                                                 //
                                                                       //
    /** Exposed send for DC & Peer. */                                 //
    Socket.prototype.send = function (data) {                          // 1375
      if (this.disconnected) {                                         // 1376
        return;                                                        // 1377
      }                                                                //
                                                                       //
      // If we didn't get an ID yet, we can't yet send anything so we should queue
      // up these messages.                                            //
      if (!this.id) {                                                  // 1382
        this._queue.push(data);                                        // 1383
        return;                                                        // 1384
      }                                                                //
                                                                       //
      if (!data.type) {                                                // 1387
        this.emit('error', 'Invalid message');                         // 1388
        return;                                                        // 1389
      }                                                                //
                                                                       //
      var message = JSON.stringify(data);                              // 1392
      if (this._wsOpen()) {                                            // 1393
        this._socket.send(message);                                    // 1394
      } else {                                                         //
        var http = new XMLHttpRequest();                               // 1396
        var url = this._httpUrl + '/' + data.type.toLowerCase();       // 1397
        http.open('post', url, true);                                  // 1398
        http.setRequestHeader('Content-Type', 'application/json');     // 1399
        http.send(message);                                            // 1400
      }                                                                //
    };                                                                 //
                                                                       //
    Socket.prototype.close = function () {                             // 1404
      if (!this.disconnected && this._wsOpen()) {                      // 1405
        this._socket.close();                                          // 1406
        this.disconnected = true;                                      // 1407
      }                                                                //
    };                                                                 //
                                                                       //
    module.exports = Socket;                                           // 1411
  }, { "./util": 8, "eventemitter3": 9 }], 8: [function (require, module, exports) {
    var defaultConfig = { 'iceServers': [{ 'url': 'stun:stun.l.google.com:19302' }] };
    var dataCount = 1;                                                 // 1415
                                                                       //
    var BinaryPack = require('js-binarypack');                         // 1417
    var RTCPeerConnection = require('./adapter').RTCPeerConnection;    // 1418
                                                                       //
    var util = {                                                       // 1420
      noop: function () {},                                            // 1421
                                                                       //
      CLOUD_HOST: '0.peerjs.com',                                      // 1423
      CLOUD_PORT: 9000,                                                // 1424
                                                                       //
      // Browsers that need chunking:                                  //
      chunkedBrowsers: { 'Chrome': 1 },                                // 1427
      chunkedMTU: 16300, // The original 60000 bytes setting does not work when sending data from Firefox to Chrome, which is "cut off" after 16384 bytes and delivered individually.
                                                                       //
      // Logging logic                                                 //
      logLevel: 0,                                                     // 1431
      setLogLevel: function (level) {                                  // 1432
        var debugLevel = parseInt(level, 10);                          // 1433
        if (!isNaN(parseInt(level, 10))) {                             // 1434
          util.logLevel = debugLevel;                                  // 1435
        } else {                                                       //
          // If they are using truthy/falsy values for debug           //
          util.logLevel = level ? 3 : 0;                               // 1438
        }                                                              //
        util.log = util.warn = util.error = util.noop;                 // 1440
        if (util.logLevel > 0) {                                       // 1441
          util.error = util._printWith('ERROR');                       // 1442
        }                                                              //
        if (util.logLevel > 1) {                                       // 1444
          util.warn = util._printWith('WARNING');                      // 1445
        }                                                              //
        if (util.logLevel > 2) {                                       // 1447
          util.log = util._print;                                      // 1448
        }                                                              //
      },                                                               //
      setLogFunction: function (fn) {                                  // 1451
        if (fn.constructor !== Function) {                             // 1452
          util.warn('The log function you passed in is not a function. Defaulting to regular logs.');
        } else {                                                       //
          util._print = fn;                                            // 1455
        }                                                              //
      },                                                               //
                                                                       //
      _printWith: function (prefix) {                                  // 1459
        return function () {                                           // 1460
          var copy = Array.prototype.slice.call(arguments);            // 1461
          copy.unshift(prefix);                                        // 1462
          util._print.apply(util, copy);                               // 1463
        };                                                             //
      },                                                               //
      _print: function () {                                            // 1466
        var err = false;                                               // 1467
        var copy = Array.prototype.slice.call(arguments);              // 1468
        copy.unshift('PeerJS: ');                                      // 1469
        for (var i = 0, l = copy.length; i < l; i++) {                 // 1470
          if (copy[i] instanceof Error) {                              // 1471
            copy[i] = '(' + copy[i].name + ') ' + copy[i].message;     // 1472
            err = true;                                                // 1473
          }                                                            //
        }                                                              //
        err ? console.error.apply(console, copy) : console.log.apply(console, copy);
      },                                                               //
      //                                                               //
                                                                       //
      // Returns browser-agnostic default config                       //
      defaultConfig: defaultConfig,                                    // 1481
      //                                                               //
                                                                       //
      // Returns the current browser.                                  //
      browser: (function () {                                          // 1485
        if (window.mozRTCPeerConnection) {                             // 1486
          return 'Firefox';                                            // 1487
        } else if (window.webkitRTCPeerConnection) {                   //
          return 'Chrome';                                             // 1489
        } else if (window.RTCPeerConnection) {                         //
          return 'Supported';                                          // 1491
        } else {                                                       //
          return 'Unsupported';                                        // 1493
        }                                                              //
      })(),                                                            //
      //                                                               //
                                                                       //
      // Lists which features are supported                            //
      supports: (function () {                                         // 1499
        if (typeof RTCPeerConnection === 'undefined') {                // 1500
          return {};                                                   // 1501
        }                                                              //
                                                                       //
        var data = true;                                               // 1504
        var audioVideo = true;                                         // 1505
                                                                       //
        var binaryBlob = false;                                        // 1507
        var sctp = false;                                              // 1508
        var onnegotiationneeded = !!window.webkitRTCPeerConnection;    // 1509
                                                                       //
        var pc, dc;                                                    // 1511
        try {                                                          // 1512
          pc = new RTCPeerConnection(defaultConfig, { optional: [{ RtpDataChannels: true }] });
        } catch (e) {                                                  //
          data = false;                                                // 1515
          audioVideo = false;                                          // 1516
        }                                                              //
                                                                       //
        if (data) {                                                    // 1519
          try {                                                        // 1520
            dc = pc.createDataChannel('_PEERJSTEST');                  // 1521
          } catch (e) {                                                //
            data = false;                                              // 1523
          }                                                            //
        }                                                              //
                                                                       //
        if (data) {                                                    // 1527
          // Binary test                                               //
          try {                                                        // 1529
            dc.binaryType = 'blob';                                    // 1530
            binaryBlob = true;                                         // 1531
          } catch (e) {}                                               //
                                                                       //
          // Reliable test.                                            //
          // Unfortunately Chrome is a bit unreliable about whether or not they
          // support reliable.                                         //
          var reliablePC = new RTCPeerConnection(defaultConfig, {});   // 1538
          try {                                                        // 1539
            var reliableDC = reliablePC.createDataChannel('_PEERJSRELIABLETEST', {});
            sctp = reliableDC.reliable;                                // 1541
          } catch (e) {}                                               //
          reliablePC.close();                                          // 1544
        }                                                              //
                                                                       //
        // FIXME: not really the best check...                         //
        if (audioVideo) {                                              // 1548
          audioVideo = !!pc.addStream;                                 // 1549
        }                                                              //
                                                                       //
        // FIXME: this is not great because in theory it doesn't work for
        // av-only browsers (?).                                       //
        if (!onnegotiationneeded && data) {                            // 1554
          // sync default check.                                       //
          var negotiationPC = new RTCPeerConnection(defaultConfig, { optional: [{ RtpDataChannels: true }] });
          negotiationPC.onnegotiationneeded = function () {            // 1557
            onnegotiationneeded = true;                                // 1558
            // async check.                                            //
            if (util && util.supports) {                               // 1560
              util.supports.onnegotiationneeded = true;                // 1561
            }                                                          //
          };                                                           //
          negotiationPC.createDataChannel('_PEERJSNEGOTIATIONTEST');   // 1564
                                                                       //
          setTimeout(function () {                                     // 1566
            negotiationPC.close();                                     // 1567
          }, 1000);                                                    //
        }                                                              //
                                                                       //
        if (pc) {                                                      // 1571
          pc.close();                                                  // 1572
        }                                                              //
                                                                       //
        return {                                                       // 1575
          audioVideo: audioVideo,                                      // 1576
          data: data,                                                  // 1577
          binaryBlob: binaryBlob,                                      // 1578
          binary: sctp, // deprecated; sctp implies binary support.    // 1579
          reliable: sctp, // deprecated; sctp implies reliable data.   // 1580
          sctp: sctp,                                                  // 1581
          onnegotiationneeded: onnegotiationneeded                     // 1582
        };                                                             //
      })(),                                                            //
      //                                                               //
                                                                       //
      // Ensure alphanumeric ids                                       //
      validateId: function (id) {                                      // 1588
        // Allow empty ids                                             //
        return !id || /^[A-Za-z0-9_-]+(?:[ _-][A-Za-z0-9]+)*$/.exec(id);
      },                                                               //
                                                                       //
      validateKey: function (key) {                                    // 1593
        // Allow empty keys                                            //
        return !key || /^[A-Za-z0-9_-]+(?:[ _-][A-Za-z0-9]+)*$/.exec(key);
      },                                                               //
                                                                       //
      debug: false,                                                    // 1599
                                                                       //
      inherits: function (ctor, superCtor) {                           // 1601
        ctor.super_ = superCtor;                                       // 1602
        ctor.prototype = Object.create(superCtor.prototype, {          // 1603
          constructor: {                                               // 1604
            value: ctor,                                               // 1605
            enumerable: false,                                         // 1606
            writable: true,                                            // 1607
            configurable: true                                         // 1608
          }                                                            //
        });                                                            //
      },                                                               //
      extend: function (dest, source) {                                // 1612
        for (var key in babelHelpers.sanitizeForInObject(source)) {    // 1613
          if (source.hasOwnProperty(key)) {                            // 1614
            dest[key] = source[key];                                   // 1615
          }                                                            //
        }                                                              //
        return dest;                                                   // 1618
      },                                                               //
      pack: BinaryPack.pack,                                           // 1620
      unpack: BinaryPack.unpack,                                       // 1621
                                                                       //
      log: function () {                                               // 1623
        if (util.debug) {                                              // 1624
          var err = false;                                             // 1625
          var copy = Array.prototype.slice.call(arguments);            // 1626
          copy.unshift('PeerJS: ');                                    // 1627
          for (var i = 0, l = copy.length; i < l; i++) {               // 1628
            if (copy[i] instanceof Error) {                            // 1629
              copy[i] = '(' + copy[i].name + ') ' + copy[i].message;   // 1630
              err = true;                                              // 1631
            }                                                          //
          }                                                            //
          err ? console.error.apply(console, copy) : console.log.apply(console, copy);
        }                                                              //
      },                                                               //
                                                                       //
      setZeroTimeout: (function (global) {                             // 1638
        var timeouts = [];                                             // 1639
        var messageName = 'zero-timeout-message';                      // 1640
                                                                       //
        // Like setTimeout, but only takes a function argument.  There's
        // no time argument (always zero) and no arguments (you have to
        // use a closure).                                             //
        function setZeroTimeoutPostMessage(fn) {                       // 1645
          timeouts.push(fn);                                           // 1646
          global.postMessage(messageName, '*');                        // 1647
        }                                                              //
                                                                       //
        function handleMessage(event) {                                // 1650
          if (event.source == global && event.data == messageName) {   // 1651
            if (event.stopPropagation) {                               // 1652
              event.stopPropagation();                                 // 1653
            }                                                          //
            if (timeouts.length) {                                     // 1655
              timeouts.shift()();                                      // 1656
            }                                                          //
          }                                                            //
        }                                                              //
        if (global.addEventListener) {                                 // 1660
          global.addEventListener('message', handleMessage, true);     // 1661
        } else if (global.attachEvent) {                               //
          global.attachEvent('onmessage', handleMessage);              // 1663
        }                                                              //
        return setZeroTimeoutPostMessage;                              // 1665
      })(window),                                                      //
                                                                       //
      // Binary stuff                                                  //
                                                                       //
      // chunks a blob.                                                //
      chunk: function (bl) {                                           // 1671
        var chunks = [];                                               // 1672
        var size = bl.size;                                            // 1673
        var start = index = 0;                                         // 1674
        var total = Math.ceil(size / util.chunkedMTU);                 // 1675
        while (start < size) {                                         // 1676
          var end = Math.min(size, start + util.chunkedMTU);           // 1677
          var b = bl.slice(start, end);                                // 1678
                                                                       //
          var chunk = {                                                // 1680
            __peerData: dataCount,                                     // 1681
            n: index,                                                  // 1682
            data: b,                                                   // 1683
            total: total                                               // 1684
          };                                                           //
                                                                       //
          chunks.push(chunk);                                          // 1687
                                                                       //
          start = end;                                                 // 1689
          index += 1;                                                  // 1690
        }                                                              //
        dataCount += 1;                                                // 1692
        return chunks;                                                 // 1693
      },                                                               //
                                                                       //
      blobToArrayBuffer: function (blob, cb) {                         // 1696
        var fr = new FileReader();                                     // 1697
        fr.onload = function (evt) {                                   // 1698
          cb(evt.target.result);                                       // 1699
        };                                                             //
        fr.readAsArrayBuffer(blob);                                    // 1701
      },                                                               //
      blobToBinaryString: function (blob, cb) {                        // 1703
        var fr = new FileReader();                                     // 1704
        fr.onload = function (evt) {                                   // 1705
          cb(evt.target.result);                                       // 1706
        };                                                             //
        fr.readAsBinaryString(blob);                                   // 1708
      },                                                               //
      binaryStringToArrayBuffer: function (binary) {                   // 1710
        var byteArray = new Uint8Array(binary.length);                 // 1711
        for (var i = 0; i < binary.length; i++) {                      // 1712
          byteArray[i] = binary.charCodeAt(i) & 0xff;                  // 1713
        }                                                              //
        return byteArray.buffer;                                       // 1715
      },                                                               //
      randomToken: function () {                                       // 1717
        return Math.random().toString(36).substr(2);                   // 1718
      },                                                               //
      //                                                               //
                                                                       //
      isSecure: function () {                                          // 1722
        return location.protocol === 'https:';                         // 1723
      }                                                                //
    };                                                                 //
                                                                       //
    module.exports = util;                                             // 1727
  }, { "./adapter": 1, "js-binarypack": 10 }], 9: [function (require, module, exports) {
    'use strict';                                                      // 1730
                                                                       //
    /**                                                                //
     * Representation of a single EventEmitter function.               //
     *                                                                 //
     * @param {Function} fn Event handler to be called.                //
     * @param {Mixed} context Context for function execution.          //
     * @param {Boolean} once Only emit once                            //
     * @api private                                                    //
     */                                                                //
    function EE(fn, context, once) {                                   // 1740
      this.fn = fn;                                                    // 1741
      this.context = context;                                          // 1742
      this.once = once || false;                                       // 1743
    }                                                                  //
                                                                       //
    /**                                                                //
     * Minimal EventEmitter interface that is molded against the Node.js
     * EventEmitter interface.                                         //
     *                                                                 //
     * @constructor                                                    //
     * @api public                                                     //
     */                                                                //
    function EventEmitter() {} /* Nothing to set */                    // 1753
                                                                       //
    /**                                                                //
     * Holds the assigned EventEmitters by name.                       //
     *                                                                 //
     * @type {Object}                                                  //
     * @private                                                        //
     */                                                                //
    EventEmitter.prototype._events = undefined;                        // 1753
                                                                       //
    /**                                                                //
     * Return a list of assigned event listeners.                      //
     *                                                                 //
     * @param {String} event The events that should be listed.         //
     * @returns {Array}                                                //
     * @api public                                                     //
     */                                                                //
    EventEmitter.prototype.listeners = (function () {                  // 1770
      function listeners(event) {                                      // 1770
        if (!this._events || !this._events[event]) return [];          // 1771
                                                                       //
        for (var i = 0, l = this._events[event].length, ee = []; i < l; i++) {
          ee.push(this._events[event][i].fn);                          // 1774
        }                                                              //
                                                                       //
        return ee;                                                     // 1777
      }                                                                //
                                                                       //
      return listeners;                                                //
    })();                                                              //
                                                                       //
    /**                                                                //
     * Emit an event to all registered event listeners.                //
     *                                                                 //
     * @param {String} event The name of the event.                    //
     * @returns {Boolean} Indication if we've emitted an event.        //
     * @api public                                                     //
     */                                                                //
    EventEmitter.prototype.emit = (function () {                       // 1787
      function emit(event, a1, a2, a3, a4, a5) {                       // 1787
        if (!this._events || !this._events[event]) return false;       // 1788
                                                                       //
        var listeners = this._events[event],                           // 1790
            length = listeners.length,                                 //
            len = arguments.length,                                    //
            ee = listeners[0],                                         //
            args,                                                      //
            i,                                                         //
            j;                                                         //
                                                                       //
        if (1 === length) {                                            // 1797
          if (ee.once) this.removeListener(event, ee.fn, true);        // 1798
                                                                       //
          switch (len) {                                               // 1800
            case 1:                                                    // 1801
              return (ee.fn.call(ee.context), true);                   // 1801
            case 2:                                                    // 1802
              return (ee.fn.call(ee.context, a1), true);               // 1802
            case 3:                                                    // 1802
              return (ee.fn.call(ee.context, a1, a2), true);           // 1803
            case 4:                                                    // 1804
              return (ee.fn.call(ee.context, a1, a2, a3), true);       // 1804
            case 5:                                                    // 1805
              return (ee.fn.call(ee.context, a1, a2, a3, a4), true);   // 1805
            case 6:                                                    // 1805
              return (ee.fn.call(ee.context, a1, a2, a3, a4, a5), true);
          }                                                            // 1806
                                                                       //
          for (i = 1, args = new Array(len - 1); i < len; i++) {       // 1809
            args[i - 1] = arguments[i];                                // 1810
          }                                                            //
                                                                       //
          ee.fn.apply(ee.context, args);                               // 1813
        } else {                                                       //
          for (i = 0; i < length; i++) {                               // 1815
            if (listeners[i].once) this.removeListener(event, listeners[i].fn, true);
                                                                       //
            switch (len) {                                             // 1818
              case 1:                                                  // 1819
                listeners[i].fn.call(listeners[i].context);break;      // 1819
              case 2:                                                  // 1820
                listeners[i].fn.call(listeners[i].context, a1);break;  // 1820
              case 3:                                                  // 1820
                listeners[i].fn.call(listeners[i].context, a1, a2);break;
              default:                                                 // 1822
                if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) {
                  args[j - 1] = arguments[j];                          // 1824
                }                                                      //
                                                                       //
                listeners[i].fn.apply(listeners[i].context, args);     // 1827
            }                                                          // 1827
          }                                                            //
        }                                                              //
                                                                       //
        return true;                                                   // 1832
      }                                                                //
                                                                       //
      return emit;                                                     //
    })();                                                              //
                                                                       //
    /**                                                                //
     * Register a new EventListener for the given event.               //
     *                                                                 //
     * @param {String} event Name of the event.                        //
     * @param {Functon} fn Callback function.                          //
     * @param {Mixed} context The context of the function.             //
     * @api public                                                     //
     */                                                                //
    EventEmitter.prototype.on = (function () {                         // 1843
      function on(event, fn, context) {                                // 1843
        if (!this._events) this._events = {};                          // 1844
        if (!this._events[event]) this._events[event] = [];            // 1845
        this._events[event].push(new EE(fn, context || this));         // 1846
                                                                       //
        return this;                                                   // 1848
      }                                                                //
                                                                       //
      return on;                                                       //
    })();                                                              //
                                                                       //
    /**                                                                //
     * Add an EventListener that's only called once.                   //
     *                                                                 //
     * @param {String} event Name of the event.                        //
     * @param {Function} fn Callback function.                         //
     * @param {Mixed} context The context of the function.             //
     * @api public                                                     //
     */                                                                //
    EventEmitter.prototype.once = (function () {                       // 1859
      function once(event, fn, context) {                              // 1859
        if (!this._events) this._events = {};                          // 1860
        if (!this._events[event]) this._events[event] = [];            // 1861
        this._events[event].push(new EE(fn, context || this, true));   // 1862
                                                                       //
        return this;                                                   // 1864
      }                                                                //
                                                                       //
      return once;                                                     //
    })();                                                              //
                                                                       //
    /**                                                                //
     * Remove event listeners.                                         //
     *                                                                 //
     * @param {String} event The event we want to remove.              //
     * @param {Function} fn The listener that we need to find.         //
     * @param {Boolean} once Only remove once listeners.               //
     * @api public                                                     //
     */                                                                //
    EventEmitter.prototype.removeListener = (function () {             // 1875
      function removeListener(event, fn, once) {                       // 1875
        if (!this._events || !this._events[event]) return this;        // 1876
                                                                       //
        var listeners = this._events[event],                           // 1878
            events = [];                                               //
                                                                       //
        if (fn) for (var i = 0, length = listeners.length; i < length; i++) {
          if (listeners[i].fn !== fn && listeners[i].once !== once) {  // 1882
            events.push(listeners[i]);                                 // 1883
          }                                                            //
        }                                                              //
                                                                       //
        //                                                             //
        // Reset the array, or remove it completely if we have no more listeners.
        //                                                             //
        if (events.length) this._events[event] = events;else this._events[event] = null;
                                                                       //
        return this;                                                   // 1893
      }                                                                //
                                                                       //
      return removeListener;                                           //
    })();                                                              //
                                                                       //
    /**                                                                //
     * Remove all listeners or only the listeners for the specified event.
     *                                                                 //
     * @param {String} event The event want to remove all listeners for.
     * @api public                                                     //
     */                                                                //
    EventEmitter.prototype.removeAllListeners = (function () {         // 1902
      function removeAllListeners(event) {                             // 1902
        if (!this._events) return this;                                // 1903
                                                                       //
        if (event) this._events[event] = null;else this._events = {};  // 1905
                                                                       //
        return this;                                                   // 1908
      }                                                                //
                                                                       //
      return removeAllListeners;                                       //
    })();                                                              //
                                                                       //
    //                                                                 //
    // Alias methods names because people roll like that.              //
    //                                                                 //
    EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
    EventEmitter.prototype.addListener = EventEmitter.prototype.on;    // 1915
                                                                       //
    //                                                                 //
    // This function doesn't apply anymore.                            //
    //                                                                 //
    EventEmitter.prototype.setMaxListeners = (function () {            // 1920
      function setMaxListeners() {                                     // 1920
        return this;                                                   // 1921
      }                                                                //
                                                                       //
      return setMaxListeners;                                          //
    })();                                                              //
                                                                       //
    //                                                                 //
    // Expose the module.                                              //
    //                                                                 //
    EventEmitter.EventEmitter = EventEmitter;                          // 1927
    EventEmitter.EventEmitter2 = EventEmitter;                         // 1928
    EventEmitter.EventEmitter3 = EventEmitter;                         // 1929
                                                                       //
    if ('object' === typeof module && module.exports) {                // 1931
      module.exports = EventEmitter;                                   // 1932
    }                                                                  //
  }, {}], 10: [function (require, module, exports) {                   //
    var BufferBuilder = require('./bufferbuilder').BufferBuilder;      // 1936
    var binaryFeatures = require('./bufferbuilder').binaryFeatures;    // 1937
                                                                       //
    var BinaryPack = {                                                 // 1939
      unpack: function (data) {                                        // 1940
        var unpacker = new Unpacker(data);                             // 1941
        return unpacker.unpack();                                      // 1942
      },                                                               //
      pack: function (data) {                                          // 1944
        var packer = new Packer();                                     // 1945
        packer.pack(data);                                             // 1946
        var buffer = packer.getBuffer();                               // 1947
        return buffer;                                                 // 1948
      }                                                                //
    };                                                                 //
                                                                       //
    module.exports = BinaryPack;                                       // 1952
                                                                       //
    function Unpacker(data) {                                          // 1954
      // Data is ArrayBuffer                                           //
      this.index = 0;                                                  // 1956
      this.dataBuffer = data;                                          // 1957
      this.dataView = new Uint8Array(this.dataBuffer);                 // 1958
      this.length = this.dataBuffer.byteLength;                        // 1959
    }                                                                  //
                                                                       //
    Unpacker.prototype.unpack = function () {                          // 1962
      var type = this.unpack_uint8();                                  // 1963
      if (type < 0x80) {                                               // 1964
        var positive_fixnum = type;                                    // 1965
        return positive_fixnum;                                        // 1966
      } else if ((type ^ 0xe0) < 0x20) {                               //
        var negative_fixnum = (type ^ 0xe0) - 0x20;                    // 1968
        return negative_fixnum;                                        // 1969
      }                                                                //
      var size;                                                        // 1971
      if ((size = type ^ 0xa0) <= 0x0f) {                              // 1972
        return this.unpack_raw(size);                                  // 1973
      } else if ((size = type ^ 0xb0) <= 0x0f) {                       //
        return this.unpack_string(size);                               // 1975
      } else if ((size = type ^ 0x90) <= 0x0f) {                       //
        return this.unpack_array(size);                                // 1977
      } else if ((size = type ^ 0x80) <= 0x0f) {                       //
        return this.unpack_map(size);                                  // 1979
      }                                                                //
      switch (type) {                                                  // 1981
        case 0xc0:                                                     // 1982
          return null;                                                 // 1983
        case 0xc1:                                                     // 1984
          return undefined;                                            // 1985
        case 0xc2:                                                     // 1986
          return false;                                                // 1987
        case 0xc3:                                                     // 1988
          return true;                                                 // 1989
        case 0xca:                                                     // 1990
          return this.unpack_float();                                  // 1991
        case 0xcb:                                                     // 1991
          return this.unpack_double();                                 // 1993
        case 0xcc:                                                     // 1994
          return this.unpack_uint8();                                  // 1995
        case 0xcd:                                                     // 1996
          return this.unpack_uint16();                                 // 1997
        case 0xce:                                                     // 1997
          return this.unpack_uint32();                                 // 1999
        case 0xcf:                                                     // 2000
          return this.unpack_uint64();                                 // 2001
        case 0xd0:                                                     // 2001
          return this.unpack_int8();                                   // 2003
        case 0xd1:                                                     // 2004
          return this.unpack_int16();                                  // 2005
        case 0xd2:                                                     // 2005
          return this.unpack_int32();                                  // 2007
        case 0xd3:                                                     // 2007
          return this.unpack_int64();                                  // 2009
        case 0xd4:                                                     // 2010
          return undefined;                                            // 2011
        case 0xd5:                                                     // 2012
          return undefined;                                            // 2013
        case 0xd6:                                                     // 2014
          return undefined;                                            // 2015
        case 0xd7:                                                     // 2016
          return undefined;                                            // 2017
        case 0xd8:                                                     // 2018
          size = this.unpack_uint16();                                 // 2019
          return this.unpack_string(size);                             // 2020
        case 0xd9:                                                     // 2021
          size = this.unpack_uint32();                                 // 2022
          return this.unpack_string(size);                             // 2023
        case 0xda:                                                     // 2023
          size = this.unpack_uint16();                                 // 2025
          return this.unpack_raw(size);                                // 2026
        case 0xdb:                                                     // 2026
          size = this.unpack_uint32();                                 // 2028
          return this.unpack_raw(size);                                // 2029
        case 0xdc:                                                     // 2029
          size = this.unpack_uint16();                                 // 2031
          return this.unpack_array(size);                              // 2032
        case 0xdd:                                                     // 2033
          size = this.unpack_uint32();                                 // 2034
          return this.unpack_array(size);                              // 2035
        case 0xde:                                                     // 2035
          size = this.unpack_uint16();                                 // 2037
          return this.unpack_map(size);                                // 2038
        case 0xdf:                                                     // 2039
          size = this.unpack_uint32();                                 // 2040
          return this.unpack_map(size);                                // 2041
      }                                                                // 2041
    };                                                                 //
                                                                       //
    Unpacker.prototype.unpack_uint8 = function () {                    // 2045
      var byte = this.dataView[this.index] & 0xff;                     // 2046
      this.index++;                                                    // 2047
      return byte;                                                     // 2048
    };                                                                 //
                                                                       //
    Unpacker.prototype.unpack_uint16 = function () {                   // 2051
      var bytes = this.read(2);                                        // 2052
      var uint16 = (bytes[0] & 0xff) * 256 + (bytes[1] & 0xff);        // 2053
      this.index += 2;                                                 // 2055
      return uint16;                                                   // 2056
    };                                                                 //
                                                                       //
    Unpacker.prototype.unpack_uint32 = function () {                   // 2059
      var bytes = this.read(4);                                        // 2060
      var uint32 = ((bytes[0] * 256 + bytes[1]) * 256 + bytes[2]) * 256 + bytes[3];
      this.index += 4;                                                 // 2066
      return uint32;                                                   // 2067
    };                                                                 //
                                                                       //
    Unpacker.prototype.unpack_uint64 = function () {                   // 2070
      var bytes = this.read(8);                                        // 2071
      var uint64 = ((((((bytes[0] * 256 + bytes[1]) * 256 + bytes[2]) * 256 + bytes[3]) * 256 + bytes[4]) * 256 + bytes[5]) * 256 + bytes[6]) * 256 + bytes[7];
      this.index += 8;                                                 // 2081
      return uint64;                                                   // 2082
    };                                                                 //
                                                                       //
    Unpacker.prototype.unpack_int8 = function () {                     // 2086
      var uint8 = this.unpack_uint8();                                 // 2087
      return uint8 < 0x80 ? uint8 : uint8 - (1 << 8);                  // 2088
    };                                                                 //
                                                                       //
    Unpacker.prototype.unpack_int16 = function () {                    // 2091
      var uint16 = this.unpack_uint16();                               // 2092
      return uint16 < 0x8000 ? uint16 : uint16 - (1 << 16);            // 2093
    };                                                                 //
                                                                       //
    Unpacker.prototype.unpack_int32 = function () {                    // 2096
      var uint32 = this.unpack_uint32();                               // 2097
      return uint32 < Math.pow(2, 31) ? uint32 : uint32 - Math.pow(2, 32);
    };                                                                 //
                                                                       //
    Unpacker.prototype.unpack_int64 = function () {                    // 2102
      var uint64 = this.unpack_uint64();                               // 2103
      return uint64 < Math.pow(2, 63) ? uint64 : uint64 - Math.pow(2, 64);
    };                                                                 //
                                                                       //
    Unpacker.prototype.unpack_raw = function (size) {                  // 2108
      if (this.length < this.index + size) {                           // 2109
        throw new Error('BinaryPackFailure: index is out of range' + ' ' + this.index + ' ' + size + ' ' + this.length);
      }                                                                //
      var buf = this.dataBuffer.slice(this.index, this.index + size);  // 2113
      this.index += size;                                              // 2114
                                                                       //
      //buf = util.bufferToString(buf);                                //
                                                                       //
      return buf;                                                      // 2118
    };                                                                 //
                                                                       //
    Unpacker.prototype.unpack_string = function (size) {               // 2121
      var bytes = this.read(size);                                     // 2122
      var i = 0,                                                       // 2123
          str = '',                                                    //
          c,                                                           //
          code;                                                        //
      while (i < size) {                                               // 2124
        c = bytes[i];                                                  // 2125
        if (c < 128) {                                                 // 2126
          str += String.fromCharCode(c);                               // 2127
          i++;                                                         // 2128
        } else if ((c ^ 0xc0) < 32) {                                  //
          code = (c ^ 0xc0) << 6 | bytes[i + 1] & 63;                  // 2130
          str += String.fromCharCode(code);                            // 2131
          i += 2;                                                      // 2132
        } else {                                                       //
          code = (c & 15) << 12 | (bytes[i + 1] & 63) << 6 | bytes[i + 2] & 63;
          str += String.fromCharCode(code);                            // 2136
          i += 3;                                                      // 2137
        }                                                              //
      }                                                                //
      this.index += size;                                              // 2140
      return str;                                                      // 2141
    };                                                                 //
                                                                       //
    Unpacker.prototype.unpack_array = function (size) {                // 2144
      var objects = new Array(size);                                   // 2145
      for (var i = 0; i < size; i++) {                                 // 2146
        objects[i] = this.unpack();                                    // 2147
      }                                                                //
      return objects;                                                  // 2149
    };                                                                 //
                                                                       //
    Unpacker.prototype.unpack_map = function (size) {                  // 2152
      var map = {};                                                    // 2153
      for (var i = 0; i < size; i++) {                                 // 2154
        var key = this.unpack();                                       // 2155
        var value = this.unpack();                                     // 2156
        map[key] = value;                                              // 2157
      }                                                                //
      return map;                                                      // 2159
    };                                                                 //
                                                                       //
    Unpacker.prototype.unpack_float = function () {                    // 2162
      var uint32 = this.unpack_uint32();                               // 2163
      var sign = uint32 >> 31;                                         // 2164
      var exp = (uint32 >> 23 & 0xff) - 127;                           // 2165
      var fraction = uint32 & 0x7fffff | 0x800000;                     // 2166
      return (sign == 0 ? 1 : -1) * fraction * Math.pow(2, exp - 23);  // 2167
    };                                                                 //
                                                                       //
    Unpacker.prototype.unpack_double = function () {                   // 2171
      var h32 = this.unpack_uint32();                                  // 2172
      var l32 = this.unpack_uint32();                                  // 2173
      var sign = h32 >> 31;                                            // 2174
      var exp = (h32 >> 20 & 0x7ff) - 1023;                            // 2175
      var hfrac = h32 & 0xfffff | 0x100000;                            // 2176
      var frac = hfrac * Math.pow(2, exp - 20) + l32 * Math.pow(2, exp - 52);
      return (sign == 0 ? 1 : -1) * frac;                              // 2179
    };                                                                 //
                                                                       //
    Unpacker.prototype.read = function (length) {                      // 2182
      var j = this.index;                                              // 2183
      if (j + length <= this.length) {                                 // 2184
        return this.dataView.subarray(j, j + length);                  // 2185
      } else {                                                         //
        throw new Error('BinaryPackFailure: read index out of range');
      }                                                                //
    };                                                                 //
                                                                       //
    function Packer() {                                                // 2191
      this.bufferBuilder = new BufferBuilder();                        // 2192
    }                                                                  //
                                                                       //
    Packer.prototype.getBuffer = function () {                         // 2195
      return this.bufferBuilder.getBuffer();                           // 2196
    };                                                                 //
                                                                       //
    Packer.prototype.pack = function (value) {                         // 2199
      var type = typeof value;                                         // 2200
      if (type == 'string') {                                          // 2201
        this.pack_string(value);                                       // 2202
      } else if (type == 'number') {                                   //
        if (Math.floor(value) === value) {                             // 2204
          this.pack_integer(value);                                    // 2205
        } else {                                                       //
          this.pack_double(value);                                     // 2207
        }                                                              //
      } else if (type == 'boolean') {                                  //
        if (value === true) {                                          // 2210
          this.bufferBuilder.append(0xc3);                             // 2211
        } else if (value === false) {                                  //
          this.bufferBuilder.append(0xc2);                             // 2213
        }                                                              //
      } else if (type == 'undefined') {                                //
        this.bufferBuilder.append(0xc0);                               // 2216
      } else if (type == 'object') {                                   //
        if (value === null) {                                          // 2218
          this.bufferBuilder.append(0xc0);                             // 2219
        } else {                                                       //
          var constructor = value.constructor;                         // 2221
          if (constructor == Array) {                                  // 2222
            this.pack_array(value);                                    // 2223
          } else if (constructor == Blob || constructor == File) {     //
            this.pack_bin(value);                                      // 2225
          } else if (constructor == ArrayBuffer) {                     //
            if (binaryFeatures.useArrayBufferView) {                   // 2227
              this.pack_bin(new Uint8Array(value));                    // 2228
            } else {                                                   //
              this.pack_bin(value);                                    // 2230
            }                                                          //
          } else if ('BYTES_PER_ELEMENT' in value) {                   //
            if (binaryFeatures.useArrayBufferView) {                   // 2233
              this.pack_bin(new Uint8Array(value.buffer));             // 2234
            } else {                                                   //
              this.pack_bin(value.buffer);                             // 2236
            }                                                          //
          } else if (constructor == Object) {                          //
            this.pack_object(value);                                   // 2239
          } else if (constructor == Date) {                            //
            this.pack_string(value.toString());                        // 2241
          } else if (typeof value.toBinaryPack == 'function') {        //
            this.bufferBuilder.append(value.toBinaryPack());           // 2243
          } else {                                                     //
            throw new Error('Type "' + constructor.toString() + '" not yet supported');
          }                                                            //
        }                                                              //
      } else {                                                         //
        throw new Error('Type "' + type + '" not yet supported');      // 2249
      }                                                                //
      this.bufferBuilder.flush();                                      // 2251
    };                                                                 //
                                                                       //
    Packer.prototype.pack_bin = function (blob) {                      // 2255
      var length = blob.length || blob.byteLength || blob.size;        // 2256
      if (length <= 0x0f) {                                            // 2257
        this.pack_uint8(0xa0 + length);                                // 2258
      } else if (length <= 0xffff) {                                   //
        this.bufferBuilder.append(0xda);                               // 2260
        this.pack_uint16(length);                                      // 2261
      } else if (length <= 0xffffffff) {                               //
        this.bufferBuilder.append(0xdb);                               // 2263
        this.pack_uint32(length);                                      // 2264
      } else {                                                         //
        throw new Error('Invalid length');                             // 2266
      }                                                                //
      this.bufferBuilder.append(blob);                                 // 2268
    };                                                                 //
                                                                       //
    Packer.prototype.pack_string = function (str) {                    // 2271
      var length = utf8Length(str);                                    // 2272
                                                                       //
      if (length <= 0x0f) {                                            // 2274
        this.pack_uint8(0xb0 + length);                                // 2275
      } else if (length <= 0xffff) {                                   //
        this.bufferBuilder.append(0xd8);                               // 2277
        this.pack_uint16(length);                                      // 2278
      } else if (length <= 0xffffffff) {                               //
        this.bufferBuilder.append(0xd9);                               // 2280
        this.pack_uint32(length);                                      // 2281
      } else {                                                         //
        throw new Error('Invalid length');                             // 2283
      }                                                                //
      this.bufferBuilder.append(str);                                  // 2285
    };                                                                 //
                                                                       //
    Packer.prototype.pack_array = function (ary) {                     // 2288
      var length = ary.length;                                         // 2289
      if (length <= 0x0f) {                                            // 2290
        this.pack_uint8(0x90 + length);                                // 2291
      } else if (length <= 0xffff) {                                   //
        this.bufferBuilder.append(0xdc);                               // 2293
        this.pack_uint16(length);                                      // 2294
      } else if (length <= 0xffffffff) {                               //
        this.bufferBuilder.append(0xdd);                               // 2296
        this.pack_uint32(length);                                      // 2297
      } else {                                                         //
        throw new Error('Invalid length');                             // 2299
      }                                                                //
      for (var i = 0; i < length; i++) {                               // 2301
        this.pack(ary[i]);                                             // 2302
      }                                                                //
    };                                                                 //
                                                                       //
    Packer.prototype.pack_integer = function (num) {                   // 2306
      if (-0x20 <= num && num <= 0x7f) {                               // 2307
        this.bufferBuilder.append(num & 0xff);                         // 2308
      } else if (0x00 <= num && num <= 0xff) {                         //
        this.bufferBuilder.append(0xcc);                               // 2310
        this.pack_uint8(num);                                          // 2311
      } else if (-0x80 <= num && num <= 0x7f) {                        //
        this.bufferBuilder.append(0xd0);                               // 2313
        this.pack_int8(num);                                           // 2314
      } else if (0x0000 <= num && num <= 0xffff) {                     //
        this.bufferBuilder.append(0xcd);                               // 2316
        this.pack_uint16(num);                                         // 2317
      } else if (-0x8000 <= num && num <= 0x7fff) {                    //
        this.bufferBuilder.append(0xd1);                               // 2319
        this.pack_int16(num);                                          // 2320
      } else if (0x00000000 <= num && num <= 0xffffffff) {             //
        this.bufferBuilder.append(0xce);                               // 2322
        this.pack_uint32(num);                                         // 2323
      } else if (-0x80000000 <= num && num <= 0x7fffffff) {            //
        this.bufferBuilder.append(0xd2);                               // 2325
        this.pack_int32(num);                                          // 2326
      } else if (-0x8000000000000000 <= num && num <= 0x7FFFFFFFFFFFFFFF) {
        this.bufferBuilder.append(0xd3);                               // 2328
        this.pack_int64(num);                                          // 2329
      } else if (0x0000000000000000 <= num && num <= 0xFFFFFFFFFFFFFFFF) {
        this.bufferBuilder.append(0xcf);                               // 2331
        this.pack_uint64(num);                                         // 2332
      } else {                                                         //
        throw new Error('Invalid integer');                            // 2334
      }                                                                //
    };                                                                 //
                                                                       //
    Packer.prototype.pack_double = function (num) {                    // 2338
      var sign = 0;                                                    // 2339
      if (num < 0) {                                                   // 2340
        sign = 1;                                                      // 2341
        num = -num;                                                    // 2342
      }                                                                //
      var exp = Math.floor(Math.log(num) / Math.LN2);                  // 2344
      var frac0 = num / Math.pow(2, exp) - 1;                          // 2345
      var frac1 = Math.floor(frac0 * Math.pow(2, 52));                 // 2346
      var b32 = Math.pow(2, 32);                                       // 2347
      var h32 = sign << 31 | exp + 1023 << 20 | frac1 / b32 & 0x0fffff;
      var l32 = frac1 % b32;                                           // 2350
      this.bufferBuilder.append(0xcb);                                 // 2351
      this.pack_int32(h32);                                            // 2352
      this.pack_int32(l32);                                            // 2353
    };                                                                 //
                                                                       //
    Packer.prototype.pack_object = function (obj) {                    // 2356
      var keys = Object.keys(obj);                                     // 2357
      var length = keys.length;                                        // 2358
      if (length <= 0x0f) {                                            // 2359
        this.pack_uint8(0x80 + length);                                // 2360
      } else if (length <= 0xffff) {                                   //
        this.bufferBuilder.append(0xde);                               // 2362
        this.pack_uint16(length);                                      // 2363
      } else if (length <= 0xffffffff) {                               //
        this.bufferBuilder.append(0xdf);                               // 2365
        this.pack_uint32(length);                                      // 2366
      } else {                                                         //
        throw new Error('Invalid length');                             // 2368
      }                                                                //
      for (var prop in babelHelpers.sanitizeForInObject(obj)) {        // 2370
        if (obj.hasOwnProperty(prop)) {                                // 2371
          this.pack(prop);                                             // 2372
          this.pack(obj[prop]);                                        // 2373
        }                                                              //
      }                                                                //
    };                                                                 //
                                                                       //
    Packer.prototype.pack_uint8 = function (num) {                     // 2378
      this.bufferBuilder.append(num);                                  // 2379
    };                                                                 //
                                                                       //
    Packer.prototype.pack_uint16 = function (num) {                    // 2382
      this.bufferBuilder.append(num >> 8);                             // 2383
      this.bufferBuilder.append(num & 0xff);                           // 2384
    };                                                                 //
                                                                       //
    Packer.prototype.pack_uint32 = function (num) {                    // 2387
      var n = num & 0xffffffff;                                        // 2388
      this.bufferBuilder.append((n & 0xff000000) >>> 24);              // 2389
      this.bufferBuilder.append((n & 0x00ff0000) >>> 16);              // 2390
      this.bufferBuilder.append((n & 0x0000ff00) >>> 8);               // 2391
      this.bufferBuilder.append(n & 0x000000ff);                       // 2392
    };                                                                 //
                                                                       //
    Packer.prototype.pack_uint64 = function (num) {                    // 2395
      var high = num / Math.pow(2, 32);                                // 2396
      var low = num % Math.pow(2, 32);                                 // 2397
      this.bufferBuilder.append((high & 0xff000000) >>> 24);           // 2398
      this.bufferBuilder.append((high & 0x00ff0000) >>> 16);           // 2399
      this.bufferBuilder.append((high & 0x0000ff00) >>> 8);            // 2400
      this.bufferBuilder.append(high & 0x000000ff);                    // 2401
      this.bufferBuilder.append((low & 0xff000000) >>> 24);            // 2402
      this.bufferBuilder.append((low & 0x00ff0000) >>> 16);            // 2403
      this.bufferBuilder.append((low & 0x0000ff00) >>> 8);             // 2404
      this.bufferBuilder.append(low & 0x000000ff);                     // 2405
    };                                                                 //
                                                                       //
    Packer.prototype.pack_int8 = function (num) {                      // 2408
      this.bufferBuilder.append(num & 0xff);                           // 2409
    };                                                                 //
                                                                       //
    Packer.prototype.pack_int16 = function (num) {                     // 2412
      this.bufferBuilder.append((num & 0xff00) >> 8);                  // 2413
      this.bufferBuilder.append(num & 0xff);                           // 2414
    };                                                                 //
                                                                       //
    Packer.prototype.pack_int32 = function (num) {                     // 2417
      this.bufferBuilder.append(num >>> 24 & 0xff);                    // 2418
      this.bufferBuilder.append((num & 0x00ff0000) >>> 16);            // 2419
      this.bufferBuilder.append((num & 0x0000ff00) >>> 8);             // 2420
      this.bufferBuilder.append(num & 0x000000ff);                     // 2421
    };                                                                 //
                                                                       //
    Packer.prototype.pack_int64 = function (num) {                     // 2424
      var high = Math.floor(num / Math.pow(2, 32));                    // 2425
      var low = num % Math.pow(2, 32);                                 // 2426
      this.bufferBuilder.append((high & 0xff000000) >>> 24);           // 2427
      this.bufferBuilder.append((high & 0x00ff0000) >>> 16);           // 2428
      this.bufferBuilder.append((high & 0x0000ff00) >>> 8);            // 2429
      this.bufferBuilder.append(high & 0x000000ff);                    // 2430
      this.bufferBuilder.append((low & 0xff000000) >>> 24);            // 2431
      this.bufferBuilder.append((low & 0x00ff0000) >>> 16);            // 2432
      this.bufferBuilder.append((low & 0x0000ff00) >>> 8);             // 2433
      this.bufferBuilder.append(low & 0x000000ff);                     // 2434
    };                                                                 //
                                                                       //
    function _utf8Replace(m) {                                         // 2437
      var code = m.charCodeAt(0);                                      // 2438
                                                                       //
      if (code <= 0x7ff) return '00';                                  // 2440
      if (code <= 0xffff) return '000';                                // 2441
      if (code <= 0x1fffff) return '0000';                             // 2442
      if (code <= 0x3ffffff) return '00000';                           // 2443
      return '000000';                                                 // 2444
    }                                                                  //
                                                                       //
    function utf8Length(str) {                                         // 2447
      if (str.length > 600) {                                          // 2448
        // Blob method faster for large strings                        //
        return new Blob([str]).size;                                   // 2450
      } else {                                                         //
        return str.replace(/[^\u0000-\u007F]/g, _utf8Replace).length;  // 2452
      }                                                                //
    }                                                                  //
  }, { "./bufferbuilder": 11 }], 11: [function (require, module, exports) {
    var binaryFeatures = {};                                           // 2457
    binaryFeatures.useBlobBuilder = (function () {                     // 2458
      try {                                                            // 2459
        new Blob([]);                                                  // 2460
        return false;                                                  // 2461
      } catch (e) {                                                    //
        return true;                                                   // 2463
      }                                                                //
    })();                                                              //
                                                                       //
    binaryFeatures.useArrayBufferView = !binaryFeatures.useBlobBuilder && (function () {
      try {                                                            // 2468
        return new Blob([new Uint8Array([])]).size === 0;              // 2469
      } catch (e) {                                                    //
        return true;                                                   // 2471
      }                                                                //
    })();                                                              //
                                                                       //
    module.exports.binaryFeatures = binaryFeatures;                    // 2475
    var BlobBuilder = module.exports.BlobBuilder;                      // 2476
    if (typeof window != 'undefined') {                                // 2477
      BlobBuilder = module.exports.BlobBuilder = window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder || window.BlobBuilder;
    }                                                                  //
                                                                       //
    function BufferBuilder() {                                         // 2482
      this._pieces = [];                                               // 2483
      this._parts = [];                                                // 2484
    }                                                                  //
                                                                       //
    BufferBuilder.prototype.append = function (data) {                 // 2487
      if (typeof data === 'number') {                                  // 2488
        this._pieces.push(data);                                       // 2489
      } else {                                                         //
        this.flush();                                                  // 2491
        this._parts.push(data);                                        // 2492
      }                                                                //
    };                                                                 //
                                                                       //
    BufferBuilder.prototype.flush = function () {                      // 2496
      if (this._pieces.length > 0) {                                   // 2497
        var buf = new Uint8Array(this._pieces);                        // 2498
        if (!binaryFeatures.useArrayBufferView) {                      // 2499
          buf = buf.buffer;                                            // 2500
        }                                                              //
        this._parts.push(buf);                                         // 2502
        this._pieces = [];                                             // 2503
      }                                                                //
    };                                                                 //
                                                                       //
    BufferBuilder.prototype.getBuffer = function () {                  // 2507
      this.flush();                                                    // 2508
      if (binaryFeatures.useBlobBuilder) {                             // 2509
        var builder = new BlobBuilder();                               // 2510
        for (var i = 0, ii = this._parts.length; i < ii; i++) {        // 2511
          builder.append(this._parts[i]);                              // 2512
        }                                                              //
        return builder.getBlob();                                      // 2514
      } else {                                                         //
        return new Blob(this._parts);                                  // 2516
      }                                                                //
    };                                                                 //
                                                                       //
    module.exports.BufferBuilder = BufferBuilder;                      // 2520
  }, {}], 12: [function (require, module, exports) {                   //
    var util = require('./util');                                      // 2523
                                                                       //
    /**                                                                //
     * Reliable transfer for Chrome Canary DataChannel impl.           //
     * Author: @michellebu                                             //
     */                                                                //
    function Reliable(dc, debug) {                                     // 2529
      if (!(this instanceof Reliable)) return new Reliable(dc);        // 2530
      this._dc = dc;                                                   // 2531
                                                                       //
      util.debug = debug;                                              // 2533
                                                                       //
      // Messages sent/received so far.                                //
      // id: { ack: n, chunks: [...] }                                 //
      this._outgoing = {};                                             // 2537
      // id: { ack: ['ack', id, n], chunks: [...] }                    //
      this._incoming = {};                                             // 2539
      this._received = {};                                             // 2540
                                                                       //
      // Window size.                                                  //
      this._window = 1000;                                             // 2543
      // MTU.                                                          //
      this._mtu = 500;                                                 // 2545
      // Interval for setInterval. In ms.                              //
      this._interval = 0;                                              // 2547
                                                                       //
      // Messages sent.                                                //
      this._count = 0;                                                 // 2550
                                                                       //
      // Outgoing message queue.                                       //
      this._queue = [];                                                // 2553
                                                                       //
      this._setupDC();                                                 // 2555
    };                                                                 //
                                                                       //
    // Send a message reliably.                                        //
    Reliable.prototype.send = function (msg) {                         // 2559
      // Determine if chunking is necessary.                           //
      var bl = util.pack(msg);                                         // 2561
      if (bl.size < this._mtu) {                                       // 2562
        this._handleSend(['no', bl]);                                  // 2563
        return;                                                        // 2564
      }                                                                //
                                                                       //
      this._outgoing[this._count] = {                                  // 2567
        ack: 0,                                                        // 2568
        chunks: this._chunk(bl)                                        // 2569
      };                                                               //
                                                                       //
      if (util.debug) {                                                // 2572
        this._outgoing[this._count].timer = new Date();                // 2573
      }                                                                //
                                                                       //
      // Send prelim window.                                           //
      this._sendWindowedChunks(this._count);                           // 2577
      this._count += 1;                                                // 2578
    };                                                                 //
                                                                       //
    // Set up interval for processing queue.                           //
    Reliable.prototype._setupInterval = function () {                  // 2582
      // TODO: fail gracefully.                                        //
                                                                       //
      var self = this;                                                 // 2585
      this._timeout = setInterval(function () {                        // 2586
        // FIXME: String stuff makes things terribly async.            //
        var msg = self._queue.shift();                                 // 2588
        if (msg._multiple) {                                           // 2589
          for (var i = 0, ii = msg.length; i < ii; i += 1) {           // 2590
            self._intervalSend(msg[i]);                                // 2591
          }                                                            //
        } else {                                                       //
          self._intervalSend(msg);                                     // 2594
        }                                                              //
      }, this._interval);                                              //
    };                                                                 //
                                                                       //
    Reliable.prototype._intervalSend = function (msg) {                // 2599
      var self = this;                                                 // 2600
      msg = util.pack(msg);                                            // 2601
      util.blobToBinaryString(msg, function (str) {                    // 2602
        self._dc.send(str);                                            // 2603
      });                                                              //
      if (self._queue.length === 0) {                                  // 2605
        clearTimeout(self._timeout);                                   // 2606
        self._timeout = null;                                          // 2607
        //self._processAcks();                                         //
      }                                                                //
    };                                                                 //
                                                                       //
    // Go through ACKs to send missing pieces.                         //
    Reliable.prototype._processAcks = function () {                    // 2613
      for (var id in babelHelpers.sanitizeForInObject(this._outgoing)) {
        if (this._outgoing.hasOwnProperty(id)) {                       // 2615
          this._sendWindowedChunks(id);                                // 2616
        }                                                              //
      }                                                                //
    };                                                                 //
                                                                       //
    // Handle sending a message.                                       //
    // FIXME: Don't wait for interval time for all messages...         //
    Reliable.prototype._handleSend = function (msg) {                  // 2623
      var push = true;                                                 // 2624
      for (var i = 0, ii = this._queue.length; i < ii; i += 1) {       // 2625
        var item = this._queue[i];                                     // 2626
        if (item === msg) {                                            // 2627
          push = false;                                                // 2628
        } else if (item._multiple && item.indexOf(msg) !== -1) {       //
          push = false;                                                // 2630
        }                                                              //
      }                                                                //
      if (push) {                                                      // 2633
        this._queue.push(msg);                                         // 2634
        if (!this._timeout) {                                          // 2635
          this._setupInterval();                                       // 2636
        }                                                              //
      }                                                                //
    };                                                                 //
                                                                       //
    // Set up DataChannel handlers.                                    //
    Reliable.prototype._setupDC = function () {                        // 2642
      // Handle various message types.                                 //
      var self = this;                                                 // 2644
      this._dc.onmessage = function (e) {                              // 2645
        var msg = e.data;                                              // 2646
        var datatype = msg.constructor;                                // 2647
        // FIXME: msg is String until binary is supported.             //
        // Once that happens, this will have to be smarter.            //
        if (datatype === String) {                                     // 2650
          var ab = util.binaryStringToArrayBuffer(msg);                // 2651
          msg = util.unpack(ab);                                       // 2652
          self._handleMessage(msg);                                    // 2653
        }                                                              //
      };                                                               //
    };                                                                 //
                                                                       //
    // Handles an incoming message.                                    //
    Reliable.prototype._handleMessage = function (msg) {               // 2659
      var id = msg[1];                                                 // 2660
      var idata = this._incoming[id];                                  // 2661
      var odata = this._outgoing[id];                                  // 2662
      var data;                                                        // 2663
      switch (msg[0]) {                                                // 2664
        // No chunking was done.                                       //
        case 'no':                                                     // 2666
          var message = id;                                            // 2667
          if (!!message) {                                             // 2668
            this.onmessage(util.unpack(message));                      // 2669
          }                                                            //
          break;                                                       // 2671
        // Reached the end of the message.                             // 2671
        case 'end':                                                    // 2673
          data = idata;                                                // 2674
                                                                       //
          // In case end comes first.                                  //
          this._received[id] = msg[2];                                 // 2677
                                                                       //
          if (!data) {                                                 // 2679
            break;                                                     // 2680
          }                                                            //
                                                                       //
          this._ack(id);                                               // 2683
          break;                                                       // 2684
        case 'ack':                                                    // 2685
          data = odata;                                                // 2686
          if (!!data) {                                                // 2687
            var ack = msg[2];                                          // 2688
            // Take the larger ACK, for out of order messages.         //
            data.ack = Math.max(ack, data.ack);                        // 2690
                                                                       //
            // Clean up when all chunks are ACKed.                     //
            if (data.ack >= data.chunks.length) {                      // 2693
              util.log('Time: ', new Date() - data.timer);             // 2694
              delete this._outgoing[id];                               // 2695
            } else {                                                   //
              this._processAcks();                                     // 2697
            }                                                          //
          }                                                            //
          // If !data, just ignore.                                    //
          break;                                                       // 2701
        // Received a chunk of data.                                   // 2701
        case 'chunk':                                                  // 2703
          // Create a new entry if none exists.                        //
          data = idata;                                                // 2705
          if (!data) {                                                 // 2706
            var end = this._received[id];                              // 2707
            if (end === true) {                                        // 2708
              break;                                                   // 2709
            }                                                          //
            data = {                                                   // 2711
              ack: ['ack', id, 0],                                     // 2712
              chunks: []                                               // 2713
            };                                                         //
            this._incoming[id] = data;                                 // 2715
          }                                                            //
                                                                       //
          var n = msg[2];                                              // 2718
          var chunk = msg[3];                                          // 2719
          data.chunks[n] = new Uint8Array(chunk);                      // 2720
                                                                       //
          // If we get the chunk we're looking for, ACK for next missing.
          // Otherwise, ACK the same N again.                          //
          if (n === data.ack[2]) {                                     // 2724
            this._calculateNextAck(id);                                // 2725
          }                                                            //
          this._ack(id);                                               // 2727
          break;                                                       // 2728
        default:                                                       // 2729
          // Shouldn't happen, but would make sense for message to just go
          // through as is.                                            //
          this._handleSend(msg);                                       // 2732
          break;                                                       // 2733
      }                                                                // 2733
    };                                                                 //
                                                                       //
    // Chunks BL into smaller messages.                                //
    Reliable.prototype._chunk = function (bl) {                        // 2738
      var chunks = [];                                                 // 2739
      var size = bl.size;                                              // 2740
      var start = 0;                                                   // 2741
      while (start < size) {                                           // 2742
        var end = Math.min(size, start + this._mtu);                   // 2743
        var b = bl.slice(start, end);                                  // 2744
        var chunk = {                                                  // 2745
          payload: b                                                   // 2746
        };                                                             //
        chunks.push(chunk);                                            // 2748
        start = end;                                                   // 2749
      }                                                                //
      util.log('Created', chunks.length, 'chunks.');                   // 2751
      return chunks;                                                   // 2752
    };                                                                 //
                                                                       //
    // Sends ACK N, expecting Nth blob chunk for message ID.           //
    Reliable.prototype._ack = function (id) {                          // 2756
      var ack = this._incoming[id].ack;                                // 2757
                                                                       //
      // if ack is the end value, then call _complete.                 //
      if (this._received[id] === ack[2]) {                             // 2760
        this._complete(id);                                            // 2761
        this._received[id] = true;                                     // 2762
      }                                                                //
                                                                       //
      this._handleSend(ack);                                           // 2765
    };                                                                 //
                                                                       //
    // Calculates the next ACK number, given chunks.                   //
    Reliable.prototype._calculateNextAck = function (id) {             // 2769
      var data = this._incoming[id];                                   // 2770
      var chunks = data.chunks;                                        // 2771
      for (var i = 0, ii = chunks.length; i < ii; i += 1) {            // 2772
        // This chunk is missing!!! Better ACK for it.                 //
        if (chunks[i] === undefined) {                                 // 2774
          data.ack[2] = i;                                             // 2775
          return;                                                      // 2776
        }                                                              //
      }                                                                //
      data.ack[2] = chunks.length;                                     // 2779
    };                                                                 //
                                                                       //
    // Sends the next window of chunks.                                //
    Reliable.prototype._sendWindowedChunks = function (id) {           // 2783
      util.log('sendWindowedChunks for: ', id);                        // 2784
      var data = this._outgoing[id];                                   // 2785
      var ch = data.chunks;                                            // 2786
      var chunks = [];                                                 // 2787
      var limit = Math.min(data.ack + this._window, ch.length);        // 2788
      for (var i = data.ack; i < limit; i += 1) {                      // 2789
        if (!ch[i].sent || i === data.ack) {                           // 2790
          ch[i].sent = true;                                           // 2791
          chunks.push(['chunk', id, i, ch[i].payload]);                // 2792
        }                                                              //
      }                                                                //
      if (data.ack + this._window >= ch.length) {                      // 2795
        chunks.push(['end', id, ch.length]);                           // 2796
      }                                                                //
      chunks._multiple = true;                                         // 2798
      this._handleSend(chunks);                                        // 2799
    };                                                                 //
                                                                       //
    // Puts together a message from chunks.                            //
    Reliable.prototype._complete = function (id) {                     // 2803
      util.log('Completed called for', id);                            // 2804
      var self = this;                                                 // 2805
      var chunks = this._incoming[id].chunks;                          // 2806
      var bl = new Blob(chunks);                                       // 2807
      util.blobToArrayBuffer(bl, function (ab) {                       // 2808
        self.onmessage(util.unpack(ab));                               // 2809
      });                                                              //
      delete this._incoming[id];                                       // 2811
    };                                                                 //
                                                                       //
    // Ups bandwidth limit on SDP. Meant to be called during offer/answer.
    Reliable.higherBandwidthSDP = function (sdp) {                     // 2815
      // AS stands for Application-Specific Maximum.                   //
      // Bandwidth number is in kilobits / sec.                        //
      // See RFC for more info: http://www.ietf.org/rfc/rfc2327.txt    //
                                                                       //
      // Chrome 31+ doesn't want us munging the SDP, so we'll let them have their
      // way.                                                          //
      var version = navigator.appVersion.match(/Chrome\/(.*?) /);      // 2822
      if (version) {                                                   // 2823
        version = parseInt(version[1].split('.').shift());             // 2824
        if (version < 31) {                                            // 2825
          var parts = sdp.split('b=AS:30');                            // 2826
          var replace = 'b=AS:102400'; // 100 Mbps                     // 2827
          if (parts.length > 1) {                                      // 2828
            return parts[0] + replace + parts[1];                      // 2829
          }                                                            //
        }                                                              //
      }                                                                //
                                                                       //
      return sdp;                                                      // 2834
    };                                                                 //
                                                                       //
    // Overwritten, typically.                                         //
    Reliable.prototype.onmessage = function (msg) {};                  // 2838
                                                                       //
    module.exports.Reliable = Reliable;                                // 2840
  }, { "./util": 13 }], 13: [function (require, module, exports) {     //
    var BinaryPack = require('js-binarypack');                         // 2843
                                                                       //
    var util = {                                                       // 2845
      debug: false,                                                    // 2846
                                                                       //
      inherits: function (ctor, superCtor) {                           // 2848
        ctor.super_ = superCtor;                                       // 2849
        ctor.prototype = Object.create(superCtor.prototype, {          // 2850
          constructor: {                                               // 2851
            value: ctor,                                               // 2852
            enumerable: false,                                         // 2853
            writable: true,                                            // 2854
            configurable: true                                         // 2855
          }                                                            //
        });                                                            //
      },                                                               //
      extend: function (dest, source) {                                // 2859
        for (var key in babelHelpers.sanitizeForInObject(source)) {    // 2860
          if (source.hasOwnProperty(key)) {                            // 2861
            dest[key] = source[key];                                   // 2862
          }                                                            //
        }                                                              //
        return dest;                                                   // 2865
      },                                                               //
      pack: BinaryPack.pack,                                           // 2867
      unpack: BinaryPack.unpack,                                       // 2868
                                                                       //
      log: function () {                                               // 2870
        if (util.debug) {                                              // 2871
          var copy = [];                                               // 2872
          for (var i = 0; i < arguments.length; i++) {                 // 2873
            copy[i] = arguments[i];                                    // 2874
          }                                                            //
          copy.unshift('Reliable: ');                                  // 2876
          console.log.apply(console, copy);                            // 2877
        }                                                              //
      },                                                               //
                                                                       //
      setZeroTimeout: (function (global) {                             // 2881
        var timeouts = [];                                             // 2882
        var messageName = 'zero-timeout-message';                      // 2883
                                                                       //
        // Like setTimeout, but only takes a function argument.  There's
        // no time argument (always zero) and no arguments (you have to
        // use a closure).                                             //
        function setZeroTimeoutPostMessage(fn) {                       // 2888
          timeouts.push(fn);                                           // 2889
          global.postMessage(messageName, '*');                        // 2890
        }                                                              //
                                                                       //
        function handleMessage(event) {                                // 2893
          if (event.source == global && event.data == messageName) {   // 2894
            if (event.stopPropagation) {                               // 2895
              event.stopPropagation();                                 // 2896
            }                                                          //
            if (timeouts.length) {                                     // 2898
              timeouts.shift()();                                      // 2899
            }                                                          //
          }                                                            //
        }                                                              //
        if (global.addEventListener) {                                 // 2903
          global.addEventListener('message', handleMessage, true);     // 2904
        } else if (global.attachEvent) {                               //
          global.attachEvent('onmessage', handleMessage);              // 2906
        }                                                              //
        return setZeroTimeoutPostMessage;                              // 2908
      })(this),                                                        //
                                                                       //
      blobToArrayBuffer: function (blob, cb) {                         // 2911
        var fr = new FileReader();                                     // 2912
        fr.onload = function (evt) {                                   // 2913
          cb(evt.target.result);                                       // 2914
        };                                                             //
        fr.readAsArrayBuffer(blob);                                    // 2916
      },                                                               //
      blobToBinaryString: function (blob, cb) {                        // 2918
        var fr = new FileReader();                                     // 2919
        fr.onload = function (evt) {                                   // 2920
          cb(evt.target.result);                                       // 2921
        };                                                             //
        fr.readAsBinaryString(blob);                                   // 2923
      },                                                               //
      binaryStringToArrayBuffer: function (binary) {                   // 2925
        var byteArray = new Uint8Array(binary.length);                 // 2926
        for (var i = 0; i < binary.length; i++) {                      // 2927
          byteArray[i] = binary.charCodeAt(i) & 0xff;                  // 2928
        }                                                              //
        return byteArray.buffer;                                       // 2930
      },                                                               //
      randomToken: function () {                                       // 2932
        return Math.random().toString(36).substr(2);                   // 2933
      }                                                                //
    };                                                                 //
                                                                       //
    module.exports = util;                                             // 2937
  }, { "js-binarypack": 10 }] }, {}, [3]);                             //
/////////////////////////////////////////////////////////////////////////

}).call(this);
