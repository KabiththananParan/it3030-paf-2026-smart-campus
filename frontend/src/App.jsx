import { Navigate, Route, Routes } from 'react-router-dom';
import ResourceListPage from "./pages/resources/ResourceListPage.jsx";
import ManageResourcePage from "./pages/resources/ManageResourcePage.jsx";
import AddResourcePage from "./pages/resources/AddResourcePage.jsx";
import ResourceDetailsPage from './pages/resources/ResourceDetailsPage';

function App() {
    return (
        <Routes>
            <Route path="/" element={<ResourceListPage />} />
            <Route path="/resources" element={<ResourceListPage />} />
            <Route path="/admin/resource/add" element={<AddResourcePage />} />
            <Route path="/admin/resource/manage/:id" element={<ManageResourcePage />} />
            <Route path="/resource/details/:id" element={<ResourceDetailsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;