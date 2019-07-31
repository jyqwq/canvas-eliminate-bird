(function () {
    var Maps = window.Maps = Class.extend({
        init :function () {
            this.code = [[],[],[],[],[],[],[],[]];
            for (let i = 0; i < 7; i++) {
                for (let j = 0; j < 7; j++) {
                    this.code[i][j] = _.random(0,game.typeNum-1);
                }
            }
            this.sprites = [[],[],[],[],[],[],[]];
            this.sArr = ["bird0","bird1","bird2","bird3","bird4","bird5","bird6"];
            this.imgNameArr = _.sample(this.sArr,game.typeNum);
            this.createSprite()
        },
        update :function () {

        },
        createSprite :function () {
            for (let i = 0; i < 7; i++) {
                for (let j = 0; j < 7; j++) {
                    this.sprites[i][j] = new Sprite(i,j,this.imgNameArr[this.code[i][j]]);
                }
            }
        },
        render :function () {
            for (let i = 0; i < 7; i++) {
                for (let j = 0; j < 7; j++) {
                    this.sprites[i][j].update();
                    this.sprites[i][j].render();
                }
            }
        },
        check :function () {
            var arr = this.code;
            var result1 = [];
            for (let row = 0; row < 7; row++) {
                let i = 0;
                let j = 1;
                while (i<7){
                    if (arr[row][i] !== arr[row][j]) {
                        if (j-i>=3) {
                            for (let m = i;m<=j-1;m++) {
                                result1.push({"row":row,"col":m})
                            }
                        }
                        i = j;
                    }
                    j++;
                }
            }
            var result2 = [];
            for (let col = 0;col<7;col++) {
                let i = 0;
                let j = 1;
                while (i<7) {
                    if (arr[i][col] !== arr[j][col]) {
                        if (j-i>=3) {
                            for (let m = i;m<=j-1;m++) {
                                let isExist = false;
                                _.each(result1,function (item) {
                                    if (item.row===m && item.col===col) {
                                        isExist = true;
                                    }
                                });
                                !isExist && result2.push({"row":m,"col":col})
                            }
                        }
                        i = j;
                    }
                    j++;
                }
            }
            return result1.concat(result2)
        },
        eliminate :function (cb) {
            var self = this;

            if (game.f-game.lastEliminate<=150) {
                game.combo++;
                if (game.combo>4) game.combo=4;
            }else {
                game.combo = 1;
            }

            game.M['bgm'+game.combo].load();
            game.M['bgm'+game.combo].play();
            game.lastEliminate = game.f;
            _.each(this.check(),function (item) {
                game.score++;
                self.sprites[item.row][item.col].bomb(cb);
                self.code[item.row][item.col] = '';
            });
            game.callBack(29,cb)
        },
        dropDown :function (cb) {
            let needToBeDropDown = [[],[],[],[],[],[],[]];
            for (let row = 5;row>=0;row--) {
                for (let col = 6;col>=0;col--) {
                    if (this.code[row][col] === ''){
                        needToBeDropDown[row][col] = 0;
                    }else {
                        let count = 0;
                        for (let _row = row+1;_row<=6;_row++){
                            if (this.code[_row][col]===''){
                                count++;
                            }
                        }
                        needToBeDropDown[row][col] = count;
                    }
                    if (needToBeDropDown[row][col]){
                        this.sprites[row][col].moveTo(row +needToBeDropDown[row][col],col,20);
                        this.code[row+needToBeDropDown[row][col]][col] = this.code[row][col];
                        this.code[row][col] = ''
                    }
                }
            }
            game.callBack(20,cb)
        },
        supply :function (cb) {
            let supplyNumberArr = [0,0,0,0,0,0,0];
            for (let col = 0;col<7;col++) {
                for (let row = 0;row<7;row++) {
                    if (this.code[row][col]===''){
                        supplyNumberArr[col]++;
                        this.code[row][col] = _.random(0,game.typeNum-1);
                    }
                }
            }
            this.createSprite();
            for (let i = 0;i<7;i++) {
                for (let j = 0;j<supplyNumberArr[i];j++) {
                    this.sprites[j][i].y = 20;
                    this.sprites[j][i].moveTo(j,i,20)
                }
            }
            game.callBack(20,cb)
        },
        exchange :function (sr,sc,tr,tc) {
            let self = this;
            this.sprites[sr][sc].moveTo(tr,tc,10);
            this.sprites[tr][tc].moveTo(sr,sc,10);
            game.sceneManager.fsm = "动画状态";
            game.callBack(10,function () {
                let temp = self.code[sr][sc];
                self.code[sr][sc] = self.code[tr][tc];
                self.code[tr][tc] = temp;
                if (self.check().length === 0) {
                    self.sprites[sr][sc].moveTo(sr,sc,10);
                    self.sprites[tr][tc].moveTo(tr,tc,10);
                    let temp = self.code[sr][sc];
                    self.code[sr][sc] = self.code[tr][tc];
                    self.code[tr][tc] = temp;
                    game.callBack(10,function () {
                        game.sceneManager.fsm = "A"
                    })
                }else {
                    console.log('ccc');
                    let temp = self.sprites[sr][sc];
                    self.sprites[sr][sc] = self.sprites[tr][tc];
                    self.sprites[tr][tc] = temp;
                    game.sceneManager.fsm = "C"
                }
            })
        }
    })
})();