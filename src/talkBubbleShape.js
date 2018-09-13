import * as phina from 'phina.js';
import './canvasTalkBubble.js';

phina.namespace(function() {

  /**
   * @class phina.display.TalkBubbleShape
   * フキダシ型のシェイプクラス
   */
  // export phina.display.TalkBubbleShape = phina.createClass({
    // superClass: phina.display.Shape,
  phina.define('phina.display.TalkBubbleShape', {
    superClass: 'phina.display.Shape',

    init: function(options) {
      options = ({}).$safe(options, {
        width: 180, // フキダシのサイズ： 要素全体のサイズではない
        height: 150,
        backgroundColor: 'transparent',
        fill: 'white',
        stroke: 'black',
        strokeWidth: 4,

        tipDirection: 'right',
        tipBasePositionRatio: 0.5,
        tipBottomSize: 10,

        // radius: 32,
        cornerRadius: 12,
        tipDeviation: 0,
      });
      this.superInit(options);

      this.setBoundingType('rect');
      this.cornerRadius = options.cornerRadius;
      this.tipDirection = options.tipDirection;
      this.tipBasePositionRatio = options.tipBasePositionRatio;
      this.tipBottomSize = options.tipBottomSize || Math.min(options.width, options.height) * 0.15;

      this.tipProtrusion = options.tipProtrusion || this.tipBottomSize;
      this.tipDeviation = options.tipDeviation;

      this._fullWidth = options.width;
      this._fullHeight = options.height;
      this._resize();
    },

    // 先端に合わせてcanvasの再計算・リサイズ
    _resize: function() {
      // width or heightが変更された場合、フキダシもリサイズ
      var bw = this.bubbleWidth = (this._cachedWidth !== this.width) ? this.width : this.bubbleWidth;
      var bh = this.bubbleHeight = (this._cachedHeight !== this.height) ? this.height : this.bubbleHeight;

      var resizedWidth, resizedHeight, delta;
      if (this.tipDirection === 'top' || this.tipDirection === 'bottom') {
         // 上下の場合
        delta = Math.abs(this.tipDeviation) - bw/2;
        resizedWidth = Math.max(bw, bw + delta*2);
        resizedHeight = Math.max(bh, bh + this.tipProtrusion*2)
      } else {
        // 左右の場合
        delta = Math.abs(this.tipDeviation) - bh/2;
        resizedHeight = Math.max(bh, bh + delta*2);
        resizedWidth = Math.max(bw, bw + this.tipProtrusion*2)
      }

      this.setSize(resizedWidth, resizedHeight); // this.width, heightのセット
      this._cachedWidth = resizedWidth;
      this._cachedHeight = resizedHeight;

      // 強制的にcanvas再設定
      var canvas = this.canvas;
      var size = this.calcCanvasSize(); // padding + width(height)
      canvas.setSize(size.width, size.height);
      canvas.clearColor(this.backgroundColor);
      canvas.transformCenter();
      // console.log("canvas size", size);

      // 仮:先端描画領域・パディングを含めた全体サイズ
      this._fullWidth = size.width;
      this._fullHeight = size.height;
    },

    prerender: function(canvas) {
      this._resize();
      canvas.talkBubble(-this.bubbleWidth/2, -this.bubbleHeight/2, this.bubbleWidth, this.bubbleHeight, this.cornerRadius, this.tipDirection, this.tipBasePositionRatio, this.tipProtrusion, this.tipDeviation, this.tipBottomSize);
    },

    _defined: function() {
      phina.display.Shape.watchRenderProperties([
        'cornerRadius',
        'tipDirection',
        'tipBasePositionRatio',
        'tipBottomSize',
        'tipProtrusion',
        'tipDeviation',
      ]);
    },

    _accessor: {
      fullWidth: {
        "get": function() { return this._fullWidth; }
      },
      fullHeight: {
        "get": function() { return this._fullHeight; }
      },
    }
  });

});


phina.namespace(function() {

  /**
   * @class ThornedTalkBubble
   * 棘付きフキダシシェイプクラス
   */
  phina.define('phina.display.ThornedTalkBubbleShape', {
    superClass: 'phina.display.Shape',

    init: function(options) {
      options = ({}).$safe(options, {
        width: 320,
        height: 320,
        backgroundColor: 'transparent',
        fill: 'white',
        stroke: 'black',
        sideThornInterval: 15,
        sideThornSize: 30,
        verticalThornInterval: 20,
        verticalThornSize: 10,
        strokeWidth: 4,
        lineJoin: 'miter',
        miterLimit: 100.0,
      });
      this.superInit(options);

      this.setBoundingType('rect');
      this.sideThornInterval = options.sideThornInterval;
      this.sideThornSize = options.sideThornSize || options.sideThornInterval * 2;
      this.verticalThornInterval = options.verticalThornInterval;
      this.verticalThornSize = options.verticalThornSize || options.verticalThornInterval * 0.5;
      this.lineJoin = options.lineJoin;
      this.miterLimit = options.miterLimit;
    },

    // lineJoinを設定するため、renderを直接書き換え
    render: function(canvas) {
      var context = canvas.context;
      // リサイズ
      var size = this.calcCanvasSize();
      canvas.setSize(size.width, size.height);
      // クリアカラー
      canvas.clearColor(this.backgroundColor);
      // 中心に座標を移動
      canvas.transformCenter();

      // 吹き出し内サイズをキャッシュ
      this.bubbleWidth = this.width - this.sideThornSize*2;
      this.bubbleHeight = this.height - this.verticalThornSize*2;

      canvas.thornedTalkBubble(-this.width/2, -this.height/2, this.width, this.height, this.verticalThornInterval, this.sideThornInterval, this.verticalThornSize, this.sideThornSize);

      // ストローク描画
      if (this.isStrokable()) {
        context.strokeStyle = this.stroke;
        context.lineWidth = this.strokeWidth;
        context.lineJoin = this.lineJoin;
        context.miterLimit = this.miterLimit;
        context.shadowBlur = 0;
        this.renderStroke(canvas);
      }

      // 塗りつぶし描画
      if (this.fill) {
        context.fillStyle = this.fill;

        // shadow の on/off
        if (this.shadow) {
          context.shadowColor = this.shadow;
          context.shadowBlur = this.shadowBlur;
        }
        else {
          context.shadowBlur = 0;
        }

        this.renderFill(canvas);
      }

      return this;
    },

    _defined: function() {
      phina.display.Shape.watchRenderProperties([
        'verticalThornInterval',
        'verticalThornSize',
        'sideThornSize',
        'sideThornInterval',
        'lineJoin',
        'miterLimit',
      ]);
    },

  });

});


/**
 * ui.TalkBubbleLabel用のShape拡張
 * prototype拡張ではなくstaticな専用シングルトンクラスを用意する？
 *
 */
phina.namespace(function() {

  phina.display.Shape.prototype._getLines = function() {
    return (this.label) ? (this.label.text + '').split('\n') : [];
  },
  phina.display.Shape.prototype._getLabelWidth = function() {
    var lines = (this._lines) ? this._lines : this._getLines();

    var width = 0;
    var canvas = this.canvas;
    canvas.context.font = this.label.font;
    lines.each(function(line, i) {
      var w = canvas.context.measureText(line).width;
      width = Math.max(width, w);
    });

    return width;
  },
  phina.display.Shape.prototype._getLabelHeight = function() {
    var lines = (this._lines) ? this._lines : this._getLines();

    var height = this.label.fontSize * lines.length;
    // if (this.baseline !== 'middle') height*=2;
    height *= this.label.lineHeight;

    return height;
  };
  phina.display.Shape.prototype.adjustToLabelWidth = function() {
    this.width = this._getLabelWidth() + this.padding*2;
    return this;
  };
  phina.display.Shape.prototype.adjustToLabelHeight = function() {
    this.height = this._getLabelHeight() + this.padding*2;
    return this;
  };
  phina.display.Shape.prototype.adjustToLabelSize = function() {
    this.adjustToLabelWidth().adjustToLabelHeight();
    return this;
  };

});


phina.namespace(function() {

  /**
   * @class phina.ui.TalkBubbleLabel(Area)
   * セリフ入りフキダシを描画するクラス
   */
  phina.define('phina.ui.TalkBubbleLabel', {
    superClass: 'phina.display.TalkBubbleShape',

    init: function(options) {
      options = ({}).$safe(options, {
        text: "Hello World!",
        bubbleFill: 'white',
        bubbleStroke: 'black',
        textFill: 'black',
        textStroke: 'transparent',
        fontSize: 24,
        textPadding: 6,
        fit: true,
      });

      var labelOptions = ({}).$extend(options, {
        backgroundColor: 'transparent',
        padding: 0,
        fill: options.textFill,
        stroke: options.textStroke,
      });
      var la = this.label = phina.ui.LabelArea(labelOptions);

      // フキダシ用オプション
      var bubbleOptions = ({}).$extend(options, {
        width: la.width,
        height: la.height,
        fill: options.bubbleFill,
        stroke: options.bubbleStroke
      });
      this.superInit(bubbleOptions);

      this.addChild(la);
      this.text = options.text;
      this.textPadding = options.textPadding;

      if (options.fit) {
        this.fitWhenChanged = true;
        this.adjustToLabelSize();
      }

      // ラベル位置・サイズをフキダシと同期させる（もっと良い方法あるかも？）
      var dirtySync = this._dirtySync = true; // 初回実行用
      this.on('enterframe', function() {
        if (dirtySync) {
          var size = this.calcCanvasSize();
          la.setPosition(size.width*(0.5 - this.originX), size.height*(0.5 - this.originY));
          la.setSize(this.bubbleWidth - this.textPadding*2, this.bubbleHeight - this.textPadding*2);
          dirtySync = false;
          // console.log('synced')
        }
      });

      // 値の監視
      // origin, bubbleWidth（width）, textPaddingが変更されたら位置同期フラグ立てる
      var callback = function(newVal, oldVal) {
        if (newVal !== oldVal) dirtySync = true;
      };
      [
        'bubbleWidth',
        'bubbleHeight',
        'textPadding',
      ].forEach(function(key) {
        this.$watch(key, callback);
      }, this);

      // origin.x, yの監視
      ['x', 'y'].forEach(function(key) {
        this.origin.$watch(key, callback.bind(this));
      }, this);
    },

    _accessor: {
      text: {
        get: function() {
          return this.label.text;
        },
        set: function(v) {
          this.label.text = v;
          this._lines = (this.label.text + '').split('\n');
          if (this.fitWhenChanged) this.adjustToLabelSize();
        }
      },
    },

  });

});


phina.namespace(function() {

  /**
   * @class ThornedTalkBubbleLabel
   * 棘付きフキダシのラベルクラス
   */
  phina.define('phina.ui.ThornedTalkBubbleLabel', {
    superClass: 'phina.display.ThornedTalkBubbleShape',

    init: function(options) {
      options = ({}).$safe(options, {
        text: "Hello World!",
        width: 230,
        height: 180,
        bubbleFill: 'white',
        bubbleStroke: 'black',
        textFill: 'black',
        textStroke: 'transparent',
        fontSize: 24,
        textPadding: 16,
        fit: true,
      });

      var bubbleOptions = ({}).$extend(options, {
        fill: options.bubbleFill,
        stroke: options.bubbleStroke
      });
      this.superInit(bubbleOptions);

      var labelOptions = ({}).$extend(options, {
        backgroundColor: 'transparent',
        padding: 0,
        fill: options.textFill,
        stroke: options.textStroke,
      });
      var la = this.label = phina.ui.LabelArea(labelOptions).addChildTo(this);
      this.textPadding = options.textPadding;

      if (options.fit) {
        this.fitWhenChanged = true;
        this.adjustToLabelSize();
      }

      // ラベル位置・サイズをフキダシと同期させる
      var _dirtySync = true; //初回実行用
      this.on('enterframe', function() {
        if (_dirtySync) {
          // console.log('sycd',_dirtySync)
          var size = this.calcCanvasSize();
          var tp2 = this.textPadding * 2;
          // var bubbleWidth = this.width - this.sideThornSize*2;
          // var bubbleHeight = this.height - this.verticalThornSize*2;
          la.setPosition(size.width*(0.5 - this.originX), size.height*(0.5 - this.originY));
          la.setSize(this.bubbleWidth - tp2, this.bubbleHeight - tp2);
          _dirtySync = false;
        }
      });

      // 値の監視:変更されたら位置同期フラグ立てる
      var callback = function(newVal, oldVal) {
        if (newVal !== oldVal) _dirtySync = true;
      };
      [
        'bubbleWidth',
        'bubbleHeight',
        'textPadding',
      ].forEach(function(key) {
        this.$watch(key, callback);
      }, this);

      // origin.x, yの監視
      ['x', 'y'].forEach(function(key) {
        this.origin.$watch(key, callback.bind(this));
      }, this);

    },

    adjustToLabelWidth: function() {
      // this.width = width + this.padding*2;
      this.width = this._getLabelWidth() + this.textPadding*2 + this.sideThornSize*2;
      return this;
    },

    adjustToLabelHeight: function() {
      // this.height = height*this.label.lineHeight + this.padding*2;
      this.height = this._getLabelHeight() + this.textPadding*2 + this.verticalThornSize*2;
      return this;
    },

    _accessor: {
      text: {
        get: function() {
          return this.label.text;
        },
        set: function(v) {
          this.label.text = v;
          if (this.fitWhenChanged) this.adjustToLabelSize();
        }
      },
    },

  });

});

export {phina};