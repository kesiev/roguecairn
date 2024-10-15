function HexMap(width,height) {

    const
        ADJACENCY = [
            [
                { x:1, y:-1 },    
                { x:0, y:-1 }
            ],
            [
                { x:1, y:0 },    
                { x:1, y:0 }
            ],
            [
                { x:1, y:1 },    
                { x:0, y:1 }
            ],
            [
                { x:0, y:1 },    
                { x:-1, y:1 }
            ],
            [
                { x:-1, y:0 },
                { x:-1, y:0 }
            ],
            [
                { x:0, y:-1 },    
                { x:-1, y:-1 }
            ]
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
            applyBag:(random,bag,id,count,keep)=>{
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
                                        dx = x+side[y%2].x,
                                        dy = y+side[y%2].y;
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
            spread:(random,list,id,maxCount)=>{
                let
                    starting = [],
                    bounds = [],
                    cellsBag = new random.Bag(cells),
                    turnsList = [],
                    turnsBag,
                    turn,
                    pass = {},
                    passCount = 0,
                    conquers = {},
                    chart = [];

                list.forEach((element,turnId)=>{
                    let
                        cell = cellsBag.pick();
                    starting.push(cell)
                    cell[id] = [ element ];
                    turnsList.push(turnId);
                    conquers[turnId] = { count:0, percentage:0 };
                });

                turnsBag = new random.Bag(turnsList);

                do {

                    turn = turnsBag.pick();

                    if (!pass[turn]) {

                        let
                            destinations = [],
                            turnElement = list[turn];

                        cells.forEach(cell=>{
                            if (cell[id] && (cell[id].indexOf(turnElement) != -1))
                                ADJACENCY.forEach(side=>{
                                    let
                                        dx = cell.x+side[cell.y%2].x,
                                        dy = cell.y+side[cell.y%2].y,
                                        destCell = isCell(dx,dy); 
                                    if (
                                        destCell &&
                                        (starting.indexOf(destCell) == -1) &&
                                        (
                                            !destCell[id] ||
                                            (
                                                (destCell[id].indexOf(turnElement) == -1) &&
                                                (destCell[id].length<maxCount) &&
                                                (cell[id].length == 1)
                                            )
                                        )
                                    )
                                        destinations.push([cell, destCell]);
                                });
                        });

                        if (destinations.length) {

                            let
                                destination = random.element(destinations);

                            if (!destination[1][id]) destination[1][id] = [];
                            destination[1][id].push(turnElement);

                            if (destination[1][id].length == maxCount)
                                bounds.push(destination);

                        } else {
                            pass[turn] = true;
                            passCount++;
                        }

                    }

                } while (passCount < list.length);

                cells.forEach(cell=>{
                    if (cell[id].length == 1) {
                        cell[id].forEach(turnElement=>{
                            conquers[list.indexOf(turnElement)].count++;
                        });
                    }
                });

                for (let k in conquers) {
                    chart.push({ element:list[k], score:conquers[k].count });
                    conquers[k].percentage = Math.floor(conquers[k].count/cells.length*100);
                }

                chart.sort((a,b)=>{
                    if (a.score > b.score) return -1;
                    else if (a.score < b.score) return 1;
                    else return 0;
                });

                return {
                    conquers:conquers,
                    chart:chart,
                    allZones:0,
                    bounds:bounds
                };

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