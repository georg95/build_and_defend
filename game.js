'use strict'
    var context = document.getElementById('game');
    function gameResize()
        {
        if (window.innerWidth/window.innerHeight > 1280/720)
            {
            context.height = window.innerHeight;
            context.width = 1280*context.height/720;
            }
        else
            {
            context.width = window.innerWidth;
            context.height = 720*context.width/1280;
            }
        }
    gameResize();
    var drawarea = context.getContext('2d');
    var boom=[];
    for(var i = 0; i < 9; i++)
        {
        boom[i]=new Image();
        boom[i].src = "boom1/"+(i+1)+".png";
        }
    var drill = new Image();
    drill.src = "factory.png";
    var sellimg = new Image();
    sellimg.src = "sell.png";
    var turret1 = new Image();
    turret1.src = "turret.png";
    var turret2 = new Image();
    turret2.src = "turret2.png";
    var ship1 = new Image();
    ship1.src = "enemy.png";
    var scanner1 = new Image();
    scanner1.src = "radar.png";
    var wallimg = new Image();
    wallimg.src = "shield.png";
    var bossturretimg = new Image();
    bossturretimg.src = "boss_gun1.png";
    var bossimg = new Image();
    bossimg.src = "boss.png";
    var pauseimg = new Image();
    pauseimg.src= "pause.png";
    var playimg = new Image();
    playimg.src= "play.png";
    var replayimg = new Image();
    replayimg.src = "retry.png";
    var menuimg = new Image();
    menuimg.src = "menu.png"

    var background = new Image();
    background.src = "bg.png";
    var background2 = new Image();
    background2.src = "bg2.png";
    //var laser = new Audio("laser.ogg");
    var mx = 0;
    var my = 0;
    var clicked = false;
    var mousemoved = false;
    var field = {};

    var buildmode = "factory";
    var margin = context.height*40/450;
    var factorycost;
    var turretcost;
    var wallcost;
    var scannercost;
    var scannerlvl;
    var gamestats = {};
    var button_big_radius = 67*context.height/720;
    var button_small_radius = 60*context.height/720;
    var actbutton_small_radius = 26*context.height/720;
    var waittime;
    var curr_wait;
    var gold;
    var endflag = false;
    var winflag = false;
    var loseflag = false;
    var enemies;
    var effects;
    var paused = false;
    var doctitle = "B&D";
    var wave = 1;

    var soundeffect =
        {
        lasersounds:[],
        boomsounds:[],
        bulletsouns:[],
        alienlasersounds:[],
        sellsounds:[],
        addSell: function()
            {
            for(var i = 0; i < this.sellsounds.length; i++)
                {
                var cur_snd = this.sellsounds[i];
                if(cur_snd.paused) { cur_snd.play(); break; }
                }
            },
        addLaser: function()
            {
            for(var i = 0; i < this.lasersounds.length; i++)
                {
                var cur_snd = this.lasersounds[i];
                if(cur_snd.paused) { cur_snd.play(); break; }
                }
            },
        addAlienLaser: function()
            {
            for(var i = 0; i < this.alienlasersounds.length; i++)
                {
                var cur_snd = this.alienlasersounds[i];
                if(cur_snd.paused) { cur_snd.play(); break; }
                }
            },
        addBoom: function()
            {
            for(var i = 0; i < this.boomsounds.length; i++)
                {
                var cur_snd = this.boomsounds[i];
                if(cur_snd.paused) { cur_snd.play(); break; }
                }
            },
        addBullet: function()
            {
            for(var i = 0; i < this.bulletsouns.length; i++)
                {
                var cur_snd = this.bulletsouns[i];
                if(cur_snd.paused) { cur_snd.play(); break; }
                }
            }
        };
    for(var i = 0; i < 5; i++)
        {
        soundeffect.lasersounds[i] = new Audio("laser.ogg");
        soundeffect.lasersounds[i].volume = 0.2;
        soundeffect.boomsounds[i] = new Audio("boom.ogg");
        soundeffect.boomsounds[i].volume = 0.2;
        soundeffect.bulletsouns[i] = new Audio("shoot.ogg");
        soundeffect.bulletsouns[i].volume = 0.2;
        soundeffect.alienlasersounds[i] = new Audio("laser2.ogg");
        soundeffect.alienlasersounds[i].volume = 0.2;
        soundeffect.sellsounds[i] = new Audio("sell.ogg");
        soundeffect.sellsounds[i].volume = 0.2;
        }
    var effect =
        {
        alive:true,
        constructor: function(t) { this.time = t; this.alltime=t; return this; },
        act: function() { if(this.time <= 0) { this.alive=false; return; } this.time--; },
        draw: function(area) { ; }
        };
    var effectFlowText = Object.create(effect);
    effectFlowText.constructor = function(t, text, style, color, sx, sy, dy)
        {
        effect.constructor.apply(this, arguments);
        this.text = text;
        this.style = style;
        this.color = color;
        this.sx = sx;
        this.sy = sy;
        this.dy = dy;
        return this;
        }
    effectFlowText.draw = function(area)
        {
        area.font = this.style;
        area.fillStyle = "rgba("+this.color+","+this.time/this.alltime+")";
        area.textAlign = "center";
        area.textBaseline = "bottom";
        area.fillText(this.text, this.sx,
                      this.sy+this.dy-this.dy*this.time/this.alltime)
        }
    var effectLaser = Object.create(effect);
    effectLaser.constructor = function(t, sx, sy, fx, fy, color, nosnd)
        {
        effect.constructor.apply(this, arguments);
        this.sx = sx;
        this.sy = sy;
        this.fx = fx;
        this.fy = fy;
        this.color = color || "255,0,0";
        if(!nosnd) { soundeffect.addLaser(); }
        return this;
        };
    effectLaser.draw = function(area)
        {
        area.strokeStyle = "rgba("+this.color+","+this.time/this.alltime+")";
        area.beginPath();
        area.moveTo(this.sx, this.sy);
        area.lineTo(this.fx, this.fy);
        area.lineWidth=2*context.height/720;
        if(area.lineWidth < 1) { area.lineWidth=1; }
        area.stroke();
        }
    var effectBullet = Object.create(effect);
    effectBullet.constructor = function(t, sx, sy, fx, fy, obj, dmg)
        {
        effect.constructor.apply(this, arguments);
        this.dmg = dmg;
        this.obj = obj;
        this.sx = sx;
        this.sy = sy;
        this.fx = fx;
        this.fy = fy;
        soundeffect.addBullet();
        return this;
        };
    effectBullet.draw = function(area)
        {
        area.strokeStyle = "#FF0";
        area.beginPath();
        var dx = this.fx-this.sx;
        var dy = this.fy-this.sy;
        var x = this.fx-dx*this.time/this.alltime;
        var y = this.fy-dy*this.time/this.alltime;
        var xx = x+dx/5;
        var yy = y+dy/5;
        if(this.time/this.alltime <= 1/5)
            {
            if(this.dmg != 0) { this.obj.hit(this.dmg); }
            this.dmg = 0;
            xx=this.fx; yy=this.fy;
            }
        area.moveTo(x, y);
        area.lineTo(xx, yy);
        area.lineWidth=2*context.height/720;
        if(area.lineWidth < 1) { area.lineWidth=1; }
        area.stroke();
        }
    var effectBoom = Object.create(effect);
    effectBoom.constructor = function(sx, sy)
        {
        effect.constructor.call(this, 8);
        this.sx = sx;
        this.sy = sy;
        soundeffect.addBoom();
        return this;
        }
    effectBoom.draw = function(area)
        {
        area.drawImage(boom[8-this.time],this.sx-field.step/2, this.sy-field.step/2, field.step, field.step);
        }
    var effectBigBoom = Object.create(effect);
    effectBigBoom.constructor = function(t, sx, sy, radius)
        {
        effect.constructor.apply(this, arguments);
        this.sx = sx;
        this.sy = sy;
        this.radius = radius;
        return this;
        };
    effectBigBoom.draw = function(area)
        {
        area.globalAlpha=this.time/this.alltime;
        area.strokeStyle = "#FF0";
        area.lineWidth=this.radius/4;
        area.beginPath();
        area.arc(this.sx,this.sy,this.radius*(1-this.time/this.alltime),0,2*Math.PI);
        area.stroke();
        area.globalAlpha=1;
        }

    function updateEffects()
        {
        effects.forEach(function(elem, index, arr)
            { if(elem === undefined) { return; } elem.act(); if(elem.alive === false) { delete arr[index]; } })
        }
    function drawEffects(area)
        {
        //console.log("draw effects");
        effects.forEach(function(elem, index, arr) { if(elem === undefined) { return; } elem.draw(area); } )
        }
    function addEffect(eff)
        {
        //console.log("add effect(" + effects.length+")");
        for(var i = 0; i <= effects.length; i++) // <= is not error, in case if array is full
            {
            if(effects[i] === undefined) { effects[i] = eff; break; }
            }
        }


    function endfunction()
        {
        this.state = 0;
        this.act = this.win;
        }
    endfunction.prototype.endstats = function(x, y, w, h)
        {
        drawarea.fillStyle="#555";
        drawarea.fillRect (x-w/2, y-h/2, w, h);
        drawarea.strokeStyle="#000";
        drawarea.lineWidth=6*context.height/720;
        drawarea.strokeRect (x-w/2, y-h/2, w, h);

        var stats = Object.keys(gamestats).length;
        drawarea.font = "bold "+12*context.height/720+"px sans-serif";
        drawarea.textAlign = "left";
        drawarea.textBaseline = "middle";
        drawarea.fillStyle="#FFF";
        var i = 0;
        var strh = h/stats;
        var ys = y-h/2+strh/2;
        for (var key in gamestats)
            {
            drawarea.fillText(""+gamestats[key].text+": "+gamestats[key].value, x-w*2/5, ys+i*strh);
            i++;
            }
        }
    endfunction.prototype.win = function ()
        {
        this.state += 0.2;
        drawarea.font = "bold "+120*context.height/720+"px sans-serif";
        drawarea.textAlign = "center";
        drawarea.textBaseline = "middle";
        drawarea.fillStyle="#FFF";

        var rectw = context.width/4;
        var recth = context.height/4;

        drawarea.translate(context.width/2, context.height/2-recth);
        drawarea.rotate(Math.cos(this.state)/5);
        drawarea.fillText("YOU WIN", 0, 0);
        drawarea.setTransform(1, 0, 0, 1, 0, 0);
        drawarea.globalAlpha = 0.8;
        this.endstats(context.width/2,context.height/2,rectw,recth);
        drawarea.globalAlpha = 1;
        }
    endfunction.prototype.lose = function ()
        {
        this.state += 0.1;
        drawarea.font = "bold 120px sans-serif";
        drawarea.textAlign = "center";
        drawarea.textBaseline = "middle";
        drawarea.fillStyle="rgba(250,0,0,"+(0.75+0.25*Math.cos(this.state))+")";
        drawarea.fillText("YOU LOSE", context.width/2, context.height/2);
        }
    var endfunc = new endfunction();

    function switchlose ()
        {
        for (var key in gamestats) { Object.defineProperty(gamestats[key], "value", { set:function() {;} } ); }
        endfunc.act = endfunc.lose; endflag = true; loseflag = true;
        }
    function switchwin ()
        {
        for (var key in gamestats)
            {
            Object.defineProperty(gamestats[key], "value", { set:function() {;} } );
            }
        endfunc.act = endfunc.win; endflag = true; winflag = true;
        }

    function fieldscan(drawarea)
        {
        if (this.scanenabled === false) { return; }
        drawarea.globalAlpha=0.6;
        for (var x = 0; x < field.size; x++)
        for (var y = 0; y < field.size; y++)
            {
            //if (field.getItem(x,y) != undefined) { continue; }
            var valuable = field.getRes(x,y).concentration;
            if(valuable < 7) { drawarea.fillStyle="#FE7276"; }
            if(valuable >= 7 && valuable < 10) { drawarea.fillStyle="#FFE673"; }
            if(valuable >= 10 && valuable < 13) { drawarea.fillStyle="#FFE673"; }
            if(valuable >= 13) { drawarea.fillStyle="#6EE768"; }

            drawarea.fillRect(field.x_left+x*field.step+2, field.y_up+y*field.step+2, field.step-4, field.step-4);
            }
        drawarea.globalAlpha=1;
        }
    var fscan = fieldscan.bind({scanenabled:false});
    function actbutton(cx, cy, img)
        {
        this.x = cx;
        this.y = cy;
        this.img = img;
        this.wh_size2 = actbutton_small_radius/Math.SQRT2;
        }
    actbutton.prototype.act = function() { console.warn("actbutton.act not implemented"); }
    actbutton.prototype.click = function(x,y)
        {
        var dx = x-this.x;
        var dy = y-this.y;
        if (dx*dx+dy*dy < actbutton_small_radius*actbutton_small_radius)
            {
            this.act();
            return true;
            }
        return false;
        }
    actbutton.prototype.draw = function(area)
        {
        area.drawImage(this.img, this.x-this.wh_size2, this.y-this.wh_size2, this.wh_size2*2, this.wh_size2*2);
        }
    var pausebutton = new actbutton(1100*context.width/1280, 127*context.height/720, pauseimg);
    pausebutton.act = function()
        {
        paused = !paused;
        if(paused) { document.title=doctitle+" [paused]"; this.img = playimg; }
        else       { document.title=doctitle;             this.img = pauseimg; }
        }
    var replaybutton = new actbutton(1160*context.width/1280, 127*context.height/720, replayimg);
    replaybutton.act = setdefaults;
    var menubutton = new actbutton(1130*context.width/1280, 77*context.height/720, menuimg);
    menubutton.act = function()
        {
        ReDraw = MenuDraw;
        Update = MenuUpdate;
        }
    var actionbuttons = [replaybutton, pausebutton, menubutton];
    var turretbutton = {};
    turretbutton.x = 150*context.width/1280;
    turretbutton.y = 197*context.height/720;
    turretbutton.img = turret2;
    turretbutton.click = function() { buildmode = "turret"; }
    turretbutton.cost = function() { return turretcost; }
    var factorybutton = {};
    factorybutton.x = 210*context.width/1280;
    factorybutton.y = 300*context.height/720;
    factorybutton.img = drill;
    factorybutton.click = function() { buildmode = "factory"; }
    factorybutton.cost = function() { return factorycost; }
    var wallbutton = {};
    wallbutton.x = 150*context.width/1280;
    wallbutton.y = 403*context.height/720;
    wallbutton.img = wallimg;
    wallbutton.click = function() { buildmode = "wall"; }
    wallbutton.cost = function() { return wallcost; }
    var sellbutton = {};
    sellbutton.x = 209*context.width/1280;
    sellbutton.y = 505*context.height/720;
    sellbutton.img = sellimg;
    sellbutton.click = function() { buildmode = "sell"; }
    sellbutton.cost = function() { return undefined; }

    var scannerbutton =
        {
        x: 150*context.width/1280,
        y: 607*context.height/720,
        img: scanner1,
        click: function()
            {

            if (gold < scannercost) { return; }
            gold -= scannercost;
            scannercost+=50;
            console.log("scanner");
                fscan = fieldscan.bind({scanenabled: true});
            this.timer = setTimeout("fscan=fieldscan.bind({scanenabled: false});", 30000);
            scannerlvl++;
            },
        cost: function() { return scannercost; }
        }
    var buttons = [turretbutton, factorybutton, wallbutton, sellbutton, scannerbutton];


    field.size = 10;
    field.items = [];
    field.res = [];
    field.getRes = function(x, y)       { return this.res[x*this.size+y]; }
    field.setRes = function(x, y, obj)  { this.res[x*this.size+y] = obj; }
    field.setWall = function(x, y)
        {
        var item = field.getItem(x,y);
        item.haswall = new wall(x, y);
        field.setItem(x,y,item);
        }
    field.getItem = function(x, y)      { return this.items[x*this.size+y]; }
    field.setItem = function(x, y, obj) { this.items[x*this.size+y] = obj; }
    field.wh_size = context.height - margin*2;
    field.y_up   = context.height - field.wh_size - margin;
    field.x_left = Math.round(context.width/2 - field.wh_size/2);
    field.step = field.wh_size/field.size;


    function getNearBuilding(x,y,radius)
        {
        var near_rad = Infinity;
        var near_obj = undefined;
        for (var px = 0; px < field.size; px++)
        for (var py = 0; py < field.size; py++)
            {
            var currbuild = field.getItem(px,py);
            if (currbuild == undefined) { continue; }
            var bx = currbuild.x;
            var by = currbuild.y;
            var curr_rad = Math.sqrt((bx-x)*(bx-x)+(by-y)*(by-y));
            if (curr_rad < near_rad) { near_rad = curr_rad; near_obj = currbuild; }
            }
        if (near_rad <= radius) { return near_obj; }
        return undefined;
        }
    field.AoE = function(x, y, radius, dmg)
        {
        addEffect(Object.create(effectBigBoom).constructor(25, x, y, radius));
        for (var px = 0; px < field.size; px++)
        for (var py = 0; py < field.size; py++)
            {
            var currbuild = field.getItem(px,py);
            if (currbuild == undefined) { continue; }
            var bx = currbuild.x;
            var by = currbuild.y;
            var curr_rad = Math.sqrt((bx-x)*(bx-x)+(by-y)*(by-y));
            if (curr_rad < radius) { currbuild.hit(dmg); }
            }
        }
    function bossturret(x, y)
        {
        this.x = x;
        this.y = y;
        this.maxhp = 100;
        this.hp = this.maxhp;
        this.isalive = true;
        this.attackTime = 0;
        this.shootstate = 0;
        this.angle = 0;
        }
    bossturret.prototype.move = function(dx, dy) { this.x+=dx; this.y+=dy; }
    bossturret.prototype.hit = function(damage)
        {
        if (this.isalive === false) { return; }
        this.hp-=damage;
        if (this.hp<=0)
            {
            this.hp = 0;
            this.isalive = false;
            addEffect(Object.create(effectBoom).constructor(this.x, this.y));
            }
        }
    bossturret.prototype.draw = function(area) {;}
    bossturret.prototype.drawself = function(area)
        {
        area.fillStyle = "#0F0";
        area.fillRect(this.x-field.step/4, this.y-field.step/4-2, Math.round(field.step/2*this.hp/this.maxhp), 2);
        area.translate(this.x, this.y);
        area.rotate(this.angle);
        area.drawImage(bossturretimg, -field.step/4, -field.step/4, field.step/2, field.step/2);
        area.setTransform(1, 0, 0, 1, 0, 0);
        }
    bossturret.prototype.act = function()
        {
        this.attackTime++;
        this.angle+=0.05;
        if(this.angle>2*Math.PI) { this.angle-=2*Math.PI; }
        var build = getNearBuilding(this.x, this.y, 220*context.height/450);
        if (build != undefined)
            {
            if(this.shootstate == 0)
                {
                addEffect(Object.create(effectLaser).constructor(5, this.x, this.y, build.x, build.y, "0,255,0", true));
                soundeffect.addAlienLaser();
                build.hit(20);
                this.shootstate = 10;
                }
            }
        if(this.shootstate > 0) { this.shootstate--; }
        }

    function boss()
        {
        this.x = Math.round(field.x_left+field.step*(field.size+4));
        this.y = Math.round(field.y_up+field.step*(field.size/2));
        this.maxhp = 500;
        this.hp = this.maxhp;
        this.shootstate = 0;
        this.turrets = [];
        this.turrets[0] = new bossturret(this.x-field.step/4, this.y-field.step/2);
        this.turrets[1] = new bossturret(this.x-field.step/4, this.y+field.step/2);
        this.turrets[2] = new bossturret(this.x+field.step/4, this.y-field.step/2);
        this.turrets[3] = new bossturret(this.x+field.step/4, this.y+field.step/2);
        for (var i in this.turrets) { addEnemy(this.turrets[i]); }
        this.buildstate = 500;
        this.isalive = true;
        this.vx = 0.7*context.height/450
        }
    boss.prototype.act = function()
        {
        this.shootstate++;
        if (this.shootstate > 50)
            {
            this.shootstate = 0;
            field.AoE(this.x-field.step*2, this.y, field.step*2, 30);
            }
        this.x -= this.vx;
        for (var i in this.turrets)
            {
            if (this.turrets[i] === undefined) { continue; }
            this.turrets[i].move(-this.vx, 0);
            if(this.turrets[i].isalive == false) { this.turrets[i] = undefined; }
            }
        if(this.x <= 0) { switchlose(); }
        }
    boss.prototype.draw = function(area)
        {
        area.fillStyle = "#0F0";
        area.fillRect(this.x-field.step, this.y-field.step-4, Math.round(2*field.step*this.hp/this.maxhp), 4);
        area.drawImage(bossimg, this.x-field.step, this.y-field.step, 2*field.step, 2*field.step);
        for (var i in this.turrets)
            {
            if(this.turrets[i] === undefined) { continue; }
            this.turrets[i].drawself(area);
            }
        }
    boss.prototype.hit = function(damage)
        {
        if (this.isalive === false) { return; }
        this.hp-=damage;
        if (this.hp<=0)
            {
            this.hp = 0;
            this.isalive = false;
            switchwin();
            addEffect(Object.create(effectBoom).constructor(this.x, this.y));
            }
        }
    function ship(px, py)
        {
        this.sx = Math.round(field.x_left+field.step*(field.size+px+0.5));
        this.sy = Math.round(field.y_up+field.step*(py+0.5));
        this.x = this.sx;
        this.y = this.sy;
        this.attackTime = 0;
        this.maxhp = 100;
        this.hp = this.maxhp;
        this.act = this.attack;
        this.isalive = true;
        this.shootstate = 0;
        this.vx = (2+Math.random())*context.height/450;
        }
    ship.prototype.attack = function()
        {
        this.attackTime++;

        var build = getNearBuilding(this.x, this.y, 80*context.height/450);
        if (build != undefined)
            {
            if(this.shootstate == 0)
                {
                addEffect(Object.create(effectBullet).constructor(10, this.x, this.y, build.x, build.y, build, 30));
                //build.hit(30);
                this.shootstate = 15;
                }
            }
        else
            {
            this.x -= this.vx;
            }
        if(this.shootstate > 0) { this.shootstate--; }
        if(this.x-field.step/2 <= field.x_left)
            {
            this.attackTime = 0;
            this.act = this.goback;
            }
        }
    ship.prototype.goback = function()
        {
        this.sy+=field.step;
        if(this.sy >= field.y_up+field.wh_size) { this.sy = field.y_up+field.step/2; }
        this.x = this.sx;
        this.y = this.sy;
        this.act = this.attack;
        }
    ship.prototype.hit = function(damage)
        {
        if (this.isalive === false) { return; }
        this.hp-=damage;
        if (this.hp<=0)
            {
            this.hp = 0;
            this.isalive = false;
            addEffect(Object.create(effectBoom).constructor(this.x, this.y));
            }
        }
    ship.prototype.draw = function(area)
        {
        area.fillStyle = "#0F0";
        area.fillRect(this.x-field.step/2, this.y-field.step/2-4, Math.round(field.step*this.hp/this.maxhp), 4);
        area.drawImage(ship1, this.x-field.step/2, this.y-field.step/2, field.step, field.step);
        }

    function addEnemy(en)
        {
        for (var i = 0; i <= enemies.length; i++)
            {
            if (enemies[i] === undefined) { enemies[i] = en; return; }
            }
        }
    function getNearEnemy(x,y,radius)
        {
        if (endflag) { return undefined; }
        for (var i = 0; i < enemies.length; i++)
            {
            var curr_enemy = enemies[i];
            if (curr_enemy === undefined) { continue; }
            if ((x-curr_enemy.x)*(x-curr_enemy.x)+(y-curr_enemy.y)*(y-curr_enemy.y) < radius*radius) { return curr_enemy; }
            }
        return undefined;
        }

    function wall(px, py)
        {
        this.x = Math.round(field.x_left+(px+0.5)*field.step);
        this.y = Math.round(field.y_up  +(py+0.5)*field.step);
        this.maxhp = 250;
        this.hp = this.maxhp;
        this.isalive = true;
        wallcost+=15;
        }
    wall.prototype.sell = function()
        {
        wallcost-=15;
        gold+=wallcost;
        }
    wall.prototype.destroy = function()
        {
        wallcost-=15;
        gamestats.builds.value++;
        this.isalive = false;
        addEffect(Object.create(effectBoom).constructor(this.x, this.y));
        }
    wall.prototype.draw = function(area)
        {
        area.fillStyle = "#00F";
        area.globalAlpha=0.5;
        area.drawImage(wallimg, this.x-field.step/2, this.y-field.step/2, field.step, field.step);
        area.globalAlpha=1;
        area.fillRect(this.x-field.step/2, this.y-field.step/2, field.step*this.hp/this.maxhp, 4);
        }
    wall.prototype.hit = function(damage)
        {
        this.hp-=damage;
        if (this.hp<=0) { this.hp = 0; this.isalive = false; }
        }
    wall.prototype.act = function () {;}
    function factory(px, py)
        {
        this.x = Math.round(field.x_left+(px+0.5)*field.step);
        this.y = Math.round(field.y_up  +(py+0.5)*field.step);
        this.maxhp = 100;
        this.hp = this.maxhp;
        this.isalive = true;
        this.production = field.getRes(px,py).concentration;
        this.prodStage = 0;
        factorycost+=5;
        }
    factory.prototype.sell = function()
        {
        if(this.haswall) { this.haswall.sell(); this.haswall = undefined; return false; }
        factorycost-=5;
        gold+=factorycost;
        return true;
        }
    factory.prototype.destroy = function()
        {
        factorycost-=5;
        gamestats.builds.value++;
        addEffect(Object.create(effectBoom).constructor(this.x, this.y));
        }
    factory.prototype.draw = function(area)
        {
        area.fillStyle = "#0F0";
        if(this.hp!=this.maxhp) { area.fillRect(this.x-field.step/2, this.y-field.step/2-4, Math.round(field.step*this.hp/this.maxhp), 4); }
        area.drawImage(drill, this.x-field.step/2*0.9, this.y-field.step/2*0.9,
                       field.step*0.9, field.step*0.9);
        }
    factory.prototype.hit = function(damage)
        {
        if(this.haswall) { this.haswall.hit(damage); return false; }
        this.hp-=damage;
        if (this.hp<=0) { this.hp = 0; this.isalive = false; }
        }
    factory.prototype.act = function()
        {
        this.prodStage++;
        if(this.prodStage >= 100)
            {
            gold+=this.production;
            gamestats.money.value += this.production;
            addEffect(Object.create(effectFlowText).constructor(
                20, ""+this.production, "bold "+11*context.height/450+"px Arial", "230,230,230",
                this.x, this.y, -field.step/2));
            this.prodStage = 0;
            }
        }
    function turret(px, py)
        {
        this.x = Math.round(field.x_left+(px+0.5)*field.step);
        this.y = Math.round(field.y_up  +(py+0.5)*field.step);
        this.maxhp = 100;
        this.hp = this.maxhp;
        this.angle = 0;
        this.shootstate = 0;
        this.isalive = true;
        turretcost+=10;
        }
    turret.prototype.destroy = function()
        {
        turretcost-=10;
        gamestats.builds.value++;
        addEffect(Object.create(effectBoom).constructor(this.x, this.y));
        }
    turret.prototype.sell = function()
        {
        if(this.haswall) { this.haswall.sell(); this.haswall = undefined; return false; }
        turretcost-=10;
        gold+=turretcost;
        return true;
        }
    turret.prototype.hit = function(damage)
        {
        if(this.haswall) { this.haswall.hit(damage); return false; }
        this.hp-=damage;
        if (this.hp<=0) { this.hp = 0; this.isalive = false; }
        }
    turret.prototype.draw = function(area)
        {
        area.fillStyle = "#0F0";
        if(this.hp!=this.maxhp) { area.fillRect(this.x-field.step/2, this.y-field.step/2-4, Math.round(field.step*this.hp/this.maxhp), 4); }
        area.translate(Math.round(this.x), Math.round(this.y));
        area.rotate(this.angle);
        area.drawImage(turret1, -Math.round(field.step/2), -Math.round(field.step/2), field.step, field.step);
        area.setTransform(1, 0, 0, 1, 0, 0);
        }
    turret.prototype.act = function()
        {
        if(this.angle > Math.PI)  { this.angle-=2*Math.PI; }
        if(this.angle < -Math.PI) { this.angle+=2*Math.PI; }
        var enemy = getNearEnemy(this.x, this.y, 200*context.height/450)
        if(enemy == undefined) { this.angle+=0.1; return; }

        var eangle = Math.atan2(enemy.y-this.y, enemy.x-this.x);
        var isscope = true;
        if(eangle - this.angle >  0.12) { this.angle+=0.1; isscope = false; }
        if(eangle - this.angle < -0.12) { this.angle-=0.1; isscope = false; }
        if (this.shootstate == 0)
            {
            if(isscope)
                {
                addEffect(Object.create(effectLaser).constructor(20,
                    this.x+field.step/2*Math.cos(this.angle), this.y+field.step/2*Math.sin(this.angle), enemy.x, enemy.y));
                enemy.hit(4);
                this.shootstate=20;
                }
            }
        else { if(this.shootstate > 0) { this.shootstate--; } }
        }
    field.click = function(x,y)
        {
        var relx = Math.floor((x-this.x_left)/this.wh_size*this.size);
        var rely = Math.floor((y-this.y_up)/this.wh_size*this.size);
        if (relx >= 0 && rely >= 0 && relx < this.size && rely < this.size)
            {
            if (buildmode == "sell")
                {
                var item = this.getItem(relx, rely);
                if (item === undefined) { return; }
                if (item.sell != undefined)
                    {
                    soundeffect.addSell();
                    if(item.sell()) this.setItem(relx, rely, undefined); // cuz of sell wall case
                    }
                }
            if (this.getItem(relx, rely) != undefined)
                {
                if (buildmode == "wall" && !this.getItem(relx, rely).haswall)
                    {
                    if (gold < wallcost) { return; }
                    gold -= wallcost;
                    this.setWall(relx, rely);
                    }
                    return;
                }
            if (buildmode == "factory")
                {
                if (gold < factorycost) { return; }
                gold -= factorycost;
                this.setItem(relx, rely, new factory(relx, rely));
                }
            if (buildmode == "turret")
                {
                if (gold < turretcost) { return; }
                gold -= turretcost;
                this.setItem(relx, rely, new turret(relx, rely));
                }


            }
        }

    function setdefaults()
        {
        buildmode = "factory";
        factorycost = 30;
        turretcost = 50;
        wallcost = 60;
        scannercost = 50;
        scannerlvl = 0;
        waittime = 900
        curr_wait = waittime;
        gold = 120;
        endflag = false;
        winflag = false;
        loseflag = false;
        paused = false;
        wave = 1;
        gamestats.money={text:"Earn money",valuex:0};
        gamestats.builds={text:"Buildings lost", valuex:0};
        for (var key in gamestats)
            {
            Object.defineProperty(gamestats[key], "value",
                {
                set:function(a) {this.valuex=a;},
                get:function() { return this.valuex;},
                configurable: true,
                });
            }
        pausebutton.img = pauseimg;
        effects = [];
        fscan=fieldscan.bind({scanenabled: false});
        if(scannerbutton.timer != undefined) { clearTimeout(scannerbutton.timer); }
        for(var x = 0; x<field.size; x++)
        for(var y = 0; y<field.size; y++)
            {
            field.setItem(x,y,undefined);
            field.setRes(x,y,{res:"gold",concentration:5+Math.floor(Math.random()*10)});
            }
        enemies = [];
        document.title=doctitle;
        }
    setdefaults();

    function DrawBg(bg)
        {
        drawarea.drawImage(bg, 0, 0, context.width, context.height);
        }

    field.draw = function (drawarea)
        {
        drawarea.strokeStyle="#666";

        var step = this.wh_size/this.size;
        drawarea.beginPath();
        for (var i = 1; i < this.size; i++)
            {
            drawarea.moveTo(this.x_left,              this.y_up+i*step);
            drawarea.lineTo(this.x_left+this.wh_size, this.y_up+i*step);
            drawarea.moveTo(this.x_left+i*step, this.y_up);
            drawarea.lineTo(this.x_left+i*step, this.y_up+this.wh_size);
            }
        drawarea.lineWidth=2*context.height/450;
        drawarea.stroke();
        drawarea.strokeRect(this.x_left, this.y_up, this.wh_size, this.wh_size);
        for(var x = 0; x < this.size; x++)
        for(var y = 0; y < this.size; y++)
            {
            if(this.getItem(x,y) === undefined) { continue; }
            var item = this.getItem(x,y);
            item.draw(drawarea);
            if(item.haswall) { item.haswall.draw(drawarea); }
            }
        var dx = mx-this.x_left;
        var dy = my-this.y_up;
        if(dx>0 && dy>0 && dx<this.wh_size && dy<this.wh_size)
            {
            var sx = Math.floor(dx/this.step);
            var sy = Math.floor(dy/this.step);
            var item = this.getItem(sx,sy);
            if(item === undefined)
                {
                var img = undefined;
                if(buildmode === "factory") { img = drill; }
                if(buildmode === "turret")  { img = turret1; }
                //if(buildmode === "wall")    { img = wallimg; }
                if(img !== undefined)
                    {
                    drawarea.globalAlpha = 0.2;
                    drawarea.drawImage(img, this.x_left+sx*this.step, this.y_up+sy*this.step, this.step, this.step);
                    drawarea.globalAlpha = 1;
                    }
                }
            else if (buildmode === "wall" && !item.haswall)
                {
                drawarea.globalAlpha = 0.3;
                drawarea.drawImage(wallimg, this.x_left+sx*this.step, this.y_up+sy*this.step, this.step, this.step);
                drawarea.globalAlpha = 1;
                }
            }
        }
    var ReDraw;
    var Update;
    var menuButton = function(pos, text, clickcallback)
        {
        this.clickcallback = clickcallback;
        this.position = pos;
        this.text = text;
        this.alpha = 1;
        this.animalpha = Math.PI;
        this.ishover = false;
        this.height = context.height/12;
        drawarea.font = "bold "+this.height+"px Arial";
        this.width  = drawarea.measureText(text).width;
        this.centery = context.height/12+this.position*(this.height*1.5);
        }
    menuButton.prototype.update = function()
        {
        if (this.ishover) { this.alpha = 0.75+Math.cos(this.animalpha)/4; this.animalpha+=0.3; }
        }
    menuButton.prototype.hover = function(x,y)
        {
        if(y > this.centery-this.height/2 &&
           y < this.centery+this.height/2 &&
           x > context.width/2-this.width/2 &&
           x < context.width/2+this.width/2)
            { this.ishover = true;  }
        else { this.ishover = false; this.animalpha = Math.PI; this.alpha = 1; }
        }
    menuButton.prototype.click = function(x,y)
        {
        console.log("buttonclick1");
        if(y > this.centery-this.height/2 &&
           y < this.centery+this.height/2 &&
           x > context.width/2-this.width/2 &&
           x < context.width/2+this.width/2)
            {
            console.log("buttonclick2");
            this.clickcallback();
            return true;
            }
        return false;
        }
    menuButton.prototype.draw = function(area)
        {
        area.font = "bold "+this.height+"px Arial";
        area.textAlign = "center";
        area.textBaseline = "middle";
        area.fillStyle = "rgba(200,200,200,"+this.alpha+")";
        area.fillText(this.text, context.width/2, this.centery);
        }
    var tomenubutton = new menuButton(7, "BACK", function() { ReDraw = MenuDraw; Update=MenuUpdate; });
    function HelpDraw()
        {
        DrawBg(background);

        var helpdesk = [{img:drill,    help:{"en":"Add from 1 to 14 per constant time",
                                            "ru":"Добавляет от 1 до 14 за единицу времени"}},
                        {img:turret1,  help:{"en":"Strike enemies: flights and boss",
                                            "ru":"Атакует врагов: самолеты и босса"}},
                        {img:wallimg,  help:{"en":"Protect other buildings, 2.5 times more stronger",
                                            "ru":"Защищает остальные здания, прочнее их в 2.5 раз"}},
                        {img:ship1,    help:{"en":"They will try to destroy your base",
                                            "ru":"Периодически появляется и атакует здания"}},
                        {img:bossimg,  help:{"en":"Appears after 10 flights. If destroyed, you WIN. If cross left border, you LOSE",
                                            "ru":"Появляется после 10 самолетов. Вы победите, если уничтожите его, иначе проиграете."}},
                        {img:sellimg,  help:{"en":"Buildings sell mode",
                                            "ru":"Режим продажи зданий"}},
                        {img:scanner1, help:{"en":"For 30 seconds show rich(green) and poor(red) places to build factory",
                                            "ru":"На 30 секунд показывает прибыльность участков для фабрики: от зеленого(прибыльный) до красного"}},];
        var iconsize = (tomenubutton.centery-tomenubutton.height/2-margin*2)/helpdesk.length;
        drawarea.font = "bold 13px Arial";
        drawarea.textAlign = "left";
        drawarea.textBaseline = "middle";
        drawarea.fillStyle = "#FFF";
        var locale = navigator.language;
        for (var i in helpdesk)
            {
            drawarea.drawImage(helpdesk[i].img, margin, margin+iconsize*i, iconsize, iconsize);
            drawarea.fillText(helpdesk[i].help[locale] || helpdesk[i].help["en"], margin*2+iconsize, margin+iconsize*i+iconsize/2);
            }
        tomenubutton.draw(drawarea);
        }
    function HelpUpdate()
        {
        tomenubutton.update();
        if(mousemoved) { tomenubutton.hover(mx, my); }
        if(clicked)    { if(tomenubutton.click(mx, my)) { clicked=false; } }
        }
    function AboutDraw()
        {
        DrawBg(background);
        var textsize = 14;
        drawarea.font = "bold "+textsize+"px Arial";
        drawarea.textAlign = "center";
        drawarea.textBaseline = "middle";
        drawarea.fillStyle = "#FFF";
        var text = {"en":["This is a simple HTML5 game by Shkuratov Georgy",
                    "Sounds: freesound.org",
                   "Bumped into a bug? Contact me: jura913@yandex.ru"],
                   "ru":["Перед вами простая игра на HTML5, автор — Шкуратов Георгий",
                         "Все звуки взяты с freesound.org",
                         "По поводу ошибок или по любому другому поводу пишите сюда: jura913@yandex.ru"]}
        var locale = navigator.language;
        drawarea.fillText(text[locale]?text[locale][0]:text["en"][0], context.width/2, context.height/2);
        drawarea.fillText(text[locale]?text[locale][1]:text["en"][1], context.width/2, context.height/2+textsize*1.5);
        drawarea.fillText(text[locale]?text[locale][2]:text["en"][2], context.width/2, context.height/2+textsize*3);
        tomenubutton.draw(drawarea);
        }
    function AboutUpdate()
        {
        tomenubutton.update();
        if(mousemoved) { tomenubutton.hover(mx, my); }
        if(clicked)    { if(tomenubutton.click(mx, my)) { clicked=false; } }
        }
    var menubuttons=[];
    menubuttons[0] = new menuButton(2, "PLAY", function()  {ReDraw = GameDraw;  Update=GameUpdate;});
    menubuttons[1] = new menuButton(3, "HELP", function()  {ReDraw = HelpDraw;  Update=HelpUpdate;});
    menubuttons[2] = new menuButton(4, "ABOUT", function() {ReDraw = AboutDraw; Update=AboutUpdate;});

    function MenuDraw()
        {
        //drawarea.fillStyle="#334";
        //drawarea.fillRect(0,0, context.width, context.height);
        DrawBg(background);
        for(var i = 0; i < menubuttons.length; i++)
            {
            menubuttons[i].draw(drawarea);
            }
        }
    function MenuUpdate()
        {
        for(var i = 0; i < menubuttons.length; i++)
            {
            menubuttons[i].update();
            if(mousemoved) { menubuttons[i].hover(mx, my); }
            if(clicked)    { if(menubuttons[i].click(mx, my)) { clicked=false; } }
            }
        }
    ReDraw =MenuDraw;
    Update=MenuUpdate;
    function GameDraw()
        {
        //drawarea.fillStyle="#334";
        //drawarea.fillRect(0,0, context.width, context.height);
        DrawBg(background2);
        fscan(drawarea);
        field.draw(drawarea);
        for(var i in actionbuttons) { actionbuttons[i].draw(drawarea); }
        drawarea.font = "bold "+24*context.height/450+"px courier";
        drawarea.textAlign = "center";
        drawarea.textBaseline = "middle";
        drawarea.fillStyle = "#E6E6E6";
        drawarea.fillText(""+Math.floor(gold), 148*context.width/1280, 79*context.height/720);

        drawarea.font = "bold "+11*context.height/450+"px Arial";
        drawarea.textAlign = "center";
        drawarea.textBaseline = "middle";
        drawarea.fillStyle = "#E6E6E6";
        drawarea.fillText("wave "+wave, field.x_left+field.wh_size/2, field.y_up/2);
        for (var i = 0; i < buttons.length; i++)
            {
            var wh_size2 = button_small_radius/Math.SQRT2;
            drawarea.drawImage(buttons[i].img, buttons[i].x-wh_size2, buttons[i].y-wh_size2,
                               wh_size2*2, wh_size2*2);
            if (buttons[i].cost() != undefined)
            drawarea.fillText(""+buttons[i].cost(),
                              buttons[i].x,
                              buttons[i].y-50*context.height/720);
            }
        var bm = 1;
        if (buildmode == "turret")  { bm = 0; }
        if (buildmode == "factory") { bm = 1; }
        if (buildmode == "wall")    { bm = 2; }
        if (buildmode == "sell")    { bm = 3; }
        drawarea.strokeStyle="rgba(230,230,230,0.7)";
        drawarea.beginPath();
        var angle = Math.PI/6;
        drawarea.moveTo(buttons[bm].x+button_big_radius*Math.cos(angle),
                        buttons[bm].y+button_big_radius*Math.sin(angle));
        for(var i = 0; i < 5; i++)
            {
            angle+=Math.PI/3;
            drawarea.lineTo(buttons[bm].x+button_big_radius*Math.cos(angle),
                            buttons[bm].y+button_big_radius*Math.sin(angle));
            }
        drawarea.closePath();
        drawarea.lineWidth = 6*context.height/720;
        drawarea.stroke();


        for (var i = 0; i < enemies.length; i++)
            {
            if (enemies[i] === undefined) { continue; }
            enemies[i].draw(drawarea);
            }
        drawEffects(drawarea);
        if(endflag)
            {
            endfunc.act();
            //return;
            }
        }
    var boominterval = 0;
    function GameUpdate()
        {
        if (clicked)
            {
            for(var i in actionbuttons) { actionbuttons[i].click(mx, my); }
            field.click(mx, my);
            var dx = 0;
            var dy = 0;
            for (var i = 0; i < buttons.length; i++)
                {
                dx = mx-buttons[i].x;
                dy = my-buttons[i].y;
                if(dx*dx+dy*dy < button_small_radius*button_small_radius) { buttons[i].click(); break; }
                }
            }
        if(paused) { return; }
        updateEffects();
        var boom = false;
        if(endflag) { if(boominterval == 0) { boominterval = 10; boom = true; } else { boominterval--; } }
        for(var x = 0; x < field.size; x++)
        for(var y = 0; y < field.size; y++)
            {
            var curritem = field.getItem(x,y);
            if(curritem === undefined) { continue; }
            if(curritem.haswall)
                {
                if(!curritem.haswall.isalive || (boom && loseflag))
                    {
                    curritem.haswall.destroy();
                    var item = field.getItem(x,y)
                    item.haswall = undefined;
                    field.setItem(x,y,item);
                    boom = false;
                    continue;
                    }
                }
            if(!curritem.isalive || (boom && loseflag)) { curritem.destroy(); field.setItem(x,y, undefined); boom = false; }
            else { curritem.act(); }
            }

        curr_wait--;
        if(curr_wait == 0)
            {
            wave++;
            curr_wait = waittime;
            waittime-=50;
            if(waittime <= 200)
                {
                curr_wait=-1;
                addEnemy(new boss());
                addEnemy(new ship(1+Math.floor(Math.random()*3),Math.floor(Math.random()*field.size)));
                addEnemy(new ship(1+Math.floor(Math.random()*3),Math.floor(Math.random()*field.size)));
                }
            else
                {
                addEnemy(new ship(1+Math.floor(Math.random()*3),Math.floor(Math.random()*field.size)));
                }
            }
        for(var i = 0; i < enemies.length; i++)
            {
            if(enemies[i] === undefined) { continue; }
            if (boom && winflag) { enemies[i].hit(1000); boom = false; }
            enemies[i].act();
            if (!enemies[i].isalive) { enemies[i] = undefined; }
            }
        }
    var lastframe = Date.now();
    function GameLoop()
        {
        setTimeout("requestAnimationFrame(GameLoop);",30);
        Update();
        ReDraw();
        clicked = false;
        mousemoved = false;
        }
    function GameClick(e)
        {
        //console.log("Click ("+e.pageX+", "+e.pageY+")");
        mx = e.pageX-context.offsetLeft;
        my = e.pageY-context.offsetTop;
        clicked = true;
        //ReDraw();
        }
    function GameWheel(e)
        {
        //console.log(e);
        e = e || window.event;

        // wheelDelta не дает возможность узнать количество пикселей
        var delta = e.deltaY || e.detail || e.wheelDelta;
        //var direction = ((event.wheelDelta) ? event.wheelDelta/120 : event.detail/-3) || false;
        var direction = delta>0?1:-1;
        //console.log("wheel direction:"+direction);
        var active = 0;
        switch(buildmode)
            {
            case "turret":  active = 0; break;
            case "factory": active = 1; break;
            case "wall":    active = 2; break;
            case "sell":    active = 3; break;
            default: console.log("Wheel:undefined active button"); break;
            }
        var bnum = active+direction;
        if(bnum == -1) { bnum = 3; }
        if(bnum == 4)  { bnum = 0; }
        buttons[bnum].click();
        }
    if (window.addEventListener) {
    if ('onwheel' in document) {
    // IE9+, FF17+, Ch31+
    window.addEventListener("wheel", GameWheel);
    } else if ('onmousewheel' in document) {
    // устаревший вариант события
    window.addEventListener("mousewheel", GameWheel);
    } else {
    // Firefox < 17
    window.addEventListener("MozMousePixelScroll", GameWheel);
    }
    } else { // IE8-
    window.attachEvent("onmousewheel", GameWheel);
    }
    //if (window.addEventListener) window.addEventListener("DOMMouseScroll", GameWheel, false);
    window.onmousewheel = GameWheel;

    context.onmousemove=function(e) { mx = e.pageX-context.offsetLeft; my = e.pageY-context.offsetTop; mousemoved = true; }
    context.onmousedown=GameClick;
    (function() {
      var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                                  window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
      window.requestAnimationFrame = requestAnimationFrame;
    })();

    background.onload = function () { requestAnimationFrame(GameLoop); }
