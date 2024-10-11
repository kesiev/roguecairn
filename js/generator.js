function Generator() {

    const
        DEBUG = {
            warn:true,
            events:false,
            bonds:false
        },
        COMPASS_DIRECTIONS = [ "NE", "E", "SE", "SW", "W", "NW" ],
        COMPASS = {
            NE:{
                half:1,
                sides:["NW","E"],
                coords:[
                    { x:1, y:-1 },    
                    { x:0, y:-1 }
                ]
            },
            E:{
                half:0,
                sides:["NE","SE"],
                coords:[
                    { x:1, y:0 },    
                    { x:1, y:0 }
                ]
            },
            SE:{
                half:1,
                sides:["E","SW"],
                coords:[
                    { x:1, y:1 },    
                    { x:0, y:1 }
                ]
            },
            SW:{
                half:0,
                sides:["SE","W"],
                coords:[
                    { x:0, y:1 },    
                    { x:-1, y:1 }
                ]
            },
            W:{
                half:1,
                sides:["SW","NW"],
                coords:[
                    { x:-1, y:0 },
                    { x:-1, y:0 }
                ]
            },
            NW:{
                half:0,
                sides:["W","NE"],
                coords:[
                    { x:0, y:-1 },    
                    { x:-1, y:-1 }
                ]
            }
        },
        ZONES={
            "0,0":"NW",
            "1,0":"N",
            "2,0":"NE",
            "0,1":"W",
            "1,1":"CENTER",
            "2,1":"CENTER",
            "3,1":"E",
            "0,2":"SW",
            "1,2":"S",
            "2,2":"SE"
        },
        NPC_ATTRIBUTES = 3,
        USE_BIOMES = 6,
        WORLD_BIOMES = 3,
        WORLD_GEOGRAPHY = 4,
        CHARACTERS_SETS = [
            { id:"firstSet", amount:5 },
            { id:"secondSet", amount:5 }
        ],
        BONDS_COUNT = 10,
        BUILDINGS_EVENTS = 4,
        PREPARATION_EVENTS = 3,
        INITIAL_EVENTS = 4,
        EVENTS = 12,
        DIFFICULTY_DENSITY = [ 0, 1, 1, 2, 2, 3, 4 ],
        DIFFICULTY = [
            {
                boss:[
                    [ "strength-midboss" ]
                ],
                midboss:[
                    [ "strength-minion" ]
                ],
                minion:[
                    [ "strength-minion" ],
                    [ "strength-minion" ]
                ]
            },{
                boss:[
                    [ "strength-midboss" ]
                ],
                midboss:[
                    [ "strength-midboss" ]
                ],
                minion:[
                    [ "strength-minion" ],
                    [ "strength-minion" ]
                ]
            },{
                boss:[
                    [ "strength-boss" ]
                ],
                midboss:[
                    [ "strength-midboss" ]
                ],
                minion:[
                    [ "strength-minion" ],
                    [ "strength-minion" ]
                ]
            },{
                boss:[
                    [ "strength-boss" ],
                    [ "strength-midboss" ]
                ],
                midboss:[
                    [ "strength-midboss" ]
                ],
                minion:[
                    [ "strength-minion" ],
                    [ "strength-minion" ]
                ]
            },{
                boss:[
                    [ "strength-boss" ]
                ],
                midboss:[
                    [ "strength-midboss" ]
                ],
                minion:[
                    [ "strength-midboss" ],
                    [ "strength-minion" ]
                ]
            }
        ],
        ENCOUNTERS_DENSITY = [ 0, 1, 1, 1, 2 ,2 ],
        ENCOUNTERS=[
            [
                { dice:"1", type:"minion" },
                { dice:"2-3", type:"minion" },
                { dice:"4-6", type:"entities" }
            ],[
                { dice:"1-2", type:"minion" },
                { dice:"3-4", type:"minion" },
                { dice:"5-6", type:"entities" }
            ],[
                { dice:"1-3", type:"minion" },
                { dice:"4-5", type:"minion" },
                { dice:"6", type:"entities" }
            ]
        ],
        MAP_WIDTH = 4,
        MAP_HEIGHT = 3,
        PERSON_TYPES = [ "commoner", "professional" ],
        PERSON_ATTRIBUTES = [ "physique", "skin", "hair", "face", "speech", "clothing", "virtue", "vice", "reputation", "misfortunes" ];

    function load(data,cb,out,id) {
        if (!id) {
            id=0;
            out={};
        }
        if (data[id]) {
            const
                xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState == 4)
                    if ((xmlhttp.status == 200) || (xmlhttp.status == 0)) {
                        switch (data[id].type) {
                            case "json":{
                                let
                                    destination = out[data[id].id],
                                    parsed = JSON.parse(xmlhttp.responseText);
                                if (destination)
                                    parsed.forEach(item=>destination.push(item));
                                else
                                    out[data[id].id] = parsed;
                                break;
                            }
                            default:{
                                out[data[id].id] = xmlhttp.responseText;
                            }
                        }
                        load(data,cb,out,id+1);
                    }
            };
            xmlhttp.open("GET", data[id].file, true);
            xmlhttp.send();
        } else cb(out);
    }
    
    function clone(e) {
        return JSON.parse(JSON.stringify(e));
    }

    function matchTags(t1,t2) {
        let
            ok = true;
        t1.forEach(tag=>{
            if (t2.indexOf(tag) == -1)
                ok = false;
        });
        return ok;
    }

    function capitalize(text) {
        return text[0].toUpperCase()+text.substr(1,text.length);
    }
        
    function pickRequirements(random,requirements,entities) {
        let
            found = {},
            used = [];

        for (let k in requirements) {
            let
                candidates = [],
                requirement = requirements[k];
            entities.forEach(entity=>{
                if (used.indexOf(entity) == -1) {
                    if (matchTags(requirement,entity.tags))
                        candidates.push(entity);
                }
            });
            if (candidates.length) {
                let
                    pick = random.element(candidates);
                found[k] = pick;
                used.push(pick);
            } else
                return false;
        }
        return found;
    }

    function generateNpc(random) {
        let
            entity = {
                type:"person",
                hp:0,
                str:0,
                dex:0,
                wil:0,
                attributes:[],
                tags:[],
                notes:[]
            };

        entity.hp = 1+random.integer(6);

        for (let k=0;k<3;k++) {
            entity.str += 1+random.integer(6);
            entity.dex += 1+random.integer(6);
            entity.wil += 1+random.integer(6);
        }

        return entity;
    }

    function addAttributes(random,data,bags,entity,attributes) {
        let
            count = 0,
            attribute,
            doneAttributes = {};

        do {

            attribute = bags[attributes].pick();
            if (!doneAttributes[attribute]) {
                doneAttributes[attribute] = 1;
                entity.attributes.push(random.element(data.characters.attributes[attribute]).attribute);
                count++;
            }

        } while (count < NPC_ATTRIBUTES)

    }

    function setFoundAt(entity,place) {
        if (entity.foundAt) {
            if (DEBUG.warn) console.warn("item already placed",entity.name.EN,"was",entity.foundAt.id,"asked",place.id);
        } else {

            entity.foundAt = place;

            if (entity.contains)
                setFoundAt(entity.contains,place);

            if (entity.owning)
                entity.owning.forEach(entity=>{
                    setFoundAt(entity,place);
                })

        }
    }

    function addEvents(random,data,bonds,entities,bags,ids,count,tags) {
        
        let
            availableEvents = [],
            loop = !count,
            togo = count,
            added = true;

        do {

            if (availableEvents.length == 0) {
                if (added) {
                    availableEvents = data.events.filter(e=>matchTags(tags,e.tags));
                    added = false;
                } else
                    break;
            }

            let
                candidates = [];
            availableEvents.forEach((event,id)=>{
                let
                    requirements = pickRequirements(random,event.entities,entities);
                if (requirements)
                    candidates.push({
                        id:id,
                        entities:requirements,
                        event:event
                    });
            });
            if (candidates.length) {
                let
                    candidate = random.element(candidates),
                    event = candidate.event,
                    eventEntities = candidate.entities;

                event.perform.forEach(eventset=>{
                    let
                        event = random.element(eventset),
                        entity = eventEntities[event.asEntity],
                        pick = event.pick;

                    if (pick) {
                        if (pick == "person")
                            pick = bags.personTypes.pick();

                        if (pick == "fragment") {
                            let
                                fragment = ids.fragment++;
                            for (let i=0;i<event.fragments;i++) {
                                entity = {
                                    type:"fragment",
                                    tags:[ "pickable" ],
                                    fragmentId:fragment+"-"+(i+1)
                                };
                                eventEntities[event.asEntity+"-"+(i+1)] = entity;
                                entities.push(entity);
                            }
                        } else {
                            switch (pick) {
                                case "spellbook":{
                                    entity = {
                                        type:"spellbook",
                                        tags:[ "pickable", "item-spellbook", "closable" ],
                                        spell:clone(bags.spell.pick(event.tags))
                                    };
                                    break;
                                }
                                case "spellscroll":{
                                    entity = {
                                        type:"spellscroll",
                                        tags:[ "pickable", "item-spellscroll", "closable" ],
                                        spell:clone(bags.spell.pick(event.tags))
                                    };
                                    break;
                                }
                                case "hideout":
                                case "container":{
                                    entity = {
                                        type:pick,
                                        tags:[ "item-container" ],
                                        attributes:[ ],
                                        containerId:ids[pick]++,
                                        openedBy:[],
                                        contains:eventEntities[event.contains]
                                    };
                                    if (event.openedBy)
                                        event.openedBy.forEach(key=>{
                                            entity.openedBy.push(eventEntities[key]);
                                            eventEntities[key].opens = entity;
                                        })
                                    if (pick == "container") {
                                        entity.tags.push("pickable");
                                        entity.attributes.push(data.tags.labels.bulky);
                                    }
                                    break;
                                }
                                case "building":{
                                    entity = {
                                        type:"building",
                                        tags:[ "building", "place" ],
                                        entities:[ ],
                                        name:random.element(event.name),
                                        notes:[ ]
                                    };
                                    if (event.entities && event.entities.length)
                                        random.element(event.entities).forEach(item=>{
                                            entity.entities.push(bags[item.pick].pick(item.tags));
                                        });
                                    break;
                                }
                                case "key":{
                                    entity = {
                                        type:"key",
                                        tags:[ "pickable", "item-container" ],
                                        keyId:ids.key++
                                    };
                                    break;
                                }
                                case "coins":{
                                    entity = {
                                        type:"coins",
                                        tags:[ "pickable", "closable" ],
                                        amount:event.amount
                                    };
                                    break;
                                }
                                case "professional":{
                                    
                                    let
                                        picked = clone(bags[pick].pick(event.tags));

                                    entity = generateNpc(random);

                                    for (let k in picked)
                                        entity[k] = picked[k];

                                    addAttributes(random,data,bags,entity,"personAttributes");

                                    break;
                                }
                                case "commoner":{
                                    
                                    let
                                        picked = clone(bags[pick].pick(event.tags));

                                    entity = generateNpc(random);
                                    addAttributes(random,data,bags,entity,"personAttributes");

                                    entity.tags.push("person");
                                    entity.tags.push("item-commoner");
                                    entity.name = {};
                                    
                                    for (let k in picked.attribute)
                                        entity.name[k] = capitalize(picked.attribute[k]);

                                    break;
                                }
                                case "beast":{
                                    entity = clone(bags.beast.pick(event.beast));
                                    break;
                                }
                                default:{
                                    entity = clone(bags[pick].pick(event.tags));
                                }
                            }
                            eventEntities[event.asEntity] = entity;
                            entities.push(entity);
                        }
                    }
                    if (event.addBond)
                        bonds.push(event.addBond.map(bond=>bond.map(sentence=>{
                            return {
                                sentence:sentence.sentence,
                                postSentence:sentence.postSentence,
                                value:eventEntities[sentence.value.entity]
                            }
                        })))
                    if (event.add) {
                        let
                            element = {};
                        for (let k in event.add.element)
                            if (event.add.element[k].entity) {
                                let
                                    addEntity = eventEntities[event.add.element[k].entity];
                                element[k] = addEntity;
                                if (event.add.element[k].own) {
                                    addEntity.ownedBy = entity;
                                    if (!entity.owning) entity.owning = [];
                                    entity.owning.push(addEntity);
                                    if (entity.foundAt)
                                        setFoundAt(addEntity,entity.foundAt);
                                }
                            } else
                                element[k] = event.add.element[k];
                        entity[event.add.to].push(element);
                    }
                    if (event.placeEntity) {
                        let
                            placed = eventEntities[event.placeEntity];

                        setFoundAt(placed,entity.foundAt || entity);
                        entity.entities.push(placed);
                    }
                    if (event.ban) {
                        let
                            index = entities.indexOf(entity);
                        if (index != -1)
                            entities.splice(index,1);
                        else if (DEBUG.warn) console.warn("can't find",entity);
                    }
                });

                if (DEBUG.events) console.log(event._,eventEntities);

                availableEvents.splice(candidate.id,1);
                togo--;
                added = true;
                
            } else
                availableEvents.length = 0;

        } while (loop || togo);

    }

    function rollItem(random,data,character,table) {

        let
            set = data.characters.items[table],
            found;

        if (set[0].to) {
            let
                roll = 1+random.integer(set[set.length-1].to);
            set.forEach(item=>{
                if ((roll>=item.from) && (roll<=item.to))
                    found = item;
            })
        } else
            found = random.element(set);

        if (found) {
            
            if (found.items)
                found.items.forEach(item=>{
                    addItemToCharacter(item,character);
                })
            if (found.randomItems) {
                let
                    items = random.element(found.randomItems);
                items.forEach(item=>{
                    addItemToCharacter(item,character);
                })
            }
        }

        return found;
    }

    function generateSpellbook(random,data,character) {
        let
            spell = clone(random.element(data.spells));
        addItemToCharacter({
            type:"spellbook",
            spell:spell,
            notes:[
                {
                    key:spell.name,
                    value:spell.description
                }
            ]
        },character);
    }

    function addItemToCharacter(item,character) {
        let
            newitem = clone(item);

        if (item.randomSpell) {
            let
                spell = clone(random.element(data.spells));
            newitem.spell = spell;
            character.notes.push({
                key:spell.name,
                value:spell.description
            })
        }

        character.inventory.push(newitem)

        if (item.armor)
            character.armor+=item.armor;

        if (item.notes)
            item.notes.forEach(note=>{
                character.notes.push(note);
            })
    }

    function generateCharacter(random,classdata,background,omens,bonds) {
        let
            gold = 0,
            extra = 1+random.integer(20),
            character = {
                armor:0,
                inventory:[],
                notes:[],
            };

        for (let k in data.characters.base)
            character[k] = random.element(data.characters.base[k]);

        for (let k in data.characters.attributes)
            character[k] = random.element(data.characters.attributes[k]).description;

        if (background) {

            if (background.names)
                character.fullName = random.element(background.names);

            if (background.background)
                character.backgroundDescription = background.background;

            if (background.className)
                character.className = background.className;

            if (background.exportData)
                character.exportData = background.exportData;

        }

        character.age = 10;
        character.age += random.integer(20);
        character.age += random.integer(20);

        character.hp = 1+random.integer(6);
        
        [
            "str", "dex", "wil"
        ].forEach(stat=>{
            character[stat] = 1+random.integer(6);
            character[stat] += 1+random.integer(6);
            character[stat] += 1+random.integer(6);
        });

        gold += 1+random.integer(6);
        gold += 1+random.integer(6);
        gold += 1+random.integer(6);
    
        if (classdata) {

            addItemToCharacter({ description:data.tags.labels.rations },character);
            addItemToCharacter({ description:data.tags.labels.torch },character);

            character.className = classdata.className;

            classdata.items.forEach(item=>{
                if (item.type === undefined)
                    addItemToCharacter(item,character);
                else switch (item.type) {
                    case "spellbook":{
                        generateSpellbook(random,data,character);
                        break;
                    }
                    case "item":{
                        addItemToCharacter(item,character);
                        break;
                    }
                    default:{
                        debugger;
                    }
                }
            });

        } else if (background) {

            background.items.forEach(item=>{
                addItemToCharacter(item,character);
            });

            character.extras = [];

            background.tables.forEach(table=>{
                let
                    selected = random.element(table.values);

                character.extras.push({
                    key:table.key,
                    value:selected.description
                });

                if (selected.items)
                    selected.items.forEach(item=>{
                        addItemToCharacter(item,character)
                    })
            });

        } else {

            addItemToCharacter({ description:data.tags.labels.rations },character);
            addItemToCharacter({ description:data.tags.labels.torch },character);

            [
                "armor", "helmetShield", "weapon", "expeditionaryGear",
                "tool", "trinket"
            ].forEach(table=>{
                rollItem(random,data,character,table);
            });

            if (extra>=1 && extra<=5)
                rollItem(random,data,character,random.element([ "tool", "trinket" ]));
            else if (extra>=6 && extra<=13)
                rollItem(random,data,character,"expeditionaryGear");
            else if (extra>=14 && extra<=17) {
                let
                    options = [ "weapon" ];

                if (!character.armor) options.push("armor");

                rollItem(random,data,character,random.element(options));
            } else
                generateSpellbook(random,data,character);

        }

        if (omens)
            character.omens = [ random.element(omens) ];

        if (bonds) {
            
            let
                bond = random.element(bonds);

            character.bonds = [ bond.description ];

            if (bond.gold)
                gold += bond.gold;

            if (bond.items)
                bond.items.forEach(item=>{
                    addItemToCharacter(item,character);
                })

        }

        addItemToCharacter({ type:"coins", amount:gold },character);

        if (character.armor > 3)
            character.armor = 3;

        return character;
    }

    function sortBiomes(list) {
        list.sort((a,b)=>{
            if (a.tag > b.tag) return 1;
            else if (a.tag < b.tag) return -1;
            else return 0;
        })
    }

    function generate(settings,seed) {

        let
            random = new Random(seed),
            charactersRandom = new Random(seed),
            difficultyDensities = new random.Bag(DIFFICULTY_DENSITY),
            encountersDensities = new random.Bag(ENCOUNTERS_DENSITY),
            world = new HexMap(random,MAP_WIDTH,MAP_HEIGHT),
            usedBiomes = [],
            bags={
                personAttributes:new random.Bag(PERSON_ATTRIBUTES),
                personTypes:new random.Bag(PERSON_TYPES),
                beast:new random.Bag(data.bestiary),
                allBiomes:new random.Bag(data.biomes),
                biome:0,
                relic:new random.Bag(data.relics),
                spell:new random.Bag(data.spells),
                professional:new random.Bag(data.people),
                commoner:new random.Bag(data.characters.attributes.background),
                item:new random.Bag(data.items)
            },
            ids={
                key:1,
                container:1,
                fragment:1,
                hideout:1
            },
            biomeStats = { map:{}, hits:{}, geography:{}, chart:[], geographyChart:[] },
            allBonds = [],
            bonds = [],
            entities = [];

        if (DEBUG.events) console.warn("SEED:",seed);

        data.biomes.forEach(biome=>{
            biome.namesBag = new random.Bag(biome.names);
            biome.adjectivesBag = new random.Bag(biome.adjectives);
        });

        for (let i=0;i<USE_BIOMES;i++)
            usedBiomes.push(bags.allBiomes.pick());

        bags.biome = new random.Bag(usedBiomes);
        
        bags.biome.ban("biome-any");
        world.applyBag(bags.biome,"biome",2,1);
        world.applyBag(difficultyDensities,"difficultyDensity");
        world.applyBag(encountersDensities,"encounterDensity");

        world.stats = {
            biomes:[],
            geography:[]
        };

        world.cells.forEach(cell=>{
            let
                zone = ZONES[cell.id],
                usedBiomes = [];
                
            cell.compass = {};
            cell.uniqueBiomes = [];
            cell.allBiomes = [];
            cell.keepBiomes = [];
            cell.keepBiomesDirections = [];

            cell.biome.elements.forEach(biome=>{
                
                cell.uniqueBiomes.push(biome);
                cell.allBiomes.push(biome);
                usedBiomes.push(biome);

                if (!biomeStats.hits[biome.tag]) {
                    biomeStats.hits[biome.tag] = 1;
                    biomeStats.geography[biome.tag] = { count:0, items:{}, zones:[] };
                    biomeStats.map[biome.tag] = biome;
                } else
                    biomeStats.hits[biome.tag]++;

                biomeStats.geography[biome.tag].count++;
                if (!biomeStats.geography[biome.tag].items[zone]) {
                    biomeStats.geography[biome.tag].items[zone] = true;
                    biomeStats.geography[biome.tag].zones.push(zone);
                }
            })

            for (let k in COMPASS) {
                let
                    sharedBiomes = [],
                    coord = COMPASS[k].coords[cell.y%2],
                    dx = cell.x + coord.x,
                    dy = cell.y + coord.y,
                    destCell = world.map[dy] ? world.map[dy][dx] : 0;

                cell.compass[k] = {
                    cell:destCell,
                    sharedBiomes:sharedBiomes
                };

                if (destCell)
                    cell.biome.elements.forEach(biome=>{
                        if (destCell.biome.elements.indexOf(biome) != -1) {
                            let
                                inUnique = cell.uniqueBiomes.indexOf(biome),
                                inKeepBiomes = cell.keepBiomes.indexOf(biome);
                            sharedBiomes.push(biome);
                            if (inUnique != -1)
                                cell.uniqueBiomes.splice(inUnique,1);
                            if (inKeepBiomes == -1) {
                                cell.keepBiomes.push(biome);
                                cell.keepBiomesDirections.push([ k ]);
                            } else
                                cell.keepBiomesDirections[inKeepBiomes].push(k);
                        }
                    })

                sortBiomes(sharedBiomes);
            }

            sortBiomes(cell.uniqueBiomes);
            sortBiomes(cell.allBiomes);

            // --- Set biomes to adjacent hexes

            for (let k in COMPASS)
                cell.compass[k].biome = cell.compass[k].sharedBiomes[0];

            // --- Join adjacent biomes on the same hex

            for (let k in COMPASS) {

                let
                    usedBiomeIndex;

                if (!cell.compass[k].biome) {
                    let
                        side1 = cell.compass[COMPASS[k].sides[0]].biome,
                        side2 = cell.compass[COMPASS[k].sides[1]].biome;
                    if (side1 && (side1 == side2))
                        cell.compass[k].biome = side1;
                    else
                        cell.compass[k].biome = cell.uniqueBiomes[COMPASS[k].half%cell.uniqueBiomes.length] || cell.allBiomes[COMPASS[k].half];
                }

                usedBiomeIndex = usedBiomes.indexOf(cell.compass[k].biome);
                if (usedBiomeIndex != -1)
                    usedBiomes.splice(usedBiomeIndex,1);

            }

            // --- Makes sure all biomes are displayed in a hex

            if (usedBiomes.length) {
                
                let
                    directionsBag = new random.Bag(COMPASS_DIRECTIONS);
                usedBiomes.forEach(biome=>{
                    let
                        direction = directionsBag.pick();
                    cell.compass[direction].biome = biome;
                })
                
            }

        });

        for (let k in biomeStats.hits)
            biomeStats.chart.push({ biome:biomeStats.map[k], value:biomeStats.hits[k]});

        biomeStats.chart.sort((a,b)=>{
            if (a.value > b.value) return -1;
            else if (a.value < b.value) return 1;
            else return 0;
        });

        for (let i=0;i<WORLD_BIOMES;i++) {
            if (
                (!i) ||
                (!biomeStats.chart[i+1] || (biomeStats.chart[i].value != biomeStats.chart[i+1].value)
            )) {
                world.stats.biomes.push(biomeStats.chart[i].biome);
                delete biomeStats.geography[biomeStats.chart[i].biome.tag];
            }
        }

        for (let k in biomeStats.geography)
            biomeStats.geographyChart.push({ biome:biomeStats.map[k], value:biomeStats.geography[k].count, zones:biomeStats.geography[k].zones });

        random.shuffle(biomeStats.geographyChart);

        biomeStats.geographyChart.sort((a,b)=>{
            if (a.value > b.value) return -1;
            else if (a.value < b.value) return 1;
            else return 0;
        });

        for (let i=0;i<WORLD_GEOGRAPHY;i++)
            if (biomeStats.geographyChart[i])
                world.stats.geography.push({ biome:biomeStats.geographyChart[i].biome, zones:biomeStats.geographyChart[i].zones });

        world.cells.forEach(cell=>{
            let
                difficulty = DIFFICULTY[cell.difficultyDensity.elements[0]],
                encounters = ENCOUNTERS[cell.encounterDensity.elements[0]],
                cellBags = {};

            cell.names = {
                name:cell.biome.elements[0].namesBag.pick(),
                adjective:cell.biome.elements[1].adjectivesBag.pick()
            };

            cell.name = {};

            cell.entities = [];

            cell.tags = [ "environment", "place" ];
            cell.biome.elements.forEach(biome=>{
                if (cell.tags.indexOf(biome.tag) == -1)
                    cell.tags.push(biome.tag)
            });

            data.tags.languages.forEach(languagedata=>{
                let
                    language = languagedata.id;
                switch (language) {
                    case "IT":{
                        cell.name[language] = capitalize(cell.names.name[language][0]+" "+cell.names.adjective[language][cell.names.name[language][1]]);
                        break;
                    }
                    case "EN":{
                        cell.name[language] = capitalize(cell.names.adjective[language][0]+" "+cell.names.name[language][0]);
                        break;
                    }
                }
            });

            for (let k in difficulty) {
                cell[k] = difficulty[k].map(set=>{
                    let
                        beast;

                    beast = clone(bags.beast.pick([
                        [
                            [
                                cell.biome.elements[0].tag,
                                cell.biome.elements[1].tag,
                                ...set
                            ]
                        ],[
                            [
                                cell.biome.elements[0].tag,
                                ...set
                            ],[
                                cell.biome.elements[1].tag,
                                ...set
                            ]
                        ],[
                            [
                                "biome-any",
                                ...set
                            ]
                        ]
                    ]));
                    beast.foundAt = cell;
                    entities.push(beast);
                    return beast;
                });
                cellBags[k] = new random.Bag(cell[k]);
            }

            cell.encounters = encounters.map(encounter=>{
                let
                    out = {
                        dice:encounter.dice,
                        type:encounter.type
                    };
                if (cellBags[encounter.type])
                    out.beast = cellBags[encounter.type].pick();
                return out;
            });

            entities.push(cell);

        });

        // --- Apply events

        if (DEBUG.events) console.log("::","Buildings")
        addEvents(random,data,allBonds,entities,bags,ids,BUILDINGS_EVENTS,[ "event-buildings" ]);
        if (DEBUG.events) console.log("::","Preparation")
        addEvents(random,data,allBonds,entities,bags,ids,PREPARATION_EVENTS,[ "event-preparation" ]);
        if (DEBUG.events) console.log("::","Initial")
        addEvents(random,data,allBonds,entities,bags,ids,INITIAL_EVENTS,[ "event-initial" ]);
        if (DEBUG.events) console.log("::","Once")
        addEvents(random,data,allBonds,entities,bags,ids,1,[ "event-once" ]);
        if (DEBUG.events) console.log("::","EVENTS")
        addEvents(random,data,allBonds,entities,bags,ids,EVENTS,[ "event-base" ]);
        if (DEBUG.events) console.log("::","Final")
        addEvents(random,data,allBonds,entities,bags,ids,0,[ "event-finalizer" ]);
        
        // --- Characters

        let
            characters = [],
            classBag = new random.Bag(data.characters.classes),
            backgroundBag = new random.Bag(data.backgrounds);

        CHARACTERS_SETS.forEach(set=>{
            let
                type = settings[set.id];

            for (let i=0;i<set.amount;i++) {
                switch (type) {
                    case 1:{
                        // 1ed classless.
                        characters.push(generateCharacter(charactersRandom));
                        break;
                    }
                    case 2:{
                        // 1ed with classes.
                        characters.push(generateCharacter(charactersRandom,classBag.pick()));
                        break;
                    }
                    case 3:{
                        // 2 ed classless.
                        characters.push(generateCharacter(charactersRandom,0,0,data.omens,data.bonds));
                        break;
                    }
                    case 4:{
                        // 2 ed with class.
                        characters.push(generateCharacter(charactersRandom,classBag.pick(),0,data.omens,data.bonds));
                        break;
                    }
                    case 5:{
                        // 2 ed with backgrounds.
                        characters.push(generateCharacter(charactersRandom,0,backgroundBag.pick(),data.omens,data.bonds));
                        break;
                    }
                }
            }

        });

        // --- Bonds

        if (DEBUG.bonds)
            allBonds.forEach(bond=>{
                bond.forEach(version=>{
                    bonds.push(version);
                })
            })
        else
            for (let i=0;i<BONDS_COUNT;i++)
                if (allBonds.length) {
                    let
                        bond = random.removeElement(allBonds);
                    bonds.push(random.element(bond));
                }

        return {
            world:world,
            characters:characters,
            bonds:bonds
        }

    }

    let
        data,
        generator = {
            initialize:(done)=>{
                load([
                    {
                        id:"options",
                        type:"json",
                        file:"databases/options.json"
                    },
                    {
                        id:"bestiary",
                        type:"json",
                        file:"databases/bestiary.json"
                    },{
                        id:"tags",
                        type:"json",
                        file:"databases/tags.json"
                    },{
                        id:"spells",
                        type:"json",
                        file:"databases/spells.json"
                    },{
                        id:"items",
                        type:"json",
                        file:"databases/items.json"
                    },{
                        id:"relics",
                        type:"json",
                        file:"databases/relics.json"
                    },{
                        id:"biomes",
                        type:"json",
                        file:"databases/biomes.json"
                    },{
                        id:"events",
                        type:"json",
                        file:"databases/events-preparation.json"
                    },{
                        id:"events",
                        type:"json",
                        file:"databases/events-poi.json"
                    },{
                        id:"events",
                        type:"json",
                        file:"databases/events-initial.json"
                    },{
                        id:"events",
                        type:"json",
                        file:"databases/events-once.json"
                    },{
                        id:"events",
                        type:"json",
                        file:"databases/events.json"
                    },{
                        id:"people",
                        type:"json",
                        file:"databases/people.json"
                    },{
                        id:"characters",
                        type:"json",
                        file:"databases/characters.json"
                    },{
                        id:"backgrounds",
                        type:"json",
                        file:"databases/backgrounds.json"
                    },{
                        id:"omens",
                        type:"json",
                        file:"databases/omens.json"
                    },{
                        id:"bonds",
                        type:"json",
                        file:"databases/bonds.json"
                    },{
                        id:"about",
                        type:"text",
                        file:"README.md"
                    }
                ],(loaded)=>{
                    data = loaded;
                    done(data);
                })
            },
            generate:(settings,seed)=>{
                return generate(settings,seed);
            }
        }

    return generator;

}
