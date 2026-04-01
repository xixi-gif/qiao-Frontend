import React, { useState, useEffect, useRef } from 'react';
import { Layout, Card, Avatar, Form, Input, Button, Space, message, Typography, Row, Col, Statistic, Table } from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, PhoneOutlined, CrownOutlined, UploadOutlined, UsergroupAddOutlined, BarChartOutlined, ShopOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../service/api';
import Navbar from '../../../public/Nav/nav';

const { Content } = Layout;
const { Title } = Typography;

const userColumns = [
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '手机号', dataIndex: 'phone', key: 'phone' },
  { title: '角色', dataIndex: 'role', key: 'role' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '操作', key: 'action', render: () => <Button type="primary" size="small">管理</Button> }
];

const userData = [
  { key: '1', username: '游客123', phone: '13800138000', role: '访客', status: '正常' },
  { key: '2', username: '侨乡文旅店', phone: '13900139000', role: '商家', status: '正常' }
];

const AdminProfile = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editable, setEditable] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef(null);

  const storedToken = localStorage.getItem('accessToken');
  const storedUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userInfo');
    message.success('已安全退出登录');
    navigate('/login');
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
        console.log(err);
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
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Navbar />
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Card
            title="管理员基本信息"
            bordered
            loading={loading}
            extra={
              <Space>
                {/* 退出登录按钮 */}
                <Button 
                  danger 
                  icon={<LogoutOutlined />} 
                  onClick={handleLogout}
                >
                  退出登录
                </Button>

                <Button
                  type={editable ? "primary" : "default"}
                  icon={editable ? <SaveOutlined /> : <EditOutlined />}
                  onClick={editable ? handleSave : () => setEditable(true)}
                  loading={loading}
                >
                  {editable ? '保存信息' : '编辑信息'}
                </Button>
              </Space>
            }
            style={{ marginBottom: '24px' }}
          >
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} md={6} style={{ textAlign: 'center' }}>
                <Avatar {...avatarProps} size={120} style={{ marginBottom: '16px' }} />
                <div style={{ position: 'relative' }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    style={{
                      position: 'absolute',
                      opacity: 0,
                      width: 0,
                      height: 0,
                      overflow: 'hidden'
                    }}
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
              <Card>
                <Statistic title="总用户数" value={256} prefix={<UsergroupAddOutlined />} />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Statistic title="商家数" value={32} prefix={<ShopOutlined />} />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Statistic title="资源总数" value={128} prefix={<BarChartOutlined />} />
              </Card>
            </Col>
          </Row>

          <Card title="用户管理（最近）" bordered>
            <Table columns={userColumns} dataSource={userData} pagination={false} />
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default AdminProfile;