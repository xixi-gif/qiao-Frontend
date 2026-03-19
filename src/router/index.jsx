import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage/HomePage';
import LoginPage from '../pages/LoginPage/LoginPage'; 
import RegisterPage from '../pages/RegisterPage/RegisterPage';
import ForgotPasswordPage from '../pages/ForgetpasswordPage/ForgetpasswordPage';
import VisitorProfile from '../pages/VisitorProfilePage/VisitorProfilePage';
import MerchantProfile from '../pages/MerchantProfilePage/MerchantProfilePage';
import AdminProfile from '../pages/AdminProfilePage/AdminProfilePage';
import TravelAIPage from '../pages/TravelAIPage/TravelAIPage';
import AnnouncementPublish from '../pages/AnnouncementReleasePage/AnnouncementReleasePage';
import AnnouncementList from '../pages/AnnouncementPage/AnnouncementPage';
import AnnouncementDetail from '../pages/AnnouncementdetailPage/AnnouncementdetailPage';


const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/visitor/profile" element={<VisitorProfile />} />
      <Route path="/merchant/profile" element={<MerchantProfile />} />
      <Route path="/admin/profile" element={<AdminProfile />} />
      <Route path="/travel-ai" element={<TravelAIPage />} />
      <Route path="/admin/announcement-publish" element={<AnnouncementPublish />} />
      <Route path="/announcements" element={<AnnouncementList />} />
      <Route path="/announcements/detail/:id" element={<AnnouncementDetail />} />
    </Routes>
  );
};

export default AppRoutes;