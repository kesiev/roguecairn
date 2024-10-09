function Random(seed) {

    const
        DEBUG = false;

    function random(max) {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    }

    function shuffle(list) {
        for (let j=0;j<3;j++)
            for (let i=0;i<list.length;i++) {
                let
                    dest = Math.floor(random(list.length)),
                    tmp = list[i];
                list[i] = list[dest];
                list[dest] = tmp;
            }
    }

    function pickRandomElementId(list) {
        return Math.floor(random(list.length));
    }

    function pickRandomElementValue(list) {
        return list[pickRandomElementId(list)];
    }

    let
        self = {
            float:()=>{
                return random()
            },
            integer:(value)=>{
                return Math.floor(random()*value);
            },
            bool:()=>{
                return random()>0.5;
            },
            elementIndex:(list)=>{
                return Math.floor(random()*list.length);
            },
            element:(list)=>{
                return list[self.elementIndex(list)];
            },
            shuffle:(list)=>{
                shuffle(list)
            },
            removeElement:(list)=>{
                let
                    id = self.elementIndex(list);
                return list.splice(id,1)[0];
            },
            Bag:function(list) {
                let
                    bag = {
                        list:list,
                        indexes:[],
                        banned:{},
                        ban:(item)=>{
                            let
                                pos = bag.list.indexOf(item);
                            if (pos != -1) {
                                let
                                    indexesPos = bag.indexes.indexOf(pos);
                                bag.banned[pos] = true;
                                if (indexesPos != -1)
                                    bag.indexes.splice(indexesPos,1);
                            }
                        },
                        reset:()=>{
                            bag.indexes.length = 0;
                            for (let i=0;i<bag.list.length;i++)
                                if (!bag.banned[i])
                                    bag.indexes.push(i);
                        },
                        pick:(tags)=>{
                            if (bag.indexes.length == 0)
                                bag.reset();

                            if (tags) {
                                do {
                                    for (let i=0;i<tags.length;i++) {
                                        let
                                            sets = tags[i].slice();
                                        while (sets.length) {
                                            let
                                                set = self.removeElement(sets),
                                                availableIndexes = [];
                                            bag.indexes.forEach(index=>{
                                                let
                                                    add = false,
                                                    item = list[index];
                                                if (item.tags) {
                                                    add = true;
                                                    set.forEach(tag=>{
                                                        if (item.tags.indexOf(tag) == -1)
                                                            add = false;
                                                    });
                                                    if (add)
                                                        availableIndexes.push(index);
                                                }
                                            });
                                            if (availableIndexes.length) {
                                                let
                                                    index = self.element(availableIndexes);
                                                bag.indexes.splice(bag.indexes.indexOf(index),1);
                                                return bag.list[index];
                                            }
                                        }
                                    }
                                    if (DEBUG) console.warn("Bag broken");
                                    bag.reset();
                                } while (true);
                            } else
                                return list[self.removeElement(bag.indexes)];
                        }
                    };
                return bag;
            }
        };

    return self;

}