function Renderer() {

    const
        DIRECTIONS = [ "NE", "E", "SE", "SW", "W", "NW" ],
        TAGRANK_SYMBOL = [ "", "&#10024;", "&#11088;" ],
        REFERENCE_SYMBOL = "&#128214;",
        MAP_BORDER = 10,
        LABEL_DISTANCE = 10,
        NAME_BORDER = 20,
        NAME_LINEHEIGHT = 21,
        HEXAGON_ANGLE = Math.PI * 2 / 6,
        HEXAGON_SIZE = 80,
        HEXAGON_DIAGONAL_HEIGHT = HEXAGON_SIZE * Math.cos(HEXAGON_ANGLE),
        HEXAGON_DIAGONAL_WIDTH = HEXAGON_SIZE * Math.sin(HEXAGON_ANGLE),
        HEXAGON_WIDTH = HEXAGON_DIAGONAL_WIDTH*2,
        HEXAGON_HEIGHT = HEXAGON_SIZE+HEXAGON_DIAGONAL_HEIGHT;

    let
        data,
        ids = {};
    
    function clone(e) {
        return JSON.parse(JSON.stringify(e));
    }

    function renderPlace(renderSettings,place) {
        return "<span class='cell-id'>"+place.id+"</span> <span class='fake-link' link-to='area-"+place.id+"'>"+place.name[renderSettings.language]+"</span>";
    }

    function renderCharacter(renderSettings,character) {

        let
            language = renderSettings.language,
            out = "";

        switch (language) {
            case "IT":{
                out+="Sei <em>"+character[character.nameType]+" "+character.surname+"</em>";
                if (character.className)
                    out+=" <em>("+character.className[language]+")</em>"
                out+=", in passato eri "+character.background[language]+". ";
                out+="Hai un fisico "+character.physique[language]+", ";
                out+=character.skin[language]+", ";
                out+=character.hair[language]+" e ";
                out+="la "+character.face[language]+". ";
                out+="Hai una "+character.speech[language]+" e ";
                out+="indossi "+character.clothing[language]+". ";
                out+="Sei "+character.vice[language]+" ";
                out+="ma "+character.virtue[language]+" e ";
                out+="sei noto come un "+character.reputation[language]+". ";
                out+="Hai avuto la sfortuna di essere "+character.misfortunes[language]+". Hai "+character.age+" anni.";
                break;
            }
            default:{
                out+="You are <em>"+character[character.nameType]+" "+character.surname+"</em>";
                if (character.className)
                    out+=" <em>("+character.className[language]+")</em>"
                out+=", a former "+character.background[language]+". ";
                out+="You have "+character.physique[language]+" body, ";
                out+=character.skin[language]+", ";
                out+=character.hair[language]+", and ";
                out+=character.face[language]+". ";
                out+="You have a "+character.speech[language]+" and ";
                out+=character.clothing[language]+". ";
                out+="You are "+character.vice[language]+" ";
                out+="but "+character.virtue[language]+" and ";
                out+="you are known as "+character.reputation[language]+". ";
                out+="You have the misfortune of being "+character.misfortunes[language]+". You are "+character.age+" years old.";
                break;
            }
        }

        let
            stats = [];
        data.tags.stats.forEach(stat=>{
            if (character[stat.key])
                stats.push(character[stat.key]+" "+stat.shortLabel[language])
        });

        out += "<br><u>"+renderSettings.labels.have[language]+"</u>: <b>"+stats.join(", ")+"</b> &dash; ";

        let
            inventory = [];

        character.inventory.forEach(element=>{
            switch (element.type) {
                case "item":{

                    let
                        notes = [],
                        out = "";

                    out+=element.name[language];

                    if (element.spell)
                        out+=": "+element.spell.name[language];
                    
                    if (element.hp)
                        renderSettings.stats.forEach(stat=>{
                            if (element[stat.key])
                                notes.push(element[stat.key]+" "+stat.shortLabel[language]);
                        })

                    if (element.attributes)
                        element.attributes.forEach(attribute=>{
                            notes.push(attribute[language])
                        })

                    if (element.price)
                        element.price.forEach(price=>{
                            notes.push(price[language])
                        })

                    if (notes.length)
                        out+=" <em>("+notes.join(", ")+")</em>";

                    inventory.push(out);

                    break;
                }
                case "coins":{
                    inventory.push(element.amount+renderSettings.labels.coins[language]);
                    break;
                }
                case "spellbook":{
                    let
                        out = "";

                    out += renderSettings.labels.spellbook[language]+": "+element.spell.name[language];

                    inventory.push(out);
                    break;
                }
                default:{
                    inventory.push(element.description[language]);
                    break;
                }
            }
        })

        out +=inventory.join(" / ");

        if (character.notes.length)
            character.notes.forEach(line=>{
                out+="<br>"+REFERENCE_SYMBOL+" <u>"+line.key[language]+"</u>: "+line.value[language];
            });

        return out;
    }

    function renderBond(renderSettings,bond) {
        let
            language = renderSettings.language,
            out = "";

        bond.forEach(word=>{
            let
                element = word.value;

            if (word.sentence && word.sentence[language])
                out+=word.sentence[language];

            out+="<b>";
            switch (element.type) {
                case "building":
                case "item":
                case "person":
                case "relic":
                case "beast":{
                    out += element.name[language];
                    break;
                }
                case "spellbook":{
                    out += renderSettings.labels.spellbook[language]+": "+element.spell.name[language];
                    break;
                }
                case "spellscroll":{
                    out += renderSettings.labels.spellscroll[language]+": "+element.spell.name[language];
                    break;
                }
                case "coins":{
                    out+=element.amount+renderSettings.labels.coins[language];
                    break;
                }
                case "hideout":
                case "container":{
                    out+=renderSettings.labels[element.type][language]+" "+element.containerId;
                    break;
                }
                case "key":{
                    out += renderSettings.labels.key[language]+" "+element.keyId;
                    break;
                }
                case "fragment":{
                    out += renderSettings.labels.fragment[language]+" "+element.fragmentId;
                    break;
                }
                default:{
                    debugger;
                }
            }
            out+="</b> ";

            if (element.foundAt)
                out+="<em>("+renderSettings.labels.foundAt[language]+": "+renderPlace(renderSettings,element.foundAt)+")</em>";

            if (word.postSentence && word.postSentence[language])
                out+=word.postSentence[language];

        });

        out = out.trim();

        return out;
    }

    function renderElement(renderSettings,element,tagRank,short,root) {

        let
            language = renderSettings.language,
            out = "",
            isOwned = false;

        if (!root)
            root = element;

        if (short) {
            short = clone(short);
            short.enabled = true;
        } else
            short = { enabled:false };

        if (element.type)
            short[element.type] = true;

        if (element.own === root)
            isOwned = true;

        switch (element.type) {
            case "beast":{

                if (short.enabled && (root.type != "building")) {

                    out+=element.name[language];
                    if (element.foundAt)
                        out+=" <em>("+renderSettings.labels.foundAt[language]+": "+renderPlace(renderSettings,element.foundAt)+")</em>";

                    if (element.description) {
                        out+="<ul>"
                        element.description.forEach(line=>{
                            out+="<li>"+line[language]+"</li>";
                        });
                        out+="</ul>";
                    }

                } else {

                    let
                        stats = [],
                        hasList = element.description.length || element.notes.length || element.critical.length || element.references.length;

                    if (tagRank) {
                        let
                            score = 0;
                        tagRank.forEach(tag=>{
                            if (renderSettings.tagRank[score+1] && (element.tags.indexOf(tag.tag) != -1))
                                score++;
                        });
                        out += renderSettings.tagRank[score]+" ";
                    }
                    out += "<b>"+element.name[language]+"</b> ";
                    renderSettings.stats.forEach(stat=>{
                        if (element[stat.key])
                            stats.push(element[stat.key]+" "+stat.shortLabel[language]);
                    })
                    if (element.weapon)
                        element.weapon.forEach(weapon=>{
                            stats.push(weapon[language]);
                        });
                    out += stats.join(", ");

                    if (hasList)
                        out+="<ul>";

                    if (element.description)
                        element.description.forEach(line=>{
                            out+="<li>"+line[language]+"</li>";
                        });
                    if (element.critical)
                        element.critical.forEach(line=>{
                            out+="<li><u>"+renderSettings.labels.critical[language]+"</u>: "+line[language]+"</li>";
                        });
                    if (element.references)
                        element.references.forEach(line=>{
                            out+="<li>"+REFERENCE_SYMBOL+" "+renderElement(renderSettings,ids[line.type+"-"+line.id],tagRank,short,root)+"</li>";
                        });
                    if (element.notes)
                        element.notes.forEach(line=>{
                            out+="<li><u>"+line.key[language]+"</u>: "+renderElement(renderSettings,line.value,tagRank,short,root)+"</li>";
                        });

                    if (hasList)
                        out+="</ul>";

                }

                break;
            }
            case "relic":{
                let
                    notes = [],
                    hasList = element.description.length || element.notes.length || element.recharge.length || element.references.length;

                out += "<b>"+element.name[language]+"</b> ";

                if (element.charges && element.charges.label)
                    notes.push(element.charges.value+" "+element.charges.label[language]);

                if (short.enabled && element.foundAt)
                    notes.push(renderSettings.labels.foundAt[language]+": "+renderPlace(renderSettings,element.foundAt));

                if (notes.length)
                    out+=" <em>("+notes.join(", ")+")</em>";
                
                if (hasList)
                    out+="<ul>";

                if (!short.key && element.description)
                    element.description.forEach(line=>{
                        out+="<li>"+line[language]+"</li>";
                    });
                if (!short.key && element.references)
                    element.references.forEach(line=>{
                        out+="<li>"+REFERENCE_SYMBOL+" "+renderElement(renderSettings,ids[line.type+"-"+line.id],tagRank,short,root)+"</li>";
                    });
                if (!short.key && element.notes)
                    element.notes.forEach(line=>{
                        out+="<li><u>"+line.key[language]+"</u>: "+renderElement(renderSettings,line.value,tagRank,short,root)+"</li>";
                    });
                if (!short.key && element.recharge)
                    element.recharge.forEach(line=>{
                        out+="<li><u>"+renderSettings.labels.recharge[language]+"</u>: "+line[language]+"</li>";
                    });

                if (hasList)
                    out+="</ul>";
                break;
            }
            case "building":{
                let
                    hasList = element.entities.length;

                out += "<b>"+element.name[language]+"</b> ";

                if (element.foundAt)
                    out+=" <em>("+renderSettings.labels.foundAt[language]+": "+renderPlace(renderSettings,element.foundAt)+")</em>";

                if (hasList)
                    out+="<ul>";

                if (element.entities)
                    element.entities.forEach(entity=>{
                        out+="<li>"+renderElement(renderSettings,entity,tagRank,short,root)+"</li>";
                    });
                
                if (hasList)
                    out+="</ul>";
                break;
            }
            case "spell":{
                out += "<u>"+element.name[language]+"</u>: "+element.description[language];
                break;
            }
            case "spellbook":{
                
                out += "<b>"+renderSettings.labels.spellbook[language]+": "+element.spell.name[language]+"</b>";

                if (element.foundAt)
                    out+=" <em>("+renderSettings.labels.foundAt[language]+": "+renderPlace(renderSettings,element.foundAt)+")</em>";

                if (element.spell.description)
                    out+="<ul><li>"+element.spell.description[language]+"</li></ul>";

                break;
            }
            case "item":
            case "person":{

                let
                    notes = [];
                
                out += "<b>"+element.name[language]+"</b>";

                if ((!isOwned || short.beast) && element.hp) {
                    let
                        stats = [];
                    renderSettings.stats.forEach(stat=>{
                        if (element[stat.key])
                            stats.push(element[stat.key]+" "+stat.shortLabel[language]);
                    })
                    out += " "+stats.join(", ")+" ";
                }

                if ((isOwned || !short.beast) && element.attributes)
                    element.attributes.forEach(attribute=>{
                        notes.push(attribute[language])
                    })

                if ((isOwned || !short.beast) && element.price)
                    element.price.forEach(price=>{
                        notes.push(price[language])
                    })

                if (element.foundAt)
                    notes.push(renderSettings.labels.foundAt[language]+": "+renderPlace(renderSettings,element.foundAt));

                if (notes.length)
                    out+=" <em>("+notes.join(", ")+")</em>";

                if ((isOwned || (!short.key && !short.beast)) && element.notes) {
                    out+="<ul>";
                    element.notes.forEach(line=>{
                        out+="<li><u>"+line.key[language]+"</u>: "+renderElement(renderSettings,line.value,tagRank,short,root)+"</li>";
                    });
                    out+="</ul>";
                }

                break;
            }
            case "spellscroll":{
                
                let
                    notes = [],
                    list = [];

                out += "<b>"+renderSettings.labels.spellscroll[language]+": "+element.spell.name[language]+"</b>";

                if (element.foundAt)
                    notes.push(renderSettings.labels.foundAt[language]+": "+renderPlace(renderSettings,element.foundAt));

                if (element.spell.description)
                    if (short.enabled)
                        notes.push(element.spell.description[language]);
                    else
                        list.push(element.spell.description[language]);

                if (notes.length)
                    out+=" <em>("+notes.join(", ")+")</em>";

                if (list.length) {
                    out+="<ul>";
                    list.forEach(line=>out+="<li>"+line+"</li>");
                    out+="</ul>";
                }

                break;
            }
            case "hideout":
            case "container":{

                let
                    notes = [];
                
                out += "<b>"+renderSettings.labels[element.type][language]+" "+element.containerId+"</b>";

                if (element.attributes)
                    element.attributes.forEach(attribute=>{
                        notes.push(attribute[language])
                    })

                if (element.foundAt)
                    notes.push(renderSettings.labels.foundAt[language]+": "+renderPlace(renderSettings,element.foundAt));
        
                if (notes.length)
                    out+=" <em>("+notes.join(", ")+")</em>";

                out+="<ul>";

                if (!short.key && !short.fragment && element.openedBy && element.openedBy.length)
                    if (element.openedBy.length == 1)
                        out+="<li><u>"+renderSettings.labels.openedBy[language]+"</u>: "+renderElement(renderSettings,element.openedBy[0],tagRank,short,root)+"</li>";
                    else {
                        out+="<li><u>"+renderSettings.labels.openedBy[language]+"</u>:<ul>";
                        element.openedBy.forEach(item=>{
                            out+="<li>"+renderElement(renderSettings,item,tagRank,short,root)+"</li>";
                        })
                        out+="</ul></li>";
                    }

                if (element.contains)
                    out+="<li><u>"+renderSettings.labels.contains[language]+"</u>: "+renderElement(renderSettings,element.contains,tagRank,short,root)+"</li>";

                out+="</ul>";

                break;
            }
            case "key":{
                
                out += "<b>"+renderSettings.labels.key[language]+" "+element.keyId+"</b>";

                if (element.foundAt)
                    out+=" <em>("+renderSettings.labels.foundAt[language]+": "+renderPlace(renderSettings,element.foundAt)+")</em>";

                if (!short.container && element.opens)
                    out+="<ul><li><u>"+renderSettings.labels.opens[language]+"</u>: "+renderElement(renderSettings,element.opens,tagRank,short,root)+"</li></ul>";

                break;
            }
            case "fragment":{
                
                out += "<b>"+renderSettings.labels.fragment[language]+" "+element.fragmentId+"</b>";

                if (element.foundAt)
                    out+=" <em>("+renderSettings.labels.foundAt[language]+": "+renderPlace(renderSettings,element.foundAt)+")</em>";

                if (!short.container && !short.hideout && element.opens)
                    out+="<ul><li><u>"+renderSettings.labels.opens[language]+"</u>: "+renderElement(renderSettings,element.opens,tagRank,short,root)+"</li></ul>";

                break;
            }
            case "coins":{
                out+=element.amount+renderSettings.labels.coins[language];
                break;
            }
            default:{
                let
                    value = element[language];
                if (value === undefined)
                    console.warn(element.type,"not renderable");
                else
                    out += value;
            }
        }
        
        return out;
    }

    function colorSlice(ctx,random,colors,area,cell,direction,x1,y1,x2,y2) {
        let
            biome = cell.compass[direction].biome;

        ctx.beginPath();
        ctx.moveTo(area.cx, area.cy);
        ctx.lineTo(x1,y1);
        ctx.lineTo(x2,y2);

        if (colors) {
            ctx.fillStyle=biome.color;
            ctx.fill();
        }

        if (biome.pattern || biome.edgeColor) {
            let
                dy = area.y+area.height+10,
                dx = area.x+area.width;

            ctx.save();
            ctx.clip();
            
            if (colors && biome.edgeColor) {
                ctx.strokeStyle = biome.edgeColor;
                ctx.lineWidth = 20;
                ctx.beginPath();
                ctx.moveTo(x1,y1);
                ctx.lineTo(x2,y2);
                ctx.stroke();
                ctx.closePath();
            }

            ctx.fillStyle = "rgba(0,0,0,.2)";
            ctx.strokeStyle = "rgba(0,0,0,.2)";
            ctx.lineWidth = 1;

            switch (biome.pattern) {
                case "lines":{

                    let
                        oy=area.y;

                    do {
                        ctx.fillRect(area.x,oy,area.width,1);
                        oy+=4;
                    } while (oy<dy)
                    break;
                }
                case "dots":{

                    let
                        row = 0,
                        ox,
                        oy=area.y;

                    
                    do {
                        ox = area.x+(row%2)*2;
                        do {
                            ctx.beginPath();
                            ctx.arc(ox, oy, 1, 0, 2 * Math.PI, false);
                            ctx.fill();
                            ctx.closePath();
                            ox+=4;
                        } while (ox<dx);
                        oy+=4;
                        row++;
                    } while (oy<dy)
                    break;
                }
                case "widewaves":
                case "waves":{

                    let
                        row = 0,
                        col = 0,
                        ox,
                        oy=area.y,
                        waveSize = 2,
                        waveDistance = 4;

                    if (biome.pattern == "widewaves") {
                        waveSize = 4;
                        waveDistance = 6;
                    }

                    do {
                        col = 0;
                        ox = area.x;
                        ctx.beginPath();
                        ctx.moveTo(ox,oy);
                        do {
                            ox+=4;
                            ctx.lineTo(ox,oy+Math.sin(col)*waveSize);
                            col+=0.95;
                        } while (ox<dx);
                        ctx.stroke();
                        ctx.closePath();
                        oy+=waveDistance;
                        row++;
                    } while (oy<dy)
                    break;
                }
                case "trees":{

                    let
                        row = 0,
                        col = 0,
                        ox,
                        oy=area.y;

                    do {
                        col = row % 2;
                        ox = area.x;
                        do {
                            if (col % 2) {
                                ctx.beginPath();
                                ctx.arc(ox, oy, 4, 0, 2 * Math.PI, false);
                                ctx.stroke();
                                ctx.closePath();
                            } else
                                ctx.fillRect(ox-1,oy-6,1,5);  
                            ox+=10;
                            col++;
                        } while (ox<dx);
                        oy+=10;
                        row++;
                    } while (oy<dy)
                    break;
                }
                case "caves":{

                    let
                        row = 0,
                        col = 0,
                        ox,
                        oy=area.y;

                    do {
                        col = row % 2;
                        ox = area.x;
                        do {
                            if (col % 2) {
                                ctx.beginPath();
                                ctx.arc(ox, oy, 4, Math.PI, 0, false);
                                ctx.fill();
                                ctx.closePath();
                            } else {
                                ctx.fillRect(ox-4,oy-15,8,5);  
                                ctx.fillRect(ox+4,oy-11,12,1);  
                            }
                            ox+=10;
                            col++;
                        } while (ox<dx);
                        oy+=15;
                        row++;
                    } while (oy<dy)
                    break;
                }
                case "cross":{

                    let
                        row = 0,
                        ox,
                        oy=area.y;

                    do {
                        ox = area.x + (row %2 ? 5 : 0)
                        do {
                            ctx.fillRect(ox,oy,8,2);  
                            ctx.fillRect(ox+3,oy-2,2,9);  
                            ox+=13;
                        } while (ox<dx);
                        oy+=10;
                        row++;
                    } while (oy<dy)
                    break;
                }
                case "maze":{

                    let
                        cellSize = 5,
                        col,
                        row = 0,
                        ox,
                        oy=area.y;

                    do {
                        col = 0;
                        ox = area.x;
                        do {
                            ctx.fillRect(ox,oy,cellSize,cellSize);  
                            
                            if (random.bool())
                                ctx.fillRect(ox+cellSize,oy,cellSize,cellSize);
                            if (random.bool())
                                ctx.fillRect(ox,oy+cellSize,cellSize,cellSize);
                            
                            ox+=cellSize*2;
                            col++;
                        } while (ox<dx);
                        oy+=cellSize*2;
                        row++;
                    } while (oy<dy)
                    break;
                }
                case "bars":{

                    let
                        row = 0,
                        ox,
                        oy=area.y;

                    do {
                        ox = area.x + (row % 2 ? 4 : 0)
                        do {
                            let
                                height = 2+random.integer(5);
                            ctx.fillRect(ox,oy-height,3,height);  
                            ox+=9;
                        } while (ox<dx);
                        oy+=12;
                        row++;
                    } while (oy<dy)
                    break;
                }
                case "house":{

                    let
                        row = 0,
                        col = 0,
                        ox,
                        oy=area.y;

                    do {
                        col = row % 2;
                        ox = area.x;
                        do {
                            if (col % 2) {
                                ctx.beginPath();
                                ctx.moveTo(ox,oy);
                                ctx.lineTo(ox+8,oy-5);
                                ctx.lineTo(ox+16,oy);
                                ctx.lineTo(ox,oy);
                                ctx.fill();
                                ctx.closePath();
                            } else
                                ctx.fillRect(ox+3,oy-10,10,6);  
                            ox+=15;
                            col++;
                        } while (ox<dx);
                        oy+=10;
                        row++;
                    } while (oy<dy)
                    break;
                }
                case "saw":{

                    let
                        row = 0,
                        col = 0,
                        ox,
                        oy=area.y;

                    do {
                        col = row % 2;
                        ox = area.x;
                        ctx.beginPath();
                        do {
                            switch (col) {
                                case 0:{
                                    ctx.moveTo(ox,oy);
                                    ox+=8;
                                    col++;
                                    break;
                                }
                                case 1:{
                                    ctx.lineTo(ox,oy-6);
                                    ox+=8;
                                    col++;
                                    break;
                                }
                                case 2:{
                                    ctx.lineTo(ox,oy);
                                    ox+=5;
                                    col = 0;
                                    break;
                                }
                            }
                        } while (ox<dx);
                        ctx.stroke();
                        ctx.closePath();
                        oy+=14;
                        row++;
                    } while (oy<dy)
                    break;
                }
            }

            if (!colors && biome.edgeColor) {
                ctx.beginPath();
                ctx.moveTo(x1,y1);
                ctx.lineTo(x2,y2);
                ctx.strokeStyle = "rgba(0,0,0,.2)";
                ctx.lineWidth = 20;
                ctx.stroke();
                ctx.strokeStyle = "#fff";
                ctx.lineWidth = 17;
                ctx.stroke();
                ctx.closePath();
            }

            ctx.restore();
        }

        ctx.closePath();

    }

    function render(seed,language,worlddata) {

        let
            world = worlddata.world,
            characters = worlddata.characters,
            bonds = worlddata.bonds,
            html = "",
            description = [],
            worldBiome = data.tags.labels.worldBiome[language],
            worldGeography = data.tags.labels.worldGeography[language],
            biomes = world.stats.biomes,
            renderSettings = {
                language:language,
                labels:data.tags.labels,
                stats:data.tags.stats,
                tagRank:TAGRANK_SYMBOL
            };

        // --- Map (slot)

        html += "<h1 class='collapse-section header-map' collapse-section='section-map'>"+data.tags.labels.map[language]+"</h1><div class='collapsable-section' id='section-map'>";
        html += "<div id='map'></div>";
        html += "<p class='map-selector'><span class='fake-link-action' id='set-map-color'>"+data.tags.labels.colors[language]+"</span> | <span class='fake-link-action' id='set-map-bw'>"+data.tags.labels.bw[language]+"</span></p>";
        html += "</div>";

        html += "<div class='world-description'>";

        // --- Characters

        html += "<h1 class='collapse-section' collapse-section='section-characters'>"+data.tags.labels.characters[language]+"</h1><div class='collapsable-section' id='section-characters'>";
        html += "<p class='no-print'>"+data.tags.labels.charactersDescription[language]+"</p>";
        html+="<ol>";
        
        characters.forEach(character=>{
            html+="<li>"+renderCharacter(renderSettings,character)+"</li>";
        });

        html+="</ol></div>";

         // --- Bonds

        html += "<h1 class='collapse-section' collapse-section='section-bonds'>"+data.tags.labels.bonds[language]+"</h1><div class='collapsable-section' id='section-bonds'>";
        html += "<p class='no-print'>"+data.tags.labels.bondsDescription[language]+"</p>";
        html += "<ol>";
        bonds.forEach(bond=>{
            html+="<li>"+renderBond(renderSettings,bond)+"</li>";
        })
        html += "</ol></div>";

        // --- World

        html += "<h1 class='collapse-section' collapse-section='section-world'>"+data.tags.labels.world[language]+"</h1><div class='collapsable-section' id='section-world'>";

        // --- Biomes

        line = worldBiome[0];
        world.stats.biomes.forEach((biome,id)=>{
            line += "<b>"+biome.adjectives[0][language][worldBiome[1]]+"</b>";
            if (id == biomes.length-2)
                line += biomes.length == 2 ? worldBiome[5] : worldBiome[4];
            else if (id == biomes.length-1)
                line += worldBiome[2];
            else
                line += worldBiome[3];
        })

        description.push(line);

        // --- Geography

        line = "";
        world.stats.geography.forEach(geography=>{
            line += worldGeography[0]+"<b>"+geography.biome.adjectives[0][language][worldGeography[1]]+"</b>"+worldGeography[2];
            geography.zones.forEach((zone,id)=>{
                line += data.tags.labels.compass[zone][language];
                if (id == geography.zones.length-2)
                    line += biomes.length == 2 ? worldGeography[6] : worldGeography[5];
                else if (id == geography.zones.length-1)
                    line += worldGeography[3];
                else
                    line += worldGeography[4];
            })
    
            line+=" ";
        })

        description.push(line.trim());

        if (description)
            html+= description.map(line=>"<p>"+line+"</p>").join("");

        world.cells.forEach((cell,id)=>{

            let
                line,
                areaBiome = data.tags.labels.areaBiome[language],
                areaBorders = data.tags.labels.areaBorders[language],
                biomes = cell.biome.elements,
                directions = [],
                description = [];

            if (id) html+="<hr>";

            html+="<h2 id='area-"+cell.id+"'><span class='cell-id'>"+cell.id+"</span> "+cell.name[language]+"</h2>";

            // --- Biomes

            line = areaBiome[0];
            biomes.forEach((biome,id)=>{
                line += "<b>"+biome.adjectives[0][language][areaBiome[1]]+"</b>";
                if (id == biomes.length-2)
                    line += biomes.length == 2 ? areaBiome[5] : areaBiome[4];
                else if (id == biomes.length-1)
                    line += areaBiome[2];
                else
                    line += areaBiome[3];
            })
            description.push(line);

            // --- Borders

            line = areaBorders[0];
            
            DIRECTIONS.forEach(direction=>{
                if (cell.compass[direction].cell)
                    directions.push(data.tags.labels.compass[direction][language]+areaBorders[1]+renderPlace(renderSettings,cell.compass[direction].cell));
            });

            directions.forEach((direction,id)=>{
                line += direction;
                if (id == directions.length-2)
                    line += directions.length == 2 ? areaBorders[5] : areaBorders[4];
                else if (id == directions.length-1)
                    line += areaBorders[2];
                else
                    line += areaBorders[3];
            });

            description.push(line);

            // --- Keep biomes

            cell.keepBiomes.forEach((biome,id)=>{
                let
                    keepBiome = data.tags.labels.keepBiome[language],
                    directions = cell.keepBiomesDirections[id];
                
                line = keepBiome[0]+"<b>"+biome.adjectives[0][language][keepBiome[1]]+"</b>"+keepBiome[2];
                    
                directions.forEach((direction,id)=>{
                    line += data.tags.labels.compass[direction][language];
                    line += " <em>("+renderPlace(renderSettings,cell.compass[direction].cell)+")</em>";
                    if (id == directions.length-2)
                        line += directions.length == 2 ? keepBiome[6] : keepBiome[5];
                    else if (id == directions.length-1)
                        line += keepBiome[3];
                    else
                        line += keepBiome[4];
                });
                description.push(line);
            })

            if (description)
                html+= description.map(line=>"<p>"+line+"</p>").join("");

            [
                "boss", "midboss"
            ].forEach(k=>{
                cell[k].forEach((boss,id)=>{
                    html+="<p><u><b>"+data.tags.labels[k][language]+"</b></u>: "+renderElement(renderSettings,boss,cell.biome.elements)+"</p>";
                })
            });

            html+="<h3>"+data.tags.labels.explore[language]+"</h3><table>";
            html+="<tr class='no-print'><th class='diceroll'>"+data.tags.labels.diceRoll[language]+"</th><th>"+data.tags.labels.diceResult[language]+"</th></tr>";
            cell.encounters.forEach(encounter=>{
                html+="<tr><td class='diceroll'>"+encounter.dice+"</td><td>";
                if (encounter.beast)
                    html+=renderElement(renderSettings,encounter.beast,cell.biome.elements);
                else switch (encounter.type) {
                    case "entities":{
                        if (cell.entities.length)
                            html+="<em>"+data.tags.labels.event[language]+"</em>";
                        else
                            html+="<em>"+data.tags.labels.nothing[language]+"</em>";
                        break;
                    }
                }
                html+="</td></tr>";
            })
            html+="</table>";

            if (cell.entities.length) {
                html+="<h3>"+data.tags.labels.events[language]+"</h3><ol>";
                cell.entities.forEach(entity=>{
                    html+="<li>"+renderElement(renderSettings,entity,cell.biome.elements)+"</li>";
                });
                html+="</ol>";
            }
                
        });

        html+="</div>";

        // --- Map

        let
            maps = [],
            mapHotspots = [];

        for (let colors = 0; colors<2; colors++) {
            
            let
                random = new Random(seed),            
                canvas = document.createElement("canvas"),
                ctx = canvas.getContext("2d"),
                oy = MAP_BORDER+HEXAGON_DIAGONAL_HEIGHT+HEXAGON_SIZE;

            canvas.width = (world.map[1].length * HEXAGON_WIDTH)+(MAP_BORDER*2);
            canvas.height = world.map.length*HEXAGON_HEIGHT+HEXAGON_DIAGONAL_HEIGHT+(MAP_BORDER*2);
            ctx.textBaseline = "middle";

            for (let y=0;y<world.map.length;y++) {
                ox = MAP_BORDER+(y%2 ? 0 : HEXAGON_DIAGONAL_WIDTH);
                for (let x=0;x<world.map[y].length;x++) {
                    let
                        cx = ox+HEXAGON_DIAGONAL_WIDTH,
                        cy = oy-HEXAGON_SIZE/2,
                        cell = world.map[y][x],
                        area = {
                            id:"area-"+cell.id,
                            x:ox,
                            y:oy-HEXAGON_HEIGHT,
                            width:HEXAGON_DIAGONAL_WIDTH*2,
                            height:HEXAGON_HEIGHT+HEXAGON_DIAGONAL_HEIGHT,
                            cx:cx,
                            cy:cy
                        };

                    if (!colors)
                        mapHotspots.push(area);

                    colorSlice(ctx,random,colors,area,cell,"W",ox, oy, ox, oy-HEXAGON_SIZE);
                    colorSlice(ctx,random,colors,area,cell,"NW", ox, oy-HEXAGON_SIZE,cx, oy-HEXAGON_SIZE-HEXAGON_DIAGONAL_HEIGHT);
                    colorSlice(ctx,random,colors,area,cell,"NE", cx, oy-HEXAGON_SIZE-HEXAGON_DIAGONAL_HEIGHT,cx+HEXAGON_DIAGONAL_WIDTH, cy-HEXAGON_SIZE/2);
                    colorSlice(ctx,random,colors,area,cell,"E", cx+HEXAGON_DIAGONAL_WIDTH, cy-HEXAGON_SIZE/2,cx+HEXAGON_DIAGONAL_WIDTH, cy+HEXAGON_SIZE/2);
                    colorSlice(ctx,random,colors,area,cell,"SE", cx+HEXAGON_DIAGONAL_WIDTH, cy+HEXAGON_SIZE/2,cx, oy+HEXAGON_DIAGONAL_HEIGHT);
                    colorSlice(ctx,random,colors,area,cell,"SW", cx, oy+HEXAGON_DIAGONAL_HEIGHT,ox, oy);

                    ctx.strokeStyle = "#27262b";
                    ctx.lineWidth = 3;        
                    ctx.beginPath();
                    ctx.moveTo(ox, oy);
                    ctx.lineTo(ox,oy-HEXAGON_SIZE);
                    ctx.lineTo(ox+HEXAGON_DIAGONAL_WIDTH,oy-HEXAGON_SIZE-HEXAGON_DIAGONAL_HEIGHT);
                    ctx.lineTo(ox+HEXAGON_DIAGONAL_WIDTH*2,oy-HEXAGON_SIZE);
                    ctx.lineTo(ox+HEXAGON_DIAGONAL_WIDTH*2,oy);
                    ctx.lineTo(ox+HEXAGON_DIAGONAL_WIDTH,oy+HEXAGON_DIAGONAL_HEIGHT);
                    ctx.lineTo(ox,oy);
                    ctx.lineTo(ox,oy-HEXAGON_SIZE);
                    ctx.stroke();
                    ctx.closePath();

                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 8;
                    ctx.fillStyle = "#27262b";
                    ctx.textAlign = "left";
                    ctx.font = "14px Alegreya";
                    ctx.lineJoin = 'round';
                    ctx.strokeText(cell.id,ox+LABEL_DISTANCE, oy-HEXAGON_SIZE+LABEL_DISTANCE);
                    ctx.fillText(cell.id,ox+LABEL_DISTANCE, oy-HEXAGON_SIZE+LABEL_DISTANCE);
                    ctx.textAlign = "center";
                    ctx.font = "20px Alegreya";
                    let
                        prints = [],
                        coords,
                        words = cell.name[language].split(" "),
                        gap = NAME_LINEHEIGHT/4*words.length;
                    words.forEach((word,id)=>{
                        coords = [ word, ox+HEXAGON_DIAGONAL_WIDTH, oy-gap-HEXAGON_SIZE/2+(id*NAME_LINEHEIGHT), (HEXAGON_DIAGONAL_WIDTH-NAME_BORDER)*2 ];
                        ctx.strokeText(coords[0], coords[1], coords[2], coords[3]);
                        prints.push(coords);
                        
                    });
                    prints.forEach(coords=>{
                        ctx.fillText(coords[0], coords[1], coords[2], coords[3]);
                    })
                    ox+=HEXAGON_WIDTH;
                }
                oy+=HEXAGON_HEIGHT;
            }

            maps.push(canvas);

        }


        return {
            html:html,
            mapHotspots:mapHotspots,
            maps:maps
        }

    }

    let
        renderer = {
            initialize:(loadeddata)=>{
                data = loadeddata;
                data.spells.forEach(spell=>{
                    ids["spell-"+spell.id] = spell;
                })
            },
            render:(seed,language,worlddata)=>{
                return render(seed,language,worlddata);
            }
        }

    return renderer;

}
    