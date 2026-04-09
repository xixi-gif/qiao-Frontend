import React, { useState, useEffect, useRef } from 'react';
import { Layout, Card, Avatar, Form, Input, Button, Space, message, Typography, Row, Col, Statistic } from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, PhoneOutlined, CrownOutlined, UploadOutlined, UsergroupAddOutlined, BarChartOutlined, ShopOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../service/api';
import Navbar from '../../../public/Nav/nav';

const { Content } = Layout;
const { Title } = Typography;

const AdminProfile = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editable, setEditable] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef(null);

  const [stats, setStats] = useState({
    total_users: 0,
    total_merchants: 0,
    total_markdown: 0
  });

  const storedToken = localStorage.getItem('accessToken');
  const storedUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userInfo');
    message.success('已安全退出登录');
    navigate('/login');
  };

  const loadStats = async () => {
    try {
      const res = await api.adminApi.getDashboard({ period: 'month' });
      if (res.data.code === 200) {
        setStats({
          total_users: res.data.data.total_users || 0,
          total_merchants: res.data.data.total_merchants || 0,
          total_markdown: res.data.data.total_markdown || 0
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!storedToken) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    const fetchUserDetail = async () => {
      setLoading(true);
      try {
        const res = await api.authApi.getProfile();
        const userData = res.data || res;
        setUserInfo(userData);
        form.setFieldsValue({
          username: userData.username || '',
          phone: userData.phone || ''
        });
        localStorage.setItem('userInfo', JSON.stringify(userData));
      } catch (error) {
        message.error('获取个人信息失败');
        setUserInfo(storedUserInfo);
        form.setFieldsValue({
          username: storedUserInfo.username || '',
          phone: storedUserInfo.phone || ''
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetail();
    loadStats();
  }, [storedToken, navigate, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const res = await api.authApi.updateProfile(values);
      const updatedUser = res.data || res;
      message.success('管理员信息更新成功');
      setUserInfo(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setEditable(false);
    } catch (error) {
      message.error('更新个人信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    if (!editable) {
      message.warning('请先开启编辑');
      return;
    }
    fileInputRef.current.click();
  };

  const handleUploadChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setAvatarLoading(true);
    api.authApi.uploadAvatar(formData)
      .then(res => {
        const avatarUrl = res.data?.avatar || res.avatar;
        const newInfo = { ...userInfo, avatar: avatarUrl };
        setUserInfo(newInfo);
        localStorage.setItem('userInfo', JSON.stringify(newInfo));
        message.success('头像上传成功');
      })
      .catch(err => {
        message.error('头像上传失败');
      })
      .finally(() => {
        setAvatarLoading(false);
        e.target.value = '';
      });
  };

  const avatarProps = userInfo?.avatar
    ? {
        src: userInfo.avatar.startsWith('http') ? userInfo.avatar : `http://127.0.0.1:8090${userInfo.avatar}`,
        fallback: <CrownOutlined />,
        alt: userInfo.username || '管理员',
        style: { objectFit: 'cover' }
      }
    : { icon: <CrownOutlined /> };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f9f5f1' }}>
      <Navbar />
      <Content style={{ padding: '30px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Card
            title={<Title level={4} style={{ margin: 0, color: '#9C706A' }}>管理员基本信息</Title>}
            bordered={false}
            loading={loading}
            style={{ marginBottom: '24px', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            extra={
              <Space>
                <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>退出登录</Button>
                <Button
                  type={editable ? "primary" : "default"}
                  icon={editable ? <SaveOutlined /> : <EditOutlined />}
                  onClick={editable ? handleSave : () => setEditable(true)}
                  loading={loading}
                  style={editable ? { backgroundColor: '#9C706A', borderColor: '#9C706A' } : {}}
                >
                  {editable ? '保存信息' : '编辑信息'}
                </Button>
              </Space>
            }
          >
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} md={6} style={{ textAlign: 'center' }}>
                <Avatar {...avatarProps} size={120} style={{ marginBottom: '16px' }} />
                <div style={{ position: 'relative' }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0, overflow: 'hidden' }}
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleUploadChange}
                  />
                  <Button
                    size="small"
                    icon={<UploadOutlined />}
                    disabled={!editable || avatarLoading}
                    loading={avatarLoading}
                    onClick={handleUploadClick}
                  >
                    更换头像
                  </Button>
                </div>
              </Col>
              <Col xs={24} md={18}>
                <Form form={form} layout="vertical" disabled={!editable}>
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Form.Item
                      name="username"
                      label="管理员名称"
                      rules={[{ required: true, message: '请输入管理员名称' }]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="请输入管理员名称" />
                    </Form.Item>
                    <Form.Item
                      name="phone"
                      label="联系电话"
                      rules={[
                        { required: true, message: '请输入联系电话' },
                        { pattern: /^1[3-9]\d{9}$/, message: '请输入有效手机号' }
                      ]}
                    >
                      <Input prefix={<PhoneOutlined />} placeholder="请输入联系电话" />
                    </Form.Item>
                  </Space>
                </Form>
              </Col>
            </Row>
          </Card>

          <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <Statistic title="总用户数" value={stats.total_users} prefix={<UsergroupAddOutlined />} />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <Statistic title="商家数" value={stats.total_merchants} prefix={<ShopOutlined />} />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <Statistic title="资源总数" value={stats.total_markdown} prefix={<BarChartOutlined />} />
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  );
};

export default AdminProfile;