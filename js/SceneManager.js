(function () {
    var SceneManager = window.SceneManager = Class.extend({
        init :function () {
            //场景号1：欢迎界面 场景号2：游戏界面
            this.sceneNum = 1;
            this.fsm = "主页";
            game.M['bgbgm'].loop = true;
            game.M['bgbgm'].play();
            this.logoY = -48;
            this.playY = game.canvas.height;
            this.playX = game.canvas.width/2-58;
            //绑定监听
            this.EventBind();

        },
        update :function () {
            switch (this.sceneNum) {
                case 1:
                    this.logoY+=2;
                    this.playY-=6;
                    if (this.logoY>50) this.logoY = 50;
                    if (this.playY<450) this.playY = 450;
                    break;
                case 2:
                    break;
            }
        },
        render :function () {
            var self = this;
            switch (this.sceneNum) {
                case 1:
                    game.ctx.drawImage(game.R['logo'],game.canvas.width/2-89,this.logoY);
                    game.ctx.drawImage(game.R['play'],game.canvas.width/2-58,this.playY);
                    game.ctx.drawImage(game.R['biglogo'],game.canvas.width/2-201,game.canvas.height*(1-0.618));
                    game.ctx.drawImage(game.R['bird0'],game.canvas.width/2-72,200);
                    game.ctx.drawImage(game.R['bird1'],game.canvas.width/2-24,200);
                    game.ctx.drawImage(game.R['bird2'],game.canvas.width/2+24,200);
                    game.ctx.drawImage(game.R['bird3'],game.canvas.width/2-98,150);
                    game.ctx.drawImage(game.R['bird4'],game.canvas.width/2-48,150);
                    game.ctx.drawImage(game.R['bird5'],game.canvas.width/2,150);
                    game.ctx.drawImage(game.R['bird6'],game.canvas.width/2+48,150);

                    break;
                case 2:
                    //背景
                    game.ctx.drawImage(game.R['logo'],game.canvas.width/2-89,50);
                    game.ctx.drawImage(game.R['menu'],game.canvas.width-92,8);
                    game.ctx.drawImage(game.R['new'],game.canvas.width-92,40);
                    //更新渲染
                    self.map.render();
                    //检查回调
                    if (game.callBacks.hasOwnProperty(game.f.toString())) {
                        game.callBacks[game.f.toString()]();
                        delete game.callBacks[game.f.toString()];
                    }

                    //有限状态机
                    switch (self.fsm) {
                        case "A":
                            self.fsm = "A";
                            break;
                        case "B":
                            if (self.map.check().length!==0) {
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
                    break;
            }
        },
        enter :function (num) {
            var self = this;
            self.sceneNum = num;
            switch (self.sceneNum) {
                case 1:
                    game.M['playbgm'].pause();
                    game.M['bgbgm'].currentTime = 0;
                    game.M['bgbgm'].loop = true;
                    game.M['bgbgm'].play();
                    self.fsm = "主页";
                    self.logoY = -48;
                    self.playY = game.canvas.height;
                    break;
                case 2:
                    self.map = new Maps();
                    game.M['bgbgm'].pause();
                    game.M['playbgm'].currentTime = 0;
                    game.M['playbgm'].loop = true;
                    game.M['playbgm'].play();
                    self.fsm = "B";
                    game.score = 0;
                    break;
            }
        },
        EventBind :function () {
            var self = this;

            game.canvas.onclick = function (e) {
                var cX = e.clientX;
                var cY = e.clientY;
                if (cX>self.playX && cX<self.playX+116 && cY>self.playY && cY<self.playY+70 && self.sceneNum === 1) {
                    self.enter(2)
                }else if (self.sceneNum ===2 && cX>game.canvas.width-92 && cX<game.canvas.width-12 && cY>8 && cY<36) {
                    self.enter(1)
                }else if (self.sceneNum ===2 && cX>game.canvas.width-92 && cX<game.canvas.width-12 && cY>40 && cY<68) {
                    self.enter(2)
                }
            };
            game.canvas.onmousedown = function (e) {
                if (self.fsm !== "A" || self.sceneNum !== 2) return;
                let x =e.offsetX;
                let y =e.offsetY;
                let startCol = (x-6)/game.basex;
                let startRow = (y-game.basey)/game.basex;

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
                game.canvas.onmousemove = function (e) {
                    let x =e.offsetX;
                    let y =e.offsetY;
                    let targetCol = (x-6)/game.basex;
                    let targetRow = (y-game.basey)/game.basex;
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
                    console.log(startCol,startRow,'to',targetCol,targetRow);
                    if (targetCol<0 || targetCol>6 || targetRow<0 || targetRow>6) {
                        game.canvas.onmousemove = null;
                        return;
                    }
                    if ((startRow ===targetRow && Math.abs(targetCol - startCol)===1) || (startCol ===targetCol && Math.abs(targetRow - startRow)===1)) {
                        self.map.exchange(startRow,startCol,targetRow,targetCol);
                        game.canvas.onmousemove = null;
                    }
                };
                game.canvas.onmouseup = function () {
                    game.canvas.onmousemove = null;
                }
            };
        },
    })
})();