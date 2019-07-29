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
            //自己的图片资源对象，v是图片路径
            self.Robj = null;
            //自己的图片资源对象，v是图片对象
            self.R = {};
            self.callBacks = {};
            //种类个数
            self.typeNum = 3;
            //帧编号
            self.f = 0;
            //游戏刷新频率
            self.fps = 20;
            self.loadResouce(function () {
                //开始游戏
                self.start();
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
                    var imgNum = Object.keys(self.Robj).length;
                    for (var k in self.Robj) {
                        self.R[k] = new Image();
                        self.R[k].src = self.Robj[k];
                        self.R[k].onload = function () {
                            count++;
                            self.ctx.clearRect(0,0,self.canvas.width,self.canvas.height);
                            self.ctx.textAlign = "center";
                            self.ctx.font = "20px 微软雅黑";
                            self.ctx.fillText("正在加载"+count+"/"+imgNum,self.canvas.width/2,self.canvas.height*(1-0.618));
                            if (count === imgNum) {
                                callback.call(self)
                            }
                        }
                    }
                }
            };

            xhr.open("get",self.RtextURL,true);
            xhr.send(null);
        },
        start : function () {
            var self = this;
            self.map = new Maps();

            self.fsm = "B";

            setInterval(function () {
                //清屏
                self.ctx.clearRect(0,0,self.canvas.width,self.canvas.height);

                //设置帧编号
                self.f++;

                //背景
                self.ctx.drawImage(self.R['bg_night'],0,0,self.canvas.width,self.canvas.height);

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

                //输出帧编号
                self.ctx.textAlign = 'left';
                self.ctx.font = '10px consolas';
                self.ctx.fillText('FNO '+self.f,20,20);
                self.ctx.fillText('FSM '+self.fsm,20,40);
            },self.fps);
        },
        callBack :function (timeLater,fn) {
            this.callBacks[this.f+timeLater] = fn;
        }
    })
})();