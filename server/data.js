var helpers = require('./helpers');

var data = function(fs, logger) {
    var marked = require('marked');
    var renderer = new marked.Renderer();
    var ampRenderer = new marked.Renderer();

    var linkRender = function(href, title, text) {
        return '<a target="_blank" href="'+ href +'">' + text + '</a>';
    };

    renderer.link = linkRender;

    ampRenderer.link = linkRender;

    ampRenderer.image = function(href, title, text) {
        return '<amp-img src="' + href + '" alt="' + text + '" layout="responsive" height="400" width="800"></amp-img>';
    };

    /**
     * Reads a file.
     * Will return HTML, even if the original format is Markdown.
     * @param {string} path
     * @param {boolean} isAmp
     */
    var getContent = function(path, isAmp) {
        let contents = fs.readFileSync('data/' + path, 'utf8');

        if (path.indexOf('.md') !== -1) {
            if (isAmp) {
                return marked(contents, { renderer: ampRenderer, sanitize: true });
            }

            return marked(contents, { renderer: renderer });
        }

        return contents;
    };

    var dataObject = {
        // Blog data.
        posts: [],
        // Project data.
        exampleGroups: [
            {
                //title: 'Personal projects',
                //info: 'Some projects I have worked on.',
                pages: []
            }
        ]
    };

    var findData = (dir, data) => {
        data = data || {};
        let paths = fs.readdirSync(dir);

        // Foreach of the JSON files...
        paths
            .filter(path => path.includes('.json'))
            .map(path => {
                try {
                    let contents = fs.readFileSync(dir + '/' + path, 'utf8');
                    let json = JSON.parse(contents);

                    if (typeof json.bodyText !== 'undefined') {
                        json.bodyText = getContent(json.bodyText);

                        //json.ampBodyText = getContent(page.bodyText, true);
                    }

                    if (helpers.isObject(data)) {
                        data[json.name] = json;
                    } else {
                        data.push(json);
                    }
                } catch (e) {
                    logger.error(e);
                }
            });

        // Foreach of the folder...
        paths
            .filter(path => !path.includes('.'))
            .forEach(path => {
                if (typeof data[path] === 'undefined') {
                    data[path] = [];

                    findData(dir + '/' + path, data[path]);
                } else {
                    data[path].children = [];

                    findData(dir + '/' + path, data[path].children);
                }
            });

        return data;
    };

    dataObject = findData('data');

    return dataObject;
};

module.exports = data;
