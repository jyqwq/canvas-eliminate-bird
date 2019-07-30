(function () {
    //游戏类
    var Game = window.Game = Class.extend({
        //构造函数
        init : function (id,r) {
            var self = this;
            self.canvas = document.getElementById(id);
            self.ctx = this.canvas.getContext('2d');
            var selfW = document.documentElement.clientWidth;
            var selfH = document.documentElement.clientHeight;
            if (selfW>414) {
                selfW = 414
            } else if (selfW<320) {
                selfW = 320
            }
            if (selfH>736) {
                selfH = 736
            } else if (selfH<500) {
                selfH = 500
            }
            self.canvas.width = selfW;
            self.canvas.height = selfH;
            //R文件路径
            self.RtextURL = r;
            //自己的资源对象
            self.Robj = null;
            //自己的图片资源对象，v是图片对象
            self.R = {};
            //自己的音乐资源对象，v是音乐对象
            self.M = {};
            //回调对象
            self.callBacks = {};
            //种类个数
            self.typeNum = 6;
            //每个单位的边长
            self.basex = (self.canvas.width-12)/7;
            //每个单位的基础定位
            self.basey = self.canvas.height-self.basex*7-100;
            //连消combo
            self.combo = 1;
            self.lastEliminate = 0;
            //分数
            self.score = 0;
            //帧编号
            self.f = 0;
            //游戏刷新频率
            self.fps = 20;
            //加载游戏
            self.loadResouce(function () {
                //开始游戏
                self.start();
                //绑定监听
                self.bindEvent();
            });
        },
        loadResouce : function (callback) {
            var self = this;
            var count = 0;
            self.ctx.textAlign = "center";
            self.ctx.font = "20px 微软雅黑";
            self.ctx.fillText("正在加载...",self.canvas.width/2,self.canvas.height*(1-0.618));
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 304)) {
                    self.Robj = JSON.parse(xhr.responseText);
                    var resouceNum = Object.keys(self.Robj.images).length;
                    for (var k=0;k<self.Robj.images.length;k++) {
                        self.R[self.Robj.images[k].name] = new Image();
                        self.R[self.Robj.images[k].name].src = self.Robj.images[k].url;
                        self.R[self.Robj.images[k].name].onload = function () {
                            count++;
                            self.ctx.clearRect(0,0,self.canvas.width,self.canvas.height);
                            self.ctx.textAlign = "center";
                            self.ctx.font = "20px 微软雅黑";
                            self.ctx.fillText("正在加载"+count+"/"+resouceNum,self.canvas.width/2,self.canvas.height*(1-0.618));
                            if (count === resouceNum) {
                                callback.call(self)
                            }
                        }
                    }
                    for (var m=0;m<self.Robj.music.length;m++) {
                        self.M[self.Robj.music[m].name] = document.createElement("audio");
                        self.M[self.Robj.music[m].name].src = self.Robj.music[m].url;
                    }
                }
            };

            xhr.open("get",self.RtextURL,true);
            xhr.send(null);
        },
        start : function () {
            var self = this;
            self.map = new Maps();
            self.M['playbgm'].loop = 'loop';
            self.M['playbgm'].play();
            self.fsm = "B";

            setInterval(function () {
                //清屏
                self.ctx.clearRect(0,0,self.canvas.width,self.canvas.height);

                //设置帧编号
                self.f++;

                //背景
                self.ctx.drawImage(self.R['bg_night'],0,0,self.canvas.width,self.canvas.height);
                self.ctx.drawImage(self.R['logo'],self.canvas.width/2-89,50);
                //更新渲染
                self.map.render();

                //检查回调
                if (self.callBacks.hasOwnProperty(self.f.toString())) {
                    self.callBacks[self.f.toString()]();
                    delete self.callBacks[self.f.toString()];
                }

                //有限状态机
                switch (self.fsm) {
                    case "A":
                        self.fsm = "A";
                        break;
                    case "B":
                        if (game.map.check().length!==0) {
                            self.fsm = "C";
                        }else {
                            self.fsm = "A";
                        }
                        break;
                    case "C":
                        self.map.eliminate(function () {
                            self.map.dropDown(function () {
                                self.map.supply(function () {
                                    self.fsm = "B"
                                })
                            })
                        });
                        self.fsm = "动画状态";
                        break;
                }

                //打印分数
                let sl = game.score.toString().length;
                for (let j = 0; j < sl; j++) {
                    game.ctx.drawImage(game.R['fenshu'+game.score.toString().charAt(j)],game.canvas.width/2-sl/2*34+34*j,120)
                }
                //输出帧编号
                self.ctx.textAlign = 'left';
                self.ctx.font = '10px consolas';
                self.ctx.fillText('FNO '+self.f,20,20);
                self.ctx.fillText('FSM '+self.fsm,20,40);
                self.ctx.fillText('COMBO '+self.combo,20,60);
            },self.fps);
        },
        callBack :function (timeLater,fn) {
            this.callBacks[this.f+timeLater] = fn;
        },
        bindEvent :function () {
            var self = this;
            self.canvas.onmousedown = function (e) {
                if (self.fsm !== "A") return;
                let x =e.offsetX;
                let y =e.offsetY;
                let startCol = (x-6)/self.basex;
                let startRow = (y-self.basey)/self.basex;
                if (startCol<0) {
                    startCol =-1;
                }else {
                    startCol = parseInt(startCol)
                }
                if (startRow<0) {
                    startRow =-1;
                }else {
                    startRow = parseInt(startRow)
                }
                if (startCol<0 || startCol>6 || startRow<0 || startRow>6) return;
                self.canvas.onmousemove = function (e) {
                    let x =e.offsetX;
                    let y =e.offsetY;
                    let targetCol = (x-6)/self.basex;
                    let targetRow = (y-self.basey)/self.basex;
                    if (targetCol<0) {
                        targetCol =-1;
                    }else {
                        targetCol = parseInt(targetCol)
                    }
                    if (targetRow<0) {
                        targetRow =-1;
                    }else {
                        targetRow = parseInt(targetRow)
                    }
                    if (targetCol<0 || targetCol>6 || targetRow<0 || targetRow>6) {
                        self.canvas.onmousemove = null;
                        return;
                    }
                    if ((startRow ===targetRow && Math.abs(targetCol - startCol)===1) || (startCol ===targetCol && Math.abs(targetRow - startRow)===1)) {
                        self.map.exchange(startRow,startCol,targetRow,targetCol);
                        self.canvas.onmousemove = null;
                    }
                };
                self.canvas.onmouseup = function () {
                    self.canvas.onmousemove = null;
                }
            }
        }
    })
})();