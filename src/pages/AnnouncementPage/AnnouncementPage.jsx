import React, { useState, useEffect } from 'react';
import { Layout, Table, Button, Space, Typography, Tag, Popconfirm, message, Card } from 'antd';
import { DeleteOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../service/api';
import Navbar from '../../../public/Nav/nav';

const { Title } = Typography;
const { Content } = Layout;

const AnnouncementList = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchUserRole = async () => {
    try {
      const res = await api.authApi.getProfile();
      setIsAdmin(res.data?.role === 'admin');
    } catch {
      setIsAdmin(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.announcementApi.getList({ skip: 0, limit: 100 });
      if (res?.data?.success && res?.data?.data) {
        setAnnouncements(res.data.data.items || []);
      } else {
        setAnnouncements([]);
      }
    } catch {
      message.error('获取公告失败');
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRole();
    fetchAnnouncements();
  }, []);

  const handleViewDetail = (id) => {
    navigate(`/announcements/detail/${id}`);
  };

  const handleDelete = async (id) => {
    try {
      await api.announcementApi.delete(id);
      message.success('删除成功');
      fetchAnnouncements();
    } catch {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '公告标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '发布时间',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s) => (
        <Tag color={s === 'published' ? 'green' : 'orange'}>
          {s === 'published' ? '已发布' : '草稿'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewDetail(record.id)}>
            查看
          </Button>
          {isAdmin && (
            <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
              <Button type="text" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f9f5f1' }}>
      <Navbar />
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', width: '90%' }}>
          <Card
            title={<Title level={2} style={{ margin: 0, textAlign: 'center', color: '#9C706A' }}>公告资讯中心</Title>}
            extra={
              isAdmin ? (
                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/announcement-publish')} style={{ backgroundColor: '#9C706A', borderColor: '#9C706A' }}>
                  发布公告
                </Button>
              ) : null
            }
          >
            <Table
              rowKey="id"
              loading={loading}
              columns={columns}
              dataSource={announcements}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default AnnouncementList;