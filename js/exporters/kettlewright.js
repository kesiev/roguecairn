ExporterKettleWright = {
    character:(renderSettings,character,traits)=>{
        let
            language = renderSettings.language,
            itemId = 0,
            containerId = 1,
            name = character[character.nameType]+" "+character.surname,
            out = {
                name:name,
                custom_name:name,
                background:"none",
                custom_background:"none",
                strength:character.str,
                strength_max:character.str,
                dexterity:character.dex,
                dexterity_max:character.dex,
                willpower:character.wil,
                willpower_max:character.wil,
                hp:character.hp,
                hp_max:character.hp,
                gold:0,
                description:"",
                bonds:"",
                omens:"",
                scars:"",
                notes:"",
                traits:traits,
                items:[],
                containers:[
                    {
                        name: "Main",
                        slots: 10,
                        id: 0
                    }
                ],
                custom_image: false,
                image_url: "default-portrait.webp",
                deprived: false,
            };

        if (character.className) {
            out.background = character.className[language];
            out.custom_background = character.className[language];
        }

        character.inventory.forEach(element=>{
            switch (element.type) {
                case "item":{
                    let
                        slots,
                        matches,
                        notes  = [],
                        description = [],
                        item = {
                            name:element.name[language],
                            tags:[],
                            description:"",
                            location:0,
                            added_by:"background",
                            id:itemId
                        };

                    if (element.spell)
                        item.name+=": "+element.spell.name[language];
                    
                    if (element.hp)
                        renderSettings.stats.forEach(stat=>{
                            if (element[stat.key])
                                notes.push(element[stat.key]+" "+stat.shortLabel[language]);
                        });

                    if (element.attributes)
                        element.attributes.forEach(attribute=>{
                            if (matches = attribute.EN.match(/([0-9]+) slots$/)) {
                                slots = parseInt(matches[1]);
                            } else if (matches = attribute.EN.match(/^([0-9]+) Armor$/)) {
                                item.tags.push(matches[1]+" Armor");
                            } else if (matches = attribute.EN.match(/^\+([0-9]+) Armor$/)) {
                                item.tags.push(matches[1]+" Armor");
                                item.tags.push("bonus defense");
                            } else if (matches = attribute.EN.match(/^(d[0-9]+) damage$/)) {
                                item.tags.push(matches[1]);
                            } else if (matches = attribute.EN.match(/^(d[0-9]+)\+(d[0-9]+) damage$/)) {
                                item.tags.push(matches[1]+" + "+matches[2]);
                            } else if (matches = attribute.EN.match(/^([0-9]+) uses*$/)) {
                                item.uses = parseInt(matches[1]);
                                item.tags.push("uses");
                            } else
                                switch (attribute.EN) {
                                    case "bulky":{
                                        item.tags.push("bulky");
                                        break;
                                    }
                                    default:{
                                        description.push(attribute[language]);
                                    }
                                }
                        });

                    if (element.charges && element.charges.label) {
                        switch (element.charges.label.EN) {
                            case "use":
                            case "uses":{
                                item.uses = parseInt(element.charges.value);
                                item.tags.push("uses");
                                break;
                            }
                            case "charge":
                            case "charges":{
                                item.charges = parseInt(element.charges.value);
                                item.max_charges = parseInt(element.charges.value);
                                item.tags.push("charges");
                                break;
                            }
                            default:{
                                console.warn(element.charges.label.EN);
                            }
                        }
                    }

                    if (notes.length)
                        description.unshift(notes.join(", "));

                    if (description.length)
                        item.description = description.join("\n");

                    if (slots) {

                        out.containers.push({
                            name: item.name,
                            slots: slots,
                            id: containerId
                        });

                        containerId++;

                    } else {
                    
                        out.items.push(item);
                        itemId++;

                    }
                    break;
                }
                case "coins":{
                    out.gold += element.amount;
                    break;
                }
                case "spellbook":{
                    let
                        item = {
                            name:renderSettings.labels.spellbook[language]+": "+element.spell.name[language],
                            tags:[],
                            description:"",
                            location:0,
                            added_by:"background",
                            id:itemId
                        };
                    
                    out.items.push(item);
                    itemId++;
                    break;
                }
                default:{
                    if (element.description.EN == "Three days' rations") {
                        out.items.push({
                            name:renderSettings.labels.ration[language],
                            tags:[ "uses" ],
                            uses:3,
                            description:"",
                            location:0,
                            added_by:"background",
                            id:itemId
                        });
                        itemId++;
                    } else  {
                        out.items.push({
                            name:element.description[language],
                            tags:[],
                            description:"",
                            location:0,
                            added_by:"background",
                            id:itemId
                        });
                        itemId++;
                    }
                    break;
                }
            }
        });

        return out;
    
    }
}