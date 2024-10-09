function HexMap(random,width,height) {

    const
        ADJACENCY = [
            { x:0, y:-1 },
            { x:1, y:0 },
            { x:0, y:1 },
            { x:-1, y:1 },
            { x:-1, y:0 },
            { x:-1, y:-1 }
        ];

    let
        cells = [],
        map = [];

    for (let y=0;y<height;y++) {
        map[y]=[];
        for (let x=0;x<width-(y%2 == 0 ? 1 : 0);x++) {
            let
                cell = { id:x+","+y, x:x, y:y };
            cells.push(cell);
            map[y][x] = cell;
        }
    }

    function isCell(x,y) {
        return map[y] && map[y][x];
    }

    function addHexData(x,y,id,bag) {
        let
            value;

        if (isCell(x,y)) {
            if (!map[y][x][id]) map[y][x][id] = new ItemSet(1);
            do {
                value = bag.pick();
            } while (!map[y][x][id].add(value));
        }
    }

    let
        self = {
            map:map,
            cells:cells,
            applyBag:(bag,id,count,keep)=>{
                let
                    process = true;

                if (!count) count = 1;
                if (!keep) keep = 0;

                for (let i=0;i<count;i++)
                    addHexData(Math.floor(width/2),Math.floor(height/2),id,bag);

                do {
                    process = false;

                    for (let y=0;y<height;y++)
                        for (let x=0;x<map[y].length;x++) {
                            if (map[y][x][id]) {
                                let
                                    cellbag = new random.Bag(map[y][x][id].elements);
                                ADJACENCY.forEach(side=>{
                                    let
                                        dx = x+side.x,
                                        dy = y+side.y;
                                    if (isCell(dx,dy) && (map[dy][dx][id] === undefined)) {
                                        cellbag.reset();
                                        for (let i=0;i<keep;i++)
                                            addHexData(dx,dy,id,cellbag);
                                        for (let i=keep;i<count;i++)
                                            addHexData(dx,dy,id,bag);
                                        process = true;
                                    }  
                                })
                            }
                        }
                } while (process);
                 

            },
            toHtml:(ids)=>{
                let
                    html = "";

                for (let y=0;y<height;y++) {
                    html+="<div>";
                    for (let x=0;x<map[y].length;x++) {
                        html+="<div style='"+(x==0 && (y % 2 == 0) ? "margin-left:60px;" : "")+"border:1px solid #000;display:inline-block;width:120px;height:120px;font-size:10px'>";
                        html+="<b>"+map[y][x].id+"</b><br>";
                        ids.forEach(id=>{
                            if (map[y][x][id]) {
                                map[y][x][id].elements.forEach(element=>{
                                    html+=(element.tag || JSON.stringify(element))+", ";
                                })
                            } else html+="-";
                            html += "<br>";
                        })
                        html+="</div>";
                    }
                    
                    html+="</div>";
                }

                return html;
            }
        }

    return self;

}