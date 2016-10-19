//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-2015, Egret Technology Inc.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////、

class Main extends egret.DisplayObjectContainer {

    /**
     * 加载进度界面
     * Process interface loading
     */
    private loadingView: LoadingUI;
    private Player: Pole;

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event: egret.Event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);

        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    }

    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    private onConfigComplete(event: RES.ResourceEvent): void {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    }

    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    private onResourceLoadComplete(event: RES.ResourceEvent): void {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onItemLoadError(event: RES.ResourceEvent): void {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onResourceLoadError(event: RES.ResourceEvent): void {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    }

    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    private onResourceProgress(event: RES.ResourceEvent): void {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    }

    private textfield: egret.TextField;

    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene(): void {
        var sky: egret.Bitmap = this.createBitmapByName("bg_jpg");
        this.addChild(sky);
        var stageW: number = this.stage.stageWidth;
        var stageH: number = this.stage.stageHeight;
        sky.width = stageW;
        sky.height = stageH;



        this.Player = new Pole();
        this.addChild(this.Player);
        this.Player.x = this.Player.y = 300;


        this.Player.Idle();

        this.touchEnabled = true;
        this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.Moveba, this);

    }

    private Moveba(evt: egret.TouchEvent): void {
        this.Player.Move(evt.stageX, evt.stageY);

    }






    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    private createBitmapByName(name: string): egret.Bitmap {
        var result = new egret.Bitmap();
        var texture: egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }

    /**
     * 描述文件加载成功，开始播放动画
     * Description file loading is successful, start to play the animation
     */
    private startAnimation(result: Array<any>): void {
        var self: any = this;

        var parser = new egret.HtmlTextParser();
        var textflowArr: Array<Array<egret.ITextElement>> = [];
        for (var i: number = 0; i < result.length; i++) {
            textflowArr.push(parser.parser(result[i]));
        }

        var textfield = self.textfield;
        var count = -1;
        var change: Function = function () {
            count++;
            if (count >= textflowArr.length) {
                count = 0;
            }
            var lineArr = textflowArr[count];

            self.changeDescription(textfield, lineArr);

            var tw = egret.Tween.get(textfield);
            tw.to({ "alpha": 1 }, 200);
            tw.wait(2000);
            tw.to({ "alpha": 0 }, 200);
            tw.call(change, self);
        };

        change();
    }

    /**
     * 切换描述内容
     * Switch to described content
     */
    private changeDescription(textfield: egret.TextField, textFlow: Array<egret.ITextElement>): void {
        textfield.textFlow = textFlow;
    }
}

interface STATE {
    Load();
    exit();

}

class MoveState implements STATE {
    private Targetx: number;
    private Targety: number;
    private Player: Pole;
    private timer: egret.Timer;
    private TimeLeft: number;
    constructor(x: number, y: number, Player: Pole) {
        this.Targety = y;
        this.Targetx = x;
        this.Player = Player;

    }

    Load() {

        this.Player.Modle++;
        var xx = this.Targetx - this.Player.x;
        var yy = this.Targety - this.Player.y;
        if (xx > 0) {
            this.Player.scaleX = 1;
        } else {
            this.Player.scaleX = -1;
        }
        var zz = Math.sqrt(Math.pow(xx, 2) + Math.pow(yy, 2));
        var time: number = zz / this.Player.MoveSpeed;
        this.timer = new egret.Timer(50, time);
        this.TimeLeft = time;
        this.timer.addEventListener(egret.TimerEvent.TIMER, () => {
            this.Player.x += xx / time;
            this.Player.y += yy / time;
            this.TimeLeft--;
            if (this.TimeLeft < 1) {
                this.timer.stop();
                if (this.TimeLeft > -2) { this.Player.Idle(); }
            }
        }, this);
        this.timer.start();
        this.Player.PlayAni(this.Player.MoveAni);
    }
    exit() {
        this.TimeLeft = -2;
    }

}
class IdleState implements STATE {
    private Player: Pole;
    constructor(Player: Pole) {
        this.Player = Player;
    }
    Load() {
        this.Player.Modle = 0;
        this.Player.PlayAni(this.Player.IdleAni);

    }
    exit() {
    }

}
class StateMachine {
    private NowState: STATE;

    public Reload(S: STATE): void {
        if (this.NowState) {
            this.NowState.exit();
        }
        this.NowState = S;
        this.NowState.Load();
    }
}




class Pole extends egret.DisplayObjectContainer {

    public MyPhoto: egret.Bitmap;
    private MyState: StateMachine = new StateMachine;
    public MoveSpeed: number = 20;
    public Modle: number = 0;
    public IdleAni: Array<egret.Texture> = new Array<egret.Texture>();
    public MoveAni: Array<egret.Texture> = new Array<egret.Texture>();
    public constructor() {
        super();
        this.MyPhoto = this.createBitmapByName("1_png");
        this.addChild(this.MyPhoto);
        this.LoadAni();
        this.anchorOffsetX = this.MyPhoto.width / 2;
        this.anchorOffsetY = this.MyPhoto.height;
    }
    private LoadAni() {
        var texture: egret.Texture = RES.getRes("1_png");
        this.IdleAni.push(texture);
        texture = RES.getRes("2_png");
        this.IdleAni.push(texture);
        texture = RES.getRes("3_png");
        this.IdleAni.push(texture);
        texture = RES.getRes("4_png");
        this.IdleAni.push(texture);
        texture = RES.getRes("5_png");
        this.IdleAni.push(texture);
        texture = RES.getRes("6_png");
        this.IdleAni.push(texture);
        texture = RES.getRes("011_png");
        this.MoveAni.push(texture);
        texture = RES.getRes("012_png");
        this.MoveAni.push(texture);
        texture = RES.getRes("013_png");
        this.MoveAni.push(texture);
        texture = RES.getRes("014_png");
        this.MoveAni.push(texture);
        texture = RES.getRes("015_png");
        this.MoveAni.push(texture);
        texture = RES.getRes("016_png");
        this.MoveAni.push(texture);
    }

    public PlayAni(Ani: Array<egret.Texture>) {

        var count = 0;
        var Bit = this.MyPhoto;
        var M = this.Modle;
        var timer: egret.Timer = new egret.Timer(125, 0);
        timer.addEventListener(egret.TimerEvent.TIMER, Play, this);
        timer.start();

        function Play() {
            Bit.texture = Ani[count];
            if (count < Ani.length - 1) {
                count++;
            }
            else { count = 0; }
            if (this.Modle != M) {
                timer.stop();
            }
        }
    }

    public Move(x: number, y: number) {

        var MS: MoveState = new MoveState(x, y, this);
        this.MyState.Reload(MS);

    }

    public Idle() {

        var IS: IdleState = new IdleState(this);
        this.MyState.Reload(IS);


    }

    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    private createBitmapByName(name: string): egret.Bitmap {
        var result = new egret.Bitmap();
        var texture: egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }
}
