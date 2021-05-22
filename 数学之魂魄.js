/** @type {HTMLCanvasElement} */
/*****************数学与工具函数**********************/

/**圆周率 */
const pi = Math.PI;
/**常用角度 */
// const deg180 = pi;
const deg90 = pi/2;
// const deg60 = pi/3;
// const deg45 = pi/4;
// const deg30 = pi/6;
// const deg15 = pi/12;

// 一定要有返回值！！
/**生成随机颜色*/
function getRandomColor() {
    var arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
    var color = "#";
    for (let i = 0; i < 6; i++) {
        let random = parseInt(Math.random() * 16);
        color += arr[random];
    }
    return color;
}

/**向量和*/
function vecSum(v1, v2) {
    return [v1[0] + v2[0], v1[1] + v2[1]];
}

/**向量差*/
function vecMinus(v1, v2) {
    return [v1[0] - v2[0], v1[1] - v2[1]];
}

/**向量模长*/
function vecMold(vec) {

    return Math.hypot(vec[0], vec[1]);
}

/**向量数乘（数字必须放后面！）*/
function vecZoom(vec, num) {
    if (isNaN(vec[0]) || isNaN(vec[1])) {
        console.error("向量数乘错误!", vec, " 乘以 ", num)
        return [0, 0];
    }
    return [num * vec[0], num * vec[1]];
}

/**向量与x轴夹角（弧度！）*/
function vecAngle(vec) {
    return Math.atan(vec[1] / vec[0]);
}

/**向量顺时针旋转角度（角度为弧度制，放后面！） */
function vecRotate(vec,angle) {
    let tempVec = [0, 0];
    tempVec[0] = vec[0] * Math.cos(angle) - vec[1] * Math.sin(angle);
    tempVec[1] = vec[0] * Math.sin(angle) + vec[1] * Math.cos(angle);
    return tempVec;
}

/**计算两点间的距离*/
function getDistance(v1, v2) {
    return vecMold(vecMinus(v1, v2));
}

/**计算质心位矢*/
function getMassCenter(starArr) {
    let vector = [0, 0];
    let sumMass = 0;
    starArr.forEach(star => {
        if (star != null) {
            vector = vecSum(vector, vecZoom(star.pos, star.mass));
            sumMass += star.mass;
        }
    });
    return vecZoom(vector, 1 / sumMass);
}

/**计算万有引力 （力作用在s1上）*/
function getGravity(s1, s2) {
    let dis = getDistance(s1.pos, s2.pos);
    return vecZoom(vecZoom(vecMinus(s2.pos, s1.pos), 1 / dis), G * s1.mass * s2.mass / dis);
    //返回矢量！
}

/**获得两个完全非弹性碰撞后融合天体*/
function getBump(s1, s2) {
    let newstar = new Star(
        s1.id,
        getMassCenter([s1, s2]),
        Math.pow(s1.radius ** 3 + s2.radius ** 3, 1 / 3),
        s1.mass + s2.mass,
        [(s1.vel[0] * s1.mass + s2.vel[0] * s2.mass) / (s1.mass + s2.mass),
            (s1.vel[1] * s1.mass + s2.vel[1] * s2.mass) / (s1.mass + s2.mass)
        ]
    );
    return newstar;
}

/**从中心坐标系变换到canvas渲染坐标系*/
function transform(pos) {
    return vecSum(vecZoom(pos, zoomIndex), vecSum([hosX, hosY], offsetUser));
}


function zoom(type) {
    offsetStep = parseInt(document.getElementById('offsetStep').value);
    switch (type) {
        case 'out':
            zoomIndex *= 0.8;
            break;
        case 'in':
            zoomIndex *= 1.2;
            break;
        case 'center':
            let center = getMassCenter(stars);
            stars.forEach(star => {
                star.pos = vecMinus(star.pos, center)
            })
            break;
        case 'left':
            offsetUser = vecSum(offsetUser, [offsetStep, 0])
            break;
        case 'right':
            offsetUser = vecSum(offsetUser, [-offsetStep, 0])
            break;
        case 'up':
            offsetUser = vecSum(offsetUser, [0, offsetStep])
            break;
        case 'down':
            offsetUser = vecSum(offsetUser, [0, -offsetStep])
            break;
        default:
            console.error("错误的zoom type！");
            break;
    }
    flipAll();
}


/*****************底层对象**********************/

/**球类天体*/
function Star(id, pos, radius, mass, vel) {
    this.id = id || 0;
    this.pos = [0, 0];
    this.pos[0] = pos[0] || 0;
    this.pos[1] = pos[1] || 0;
    this.radius = radius || 100;
    this.mass = mass || 10;
    this.vel = [0, 0];
    this.vel[0] = vel[0] || 0;
    this.vel[1] = vel[1] || 0;

    this.color = getRandomColor();
    this.render = function () {
        //渲染方法
        ctx.beginPath();
        tpos = transform(this.pos)
        ctx.arc(tpos[0], tpos[1], this.radius * zoomIndex, 0, 7, false);
        ctx.fillStyle = this.color;
        ctx.fill();

    }
}

/**引导用户创建一个新天体 */
function createNewStar() {
    let tempStar = new Star(1, [100, -100], 10, 100, [0, 0]);
    let tempID = 0;
    let idPool = [];
    stars.forEach(star => {
        idPool[star.id] = true;
    });
    for (let i = 0; i < idPool.length + 1; i++) {
        if (idPool[i] == undefined) {
            tempID = i;
        }
    }
    tempStar.id = tempID;
    tempStar.mass = parseInt(prompt("输入天体质量")) || 150;
    tempStar.radius = parseInt(prompt("输入天体半径")) || 10;
    tempStar.pos[0] = parseInt(prompt("输入天体位置 x分量")) || 0;
    tempStar.pos[1] = parseInt(prompt("输入天体位置 y分量")) || 0;
    tempStar.vel[0] = parseInt(prompt("输入天体速度 x分量")) || 0;
    tempStar.vel[1] = parseInt(prompt("输入天体速度 y分量")) || 0;
    console.log("创建新天体！", tempStar);
    stars.push(tempStar)
    flipAll();
};


/**渲染*/
function flipAll() {
    ctx.fillStyle = "#F1F3F4";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //球渲染
    for (let i = 0; i < stars.length; i++) {
        stars[i].render();
    }
    //渲染质心
    ctx.fillStyle = "red";
    let temp = transform(getMassCenter(stars));
    ctx.fillRect(temp[0], temp[1], 3, 3);

    // stars.forEach(star => {
    //     ctx.beginPath();
    //     ctx.moveTo(star.pos[0], star.pos[1]);
    //     ctx.lineTo(star.vel[0], star.vel[1]);
    //     ctx.strokeStyle = "#058"
    //     ctx.stroke();
    //     ctx.closePath();
    // });

}