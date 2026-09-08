import {Navigate, Outlet, useLocation} from "react-router-dom";
import {useAuth} from "./AuthProvider";

export function RequireAdmin() {
    const {member, loading} = useAuth();
    const location = useLocation();

    if (loading) {
        return <main className="myteam">권한 정보를 확인하는 중입니다.</main>;
    }

    if (member?.role !== "ADMIN") {
        return (
            <Navigate to="/member" replace state={{from: location.pathname}}/>
        );
    }

    return <Outlet/>;
}
