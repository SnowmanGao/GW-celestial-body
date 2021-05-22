/** @type {HTMLCanvasElement} */


/*****************时序与定义**********************/

//定义01

var canvas = document.getElementById('_canvas');
var ctx = canvas.getContext('2d');
ctx.strokeStyle = 'black';
var hosX = canvas.width / 2
var hosY = canvas.height / 2;
var zoomIndex = 1;
var offsetX = 0;
var offsetY = 0;
/**是否正在运行（开始会自动切换，所以相反！）*/
var isRunning = true;
/**主时序器*/
var clocker;
var clockTime;
var ultraClockNum;
/**设定偏移量*/
var offsetUser = [0, 0];
/*dat_gui* */
var gui;
/**始终居中 */
var centerForever;

//定义02
/**引力常数  0.5*/
var G;
/**时间步长 0.05*/
var delta_t;
/**可调节参数对象组 */
var options;
var star1 = new Star(1, [100, -100], 12, 100, [-15, 0]);
var star2 = new Star(2, [-100, -200], 20, 150, [-2, 0]);
var star3 = new Star(3, [-300, 350], 17, 125, [4, 5]);
/**stars集合可能有空元素！ */
var stars = [star1, star2, star3];
// var MODS = [{}, {}, {}, {}, {}];

/*****************逻辑与设置**********************/

/**切换运行状态 */
function tabRunning() {
    if (isRunning) {
        clearInterval(clocker);
    } else {
        clocker = setInterval(main, clockTime);
    }
    isRunning = !isRunning;
}



/*****************dat.js 用户界面********************/

var Options = function () {
    this.message = '未来生物研究所™ 出品';
    this.引力常数G = 0.5;
    this.时间步长 = 0.05;
    this.刷新周期 = 1;
    this.永远居中 = false;
    this.如果一切能重来 = function () {
        window.location.reload()
    };
    this.创建新天体 = createNewStar;
    this.保存展开状态 = function () {
        gui.saveToLocalStorageIfPossible()
    }
    this.超频 = function () {
        if (confirm('警告：\n超频为不可逆操作，一旦开始就TM停不下来！\n（超频好像还能叠加的，小心显卡烧糊哟~）')) {
            setInterval(main, clockTime);
        }
    }
};

function initGUI() {
    options = new Options();
    gui = new dat.GUI();

    let f1 = gui.addFolder("大局观");
    f1.add(options, 'message');
    f1.add(options, '引力常数G', -5, 10);
    f1.add(options, '时间步长', 0.01, 0.1);
    f1.add(options, '刷新周期', 0, 200);
    f1.add(options, '永远居中');

    let f2 = gui.addFolder("神经病");
    f2.add(options, '超频')
    f2.add(options, '保存展开状态')
    f2.add(options, '如果一切能重来');
    //如果人生若只如初见的话，系统就不会走向混沌吧.
    //但是"混沌"有时也不失为一种美.

    let f3 = gui.addFolder('对象');
    f3.add(options, '创建新天体');


}

function updateOptions() {
    G = options.引力常数G;
    delta_t = options.时间步长;
    if (options.永远居中) {
        zoom('center')
    }
    ultraClockNum = options.超频;
    if (clockTime != options.刷新周期) {
        clockTime = options.刷新周期;
        clearInterval(clocker);
        clocker = setInterval(main, clockTime);
    }

}

/******************外部与模组*******************/




/*****************主程序*********************/

/*统计 */
stat = Stats();
stat.domElement.style.position = 'absolute';
stat.domElement.style.right = '0px';
stat.domElement.style.top = '0px';
stat.domElement.style.right = null;
document.body.appendChild(stat.domElement);

initGUI();
updateOptions();
tabRunning();
flipAll();


/**主循环*/
function main() {
    stat.begin();

    stars.forEach(star => {
        let acc = [0, 0];

        stars.forEach(objStar => {
            if (objStar.id != star.id) {
                //计算万有引力的加速度
                acc = vecSum(acc, vecZoom(getGravity(star, objStar), 1 / star.mass));
                //合并星星遍历时必须先排除自己！
                if (vecMold(vecMinus(star.pos, objStar.pos)) < (star.radius + objStar.radius)) {

                    stars = stars.filter((starF) => {
                        return starF.id != star.id && starF.id != objStar.id;
                    });
                    let newStar = getBump(star, objStar)
                    stars.push(newStar);
                    console.log("碰撞发生了，生成了天体：", newStar);
                }
            }

        });

        // MOD
        // for (let i = 0; i < 5; i++) {
        //     try {
        //         acc = vecSum(acc, MODS[i].AttachAcc(star) || 0);
        //     } catch (error) {
        //     }
        // }

        //微分迭代
        star.vel = vecSum(star.vel, vecZoom(acc, delta_t));
        star.pos = vecSum(star.pos, vecZoom(star.vel, delta_t));
    });
    updateOptions();

    flipAll();
    stat.end();
}