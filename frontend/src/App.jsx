import { Navigate, Route, Routes } from 'react-router-dom';
import ResourceListPage from "./pages/resources/ResourceListPage.jsx";
// Import the new pages you are about to create:
import ManageResourcePage from "./pages/resources/ManageResourcePage.jsx";
import AddResourcePage from "./pages/resources/AddResourcePage.jsx";

// import Dashboard from "./pages/dashboard/Dashboard.jsx";
// import Login from "./pages/auth/Login.jsx";
// import SignUp from "./pages/auth/SignUp.jsx";
// import ForgotPassword from "./pages/auth/ForgotPassword.jsx";

function App() {
    return (
        <Routes>
            {/* --- PUBLIC / SHARED ROUTES --- */}
            {/* Set the home page to your Resource List directly for testing */}
            <Route path="/" element={<ResourceListPage />} />
            <Route path="/resources" element={<ResourceListPage />} />

            {/* --- ADMIN SPECIFIC ROUTES --- */}
            {/* Route for adding a new resource */}
            <Route path="/admin/resource/add" element={<AddResourcePage />} />

            {/* Route for Edit/Delete - The :id is a dynamic parameter */}
            <Route path="/admin/resource/manage/:id" element={<ManageResourcePage />} />


            {/* --- FUTURE AUTH ROUTES (For your teammate) --- */}
            {/* <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/dashboard" element={<Dashboard />} /> 
            */}

            {/* Redirect everything else to home for now */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;