import React, { useState, useEffect } from 'react';
import { Layout, Card, Typography, Space, Tag, Button, Spin, Empty, Divider, message, Modal } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
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

  const loadUserInfo = () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : { role: 'user' };
      setCurrentUser(user);
    } catch (e) {
      setCurrentUser({ role: 'user' });
    }
  };

  useEffect(() => {
    loadUserInfo();
    const handleStorage = () => { loadUserInfo(); };
    window.addEventListener('storage', handleStorage);
    const timer = setInterval(() => { loadUserInfo(); }, 1000);
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

  const isAdmin = currentUser.role === 'admin';

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f9f5f1' }}>
      <Navbar />
      <Content style={{ padding: '40px 24px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <Card style={{ borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ textAlign: 'right', marginBottom: 16 }}>
              <Button icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ color: '#9C706A' }}>
                返回列表
              </Button>
            </div>

            <Spin spinning={loading} tip="加载中...">
              {announcement ? (
                <div style={{ padding: '20px 40px', fontSize: 16, lineHeight: 1.8 }}>
                  <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Title level={2} style={{ margin: 0, color: '#000', fontWeight: 700, letterSpacing: 2 }}>
                      {announcement.title}
                    </Title>
                  </div>

                  <div style={{ textAlign: 'right', marginBottom: 24, color: '#666' }}>
                    {formatTime(announcement.created_at)}
                  </div>

                  <Paragraph style={{ fontSize: 16, lineHeight: 2, textIndent: '2em', color: '#333' }}>
                    {announcement.content}
                  </Paragraph>

                  {announcement.attachments?.length > 0 && (
                    <>
                      <Divider style={{ margin: '32px 0' }} />
                      <div style={{ marginBottom: 16, fontWeight: 600 }}>附件：</div>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        {announcement.attachments.map((file, index) => (
                          <div key={index} style={{ display: 'flex', alignItems: 'center', padding: 10, border: '1px solid #e8e8e8', borderRadius: 4 }}>
                            <Text style={{ flex: 1 }}>{file.name}</Text>
                            <Button icon={<DownloadOutlined />} size="small" onClick={() => handleDownloadAttachment(file.url, file.name)}>下载</Button>
                          </div>
                        ))}
                      </Space>
                    </>
                  )}

                  <div style={{ marginTop: 40, textAlign: 'right' }}>
                    {isAdmin && (
                      <Button danger icon={<DeleteOutlined />} onClick={confirmDelete} disabled={loading}>
                        删除公告
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <Empty description="暂无数据" />
              )}
            </Spin>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default AnnouncementDetail;