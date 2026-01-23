import React, { useState, useEffect, useRef } from 'react';
import { Layout, Card, Avatar, Form, Input, Button, Space, message, Typography, Row, Col, Table, Statistic } from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, PhoneOutlined, ShopOutlined, UploadOutlined, BarChartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../service/api';

const { Content } = Layout;
const { Title } = Typography;

const projectColumns = [
  { title: '项目名称', dataIndex: 'name', key: 'name' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '浏览量', dataIndex: 'views', key: 'views' },
  { title: '订单数', dataIndex: 'orders', key: 'orders' },
  { title: '操作', key: 'action', render: () => <Button type="primary" size="small">查看</Button> }
];

const projectData = [
  { key: '1', name: '侨乡民俗体验游', status: '已上线', views: 1258, orders: 86 },
  { key: '2', name: '非遗手作工坊', status: '审核中', views: 896, orders: 0 }
];

const MerchantProfile = () => {
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
            phone: userData.phone || '',
            shopName: userData.shopName || '',
            shopAddress: userData.shopAddress || ''
          });
          localStorage.setItem('userInfo', JSON.stringify(userData));
          isUserInfoFetched.current = true;
        } else {
          const storedUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
          setUserInfo(storedUserInfo);
          form.setFieldsValue({
            username: storedUserInfo.username || '',
            phone: storedUserInfo.phone || '',
            shopName: storedUserInfo.shopName || '',
            shopAddress: storedUserInfo.shopAddress || ''
          });
        }
      } catch (error) {
        console.error('获取商家信息失败:', error);
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
            phone: storedUserInfo.phone || '',
            shopName: storedUserInfo.shopName || '',
            shopAddress: storedUserInfo.shopAddress || ''
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
      
      message.success('商家信息更新成功');
      setUserInfo(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      localStorage.setItem('username', updatedUser.username);
      setEditable(false);
      isUserInfoFetched.current = false;
    } catch (error) {
      console.error('保存商家信息失败:', error);
      message.error('更新个人信息失败：' + (error.response?.data?.detail || '请稍后重试'));
    } finally {
      setLoading(false);
    }
  };
  
  const avatarProps = userInfo?.avatar 
    ? { 
        src: `/public/${userInfo.avatar}`,
        fallback: <ShopOutlined />,
        alt: userInfo.username || '商家',
        style: { objectFit: 'cover' }
      } 
    : { icon: <ShopOutlined /> };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Title level={2} style={{ marginBottom: '24px' }}>
            商家个人中心
          </Title>
          
          <Card 
            title="商家基本信息" 
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
                    更换店铺头像
                  </Button>
                </div>
              </Col>
              
              <Col xs={24} md={18}>
                <Form form={form} layout="vertical" disabled={!editable}>
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Form.Item
                      name="username"
                      label="联系人"
                      rules={[{ required: true, message: '请输入联系人姓名' }]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="请输入联系人姓名" />
                    </Form.Item>
                    
                    <Form.Item
                      name="phone"
                      label="联系电话"
                      rules={[
                        { required: true, message: '请输入联系电话' },
                        { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' }
                      ]}
                    >
                      <Input prefix={<PhoneOutlined />} placeholder="请输入联系电话" />
                    </Form.Item>
                    
                    <Form.Item
                      name="shopName"
                      label="店铺名称"
                      rules={[{ required: true, message: '请输入店铺名称' }]}
                    >
                      <Input prefix={<ShopOutlined />} placeholder="请输入店铺名称" />
                    </Form.Item>
                    
                    <Form.Item
                      name="shopAddress"
                      label="店铺地址"
                      rules={[{ required: true, message: '请输入店铺地址' }]}
                    >
                      <Input placeholder="请输入店铺详细地址" />
                    </Form.Item>
                  </Space>
                </Form>
              </Col>
            </Row>
          </Card>
          
          <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
            <Col xs={24} md={8}>
              <Card>
                <Statistic title="总项目数" value={2} prefix={<ShopOutlined />} />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Statistic title="总订单数" value={86} prefix={<BarChartOutlined />} />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Statistic title="总浏览量" value={2154} prefix={<BarChartOutlined />} />
              </Card>
            </Col>
          </Row>
          
          <Card title="我的文旅项目" bordered={true}>
            <Table columns={projectColumns} dataSource={projectData} pagination={false} />
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default MerchantProfile;