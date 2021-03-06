let objects = {};
//let loc = document.location.href.split("/");

let data = {
    userID: userID,
    polygon: [[1,3,4], [3,4,2], [2,10,4]],
    lasers: [[3,3,2],[3,3,2]],
    missiles: []
};

function pipeline() {    
    if (multiplayer)       updateObjects("db/updater.php", data);
    else if (singleplayer) ;

    // regne ut ny posisjon på egne lasere, missiler og skip
    // tegne objects og egne laser, missiler og skip
}

// ha deltatime
//setInterval(pipeline, 500);




// let locc = document.location.href.split("/");

/* Keyinputs */
document.addEventListener('keyup', function(){
    let key = event.key;
    if (key == "Escape") {
        let ingame_menu = document.getElementById("main_menu");
        if (ingame_menu.style.display != "block") {
            ingame_menu.style.display = "block";
            document.getElementById("game_svg").style.display = "none";
        }
        else {
            ingame_menu.style.display = "none";
            document.getElementById("game_svg").style.display = "block";
        }
    }
});


/*      Updates canvas size on rezise    */
let canvas    = document.getElementsByTagName("canvas")[0];
canvas.height = window.innerHeight;
canvas.width  = window.innerWidth;
let width     = canvas.width;
let height    = canvas.height;
let ctx       = canvas.getContext("2d");
function fit_to_screen() {
    canvas.width = window.innerWidth-5;
    canvas.height = window.innerHeight-5;
    width = innerWidth;
    height = innerHeight;
} window.addEventListener('resize', fit_to_screen);


/* Canvas game */

class Vector {
    x;
    y;
    z;
    constructor(x,y,z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    rotateZ (a) {
        let x = this.x;
        let y = this.y;
        this.x = ( Math.cos(a)*x ) - ( Math.sin(a)*y );
        this.y = ( Math.sin(a)*x ) + ( Math.cos(a)*y );
    }
    static distance(p,s) {
        return Math.sqrt((s.x-p.x)**2+(s.y-p.y)**2);//+ //(s.z-p.z)**2);
    }
    static angleXY(p, s) {
        let angle = Math.acos(
            (p.x*s.x + p.y*s.y) /
            (((p.x**2+p.y**2)**0.5)*((s.x**2+s.y**2)**0.5))
        );
        return angle;
    }
    static getXvalueFrom3D( player, s ) {
        let v = player.viewVector;
        let p = player.position;
        let view = new Vector(v.x,v.y,v.z);
        let s2 = new Vector(s.x-p.x,s.y-p.y,s.z-p.z);

        // The star is in view, within 90 degrees on each side of the eye position
        let A_angle = Vector.angleXY(view,s2);
        if (A_angle <= Math.PI/2) {
            view.rotateZ( Math.PI/2 );

            //console.log(s2);
            let B_angle = this.angleXY(view,s2);
            return (B_angle/Math.PI)*width;
        } else {
            return -50;
        }
    }
}
let o = new Vector(1,1,0);
class Player {
    position;
    view;
    speed;

    constructor(x,y,z) {
        this.position   = new Vector(x,y,z);
        this.viewVector = new Vector(0,1,0);
        this.speed = 0;
    }
}
class Star {
    distanceFromCenter;
    angleFromCenter;
    x;
    y;
    z;
    color;
    cycleTime;
    constructor(dis,angle,color,cycleTime) {
        this.distanceFromCenter = dis;
        this.angleFromCenter = angle;
        this.x = (dis)*Math.cos(angle);
        this.y = (dis)*Math.sin(angle);
        this.z = 0;
        this.color = color;
        this.cycleTime = cycleTime;
    }
    addAngle(angle){
        this.angleFromCenter += angle;
        if (this.angleFromCenter > Math.PI*2) this.angleFromCenter-=Math.PI*2;
        this.x = this.distanceFromCenter*Math.cos(this.angleFromCenter);
        this.y = this.distanceFromCenter*Math.sin(this.angleFromCenter);
    }
    setAngle(cyclePosition) {
        this.angleFromCenter = cyclePosition*2*Math.PI;
        this.x = this.distanceFromCenter*Math.cos(this.angleFromCenter);
        this.y = this.distanceFromCenter*Math.sin(this.angleFromCenter);
    }
}
let player = new Player(0,-40,0);
console.log(player);
fit_to_screen();
let starCount = 100;
let starList = [
    new Star(
        0.1,
        0.1,
        "rgb("+255+","+Math.floor(Math.random()*255)+","+0+")",
        60*10*1000
    )
];
let renderdistance = 20;

function randomStar() {
    let distancen = (Math.random()*renderdistance) +10;
    return new Star(
        distancen,
        Math.random()*(Math.PI*2),
        "rgb("+0+","+Math.floor(Math.random()*50+205)+","+Math.floor(Math.random()*50+205)+")",
        distancen*10*1000
    );
}

if (starCount>1) {
    for (let i=0;i<starCount;i++) {
        s = renderdistance*2;
        starList.push( randomStar() );
    }
}
let distances;
let f = false;

function update() {
    if (spin>1) spin = 0;

    // Reset canvas
    ctx.fillStyle = "#000000";
    ctx.fillRect(0,0,width,height);
    ctx.fill();

    let World_objects = [];

    let gameDate = Date.now();
    // Collect stars
    for (let i=0;i<starCount;i++) {
        let s = starList[i];
        if (spin==1) {
            //s.addAngle(0.01);

            // Syklyser gjort + desimaler om hvor langt inn i en syklus den er.
            let cycleTimer = (gameDate/s.cycleTime); 
            
            // Finner posisjonen til nåverende syklur ved å trekke ut desimaltallene
            cycleTimer -= Math.floor(cycleTimer);
            //console.log(cycleTimer);
            s.setAngle(cycleTimer);
        }
        let dis = Vector.distance(player.position,s);

        //list1.concat(list2);
        if (dis > 0.2 && dis < 100) {
            let size = ( renderdistance*5 / dis )*2;


            // Draw star 
            let x = Vector.getXvalueFrom3D( player, s );
            let y = height/1.5 - dis*4;
            //console.log(s);
            let o = {
                dis: dis,
                color: s.color,
                x: x,
                y: y,
                size: size,
                type: "star"
            }
            World_objects.push(o);
        }
    }
    
    // Collect enemies
    if (objects.ships) {
        for (let i=0; i<objects.ships.length; i++) {
            let ship = objects.ships[i];
            let s = {
                x: ship[0][0],
                y: ship[0][1],
                z: 0
            }
            let dis = Vector.distance(player.position,s);
            let size = ( renderdistance*5 / dis )*2;
            
            let x = Vector.getXvalueFrom3D( player, s );
            let y = height/1.5 - dis*4;

            World_objects.push( {
                dis: dis,
                color: "#ff0000",
                x: x,
                y: y,
                size: size,
                type: "player"
            });
        }
    }

    // Draw both stars and enemies
    //if (f==false) console.log(World_objects);

    World_objects.sort(function (a, b) {return b.dis - a.dis; });

    if (f==false) console.log(World_objects);
    for (let i=0;i<World_objects.length-1;i++) {
        let s = World_objects[i];
        ctx.fillStyle = s.color; //s.color;
        ctx.beginPath();
        ctx.arc(s.x,s.y,s.size,0,Math.PI*2);
        ctx.fill();
    }
    //console.log(World_objects);
    f = true;
}
let rotationX=0;
let rotationY=0;

document.addEventListener('mousemove', function(e) {
    rotationX = (((  ( (e.clientX) - (width/2)  ) / Math.PI ) / (width )) * -1 );
    rotationY = (((  ( (e.clientY) - (height/2) ) / Math.PI ) / (height)) * -1 );
});
document.addEventListener('keydown', function(e) {
    if (e.keyCode == 87) player.speed = 3;
    if (e.keyCode == 83) player.speed = -2;
    if (e.keyCode == 32) spin++;
});
document.addEventListener('keyup', function(e) {
    if (e.keyCode == 87) player.speed = 0;
    if (e.keyCode == 83) player.speed = 0;
    if (e.keyCode == 66) {
        if (rotating == false) {
            rotating = true;
        }
        else {
            rotating = false;
        }
    }
});

let spin = 1;


rotating = true;
let fps;
let dt_old;
function maine() {
    fps = Math.round(1000 / (performance.now() - dt_old));
    dt_old = performance.now();
    //console.log(fps);

    if (rotating) player.viewVector.rotateZ(rotationX);

    player.position.y += (player.viewVector.y)/10 * player.speed;
    player.position.x += (player.viewVector.x)/10 * player.speed;
    player.position.z += (player.viewVector.z)/10 * player.speed;

    update();


    let testmultiplayer = {
        userID: userID,
        polygon: [[player.position.x,player.position.y,player.position.z]],
        lasers: [[3,3,2],[3,3,2]],
        missiles: []
    };
    
    updateObjects("db/updater.php", testmultiplayer);
    //console.log(testmultiplayer);

    requestAnimationFrame(maine);
}
function b(x) {return ((x*1000)|0)/1000}
maine();

/*
if (locc[locc.length-1].toString() == "singleplayer.html" || locc[locc.length-1].toString() == "multiplayer.html") {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    let fps = 30;
    let img = new Image();
    img.src = '../assets/insidespaceship2.png';
    setInterval(() => {
        let w = window.innerWidth;
        let h = window.innerHeight;

        // Radar center
        let rC = h-(h/5.5);
        
        // Clear canvas
        ctx.fillStyle = "black";
        ctx.fillRect(0,0,w,h);
        ctx.fill();

        
        ctx.drawImage(img,0,0,w,h);

        // Ellipse cockpit

        // Ellipse Radar
        ctx.strokeStyle = "#989c8c";
        ctx.lineWidth = "8";
        ctx.beginPath();
        ctx.arc(w/2, rC,h/6,0,2*Math.PI);
        ctx.stroke();
        ctx.fill();
        ctx.fillStyle = "rgba(48,230,240,0.2)";
        ctx.beginPath();
        ctx.arc(w/2, rC,h/6,0,2*Math.PI);
        ctx.fill();

        // Radar enemies
        ctx.beginPath();
        ctx.fillStyle = "rgba(48,230,240,1)";
        ctx.arc(w/2, rC, 10, 0, 2*Math.PI);
        ctx.fill();

        // Enemy's (x,y) pos relativ til meg + missiler.
    }, 1000/fps);
}
*/
/*
let d = Date.now();
let cycleTime = 3*60*60*1000; // 3 timer
let cyclePosition = (d/cycleTime);
cyclePosition -=Math.floor(cyclePosition);

*/