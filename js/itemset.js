function ItemSet(maxcount) {
    
    let
        index = {},
        elements = [],
        self = {
            elements:elements,
            index:index,
            add:(item)=>{
                let
                    id = item.tag || item;
                if (!index[id] || (index[id]<maxcount)) {
                    if (!index[id]) index[id]=0;
                    index[id]++;
                    elements.push(item);
                    return true;
                }
            }
        };

    return self;

}