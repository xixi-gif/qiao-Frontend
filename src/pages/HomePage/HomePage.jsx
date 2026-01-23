// src/pages/HomePage/index.jsx
import React from 'react';
import { Button, Layout, Typography, Space, Card, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import { LogoutOutlined, HistoryOutlined, ProjectOutlined, NotificationOutlined, BookFilled, CompassOutlined, PictureOutlined } from '@ant-design/icons';
import Navbar from '../../../public/Nav/nav'; // 请确认导航栏组件的实际路径

const { Content } = Layout;
const { Title, Text } = Typography;

const HomePage = () => {
  const navigate = useNavigate();
  
  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
    localStorage.removeItem('userInfo');
    navigate('/login');
  };
  

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      {/* 引入公共导航栏 */}
      <Navbar />
      
      {/* 首页内容区域 */}
      <Content style={{ padding: '24px' }}>
        <div style={{ 
          maxWidth: 1400, 
          margin: '0 auto',
          background: '#ffffff',
          borderRadius: 8,
          padding: '40px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
        }}>




          {/* 退出登录按钮 */}
          <div style={{ marginTop: 40, textAlign: 'center' }}>
            <Button 
              type="default" 
              danger
              onClick={handleLogout}
              icon={<LogoutOutlined />}
              size="middle"
            >
              退出登录
            </Button>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default HomePage;