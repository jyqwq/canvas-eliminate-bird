(function () {
    var Maps = window.Maps = Class.extend({
        init :function () {
            this.code = [
                [1,2,3,4,5,6,0],
                [2,3,4,5,6,0,1],
                [3,4,5,6,0,1,2],
                [4,5,6,0,1,2,3],
                [6,0,1,2,3,4,5],
                [0,1,2,3,4,5,6],
                [1,2,3,4,5,6,0]
            ];
            this.sprites = [[],[],[],[],[],[],[]];
            var sArr = ["bird0","bird1","bird2","bird3","bird4","bird5","bird6","bird7","bird8","bird9","bird10","bird11","bird12"];
            this.imgNameArr = _.sample(sArr,7);
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
                    this.sprites[i][j].render()
                }
            }
        }
    })
})();