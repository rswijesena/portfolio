module.exports = function(app, fs, express, config, logger, data, helpers, page) {
    app.get(page.path, function(req, res) {
        res.render('page', {
            layout: '_common',
            relativeUrl: '',
            metaDescription: page.metaDescription,
            pageGroup: page.pageGroup,
            pageTitle: page.pageTitle,
            bodyText: page.bodyText
        });
    });
};
