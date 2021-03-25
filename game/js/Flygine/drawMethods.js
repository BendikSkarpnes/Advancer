function DrawCube(cube)
{
    let cubeScreen = new Array();
    for(let v = 0; v < cube.vert.length; v++)   
    {
        cubeScreen.push(cam.project(vec3.add(cube.vert[v], cube.pos)));
    }

    for(let f = 0; f < cube.face.length; f++)
    {
        ctx.beginPath();
        ctx.moveTo(scale*cubeScreen[cube.face[f][0]].x, scale*cubeScreen[cube.face[f][0]].y);
        ctx.lineTo(scale*cubeScreen[cube.face[f][1]].x, scale*cubeScreen[cube.face[f][1]].y);
        ctx.lineTo(scale*cubeScreen[cube.face[f][2]].x, scale*cubeScreen[cube.face[f][2]].y);
        ctx.lineTo(scale*cubeScreen[cube.face[f][3]].x, scale*cubeScreen[cube.face[f][3]].y);
        ctx.lineTo(scale*cubeScreen[cube.face[f][4]].x, scale*cubeScreen[cube.face[f][4]].y);
        ctx.fill();
    }
}

function DrawCubeWF(cube)
{
    let cubeScreen = new Array();
    for(let v = 0; v < cube.vert.length; v++)   
    {
        cubeScreen.push(cam.project(vec3.add(cube.vert[v], cube.pos)));
    }

    ctx.beginPath();
    for(let f = 0; f < cube.face.length; f++)
    {
        ctx.moveTo(scale*cubeScreen[cube.face[f][0]].x, scale*cubeScreen[cube.face[f][0]].y);
        ctx.lineTo(scale*cubeScreen[cube.face[f][1]].x, scale*cubeScreen[cube.face[f][1]].y);
        ctx.lineTo(scale*cubeScreen[cube.face[f][2]].x, scale*cubeScreen[cube.face[f][2]].y);
        ctx.lineTo(scale*cubeScreen[cube.face[f][3]].x, scale*cubeScreen[cube.face[f][3]].y);
        ctx.lineTo(scale*cubeScreen[cube.face[f][4]].x, scale*cubeScreen[cube.face[f][4]].y);
    }
    ctx.stroke();
}

function DrawModelVerts(model)
{
    let vertScreen = new Array();
    for(let v = 0; v < model.vert.length; v++)   
    {
        vertScreen.push(cam.project(vec3.add(model.vert[v], model.pos)));
    }

    for(let v = 0; v < model.vert.length; v++)
    {
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(scale*vertScreen[v].x, scale*vertScreen[v].y, 3, 0, 2*Math.PI);
        ctx.fill();
    }
}

function DrawModel(model)
{
    let color = model.color;
    let modelScreen = new Array();
    for(let v = 0; v < model.vert.length; v++)   // Project all vertex positions to 2d
    {
        modelScreen.push(cam.project(vec3.add(model.vert[v], model.pos)));
    }
    
    for(let f = 0; f < model.face.length; f++)
    {
        /* Backface culling */

        let v = vec3.subtract(modelScreen[model.face[f][1]].tov3(model.vert[model.face[f][1]].z), modelScreen[model.face[f][0]].tov3(model.vert[model.face[f][0]].z));
        let u = vec3.subtract(modelScreen[model.face[f][2]].tov3(model.vert[model.face[f][2]].z), modelScreen[model.face[f][0]].tov3(model.vert[model.face[f][0]].z));
        let N = vec3.cross(v, u); // Surface (N)ormal

        if(N.z >= 0) { continue; }      // cull the backfaces

        /* Ambient lighting */

        let ambLum = 0.2;

        /* Diffusion lighting */

        let pc = vec3.add(vec3.add(model.vert[model.face[f][0]], model.vert[model.face[f][1]]), model.vert[model.face[f][2]]);
        pc.divide(3);   // pc: polygon center (current face's center)

        let vl = vec3.subtract(light.pos, vec3.add(pc, model.pos)); // vector from pc to light source

        N.normalize();      // Normalize bot vectors
        vl.normalize();     // so to be used for dotproduct

        let difLum = vec3.dot(N, vl);    // 0-1 value luminance mulitplier

        /* Set color luminance */

        if(difLum < 0) { difLum = 0; }

        let luminance = ambLum + difLum;

        ctx.fillStyle = "rgb(" + color[0]*luminance + ", " + color[1]*luminance + ", " + color[2]*luminance + ")"; // Change luminance of object
        //ctx.fillStyle = "rgb(" + color[0]*difLum + ", " + color[1]*difLum + ", " + color[2]*difLum + ")"; // Change luminance of object
        
        ctx.beginPath();
        ctx.moveTo(scale*modelScreen[model.face[f][0]].x, scale*modelScreen[model.face[f][0]].y);
        ctx.lineTo(scale*modelScreen[model.face[f][1]].x, scale*modelScreen[model.face[f][1]].y);
        ctx.lineTo(scale*modelScreen[model.face[f][2]].x, scale*modelScreen[model.face[f][2]].y);
        ctx.lineTo(scale*modelScreen[model.face[f][0]].x, scale*modelScreen[model.face[f][0]].y);
        ctx.fill();

        //Drawvec3(pc, model.pos);
        //Drawvec3(vl, vec3.add(model.pos, pc));
    }
}

function DrawModelWF(model)
{
    let modelScreen = new Array();
    for(let v = 0; v < model.vert.length; v++)   
    {
        modelScreen.push(cam.project(vec3.add(model.vert[v], model.pos)));
    }

    for(let f = 0; f < model.face.length; f++)
    {
        let v = vec3.subtract(modelScreen[model.face[f][1]].tov3(), modelScreen[model.face[f][0]].tov3());
        let u = vec3.subtract(modelScreen[model.face[f][2]].tov3(), modelScreen[model.face[f][0]].tov3());
        let N = vec3.cross(v, u); // Surface (N)ormal

        if(N.z >= 0) { continue; } // Don't draw if normal is pointing towards you

        ctx.beginPath();
        ctx.moveTo(scale*modelScreen[model.face[f][0]].x, scale*modelScreen[model.face[f][0]].y); // 1. Vertex position
        //ctx.fillText(model.face[f][0], scale*modelScreen[model.face[f][0]].x, scale*modelScreen[model.face[f][0]].y); // Debug: vertex number

        ctx.lineTo(scale*modelScreen[model.face[f][1]].x, scale*modelScreen[model.face[f][1]].y); // 2. Vertex position
        //ctx.fillText(model.face[f][1], scale*modelScreen[model.face[f][1]].x, scale*modelScreen[model.face[f][1]].y);

        ctx.lineTo(scale*modelScreen[model.face[f][2]].x, scale*modelScreen[model.face[f][2]].y); // 3. Vertex position
        //ctx.fillText(model.face[f][2], scale*modelScreen[model.face[f][2]].x, scale*modelScreen[model.face[f][2]].y);

        ctx.lineTo(scale*modelScreen[model.face[f][0]].x, scale*modelScreen[model.face[f][0]].y); // Back to first vertex position
        ctx.strokeStyle = "white";
        ctx.stroke();
    }
}

function Drawvec3(vec, pos)
{
    let posScreen = cam.project(pos);
    let vecScreen = cam.project(vec3.add(pos, vec));
    ctx.beginPath();
    ctx.moveTo(scale*posScreen.x, scale*posScreen.y);
    ctx.lineTo(scale*vecScreen.x, scale*vecScreen.y);
    ctx.strokeStyle = "white";
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(scale*vecScreen.x, scale*vecScreen.y, 4, 0, 2*Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();
}