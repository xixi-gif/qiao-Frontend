import React, { useState, useEffect, useRef } from 'react';
import { Layout, Menu, Avatar, message, Input, Drawer } from 'antd';
import { 
  HomeOutlined, SettingOutlined, LogoutOutlined, 
  UsergroupAddOutlined, NotificationOutlined, InfoOutlined, 
  MenuOutlined, BarChartOutlined, ReconciliationOutlined, 
  CommentOutlined, ProjectOutlined, QuestionCircleOutlined,
  HistoryOutlined, BookFilled, BookOutlined, CompassOutlined,
  UserOutlined, ShoppingOutlined, CrownOutlined, SearchOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../src/service/api';

const { Header } = Layout;
const { Search } = Input;

const commonMenuItems = [
  { key: '/home', icon: <HomeOutlined />, label: '首页' },
  { key: '/travel-ai', icon: <HistoryOutlined />, label: '智慧旅游' },
  { key: '/cultural-resources', icon: <BookFilled />, label: '资源库' },
  { key: '/cultural-projects', icon: <ProjectOutlined />, label: '文旅项目' },
  { key: '/announcements', icon: <NotificationOutlined />, label: '平台公告' },
  { key: '/about', icon: <InfoOutlined />, label: '关于平台' },
];

const roleSpecificItems = {
  visitor: [
    { key: '/visitor/collection', icon: <BookOutlined />, label: '我的收藏' },
    { key: '/visitor/feedback', icon: <CommentOutlined />, label: '意见反馈' },
    { key: '/visitor/cultural-guide', icon: <CompassOutlined />, label: '文化导览' }
  ],
  merchant: [
    { key: '/merchant/my-projects', icon: <ProjectOutlined />, label: '我的项目' },
    { key: '/merchant/resource-manage', icon: <BookOutlined />, label: '资源管理' },
    { key: '/merchant/data-analysis', icon: <BarChartOutlined />, label: '数据分析' },
    { key: '/merchant/order-manage', icon: <ReconciliationOutlined />, label: '订单管理' },
    { key: '/merchant/shop-setting', icon: <SettingOutlined />, label: '店铺设置' }
  ],
  admin: [
    { key: '/admin/announcement-publish', icon: <NotificationOutlined />, label: '发布公告' },
    { key: '/admin/manage-users', icon: <UsergroupAddOutlined />, label: '用户管理' },
    { key: '/admin/resources-manage', icon: <ReconciliationOutlined />, label: '资源管理' },
    { key: '/admin/comments-manage', icon: <CommentOutlined />, label: '评论管理' },
    { key: '/admin/projects-manage', icon: <ProjectOutlined />, label: '项目管理' },
    { key: '/admin/data-statistics', icon: <BarChartOutlined />, label: '平台数据' },
    { key: '/admin/system-settings', icon: <SettingOutlined />, label: '系统设置' }
  ]
};

const roleIcons = {
  visitor: <UserOutlined />,
  merchant: <ShoppingOutlined />,
  admin: <CrownOutlined />
};

const roleNames = {
  visitor: '访客',
  merchant: '商户',
  admin: '管理员'
};

const profilePaths = {
  visitor: '/visitor/profile',
  merchant: '/merchant/profile',
  admin: '/admin/profile'
};

const Navbar = ({ currentUser }) => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  const isFirstRender = useRef(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!token) return;
      try {
        const response = await api.authApi.getProfile();
        if (response.data) {
          setUserInfo(response.data);
          localStorage.setItem('userInfo', JSON.stringify(response.data));
          if (response.data.role) {
            localStorage.setItem('user_role', response.data.role);
          }
          if (response.data.realName || response.data.username) {
            localStorage.setItem('username', response.data.realName || response.data.username);
          }
        } else {
          const cachedUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
          if (Object.keys(cachedUser).length > 0) {
            setUserInfo(cachedUser);
          }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        const cachedUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (Object.keys(cachedUser).length > 0) {
          setUserInfo(cachedUser);
        }
      }
    };
    fetchUserInfo();
  }, [token]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'accessToken') {
        setToken(e.newValue);
      } else if (e.key === 'userInfo') {
        try {
          const updatedUser = JSON.parse(e.newValue || '{}');
          if (Object.keys(updatedUser).length > 0) {
            setUserInfo(updatedUser);
          }
        } catch (err) {
          console.error('解析用户信息失败:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const fetchUserInfo = async () => {
      if (!token) return;
      try {
        const response = await api.authApi.getProfile();
        if (response.data) {
          setUserInfo(response.data);
          localStorage.setItem('userInfo', JSON.stringify(response.data));
          if (response.data.role) {
            localStorage.setItem('user_role', response.data.role);
          }
          if (response.data.realName || response.data.username) {
            localStorage.setItem('username', response.data.realName || response.data.username);
          }
        }
      } catch (error) {
        console.error('Token更新后获取用户信息失败:', error);
      }
    };
    fetchUserInfo();
  }, [token]);

  const role = token ? (userInfo?.role || localStorage.getItem('user_role') || 'visitor') : 'visitor';
  const username = token 
    ? (userInfo?.realName || userInfo?.username || localStorage.getItem('username') || '用户') 
    : '访客';
  
  const avatarProps = token && userInfo?.userAvatar 
    ? { 
        src: userInfo.userAvatar,
        fallback: roleIcons[role],
        alt: username 
      } 
    : { icon: roleIcons[role] };
  
  const specificItems = roleSpecificItems[role] || [];

  const handleSearch = (value) => {
    navigate(`/cultural-resources/?search=${encodeURIComponent(value)}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
    localStorage.removeItem('userInfo');
    setUserInfo(null);
    setToken(null);
    message.success('退出登录成功');
    navigate('/login');
  };

  const handleAvatarClick = () => {
    if (token) {
      navigate(profilePaths[role] || '/visitor/profile');
    } else {
      navigate('/login');
    }
  };

  const buildNavItems = () => {
    const items = [...commonMenuItems];
    
    if (specificItems.length > 0) {
      if (specificItems.length === 1) {
        items.push(specificItems[0]);
      } else {
        const dropdownMenu = (
          <Menu>
            {specificItems.map(item => (
              <Menu.Item 
                key={item.key} 
                icon={item.icon}
                onClick={() => navigate(item.key)}
              >
                {item.label}
              </Menu.Item>
            ))}
          </Menu>
        );
        
        items.push({
          key: 'more-actions',
          label: (
            <div style={{ cursor: 'pointer' }}>
              <MenuOutlined style={{ fontSize: 16 }} />
            </div>
          ),
          onClick: () => {}
        });
      }
    }
    
    return items.map(item => ({
      ...item,
      onClick: item.key !== 'more-actions' ? () => navigate(item.key) : undefined
    }));
  };

  const mobileMenuItems = () => {
    const allItems = [...commonMenuItems, ...specificItems];
    
    return allItems.map(item => ({
      ...item,
      onClick: () => {
        setDrawerVisible(false);
        navigate(item.key);
      }
    }));
  };

  return (
    <Header style={{ 
      background: '#fff', 
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0 24px',
      minWidth: 1024,
      width: '100%',
      overflow: 'hidden'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        height: '100%',
        width: '100%',
        maxWidth: 1800,
        margin: '0 auto'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          flexShrink: 0
        }}>
          <h1 style={{ fontSize: 20, margin: 0, color: '#1890ff' }}>
            文旅资源展示平台
          </h1>
        </div>

        <div style={{ flex: 1 }}></div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          whiteSpace: 'nowrap',
          overflow: 'hidden'
        }}>
          <Menu 
            mode="horizontal" 
            items={buildNavItems()}
            style={{ 
              borderBottom: 0, 
              margin: 0,
              justifyContent: 'flex-start'
            }}
            itemStyle={{ 
              marginRight: 24,
              padding: '0 8px'
            }}
          />

          <Search
            placeholder="搜索文化资源、文旅项目..."
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            style={{ 
              width: 280,
              marginLeft: 24,
              flexShrink: 0
            }}
            onSearch={handleSearch}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />

          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              marginLeft: 24,
              padding: '0 12px',
              borderRadius: 8,
              transition: 'background-color 0.2s'
            }}
            onClick={handleAvatarClick}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <Avatar 
              {...avatarProps} 
              size="large" 
              style={{ 
                marginRight: 10,
                objectFit: 'cover'
              }} 
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 500 }}>{username}</span>
              <span style={{ 
                fontSize: 12, 
                color: '#666',
                background: '#f0f2f5',
                padding: '2px 8px',
                borderRadius: 12
              }}>
                {roleNames[role]}
              </span>
            </div>
          </div>

          <MenuOutlined 
            style={{ 
              fontSize: 24, 
              cursor: 'pointer', 
              marginLeft: 16,
              display: 'none',
              '@media (max-width: 768px)': {
                display: 'block'
              }
            }} 
            onClick={() => setDrawerVisible(true)} 
          />
        </div>
      </div>

      <Drawer
        title="导航菜单"
        placement="left"
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
        bodyStyle={{ padding: 0 }}
        width={260}
      >
        <Menu
          mode="inline"
          items={mobileMenuItems()}
        />
        
        <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0' }}>
          <Search
            placeholder="搜索文化资源、文旅项目..."
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            onSearch={handleSearch}
          />
        </div>
      </Drawer>
    </Header>
  );
};

export default Navbar;