const { readdirSync } = require("fs");
const { join } = require("path");

class GeneratorFolder {

    constructor (folder, plop) {
        this.folder = folder;
        this.plop = plop;

        this.plop.setHelper('pascalCase', (txt) => txt
            .replace(/[_\-\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
            .replace(/^[a-z]/, (c) => c.toUpperCase())
        );

        this.plop.setHelper('upperSnakeCase', function (text) {
            return text
              .replace(/([a-z])([A-Z])/g, '$1_$2') // handle camelCase
              .replace(/[\s\-]+/g, '_')           // replace spaces and dashes with _
              .replace(/[A-Z]{2,}(?=[A-Z][a-z])/g, (s) => s[0] + s.slice(1).toLowerCase()) // fix acronym splits
              .toUpperCase();
        });
          
    }

    init () {
        const files = readdirSync(this.folder);
        
        for (const file of files) {
            const name = file.split(".generator.js")[0];
            
            this.plop.setGenerator(name, require(join(this.folder, file)));
        }
    }
    
}

module.exports = function (plop) {
    const generatorFolder = new GeneratorFolder(join(__dirname, "generators"), plop);
    
    generatorFolder.init();
}