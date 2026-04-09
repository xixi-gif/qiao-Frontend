import React, { useState, useEffect, useRef } from 'react';
import { Layout, Menu, Avatar, Badge, message, Input, Drawer } from 'antd';
import {
  HomeOutlined, SettingOutlined,
  UsergroupAddOutlined, NotificationOutlined, InfoOutlined,
  HistoryOutlined, BookFilled, BookOutlined, CompassOutlined,
  UserOutlined, ShoppingOutlined, CrownOutlined, SearchOutlined,
  EllipsisOutlined, BarChartOutlined, ReconciliationOutlined,
  CommentOutlined, ProjectOutlined, MessageOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../src/service/api';

const { Header } = Layout;

const commonMenuItems = [
  { key: '/home', icon: <HomeOutlined />, label: '首页' },
  { key: '/travel-ai', icon: <HistoryOutlined />, label: '智慧旅游' },
  { key: '/cultural-resources', icon: <BookFilled />, label: '资源库' },
  { key: '/cultural-projects', icon: <ProjectOutlined />, label: '文旅项目' },
  { key: '/announcements', icon: <NotificationOutlined />, label: '平台公告' },
  // { key: '/about', icon: <InfoOutlined />, label: '关于平台' },
];

const roleSpecificItems = {
  visitor: [
    { key: '/visitor/collection', icon: <BookOutlined />, label: '我的资源' },
    { key: '/visitor/Leavemessage', icon: <CommentOutlined />, label: '留言板' },
    { key: '/visitor/cultural-guide', icon: <CompassOutlined />, label: '成田镇研学手册'}
  ],
  merchant: [
    { key: '/visitor/collection', icon: <BookOutlined />, label: '我的资源' },
    { key: '/merchant/data-analysis', icon: <BarChartOutlined />, label: '数据分析' },
  ],
  admin: [
    { key: '/admin/announcement-publish', icon: <NotificationOutlined />, label: '公告发布' },
    { key: '/admin/page-display-settings', icon: <SettingOutlined />, label: '页面展示设置' },
    { key: '/admin/manage-users', icon: <UsergroupAddOutlined />, label: '用户管理' },
    { key: '/admin/resources-manage', icon: <ReconciliationOutlined />, label: '资源管理' },
    { key: '/admin/comments-manage', icon: <CommentOutlined />, label: '评论管理' },
    { key: '/admin/projects-manage', icon: <ProjectOutlined />, label: '项目管理' },
    { key: '/admin/checkins-manage', icon: <ProjectOutlined />, label: '打卡墙管理' },
    { key: '/admin/data-statistics', icon: <BarChartOutlined />, label: '平台数据' },
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
  const [unreadTotal, setUnreadTotal] = useState(0);

  const fetchUnreadCount = async () => {
    const u = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (!u || !u.id) {
      setUnreadTotal(0);
      return;
    }
    try {
      const res = await api.chatApi.getConversations(u.id);
      const list = res.data || [];
      const total = list.reduce((sum, item) => sum + (item.unread_count_user || 0), 0);
      setUnreadTotal(total);
    } catch (err) {
      setUnreadTotal(0);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUnreadCount();
      const timer = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(timer);
    } else {
      setUnreadTotal(0);
    }
  }, [token]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!token) return;
      try {
        const response = await api.authApi.getProfile();
        if (response.data) {
          setUserInfo(response.data);
          localStorage.setItem('userInfo', JSON.stringify(response.data));
          localStorage.setItem('user_role', response.data.role || 'visitor');
          localStorage.setItem('username', response.data.realName || response.data.username || '用户');
        }
      } catch (error) {
        const cached = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (Object.keys(cached).length) setUserInfo(cached);
      }
    };
    fetchUserInfo();
  }, [token]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'accessToken') setToken(e.newValue);
      else if (e.key === 'userInfo') {
        try {
          const u = JSON.parse(e.newValue || '{}');
          if (Object.keys(u).length) setUserInfo(u);
        } catch (e) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const role = token ? (userInfo?.role || localStorage.getItem('user_role') || 'visitor') : 'visitor';
  const username = token ? (userInfo?.realName || userInfo?.username || localStorage.getItem('username') || '用户') : '访客';
  const avatarUrl = userInfo?.avatar ? `http://127.0.0.1:8090${userInfo.avatar.replace(/\\/g, '/')}` : null;
  const avatarProps = token && avatarUrl ? { src: avatarUrl, fallback: roleIcons[role] } : { icon: roleIcons[role] };
  const specificItems = roleSpecificItems[role] || [];

  const handleSearch = () => {
    const kw = searchValue.trim();
    if (!kw) return message.warning('请输入关键词');
    navigate(`/cultural-resources?search=${encodeURIComponent(kw)}`);
    setSearchValue('');
  };

  const handleAvatarClick = () => {
    if (token) navigate(profilePaths[role] || '/visitor/profile');
    else navigate('/login');
  };

  const buildNavItems = () => {
    const items = [...commonMenuItems];
    items.push({
      key: '/chat',
      icon: (
        <Badge count={unreadTotal} offset={[-5, 5]}>
          <MessageOutlined />
        </Badge>
      ),
      label: '我的会话'
    });
    if (specificItems.length) {
      items.push({
        key: 'role-specific',
        icon: <EllipsisOutlined />,
        children: specificItems.map(item => ({ ...item, onClick: () => navigate(item.key) }))
      });
    }
    return items.map(item => ({ ...item, onClick: !item.children ? () => navigate(item.key) : undefined }));
  };

  const mobileMenuItems = () => {
    const base = [...commonMenuItems, ...specificItems];
    base.push({
      key: '/chat',
      icon: (
        <Badge count={unreadTotal} offset={[-5, 5]}>
          <MessageOutlined />
        </Badge>
      ),
      label: '我的会话'
    });
    return base.map(item => ({
      ...item,
      onClick: () => { setDrawerVisible(false); navigate(item.key); }
    }));
  };

  return (
    <>
      <style>{`
        .ant-menu-submenu-popup .ant-menu-submenu { background: #E1D2B9 !important; }
        .ant-menu-submenu-popup .ant-menu-item:hover { background: #d6c7af !important; }
      `}</style>
      <Header style={{ background: '#E1D2B9', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 100, padding: '0 24px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '100%', maxWidth: 1800, margin: '0 auto' }}>
          <div style={{ flexShrink: 0, fontWeight: 1000 }}>
            <h1 style={{ fontSize: 20, margin: 0, color: '#9C7264' }}>南侨遗梦</h1>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Menu mode="horizontal" items={buildNavItems()} style={{ borderBottom: 0, background: '#E1D2B9' }} />

            <div style={{ display: 'flex', alignItems: 'center', width: 280 }}>
              <Input
                placeholder="搜索文化资源、文旅项目..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onPressEnter={handleSearch}
                style={{ height: 32, borderTopRightRadius: 0, borderBottomRightRadius: 0, flex: 1 }}
              />
              <div
                onClick={handleSearch}
                style={{ width: 46, height: 32, backgroundColor: '#9C706A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderTopRightRadius: 4, borderBottomRightRadius: 4 }}
              >
                <SearchOutlined />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleAvatarClick}>
              <Avatar {...avatarProps} size="large" style={{ marginRight: 10 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 500 }}>{username}</span>
                <span style={{ fontSize: 12, color: '#666', background: '#E1D2B9', padding: '2px 8px', borderRadius: 12 }}>{roleNames[role]}</span>
              </div>
            </div>
          </div>
        </div>
        <Drawer title="导航菜单" placement="left" onClose={() => setDrawerVisible(false)} open={drawerVisible} width={260} bodyStyle={{ padding: 0 }}>
          <Menu mode="inline" items={mobileMenuItems()} style={{ background: '#E1D2B9' }} />
          <div style={{ padding: 16 }}>
            <Input placeholder="搜索文化资源、文旅项目..."
              value={searchValue}
              onChange={(e)=>setSearchValue(e.target.value)}
              onPressEnter={handleSearch}
              style={{width:'100%'}}
              suffix={<SearchOutlined onClick={handleSearch}/>}
            />
          </div>
        </Drawer>
      </Header>
    </>
  );
};

export default Navbar;