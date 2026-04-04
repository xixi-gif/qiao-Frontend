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
import AddProjectPage from '../pages/AddProjectPage/AddProjectPage';
import ProjectDetail from '../pages/TourismProjectsDetailPage/TourismProjectsDetailPage';
import EditProjectPage from '../pages/EditProjectPage/EditProjectPage';
import AdminProjectManage from '../pages/ProjectManagementPage/ProjectManagementPage';
import TourHomePage from '../pages/TourismProjectsPage/TourismProjectsPage';
import TourDetailPage from '../pages/TourDetailPage/TourDetailPage';
import MerchantUserPage from '../pages/MerchantUserPage/MerchantUserPage';
import TourismProjectsPage from '../pages/TourismProjectsPage/TourismProjectsPage';
import UserManagementPage from '../pages/UserManagementPage/UserManagementPage';
import CarouselSettingPage from '../pages/CarouselSettingPage/CarouselSettingPage';
import UserLikes from '../pages/UserLikes/UserLikes';
import UserComments from '../pages/UserComments/UserComments';
import UserFavorites from '../pages/UserFavorites/UserFavorites';
import AdminCommentPage from '../pages/AdminCommentPage/AdminCommentPage';
import RiverMessagePage from '../pages/RiverMessagePage/RiverMessagePage';
import AddCheckin from '../pages/AddCheckinPage/AddCheckinPage';
import UserCheckinsPage from '../pages/UserCheckinsPage/UserCheckinsPage';
import AdminCheckinManage from '../pages/AdminCheckinManagePage/AdminCheckinManagePage';
import CheckinDetail from '../pages/CheckinDetailPage/CheckinDetailPage';
import MarkdownAdminPage from '../pages/MarkdownAdminPage/MarkdownAdminPage';
import ChatPage from '../pages/ChatPage/ChatPage';
import MarkdownViewerPage from '../pages/MarkdownViewerPage/MarkdownViewerPage';
import MyFavoritePage from '../pages/MyFavoritePage/MyFavoritePage';
import DataAnalysis from '../pages/DataAnalysisPage/DataAnalysisPage';
import DataStatistics from '../pages/DataStatisticsPage/DataStatisticsPage';

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
      <Route path="/merchant/create-project" element={<AddProjectPage />} />
      <Route path="/merchant/project/:id" element={<ProjectDetail />} />
      <Route path="/merchant/edit-project/:id" element={<EditProjectPage />} />
      <Route path="/admin/projects-manage" element={<AdminProjectManage />} />
      <Route path="/cultural-projects" element={<TourHomePage />} />
      <Route path="/tourism/projects" element={<TourismProjectsPage />} />
      <Route path="/tour/detail/:id" element={<TourDetailPage />} />
      <Route path="/merchant/user/:id" element={<MerchantUserPage />} />
      <Route path="/admin/manage-users" element={<UserManagementPage />} />
      <Route path="/admin/page-display-settings" element={<CarouselSettingPage />} />
      <Route path="/user/favorites" element={<UserFavorites />} />
      <Route path="/user/likes" element={<UserLikes />} />
      <Route path="/user/comments" element={<UserComments />} />
      <Route path="/admin/comments-manage" element={<AdminCommentPage />} />
      <Route path="/visitor/leavemessage" element={<RiverMessagePage />} />
      <Route path="/user/checkin/add" element={<AddCheckin />} />
      <Route path="/user/checkins" element={<UserCheckinsPage />} />
      <Route path="/admin/checkins-manage" element={<AdminCheckinManage />} />
      <Route path="/checkin/detail/:id" element={<CheckinDetail />} />
      <Route path="/admin/resources-manage" element={<MarkdownAdminPage />} />
      <Route path="/cultural-resources" element={<MarkdownViewerPage />} />
      <Route path="/chat/:id?" element={<ChatPage />} />
      <Route path="/visitor/collection" element={<MyFavoritePage />} />
      <Route path="/merchant/data-analysis" element={<DataAnalysis />} />
      <Route path="/admin/data-statistics" element={<DataStatistics />} />

    </Routes>
  );
};

export default AppRoutes;