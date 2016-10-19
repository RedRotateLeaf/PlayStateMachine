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
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        _super.call(this);
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    var d = __define,c=Main,p=c.prototype;
    p.onAddToStage = function (event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);
        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    };
    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    p.onConfigComplete = function (event) {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    };
    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    p.onResourceLoadComplete = function (event) {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onItemLoadError = function (event) {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onResourceLoadError = function (event) {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    };
    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    p.onResourceProgress = function (event) {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    };
    /**
     * 创建游戏场景
     * Create a game scene
     */
    p.createGameScene = function () {
        var sky = this.createBitmapByName("bg_jpg");
        this.addChild(sky);
        var stageW = this.stage.stageWidth;
        var stageH = this.stage.stageHeight;
        sky.width = stageW;
        sky.height = stageH;
        this.Player = new Pole();
        this.addChild(this.Player);
        this.Player.x = this.Player.y = 300;
        this.Player.Idle();
        this.touchEnabled = true;
        this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.Moveba, this);
    };
    p.Moveba = function (evt) {
        this.Player.Move(evt.stageX, evt.stageY);
    };
    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    p.createBitmapByName = function (name) {
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        return result;
    };
    /**
     * 描述文件加载成功，开始播放动画
     * Description file loading is successful, start to play the animation
     */
    p.startAnimation = function (result) {
        var self = this;
        var parser = new egret.HtmlTextParser();
        var textflowArr = [];
        for (var i = 0; i < result.length; i++) {
            textflowArr.push(parser.parser(result[i]));
        }
        var textfield = self.textfield;
        var count = -1;
        var change = function () {
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
    };
    /**
     * 切换描述内容
     * Switch to described content
     */
    p.changeDescription = function (textfield, textFlow) {
        textfield.textFlow = textFlow;
    };
    return Main;
}(egret.DisplayObjectContainer));
egret.registerClass(Main,'Main');
var MoveState = (function () {
    function MoveState(x, y, Player) {
        this.Targety = y;
        this.Targetx = x;
        this.Player = Player;
    }
    var d = __define,c=MoveState,p=c.prototype;
    p.Load = function () {
        var _this = this;
        this.Player.Modle++;
        var xx = this.Targetx - this.Player.x;
        var yy = this.Targety - this.Player.y;
        if (xx > 0) {
            this.Player.scaleX = 1;
        }
        else {
            this.Player.scaleX = -1;
        }
        var zz = Math.sqrt(Math.pow(xx, 2) + Math.pow(yy, 2));
        var time = zz / this.Player.MoveSpeed;
        this.timer = new egret.Timer(50, time);
        this.TimeLeft = time;
        this.timer.addEventListener(egret.TimerEvent.TIMER, function () {
            _this.Player.x += xx / time;
            _this.Player.y += yy / time;
            _this.TimeLeft--;
            if (_this.TimeLeft < 1) {
                _this.timer.stop();
                if (_this.TimeLeft > -2) {
                    _this.Player.Idle();
                }
            }
        }, this);
        this.timer.start();
        this.Player.PlayAni(this.Player.MoveAni);
    };
    p.exit = function () {
        this.TimeLeft = -2;
    };
    return MoveState;
}());
egret.registerClass(MoveState,'MoveState',["STATE"]);
var IdleState = (function () {
    function IdleState(Player) {
        this.Player = Player;
    }
    var d = __define,c=IdleState,p=c.prototype;
    p.Load = function () {
        this.Player.Modle = 0;
        this.Player.PlayAni(this.Player.IdleAni);
    };
    p.exit = function () {
    };
    return IdleState;
}());
egret.registerClass(IdleState,'IdleState',["STATE"]);
var StateMachine = (function () {
    function StateMachine() {
    }
    var d = __define,c=StateMachine,p=c.prototype;
    p.Reload = function (S) {
        if (this.NowState) {
            this.NowState.exit();
        }
        this.NowState = S;
        this.NowState.Load();
    };
    return StateMachine;
}());
egret.registerClass(StateMachine,'StateMachine');
var Pole = (function (_super) {
    __extends(Pole, _super);
    function Pole() {
        _super.call(this);
        this.MyState = new StateMachine;
        this.MoveSpeed = 20;
        this.Modle = 0;
        this.IdleAni = new Array();
        this.MoveAni = new Array();
        this.MyPhoto = this.createBitmapByName("1_png");
        this.addChild(this.MyPhoto);
        this.LoadAni();
        this.anchorOffsetX = this.MyPhoto.width / 2;
        this.anchorOffsetY = this.MyPhoto.height;
    }
    var d = __define,c=Pole,p=c.prototype;
    p.LoadAni = function () {
        var texture = RES.getRes("1_png");
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
    };
    p.PlayAni = function (Ani) {
        var count = 0;
        var Bit = this.MyPhoto;
        var M = this.Modle;
        var timer = new egret.Timer(125, 0);
        timer.addEventListener(egret.TimerEvent.TIMER, Play, this);
        timer.start();
        function Play() {
            Bit.texture = Ani[count];
            if (count < Ani.length - 1) {
                count++;
            }
            else {
                count = 0;
            }
            if (this.Modle != M) {
                timer.stop();
            }
        }
    };
    p.Move = function (x, y) {
        var MS = new MoveState(x, y, this);
        this.MyState.Reload(MS);
    };
    p.Idle = function () {
        var IS = new IdleState(this);
        this.MyState.Reload(IS);
    };
    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    p.createBitmapByName = function (name) {
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        return result;
    };
    return Pole;
}(egret.DisplayObjectContainer));
egret.registerClass(Pole,'Pole');
//# sourceMappingURL=Main.js.map