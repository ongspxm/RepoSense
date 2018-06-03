/* util funcs */
function $(id){ return document.getElementById(id); }

function enquery(key, val){
    return key + "=" + encodeURIComponent(val);
}

/* api funcs */
function loadJSON(file, fn){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", file);
    xhr.onload = function(){
        if(xhr.status === 200){
            fn(JSON.parse(xhr.responseText));
        }else{
            alert("unable to get file");
        }
    };
    xhr.send(null);
}

var api = {
    loadSummary(callback) {
        var REPORT_DIR = window.REPORT_DIR;
        var REPOS = window.REPOS;

        loadJSON(REPORT_DIR+"/summary.json", (repos => {
            REPOS = {};

            var names = [];
            for(var repo of repos){
                var repoName = repo.organization+"_"+repo.repoName;
                REPOS[repoName] = repo;
                names.push(repoName);
            }

            if(callback){ callback(); }
            for(var name of names){ api.loadCommits(name); }
        }));
    },

    loadCommits(repo) {
        var REPORT_DIR = window.REPORT_DIR;
        var REPOS = window.REPOS;
        var app = window.app;

        loadJSON(REPORT_DIR+"/"+repo+"/commits.json", (commits => {
            REPOS[repo].commits = commits;

            var res = [];
            for(var author in commits.authorDisplayNameMap){
                if(!author){ continue; }

                var obj = {
                    name: author,
                    repoId: repo,
                    variance: commits.authorContributionVariance[author],
                    displayName: commits.authorDisplayNameMap[author],
                    weeklyCommits: commits.authorWeeklyIntervalContributions[author],
                    dailyCommits: commits.authorDailyIntervalContributions[author],
                    totalCommits: commits.authorFinalContributionMap[author],
                };
                obj.searchPath = REPOS[repo].organization+"/";
                obj.searchPath += REPOS[repo].repoName+"/";
                obj.searchPath += obj.displayName+"/";
                obj.searchPath += author;
                obj.searchPath = obj.searchPath.toLowerCase();

                obj.repoPath = REPOS[repo].organization+"/";
                obj.repoPath += REPOS[repo].repoName;

                res.push(obj);
            }

            REPOS[repo]["users"] = res;
            app.addUsers();
        }));
    }
};
