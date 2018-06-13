function toggleNext(ele){
    var target = ele.nextSibling.style;

    var style = "none";
    if(target.display==="none"){
        style = "";
    }

    target.display = style;
}

var vAuthorship = {
    props: ["repo", "author"],
    template: $("v_authorship").innerHTML,
    data() {
        return {
            isLoaded: false,
            files: []
        };
    },

    watch: {
        repo() { this.initiate(); },
        author() { this.initiate(); } 
    },

    methods: {
        initiate() { 
            var repo = window.REPOS[this.repo];
            if(repo.files){
                this.processFiles(repo.files);
            }else{ 
                window.api.loadAuthorship(this.repo, files=>{
                    this.processFiles(files); 
                });
            }       
        },

        splitSegments(lines) {
            // split into segments separated by authored
            var lastState, lastId=-1, segments=[];
            for(var line of lines){
                var authored = (line.author && line.author.gitId===this.author); 

                if(authored!==lastState || lastId===-1){
                    segments.push({
                        authored: authored,
                        lines: []
                    });

                    lastId += 1;
                    lastState = authored;
                }
                segments[lastId].lines.push(line.content);
            }

            return segments;
        },

        processFiles(files) {
            var res = [];

            for(var file of files){
                if(file.authorContributionMap[this.author]){
                    var out = {};
                    out.path = file.path;
                    
                    var segments = this.splitSegments(file.lines);

                    // append and prepend unauthored code for context (5 lines)
                    var contextedSegments = [];
                    var LINE_BUFFER = 5;
                    for(var segId=0; segId<segments.length; segId++){
                        var segment = segments[segId]; 

                        if(!segment.authored){
                            // append to end of last authored
                            if(segId>0 && contextedSegments.length>0){
                                var last = contextedSegments[contextedSegments.length-1]; 
                                var appendCnt = Math.min(segment.lines.length, LINE_BUFFER); 
                                for(var i=0; i<appendCnt; i++){
                                    last.lines.push(segment.lines.shift());
                                }
                            }

                            // prepend to start of next authored 
                            if(segId<segments.length-1){
                                var next = segments[segId+1]; 
                                var prependCnt = Math.min(segment.lines.length, LINE_BUFFER); 
                                for(var i=0; i<prependCnt; i++){
                                    next.lines.unshift(segment.lines.pop());
                                }
                            }
                        }

                        if(segment.lines.length>0){
                            contextedSegments.push(segment); 
                        }
                    }

                    // merging consecutive authored blocks
                    var mergedSegments = [];
                    var lastAuthored;
                    for(var segment of contextedSegments){
                        if(lastAuthored!==segment.authored || mergedSegments.length===0){
                            mergedSegments.push(segment);
                            lastAuthored = segment.authored;
                        }else{
                            var last = mergedSegments[mergedSegments.length-1];
                            last.lines = last.lines.concat(segment.lines);
                        }
                    }

                    out.segments = mergedSegments;
                    res.push(out);
                }
            }

            this.files = res;
            this.isLoaded = true;
        },
    },

    created() {
        this.initiate();
    },

    updated() { 
        this.$nextTick(() => {
            document.querySelectorAll("pre.hljs code").forEach(
                (ele) => { hljs.highlightBlock(ele); }
            );
        });
    }
};
