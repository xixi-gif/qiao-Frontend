import React, { useState, useEffect } from 'react';
import { 
  Layout, Card, Typography, Space, Tag, 
  Button, Spin, Empty, Row, Col, Divider,
  message, Descriptions, Modal
} from 'antd';
import { 
  ArrowLeftOutlined, DeleteOutlined, DownloadOutlined
} from '@ant-design/icons';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../../service/api';
import Navbar from '../../../public/Nav/nav';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

const AnnouncementDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const formatTime = (timeStr) => {
    if (!timeStr) return '暂无';
    const date = new Date(timeStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleDownloadAttachment = (fileUrl, fileName) => {
    if (!fileUrl) {
      message.error('附件链接无效');
      return;
    }
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName || '未命名文件';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success(`开始下载：${fileName || '未命名文件'}`);
  };

  const fetchAnnouncementDetail = async () => {
    try {
      setLoading(true);
      let data = null;
      if (location.state?.data) {
        data = location.state.data;
      } else {
        const res = await api.announcementApi.getDetail(id);
        data = res.data?.data || res.data;
      }
      setAnnouncement(data);
    } catch (error) {
      console.error(error);
      message.error('获取公告失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await api.announcementApi.delete(id);
      message.success('删除成功');
      navigate('/announcements');
    } catch (error) {
      console.error(error);
      message.error('删除失败');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = () => {
    Modal.confirm({
      title: '确认删除',
      content: '确定删除该公告？',
      onOk: handleDelete
    });
  };

  useEffect(() => {
    fetchAnnouncementDetail();
  }, [id]);

  const handleBack = () => {
    navigate('/announcements');
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
              <Title level={2} style={{ margin: 0 }}>公告详情</Title>
            </Col>
            <Col>
              <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
                返回列表
              </Button>
            </Col>
          </Row>
        </Card>

        <Spin spinning={loading} tip="加载中...">
          {announcement ? (
            <Card style={{ background: '#fff', borderRadius: 8 }}>
              <div style={{ marginBottom: 20 }}>
                <Space align="baseline">
                  <Title level={3} style={{ margin: 0 }}>{announcement.title}</Title>
                  <Tag color="green">已发布</Tag>
                </Space>
              </div>

              <Descriptions column={2} bordered size="middle" style={{ marginBottom: 20 }}>
                <Descriptions.Item label="发布时间">{formatTime(announcement.created_at)}</Descriptions.Item>
                <Descriptions.Item label="发布人ID">{announcement.creator_id}</Descriptions.Item>
                <Descriptions.Item label="公告ID">{announcement.id}</Descriptions.Item>
              </Descriptions>

              <Divider orientation="left">公告内容</Divider>
              <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
                {announcement.content}
              </Paragraph>

              {announcement.attachments?.length > 0 && (
                <>
                  <Divider orientation="left">附件</Divider>
                  <Space direction="vertical" style={{ width: '100%', marginBottom: 20 }}>
                    {announcement.attachments.map((file, index) => (
                      <div key={`file-${announcement.id}-${index}`} style={{ display: 'flex', alignItems: 'center', padding: 10, border: '1px solid #e8e8e8', borderRadius: 4 }}>
                        <Text ellipsis style={{ flex: 1 }}>{file.name}</Text>
                        <Button icon={<DownloadOutlined />} size="small" onClick={() => handleDownloadAttachment(file.url, file.name)}>下载</Button>
                      </div>
                    ))}
                  </Space>
                </>
              )}

              <div style={{ marginTop: 30, textAlign: 'right' }}>
                {isAdmin && (
                  <Button danger icon={<DeleteOutlined />} onClick={confirmDelete} disabled={loading}>删除公告</Button>
                )}
              </div>
            </Card>
          ) : (
            <Empty description="暂无数据" />
          )}
        </Spin>
      </Content>
    </Layout>
  );
};

export default AnnouncementDetail;