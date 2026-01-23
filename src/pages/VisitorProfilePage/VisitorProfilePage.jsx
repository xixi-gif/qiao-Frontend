import React, { useState, useEffect, useRef } from 'react';
import { Layout, Card, Avatar, Form, Input, Button, Space, message, Typography, Row, Col } from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, PhoneOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../service/api';

const { Content } = Layout;
const { Title } = Typography;

const VisitorProfile = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editable, setEditable] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  const isFirstLoad = useRef(true);
  const isUserInfoFetched = useRef(false);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'accessToken') {
        setToken(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (!token) {
      if (!isFirstLoad.current) {
        message.warning('请先登录');
        navigate('/login');
      }
      return;
    }

    if (isUserInfoFetched.current) return;

    const fetchUserDetail = async () => {
      if (loading) return;
      
      setLoading(true);
      try {
        const response = await api.authApi.getProfile();
        if (response.data) {
          const userData = response.data;
          setUserInfo(userData);
          form.setFieldsValue({
            username: userData.username || '',
            phone: userData.phone || ''
          });
          localStorage.setItem('userInfo', JSON.stringify(userData));
          isUserInfoFetched.current = true;
        } else {
          const storedUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
          setUserInfo(storedUserInfo);
          form.setFieldsValue({
            username: storedUserInfo.username || '',
            phone: storedUserInfo.phone || ''
          });
        }
      } catch (error) {
        console.error('获取用户详情失败:', error);
        message.error('获取个人信息失败：' + (error.response?.data?.detail || '请重新登录'));
        if (error.response?.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('userInfo');
          setToken(null);
          navigate('/login');
        } else {
          const storedUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
          setUserInfo(storedUserInfo);
          form.setFieldsValue({
            username: storedUserInfo.username || '',
            phone: storedUserInfo.phone || ''
          });
        }
      } finally {
        setLoading(false);
        isFirstLoad.current = false;
      }
    };

    fetchUserDetail();
  }, [token, loading, navigate]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const updatedUser = { ...userInfo, ...values };
      await api.authApi.updateProfile(updatedUser);
      
      message.success('访客信息更新成功');
      setUserInfo(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      localStorage.setItem('username', updatedUser.username);
      setEditable(false);
      isUserInfoFetched.current = false;
    } catch (error) {
      console.error('保存用户信息失败:', error);
      message.error('更新个人信息失败：' + (error.response?.data?.detail || '请稍后重试'));
    } finally {
      setLoading(false);
    }
  };
  
  const avatarProps = userInfo?.avatar 
    ? { 
        src: `/public/${userInfo.avatar}`,
        fallback: <UserOutlined />,
        alt: userInfo.username || '访客',
        style: { objectFit: 'cover' }
      } 
    : { icon: <UserOutlined /> };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <Title level={2} style={{ marginBottom: '24px' }}>
            访客个人中心
          </Title>
          
          <Card 
            title="访客基本信息" 
            bordered={true}
            loading={loading}
            extra={
              <Button 
                type={editable ? "primary" : "default"}
                icon={editable ? <SaveOutlined /> : <EditOutlined />}
                onClick={editable ? handleSave : () => setEditable(true)}
                loading={loading}
              >
                {editable ? '保存信息' : '编辑信息'}
              </Button>
            }
            style={{ marginBottom: '24px' }}
          >
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} md={6} style={{ textAlign: 'center' }}>
                <Avatar {...avatarProps} size={120} style={{ marginBottom: '16px' }} />
                <div>
                  <Button 
                    type="default" 
                    size="small" 
                    icon={<UploadOutlined />}
                    disabled={!editable}
                    style={{ cursor: editable ? 'pointer' : 'not-allowed' }}
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
                      label="昵称"
                      rules={[{ required: true, message: '请输入昵称' }]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="请输入您的昵称" />
                    </Form.Item>
                    
                    <Form.Item
                      name="phone"
                      label="手机号码"
                      rules={[
                        { required: true, message: '请输入手机号码' },
                        { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' }
                      ]}
                    >
                      <Input prefix={<PhoneOutlined />} placeholder="请输入您的手机号码" />
                    </Form.Item>
                  </Space>
                </Form>
              </Col>
            </Row>
          </Card>
          
          <Card title="我的收藏" bordered={true}>
            <Typography.Text type="secondary">您还没有收藏任何文化遗产资源，快去探索吧！</Typography.Text>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default VisitorProfile;