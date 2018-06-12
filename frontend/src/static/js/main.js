var REPORT_DIR = "";
var REPOS = {};

var app = new window.Vue({
    el: "#app",
    data: {
        reportDirInput: "",
        repos: {},
        repoLength: 0,
        loadedRepo: 0,
        userUpdated: false,

        isTabActive: false,
        isTabAuthorship: false,
        isTabIssues: false,

        tabAuthor: "",
        tabRepo: ""
    },
    methods:{
        // model funcs
        updateReportDir(evt) {
            REPORT_DIR = this.reportDirInput;
            this.users = [];

            window.api.loadSummary((names) => {
                this.repos = REPOS;
                this.repoLength = Object.keys(REPOS).length;
                this.loadedRepo = 0;

                for(var name of names){
                    window.api.loadCommits(name, ()=>this.addUsers());
                }
            });
        },
        addUsers() {
            this.userUpdated = false;
            this.loadedRepo += 1;
            this.userUpdated = true;
        },
        getUsers() {
            var full = [];
            for(var repo in this.repos){
                if(this.repos[repo].users){
                    full.push(this.repos[repo]);
                }
            }
            return full;
        },

        deactivateTabs: function(){
            this.isTabAuthorship = false;
            this.isTabIssues = false;
        },

        updateTabAuthorship: function(obj){
            this.deactivateTabs();
            
            this.tabAuthor = obj.author;
            this.tabRepo = obj.repo;

            this.isTabActive = true; 
            this.isTabAuthorship = true;
        }
    },
    components:{
        "v_summary": window.vSummary,
        "v_authorship": window.vAuthorship
    },
});
