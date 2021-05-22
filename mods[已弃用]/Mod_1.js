MODS[1].AttachAcc = function (star) {
    //计算洛伦兹力
    return vecZoom(vecRotate(star.vel, deg90), 0.8);
}