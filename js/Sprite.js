(function () {
    //获取小鸟矩阵坐标值
    function getSpriteXY(row,col) {
        return {
            "x":6+col*game.basex,
            "y":game.basey+row*game.basex,
            "w":game.basex
        }
    }
    //小鸟类
    var Sprite = window.Sprite = Class.extend({
        init :function (row,col,imageName) {
            var self = this;
            self.row = row;
            self.col = col;
            self.imageName = imageName;
            self.isMove = false;
            self.spriteW = getSpriteXY(self.row,self.col).w;
            self.x = getSpriteXY(self.row,self.col).x;
            self.y = getSpriteXY(self.row,self.col).y;
            self.fNo = 0;
            self.isBoom = false;
            self.boomStep = 0;
            self.hide = false;
        },
        update :function () {
            if (this.hide) return;
            //小鸟移动
            if (this.isMove) {
                this.x += this.dx;
                this.y += this.dy;
                this.fNo--;
            }
            if (this.fNo<=0) this.isMove = false;
            //小鸟爆炸
            if (this.isBoom) {
                this.boomStep++;
                if (this.boomStep>29) this.hide = true;
            }
        },
        render :function () {
            var self = this;
            if (self.hide) return;
            if (this.isBoom) {
                game.ctx.drawImage(game.R['b'+self.boomStep],self.x,self.y,self.spriteW,self.spriteW);
            }else {
                game.ctx.drawImage(game.R[self.imageName],self.x,self.y,self.spriteW,self.spriteW);
            }
        },
        bomb:function (){
            this.isBoom=true;
        },
        moveTo :function (targetRow,targetCol,duringFrames) {
            this.isMove = true;
            this.fNo = duringFrames;
            var targetX = getSpriteXY(targetRow,targetCol).x;
            var targetY = getSpriteXY(targetRow,targetCol).y;
            var distanceX = targetX - this.x;
            var distanceY = targetY - this.y;
            this.dx = distanceX / duringFrames;
            this.dy = distanceY / duringFrames;
        }
    })
})();