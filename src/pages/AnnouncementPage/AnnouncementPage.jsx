import React, { useState, useEffect } from 'react';
import { 
  Layout, Card, List, Button, Space, Typography, 
  Tag, Popconfirm, message, Row, Col, Spin, Empty
} from 'antd';
import { 
  DeleteOutlined, EyeOutlined, PlusOutlined, ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../service/api';
import Navbar from '../../../public/Nav/nav';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

const AnnouncementList = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [currentUser, setCurrentUser] = useState({ role: 'user' });

  // 强制实时刷新用户信息
  const loadUserInfo = () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : { role: 'user' };
      setCurrentUser(user);
    } catch (e) {
      setCurrentUser({ role: 'user' });
    }
  };

  // 多重监听确保实时更新
  useEffect(() => {
    // 初始加载
    loadUserInfo();

    // 监听storage变化
    const handleStorage = () => {
      loadUserInfo();
    };
    window.addEventListener('storage', handleStorage);
    
    // 额外监听：定时刷新（兜底方案）
    const timer = setInterval(() => {
      loadUserInfo();
    }, 1000);

    // 组件卸载清理
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(timer);
    };
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const pageNum = Number.isNaN(Number(current)) ? 1 : Number(current);
      const sizeNum = Number.isNaN(Number(pageSize)) ? 10 : Number(pageSize);
      const skip = Math.max((pageNum - 1) * sizeNum, 0);
      const limit = Math.max(sizeNum, 1);

      const response = await api.announcementApi.getList({
        skip: skip,
        limit: limit
      });

      if (response?.data?.success && response?.data?.data) {
        setAnnouncements(response.data.data.items || []);
        setTotal(response.data.data.total || 0);
      } else {
        setAnnouncements([]);
        setTotal(0);
      }
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.detail || '获取公告列表失败');
      setAnnouncements([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [current, pageSize]);

  const handlePageChange = (newPage, newSize) => {
    setCurrent(Number.isNaN(Number(newPage)) ? 1 : Number(newPage));
    setPageSize(Number.isNaN(Number(newSize)) ? 10 : Number(newSize));
  };

  const handleSizeChange = (_, newSize) => {
    setCurrent(1);
    setPageSize(Number.isNaN(Number(newSize)) ? 10 : Number(newSize));
  };

  const handleViewDetail = async (id) => {
    try {
      const response = await api.announcementApi.getDetail(id);
      if (response.data.success) {
        navigate(`/announcements/detail/${id}`, { state: { data: response.data.data } });
      } else {
        message.error('获取公告详情失败');
      }
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.detail || '获取公告详情失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await api.announcementApi.delete(id);
      
      if (response.data.success) {
        message.success('公告删除成功！');
        fetchAnnouncements();
      } else {
        message.error('公告删除失败');
      }
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.detail || '公告删除失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnnouncement = () => {
    navigate('/admin/announcement-publish');
  };

  const handleRefresh = () => {
    loadUserInfo();
    fetchAnnouncements();
  };

  // 实时计算管理员状态
  const isAdmin = currentUser.role === 'admin';

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Navbar />
      <Content style={{ padding: 24 }}>
        <Card style={{ background: '#fff', borderRadius: 8, marginBottom: 24 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} style={{ margin: 0 }}>公告管理</Title>
            </Col>
            <Col>
              <Space>
                <Button 
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                >
                  刷新
                </Button>
                {isAdmin && (
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={handleAddAnnouncement}
                  >
                    发布新公告
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        </Card>

        <Spin spinning={loading} tip="加载中...">
          <List
            itemLayout="vertical"
            size="large"
            dataSource={announcements}
            pagination={{
              current: current,
              pageSize: pageSize,
              total: total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
              onChange: handlePageChange,
              onShowSizeChange: handleSizeChange,
              pageSizeOptions: ['10', '20', '50']
            }}
            renderItem={item => {
              const actions = [];
              
              // 查看详情按钮（所有人可见）
              actions.push(
                <Button 
                  type="text" 
                  icon={<EyeOutlined />}
                  onClick={() => handleViewDetail(item.id)}
                  key={`view-${item.id}`}
                >
                  查看详情
                </Button>
              );

              // 删除按钮（仅管理员可见）
              if (isAdmin) {
                actions.push(
                  <Popconfirm
                    title="确定删除该公告吗？"
                    onConfirm={() => handleDelete(item.id)}
                    okText="确定"
                    cancelText="取消"
                    disabled={loading}
                    key={`delete-${item.id}`}
                  >
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />}
                    >
                      删除
                    </Button>
                  </Popconfirm>
                );
              }

              return (
                <List.Item
                  key={item.id}
                  actions={actions}
                  extra={
                    <Tag color={item.status === 'published' ? 'green' : 'orange'}>
                      {item.status === 'published' ? '已发布' : '草稿'}
                    </Tag>
                  }
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong style={{ fontSize: 18 }}>{item.title}</Text>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={8}>
                        <Text type="secondary">发布时间：{item.created_at}</Text>
                        <Text type="secondary">发布人ID：{item.creator_id}</Text>
                      </Space>
                    }
                  />
                  <Paragraph 
                    ellipsis={{ rows: 2, expandable: false, symbol: '...' }}
                    style={{ margin: '16px 0 0 0' }}
                  >
                    {item.content}
                  </Paragraph>
                  {item.attachments && item.attachments.length > 0 && (
                    <Space style={{ marginTop: 8 }}>
                      <Text type="secondary">附件：</Text>
                      {item.attachments.map((file, index) => (
                        <Tag key={`file-${item.id}-${index}`}>{file.name}</Tag>
                      ))}
                    </Space>
                  )}
                </List.Item>
              );
            }}
            bordered
            style={{ 
              background: '#fff', 
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}
            locale={{ emptyText: <Empty description="暂无公告数据" /> }}
          />
        </Spin>
      </Content>
    </Layout>
  );
};

export default AnnouncementList;