import React, { useState, useEffect } from 'react';
import { Layout, Table, Card, Button, Space, Tag, Breadcrumb, Modal, Descriptions, Image, Popconfirm, message } from 'antd';
import { HomeOutlined, EyeOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../public/Nav/nav';
import api from '../../service/api';

const { Content } = Layout;

const AdminCheckinManage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkinList, setCheckinList] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentDetail, setCurrentDetail] = useState(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await api.projectApi.adminGetAllCheckins();
      setCheckinList(res.data || []);
    } catch (err) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (id) => {
    try {
      const res = await api.projectApi.getCheckinDetail(id);
      setCurrentDetail(res.data);
      setDetailVisible(true);
    } catch (err) {
      message.error('加载详情失败');
    }
  };

  const handleAudit = async (id, status) => {
    try {
      await api.projectApi.adminUpdateCheckinStatus(id, status);
      message.success('操作成功');
      fetchList();
    } catch (err) {
      message.error('操作失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.projectApi.deleteCheckin(id);
      message.success('删除成功');
      fetchList();
    } catch (err) {
      message.error('删除失败');
    }
  };

  const handleBatchPass = () => {
    if (selectedRowKeys.length === 0) return message.warning('请选择数据');
    Modal.confirm({
      title: '批量通过',
      onOk: async () => {
        for (let id of selectedRowKeys) {
          await api.projectApi.adminUpdateCheckinStatus(id, 'approved');
        }
        message.success('批量通过成功');
        setSelectedRowKeys([]);
        fetchList();
      }
    });
  };

  const handleBatchReject = () => {
    if (selectedRowKeys.length === 0) return message.warning('请选择数据');
    Modal.confirm({
      title: '批量驳回',
      onOk: async () => {
        for (let id of selectedRowKeys) {
          await api.projectApi.adminUpdateCheckinStatus(id, 'rejected');
        }
        message.success('批量驳回成功');
        setSelectedRowKeys([]);
        fetchList();
      }
    });
  };

  useEffect(() => {
    fetchList();
  }, []);

  const fixUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://127.0.0.1:8090${url}`;
  };

  const renderStatus = (status) => {
    const map = {
      pending: { color: 'gold', text: '待审核' },
      approved: { color: 'green', text: '已通过' },
      rejected: { color: 'red', text: '已驳回' },
    };
    const item = map[status] || { color: 'default', text: '未知' };
    return <Tag color={item.color}>{item.text}</Tag>;
  };

  const columns = [
    {
      title: '打卡照片',
      dataIndex: 'image',
      render: (img) => (
        <Image
          width={50}
          height={50}
          style={{ objectFit: 'cover' }}
          src={fixUrl(img)}
          fallback="https://via.placeholder.com/50"
        />
      ),
    },
    { title: '用户', dataIndex: 'username' },
    { title: '标题', dataIndex: 'title' },
    { title: '内容', dataIndex: 'content' },
    { title: '状态', dataIndex: 'status', render: renderStatus },
    { title: '时间', dataIndex: 'create_time' },
    {
      title: '操作',
      render: (_, r) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} onClick={() => fetchDetail(r.id)}>查看</Button>
          {r.status === 'pending' && <Button type="text" icon={<CheckOutlined />} onClick={() => handleAudit(r.id, 'approved')}>通过</Button>}
          {r.status === 'pending' && <Button type="text" danger icon={<CloseOutlined />} onClick={() => handleAudit(r.id, 'rejected')}>驳回</Button>}
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(r.id)}>
            <Button type="text" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Navbar />
      <Content style={{ padding: 24 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <Breadcrumb>
            <Breadcrumb.Item onClick={() => navigate('/home')}><HomeOutlined />首页</Breadcrumb.Item>
            <Breadcrumb.Item>管理员中心</Breadcrumb.Item>
            <Breadcrumb.Item>打卡墙管理</Breadcrumb.Item>
          </Breadcrumb>

          <Card>
            <div style={{ marginBottom: 16, textAlign: 'right' }}>
              <Space>
                <Button onClick={handleBatchPass}>批量通过</Button>
                <Button danger onClick={handleBatchReject}>批量驳回</Button>
              </Space>
            </div>

            <Table
              rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
              loading={loading}
              rowKey="id"
              columns={columns}
              dataSource={checkinList}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </div>
      </Content>

      <Modal title="打卡详情" open={detailVisible} onCancel={() => setDetailVisible(false)} footer={null} width={700}>
        {currentDetail && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <Image width={250} src={fixUrl(currentDetail.image)} fallback="https://via.placeholder.com/250" />
            </div>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="标题">{currentDetail.title}</Descriptions.Item>
              <Descriptions.Item label="内容">{currentDetail.content}</Descriptions.Item>
              <Descriptions.Item label="标签">{currentDetail.tags}</Descriptions.Item>
              <Descriptions.Item label="状态">{renderStatus(currentDetail.status)}</Descriptions.Item>
              <Descriptions.Item label="时间">{currentDetail.create_time}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default AdminCheckinManage;