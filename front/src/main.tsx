import React from "react";
import ReactDOM from "react-dom/client";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import "./styles.css";
import "./admin.css";
import "./auth.css";
import {PublicLayout, AdminLayout} from "./components/Layout";
import {Home} from "./pages/PublicPages";
import {ContestPage} from "./pages/ContestPage";
import {MemberPage} from "./pages/MemberPage";
import {NoticeDetailPage} from "./pages/NoticeDetailPage";
import {
    ApplicationsAdmin,
    ApplicationDetailAdmin,
    CompetitionDetailAdmin,
    CompetitionsAdmin,
    Dashboard,
    UsersAdmin,
} from "./pages/AdminPages";
import {AuthProvider} from "./auth/AuthProvider";
import {RequireAdmin} from "./auth/RequireAdmin";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <AuthProvider>
            <BrowserRouter basename={import.meta.env.BASE_URL}>
                <Routes>
                    <Route element={<PublicLayout/>}>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/contests/:contestId" element={<ContestPage/>}/>
                        <Route
                            path="/contests/:contestId/notices/:noticeId"
                            element={<NoticeDetailPage/>}
                        />
                        <Route path="/member" element={<MemberPage/>}/>
                    </Route>
                    <Route element={<RequireAdmin/>}>
                        <Route path="/admin" element={<AdminLayout/>}>
                            <Route index element={<Dashboard/>}/>
                            <Route path="competitions" element={<CompetitionsAdmin/>}/>
                            <Route
                                path="competitions/:contestId"
                                element={<CompetitionDetailAdmin/>}
                            />
                            <Route
                                path="competitions/:contestId/applications/:applicationId"
                                element={<ApplicationDetailAdmin/>}
                            />
                            <Route path="applications" element={<ApplicationsAdmin/>}/>
                            <Route path="users" element={<UsersAdmin/>}/>
                        </Route>
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    </React.StrictMode>,
);
