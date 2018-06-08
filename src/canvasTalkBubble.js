import * as phina from 'phina.js';

phina.namespace(function() {

  /**
   * フキダシ描画
   */
  phina.graphics.Canvas.prototype.talkBubble = function(x, y, width, height, radius, tipDirection, tipBasePositionRatio, tipProtrusion, tipDeviation, tipBottomSize) {
    var c = this.context;
    var pi = Math.PI;
    var hPi = 0.5 * Math.PI;

    var l = x;
    var t = y;
    var dx = x + width;
    var dy = y + height;
    var cx = x + width * 0.5;
    var cy = y + height * 0.5;
    var rad = radius;
    var tipPosRatio = tipBasePositionRatio;
    tipDirection = tipDirection || "right";

    var tipCenter = (tipDirection === "right" || tipDirection === "left")
      ? t + (height * tipPosRatio) // y軸上
      : l + (width * tipPosRatio); // x軸上
    var tSizeHalf = tipBottomSize * 0.5;
    tipProtrusion = tipProtrusion || tipBottomSize;
    var tipX, tipY;

    switch (tipDirection) {
      case "right":
        tipX = dx + tipProtrusion;
        // tipY = tipCenter + tipDeviation;
        tipY = cy + tipDeviation;

        c.arc(l+rad, t+rad, rad, -pi, -hPi, false); // 左上
        c.arc(dx-rad, t+rad, rad, -hPi, 0, false); // 右上
        c.lineTo(dx, tipCenter-tSizeHalf);
        c.lineTo(tipX, tipY);
        c.lineTo(dx, tipCenter + tSizeHalf);
        c.arc(dx-rad, dy-rad, rad, 0, hPi, false); // 右下
        c.arc(l+rad, dy-rad, rad, hPi, pi, false); // 左下
        break;

      case "left":
        tipX = l - tipProtrusion;
        // tipY = tipCenter + tipDeviation;
        tipY = cy + tipDeviation;

        c.arc(l+rad, t+rad, rad, -pi, -hPi, false); // 左上
        c.arc(dx-rad, t+rad, rad, -hPi, 0, false); // 右上
        c.arc(dx-rad, dy-rad, rad, 0, hPi, false); // 右下
        c.arc(l+rad, dy-rad, rad, hPi, pi, false); // 左下
        c.lineTo(l, tipCenter+tSizeHalf);
        c.lineTo(tipX, tipY);
        c.lineTo(l, tipCenter-tSizeHalf);
        break;

      case "bottom":
        // tipX = tipCenter + tipDeviation;
        tipX = cx + tipDeviation;
        tipY = dy + tipProtrusion;

        c.arc(l+rad, t+rad, rad, -pi, -hPi, false); // 左上
        c.arc(dx-rad, t+rad, rad, -hPi, 0, false); // 右上
        c.arc(dx-rad, dy-rad, rad, 0, hPi, false); // 右下
        c.lineTo(tipCenter+tSizeHalf, dy);
        c.lineTo(tipX, tipY);
        c.lineTo(tipCenter-tSizeHalf, dy);
        c.arc(l+rad, dy-rad, rad, hPi, pi, false); // 左下
        break;

      // case "top":
      default:
        // tipX = tipCenter + tipDeviation;
        tipX = cx + tipDeviation;
        tipY = t - tipProtrusion;

        c.arc(l+rad, t+rad, rad, -pi, -hPi, false); // 左上
        c.lineTo(tipCenter-tSizeHalf, t);
        c.lineTo(tipX, tipY);
        c.lineTo(tipCenter+tSizeHalf, t);
        c.arc(dx-rad, t+rad, rad, -hPi, 0, false); // 右上
        c.arc(dx-rad, dy-rad, rad, 0, hPi, false); // 右下
        c.arc(l+rad, dy-rad, rad, hPi, pi, false); // 左下
        break;
    }

    c.closePath();

    return this;
  };
  phina.graphics.Canvas.prototype.fillTalkBubble = function(x, y, width, height, radius, tipDirection, tipBasePositionRatio, tipProtrusion, tipDeviation, tipBottomSize) {
    return this.beginPath().talkBubble(x, y, width, height, radius, tipDirection, tipBasePositionRatio, tipProtrusion, tipDeviation, tipBottomSize).fill();
  }
  phina.graphics.Canvas.prototype.strokeTalkBubble = function(x, y, width, height, radius, tipDirection, tipBasePositionRatio, tipProtrusion, tipDeviation, tipBottomSize) {
    return this.beginPath().talkBubble(x, y, width, height, radius, tipDirection, tipBasePositionRatio, tipProtrusion, tipDeviation, tipBottomSize).stroke();
  }

});


phina.namespace(function() {

  /**
   * トゲ付きフキダシ描画
   */
  phina.graphics.Canvas.prototype.thornedTalkBubble = function(x, y, width, height, verticalThornInterval, sideThornInterval, verticalThornSize, sideThornSize) {
    var c = this.context;

    // 上下面
    var vertThornInterval = verticalThornInterval;
    var vertThornHeight = verticalThornSize || verticalThornInterval　* 0.5;

    // 側面
    var sideThornWidth = sideThornSize || sideThornInterval * 2;
    var cps = [];
    var cpsRev = [];

    // 角用の設定
    var cornerGapX = sideThornWidth * 0.6;
    var cornerGapY = vertThornHeight * 1.6;

    // サイズ調整用
    var sideThornMax = Math.max(sideThornWidth, cornerGapX);
    var vertThornMax = Math.max(vertThornHeight, cornerGapY);

    var bubbleWidth = width - sideThornMax*2;
    var bubbleHeight = height - vertThornMax*2;
    var thornNum = (bubbleWidth / vertThornInterval) | 0;
    var cpNum = (bubbleHeight / sideThornInterval) | 0;
    var l = x + sideThornMax;
    var r = x + width - sideThornMax;
    var t = y + vertThornMax;
    var b = y + height - vertThornMax;

    // 制御点
    for (var i = 0; i < cpNum; i++) {
      cps.push({x: r, y: t + sideThornInterval*( i + 0.5) }); // 右側用
      cpsRev.push({x: l, y: b - sideThornInterval*(i + 0.5) });
    }

    c.beginPath();

    // 上辺
    c.moveTo(l, t);
    for (var i = 0; i < thornNum; i++) {
      var sx = l + i * vertThornInterval;
      c.lineTo(sx+vertThornInterval*0.25, t);
      c.lineTo(sx+vertThornInterval*0.25*2, t-vertThornHeight);
      c.lineTo(sx+vertThornInterval*0.25*3, t);
      if (i !== thornNum-1) c.lineTo(sx+vertThornInterval, t);
    }

    // 右辺
    c.quadraticCurveTo(r, t, r+cornerGapX, t-cornerGapY); //上
    for (var i = 0, len=cps.length; i < len; i++) {
      // 二段目以降
      if (i%2 === 0) {
        c.quadraticCurveTo(cps[i].x, cps[i].y, r+sideThornWidth*0.8, t+(i+1)*sideThornInterval);
      } else {
       c.quadraticCurveTo(cps[i].x, cps[i].y, r+sideThornWidth, t+(i+1)*sideThornInterval); // 二段目以降
      }
    }
    c.quadraticCurveTo(r, b, r+cornerGapX, b+cornerGapY); //下

    // 下辺
    for (i = thornNum-1; 0 <= i; i--) {
      var sx = l + i * vertThornInterval;
      c.lineTo(sx+vertThornInterval*0.25*3, b);
      c.lineTo(sx+vertThornInterval*0.25*2, b+vertThornHeight);
      c.lineTo(sx+vertThornInterval*0.25, b);
    }

    // 左辺
    c.quadraticCurveTo(l, b, l-cornerGapX, b+cornerGapY); //下
    // 二段目以降
    for (i = 0, len=cpsRev.length; i < len; i++) {
      if (i%2 === 0) {
        c.quadraticCurveTo(cpsRev[i].x, cpsRev[i].y, l-sideThornWidth*0.8, b-(i+1)*sideThornInterval);
      } else {
        c.quadraticCurveTo(cpsRev[i].x, cpsRev[i].y, l-sideThornWidth, b-(i+1)*sideThornInterval);
      }
    }
    c.quadraticCurveTo(l, t, l-cornerGapX, t-cornerGapY); //左上

    c.closePath();

    return this;
  };
  phina.graphics.Canvas.prototype.fillThornedTalkBubble = function(params) {
    return this.beginPath().thornedTalkBubble(x, y, width, height).fill();
  };
  phina.graphics.Canvas.prototype.strokeThornedTalkBubble = function(params) {
    return this.beginPath().thornedTalkBubble(x, y, width, height).stroke();
  };

});

export {phina};