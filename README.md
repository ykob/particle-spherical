# demo-particle-moving-spherical

球状に移動するパーティクル。

http://ykob.github.io/demo-particle-moving-spherical/

球座標計算は以下。

    x = Math.cos(rad) * Math.cos(rad2) * r;
    y = Math.cos(rad) * Math.sin(rad2) * r;
    z = Math.sin(rad) * r;
