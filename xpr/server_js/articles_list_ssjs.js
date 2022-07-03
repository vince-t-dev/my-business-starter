// this returns all xprobjects
const xpr_objects = require("/xpr/request");
const library = require("./library");

exports.process = function(context, options) {
    var api = xpr_objects.XprApi;
    let request = xpr_objects.XprRequest();
    let per_page = 8;
    
    // validate token
    let token = library.checkAuth(request.headers.Auth);
    if (token.error) return token;
    
    let articles_params = {
        "_noUnhydrated"                     : 1,
        "with"                              : "Categories,Language",
        "related_Language_Id__eq"           : request.language.Id,
        "order_fields"                      : "SortOrder",
        "order_dirs"                        : "ASC",
        "per_page"                          : per_page
    }
    if (request.urlParams.q) articles_params.q_Title_Description_Html = request.urlParams.q;
    if (request.urlParams.page) articles_params.page = request.urlParams.page;
    if (request.urlParams.section_id) articles_params.SectionId__in = request.urlParams.section_id;
    let articles = api({
        method: "GET",
        uri: "/articles/",
        parseHAL: false,
        params: articles_params
    });

    articles.Pagination = library.pagination({total: articles.Total, per_page: per_page, page: request.urlParams.page});
    return articles;
}