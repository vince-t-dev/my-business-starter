
export const AllRoutes = {
    // pages
    Home: { path: "/my-business/" },
    Start: { path: "/__xpr__/pub_engine/my-business-starter/web" },
    Landing: { path: "/my-business/articles/" },
    
    Articles: { path: "/my-business/articles/*" },
    ArticleForm: { path: "/my-business/articles/edit/:id" },
    
    Settings: { path: "/my-business/settings" },
    Login: { path: "/my-business/login" },
    Lock: { path: "/my-business/lock" },
    ForgotPassword: { path: "/my-business/examples/forgot-password" },
    ResetPassword: { path: "/my-business/examples/reset-password" },
    NotFound: { path: "/my-business/examples/404" },
    ServerError: { path: "/my-business/examples/500" }
};