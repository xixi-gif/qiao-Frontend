import React, { useState, useEffect, useRef } from 'react';
import { Layout, Card, Avatar, Form, Input, Button, Space, message, Typography, Row, Col, Image, Tag, Upload } from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, PhoneOutlined, ShopOutlined, UploadOutlined, LogoutOutlined, EyeOutlined, ShoppingCartOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../service/api';
import Navbar from '../../../public/Nav/nav';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const MerchantProfile = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [editable, setEditable] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  const [projectList, setProjectList] = useState([]);
  const [projectLoading, setProjectLoading] = useState(false);
  const isFirstLoad = useRef(true);
  const isUserInfoFetched = useRef(false);

  // 收藏、点赞、评论 状态（和访客中心完全一致）
  const [favorites, setFavorites] = useState([]);
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('username');
    localStorage.removeItem('user_role');
    setToken(null);
    setUserInfo(null);
    message.success('退出登录成功');
    navigate('/login');
  };

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'accessToken') {
        setToken(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 获取收藏、点赞、评论（和访客一样）
  const fetchUserInteractions = async () => {
    if (!token) return;
    setListLoading(true);
    try {
      const [favRes, likeRes, commentRes] = await Promise.all([
        api.authApi.getUserFavorites(),
        api.authApi.getUserLikes(),
        api.authApi.getUserComments()
      ]);
      setFavorites(favRes.data || []);
      setLikes(likeRes.data || []);
      setComments(commentRes.data || []);
    } catch (err) {
      console.error('获取互动数据失败:', err);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserInteractions();
    }
  }, [token]);

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
            shopName: userData.shop_name || '',
            shopAddress: userData.shop_address || ''
          });
          localStorage.setItem('userInfo', JSON.stringify(userData));
          isUserInfoFetched.current = true;
        }
      } catch (error) {
        console.error('获取商家信息失败:', error);
        message.error('获取个人信息失败');
        if (error.response?.status === 401) {
          localStorage.removeItem('accessToken');
          setToken(null);
          navigate('/login');
        }
      } finally {
        setLoading(false);
        isFirstLoad.current = false;
      }
    };
    fetchUserDetail();
  }, [token, navigate]);

  const fetchProjects = async () => {
    try {
      setProjectLoading(true);
      const res = await api.projectApi.getMyProjects();
      setProjectList(res.data || []);
    } catch (err) {
      message.error('获取项目失败');
    } finally {
      setProjectLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProjects();
    }
  }, [token]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const updateData = {
        username: values.username,
        phone: values.phone,
        shop_name: values.shopName,
        shop_address: values.shopAddress,
        avatar: userInfo?.avatar || ''
      };
      await api.authApi.updateProfile(updateData);
      message.success('更新成功');
      setUserInfo({ ...userInfo, ...updateData });
      localStorage.setItem('userInfo', JSON.stringify({ ...userInfo, ...updateData }));
      setEditable(false);
    } catch (error) {
      message.error('更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file) => {
    const isImg = file.type.startsWith('image/');
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isImg) {
      message.error('仅支持图片');
      return false;
    }
    if (!isLt2M) {
      message.error('图片小于2MB');
      return false;
    }
    setAvatarLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.authApi.uploadAvatar(formData);
      setUserInfo(prev => ({ ...prev, avatar: res.data.data.avatar }));
      message.success('上传成功');
    } catch (err) {
      message.error('上传失败');
    } finally {
      setAvatarLoading(false);
    }
    return false;
  };

  // 图片路径修复（兼容旧数据）
  const fixImg = (url) => {
    if (!url) return '';
    let u = url.replace(/\\/g, '/');
    return `http://127.0.0.1:8090${u}`;
  };

  // 状态标签修复（关键！！！）
  const getProjectTag = (status) => {
    if (status === 'pending') {
      return <Tag color="processing">审核中</Tag>;
    } else if (status === 'active') {
      return <Tag color="success">已上线</Tag>;
    } else if (status === 'rejected') {
      return <Tag color="error">已驳回</Tag>;
    } else {
      return <Tag color="default">未知状态</Tag>;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Navbar />
      <Content style={{ padding: 24 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Title level={2} style={{ margin: 0 }}>商家中心</Title>
            <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>退出登录</Button>
          </div>

          {/* 商家信息卡片 */}
          <Card loading={loading} extra={<Button type={editable ? 'primary' : 'default'} icon={editable ? <SaveOutlined /> : <EditOutlined />} onClick={editable ? handleSave : () => setEditable(true)} loading={loading}>{editable ? '保存信息' : '编辑信息'}</Button>} style={{ marginBottom: 24 }}>
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} md={6} style={{ textAlign: 'center' }}>
                <Avatar size={120} src={userInfo?.avatar ? fixImg(userInfo.avatar) : undefined} icon={<ShopOutlined />} style={{ marginBottom: 8 }} />
                <div style={{ marginTop: 4 }}>
                  <Upload showUploadList={false} beforeUpload={handleUpload} disabled={!editable}>
                    <Button size="small" icon={<UploadOutlined />} loading={avatarLoading}>更换头像</Button>
                  </Upload>
                </div>
              </Col>
              <Col xs={24} md={18}>
                <Form form={form} layout="vertical" disabled={!editable}>
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Form.Item name="username" label="用户名" rules={[{ required: true }]}><Input prefix={<UserOutlined />} /></Form.Item>
                    <Form.Item name="phone" label="电话" rules={[{ required: true }, { pattern: /^1[3-9]\d{9}$/ }]}><Input prefix={<PhoneOutlined />} /></Form.Item>
                    <Form.Item name="shopName" label="店铺名" rules={[{ required: true }]}><Input prefix={<ShopOutlined />} /></Form.Item>
                    <Form.Item name="shopAddress" label="地址" rules={[{ required: true }]}><Input /></Form.Item>
                  </Space>
                </Form>
              </Col>
            </Row>
          </Card>

          {/* 我的文旅项目 */}
          <Card title="我的文旅项目" loading={projectLoading} extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/merchant/create-project')}>添加项目</Button>} style={{ marginBottom: 24 }}>
            <Row gutter={[24, 24]}>
              {projectList.map((item) => (
                <Col xs={24} sm={12} lg={8} key={item.id}>
                  <Card hoverable style={{ borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ position: 'relative' }}>
                      <Image 
                        src={fixImg(item.cover)} 
                        width="100%" 
                        height={180} 
                        style={{ objectFit: 'cover' }} 
                        fallback="https://picsum.photos/id/1036/400/300" 
                      />
                      <div style={{ position: 'absolute', top: 8, left: 8 }}>
                        {getProjectTag(item.status)}
                      </div>
                    </div>
                    <Title level={5} style={{ margin: '8px 0' }}>{item.title}</Title>
                    <div>{item.tags.split(',').map((t, i) => <Tag key={i} size="small">{t}</Tag>)}</div>
                    <Paragraph ellipsis={{ rows: 2 }} style={{ color: '#666' }}>{item.description}</Paragraph>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999', fontSize: 12 }}>
                      <span><EyeOutlined /> {item.views}</span>
                      <span><ShoppingCartOutlined /> {item.orders}</span>
                    </div>
                    <Button type="primary" block size="small" style={{ marginTop: 10 }} onClick={() => navigate(`/merchant/project/${item.id}`)}>查看详情</Button>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>

          {/* ===================== 新增：我的收藏（和访客完全一样） ===================== */}
          <Card title="我的收藏" style={{ marginBottom: 16 }} extra={<Button onClick={() => navigate('/user/favorites')}>查看更多</Button>}>
            {listLoading ? <Card loading /> : favorites.length > 0 ? (
              <Row gutter={[12, 12]}>
                {favorites.slice(0, 3).map(item => (
                  <Col xs={8} sm={8} key={item.project_id}>
                    <Card hoverable style={{ borderRadius: 8, height: '100%' }} bodyStyle={{ padding: 10 }} onClick={() => navigate(`/tour/detail/${item.project_id}`)}>
                      <Image height={130} width="100%" style={{ objectFit: 'cover', borderRadius: 6 }} src={fixImg(item.cover)} fallback="https://picsum.photos/id/1036/400/300" />
                      <div style={{ fontSize: 13, marginTop: 8, fontWeight: 500 }}>{item.title}</div>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : <Typography.Text type="secondary">暂无收藏</Typography.Text>}
          </Card>

          {/* ===================== 新增：我的点赞（和访客完全一样） ===================== */}
          <Card title="我的点赞" style={{ marginBottom: 16 }} extra={<Button onClick={() => navigate('/user/likes')}>查看更多</Button>}>
            {listLoading ? <Card loading /> : likes.length > 0 ? (
              <Row gutter={[12, 12]}>
                {likes.slice(0, 3).map(item => (
                  <Col xs={8} sm={8} key={item.project_id}>
                    <Card hoverable style={{ borderRadius: 8, height: '100%' }} bodyStyle={{ padding: 10 }} onClick={() => navigate(`/tour/detail/${item.project_id}`)}>
                      <Image height={130} width="100%" style={{ objectFit: 'cover', borderRadius: 6 }} src={fixImg(item.cover)} fallback="https://picsum.photos/id/1036/400/300" />
                      <div style={{ fontSize: 13, marginTop: 8, fontWeight: 500 }}>{item.title}</div>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : <Typography.Text type="secondary">暂无点赞</Typography.Text>}
          </Card>

          {/* ===================== 新增：我的评论（和访客完全一样） ===================== */}
          <Card title="我的评论" extra={<Button onClick={() => navigate('/user/comments')}>查看更多</Button>}>
            {listLoading ? <Card loading /> : comments.length > 0 ? (
              <div>
                {comments.slice(0, 2).map((item, idx) => (
                  <div key={idx} style={{ padding: 10, border: '1px solid #eee', borderRadius: 8, marginBottom: 8 }}>
                    <div style={{ fontWeight: 500 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{item.content}</div>
                  </div>
                ))}
              </div>
            ) : <Typography.Text type="secondary">暂无评论</Typography.Text>}
          </Card>

        </div>
      </Content>
    </Layout>
  );
};

export default MerchantProfile;