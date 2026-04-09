import React, { useState, useEffect } from 'react';
import { Layout, Table, Card, Button, Space, Tag, Modal, Descriptions, Image, Popconfirm, message, Typography } from 'antd';
import { HomeOutlined, EyeOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../public/Nav/nav';
import api from '../../service/api';

const { Content } = Layout;
const { Title } = Typography;

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
      const list = res.data || [];
      list.sort((a, b) => new Date(b.create_time) - new Date(a.create_time));
      setCheckinList(list);
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
        try {
          await api.projectApi.adminBatchCheckinAudit({
            ids: selectedRowKeys,
            status: 'approved'
          });
          message.success('批量通过成功');
          setSelectedRowKeys([]);
          fetchList();
        } catch (e) {
          message.error('操作失败');
        }
      }
    });
  };

  const handleBatchReject = () => {
    if (selectedRowKeys.length === 0) return message.warning('请选择数据');
    Modal.confirm({
      title: '批量驳回',
      onOk: async () => {
        try {
          await api.projectApi.adminBatchCheckinAudit({
            ids: selectedRowKeys,
            status: 'rejected'
          });
          message.success('批量驳回成功');
          setSelectedRowKeys([]);
          fetchList();
        } catch (e) {
          message.error('操作失败');
        }
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
      width: 100,
      render: (img) => (
        <Image
          width={50}
          height={50}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          src={fixUrl(img)}
          fallback="https://via.placeholder.com/50"
        />
      ),
    },
    {
      title: '用户',
      dataIndex: 'username',
      width: 120,
      render: (text) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-all' }}>{text}</div>
    },
    {
      title: '标题',
      dataIndex: 'title',
      width: 180,
      render: (text) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-all' }}>{text}</div>
    },
    {
      title: '内容',
      dataIndex: 'content',
      width: 280,
      render: (text) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-all' }}>{text}</div>
    },
    { title: '状态', dataIndex: 'status', width: 100, render: renderStatus },
    { title: '时间', dataIndex: 'create_time', width: 180 },
    {
      title: '操作',
      width: 300,
      render: (_, r) => (
        <Space size="small">
          <Button type="text" icon={<EyeOutlined />} onClick={() => fetchDetail(r.id)}>查看</Button>
          {r.status === 'pending' && <Button type="text" style={{ color: '#52c41a' }} icon={<CheckOutlined />} onClick={() => handleAudit(r.id, 'approved')}>通过</Button>}
          {r.status === 'pending' && <Button type="text" danger icon={<CloseOutlined />} onClick={() => handleAudit(r.id, 'rejected')}>驳回</Button>}
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(r.id)}>
            <Button type="text" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f9f5f1' }}>
      <Navbar />
      <Content style={{ padding: '30px 24px' }}>
        <div style={{ maxWidth: 1600, margin: '0 auto' }}>
          <Card
            style={{ borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            title={<Title level={4} style={{ margin: 0, color: '#9C706A' }}>打卡审核管理</Title>}
            extra={
              <Space>
                <Button type="primary" onClick={handleBatchPass} style={{ backgroundColor: '#9C706A', borderColor: '#9C706A' }}>批量通过</Button>
                <Button danger onClick={handleBatchReject}>批量驳回</Button>
              </Space>
            }
          >
            <Table
              rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
              loading={loading}
              rowKey="id"
              columns={columns}
              dataSource={checkinList}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 'auto' }}
            />
          </Card>
        </div>
      </Content>

      <Modal title="打卡详情" open={detailVisible} onCancel={() => setDetailVisible(false)} footer={null} width={700}>
        {currentDetail && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <Image width={250} style={{ borderRadius: 8 }} src={fixUrl(currentDetail.image)} fallback="https://via.placeholder.com/250" />
            </div>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="标题">{currentDetail.title}</Descriptions.Item>
              <Descriptions.Item label="内容">{currentDetail.content}</Descriptions.Item>
              <Descriptions.Item label="标签">{currentDetail.tags || '-'}</Descriptions.Item>
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