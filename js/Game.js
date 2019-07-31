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
            self.sceneManager = new SceneManager();
            setInterval(function () {
                //清屏
                self.ctx.clearRect(0,0,self.canvas.width,self.canvas.height);

                //设置帧编号
                self.f++;

                //背景
                self.ctx.drawImage(self.R['bg_night'],0,0,self.canvas.width,self.canvas.height);

                self.sceneManager.update();
                self.sceneManager.render();

                //输出帧编号
                self.ctx.textAlign = 'left';
                self.ctx.font = '10px consolas';
                self.ctx.fillText('FNO '+self.f,20,20);
                self.ctx.fillText('FSM '+self.sceneManager.fsm,20,40);
                self.ctx.fillText('COMBO '+self.combo,20,60);
            },self.fps);
        },
        callBack :function (timeLater,fn) {
            this.callBacks[this.f+timeLater] = fn;
        }
    })
})();