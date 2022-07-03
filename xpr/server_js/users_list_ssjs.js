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
    
    let users_params = { _noUnhydrated: 1, per_page: per_page };
    if (request.urlParams) {
        if (request.urlParams.q) users_params.q_FirstName_LastName_Email = request.urlParams.q;
        if (request.urlParams.page) users_params.page = request.urlParams.page;
        if (request.urlParams.id) users_params.with = "CustomFields";
    }
    let user_id = (request.urlParams && request.urlParams.id) ? request.urlParams.id : "";
    let uri = "/users/"+user_id 
    let users = api({
        method: "GET",
        uri : uri,
        parseHAL: false,
        params : users_params
    });

    users.Pagination = library.pagination({total: users.Total, per_page: per_page, page: request.urlParams.page});
    return users;
}
