import React, { useState, useEffect } from 'react';
import { Layout, Card, Avatar, Form, Input, Button, message, Typography, Row, Col, Upload, List, Tag } from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, PhoneOutlined, ShopOutlined, UploadOutlined, LogoutOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../service/api';
import Navbar from '../../../public/Nav/nav';

const { Content } = Layout;
const { Title } = Typography;

const MerchantProfile = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [editable, setEditable] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const [projectList, setProjectList] = useState([
    {
      id: 1,
      title: '非遗文化体验营',
      status: '已上线',
      createTime: '2026-01-10',
      people: 120
    },
    {
      id: 2,
      title: '古城深度一日游',
      status: '已上线',
      people: 86,
      createTime: '2026-02-15'
    },
    {
      id: 3,
      title: '传统手工艺研学之旅',
      status: '待审核',
      createTime: '2026-03-01',
      people: 0
    }
  ]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.authApi.getProfile();
        setUserInfo(res.data);
        form.setFieldsValue({
          username: res.data.username,
          phone: res.data.phone,
          shopName: res.data.shop_name,
          shopAddress: res.data.shop_address,
        });
      } catch (err) {
        message.error('获取信息失败');
      }
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    try {
      const values = form.getFieldsValue();
      await api.authApi.updateProfile({
        username: values.username,
        phone: values.phone,
        shop_name: values.shopName,
        shop_address: values.shopAddress,
        avatar: userInfo?.avatar
      });
      message.success('保存成功');
      setEditable(false);
    } catch (error) {
      message.error('保存失败');
    }
  };

  const handleUpload = async (file) => {
    const isImg = file.type.startsWith('image/');
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isImg) {
      message.error('仅支持图片格式');
      return false;
    }
    if (!isLt2M) {
      message.error('图片大小不能超过2MB');
      return false;
    }
    setAvatarLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.authApi.uploadAvatar(formData);
      const newAvatar = res.data.data.avatar;
      setUserInfo(prev => ({ ...prev, avatar: newAvatar }));
      const userRes = await api.authApi.getProfile();
      setUserInfo(userRes.data);
      message.success('上传成功');
    } catch (err) {
      console.error(err);
      message.error('上传失败');
    } finally {
      setAvatarLoading(false);
    }
    return false;
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Navbar />
      <Content style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0 }}>商家中心</Title>
          <Button danger icon={<LogoutOutlined />} onClick={() => navigate('/login')}>
            退出登录
          </Button>
        </div>

        <Card
          extra={
            <Button 
              type={editable ? 'primary' : 'default'} 
              onClick={editable ? handleSave : () => setEditable(true)}
              icon={editable ? <SaveOutlined /> : <EditOutlined />}
            >
              {editable ? '保存' : '编辑'}
            </Button>
          }
          style={{ marginBottom: 24 }}
        >
          <Row gutter={24} align="middle">
            <Col xs={24} md={6} style={{ textAlign: 'center' }}>
              <Avatar
                size={120}
                src={
                  userInfo?.avatar 
                    ? `http://127.0.0.1:8090${userInfo.avatar.replace(/\\/g, '/')}` 
                    : undefined
                }
                icon={<ShopOutlined />}
                style={{ marginBottom: 16, objectFit: 'cover' }}
              />
              <div>
                <Upload
                  showUploadList={false}
                  beforeUpload={handleUpload}
                  disabled={!editable}
                >
                  <Button size="small" icon={<UploadOutlined />} loading={avatarLoading}>
                    更换头像
                  </Button>
                </Upload>
              </div>
            </Col>

            <Col xs={24} md={18}>
              <Form 
                form={form} 
                layout="vertical" 
                disabled={!editable} 
                style={{ width: '100%' }}
              >
                <Form.Item name="username" label="用户名">
                  <Input prefix={<UserOutlined />} />
                </Form.Item>
                <Form.Item name="phone" label="电话">
                  <Input prefix={<PhoneOutlined />} />
                </Form.Item>
                <Form.Item name="shopName" label="店铺名">
                  <Input prefix={<ShopOutlined />} />
                </Form.Item>
                <Form.Item name="shopAddress" label="地址">
                  <Input />
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </Card>

        <Card
          title="我的文旅项目"
          extra={
            <Button type="primary" icon={<PlusOutlined />}>
              发布项目
            </Button>
          }
        >
          <List
            dataSource={projectList}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button type="link" onClick={() => navigate(`/merchant/project/${item.id}`)}>
                    查看
                  </Button>,
                  <Button type="link" onClick={() => message.info('编辑功能')}>
                    编辑
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={item.title}
                  description={
                    <div style={{ marginTop: 4 }}>
                      <Tag color={item.status === '已上线' ? 'green' : 'orange'}>
                        {item.status}
                      </Tag>
                      <span style={{ marginLeft: 8 }}>创建时间：{item.createTime}</span>
                      <span style={{ marginLeft: 16 }}>参与人数：{item.people}</span>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </Content>
    </Layout>
  );
};

export default MerchantProfile;