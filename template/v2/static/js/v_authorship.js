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
                window.api.loadAuthorship(this.repo, files => this.processFiles(files));
            }
        },

        splitSegments(lines) {
            // split into segments separated by authored
            var lastState, lastId=-1, segments=[];
            for(var line of lines){
                var authored = (line.author && line.author.gitId===this.author);

                if(authored!==lastState || lastId===-1){
                    segments.push({
                        authored,
                        lines: []
                    });

                    lastId += 1;
                    lastState = authored;
                }
                segments[lastId].lines.push(line.content);
            }

            return segments;
        },

        mergeSegments(segments) {
            var lastAuthored;
            var mergedSegments = [];
            for(var segment of segments){
                if(lastAuthored!==segment.authored || mergedSegments.length===0){
                    mergedSegments.push(segment);
                    lastAuthored = segment.authored;
                }else{
                    var last = mergedSegments[mergedSegments.length-1];
                    last.lines = last.lines.concat(segment.lines);
                }
            }

            return mergedSegments;
        },

        removeSmallUnauthored(segments){
            var MIN_LINES = 5;
            var res = [];
            for(var segment of segments){
                if(segment.lines.length<MIN_LINES && !segment.authored){
                    if(res.length===0){
                        var lines = segments[1].lines;
                        segments[1].lines = segment.lines.concat(lines);
                    }else{
                        var last = res[res.length-1];
                        last.lines = segment.lines.concat(last.lines);
                    }
                }
                else{
                    res.push(segment);
                }
            }

            return res;
        },

        removeEmptySegments(segments) {
            var res = [];
            for(var segment of segments){
                if(segment.lines.join("")!==""){
                    res.push(segment);
                }
            }

            return res;
        },

        processFiles(files) {
            var res = [];

            for(var file of files){
                if(file.authorContributionMap[this.author]){
                    var out = {};
                    out.path = file.path;

                    var segments = this.splitSegments(file.lines);
                    var bigSegments = this.removeSmallUnauthored(segments);
                    var validSegments = this.removeEmptySegments(bigSegments);
                    var mergedSegments = this.mergeSegments(validSegments);

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
                (ele) => { window.hljs.highlightBlock(ele); }
            );
        });
    }
};
