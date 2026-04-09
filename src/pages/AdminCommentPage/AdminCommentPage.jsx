import React, { useState, useEffect } from 'react';
import { Layout, Table, Tag, Space, Button, Typography, message, Popconfirm, Card } from 'antd';
import { CheckOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../service/api';
import Navbar from '../../../public/Nav/nav';

const { Content } = Layout;
const { Title } = Typography;

const AdminCommentPage = () => {
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await api.interactionApi.getAllComments();
      setData(res.data);
    } catch (err) {
      message.error('获取评论失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAudit = async (id, status) => {
    try {
      await api.interactionApi.auditComment(id, status);
      message.success('操作成功');
      fetchComments();
    } catch (err) {
      message.error('操作失败');
    }
  };

  const handleAdminDelete = async (id) => {
    try {
      await api.interactionApi.adminDeleteComment(id);
      message.success('删除成功');
      fetchComments();
    } catch (err) {
      message.error('删除失败');
    }
  };

  const formatTime = (timeStr) => {
    return new Date(timeStr).toLocaleString('zh-CN');
  };

  const getStatusTag = (status) => {
    if (status === 'pending') return <Tag color="processing">待审核</Tag>;
    if (status === 'approved') return <Tag color="success">已通过</Tag>;
    if (status === 'rejected') return <Tag color="error">已驳回</Tag>;
    return <Tag>{status}</Tag>;
  };

  const handleBatchPass = () => {
    selectedRowKeys.forEach(id => handleAudit(id, 'approved'));
  };

  const handleBatchReject = () => {
    selectedRowKeys.forEach(id => handleAudit(id, 'rejected'));
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys
  };

  const columns = [
    {
      title: '用户',
      dataIndex: 'username',
      key: 'username',
      width: 100
    },
    {
      title: '项目',
      dataIndex: 'project_title',
      key: 'project_title',
      width: 180
    },
    {
      title: '评论内容',
      key: 'content',
      render: (_, record) => {
        if(record.is_delete){
          return <span style={{color:'#999'}}>【用户已删除】</span>;
        }
        return record.content;
      },
      ellipsis: true,
      width: 320
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => formatTime(text),
      width: 160
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status)
    },
    {
      title: '操作',
      key: 'action',
      width: 260,
      render: (_, record) => (
        <Space size="small">
          {!record.is_delete && (
            <>
              {record.status === 'pending' && (
                <>
                  <Button type="text" icon={<CheckOutlined />} style={{ color: '#52c41a' }} onClick={() => handleAudit(record.id, 'approved')}>通过</Button>
                  <Button type="text" icon={<CloseOutlined />} style={{ color: '#ff4d4f' }} onClick={() => handleAudit(record.id, 'rejected')}>驳回</Button>
                </>
              )}
              {record.status === 'approved' && (
                <Button type="text" icon={<CloseOutlined />} style={{ color: '#ff4d4f' }} onClick={() => handleAudit(record.id, 'rejected')}>驳回</Button>
              )}
              {record.status === 'rejected' && (
                <Button type="text" icon={<CheckOutlined />} style={{ color: '#52c41a' }} onClick={() => handleAudit(record.id, 'approved')}>通过</Button>
              )}
            </>
          )}
          <Popconfirm title="确定删除该评论？" onConfirm={() => handleAdminDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f9f5f1' }}>
      <Navbar />
      <Content style={{ padding: '30px 24px' }}>
        <div style={{ maxWidth: 1600, margin: '0 auto' }}>
          <Card 
            style={{ borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            title={<Title level={4} style={{ margin: 0, color: '#9C706A' }}>评论管理</Title>}
            extra={
              <Space>
                <Button type="primary" disabled={selectedRowKeys.length === 0} onClick={handleBatchPass} style={{ backgroundColor: '#9C706A', borderColor: '#9C706A' }}>批量通过</Button>
                <Button danger disabled={selectedRowKeys.length === 0} onClick={handleBatchReject}>批量驳回</Button>
              </Space>
            }
          >
            <Table 
              rowSelection={rowSelection} 
              loading={loading} 
              columns={columns} 
              dataSource={data} 
              rowKey="id" 
              pagination={{ pageSize: 10 }} 
              scroll={{ x: 'auto' }}
            />
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default AdminCommentPage;