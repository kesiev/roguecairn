function Frontend() {

    const
        AREA_MARGIN_X = 0,
        AREA_MARGIN_Y = 40,
        LOCALSTORAGE_LANGUAGE = "ROGUECAIRN_LANG",
        LOCALSTORAGE_NOTICE = "ROGUECAIRN_NOTICE",
        LOCALSTORAGE_MAPVERSION = "ROGUECAIRN_MAPVERSION",
        SUPPORTED_LANGUAGES = {},
        SEED_LIMIT = 1000000;

    let
        data,
        language,
        notice,
        seed;

    function loadLanguage() {
        let
            loadedLanguage = localStorage[LOCALSTORAGE_LANGUAGE],
            language = "EN",
            userLang = navigator.language || navigator.userLanguage;
        
        if (SUPPORTED_LANGUAGES[loadedLanguage])
            language = loadedLanguage;
        else if (userLang) {
            userLang=userLang.split("-")[0].toUpperCase();
            if (SUPPORTED_LANGUAGES[userLang] !== undefined) language=userLang;
        }
        localStorage[LOCALSTORAGE_LANGUAGE] = language;
        return language;
    }

    function loadNotice() {
        return !!localStorage[LOCALSTORAGE_NOTICE];
    }

    function setSeed(newseed) {
        if (newseed)
            seed = parseInt(newseed);
        else
            seed = 0;
        if (seed > SEED_LIMIT) seed = 0;
        if (!seed || (seed < 0)) seed=1+Math.floor(Math.random()*SEED_LIMIT);
    }

    function renderPage(content,selected) {

        document.getElementById("out").innerHTML =
            "<div class='side-bar'>"+
                "<div class='site-header' role='banner'>"+
                    "<a href='#' class='site-title lh-tight'>"+
                    "<div class='site-logo' role='img'></div>"+
                    "</a>"+
                    "<button id='menu-button' class='site-button btn-reset' aria-label='Toggle menu' aria-pressed='false'> <svg viewBox='0 0 24 24' class='icon' aria-hidden='true'><use xlink:href='#svg-menu'></use></svg></button>"+
                "</div>"+
                "<nav id='site-nav' class='site-nav'>"+
                    "<ul class='nav-list'>"+
                        "<li id='option-generate' class='nav-list-item'><a id='option-link-generate' href='#"+seed+"' class='nav-list-link'>"+data.tags.labels.generateWorld[language]+"</a></li>"+
                        "<li id='option-about' class='nav-list-item'><a id='option-link-about' href='#about' class='nav-list-link'>"+data.tags.labels.about[language]+"</a></li>"+
                    "</ul>"+
                "</nav>"+
                "<footer class='site-footer'>"+
                    "v"+data.tags.metadata.version+" "+
                    "by <a target=_blank href='"+data.tags.metadata.authorUrl+"'>"+data.tags.metadata.author+"</a>"+
                    " &dash; "+
                    "<a target=_blank href='"+data.tags.metadata.sourcesUrl+"'>"+data.tags.labels.sources[language]+"</a>"+
                    " &dash; "+
                    data.tags.labels.footer[language]+
                "</footer>"+
            "</div>"+
            "<div class='main'>"+
                "<div id='main-header' class='main-header'>"+
                    "<div class='left-bar'>"+
                        "<span class='seedlabel'>"+data.tags.labels.worldSeed[language]+":</span>"+  
                        "<input id='seed' class='seed' type='text' placeholder='"+data.tags.labels.worldSeed[language]+"'>"+  
                    "</div>"+
                    "<div class='right-bar'>"+
                        "<input type='button' class='button' id='generate' type='text' value='"+data.tags.labels.generate[language]+"'>"+  
                        "<input type='button' class='button' id='randomseed' type='text' value='"+data.tags.labels.randomSeed[language]+"'>"+  
                        "<select id='language'>"+  
                        "</select>"+
                    "</div>"+
                "</div>"+
                "<div class='main-content-wrap'>"+
                    content+
                "</div>"+
            "</div>";

        let
            languageSelector = document.getElementById("language"),
            menuButton = document.getElementById('menu-button'),
            siteNav = document.getElementById('site-nav'),
            header = document.getElementById('main-header'),
            seedInput = document.getElementById('seed'),
            generateButton = document.getElementById('generate'),
            randomButton = document.getElementById('randomseed'),
            fakeLinks = document.getElementsByClassName('fake-link'),
            collapsers = document.getElementsByClassName('collapse-section'),
            selectedLanguage;

        data.tags.languages.forEach((languagedata,id)=>{
            let
                option = document.createElement("option");
            option.value = languagedata.id;
            option.innerHTML = languagedata.label;
            languageSelector.appendChild(option);

            if (languagedata.id == language)
                selectedLanguage = id;
        })

        languageSelector.selectedIndex = selectedLanguage;

        menuButton.onclick = ()=>{
            menuButton._pressed = !menuButton._pressed;
            if (menuButton._pressed) {
                menuButton.className = "site-button btn-reset nav-open";
                siteNav.className = "site-nav nav-open";
                header.className = 'main-header nav-open';
            } else {
                menuButton.className = "site-button btn-reset";
                siteNav.className = "site-nav";
                header.className = 'main-header';
            }
        }

        generateButton.onclick = ()=>{
            updatePage("#"+parseInt(seedInput.value));
        }

        randomButton.onclick = ()=>{
            updatePage("#");
        }

        languageSelector.onchange=()=>{
            language = languageSelector.value;
            localStorage[LOCALSTORAGE_LANGUAGE] = language;
            updatePage(document.location.hash);
        }

        seedInput.value = seed;

        document.getElementById("option-"+selected).className = "nav-list-item active";
        document.getElementById("option-link-"+selected).className = "nav-list-link active";

        for (let i=0;i<fakeLinks.length;i++)
            fakeLinks[i].onclick=()=>{
                document.getElementById(fakeLinks[i].getAttribute("link-to")).scrollIntoView();
            }

        for (let i=0;i<collapsers.length;i++)
            collapsers[i].onclick=()=>{
                let
                    section = document.getElementById(collapsers[i].getAttribute("collapse-section"));

                if (collapsers[i].closed) {
                    collapsers[i].closed = false;
                    collapsers[i].className = collapsers[i].className.replace(/ closed$/,"");
                    section.className = section.className.replace(/ closed$/,"");
                } else {
                    collapsers[i].closed = true;
                    collapsers[i].className += " closed";
                    section.className += " closed";
                }
            }

    }

    function markdownToHtml(markdown) {
        return "<p>"+markdown
            .replace(/---[^-]+---/g,"")
            .replace(/\r/g,"")
            .split("\n").map(line=>{
                return line
                    .replace(/^# ([^\n]+)/g,"")
                    .replace(/^## ([^\n]+)/g,(m,m1)=>"<h2>"+m1+"</h2>")
                    .replace(/^### ([^\n]+)/g,(m,m1)=>"<h3>"+m1+"</h3>")
                    .replace(/_([^_]+)_/g,(m,m1)=>"<em>"+m1+"</em>")
                    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,(m,m1,m2)=>"<a target=_blank href='"+m2+"'>"+m1+"</a>")
                    .replace(/\*\*([^\*]+)\*\*/g,(m,m1)=>"<b>"+m1+"</b>")
                    .replace(/^$/,"</p><p>")
                    .replace(/^ \* ([^\*]+)/g,(m,m1)=>"<ul><li>"+m1+"</li></ul>")
                    .replace(/^   \* ([^\*]+)/g,(m,m1)=>"<ul><ul><li>"+m1+"</li></ul></ul>")
                    .replace(/^     \* ([^\*]+)/g,(m,m1)=>"<ul><ul><ul><li>"+m1+"</li></ul></ul></ul>")
                    .trim()
                }).join("")
                    .replace(/<p><\/p>/g,"")
                    .replace(/<\/li><\/ul><\/ul><\/ul><ul><ul><ul><li>/g,"</li><li>")
                    .replace(/<\/li><\/ul><\/ul><ul><ul><li>/g,"</li><li>")
                    .replace(/<\/li><\/ul><ul><li>/g,"</li><li>")
                    +"</p>";
    }

    function updateMap(render,set) {
        let
            version = !!localStorage[LOCALSTORAGE_MAPVERSION];

        if (set !== undefined) {
            version = set;
            if (set)
                localStorage[LOCALSTORAGE_MAPVERSION] = 1;
            else
                delete localStorage[LOCALSTORAGE_MAPVERSION];
        }

        document.getElementById("map").innerHTML = "";
        if (version)
            document.getElementById("map").appendChild(render.maps[0]);
        else
            document.getElementById("map").appendChild(render.maps[1]);

    }

    function updatePage(hash) {
        hash = hash || document.location.hash;

        switch (hash) {
            case "#about":{
                renderPage(markdownToHtml(data.about),"about");
                history.replaceState(undefined, undefined, hash);
                break;
            }
            default:{
                let
                    world,
                    render,
                    downloaders;

                setSeed(hash.substr(1,hash.length));
                world = generator.generate(seed);
                render = renderer.render(seed,language,world);

                renderPage(
                    (
                        notice ?
                        "" :
                        "<div id='notice' class='notice'>"+
                        "<div id='notice-close' class='notice-close'>&times;</div>"+
                        data.tags.labels.notice[language]+
                        "</div>"
                    )+
                    render.html
                    ,"generate"
                );

                render.maps.forEach(map=>{
                    map.className = "map-clickable";
                    map.onclick = (e)=>{
                        let
                            ratio = map.width / map.clientWidth,
                            x = e.offsetX * ratio,
                            y = e.offsetY * ratio,
                            id;

                        render.mapHotspots.forEach(area=>{
                           if (!(
                                (x < area.x+AREA_MARGIN_X) ||
                                (x > area.x+area.width-AREA_MARGIN_X) ||
                                (y < area.y+AREA_MARGIN_Y) ||
                                (y > area.y+area.height-AREA_MARGIN_Y)
                            ))
                                id = area.id;
                        })

                        if (id)
                            document.getElementById(id).scrollIntoView();
                    }
                })

                updateMap(render);

                document.getElementById('set-map-color').onclick=()=>{ updateMap(render, false); }
                document.getElementById('set-map-bw').onclick=()=>{ updateMap(render, true); }

                history.replaceState(undefined, undefined, "#"+seed);

                dowloaders = document.getElementsByClassName('file-button');
            
                for (let i=0;i<dowloaders.length;i++)
                    dowloaders[i].onclick=()=>{
                        let
                            a = document.createElement("a");
                            fileName = dowloaders[i].getAttribute("file-name"),
                            file = render.files[fileName],
                            blob = new Blob([file.data], { type: file.mimeType }),
                            url = window.URL.createObjectURL(blob);

                        document.body.appendChild(a);
                        a.style = "display: none";
                        a.href = url;
                        a.download = fileName;
                        a.click();
                        window.URL.revokeObjectURL(url);
                    }
                
                if (!notice) {
                    let
                        notice = document.getElementById("notice");
                        closeNotice = document.getElementById("notice-close");

                    closeNotice.onclick = ()=>{
                        notice.parentNode.removeChild(notice);
                        localStorage[LOCALSTORAGE_NOTICE] = 1;
                    }
                }
                break;
            }
        }

        document.body.scrollTop = document.documentElement.scrollTop = 0;
    }

    let
        renderer = {
            initialize:(dat,gen,ren)=>{
                data = dat;
                generator = gen;
                renderer = ren;

                data.tags.languages.forEach(language=>{
                    SUPPORTED_LANGUAGES[language.id] = true;
                });

                language = loadLanguage();
                notice = loadNotice();

                setSeed();
                updatePage();
                window.onhashchange=()=>{
                    updatePage();
                }
            }
        };

    return renderer;

}