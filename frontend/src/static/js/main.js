var REPORT_DIR = "";
var REPOS = {};

var app = new Vue({
    el: "#app",
    data: {
        reportDirInput: "",
        repos: {},
        repoLength: 0,
        loadedRepo: 0,
        userUpdated: false,
        isTabActive: true,
        isTabAuthorship: false,
        isTabIssues: false
    },
    methods:{
        // model funcs
        updateReportDir: function(evt){
            REPORT_DIR = this.reportDirInput;
            this.users = [];

            api.loadSummary(() => {
                this.repos = REPOS;
                this.repoLength = Object.keys(REPOS).length;
                this.loadedRepo = 0;
            });
        },
        addUsers: function(users){
            this.userUpdated = false;
            this.loadedRepo += 1;
            this.userUpdated = true;
        },
        getUsers: function(){
            var full = [];
            for(var repo in this.repos){
                if(!this.repos[repo].users){ continue; }
                full.push(this.repos[repo]);
            }
            return full;
        },
        deactivateTabs: function(){
            this.isTabAuthorship = false;
            this.isTabIssues = false;
        }
    },
    components:{
        "v_summary": vSummary
    },
});
