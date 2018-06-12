var vAuthorship = {
    props: ["repo", "author"],
    template: $("v_authorship").innerHTML,
    data() {
        return {
            isLoaded: false,
            files: []
        };
    },

    methods: {
        printFiles(files) {
            this.files = files;
            this.isLoaded = true;
        } 
    },

    created() {
        var repo = window.REPOS[this.repo];
        if(repo.files){
            this.printFiles(repo.files);
        }else{ 
            window.api.loadAuthorship(this.repo, files=>{
                this.printFiles(files); 
            });
        }
    }
};
